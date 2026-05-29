//! Encryption at Rest Service
//!
//! Provides encryption capabilities for message data and sensitive configuration.

use aes_gcm::{
    aead::{AeadInPlace, KeyInit, Nonce, Tag},
    Aes128Gcm, Aes256Gcm,
};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// GCM standard nonce length in bytes (96-bit).
const GCM_NONCE_LEN: usize = 12;
/// GCM authentication tag length in bytes (128-bit).
const GCM_TAG_LEN: usize = 16;

/// Encryption service for data at rest
pub struct EncryptionService {
    config: EncryptionConfig,
    key_store: Arc<RwLock<KeyStore>>,
    active_key_id: Arc<RwLock<Option<String>>>,
}

impl EncryptionService {
    pub fn new(config: EncryptionConfig) -> Self {
        Self {
            config,
            key_store: Arc::new(RwLock::new(KeyStore::new())),
            active_key_id: Arc::new(RwLock::new(None)),
        }
    }

    pub async fn initialize(&self) -> Result<(), super::EnterpriseError> {
        if !self.config.enabled {
            return Ok(());
        }

        // Initialize key store based on provider
        match &self.config.key_provider {
            KeyProvider::Local => {
                // Generate a default key for local development
                let key = self.generate_key(KeyAlgorithm::Aes256Gcm).await?;
                self.set_active_key(&key.id).await?;
            }
            KeyProvider::Vault { .. } => {
                // Connect to HashiCorp Vault
                self.connect_vault().await?;
            }
            KeyProvider::Aws { .. } => {
                // Connect to AWS KMS
                self.connect_aws_kms().await?;
            }
            KeyProvider::Azure { .. } => {
                // Connect to Azure Key Vault
                self.connect_azure_keyvault().await?;
            }
            KeyProvider::Gcp { .. } => {
                // Connect to GCP KMS
                self.connect_gcp_kms().await?;
            }
        }

        Ok(())
    }

    /// Generate a new encryption key
    pub async fn generate_key(
        &self,
        algorithm: KeyAlgorithm,
    ) -> Result<EncryptionKey, super::EnterpriseError> {
        let key_id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now();

        // In a real implementation, this would generate actual cryptographic keys
        let key_material = self.generate_key_material(&algorithm)?;

        let key = EncryptionKey {
            id: key_id.clone(),
            algorithm,
            status: KeyStatus::Active,
            created_at: now,
            expires_at: now + chrono::Duration::days(self.config.key_rotation_days as i64),
            version: 1,
            metadata: HashMap::new(),
        };

        let mut store = self.key_store.write().await;
        store.keys.insert(key_id, (key.clone(), key_material));

        Ok(key)
    }

    /// Set the active encryption key
    pub async fn set_active_key(&self, key_id: &str) -> Result<(), super::EnterpriseError> {
        let store = self.key_store.read().await;
        if !store.keys.contains_key(key_id) {
            return Err(super::EnterpriseError::Encryption(
                "Key not found".to_string(),
            ));
        }
        drop(store);

        let mut active = self.active_key_id.write().await;
        *active = Some(key_id.to_string());

        Ok(())
    }

    /// Get the active key ID
    pub async fn get_active_key_id(&self) -> Option<String> {
        let active = self.active_key_id.read().await;
        active.clone()
    }

    /// Encrypt data
    pub async fn encrypt(&self, data: &[u8]) -> Result<EncryptedData, super::EnterpriseError> {
        if !self.config.enabled {
            // Return data as-is if encryption is disabled
            return Ok(EncryptedData {
                ciphertext: data.to_vec(),
                key_id: "none".to_string(),
                algorithm: KeyAlgorithm::None,
                iv: Vec::new(),
                auth_tag: None,
            });
        }

        let key_id = self
            .active_key_id
            .read()
            .await
            .clone()
            .ok_or_else(|| super::EnterpriseError::Encryption("No active key".to_string()))?;

        let store = self.key_store.read().await;
        let (key, key_material) = store
            .keys
            .get(&key_id)
            .ok_or_else(|| super::EnterpriseError::Encryption("Key not found".to_string()))?;

        // In a real implementation, this would perform actual encryption
        let (ciphertext, iv, auth_tag) = self.do_encrypt(data, key_material, &key.algorithm)?;

        Ok(EncryptedData {
            ciphertext,
            key_id,
            algorithm: key.algorithm.clone(),
            iv,
            auth_tag,
        })
    }

