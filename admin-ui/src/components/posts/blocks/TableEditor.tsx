import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  Plus,
  Trash2,
  Settings,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Merge,
  Split,
  Copy,
  Palette,
  Eye,
  EyeOff,
  Grid,
  Download,
  Upload,
  Undo,
  Redo,
  Maximize2,
  Paintbrush,
  Sparkles,
  Check,
  X,
  Search,
  Sliders,
  RotateCcw,
  Save,
  Star,
  Layout,
} from 'lucide-react';
import clsx from 'clsx';
import Modal from '../../ui/Modal';
import {
  useTableStylesStore,
  TableStyleConfig,
  tableStyleCategories,
  defaultTableStyles,
  TableStyleCategory,
} from '../../../store/tableStylesStore';

interface TableCell {
  id: string;
  content: string;
  rowspan: number;
  colspan: number;
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  backgroundColor?: string;
  textColor?: string;
  bold: boolean;
  italic: boolean;
  isHeader: boolean;
}

interface TableRow {
  id: string;
  cells: TableCell[];
  height?: number;
}

interface TableData {
  id: string;
  rows: TableRow[];
  hasHeader: boolean;
  hasFooter: boolean;
  striped: boolean;
  bordered: boolean;
  hoverable: boolean;
  responsive: boolean;
  caption?: string;
  width: 'auto' | 'full' | 'fixed';
  styleId?: string;
}

interface TableEditorSettings {
  showGridLines: boolean;
  enableDragResize: boolean;
  autoSave: boolean;
  defaultCellPadding: number;
  defaultBorderColor: string;
  defaultHeaderBg: string;
  alternateRowColor: string;
}

interface TableEditorProps {
  initialData?: TableData;
  onChange?: (data: TableData) => void;
  className?: string;
}

const createEmptyCell = (isHeader = false): TableCell => ({
  id: `cell-${Date.now()}-${Math.random()}`,
  content: '',
  rowspan: 1,
  colspan: 1,
  align: 'left',
  verticalAlign: 'middle',
  bold: isHeader,
  italic: false,
  isHeader
});

const createEmptyRow = (cols: number, isHeader = false): TableRow => ({
  id: `row-${Date.now()}-${Math.random()}`,
  cells: Array.from({ length: cols }, () => createEmptyCell(isHeader))
});

const defaultTableData: TableData = {
  id: 'table-1',
  rows: [
    {
      id: 'row-1',
      cells: [
        { id: 'c1', content: 'Feature', rowspan: 1, colspan: 1, align: 'left', verticalAlign: 'middle', bold: true, italic: false, isHeader: true },
        { id: 'c2', content: 'Basic', rowspan: 1, colspan: 1, align: 'center', verticalAlign: 'middle', bold: true, italic: false, isHeader: true },
        { id: 'c3', content: 'Pro', rowspan: 1, colspan: 1, align: 'center', verticalAlign: 'middle', bold: true, italic: false, isHeader: true },
        { id: 'c4', content: 'Enterprise', rowspan: 1, colspan: 1, align: 'center', verticalAlign: 'middle', bold: true, italic: false, isHeader: true }
      ]
    },
    {
      id: 'row-2',
      cells: [
        { id: 'c5', content: 'Storage', rowspan: 1, colspan: 1, align: 'left', verticalAlign: 'middle', bold: false, italic: false, isHeader: false },
        { id: 'c6', content: '5 GB', rowspan: 1, colspan: 1, align: 'center', verticalAlign: 'middle', bold: false, italic: false, isHeader: false },
        { id: 'c7', content: '50 GB', rowspan: 1, colspan: 1, align: 'center', verticalAlign: 'middle', bold: false, italic: false, isHeader: false },
        { id: 'c8', content: 'Unlimited', rowspan: 1, colspan: 1, align: 'center', verticalAlign: 'middle', bold: false, italic: false, isHeader: false }
      ]
    },
    {
      id: 'row-3',
      cells: [
        { id: 'c9', content: 'Users', rowspan: 1, colspan: 1, align: 'left', verticalAlign: 'middle', bold: false, italic: false, isHeader: false },
        { id: 'c10', content: '1', rowspan: 1, colspan: 1, align: 'center', verticalAlign: 'middle', bold: false, italic: false, isHeader: false },
        { id: 'c11', content: '10', rowspan: 1, colspan: 1, align: 'center', verticalAlign: 'middle', bold: false, italic: false, isHeader: false },
        { id: 'c12', content: 'Unlimited', rowspan: 1, colspan: 1, align: 'center', verticalAlign: 'middle', bold: false, italic: false, isHeader: false }
      ]
    },
    {
      id: 'row-4',
      cells: [
        { id: 'c13', content: 'Support', rowspan: 1, colspan: 1, align: 'left', verticalAlign: 'middle', bold: false, italic: false, isHeader: false },
        { id: 'c14', content: 'Email', rowspan: 1, colspan: 1, align: 'center', verticalAlign: 'middle', bold: false, italic: false, isHeader: false },
        { id: 'c15', content: 'Priority', rowspan: 1, colspan: 1, align: 'center', verticalAlign: 'middle', bold: false, italic: false, isHeader: false },
        { id: 'c16', content: '24/7 Phone', rowspan: 1, colspan: 1, align: 'center', verticalAlign: 'middle', bold: false, italic: false, isHeader: false }
      ]
    }
  ],
  hasHeader: true,
  hasFooter: false,
  striped: true,
  bordered: true,
  hoverable: true,
  responsive: true,
  caption: 'Pricing Comparison',
  width: 'full',
  styleId: 'theme-default'
};

