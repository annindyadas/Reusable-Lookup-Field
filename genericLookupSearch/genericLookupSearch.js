/*
Generic Lookup Search Component
==============================
A flexible, reusable lookup component that supports searching Salesforce objects with advanced features.

CONFIGURATION PROPERTIES
----------------------
- objectApiName: API name of the Salesforce object to search (e.g., 'Account', 'Contact')
- fieldApiName: Field to use for displaying records in UI (primary display field)
- iconName: SLDS icon to use (e.g., 'standard:account', 'standard:contact')
- label: Label text displayed above the input field
- placeholder: Placeholder text for the input field
- messageWhenValueMissing: Error message when required field is empty
- isRequired: Whether the field is required (true/false)
- recordType: Developer name of record type to filter results by
- multiSelect: Enable selection of multiple records (true/false)
- showSelectedPills: Show selected records as pills below input (true/false)
- searchFields: Fields to search against in the SOQL query (comma-separated)
- additionalInfoFields: Additional fields to display under each result in dropdown (comma-separated)

FEATURES
-------
- Dynamic SOQL generation based on searchFields
- Record type filtering
- Support for both single and multi-select modes
- Three distinct display modes with SLDS-compliant styling
- Search across multiple fields
- Display additional information fields beneath each search result
- Customizable icons and labels
- Pill-based selection display with remove option
- Inline selection display for single-select mode
- Loading state and no-results messaging
- SLDS styling throughout for Salesforce UI consistency
- Responsive design with proper mobile support
- Custom event dispatching for easy integration
- Public API methods for programmatic control

DISPLAY MODES
------------
- Multi-select with pills: Allows selecting multiple records with pills displayed below the input (multiSelect = true, showSelectedPills = true)
- Single-select with pills: Shows the single selected record as a pill below the input (multiSelect = false, showSelectedPills = true)
- Single-select without pills: Shows the selected record inline within the input box (multiSelect = false, showSelectedPills = false)

PUBLIC API METHODS
----------------
- clearSelection(): Programmatically clear all selections
- getSelectedValues(): Get IDs of all selected records (comma-separated)

EVENTS
-----
- lookupselect: Fired when selection changes, with payload: { recordId: string }
  (For multi-select, recordId is a comma-separated list of IDs)
*/
import { LightningElement, api, track } from 'lwc';
import searchRecords from '@salesforce/apex/LookupSearchController.searchRecords';

export default class GenericLookupSearch extends LightningElement {
    @api objectApiName = ''; //Account - Default object API name, can be overridden
    @api primaryDisplayField = ''; // Name - Default field to use for displaying results (primary display field)
    @api iconName = ''; //standard:account
    @api label = ''; // Account
    @api placeholder = ''; //Search...
    @api messageWhenValueMissing = ''; //Complete this field.
    @api isRequired = false;
    @api recordType = ''; //Account- Default record type, can be overridden; developer name is needed here
    @api multiSelect = false; // Allow multiple selections (defaults to false)
    @api showSelectedPills = false; // Whether to show selected pills below the input
    
    @track searchTerm = '';
    @track searchResults = [];
    @track selectedRecords = []; // Array of selected records
    @track showResults = false;
    @track isSearching = false;
    @track hasRendered = false; // Track if component has been rendered

    @api additionalDisplayFields = ''; // Comma-separated list of additional fields to display in search results
    @api searchFields = ''; // Comma-separated list of fields to search against in the SOQL query
    
    // For backward compatibility with existing implementations
    @api 
    get fieldApiName() {
        return this.primaryDisplayField;
    }
    set fieldApiName(value) {
        this.primaryDisplayField = value;
    }
    
    @api 
    get additionalInfoFields() {
        return this.additionalDisplayFields;
    }
    set additionalInfoFields(value) {
        this.additionalDisplayFields = value;
    }
    
    // Getter to ensure we always have a valid search field
    get effectiveSearchFields() {
        return this.searchFields ? this.searchFields : 'Name';
    }
    // Computed properties

    get isActuallyRequired() {
        // Support both boolean true and string "true"
        return this.isRequired === true || this.isRequired === "true";
    }
    get showNoResults() {
        return !this.isSearching && this.searchResults.length === 0 && this.searchTerm.length > 1;
    }
    
    get hasSelectedRecords() {
        return this.selectedRecords && this.selectedRecords.length > 0;
    }
    
    get showPills() {
        // Support both boolean true and string "true"
        const pillsEnabled = this.showSelectedPills === true || this.showSelectedPills === "true";
        return pillsEnabled && this.hasSelectedRecords;
    }
    
    get isMultiSelect() {
        // Support both boolean true and string "true"
        return this.multiSelect === true || this.multiSelect === "true";
    }
    