    /// Decrypt data
    pub async fn decrypt(
        &self,
        encrypted: &EncryptedData,
    ) -> Result<Vec<u8>, super::EnterpriseError> {
        if encrypted.algorithm == KeyAlgorithm::None {
            return Ok(encrypted.ciphertext.clone());
        }

        let store = self.key_store.read().await;
        let (_, key_material) = store
            .keys
            .get(&encrypted.key_id)
            .ok_or_else(|| super::EnterpriseError::Encryption("Key not found".to_string()))?;

        // In a real implementation, this would perform actual decryption
        let plaintext = self.do_decrypt(
            &encrypted.ciphertext,
            key_material,
            &encrypted.algorithm,
            &encrypted.iv,
            &encrypted.auth_tag,
        )?;

        Ok(plaintext)
    }

    /// Rotate encryption keys
    pub async fn rotate_keys(&self) -> Result<EncryptionKey, super::EnterpriseError> {
        // Get current active key's algorithm
        let algorithm = {
            let active_id = self.active_key_id.read().await;
            if let Some(id) = active_id.as_ref() {
                let store = self.key_store.read().await;
                store
                    .keys
                    .get(id)
                    .map(|(k, _)| k.algorithm.clone())
                    .unwrap_or(KeyAlgorithm::Aes256Gcm)
            } else {
                KeyAlgorithm::Aes256Gcm
            }
        };

        // Mark old key as pending rotation
        if let Some(old_id) = self.active_key_id.read().await.clone() {
            let mut store = self.key_store.write().await;
            if let Some((key, _)) = store.keys.get_mut(&old_id) {
                key.status = KeyStatus::PendingRotation;
            }
        }

        // Generate new key
        let new_key = self.generate_key(algorithm).await?;
        self.set_active_key(&new_key.id).await?;

        Ok(new_key)
    }

    /// List all keys
    pub async fn list_keys(&self) -> Vec<EncryptionKey> {
        let store = self.key_store.read().await;
        store.keys.values().map(|(k, _)| k.clone()).collect()
    }

    /// Re-encrypt data with the current active key
    pub async fn re_encrypt(
        &self,
        encrypted: &EncryptedData,
    ) -> Result<EncryptedData, super::EnterpriseError> {
        let plaintext = self.decrypt(encrypted).await?;
        self.encrypt(&plaintext).await
    }

    // Private helper methods

    fn generate_key_material(
        &self,
        algorithm: &KeyAlgorithm,
    ) -> Result<Vec<u8>, super::EnterpriseError> {
        let key_size = match algorithm {
            KeyAlgorithm::Aes128Gcm => 16,
            KeyAlgorithm::Aes256Gcm => 32,
            KeyAlgorithm::ChaCha20Poly1305 => 32,
            KeyAlgorithm::None => 0,
        };

        // Generate key bytes from a cryptographically secure RNG (OS entropy).
        let mut key = vec![0u8; key_size];
        if key_size > 0 {
            rand::rngs::OsRng.fill_bytes(&mut key);
        }

        Ok(key)
    }

    /// Encrypt `data` with authenticated encryption (AES-GCM). Returns
    /// `(ciphertext, nonce, auth_tag)`. A fresh random 96-bit nonce is
    /// generated per call; the detached 128-bit GCM tag is returned separately.
    fn do_encrypt(
        &self,
        data: &[u8],
        key: &[u8],
        algorithm: &KeyAlgorithm,
    ) -> Result<(Vec<u8>, Vec<u8>, Option<Vec<u8>>), super::EnterpriseError> {
        match algorithm {
            KeyAlgorithm::Aes256Gcm => {
                let cipher = Aes256Gcm::new_from_slice(key)
                    .map_err(|e| super::EnterpriseError::Encryption(e.to_string()))?;
                Self::gcm_encrypt(&cipher, data)
            }
            KeyAlgorithm::Aes128Gcm => {
                let cipher = Aes128Gcm::new_from_slice(key)
                    .map_err(|e| super::EnterpriseError::Encryption(e.to_string()))?;
                Self::gcm_encrypt(&cipher, data)
            }
            KeyAlgorithm::ChaCha20Poly1305 => Err(super::EnterpriseError::Encryption(
                "ChaCha20-Poly1305 is not yet supported; configure an AES-GCM algorithm".into(),
            )),
            // Explicit opt-out of encryption. Never used implicitly as a
            // fallback for the AEAD algorithms above.
            KeyAlgorithm::None => Ok((data.to_vec(), Vec::new(), None)),
        }
    }

