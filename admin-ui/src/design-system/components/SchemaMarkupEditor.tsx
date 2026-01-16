/**
 * SchemaMarkupEditor Component (25)
 *
 * Structured data (JSON-LD) editor for rich snippets
 * Features: Schema types, visual editor, validation, preview
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export type SchemaType =
  | 'Article'
  | 'BlogPosting'
  | 'NewsArticle'
  | 'Product'
  | 'LocalBusiness'
  | 'Organization'
  | 'Person'
  | 'Event'
  | 'Recipe'
  | 'FAQPage'
  | 'HowTo'
  | 'BreadcrumbList'
  | 'WebPage'
  | 'WebSite';

export interface SchemaProperty {
  name: string;
  type: 'text' | 'url' | 'date' | 'number' | 'boolean' | 'object' | 'array';
  value: any;
  required: boolean;
  description: string;
}

export interface SchemaData {
  '@context': string;
  '@type': SchemaType;
  [key: string]: any;
}

export interface SchemaTemplate {
  type: SchemaType;
  label: string;
  icon: string;
  description: string;
  properties: SchemaProperty[];
}

export interface SchemaMarkupConfig {
  defaultType: SchemaType;
  enableValidation: boolean;
  showPreview: boolean;
}

interface SchemaMarkupContextType {
  schemaData: SchemaData;
  currentType: SchemaType;
  templates: SchemaTemplate[];
  validation: SchemaValidation;
  isEditing: boolean;
  setSchemaType: (type: SchemaType) => void;
  updateProperty: (name: string, value: any) => void;
  removeProperty: (name: string) => void;
  addNestedProperty: (parentName: string, property: { name: string; value: any }) => void;
  validateSchema: () => SchemaValidation;
  generateJSON: () => string;
  importJSON: (json: string) => boolean;
  resetToTemplate: () => void;
}

interface SchemaValidation {
  isValid: boolean;
  errors: { path: string; message: string }[];
  warnings: { path: string; message: string }[];
}

const SchemaMarkupContext = createContext<SchemaMarkupContextType | null>(null);

// Schema templates
const schemaTemplates: SchemaTemplate[] = [
  {
    type: 'Article',
    label: 'Article',
    icon: '📰',
    description: 'News, blog posts, and articles',
    properties: [
      { name: 'headline', type: 'text', value: '', required: true, description: 'Article title' },
      { name: 'description', type: 'text', value: '', required: true, description: 'Article summary' },
      { name: 'image', type: 'url', value: '', required: true, description: 'Featured image URL' },
      { name: 'datePublished', type: 'date', value: '', required: true, description: 'Publication date' },
      { name: 'dateModified', type: 'date', value: '', required: false, description: 'Last modified date' },
      { name: 'author', type: 'object', value: { '@type': 'Person', name: '' }, required: true, description: 'Article author' },
      { name: 'publisher', type: 'object', value: { '@type': 'Organization', name: '', logo: { '@type': 'ImageObject', url: '' } }, required: true, description: 'Publisher info' },
    ],
  },
  {
    type: 'Product',
    label: 'Product',
    icon: '🛍️',
    description: 'Products for e-commerce',
    properties: [
      { name: 'name', type: 'text', value: '', required: true, description: 'Product name' },
      { name: 'description', type: 'text', value: '', required: true, description: 'Product description' },
      { name: 'image', type: 'url', value: '', required: true, description: 'Product image' },
      { name: 'brand', type: 'object', value: { '@type': 'Brand', name: '' }, required: false, description: 'Brand info' },
      { name: 'offers', type: 'object', value: { '@type': 'Offer', price: '', priceCurrency: 'USD', availability: 'https://schema.org/InStock' }, required: true, description: 'Pricing info' },
      { name: 'aggregateRating', type: 'object', value: { '@type': 'AggregateRating', ratingValue: '', reviewCount: '' }, required: false, description: 'Ratings' },
    ],
  },
  {
    type: 'LocalBusiness',
    label: 'Local Business',
    icon: '🏪',
    description: 'Local businesses and stores',
    properties: [
      { name: 'name', type: 'text', value: '', required: true, description: 'Business name' },
      { name: 'description', type: 'text', value: '', required: false, description: 'Business description' },
      { name: 'image', type: 'url', value: '', required: false, description: 'Business image' },
      { name: 'telephone', type: 'text', value: '', required: false, description: 'Phone number' },
      { name: 'address', type: 'object', value: { '@type': 'PostalAddress', streetAddress: '', addressLocality: '', addressRegion: '', postalCode: '', addressCountry: '' }, required: true, description: 'Address' },
      { name: 'geo', type: 'object', value: { '@type': 'GeoCoordinates', latitude: '', longitude: '' }, required: false, description: 'Coordinates' },
      { name: 'openingHoursSpecification', type: 'array', value: [], required: false, description: 'Business hours' },
    ],
  },
  {
    type: 'FAQPage',
    label: 'FAQ Page',
    icon: '❓',
    description: 'Frequently asked questions',
    properties: [
      { name: 'mainEntity', type: 'array', value: [], required: true, description: 'FAQ items' },
    ],
  },
  {
    type: 'Event',
    label: 'Event',
    icon: '📅',
    description: 'Events and conferences',
    properties: [
      { name: 'name', type: 'text', value: '', required: true, description: 'Event name' },
      { name: 'description', type: 'text', value: '', required: false, description: 'Event description' },
      { name: 'startDate', type: 'date', value: '', required: true, description: 'Start date/time' },
      { name: 'endDate', type: 'date', value: '', required: false, description: 'End date/time' },
      { name: 'location', type: 'object', value: { '@type': 'Place', name: '', address: '' }, required: true, description: 'Event location' },
      { name: 'organizer', type: 'object', value: { '@type': 'Organization', name: '', url: '' }, required: false, description: 'Organizer' },
      { name: 'offers', type: 'object', value: { '@type': 'Offer', price: '', priceCurrency: 'USD', url: '' }, required: false, description: 'Ticket info' },
    ],
  },
  {
    type: 'Recipe',
    label: 'Recipe',
    icon: '🍳',
    description: 'Cooking recipes',
    properties: [
      { name: 'name', type: 'text', value: '', required: true, description: 'Recipe name' },
      { name: 'description', type: 'text', value: '', required: true, description: 'Recipe description' },
      { name: 'image', type: 'url', value: '', required: true, description: 'Recipe image' },
      { name: 'prepTime', type: 'text', value: '', required: false, description: 'Prep time (e.g., PT15M)' },
      { name: 'cookTime', type: 'text', value: '', required: false, description: 'Cook time (e.g., PT30M)' },
      { name: 'recipeYield', type: 'text', value: '', required: false, description: 'Servings' },
      { name: 'recipeIngredient', type: 'array', value: [], required: true, description: 'Ingredients list' },
      { name: 'recipeInstructions', type: 'array', value: [], required: true, description: 'Steps' },
    ],
  },
  {
    type: 'BreadcrumbList',
    label: 'Breadcrumbs',
    icon: '🔗',
    description: 'Navigation breadcrumbs',
    properties: [
      { name: 'itemListElement', type: 'array', value: [], required: true, description: 'Breadcrumb items' },
    ],
  },
];

// Provider
interface SchemaMarkupProviderProps {
  children: ReactNode;
  initialData?: Partial<SchemaData>;
  config?: Partial<SchemaMarkupConfig>;
  onDataChange?: (data: SchemaData) => void;
}

export const SchemaMarkupProvider: React.FC<SchemaMarkupProviderProps> = ({
  children,
  initialData,
  config,
  onDataChange,
}) => {
  const defaultType = config?.defaultType || 'Article';
  const template = schemaTemplates.find(t => t.type === defaultType) || schemaTemplates[0];

  const buildInitialData = (type: SchemaType): SchemaData => {
    const tmpl = schemaTemplates.find(t => t.type === type) || schemaTemplates[0];
    const data: SchemaData = {
      '@context': 'https://schema.org',
      '@type': type,
    };
    tmpl.properties.forEach(prop => {
      data[prop.name] = prop.value;
    });
    return data;
  };

  const [schemaData, setSchemaData] = useState<SchemaData>(
    initialData?.['@type']
      ? { '@context': 'https://schema.org', ...initialData } as SchemaData
      : buildInitialData(defaultType)
  );
  const [currentType, setCurrentType] = useState<SchemaType>(
    (initialData?.['@type'] as SchemaType) || defaultType
  );
  const [validation, setValidation] = useState<SchemaValidation>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [isEditing, setIsEditing] = useState(false);

  const setSchemaType = useCallback((type: SchemaType) => {
    setCurrentType(type);
    const newData = buildInitialData(type);
    setSchemaData(newData);
    onDataChange?.(newData);
  }, [onDataChange]);

  const updateProperty = useCallback((name: string, value: any) => {
    setSchemaData(prev => {
      const newData = { ...prev, [name]: value };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  const removeProperty = useCallback((name: string) => {
    setSchemaData(prev => {
      const { [name]: removed, ...rest } = prev;
      const newData = rest as SchemaData;
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  const addNestedProperty = useCallback((parentName: string, property: { name: string; value: any }) => {
    setSchemaData(prev => {
      const parent = prev[parentName];
      if (typeof parent === 'object' && !Array.isArray(parent)) {
        const newData = {
          ...prev,
          [parentName]: { ...parent, [property.name]: property.value },
        };
        onDataChange?.(newData);
        return newData;
      }
      return prev;
    });
  }, [onDataChange]);

  const validateSchema = useCallback((): SchemaValidation => {
    const errors: { path: string; message: string }[] = [];
    const warnings: { path: string; message: string }[] = [];

    const template = schemaTemplates.find(t => t.type === currentType);
    if (template) {
      template.properties.forEach(prop => {
        if (prop.required) {
          const value = schemaData[prop.name];
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push({ path: prop.name, message: `${prop.name} is required` });
          } else if (prop.type === 'object' && typeof value === 'object') {
            // Check nested required fields
            if (prop.name === 'author' && !value.name) {
              errors.push({ path: `${prop.name}.name`, message: 'Author name is required' });
            }
          }
        }
      });
    }

    // Additional validations
    if (schemaData.image && typeof schemaData.image === 'string' && !schemaData.image.startsWith('http')) {
      warnings.push({ path: 'image', message: 'Image should be an absolute URL' });
    }

    const result = { isValid: errors.length === 0, errors, warnings };
    setValidation(result);
    return result;
  }, [schemaData, currentType]);

  const generateJSON = useCallback((): string => {
    // Clean up empty values
    const cleanData = JSON.parse(JSON.stringify(schemaData));
    const cleanObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.filter(item => item !== '' && item !== null).map(cleanObject);
      }
      if (typeof obj === 'object' && obj !== null) {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== '' && value !== null && value !== undefined) {
            cleaned[key] = cleanObject(value);
          }
        }
        return cleaned;
      }
      return obj;
    };
    return JSON.stringify(cleanObject(cleanData), null, 2);
  }, [schemaData]);

  const importJSON = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed['@context'] && parsed['@type']) {
        setSchemaData(parsed);
        setCurrentType(parsed['@type'] as SchemaType);
        onDataChange?.(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [onDataChange]);

  const resetToTemplate = useCallback(() => {
    const newData = buildInitialData(currentType);
    setSchemaData(newData);
    onDataChange?.(newData);
  }, [currentType, onDataChange]);

  return (
    <SchemaMarkupContext.Provider value={{
      schemaData,
      currentType,
      templates: schemaTemplates,
      validation,
      isEditing,
      setSchemaType,
      updateProperty,
      removeProperty,
      addNestedProperty,
      validateSchema,
      generateJSON,
      importJSON,
      resetToTemplate,
    }}>
      {children}
    </SchemaMarkupContext.Provider>
  );
};

// Hook
export const useSchemaMarkup = () => {
  const context = useContext(SchemaMarkupContext);
  if (!context) {
    throw new Error('useSchemaMarkup must be used within SchemaMarkupProvider');
  }
  return context;
};

// Sub-components
export const SchemaTypeSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { templates, currentType, setSchemaType } = useSchemaMarkup();

  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
        Schema Type
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {templates.map(template => (
          <button
            key={template.type}
            onClick={() => setSchemaType(template.type)}
            className={`p-4 rounded-xl border text-left transition-colors ${
              currentType === template.type
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="text-2xl mb-2 block">{template.icon}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white block">
              {template.label}
            </span>
            <span className="text-xs text-gray-500 line-clamp-2">
              {template.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const PropertyEditor: React.FC<{
  property: SchemaProperty;
  value: any;
  onChange: (value: any) => void;
  className?: string;
}> = ({ property, value, onChange, className = '' }) => {
  if (property.type === 'object') {
    return (
      <ObjectPropertyEditor
        property={property}
        value={value}
        onChange={onChange}
        className={className}
      />
    );
  }

  if (property.type === 'array') {
    return (
      <ArrayPropertyEditor
        property={property}
        value={value}
        onChange={onChange}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {property.name}
          {property.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <span className="text-xs text-gray-500">{property.type}</span>
      </div>

      {property.type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={property.description}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {property.type === 'url' && (
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {property.type === 'date' && (
        <input
          type="datetime-local"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {property.type === 'number' && (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {property.type === 'boolean' && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {property.description}
          </span>
        </label>
      )}

      <p className="mt-1 text-xs text-gray-500">{property.description}</p>
    </div>
  );
};

const ObjectPropertyEditor: React.FC<{
  property: SchemaProperty;
  value: any;
  onChange: (value: any) => void;
  className?: string;
}> = ({ property, value, onChange, className = '' }) => {
  const objValue = value || {};

  const updateField = (field: string, fieldValue: any) => {
    onChange({ ...objValue, [field]: fieldValue });
  };

  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {property.name}
          {property.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <span className="text-xs text-gray-500">object</span>
      </div>

      <div className="space-y-3">
        {Object.entries(objValue).map(([key, val]) => {
          if (key === '@type') return null;
          return (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1 block">{key}</label>
              {typeof val === 'object' ? (
                <ObjectPropertyEditor
                  property={{ name: key, type: 'object', value: val, required: false, description: '' }}
                  value={val}
                  onChange={(v) => updateField(key, v)}
                />
              ) : (
                <input
                  type="text"
                  value={val as string || ''}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ArrayPropertyEditor: React.FC<{
  property: SchemaProperty;
  value: any;
  onChange: (value: any) => void;
  className?: string;
}> = ({ property, value, onChange, className = '' }) => {
  const items = Array.isArray(value) ? value : [];

  const addItem = () => {
    if (property.name === 'mainEntity') {
      // FAQ items
      onChange([...items, { '@type': 'Question', name: '', acceptedAnswer: { '@type': 'Answer', text: '' } }]);
    } else if (property.name === 'itemListElement') {
      // Breadcrumb items
      onChange([...items, { '@type': 'ListItem', position: items.length + 1, name: '', item: '' }]);
    } else if (property.name === 'recipeIngredient') {
      onChange([...items, '']);
    } else if (property.name === 'recipeInstructions') {
      onChange([...items, { '@type': 'HowToStep', text: '' }]);
    } else {
      onChange([...items, '']);
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, newValue: any) => {
    const newItems = [...items];
    newItems[index] = newValue;
    onChange(newItems);
  };

  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {property.name}
          {property.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <button
          onClick={addItem}
          className="text-xs text-blue-500 hover:text-blue-600"
        >
          + Add Item
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">
              {typeof item === 'string' ? (
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder={`Item ${index + 1}`}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                />
              ) : item['@type'] === 'Question' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={item.name || ''}
                    onChange={(e) => updateItem(index, { ...item, name: e.target.value })}
                    placeholder="Question"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                  />
                  <textarea
                    value={item.acceptedAnswer?.text || ''}
                    onChange={(e) => updateItem(index, { ...item, acceptedAnswer: { '@type': 'Answer', text: e.target.value } })}
                    placeholder="Answer"
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm resize-none"
                  />
                </div>
              ) : item['@type'] === 'ListItem' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.name || ''}
                    onChange={(e) => updateItem(index, { ...item, name: e.target.value })}
                    placeholder="Name"
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                  />
                  <input
                    type="url"
                    value={item.item || ''}
                    onChange={(e) => updateItem(index, { ...item, item: e.target.value })}
                    placeholder="URL"
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                  />
                </div>
              ) : item['@type'] === 'HowToStep' ? (
                <input
                  type="text"
                  value={item.text || ''}
                  onChange={(e) => updateItem(index, { ...item, text: e.target.value })}
                  placeholder={`Step ${index + 1}`}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                />
              ) : (
                <input
                  type="text"
                  value={JSON.stringify(item)}
                  onChange={(e) => {
                    try {
                      updateItem(index, JSON.parse(e.target.value));
                    } catch {}
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                />
              )}
            </div>
            <button
              onClick={() => removeItem(index)}
              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SchemaPropertiesForm: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { schemaData, currentType, templates, updateProperty } = useSchemaMarkup();
  const template = templates.find(t => t.type === currentType);

  if (!template) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {template.properties.map(prop => (
        <PropertyEditor
          key={prop.name}
          property={prop}
          value={schemaData[prop.name]}
          onChange={(value) => updateProperty(prop.name, value)}
        />
      ))}
    </div>
  );
};

export const SchemaValidation: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { validation, validateSchema } = useSchemaMarkup();

  return (
    <div className={className}>
      <button
        onClick={validateSchema}
        className="text-sm text-blue-500 hover:text-blue-600 mb-3"
      >
        🔍 Validate Schema
      </button>

      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((error, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-red-600">
              <span>❌</span>
              <span><strong>{error.path}:</strong> {error.message}</span>
            </div>
          ))}
          {validation.warnings.map((warning, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-yellow-600">
              <span>⚠️</span>
              <span><strong>{warning.path}:</strong> {warning.message}</span>
            </div>
          ))}
        </div>
      )}

      {validation.isValid && validation.errors.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <span>✅</span>
          <span>Schema is valid</span>
        </div>
      )}
    </div>
  );
};

export const SchemaCodePreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { generateJSON } = useSchemaMarkup();
  const json = generateJSON();

  const copyCode = () => {
    const scriptTag = `<script type="application/ld+json">\n${json}\n</script>`;
    navigator.clipboard.writeText(scriptTag);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Generated JSON-LD
        </h4>
        <button
          onClick={copyCode}
          className="text-xs text-blue-500 hover:text-blue-600"
        >
          Copy with script tag
        </button>
      </div>
      <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto max-h-80">
        <code>{json}</code>
      </pre>
    </div>
  );
};

export const SchemaRichResultPreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { schemaData, currentType } = useSchemaMarkup();

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        Rich Result Preview
      </h4>

      {currentType === 'Article' && (
        <div className="space-y-2">
          <div className="text-blue-600 text-lg hover:underline cursor-pointer">
            {schemaData.headline || 'Article Title'}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{schemaData.author?.name || 'Author'}</span>
            <span>•</span>
            <span>{schemaData.datePublished ? new Date(schemaData.datePublished).toLocaleDateString() : 'Date'}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {schemaData.description || 'Article description...'}
          </div>
        </div>
      )}

      {currentType === 'Product' && (
        <div className="flex gap-4">
          {schemaData.image && (
            <img src={schemaData.image} alt="" className="w-24 h-24 object-cover rounded" />
          )}
          <div>
            <div className="text-blue-600 text-lg">{schemaData.name || 'Product Name'}</div>
            <div className="flex items-center gap-1 text-yellow-500">
              {'★★★★☆'}
              <span className="text-sm text-gray-500">
                ({schemaData.aggregateRating?.reviewCount || 0} reviews)
              </span>
            </div>
            <div className="text-lg font-bold text-green-600">
              ${schemaData.offers?.price || '0.00'}
            </div>
          </div>
        </div>
      )}

      {currentType === 'FAQPage' && (
        <div className="space-y-3">
          {(schemaData.mainEntity || []).slice(0, 3).map((faq: any, i: number) => (
            <div key={i} className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <div className="font-medium text-gray-900 dark:text-white">
                {faq.name || `Question ${i + 1}`}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {faq.acceptedAnswer?.text || 'Answer...'}
              </div>
            </div>
          ))}
        </div>
      )}

      {!['Article', 'Product', 'FAQPage'].includes(currentType) && (
        <div className="text-center text-gray-500 py-4">
          Preview not available for {currentType}
        </div>
      )}
    </div>
  );
};

// Main Component
export const SchemaMarkupEditor: React.FC<{
  initialData?: Partial<SchemaData>;
  config?: Partial<SchemaMarkupConfig>;
  onDataChange?: (data: SchemaData) => void;
  className?: string;
}> = ({ initialData, config, onDataChange, className = '' }) => {
  const [showCode, setShowCode] = useState(false);

  return (
    <SchemaMarkupProvider initialData={initialData} config={config} onDataChange={onDataChange}>
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Schema Markup
            </h2>
            <span className="text-xs text-gray-500">JSON-LD</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <SchemaTypeSelector />
          <SchemaPropertiesForm />
          <SchemaValidation />

          <div className="flex gap-4">
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {showCode ? 'Hide' : 'Show'} generated code
            </button>
          </div>

          <AnimatePresence>
            {showCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <SchemaCodePreview />
                <SchemaRichResultPreview />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SchemaMarkupProvider>
  );
};

export default SchemaMarkupEditor;
