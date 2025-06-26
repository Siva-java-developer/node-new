/**
 * Swagger UI Enhancer - Adds functionality to fetch and populate user data in forms
 */

// Wait for Swagger UI to be fully loaded
window.addEventListener('load', function() {
    console.log('Swagger Enhancer: Page loaded, waiting for Swagger UI...');
    
    // Add a visible indicator and manual activation button
    const indicatorContainer = document.createElement('div');
    indicatorContainer.style.position = 'fixed';
    indicatorContainer.style.bottom = '10px';
    indicatorContainer.style.right = '10px';
    indicatorContainer.style.display = 'flex';
    indicatorContainer.style.flexDirection = 'column';
    indicatorContainer.style.gap = '5px';
    indicatorContainer.style.zIndex = '9999';
    
    // Status indicator
    const indicator = document.createElement('div');
    indicator.style.padding = '5px 10px';
    indicator.style.backgroundColor = '#4CAF50';
    indicator.style.color = 'white';
    indicator.style.borderRadius = '4px';
    indicator.style.fontSize = '12px';
    indicator.style.textAlign = 'center';
    indicator.textContent = 'Enhancer Active';
    
    // Manual activation button
    const activateButton = document.createElement('button');
    activateButton.style.padding = '5px 10px';
    activateButton.style.backgroundColor = '#2196F3';
    activateButton.style.color = 'white';
    activateButton.style.border = 'none';
    activateButton.style.borderRadius = '4px';
    activateButton.style.fontSize = '12px';
    activateButton.style.cursor = 'pointer';
    activateButton.textContent = 'Add Fetch Buttons';
    activateButton.onclick = function() {
        enhanceSwaggerUI();
        showNotification('Manually adding fetch buttons...', 'info');
    };
    
    // Add elements to container
    indicatorContainer.appendChild(indicator);
    indicatorContainer.appendChild(activateButton);
    document.body.appendChild(indicatorContainer);
    
    // Check periodically if Swagger UI is loaded
    const checkInterval = setInterval(function() {
        if (window.ui && document.querySelector('.swagger-ui')) {
            console.log('Swagger Enhancer: Swagger UI detected, enhancing...');
            clearInterval(checkInterval);
            enhanceSwaggerUI();
            
            // Update indicator
            indicator.textContent = 'Enhancer Running';
            indicator.style.backgroundColor = '#2196F3';
            
            // Add a direct button to add fetch buttons to all PUT operations
            const directButton = document.createElement('button');
            directButton.style.position = 'fixed';
            directButton.style.top = '70px';
            directButton.style.right = '20px';
            directButton.style.padding = '8px 15px';
            directButton.style.backgroundColor = '#f5a623';
            directButton.style.color = 'white';
            directButton.style.border = 'none';
            directButton.style.borderRadius = '4px';
            directButton.style.fontSize = '14px';
            directButton.style.fontWeight = 'bold';
            directButton.style.cursor = 'pointer';
            directButton.style.zIndex = '9999';
            directButton.textContent = 'ðŸ” Add Fetch User Data Buttons';
            directButton.onclick = function() {
                // Find all PUT operations and add fetch buttons
                const operations = document.querySelectorAll('.opblock');
                operations.forEach(op => {
                    const method = op.querySelector('.opblock-summary-method')?.textContent || '';
                    if (method.includes('PUT')) {
                        processOperation(op);
                    }
                });
                showNotification('Added fetch buttons to all PUT operations', 'info');
            };
            document.body.appendChild(directButton);
        }
    }, 1000);
});

// Function to show notifications
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('swagger-enhancer-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'swagger-enhancer-notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '9999';
        notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        document.body.appendChild(notification);
    }
    
    // Set notification style based on type
    switch (type) {
        case 'error':
            notification.style.backgroundColor = '#f44336';
            notification.style.color = 'white';
            break;
        case 'info':
            notification.style.backgroundColor = '#2196F3';
            notification.style.color = 'white';
            break;
        default:
            notification.style.backgroundColor = '#4CAF50';
            notification.style.color = 'white';
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.style.opacity = '1';
    
    // Hide notification after 3 seconds
    setTimeout(function() {
        notification.style.opacity = '0';
    }, 3000);
}