    // New property to determine if we should show the selection inline in the input box
    get showInlineSelection() {
        // Show inline selection when:
        // 1. Not in multi-select mode
        // 2. Pills are not shown (showSelectedPills is false)
        // 3. Has a selected record
        return !this.isMultiSelect && 
               !(this.showSelectedPills === true || this.showSelectedPills === "true") && 
               this.selectedRecord !== null;
    }
    
    // For use with lightning-combobox to display the selected value
    get singleSelectionDisplayOption() {
        if (this.selectedRecord) {
            return [
                { label: this.selectedRecord.name, value: this.selectedRecord.id }
            ];
        }
        return [];
    }
    
    get selectedRecord() {
        // For backwards compatibility with single-select mode
        // In single-select mode, we should only ever have 0 or 1 record
        if (!this.isMultiSelect && this.selectedRecords.length > 1) {
            // Return only the first record to maintain consistency
            return this.selectedRecords[0];
        }
        return this.selectedRecords.length > 0 ? this.selectedRecords[0] : null;
    }

    handleInputChange(event) {
        // Get the search term from the input field
        this.searchTerm = event.target.value;
        
        // If the search term is empty or too short, hide results
        if (!this.searchTerm || this.searchTerm.length < 2) {
            this.searchResults = [];
            this.showResults = false;
            return;
        }
        
        // Set searching flag to show loading indicator
        this.isSearching = true;
        
        // Call Apex imperative method
        searchRecords({ 
            objectName: this.objectApiName, 
            primaryDisplayField: this.primaryDisplayField, // Field to use for display
            searchTerm: this.searchTerm,
            recordType: this.recordType,
            additionalDisplayFields: this.additionalDisplayFields, // Additional fields to display
            searchFields: this.effectiveSearchFields // Fields to search against
        })
        .then(results => {
            // Process the results to add display field and additional fields
            this.searchResults = results.map(result => {
                // Get the display value - this will access the field directly in the result object
                // For custom fields like DBG_DUNSNumber__c, they are returned with this exact casing
                let displayValue;
                
                if (this.primaryDisplayField && result.hasOwnProperty(this.primaryDisplayField)) {
                    // Use the specified field if it exists
                    displayValue = result[this.primaryDisplayField];
                } else {
                    // Fallback to Name field
                    displayValue = result.Name;
                }
                
                // Prepare additional info array if additionalDisplayFields are provided
                let additionalInfo = [];
                
                if (this.additionalDisplayFields) {
                    const fieldsArray = this.additionalDisplayFields.split(',').map(field => field.trim());
                    
                    fieldsArray.forEach(field => {
                        // Check if the field exists on the result
                        if (result[field] !== undefined && result[field] !== null) {
                            additionalInfo.push({
                                field: field,
                                value: result[field]
                            });
                        }
                    });
                }
                
                // Return the result with displayValue and additionalInfo
                return { 
                    ...result, 
                    displayValue,
                    additionalInfo: additionalInfo.length > 0 ? additionalInfo : null 
                };
            });
            
            this.showResults = true; // Always show the dropdown when we have results or when showing "no results" message
        })
        .catch(error => {
            // Handle and log errors
            console.error('Error searching records:', error);
            this.searchResults = [];
            this.showResults = true; // Keep dropdown open to show "no results" message
        })
        .finally(() => {
            this.isSearching = false;
        });
    }

    handleResultSelect(event) {
        const recordId = event.currentTarget.dataset.id;
        
        // Find the complete record with all fields from searchResults
        const fullRecord = this.searchResults.find(record => record.Id === recordId);
        
        // Create a record object with id, name, and any additional info
        const newRecord = { 
            id: recordId, 
            name: fullRecord?.displayValue || event.currentTarget.dataset.name, // displayValue comes from fieldApiName (the primary display field)
            additionalInfo: fullRecord?.additionalInfo || []
        };
        
        if (this.isMultiSelect) {
            // Check if this record is already selected
            const alreadySelected = this.selectedRecords.some(record => record.id === recordId);
            
            if (!alreadySelected) {
                // Add to the selected records array
                this.selectedRecords = [...this.selectedRecords, newRecord];
                
                // Clear the search term but keep the input focused for more selections
                this.searchTerm = '';
                this.searchResults = [];
                this.showResults = false;
                
                // Focus back on the input for more selections
                setTimeout(() => {
                    const input = this.template.querySelector('lightning-input');
                    if (input) {
                        input.focus();
                    }
                }, 10);
                
                // Dispatch event with standardized payload
                this.dispatchSelectionEvent();
            }
        } else {
            // Single select mode - ALWAYS REPLACE the previous selection
            this.selectedRecords = [newRecord];
            
            this.showResults = false;
            this.searchTerm = '';
            
            // Dispatch event with standardized payload
            this.dispatchSelectionEvent();
            
            // If we're showing selection inline, ensure that the component re-renders properly
            if (this.showInlineSelection) {
                this.hasRendered = true; // Mark as rendered to avoid reinitializing event listeners
            }
        }
    }

