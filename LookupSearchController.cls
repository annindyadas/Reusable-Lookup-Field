public with sharing class LookupSearchController {
    /**
     * Search for records based on provided search fields and term
     * @param objectName The API name of the object to search
     * @param searchField The field to use for display (not used for searching)
     * @param searchTerm The term to search for
     * @param recordType The record type developer name to filter by (optional)
     * @param additionalFields Additional fields to include in results (comma-separated)
     * @param searchFields Required fields to search against (comma-separated)
     * @return List of matching sObjects
     */
    @AuraEnabled
    public static List<sObject> searchRecords(String objectName, String searchField, String searchTerm, String recordType, String additionalFields, String searchFields) {
        // Input validation
        if (String.isBlank(objectName) || String.isBlank(searchTerm) || String.isBlank(searchFields)) {
            return new List<sObject>();
        }
        
        try {
            // Build field list - always include Id and Name
            String fields = 'Id, Name';
            if (searchField != 'Name' && searchField != 'Id') {
                fields += ', ' + String.escapeSingleQuotes(searchField);
            }
            
            // Add additional fields if provided
            if (String.isNotBlank(additionalFields)) {
                List<String> fieldList = additionalFields.split(',');
                for (String field : fieldList) {
                    String trimmedField = field.trim();
                    if (String.isNotBlank(trimmedField)) {
                        fields += ', ' + String.escapeSingleQuotes(trimmedField);
                    }
                }
            }
            
            // Basic WHERE clause for search
            String whereClause;
            
            // Only search if searchFields is provided
            if (String.isNotBlank(searchFields)) {
                List<String> searchFieldsList = searchFields.split(',');
                List<String> searchClauses = new List<String>();
                
                for (String field : searchFieldsList) {
                    String trimmedField = field.trim();
                    if (String.isNotBlank(trimmedField)) {
                        searchClauses.add(String.escapeSingleQuotes(trimmedField) + ' LIKE \'%' + String.escapeSingleQuotes(searchTerm) + '%\'');
                    }
                }
                
                // If we have valid search fields, create the WHERE clause
                if (!searchClauses.isEmpty()) {
                    whereClause = '(' + String.join(searchClauses, ' OR ') + ')';
                } else {
                    // No valid search fields provided, return empty list
                    return new List<sObject>();
                }
            } else {
                // No search fields provided, return empty list
                return new List<sObject>();
            }
            
            // Add RecordType filter if provided
            if (String.isNotBlank(recordType)) {
                whereClause += ' AND RecordType.DeveloperName = \'' + String.escapeSingleQuotes(recordType) + '\'';
            }
            
            // Build and execute query
            String query = 'SELECT ' + fields + 
                           ' FROM ' + String.escapeSingleQuotes(objectName) + 
                           ' WHERE ' + whereClause +
                           ' ORDER BY ' + String.escapeSingleQuotes(searchField) + ' ASC LIMIT 10';
            
            System.debug('Executing SOQL query: ' + query);
            List<SObject> results = Database.query(query);
            System.debug('Returning ' + results.size() + ' records');
            return results;
        } catch (Exception e) {
            System.debug('Error in lookup search: ' + e.getMessage());
            return new List<sObject>();
        }
    }
}