    fn do_decrypt(
        &self,
        ciphertext: &[u8],
        key: &[u8],
        algorithm: &KeyAlgorithm,
        iv: &[u8],
        auth_tag: &Option<Vec<u8>>,
    ) -> Result<Vec<u8>, super::EnterpriseError> {
        match algorithm {
            KeyAlgorithm::Aes256Gcm => {
                let cipher = Aes256Gcm::new_from_slice(key)
                    .map_err(|e| super::EnterpriseError::Encryption(e.to_string()))?;
                Self::gcm_decrypt(&cipher, ciphertext, iv, auth_tag)
            }
            KeyAlgorithm::Aes128Gcm => {
                let cipher = Aes128Gcm::new_from_slice(key)
                    .map_err(|e| super::EnterpriseError::Encryption(e.to_string()))?;
                Self::gcm_decrypt(&cipher, ciphertext, iv, auth_tag)
            }
            KeyAlgorithm::ChaCha20Poly1305 => Err(super::EnterpriseError::Encryption(
                "ChaCha20-Poly1305 is not yet supported; configure an AES-GCM algorithm".into(),
            )),
            KeyAlgorithm::None => Ok(ciphertext.to_vec()),
        }
    }

    /// Shared AES-GCM encryption over any concrete cipher implementing
    /// `AeadInPlace` (AES-128 or AES-256). A fresh random nonce of the cipher's
    /// required size is generated per call.
    fn gcm_encrypt<C: AeadInPlace>(
        cipher: &C,
        data: &[u8],
    ) -> Result<(Vec<u8>, Vec<u8>, Option<Vec<u8>>), super::EnterpriseError> {
        let mut nonce = Nonce::<C>::default();
        rand::rngs::OsRng.fill_bytes(nonce.as_mut_slice());

        let mut buffer = data.to_vec();
        let tag = cipher
            .encrypt_in_place_detached(&nonce, b"", &mut buffer)
            .map_err(|e| super::EnterpriseError::Encryption(e.to_string()))?;

        Ok((buffer, nonce.to_vec(), Some(tag.to_vec())))
    }

    /// Shared AES-GCM decryption. Fails closed if the nonce/tag are missing or
    /// malformed, or if authentication fails (tampered ciphertext).
    fn gcm_decrypt<C: AeadInPlace>(
        cipher: &C,
        ciphertext: &[u8],
        iv: &[u8],
        auth_tag: &Option<Vec<u8>>,
    ) -> Result<Vec<u8>, super::EnterpriseError> {
        if iv.len() != GCM_NONCE_LEN {
            return Err(super::EnterpriseError::Encryption(format!(
                "invalid nonce length: expected {GCM_NONCE_LEN}, got {}",
                iv.len()
            )));
        }
        let tag_bytes = auth_tag.as_ref().ok_or_else(|| {
            super::EnterpriseError::Encryption("missing authentication tag".into())
        })?;
        if tag_bytes.len() != GCM_TAG_LEN {
            return Err(super::EnterpriseError::Encryption(format!(
                "invalid auth tag length: expected {GCM_TAG_LEN}, got {}",
                tag_bytes.len()
            )));
        }

        let nonce = Nonce::<C>::from_slice(iv);
        let tag = Tag::<C>::from_slice(tag_bytes);
        let mut buffer = ciphertext.to_vec();
        cipher
            .decrypt_in_place_detached(nonce, b"", &mut buffer, tag)
            .map_err(|_| {
                super::EnterpriseError::Encryption(
                    "authentication failed (data tampered or wrong key)".into(),
                )
            })?;

        Ok(buffer)
    }

    async fn connect_vault(&self) -> Result<(), super::EnterpriseError> {
        // Connect to HashiCorp Vault
        tracing::info!("Connecting to HashiCorp Vault...");
        Ok(())
    }

