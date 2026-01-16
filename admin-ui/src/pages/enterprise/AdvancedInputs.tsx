/**
 * RustPress Advanced Inputs Demo
 * Showcases specialized input components (73-80)
 */

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Palette,
  Code,
  PenTool,
  Eye,
  Copy,
  Download,
  X,
  Check,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  Badge,
  EnhancedDatePicker,
  Calendar as CalendarComponent,
  MiniCalendar,
  TimePicker,
  TimeInput,
  TimeSlots,
  ClockFace,
  ColorPicker,
  ColorSpectrum,
  ColorSwatches,
  GradientPicker,
  CodeEditor,
  CodeEditorBlock,
  Signature,
  SignaturePad,
  Initials,
  staggerContainer,
  fadeInUp,
} from '../../design-system';

// ============================================================================
// DatePicker Demo (73)
// ============================================================================

function DatePickerDemo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [inlineDate, setInlineDate] = useState<Date | null>(new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Standard Date Picker</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Click the input to open a calendar dropdown for date selection.
        </p>
        <EnhancedDatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          placeholder="Select a date..."
        />
        {selectedDate && (
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Selected: {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Inline Calendar</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Always-visible calendar for direct date selection.
        </p>
        <div className="flex gap-8">
          <CalendarComponent
            value={inlineDate}
            onChange={setInlineDate}
            showWeekNumbers
          />
          <div className="space-y-2">
            <MiniCalendar
              value={inlineDate}
              onChange={setInlineDate}
            />
            <p className="text-xs text-neutral-500">Mini Calendar</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">With Constraints</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Date picker with min/max date constraints (past dates disabled).
        </p>
        <EnhancedDatePicker
          value={rangeStart}
          onChange={setRangeStart}
          minDate={new Date()}
          placeholder="Select future date..."
        />
      </div>
    </div>
  );
}

// ============================================================================
// TimePicker Demo (74)
// ============================================================================

function TimePickerDemo() {
  const [time12, setTime12] = useState<{ hours: number; minutes: number; seconds?: number } | null>(null);
  const [time24, setTime24] = useState<{ hours: number; minutes: number; seconds?: number } | null>({ hours: 14, minutes: 30 });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00',
  ];

  const disabledSlots = ['10:30', '13:00', '13:30', '15:00'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-3">12-Hour Format</h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Time picker with AM/PM toggle.
          </p>
          <TimePicker
            value={time12}
            onChange={setTime12}
            format="12"
            showSeconds={false}
          />
          {time12 && (
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Selected: {time12.hours % 12 || 12}:{time12.minutes.toString().padStart(2, '0')} {time12.hours >= 12 ? 'PM' : 'AM'}
            </p>
          )}
        </div>

        <div>
          <h4 className="font-medium text-neutral-900 dark:text-white mb-3">24-Hour Format</h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Military time format with seconds.
          </p>
          <TimePicker
            value={time24}
            onChange={setTime24}
            format="24"
            showSeconds
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Time Slots</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Pre-defined time slots for appointment scheduling. Some slots are disabled.
        </p>
        <TimeSlots
          slots={timeSlots}
          selectedSlot={selectedSlot}
          onSelect={setSelectedSlot}
          disabledSlots={disabledSlots}
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Clock Face</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Visual clock face for intuitive time selection.
        </p>
        <ClockFace
          value={time24}
          onChange={setTime24}
        />
      </div>
    </div>
  );
}

// ============================================================================
// ColorPicker Demo (76)
// ============================================================================

function ColorPickerDemo() {
  const [color, setColor] = useState<{ hex: string; rgb: { r: number; g: number; b: number }; hsl: { h: number; s: number; l: number }; alpha: number }>({
    hex: '#3b82f6',
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 },
    alpha: 1,
  });

  const [swatchColor, setSwatchColor] = useState('#ef4444');
  const [gradientStops, setGradientStops] = useState([
    { color: '#3b82f6', position: 0 },
    { color: '#8b5cf6', position: 50 },
    { color: '#ec4899', position: 100 },
  ]);

  const presetColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  ];

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Full Color Picker</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Complete color picker with spectrum, hue slider, alpha control, and format inputs.
        </p>
        <div className="flex gap-8">
          <ColorPicker
            value={color}
            onChange={setColor}
            showAlpha
            showInputs
          />
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Preview</p>
              <div
                className="w-32 h-32 rounded-lg border border-neutral-200 dark:border-neutral-700"
                style={{ backgroundColor: `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.alpha})` }}
              />
            </div>
            <div className="text-sm space-y-1">
              <p><span className="text-neutral-500">HEX:</span> {color.hex}</p>
              <p><span className="text-neutral-500">RGB:</span> {color.rgb.r}, {color.rgb.g}, {color.rgb.b}</p>
              <p><span className="text-neutral-500">HSL:</span> {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%</p>
              <p><span className="text-neutral-500">Alpha:</span> {(color.alpha * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Color Swatches</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Quick selection from preset color palette.
        </p>
        <ColorSwatches
          colors={presetColors}
          selectedColor={swatchColor}
          onSelect={setSwatchColor}
        />
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-neutral-500">Selected:</span>
          <div
            className="w-6 h-6 rounded border border-neutral-200 dark:border-neutral-700"
            style={{ backgroundColor: swatchColor }}
          />
          <span className="text-sm font-mono">{swatchColor}</span>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Gradient Builder</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Create linear gradients with multiple color stops.
        </p>
        <GradientPicker
          stops={gradientStops}
          onChange={setGradientStops}
        />
        <div className="mt-4">
          <p className="text-sm text-neutral-500 mb-2">Preview:</p>
          <div
            className="h-16 rounded-lg border border-neutral-200 dark:border-neutral-700"
            style={{
              background: `linear-gradient(90deg, ${gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')})`,
            }}
          />
          <p className="mt-2 text-xs font-mono text-neutral-500">
            linear-gradient(90deg, {gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')})
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CodeEditor Demo (79)
// ============================================================================

function CodeEditorDemo() {
  const [jsCode, setJsCode] = useState(`// RustPress API Example
async function fetchPosts(params) {
  const response = await fetch('/api/posts', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${getToken()}\`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
}

// Usage
const posts = await fetchPosts({ limit: 10 });
console.log('Loaded posts:', posts);`);

  const [rustCode, setRustCode] = useState(`// Rust async handler example
use actix_web::{web, HttpResponse, Result};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Post {
    id: u64,
    title: String,
    content: String,
    published: bool,
}

async fn get_posts(
    pool: web::Data<DbPool>,
) -> Result<HttpResponse> {
    let posts = web::block(move || {
        let conn = pool.get()?;
        posts::table.load::<Post>(&conn)
    })
    .await?;

    Ok(HttpResponse::Ok().json(posts))
}`);

  const [cssCode] = useState(`.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.button-primary {
  background-color: var(--primary-500);
  color: white;
}

.button-primary:hover {
  background-color: var(--primary-600);
}`);

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">JavaScript Editor</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Editable code editor with syntax highlighting and line numbers.
        </p>
        <CodeEditor
          value={jsCode}
          onChange={setJsCode}
          language="javascript"
          showLineNumbers
          editable
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Rust Code Block</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Read-only code block with copy and download actions.
        </p>
        <CodeEditorBlock
          code={rustCode}
          language="rust"
          showLineNumbers
          showCopyButton
          showDownloadButton
          filename="handler.rs"
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">CSS Code Block</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Compact code display for smaller snippets.
        </p>
        <CodeEditorBlock
          code={cssCode}
          language="css"
          showLineNumbers
          showCopyButton
          maxHeight="200px"
        />
      </div>
    </div>
  );
}

// ============================================================================
// Signature Demo (80)
// ============================================================================

function SignatureDemo() {
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [initialsData, setInitialsData] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Signature Pad</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Draw your signature using mouse or touch. Supports undo, clear, and export.
        </p>
        <SignaturePad
          onSave={setSignatureData}
          strokeColor="#1e40af"
          strokeWidth={2}
          backgroundColor="#fafafa"
        />
        {signatureData && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Saved Signature:</p>
            <img
              src={signatureData}
              alt="Signature"
              className="border border-neutral-200 dark:border-neutral-700 rounded-lg max-w-xs"
            />
          </div>
        )}
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Initials</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Compact pad for initials, commonly used for document agreements.
        </p>
        <Initials
          onSave={setInitialsData}
          width={150}
          height={80}
        />
        {initialsData && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Saved Initials:</p>
            <img
              src={initialsData}
              alt="Initials"
              className="border border-neutral-200 dark:border-neutral-700 rounded-lg"
            />
          </div>
        )}
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Full Signature Component</h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Complete signature capture with typed name option and legal agreement.
        </p>
        <Signature
          label="Sign to agree to terms"
          required
          agreement="By signing, you agree to our Terms of Service and Privacy Policy."
          onSignatureChange={(data) => console.log('Signature changed:', data)}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export function AdvancedInputs() {
  const components = [
    { id: 'datepicker', label: 'DatePicker', icon: Calendar, number: 73 },
    { id: 'timepicker', label: 'TimePicker', icon: Clock, number: 74 },
    { id: 'colorpicker', label: 'ColorPicker', icon: Palette, number: 76 },
    { id: 'codeeditor', label: 'CodeEditor', icon: Code, number: 79 },
    { id: 'signature', label: 'Signature', icon: PenTool, number: 80 },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Page Header */}
      <PageHeader
        title="Advanced Inputs Demo"
        description="Specialized input components for dates, times, colors, code, and signatures (73-80)"
      />

      {/* Feature highlights */}
      <motion.div variants={fadeInUp} className="grid grid-cols-5 gap-4">
        {[
          { label: 'DatePicker', desc: 'Calendar selection', num: 73 },
          { label: 'TimePicker', desc: 'Time selection', num: 74 },
          { label: 'ColorPicker', desc: 'Color & gradients', num: 76 },
          { label: 'CodeEditor', desc: 'Syntax highlighting', num: 79 },
          { label: 'Signature', desc: 'Digital signatures', num: 80 },
        ].map((feature) => (
          <div
            key={feature.label}
            className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                {feature.label}
              </h3>
              <Badge variant="secondary" size="sm">#{feature.num}</Badge>
            </div>
            <p className="text-sm text-neutral-500">{feature.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Note about existing components */}
      <motion.div variants={fadeInUp}>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Components #75 (DateRangePicker), #77 (FileUpload), and #78 (RichTextEditor)
            already existed in the design system. See the <a href="#" className="underline">Advanced Forms</a> demo for those components.
          </p>
        </div>
      </motion.div>

      {/* Tabbed demos */}
      <motion.div variants={fadeInUp}>
        <Card>
          <Tabs defaultValue="datepicker">
            <CardHeader>
              <TabList>
                {components.map((comp) => (
                  <Tab key={comp.id} value={comp.id}>
                    <comp.icon className="w-4 h-4 mr-2" />
                    {comp.label}
                    <Badge variant="secondary" size="sm" className="ml-2">
                      {comp.number}
                    </Badge>
                  </Tab>
                ))}
              </TabList>
            </CardHeader>
            <CardBody className="min-h-[500px]">
              <TabPanels>
                <TabPanel value="datepicker">
                  <DatePickerDemo />
                </TabPanel>
                <TabPanel value="timepicker">
                  <TimePickerDemo />
                </TabPanel>
                <TabPanel value="colorpicker">
                  <ColorPickerDemo />
                </TabPanel>
                <TabPanel value="codeeditor">
                  <CodeEditorDemo />
                </TabPanel>
                <TabPanel value="signature">
                  <SignatureDemo />
                </TabPanel>
              </TabPanels>
            </CardBody>
          </Tabs>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default AdvancedInputs;
