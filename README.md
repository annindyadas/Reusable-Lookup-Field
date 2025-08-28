
# 🔍 Generic Lookup Search LWC for Salesforce

A flexible, reusable Lightning Web Component for Salesforce that provides enhanced lookup search functionality with support for multiple display modes, additional field information, and advanced configuration options.

## ✨ Features

- **Dynamic SOQL Generation**: Automatically builds queries based on configurable search fields
- **Record Type Filtering**: Filter search results by record type
- **Multi-Select Support**: Choose between single or multiple selection modes
- **Three Display Modes**:
  - Multi-select with pills
  - Single-select with pills
  - Single-select with inline display
- **Cross-Field Search**: Search across multiple fields simultaneously
- **Dynamic field selection**: Customize primary display fields and search fields
- **Additional Field Information**: Display supplementary fields beneath search results
- **Customization Options**: Configure icons, labels, placeholders, and more
- **Rich Selection Display**: Show selections as pills or inline with easy removal
- **Loading States**: Provides visual feedback during searches
- **SLDS Compliant**: Follows Salesforce Lightning Design System patterns
- **Responsive Design**: Works on all device sizes
- **API for Programmatic Control**: Methods for clearing selections and retrieving values

## ⚙️ Configuration Properties

| Property                | Description                                                  | Default            | Required |
|------------------------|--------------------------------------------------------------|--------------------|----------|
| `objectApiName`        | API name of the Salesforce object to search                  | -                  | Yes      |
| `fieldApiName`         | Field to use for displaying records in UI                    | Name               | No       |
| `iconName`             | SLDS icon to use (e.g., 'standard:account')                  | -                  | Yes      |
| `label`                | Label text displayed above the input field                   | -                  | No       |
| `placeholder`          | Placeholder text for the input field                         | "Search..."        | No       |
| `messageWhenValueMissing` | Error message when required field is empty               | "Complete this field." | No   |
| `isRequired`           | Whether the field is required                                | false              | No       |
| `recordType`           | Developer name of record type to filter results by           | -                  | No       |
| `multiSelect`          | Enable selection of multiple records                         | false              | No       |
| `showSelectedPills`    | Show selected records as pills below input                   | false              | No       |
| `searchFields`         | Fields to search against in the SOQL query (comma-separated) | Name               | No       |
| `additionalInfoFields` | Additional fields to display under each result               | -                  | No       |

## 🖼️ Display Modes

### 1. Multi-select with Pills
- `multiSelect="true"` and `showSelectedPills="true"`
- Allows users to select multiple records
- Displays selected records as pills below the input
- Clicking a pill's "X" removes just that selection

### 2. Single-select with Pills
- `multiSelect="false"` and `showSelectedPills="true"`
- Only allows one selected record at a time
- Displays the selected record as a pill below the input
- Clicking the pill's "X" removes the selection

### 3. Single-select Inline
- `multiSelect="false"` and `showSelectedPills="false"`
- Only allows one selected record at a time
- Displays the selected record directly in the input field
- Clicking the "X" in the input removes the selection

## 📡 Events

### `lookupselect`
Fired when a selection is made or cleared.

**Event Detail Properties:**
- `recordId`: For single-select, contains the selected record ID. For multi-select, contains a comma-separated string of all selected record IDs.

## 🧪 Public Methods

### `clearSelection()`
Programmatically clears all selections.

### `getSelectedValues()`
Returns the IDs of all selected records as a comma-separated string.

## 🧩 Handling Additional Info Fields

The component supports displaying additional information fields beneath each search result. This helps users distinguish between records with similar display names. Configure this using the `additional-info-fields` attribute.

## 🎨 CSS Customization

The component uses standard SLDS classes and includes minimal custom CSS to ensure proper rendering of pills and inline selections. You can further customize the appearance through standard SLDS utility classes.

## 🌐 Browser Compatibility

Compatible with all browsers supported by Salesforce Lightning Experience.

## 📄 License

MIT License