    async fn connect_aws_kms(&self) -> Result<(), super::EnterpriseError> {
        // Connect to AWS KMS
        tracing::info!("Connecting to AWS KMS...");
        Ok(())
    }

    async fn connect_azure_keyvault(&self) -> Result<(), super::EnterpriseError> {
        // Connect to Azure Key Vault
        tracing::info!("Connecting to Azure Key Vault...");
        Ok(())
    }

    async fn connect_gcp_kms(&self) -> Result<(), super::EnterpriseError> {
        // Connect to GCP KMS
        tracing::info!("Connecting to GCP Cloud KMS...");
        Ok(())
    }
}

/// Key store for managing encryption keys
struct KeyStore {
    keys: HashMap<String, (EncryptionKey, Vec<u8>)>,
}

impl KeyStore {
    fn new() -> Self {
        Self {
            keys: HashMap::new(),
        }
    }
}

/// Encryption configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionConfig {
    pub enabled: bool,
    pub key_provider: KeyProvider,
    pub key_rotation_days: u32,
    pub encrypt_message_body: bool,
    pub encrypt_message_headers: bool,
    pub encrypt_metadata: bool,
}

impl Default for EncryptionConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            key_provider: KeyProvider::Local,
            key_rotation_days: 90,
            encrypt_message_body: true,
            encrypt_message_headers: false,
            encrypt_metadata: false,
        }
    }
}

/// Key provider options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KeyProvider {
    /// Local key storage (for development only)
    Local,
    /// HashiCorp Vault
    Vault {
        address: String,
        token: Option<String>,
        mount_path: String,
    },
    /// AWS KMS
    Aws { region: String, key_id: String },
    /// Azure Key Vault
    Azure { vault_url: String, key_name: String },
    /// Google Cloud KMS
    Gcp {
        project_id: String,
        location: String,
        key_ring: String,
        key_name: String,
    },
}

/// Encryption key metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionKey {
    pub id: String,
    pub algorithm: KeyAlgorithm,
    pub status: KeyStatus,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub expires_at: chrono::DateTime<chrono::Utc>,
    pub version: u32,
    pub metadata: HashMap<String, String>,
}

/// Supported encryption algorithms
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum KeyAlgorithm {
    None,
    Aes128Gcm,
    Aes256Gcm,
    ChaCha20Poly1305,
}

/// Key status
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum KeyStatus {
    Active,
    PendingRotation,
    Disabled,
    Destroyed,
}

/// Encrypted data container
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedData {
    pub ciphertext: Vec<u8>,
    pub key_id: String,
    pub algorithm: KeyAlgorithm,
    pub iv: Vec<u8>,
    pub auth_tag: Option<Vec<u8>>,
}

impl EncryptedData {
    /// Serialize to bytes for storage
    pub fn to_bytes(&self) -> Vec<u8> {
        serde_json::to_vec(self).unwrap_or_default()
    }

    /// Deserialize from bytes
    pub fn from_bytes(bytes: &[u8]) -> Result<Self, super::EnterpriseError> {
        serde_json::from_slice(bytes).map_err(|e| super::EnterpriseError::Encryption(e.to_string()))
    }
}

/// Field-level encryption helper
pub struct FieldEncryptor {
    service: Arc<EncryptionService>,
    fields_to_encrypt: Vec<String>,
}

impl FieldEncryptor {
    pub fn new(service: Arc<EncryptionService>, fields: Vec<String>) -> Self {
        Self {
            service,
            fields_to_encrypt: fields,
        }
    }

    /// Encrypt specified fields in a JSON object
    pub async fn encrypt_fields(
        &self,
        mut data: serde_json::Value,
    ) -> Result<serde_json::Value, super::EnterpriseError> {
        if let Some(obj) = data.as_object_mut() {
            for field in &self.fields_to_encrypt {
                if let Some(value) = obj.get(field) {
                    let bytes = serde_json::to_vec(value)
                        .map_err(|e| super::EnterpriseError::Encryption(e.to_string()))?;
                    let encrypted = self.service.encrypt(&bytes).await?;
                    let encoded = base64::Engine::encode(
                        &base64::engine::general_purpose::STANDARD,
                        encrypted.to_bytes(),
                    );
                    obj.insert(
                        format!("_{}_encrypted", field),
                        serde_json::Value::String(encoded),
                    );
                    obj.remove(field);
                }
            }
        }
        Ok(data)
    }