// Main function to enhance Swagger UI
function enhanceSwaggerUI() {
    console.log('Swagger Enhancer: Starting enhancement...');
    
    // Add CSS for the fetch button
    const style = document.createElement('style');
    style.textContent = `
        .fetch-user-btn {
            background-color: #f5a623;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 10px;
        }
        .fetch-user-btn:hover {
            background-color: #e09612;
        }
    `;
    document.head.appendChild(style);
    
    // Function to add fetch button to user update endpoint
    function addFetchButtonToUserUpdate() {
        console.log('Swagger Enhancer: Looking for user update endpoint...');
        
        // Find all operations in Swagger UI
        const operations = document.querySelectorAll('.opblock');
        console.log(`Swagger Enhancer: Found ${operations.length} operations`);
        
        // Add a debug message for each operation
        operations.forEach((op, index) => {
            console.log(`Operation ${index}: id=${op.id}, className=${op.className}, path=${op.querySelector('.opblock-summary-path')?.textContent}`);
        });
        
        // First try to find by path text
        const allOperations = Array.from(operations);
        const updateUserOp = allOperations.find(op => {
            const pathText = op.querySelector('.opblock-summary-path')?.textContent || '';
            const methodText = op.querySelector('.opblock-summary-method')?.textContent || '';
            return methodText.includes('PUT') && pathText.includes('/user/') && pathText.includes('{id}');
        });
        
        if (updateUserOp) {
            console.log('Swagger Enhancer: Found user update endpoint by path text');
            processOperation(updateUserOp);
            return;
        }
        
        // If not found by path, try by operation ID
        operations.forEach(operation => {
            // Check if this is the PUT user endpoint
            const operationId = operation.id || '';
            console.log(`Swagger Enhancer: Checking operation: ${operationId}`);
            
            if ((operationId.includes('put') || operationId.includes('PUT')) && 
                (operationId.includes('user') || operationId.includes('User')) && 
                (operationId.includes('id') || operationId.includes('Id'))) {
                
                console.log('Swagger Enhancer: Found user update endpoint by ID');
                processOperation(operation);
            }
        });
        
        // If we still haven't found it, try a more aggressive approach
        if (!document.querySelector('.fetch-user-btn')) {
            console.log('Swagger Enhancer: Trying aggressive approach to find update endpoint');
            
            // Look for any PUT operation
            const putOperations = Array.from(operations).filter(op => {
                const method = op.querySelector('.opblock-summary-method')?.textContent || '';
                return method.includes('PUT');
            });
            
            console.log(`Swagger Enhancer: Found ${putOperations.length} PUT operations`);
            
            // Process each PUT operation
            putOperations.forEach(op => {
                console.log('Swagger Enhancer: Processing PUT operation as potential user update');
                processOperation(op);
            });
        }
    }
    
    // Function to process an operation and add the fetch button
    function processOperation(operation) {
        console.log('Swagger Enhancer: Processing operation:', operation.id);
        
        // Check if the operation is expanded
        const isExpanded = operation.classList.contains('is-open');
        if (!isExpanded) {
            // Click to expand the operation
            const summaryEl = operation.querySelector('.opblock-summary');
            if (summaryEl) {
                console.log('Swagger Enhancer: Expanding operation...');
                summaryEl.click();
            }
        }
        
        // Wait for operation to expand
        setTimeout(() => {
            // Click "Try it out" button if it exists and hasn't been clicked
            const tryItOutBtn = operation.querySelector('.try-out__btn');
            if (tryItOutBtn && tryItOutBtn.textContent.includes('Try it out')) {
                console.log('Swagger Enhancer: Clicking "Try it out" button...');
                tryItOutBtn.click();
            }
            
            // Wait for the form to be interactive
            setTimeout(() => {
                // Find the ID parameter input
                let idInput = null;
                
                // Try different methods to find the ID input
                const paramRows = operation.querySelectorAll('.parameters-row');
                for (const row of paramRows) {
                    const label = row.querySelector('.parameters-col_name')?.textContent || '';
                    if (label.toLowerCase().includes('id')) {
                        idInput = row.querySelector('.parameters-col_description input');
                        if (idInput) {
                            console.log('Swagger Enhancer: Found ID input by label');
                            break;
                        }
                    }
                }
                
                // If not found by label, try by placeholder
                if (!idInput) {
                    idInput = operation.querySelector('.parameters input[placeholder*="id"], .parameters input[placeholder*="ID"]');
                    if (idInput) {
                        console.log('Swagger Enhancer: Found ID input by placeholder');
                    }
                }
                
                // If still not found, try any input in the parameters section
                if (!idInput) {
                    const inputs = operation.querySelectorAll('.parameters input');
                    if (inputs.length > 0) {
                        // Assume the first input might be the ID
                        idInput = inputs[0];
                        console.log('Swagger Enhancer: Using first input as potential ID input');
                    }
                }
                
                if (idInput) {
                    console.log('Swagger Enhancer: Adding fetch button...');
                    
                    // Check if button already exists
                    const existingBtn = idInput.parentNode.querySelector('.fetch-user-btn');
                    if (existingBtn) {
                        console.log('Swagger Enhancer: Fetch button already exists');
                        return;
                    }
                    
                    // Create fetch button
                    const fetchButton = document.createElement('button');
                    fetchButton.className = 'fetch-user-btn';
                    fetchButton.textContent = 'Fetch User Data';
                    fetchButton.type = 'button'; // Prevent form submission
                    
                    // Add button next to ID input
                    idInput.parentNode.appendChild(fetchButton);
                    
                    // Add click handler to fetch button
                    fetchButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        fetchUserData(operation, idInput);
                    });
                } else {
                    console.log('Swagger Enhancer: Could not find ID input');
                }
            }, 500);
        }, 500);
    }
    
    // Function to fetch user data and populate form
    async function fetchUserData(operation, idInput) {
        console.log('Swagger Enhancer: Fetching user data...');
        
        const userId = idInput.value.trim();
        if (!userId) {
            showNotification('Please enter a User ID first', 'error');
            return;
        }
        
        // Get authentication token
        let token = '';
        
        // Try to get token from Swagger UI auth
        const authElement = document.querySelector('.auth-wrapper .authorize');
        if (authElement) {
            // Click auth button to check current auth status
            authElement.click();
            
            // Look for token in the auth popup
            setTimeout(() => {
                const tokenInputs = document.querySelectorAll('.auth-container input');
                tokenInputs.forEach(input => {
                    const val = input.value || '';
                    if (val.startsWith('Bearer ')) {
                        token = val.replace('Bearer ', '');
                    }
                });
                
                // Close the auth popup
                const closeBtn = document.querySelector('.auth-btn-wrapper .btn-done');
                if (closeBtn) closeBtn.click();
                
                // Continue with the fetch
                continueWithFetch(token);
            }, 300);
        } else {
            // If no auth element, try localStorage
            token = localStorage.getItem('api_token') || '';
            continueWithFetch(token);
        }
        
        async function continueWithFetch(token) {
            if (!token) {
                showNotification('Please authorize first to get an authentication token', 'error');
                return;
            }
            
            try {
                showNotification('Fetching user data...', 'info');
                
                // Make API request to get user data
                const response = await fetch(`/v1/user/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Swagger Enhancer: Error response:', errorText);
                    throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
                }
                
                const userData = await response.json();
                console.log('Swagger Enhancer: User data received:', userData);
                
                // Extract user data object
                const userObj = userData.data || userData;
                if (!userObj) {
                    throw new Error('No user data found in response');
                }
                
                // Find all form inputs
                const formInputs = operation.querySelectorAll('.parameters-row');
                console.log(`Swagger Enhancer: Found ${formInputs.length} parameter rows`);
                
                // Map of field names to input elements
                const fieldMap = {};
                
                // Process each parameter row
                formInputs.forEach(row => {
                    const label = row.querySelector('.parameters-col_name')?.textContent?.trim() || '';
                    const input = row.querySelector('.parameters-col_description input, .parameters-col_description select, .parameters-col_description textarea');
                    
                    if (input && label && label !== 'id') {
                        // Clean up label to match field name
                        const fieldName = label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                        
                        // Map common field variations
                        const fieldMappings = {
                            'firstname': 'firstName',
                            'lastname': 'lastName',
                            'username': 'username',
                            'email': 'email',
                            'age': 'age',
                            'gender': 'gender',
                            'mobilenumber': 'mobileNumber',
                            'role': 'role',
                            'class': 'class',
                            'syllabus': 'syllabus'
                        };
                        
                        // Find matching field
                        Object.keys(fieldMappings).forEach(key => {
                            if (fieldName.includes(key)) {
                                const apiField = fieldMappings[key];
                                fieldMap[apiField] = input;
                                console.log(`Swagger Enhancer: Mapped ${apiField} to input with label ${label}`);
                            }
                        });
                    }
                });
                
                // Populate form fields
                let fieldsPopulated = 0;
                Object.keys(fieldMap).forEach(field => {
                    if (userObj[field] !== undefined && userObj[field] !== null) {
                        fieldMap[field].value = userObj[field];
                        
                        // Trigger change event
                        const event = new Event('change', { bubbles: true });
                        fieldMap[field].dispatchEvent(event);
                        
                        fieldsPopulated++;
                        console.log(`Swagger Enhancer: Set ${field} = ${userObj[field]}`);
                    }
                });
                
                showNotification(`User data loaded successfully! Populated ${fieldsPopulated} fields.`, 'success');
                
            } catch (error) {
                console.error('Swagger Enhancer: Error:', error);
                showNotification(`Error: ${error.message}`, 'error');
            }
        }
    }
    
    // Initial enhancement
    addFetchButtonToUserUpdate();
    
    // Re-check periodically for dynamic content
    setInterval(addFetchButtonToUserUpdate, 5000);
    
    console.log('Swagger Enhancer: Enhancement complete');
}
