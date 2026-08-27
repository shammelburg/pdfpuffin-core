import { ColumnsElement } from './columns-element.js';
import { GraphicElement } from './graphic-element.js';
import { ImageElement } from './image-element.js';
import { TableElement } from './table-element.js';
import { TextElement } from './text-element.js';
import { StackElement } from './stack-element.js';
import { InlineElement } from './inline-element.js';
import { RepeatingRegionElement } from './repeating-region-element.js';
import { RepeaterElement } from './repeater-element.js';
import { QrElement } from './qr-element.js';
import { PageBreakElement } from './page-break-element.js';

export type DocumentElement =
  | TextElement
  | InlineElement
  | StackElement
  | ColumnsElement
  | TableElement
  | ImageElement
  | QrElement
  | GraphicElement
  | RepeatingRegionElement
  | RepeaterElement
  | PageBreakElement;
export interface DocumentDatasourceParameter {
  name: string;
  queryParameter: string;
  type: string;
  required: boolean;
  defaultValue: string | number | boolean;
}
export interface DocumentDatasourceResultSet {
  parameters: Record<string, string | number | boolean>;
  data: unknown[];
}
export interface DocumentDataSource {
  id: string;
  name: string;
  description?: string;
  connector?: string;
  parameters?: DocumentDatasourceParameter[];
  schema?: { name: string; type: string; nullable: boolean }[];
  resultSets?: DocumentDatasourceResultSet[];
  data: unknown[];
}
export interface DocumentDefinition {
  status?: 'Draft' | 'Live';
  units?: 'px';
  page: {
    size: string | [number, number];
    layout?: 'portrait' | 'landscape';
    userUnit?: number;
    defaultFontSize?: number;
    margins: { top: number; right: number; bottom: number; left: number };
  };
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
  settings?: {
    compress?: boolean;
    pdfVersion?: '1.3' | '1.4' | '1.5' | '1.6' | '1.7' | '1.7ext3';
    defaultFont?: string;
    bufferPages?: boolean;
    autoFirstPage?: boolean;
    tagged?: boolean;
    language?: string;
    displayTitle?: boolean;
    subset?:
      | 'PDF/A-1'
      | 'PDF/A-1a'
      | 'PDF/A-1b'
      | 'PDF/A-2'
      | 'PDF/A-2a'
      | 'PDF/A-2b'
      | 'PDF/A-3'
      | 'PDF/A-3a'
      | 'PDF/A-3b';
    fontLayoutCache?: boolean;
    userPassword?: string;
    ownerPassword?: string;
    permissions?: {
      modifying?: boolean;
      copying?: boolean;
      annotating?: boolean;
      fillingForms?: boolean;
      contentAccessibility?: boolean;
      documentAssembly?: boolean;
      printing?: 'lowResolution' | 'highResolution';
    };
  };
  content: DocumentElement[];
  /** Persisted datasource IDs used by this template. */
  datasourceReferences?: string[];
  /** Runtime-hydrated datasource data. Omitted when the template JSON is serialized. */
  dataSources?: DocumentDataSource[];
  /** Legacy single datasource, migrated into the first named datasource by the editor. */
  data?: unknown;
}

export const DEFAULT_DOCUMENT: DocumentDefinition = {
  status: 'Draft',
  units: 'px',
  page: {
    size: 'A4',
    layout: 'portrait',
    userUnit: 1,
    defaultFontSize: 11,
    margins: { top: 0, right: 25, bottom: 0, left: 25 },
  },
  metadata: { title: 'Untitled document', creator: 'Output Documentation App' },
  settings: {
    compress: true,
    pdfVersion: '1.7',
    bufferPages: true,
    autoFirstPage: true,
    tagged: false,
    language: 'en-GB',
    displayTitle: true,
    fontLayoutCache: true,
    permissions: {},
  },
  datasourceReferences: [],
  content: [
    {
      type: 'region',
      name: 'Header',
      region: 'header',
      gap: 0,
      margins: { top: 25, right: 25, bottom: 25, left: 25 },
      elements: [
        {
          type: 'text',
          name: 'Header text',
          text: 'Document header',
          width: '100%',
          fontSize: 11,
          marginTop: 0,
          marginBottom: 0,
          color: '#6B7280',
          align: 'left',
          options: { lineBreak: false, height: 14 },
        },
      ],
    },
    {
      type: 'region',
      name: 'Footer',
      region: 'footer',
      gap: 0,
      margins: { top: 25, right: 25, bottom: 25, left: 25 },
      elements: [
        {
          type: 'text',
          name: 'Page numbers',
          text: 'Page {{pageNumber}} of {{pageCount}}',
          width: '100%',
          fontSize: 11,
          marginTop: 0,
          marginBottom: 0,
          color: '#6B7280',
          align: 'left',
          options: { lineBreak: false, height: 14 },
        },
      ],
    },
  ],
};
