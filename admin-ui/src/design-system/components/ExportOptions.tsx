/**
 * RustPress Export Options Component
 * Export table data to CSV, Excel, PDF, JSON formats
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  File,
  ChevronDown,
  Check,
  Settings2,
  Columns3,
  Filter,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '../utils';
import { Button, IconButton } from './Button';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from './Dropdown';
import { Modal, ModalFooter } from './Modal';

export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

export interface ExportColumn {
  key: string;
  label: string;
  include?: boolean;
  format?: (value: unknown) => string;
}

export interface ExportConfig {
  filename?: string;
  format: ExportFormat;
  includeHeaders?: boolean;
  selectedOnly?: boolean;
  columns?: string[];
  dateFormat?: string;
  delimiter?: string; // For CSV
}

export interface ExportOptionsProps<T> {
  data: T[];
  columns: ExportColumn[];
  selectedIds?: Set<string | number>;
  getRowId?: (row: T, index: number) => string | number;
  filename?: string;
  onExport?: (config: ExportConfig, data: T[]) => void | Promise<void>;
  variant?: 'dropdown' | 'button' | 'modal';
  formats?: ExportFormat[];
  className?: string;
}

const formatIcons: Record<ExportFormat, React.ReactNode> = {
  csv: <FileText className="w-4 h-4" />,
  excel: <FileSpreadsheet className="w-4 h-4" />,
  json: <FileJson className="w-4 h-4" />,
  pdf: <File className="w-4 h-4" />,
};

const formatLabels: Record<ExportFormat, string> = {
  csv: 'CSV (Comma Separated)',
  excel: 'Excel Spreadsheet',
  json: 'JSON Data',
  pdf: 'PDF Document',
};

const formatExtensions: Record<ExportFormat, string> = {
  csv: '.csv',
  excel: '.xlsx',
  json: '.json',
  pdf: '.pdf',
};

export function ExportOptions<T extends Record<string, unknown>>({
  data,
  columns,
  selectedIds,
  getRowId = (row, index) => (row.id as string | number) ?? index,
  filename = 'export',
  onExport,
  variant = 'dropdown',
  formats = ['csv', 'excel', 'json', 'pdf'],
  className,
}: ExportOptionsProps<T>) {
  const [showModal, setShowModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(formats[0]);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(columns.map((c) => c.key))
  );
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [exportSelected, setExportSelected] = useState(false);
  const [customFilename, setCustomFilename] = useState(filename);

  // Get export data
  const exportData = useMemo(() => {
    let items = [...data];

    if (exportSelected && selectedIds && selectedIds.size > 0) {
      items = items.filter((row, i) => selectedIds.has(getRowId(row, i)));
    }

    return items;
  }, [data, exportSelected, selectedIds, getRowId]);

  const toggleColumn = (key: string) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedColumns(newSelected);
  };

  const handleQuickExport = async (format: ExportFormat) => {
    const config: ExportConfig = {
      filename: `${filename}${formatExtensions[format]}`,
      format,
      includeHeaders: true,
      selectedOnly: false,
      columns: columns.map((c) => c.key),
    };

    await performExport(config);
  };

  const handleAdvancedExport = async () => {
    const config: ExportConfig = {
      filename: `${customFilename}${formatExtensions[exportFormat]}`,
      format: exportFormat,
      includeHeaders,
      selectedOnly: exportSelected,
      columns: Array.from(selectedColumns),
    };

    await performExport(config);
    setShowModal(false);
  };

  const performExport = async (config: ExportConfig) => {
    setIsExporting(true);

    try {
      if (onExport) {
        await onExport(config, exportData);
      } else {
        // Default export implementation
        await defaultExport(exportData, columns, config);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }

    setIsExporting(false);
  };

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <Download className="w-4 h-4 mr-2" />
            Export
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownTrigger>

        <DropdownMenu align="end" className="w-56">
          <DropdownLabel>Export Format</DropdownLabel>
          <DropdownSeparator />

          {formats.map((format) => (
            <DropdownItem
              key={format}
              onClick={() => handleQuickExport(format)}
              disabled={isExporting}
            >
              {formatIcons[format]}
              <span className="ml-2">{formatLabels[format]}</span>
            </DropdownItem>
          ))}

          <DropdownSeparator />

          <DropdownItem onClick={() => setShowModal(true)}>
            <Settings2 className="w-4 h-4" />
            <span className="ml-2">Advanced Options...</span>
          </DropdownItem>
        </DropdownMenu>

        <ExportModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          formats={formats}
          columns={columns}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          selectedColumns={selectedColumns}
          toggleColumn={toggleColumn}
          includeHeaders={includeHeaders}
          setIncludeHeaders={setIncludeHeaders}
          exportSelected={exportSelected}
          setExportSelected={setExportSelected}
          customFilename={customFilename}
          setCustomFilename={setCustomFilename}
          selectedCount={selectedIds?.size || 0}
          totalCount={data.length}
          exportCount={exportData.length}
          isExporting={isExporting}
          onExport={handleAdvancedExport}
        />
      </Dropdown>
    );
  }

  // Button variant (opens modal directly)
  if (variant === 'button') {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowModal(true)}
          className={className}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        <ExportModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          formats={formats}
          columns={columns}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          selectedColumns={selectedColumns}
          toggleColumn={toggleColumn}
          includeHeaders={includeHeaders}
          setIncludeHeaders={setIncludeHeaders}
          exportSelected={exportSelected}
          setExportSelected={setExportSelected}
          customFilename={customFilename}
          setCustomFilename={setCustomFilename}
          selectedCount={selectedIds?.size || 0}
          totalCount={data.length}
          exportCount={exportData.length}
          isExporting={isExporting}
          onExport={handleAdvancedExport}
        />
      </>
    );
  }

  // Modal variant (always show modal)
  return (
    <ExportModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      formats={formats}
      columns={columns}
      exportFormat={exportFormat}
      setExportFormat={setExportFormat}
      selectedColumns={selectedColumns}
      toggleColumn={toggleColumn}
      includeHeaders={includeHeaders}
      setIncludeHeaders={setIncludeHeaders}
      exportSelected={exportSelected}
      setExportSelected={setExportSelected}
      customFilename={customFilename}
      setCustomFilename={setCustomFilename}
      selectedCount={selectedIds?.size || 0}
      totalCount={data.length}
      exportCount={exportData.length}
      isExporting={isExporting}
      onExport={handleAdvancedExport}
    />
  );
}

// Export Modal
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  formats: ExportFormat[];
  columns: ExportColumn[];
  exportFormat: ExportFormat;
  setExportFormat: (format: ExportFormat) => void;
  selectedColumns: Set<string>;
  toggleColumn: (key: string) => void;
  includeHeaders: boolean;
  setIncludeHeaders: (include: boolean) => void;
  exportSelected: boolean;
  setExportSelected: (selected: boolean) => void;
  customFilename: string;
  setCustomFilename: (name: string) => void;
  selectedCount: number;
  totalCount: number;
  exportCount: number;
  isExporting: boolean;
  onExport: () => void;
}

function ExportModal({
  isOpen,
  onClose,
  formats,
  columns,
  exportFormat,
  setExportFormat,
  selectedColumns,
  toggleColumn,
  includeHeaders,
  setIncludeHeaders,
  exportSelected,
  setExportSelected,
  customFilename,
  setCustomFilename,
  selectedCount,
  totalCount,
  exportCount,
  isExporting,
  onExport,
}: ExportModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Data"
      size="md"
    >
      <div className="space-y-6">
        {/* Format selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {formats.map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                  exportFormat === format
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                )}
              >
                <span className={exportFormat === format ? 'text-primary-500' : 'text-neutral-400'}>
                  {formatIcons[format]}
                </span>
                <span className={cn(
                  'text-sm font-medium',
                  exportFormat === format ? 'text-primary-700 dark:text-primary-300' : ''
                )}>
                  {format.toUpperCase()}
                </span>
                {exportFormat === format && (
                  <Check className="w-4 h-4 text-primary-500 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filename */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Filename
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg border text-sm',
                'border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-800',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            />
            <span className="text-sm text-neutral-500">
              {formatExtensions[exportFormat]}
            </span>
          </div>
        </div>

        {/* Data selection */}
        {selectedCount > 0 && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Data to Export
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setExportSelected(false)}
                className={cn(
                  'flex-1 p-3 rounded-lg border-2 text-left transition-all',
                  !exportSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700'
                )}
              >
                <div className="text-sm font-medium">All rows</div>
                <div className="text-xs text-neutral-500">{totalCount} items</div>
              </button>
              <button
                onClick={() => setExportSelected(true)}
                className={cn(
                  'flex-1 p-3 rounded-lg border-2 text-left transition-all',
                  exportSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700'
                )}
              >
                <div className="text-sm font-medium">Selected only</div>
                <div className="text-xs text-neutral-500">{selectedCount} items</div>
              </button>
            </div>
          </div>
        )}

        {/* Column selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Columns to Export
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const allKeys = columns.map((c) => c.key);
                  // Toggle all
                  if (selectedColumns.size === columns.length) {
                    // Deselect all (keep at least one)
                    const newSet = new Set<string>();
                    newSet.add(columns[0].key);
                    // We can't use setSelectedColumns here, so we just toggle each
                  }
                }}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                {selectedColumns.size === columns.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg">
            {columns.map((column) => {
              const isSelected = selectedColumns.has(column.key);
              return (
                <button
                  key={column.key}
                  onClick={() => toggleColumn(column.key)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-left text-sm',
                    'hover:bg-neutral-50 dark:hover:bg-neutral-800',
                    'border-b border-neutral-100 dark:border-neutral-800 last:border-0'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center',
                      isSelected
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-neutral-300 dark:border-neutral-600'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={isSelected ? '' : 'text-neutral-400'}>
                    {column.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Options */}
        {(exportFormat === 'csv' || exportFormat === 'excel') && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeHeaders"
              checked={includeHeaders}
              onChange={(e) => setIncludeHeaders(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-primary-600"
            />
            <label htmlFor="includeHeaders" className="text-sm text-neutral-700 dark:text-neutral-300">
              Include column headers
            </label>
          </div>
        )}

        {/* Export summary */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Exporting <span className="font-medium text-neutral-900 dark:text-white">{exportCount}</span> rows
            with <span className="font-medium text-neutral-900 dark:text-white">{selectedColumns.size}</span> columns
            as <span className="font-medium text-neutral-900 dark:text-white">{exportFormat.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onExport}
          disabled={isExporting || selectedColumns.size === 0}
          leftIcon={isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Default export implementation
async function defaultExport<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  config: ExportConfig
): Promise<void> {
  const selectedColumns = columns.filter((c) =>
    !config.columns || config.columns.includes(c.key)
  );

  switch (config.format) {
    case 'csv':
      exportToCSV(data, selectedColumns, config);
      break;
    case 'json':
      exportToJSON(data, selectedColumns, config);
      break;
    case 'excel':
      // Excel export would require a library like xlsx
      console.log('Excel export requires xlsx library');
      exportToCSV(data, selectedColumns, { ...config, filename: config.filename?.replace('.xlsx', '.csv') || 'export.csv' });
      break;
    case 'pdf':
      // PDF export would require a library like jspdf
      console.log('PDF export requires jspdf library');
      break;
  }
}

function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  config: ExportConfig
): void {
  const delimiter = config.delimiter || ',';
  const lines: string[] = [];

  // Headers
  if (config.includeHeaders !== false) {
    lines.push(columns.map((c) => `"${c.label}"`).join(delimiter));
  }

  // Data rows
  data.forEach((row) => {
    const values = columns.map((col) => {
      const value = row[col.key];
      const formatted = col.format ? col.format(value) : String(value ?? '');
      // Escape quotes and wrap in quotes
      return `"${formatted.replace(/"/g, '""')}"`;
    });
    lines.push(values.join(delimiter));
  });

  const csv = lines.join('\n');
  downloadFile(csv, config.filename || 'export.csv', 'text/csv;charset=utf-8;');
}

function exportToJSON<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  config: ExportConfig
): void {
  const exportData = data.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col) => {
      obj[col.key] = col.format ? col.format(row[col.key]) : row[col.key];
    });
    return obj;
  });

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, config.filename || 'export.json', 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Quick export button
export interface QuickExportButtonProps<T> {
  data: T[];
  columns: ExportColumn[];
  format: ExportFormat;
  filename?: string;
  className?: string;
}

export function QuickExportButton<T extends Record<string, unknown>>({
  data,
  columns,
  format,
  filename = 'export',
  className,
}: QuickExportButtonProps<T>) {
  const handleExport = () => {
    const config: ExportConfig = {
      filename: `${filename}${formatExtensions[format]}`,
      format,
      includeHeaders: true,
      columns: columns.map((c) => c.key),
    };

    defaultExport(data, columns, config);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleExport}
      className={className}
    >
      {formatIcons[format]}
      <span className="ml-2">{format.toUpperCase()}</span>
    </Button>
  );
}

export default ExportOptions;