    /// Decrypt specified fields in a JSON object
    pub async fn decrypt_fields(
        &self,
        mut data: serde_json::Value,
    ) -> Result<serde_json::Value, super::EnterpriseError> {
        if let Some(obj) = data.as_object_mut() {
            let encrypted_fields: Vec<String> = obj
                .keys()
                .filter(|k| k.starts_with('_') && k.ends_with("_encrypted"))
                .cloned()
                .collect();

            for enc_field in encrypted_fields {
                if let Some(serde_json::Value::String(encoded)) = obj.get(&enc_field) {
                    let bytes =
                        base64::Engine::decode(&base64::engine::general_purpose::STANDARD, encoded)
                            .map_err(|e| super::EnterpriseError::Encryption(e.to_string()))?;
                    let encrypted = EncryptedData::from_bytes(&bytes)?;
                    let decrypted = self.service.decrypt(&encrypted).await?;
                    let value: serde_json::Value = serde_json::from_slice(&decrypted)
                        .map_err(|e| super::EnterpriseError::Encryption(e.to_string()))?;

                    let original_field = enc_field
                        .trim_start_matches('_')
                        .trim_end_matches("_encrypted");
                    obj.insert(original_field.to_string(), value);
                    obj.remove(&enc_field);
                }
            }
        }
        Ok(data)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn enabled_config() -> EncryptionConfig {
        EncryptionConfig {
            enabled: true,
            ..Default::default()
        }
    }

    #[tokio::test]
    async fn test_aes256_roundtrip_and_real_ciphertext() {
        let svc = EncryptionService::new(enabled_config());
        let key = svc.generate_key(KeyAlgorithm::Aes256Gcm).await.unwrap();
        svc.set_active_key(&key.id).await.unwrap();

        let plaintext = b"top secret message body";
        let enc = svc.encrypt(plaintext).await.unwrap();

        // Regression: ciphertext must NOT equal plaintext, and the nonce/tag
        // must be populated (the old stub stored plaintext with zero iv/tag).
        assert_ne!(enc.ciphertext.as_slice(), plaintext.as_slice());
        assert_eq!(enc.iv.len(), GCM_NONCE_LEN);
        assert_ne!(enc.iv, vec![0u8; GCM_NONCE_LEN]);
        assert_eq!(enc.auth_tag.as_ref().unwrap().len(), GCM_TAG_LEN);

        let dec = svc.decrypt(&enc).await.unwrap();
        assert_eq!(dec.as_slice(), plaintext.as_slice());
    }

    #[tokio::test]
    async fn test_nonce_is_unique_per_call() {
        let svc = EncryptionService::new(enabled_config());
        let key = svc.generate_key(KeyAlgorithm::Aes256Gcm).await.unwrap();
        svc.set_active_key(&key.id).await.unwrap();

        let a = svc.encrypt(b"same").await.unwrap();
        let b = svc.encrypt(b"same").await.unwrap();
        // Fresh random nonce each time => different nonce and ciphertext.
        assert_ne!(a.iv, b.iv);
        assert_ne!(a.ciphertext, b.ciphertext);
    }

    #[tokio::test]
    async fn test_tampered_ciphertext_fails_authentication() {
        let svc = EncryptionService::new(enabled_config());
        let key = svc.generate_key(KeyAlgorithm::Aes256Gcm).await.unwrap();
        svc.set_active_key(&key.id).await.unwrap();

        let mut enc = svc.encrypt(b"integrity protected").await.unwrap();
        enc.ciphertext[0] ^= 0xFF; // flip a bit
        assert!(svc.decrypt(&enc).await.is_err());
    }

    #[tokio::test]
    async fn test_generated_key_material_is_not_deterministic() {
        let svc = EncryptionService::new(enabled_config());
        let k1 = svc.generate_key_material(&KeyAlgorithm::Aes256Gcm).unwrap();
        let k2 = svc.generate_key_material(&KeyAlgorithm::Aes256Gcm).unwrap();
        assert_eq!(k1.len(), 32);
        // Old code produced the same deterministic bytes every time.
        assert_ne!(k1, k2);
    }
}