    handleClearSelection(event) {
        if (event) {
            // If we have a specific pill to remove (from pill click)
            const recordIdToRemove = event.currentTarget.dataset.recordId;
            
            if (recordIdToRemove) {
                if (this.isMultiSelect) {
                    // For multi-select, remove just this specific record
                    this.selectedRecords = this.selectedRecords.filter(record => record.id !== recordIdToRemove);
                } else {
                    // For single-select, always clear the whole selection
                    this.selectedRecords = [];
                }
                
                // Dispatch event with standardized payload
                this.dispatchSelectionEvent();
                return;
            }
        }
        
        // Clear all selections (for programmatic clear or when no specific pill was clicked)
        this.selectedRecords = [];
        this.searchTerm = '';
        this.searchResults = [];
        this.showResults = false;
        
        // Dispatch event with standardized payload
        this.dispatchSelectionEvent();
    }
    
    // Public API method for parent components to programmatically clear the selection
    @api
    clearSelection() {
        // Call the internal clear method without event parameter to clear all selections
        this.handleClearSelection();
    }
    
    // Public API method for parent components to get the currently selected values
    @api
    getSelectedValues() {
        // Return IDs in the same format as the event payload:
        // Single string value for single-select, comma-separated string for multi-select
        return this.selectedRecords.map(record => record.id).join(',');
    }
    
    // Debug: Add click handler to show dropdown
    handleInputFocus() {
        // If we have search results, show them when input is focused
        if (this.searchResults.length > 0) {
            this.showResults = true;
        }
    }
    
    renderedCallback() {
        if (!this.hasRendered) {
            this.hasRendered = true;
            // Component is now rendered
        }
    }
    
    // Close dropdown when clicking outside
    handleClickOutside() {
        this.showResults = false;
    }
    
    // Connect the component to document click events when inserted into the DOM
    connectedCallback() {
        // Extra safety check for single-select mode - ensure array has at most 1 item
        if (!this.isMultiSelect && this.selectedRecords.length > 1) {
            this.selectedRecords = this.selectedRecords.slice(-1);
        }
        
        this.handleClickOutsideBound = this.handleClickOutside.bind(this);
        document.addEventListener('click', this.handleClickOutsideBound);
    }
    
    // Disconnect to prevent memory leaks
    disconnectedCallback() {
        document.removeEventListener('click', this.handleClickOutsideBound);
    }
    
    // Prevent clicks inside the component from closing the dropdown
    handleContainerClick(event) {
        event.stopPropagation();
    }
    
    // Handler for clearing the inline selection (when clicking the X in the input)
    handleClearInlineSelection(event) {
        // Stop the click from bubbling to other handlers
        event.stopPropagation();
        if (event) event.preventDefault();
        
        this.selectedRecords = [];
        this.searchTerm = '';
        
        // Dispatch event with empty selection
        this.dispatchSelectionEvent();
        
        // Focus the input field
        setTimeout(() => {
            const input = this.template.querySelector('lightning-input');
            if (input) {
                input.focus();
            }
        }, 10);
    }
    
    // Handler for clicking on the input when showing inline selection
    handleInputClick(event) {
        // Clear the selection and open the search dropdown
        this.selectedRecords = [];
        this.searchTerm = '';
        
        // Focus and trigger input change to show the dropdown
        setTimeout(() => {
            const input = this.template.querySelector('lightning-input');
            if (input) {
                input.focus();
                this.handleInputChange({ target: { value: '' } });
            }
        }, 10);
    }
    
    // Method to dispatch the selection event
    dispatchSelectionEvent() {
        // Extra safety check for single-select mode
        if (!this.isMultiSelect && this.selectedRecords.length > 1) {
            // Force correction - take only the most recent item
            this.selectedRecords = [this.selectedRecords[this.selectedRecords.length - 1]];
        }
        
        // For both single-select and multi-select modes, use a comma-separated string of IDs
        const recordId = this.selectedRecords.map(record => record.id).join(',');
        
        // Keep it simple - just send the recordId(s)
        const eventDetail = {
            recordId: recordId
        };
        
        // Dispatch the event
        this.dispatchEvent(new CustomEvent('lookupselect', {
            detail: eventDetail
        }));
    }
}