// Style Preview Component
const StylePreviewMini: React.FC<{ style: TableStyleConfig; isSelected: boolean; onClick: () => void }> = ({
  style,
  isSelected,
  onClick
}) => {
  // Determine if header is dark to choose appropriate placeholder color
  const isHeaderDark = style.header.backgroundColor.startsWith('#') &&
    parseInt(style.header.backgroundColor.slice(1, 3), 16) < 128;
  const isBodyDark = style.body.backgroundColor.startsWith('#') &&
    parseInt(style.body.backgroundColor.slice(1, 3), 16) < 128;

  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative p-2 rounded-lg border-2 transition-all hover:shadow-md text-left w-full',
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      {/* Checkered background wrapper */}
      <div
        className="w-full rounded overflow-hidden mb-2 p-1"
        style={{
          backgroundImage: 'linear-gradient(45deg, #d1d5db 25%, transparent 25%), linear-gradient(-45deg, #d1d5db 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d1d5db 75%), linear-gradient(-45deg, transparent 75%, #d1d5db 75%)',
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          backgroundColor: '#e5e7eb',
        }}
      >
        {/* Mini table preview */}
        <div
          className="w-full rounded overflow-hidden"
          style={{
            borderRadius: style.border.radius,
            boxShadow: style.effects.shadow !== 'none' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            border: style.border.style !== 'none' ? `1px ${style.border.style} ${style.border.color}` : 'none',
          }}
        >
          {/* Header row */}
          <div
            className="h-5 flex items-center px-2"
            style={{
              background: style.header.backgroundColor,
              borderBottom: style.header.borderBottom,
            }}
          >
            <div className={`flex-1 h-1.5 rounded ${isHeaderDark ? 'bg-white/40' : 'bg-black/20'}`} />
            <div className={`flex-1 h-1.5 rounded ml-1 ${isHeaderDark ? 'bg-white/40' : 'bg-black/20'}`} />
            <div className={`flex-1 h-1.5 rounded ml-1 ${isHeaderDark ? 'bg-white/40' : 'bg-black/20'}`} />
          </div>
          {/* Body rows */}
          {[0, 1].map((i) => {
            const rowBg = i % 2 === 1 && style.effects.striped
              ? style.body.alternateRowColor
              : style.body.backgroundColor;
            const isRowDark = rowBg.startsWith('#') && parseInt(rowBg.slice(1, 3), 16) < 128;
            return (
              <div
                key={i}
                className="h-4 flex items-center px-2"
                style={{ backgroundColor: rowBg }}
              >
                <div className={`flex-1 h-1 rounded ${isRowDark ? 'bg-white/30' : 'bg-black/15'}`} />
                <div className={`flex-1 h-1 rounded ml-1 ${isRowDark ? 'bg-white/30' : 'bg-black/15'}`} />
                <div className={`flex-1 h-1 rounded ml-1 ${isRowDark ? 'bg-white/30' : 'bg-black/15'}`} />
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
        {style.name}
      </p>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
        {style.description}
      </p>

      {isSelected && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
      )}
    </button>
  );
};

// Style Customizer Modal
const StyleCustomizer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  style: TableStyleConfig;
  onSave: (style: TableStyleConfig) => void;
}> = ({ isOpen, onClose, style, onSave }) => {
  const [editedStyle, setEditedStyle] = useState<TableStyleConfig>(style);
  const [activeSection, setActiveSection] = useState<'header' | 'body' | 'border' | 'effects'>('header');

  const updateStyle = (section: string, key: string, value: any) => {
    setEditedStyle(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [key]: value,
      }
    }));
  };

  const handleSave = () => {
    onSave(editedStyle);
    onClose();
  };

  const sections = [
    { id: 'header', name: 'Header', icon: Layout },
    { id: 'body', name: 'Body', icon: Grid },
    { id: 'border', name: 'Border', icon: Maximize2 },
    { id: 'effects', name: 'Effects', icon: Sparkles },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Table Style" size="xl">
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                activeSection === section.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              )}
            >
              <section.icon size={16} />
              {section.name}
            </button>
          ))}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Style Name</label>
              <input
                type="text"
                value={editedStyle.name}
                onChange={(e) => setEditedStyle(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-[400px]">
          {/* Header Section */}
          {activeSection === 'header' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Header Styles</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editedStyle.header.backgroundColor.startsWith('#') ? editedStyle.header.backgroundColor : '#f3f4f6'}
                      onChange={(e) => updateStyle('header', 'backgroundColor', e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedStyle.header.backgroundColor}
                      onChange={(e) => updateStyle('header', 'backgroundColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editedStyle.header.textColor}
                      onChange={(e) => updateStyle('header', 'textColor', e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedStyle.header.textColor}
                      onChange={(e) => updateStyle('header', 'textColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Font Weight</label>
                  <select
                    value={editedStyle.header.fontWeight}
                    onChange={(e) => updateStyle('header', 'fontWeight', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Font Size</label>
                  <select
                    value={editedStyle.header.fontSize}
                    onChange={(e) => updateStyle('header', 'fontSize', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="xs">Extra Small</option>
                    <option value="sm">Small</option>
                    <option value="base">Base</option>
                    <option value="lg">Large</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Text Transform</label>
                  <select
                    value={editedStyle.header.textTransform}
                    onChange={(e) => updateStyle('header', 'textTransform', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="none">None</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">Capitalize</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Padding</label>
                  <input
                    type="text"
                    value={editedStyle.header.padding}
                    onChange={(e) => updateStyle('header', 'padding', e.target.value)}
                    placeholder="12px 16px"
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Border Bottom</label>
                  <input
                    type="text"
                    value={editedStyle.header.borderBottom}
                    onChange={(e) => updateStyle('header', 'borderBottom', e.target.value)}
                    placeholder="2px solid #000"
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Body Section */}
          {activeSection === 'body' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Body Styles</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editedStyle.body.backgroundColor.startsWith('#') ? editedStyle.body.backgroundColor : '#ffffff'}
                      onChange={(e) => updateStyle('body', 'backgroundColor', e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedStyle.body.backgroundColor}
                      onChange={(e) => updateStyle('body', 'backgroundColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Alternate Row Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editedStyle.body.alternateRowColor.startsWith('#') ? editedStyle.body.alternateRowColor : '#f9fafb'}
                      onChange={(e) => updateStyle('body', 'alternateRowColor', e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedStyle.body.alternateRowColor}
                      onChange={(e) => updateStyle('body', 'alternateRowColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editedStyle.body.textColor}
                      onChange={(e) => updateStyle('body', 'textColor', e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedStyle.body.textColor}
                      onChange={(e) => updateStyle('body', 'textColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Font Size</label>
                  <select
                    value={editedStyle.body.fontSize}
                    onChange={(e) => updateStyle('body', 'fontSize', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="xs">Extra Small</option>
                    <option value="sm">Small</option>
                    <option value="base">Base</option>
                    <option value="lg">Large</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Padding</label>
                  <input
                    type="text"
                    value={editedStyle.body.padding}
                    onChange={(e) => updateStyle('body', 'padding', e.target.value)}
                    placeholder="10px 16px"
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Border Section */}
          {activeSection === 'border' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Border Styles</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Border Style</label>
                  <select
                    value={editedStyle.border.style}
                    onChange={(e) => updateStyle('border', 'style', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="none">None</option>
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Border Width</label>
                  <input
                    type="text"
                    value={editedStyle.border.width}
                    onChange={(e) => updateStyle('border', 'width', e.target.value)}
                    placeholder="1px"
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Border Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editedStyle.border.color.startsWith('#') ? editedStyle.border.color : '#e5e7eb'}
                      onChange={(e) => updateStyle('border', 'color', e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedStyle.border.color}
                      onChange={(e) => updateStyle('border', 'color', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Border Radius</label>
                  <input
                    type="text"
                    value={editedStyle.border.radius}
                    onChange={(e) => updateStyle('border', 'radius', e.target.value)}
                    placeholder="8px"
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedStyle.border.cellBorders}
                    onChange={(e) => updateStyle('border', 'cellBorders', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Cell Borders</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedStyle.border.headerBorder}
                    onChange={(e) => updateStyle('border', 'headerBorder', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Header Border</span>
                </label>
              </div>
            </div>
          )}

          {/* Effects Section */}
          {activeSection === 'effects' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Effects</h3>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedStyle.effects.striped}
                    onChange={(e) => updateStyle('effects', 'striped', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Striped Rows</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedStyle.effects.hoverable}
                    onChange={(e) => updateStyle('effects', 'hoverable', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Hover Effect</span>
                </label>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Hover Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editedStyle.effects.hoverColor.startsWith('#') ? editedStyle.effects.hoverColor : '#f3f4f6'}
                      onChange={(e) => updateStyle('effects', 'hoverColor', e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedStyle.effects.hoverColor}
                      onChange={(e) => updateStyle('effects', 'hoverColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Shadow</label>
                  <select
                    value={editedStyle.effects.shadow}
                    onChange={(e) => updateStyle('effects', 'shadow', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">Extra Large</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Animation</label>
                  <select
                    value={editedStyle.effects.animation}
                    onChange={(e) => updateStyle('effects', 'animation', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="none">None</option>
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                    <option value="scale">Scale</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Live Preview */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Live Preview</h4>
            {/* Checkered background for transparency visibility */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                backgroundColor: '#f3f4f6',
              }}
            >
            <div
              className="overflow-hidden"
              style={{
                borderRadius: editedStyle.border.radius,
                border: editedStyle.border.style !== 'none' ? `${editedStyle.border.width} ${editedStyle.border.style} ${editedStyle.border.color}` : 'none',
                boxShadow: editedStyle.effects.shadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.05)' :
                  editedStyle.effects.shadow === 'md' ? '0 4px 6px rgba(0,0,0,0.1)' :
                  editedStyle.effects.shadow === 'lg' ? '0 10px 15px rgba(0,0,0,0.1)' :
                  editedStyle.effects.shadow === 'xl' ? '0 20px 25px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Product', 'Price', 'Stock'].map((header, idx) => (
                      <th
                        key={idx}
                        style={{
                          background: editedStyle.header.backgroundColor,
                          color: editedStyle.header.textColor,
                          fontWeight: editedStyle.header.fontWeight === 'bold' ? 700 : editedStyle.header.fontWeight === 'semibold' ? 600 : editedStyle.header.fontWeight === 'medium' ? 500 : 400,
                          fontSize: editedStyle.header.fontSize === 'xs' ? '0.75rem' : editedStyle.header.fontSize === 'sm' ? '0.875rem' : editedStyle.header.fontSize === 'lg' ? '1.125rem' : '1rem',
                          textTransform: editedStyle.header.textTransform as any,
                          padding: editedStyle.header.padding,
                          borderBottom: editedStyle.header.borderBottom,
                          borderRight: editedStyle.border.cellBorders && idx < 2 ? `${editedStyle.border.width} ${editedStyle.border.style} ${editedStyle.border.color}` : 'none',
                          textAlign: idx === 0 ? 'left' : 'center',
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Widget Pro', '$29.99', '150'],
                    ['Super Gadget', '$49.99', '85'],
                    ['Premium Kit', '$99.99', '42'],
                  ].map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          style={{
                            backgroundColor: i % 2 === 1 && editedStyle.effects.striped
                              ? editedStyle.body.alternateRowColor
                              : editedStyle.body.backgroundColor,
                            color: editedStyle.body.textColor,
                            fontSize: editedStyle.body.fontSize === 'xs' ? '0.75rem' : editedStyle.body.fontSize === 'sm' ? '0.875rem' : editedStyle.body.fontSize === 'lg' ? '1.125rem' : '1rem',
                            padding: editedStyle.body.padding,
                            borderBottom: editedStyle.border.cellBorders ? `${editedStyle.border.width} ${editedStyle.border.style} ${editedStyle.border.color}` : 'none',
                            borderRight: editedStyle.border.cellBorders && j < 2 ? `${editedStyle.border.width} ${editedStyle.border.style} ${editedStyle.border.color}` : 'none',
                            textAlign: j === 0 ? 'left' : 'center',
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setEditedStyle(style)}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
            <Save size={16} />
            Save Style
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const TableEditor: React.FC<TableEditorProps> = ({
  initialData = defaultTableData,
  onChange,
  className
}) => {
  const [tableData, setTableData] = useState<TableData>(initialData);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showStyleCustomizer, setShowStyleCustomizer] = useState(false);
  const [history, setHistory] = useState<TableData[]>([initialData]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [styleSearch, setStyleSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TableStyleCategory | 'all'>('all');
  const [settings, setSettings] = useState<TableEditorSettings>({
    showGridLines: true,
    enableDragResize: true,
    autoSave: true,
    defaultCellPadding: 12,
    defaultBorderColor: '#e5e7eb',
    defaultHeaderBg: '#f3f4f6',
    alternateRowColor: '#f9fafb'
  });

  // Table styles store
  const {
    activeStyleId,
    setActiveStyle,
    getActiveStyle,
    getAllStyles,
    addCustomStyle,
    duplicateStyle,
  } = useTableStylesStore();

  const allStyles = getAllStyles();
  const activeStyle = getActiveStyle();

  // Filter styles
  const filteredStyles = useMemo(() => {
    return allStyles.filter(style => {
      const matchesSearch = style.name.toLowerCase().includes(styleSearch.toLowerCase()) ||
        style.description.toLowerCase().includes(styleSearch.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || style.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allStyles, styleSearch, selectedCategory]);

  const updateTable = useCallback((newData: TableData) => {
    setTableData(newData);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newData]);
    setHistoryIndex(prev => prev + 1);
    onChange?.(newData);
  }, [historyIndex, onChange]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setTableData(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setTableData(history[historyIndex + 1]);
    }
  };

  const addRow = (position: 'above' | 'below') => {
    const colCount = tableData.rows[0]?.cells.length || 3;
    const newRow = createEmptyRow(colCount);
    const newRows = [...tableData.rows];
    const insertIndex = selectedCell
      ? (position === 'above' ? selectedCell.row : selectedCell.row + 1)
      : (position === 'above' ? 0 : newRows.length);
    newRows.splice(insertIndex, 0, newRow);
    updateTable({ ...tableData, rows: newRows });
  };

  const addColumn = (position: 'left' | 'right') => {
    const newRows = tableData.rows.map((row, rowIdx) => ({
      ...row,
      cells: [
        ...row.cells.slice(0, selectedCell ? (position === 'left' ? selectedCell.col : selectedCell.col + 1) : (position === 'left' ? 0 : row.cells.length)),
        createEmptyCell(rowIdx === 0 && tableData.hasHeader),
        ...row.cells.slice(selectedCell ? (position === 'left' ? selectedCell.col : selectedCell.col + 1) : (position === 'left' ? 0 : row.cells.length))
      ]
    }));
    updateTable({ ...tableData, rows: newRows });
  };

  const deleteRow = () => {
    if (selectedCell && tableData.rows.length > 1) {
      const newRows = tableData.rows.filter((_, idx) => idx !== selectedCell.row);
      updateTable({ ...tableData, rows: newRows });
      setSelectedCell(null);
    }
  };

  const deleteColumn = () => {
    if (selectedCell && tableData.rows[0].cells.length > 1) {
      const newRows = tableData.rows.map(row => ({
        ...row,
        cells: row.cells.filter((_, idx) => idx !== selectedCell.col)
      }));
      updateTable({ ...tableData, rows: newRows });
      setSelectedCell(null);
    }
  };

  const updateCell = (rowIdx: number, colIdx: number, updates: Partial<TableCell>) => {
    const newRows = tableData.rows.map((row, rIdx) => ({
      ...row,
      cells: row.cells.map((cell, cIdx) =>
        rIdx === rowIdx && cIdx === colIdx ? { ...cell, ...updates } : cell
      )
    }));
    updateTable({ ...tableData, rows: newRows });
  };

  const getSelectedCell = (): TableCell | null => {
    if (!selectedCell) return null;
    return tableData.rows[selectedCell.row]?.cells[selectedCell.col] || null;
  };

  const currentCell = getSelectedCell();

  const colors = [
    '#ffffff', '#f3f4f6', '#fee2e2', '#fef3c7', '#d1fae5', '#dbeafe', '#e0e7ff', '#fce7f3'
  ];

  const handleStyleSelect = (styleId: string) => {
    setActiveStyle(styleId);
    updateTable({ ...tableData, styleId });
  };

  const handleCustomizeStyle = () => {
    if (activeStyle) {
      setShowStylePicker(false);
      setShowStyleCustomizer(true);
    }
  };

  const handleSaveCustomStyle = (style: TableStyleConfig) => {
    if (style.isCustom) {
      // Update existing custom style
      useTableStylesStore.getState().updateCustomStyle(style.id, style);
    } else {
      // Create new custom style from built-in
      const newId = addCustomStyle({
        ...style,
        name: `${style.name} (Custom)`,
        category: 'custom',
      });
      setActiveStyle(newId);
      updateTable({ ...tableData, styleId: newId });
    }
  };

  // Get shadow class
  const getShadowStyle = (shadow: string) => {
    switch (shadow) {
      case 'sm': return '0 1px 2px rgba(0,0,0,0.05)';
      case 'md': return '0 4px 6px rgba(0,0,0,0.1)';
      case 'lg': return '0 10px 15px rgba(0,0,0,0.1)';
      case 'xl': return '0 20px 25px rgba(0,0,0,0.1)';
      default: return 'none';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
            <Table size={20} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Table Editor</h2>
            <p className="text-sm text-gray-500">Create and edit tables visually</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Style Picker Button */}
          <button
            onClick={() => setShowStylePicker(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Palette size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {activeStyle?.name || 'Theme Default'}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          <button
            onClick={undo}
            disabled={historyIndex === 0}
            className="p-2 rounded-lg hover:bg-white/50 disabled:opacity-50"
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            className="p-2 rounded-lg hover:bg-white/50 disabled:opacity-50"
            title="Redo"
          >
            <Redo size={18} />
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showPreview ? 'bg-teal-100 text-teal-600' : 'hover:bg-white/50'
            )}
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings ? 'bg-teal-100 text-teal-600' : 'hover:bg-white/50'
            )}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b bg-gray-50 dark:bg-gray-800/50">
        {/* Row/Column Actions */}
        <div className="flex items-center gap-1 pr-3 border-r">
          <button
            onClick={() => addRow('above')}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Add row above"
          >
            <ArrowUp size={16} />
          </button>
          <button
            onClick={() => addRow('below')}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Add row below"
          >
            <ArrowDown size={16} />
          </button>
          <button
            onClick={() => addColumn('left')}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Add column left"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => addColumn('right')}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Add column right"
          >
            <ArrowRight size={16} />
          </button>
          <button
            onClick={deleteRow}
            disabled={!selectedCell}
            className="p-1.5 hover:bg-red-100 text-red-600 rounded disabled:opacity-50"
            title="Delete row"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 pr-3 border-r">
          <button
            onClick={() => selectedCell && updateCell(selectedCell.row, selectedCell.col, { bold: !currentCell?.bold })}
            disabled={!selectedCell}
            className={clsx(
              'p-1.5 rounded disabled:opacity-50',
              currentCell?.bold ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-200'
            )}
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => selectedCell && updateCell(selectedCell.row, selectedCell.col, { italic: !currentCell?.italic })}
            disabled={!selectedCell}
            className={clsx(
              'p-1.5 rounded disabled:opacity-50',
              currentCell?.italic ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-200'
            )}
          >
            <Italic size={16} />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 pr-3 border-r">
          {(['left', 'center', 'right'] as const).map(align => (
            <button
              key={align}
              onClick={() => selectedCell && updateCell(selectedCell.row, selectedCell.col, { align })}
              disabled={!selectedCell}
              className={clsx(
                'p-1.5 rounded disabled:opacity-50',
                currentCell?.align === align ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-200'
              )}
            >
              {align === 'left' && <AlignLeft size={16} />}
              {align === 'center' && <AlignCenter size={16} />}
              {align === 'right' && <AlignRight size={16} />}
            </button>
          ))}
        </div>

        {/* Cell Colors */}
        <div className="flex items-center gap-1 pr-3 border-r">
          <span className="text-xs text-gray-500 mr-1">BG:</span>
          {colors.slice(0, 4).map(color => (
            <button
              key={color}
              onClick={() => selectedCell && updateCell(selectedCell.row, selectedCell.col, { backgroundColor: color })}
              className="w-5 h-5 rounded border border-gray-300"
              style={{ backgroundColor: color }}
              disabled={!selectedCell}
            />
          ))}
        </div>

        {/* Table Options */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={tableData.striped}
              onChange={(e) => updateTable({ ...tableData, striped: e.target.checked })}
              className="rounded text-teal-600"
            />
            Striped
          </label>
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={tableData.bordered}
              onChange={(e) => updateTable({ ...tableData, bordered: e.target.checked })}
              className="rounded text-teal-600"
            />
            Bordered
          </label>
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={tableData.hoverable}
              onChange={(e) => updateTable({ ...tableData, hoverable: e.target.checked })}
              className="rounded text-teal-600"
            />
            Hover
          </label>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Table Caption</label>
                <input
                  type="text"
                  value={tableData.caption || ''}
                  onChange={(e) => updateTable({ ...tableData, caption: e.target.value })}
                  placeholder="Add caption..."
                  className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Table Width</label>
                <select
                  value={tableData.width}
                  onChange={(e) => updateTable({ ...tableData, width: e.target.value as any })}
                  className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="auto">Auto</option>
                  <option value="full">Full Width</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tableData.responsive}
                  onChange={(e) => updateTable({ ...tableData, responsive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Responsive</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showGridLines}
                  onChange={(e) => setSettings({ ...settings, showGridLines: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Grid Lines</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Editor */}
      <div className="p-4 overflow-x-auto">
        {showPreview && activeStyle ? (
          /* Preview Mode with Style */
          <div
            className="overflow-hidden"
            style={{
              borderRadius: activeStyle.border.radius,
              border: activeStyle.border.style !== 'none'
                ? `${activeStyle.border.width} ${activeStyle.border.style} ${activeStyle.border.color}`
                : 'none',
              boxShadow: getShadowStyle(activeStyle.effects.shadow),
            }}
          >
            <table className={clsx('min-w-full', tableData.width === 'full' && 'w-full')}>
              {tableData.caption && (
                <caption className="text-sm text-gray-600 mb-2">{tableData.caption}</caption>
              )}
              <tbody>
                {tableData.rows.map((row, rowIdx) => (
                  <tr key={row.id}>
                    {row.cells.map((cell) => {
                      const isHeader = cell.isHeader;
                      const Tag = isHeader ? 'th' : 'td';
                      const styles = isHeader ? activeStyle.header : activeStyle.body;
                      const isAlt = !isHeader && rowIdx % 2 === 1 && activeStyle.effects.striped;

                      return (
                        <Tag
                          key={cell.id}
                          rowSpan={cell.rowspan}
                          colSpan={cell.colspan}
                          style={{
                            background: isHeader
                              ? activeStyle.header.backgroundColor
                              : isAlt
                                ? activeStyle.body.alternateRowColor
                                : activeStyle.body.backgroundColor,
                            color: styles.textColor,
                            fontWeight: isHeader
                              ? (activeStyle.header.fontWeight === 'bold' ? 700 : activeStyle.header.fontWeight === 'semibold' ? 600 : 500)
                              : (cell.bold ? 700 : 400),
                            fontStyle: cell.italic ? 'italic' : 'normal',
                            fontSize: styles.fontSize === 'xs' ? '0.75rem' : styles.fontSize === 'sm' ? '0.875rem' : styles.fontSize === 'lg' ? '1.125rem' : '1rem',
                            textTransform: isHeader ? activeStyle.header.textTransform as any : 'none',
                            textAlign: cell.align,
                            verticalAlign: cell.verticalAlign,
                            padding: styles.padding,
                            borderBottom: isHeader
                              ? activeStyle.header.borderBottom
                              : activeStyle.border.cellBorders
                                ? `${activeStyle.border.width} ${activeStyle.border.style} ${activeStyle.border.color}`
                                : 'none',
                          }}
                        >
                          {cell.content}
                        </Tag>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Edit Mode */
          <div className="overflow-x-auto">
            <table className={clsx(
              'min-w-full',
              settings.showGridLines && 'border-collapse border border-gray-300'
            )}>
              <tbody>
                {tableData.rows.map((row, rowIdx) => (
                  <tr key={row.id}>
                    {row.cells.map((cell, colIdx) => (
                      <td
                        key={cell.id}
                        onClick={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                        className={clsx(
                          'relative min-w-[100px] transition-colors',
                          settings.showGridLines && 'border border-gray-300',
                          selectedCell?.row === rowIdx && selectedCell?.col === colIdx && 'ring-2 ring-teal-500',
                          cell.isHeader && 'bg-gray-100'
                        )}
                        style={{
                          backgroundColor: cell.backgroundColor,
                          textAlign: cell.align
                        }}
                      >
                        <input
                          type="text"
                          value={cell.content}
                          onChange={(e) => updateCell(rowIdx, colIdx, { content: e.target.value })}
                          className={clsx(
                            'w-full px-3 py-2 bg-transparent focus:outline-none',
                            cell.bold && 'font-bold',
                            cell.italic && 'italic'
                          )}
                          style={{ textAlign: cell.align, color: cell.textColor }}
                          placeholder={cell.isHeader ? 'Header' : 'Cell'}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t bg-gray-50 dark:bg-gray-800">
        <div className="text-sm text-gray-500">
          {tableData.rows.length} rows × {tableData.rows[0]?.cells.length || 0} columns
          {selectedCell && ` • Selected: R${selectedCell.row + 1}C${selectedCell.col + 1}`}
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100 flex items-center gap-1">
            <Download size={14} />
            Export
          </button>
          <button className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100 flex items-center gap-1">
            <Copy size={14} />
            Copy HTML
          </button>
        </div>
      </div>

      {/* Style Picker Modal */}
      <Modal
        isOpen={showStylePicker}
        onClose={() => setShowStylePicker(false)}
        title="Choose Table Style"
        size="xl"
      >
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={styleSearch}
                onChange={(e) => setStyleSearch(e.target.value)}
                placeholder="Search styles..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              {tableStyleCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={clsx(
                'px-3 py-1 rounded-full text-sm transition-colors',
                selectedCategory === 'all'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
              )}
            >
              All ({allStyles.length})
            </button>
            {tableStyleCategories.map(cat => {
              const count = allStyles.filter(s => s.category === cat.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={clsx(
                    'px-3 py-1 rounded-full text-sm transition-colors',
                    selectedCategory === cat.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                  )}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Style Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto p-1">
            {filteredStyles.map(style => (
              <StylePreviewMini
                key={style.id}
                style={style}
                isSelected={activeStyleId === style.id}
                onClick={() => handleStyleSelect(style.id)}
              />
            ))}
          </div>

          {filteredStyles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No styles found matching your search.
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleCustomizeStyle}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Sliders size={16} />
              Customize Selected
            </button>
            <button
              onClick={() => setShowStylePicker(false)}
              className="btn btn-primary"
            >
              Apply Style
            </button>
          </div>
        </div>
      </Modal>

      {/* Style Customizer */}
      {activeStyle && (
        <StyleCustomizer
          isOpen={showStyleCustomizer}
          onClose={() => setShowStyleCustomizer(false)}
          style={activeStyle}
          onSave={handleSaveCustomStyle}
        />
      )}
    </motion.div>
  );
};

export default TableEditor;
