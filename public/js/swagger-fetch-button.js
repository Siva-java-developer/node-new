// Custom JavaScript for Swagger UI
(function() {
    'use strict';

    // Wait for Swagger UI to load
    const waitForSwaggerUI = () => {
        if (window.SwaggerUIBundle) {
            console.log('Swagger UI loaded successfully');
            addCustomFunctionality();
        } else {
            setTimeout(waitForSwaggerUI, 100);
        }
    };

    const addCustomFunctionality = () => {
        // Add any custom functionality here
        console.log('Custom Swagger functionality loaded');
    };

    // Initialize when document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForSwaggerUI);
    } else {
        waitForSwaggerUI();
    }
})();