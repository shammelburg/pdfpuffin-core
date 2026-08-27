# pdfpuffin-core

Shared document-definition contracts and PDFKit rendering logic for the PDF Puffin app and API.

## Public API

```ts
import {
  calculateRepeatingRegionMargins,
  parseDocumentDefinition,
  renderDocument,
  type DocumentDefinition,
} from 'pdfpuffin-core';
```

The package owns environment-independent models and renderers. Browser Blob handling, Angular
editor behaviour, HTTP responses, persistence, and application fixture data remain in their
respective applications.

## Local development

The app and API reference this repository through `file:../pdfpuffin-core`. Run `npm install`
in a consumer after changing package metadata. Source changes require `npm run build` here; use
`npm run build -- --watch` while developing across repositories.

Run `npm test` before publishing or updating consumers to a released package version.
