# 📘 n8n-nodes-xano — Custom Node Documentation

A community-contributed **n8n integration** for [Xano](https://www.xano.com/), enabling workflow automation through custom API actions like managing rows, fetching table schemas, and more.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#supported_operationss)  
[Credentials](#credentials)  <!-- delete if no auth needed -->  
[Compatibility](#compatibility)  
[Usage](#usage)  <!-- delete if not using this section -->  
[Resources](#resources)  
[Version history](#version-history)  <!-- delete if not using this section -->  

---

## 📁 Folder Structure Overview

```

n8n-nodes-xano/
├── assets/                  # Any assets (like SVG logos)
├── credentials/             # Credential definitions for Xano
├── dist/                    # Output from the build process (compiled JS)
├── node\_modules/            # Local dependencies
├── nodes/
│   └── Xano/
│       ├── descriptions/    # UI property definitions for operations
│       ├── execute/         # Implementation of the operations logic
│       ├── methods/         # Load option methods for dropdowns
│       └── utils/           # Utilities like API client, error handling
├── .babelrc                 # Babel config for transpiling TS to JS
├── .editorconfig            # Editor formatting config
├── .eslintrc.js             # ESLint configuration
├── .eslintrc.prepublish.js  # Prepublish lint rules
├── .eslintignore            # Files ignored by ESLint
├── .gitignore               # Files ignored by Git
├── gulpfile.js              # Gulp tasks (e.g., strip console logs)
├── package.json             # Node metadata and build scripts

```

## 🔧 Supported Operations

| Action                   | Value (operation)     | Description                              |
| ------------------------ | --------------------- | ---------------------------------------- |
| ✅ Create Row            | `createRow`           | Create a new row in a selected table     |
| ✅ Update Row            | `updateRow`           | Update a row with specific field values  |
| ✅ Delete Single Content | `deleteSingleContent` | Delete a single row by ID                |
| ✅ Get a Row             | `getSingleContent`    | Fetch a row by ID                        |
| ✅ Get Many Rows         | `getTableContent`     | Fetch multiple rows with pagination      |
| ✅ Create Bulk Rows      | `bulkCreateContent`   | Insert multiple rows                     |
| ✅ Update Bulk Rows      | `bulkUpdateContent`   | Bulk update multiple records             |
| ✅ Search Rows           | `searchRow`           | Search using filter queries (JSON input) |

---

## 🧱 Folder Purpose Breakdown

### `nodes/Xano/descriptions/`

Defines UI properties (`INodeProperties[]`) for dropdowns and inputs.

- `FieldProperties.ts`
- `OperationProperties.ts`
- `ResourceProperties.ts`
- `Workspace.ts`

### `nodes/Xano/execute/`

Implements the logic for operations.

- `TableOperations.ts` → CRUD/search actions
- `XanoExecute.ts` → Dispatcher for operations

### `nodes/Xano/methods/`

Load data dynamically into dropdowns.

- `XanoLoadOptions.ts` → Methods like `getWorkspaces`, `getTables`, `getTableFields`

### `nodes/Xano/utils/`

Common utilities and services.

- `XanoApiClient.ts` → Handles auth and HTTP requests
- `ErrorHandler.ts` → Maps errors to user-friendly messages
- `types.d.ts` → Type definitions (e.g., search query types)

---

## 🔎 Key Features & Highlights

✅ Supports JSON-based search input (via `searchItemsJson`)
✅ Dynamic dropdowns for workspaces, tables, fields
✅ Friendly error messages for Xano error codes
✅ Alphabetized dropdowns for lint compatibility
✅ Console logs removed from final build (via Gulp)
✅ Type-safe field inputs and structure

---

## 📚 Best Practices Followed

✅ Modular feature-based file organization
✅ Uses `typeOptions.loadOptionsMethod` for dynamic UI
✅ Handles errors with HTTP status awareness
✅ `searchRow` supports JSON arrays for flexible filters
✅ Field dropdowns exclude "id" from required fields
✅ Compatible with n8n's custom extensions framework

---
