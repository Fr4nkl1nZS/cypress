// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

const ignoredErrorPatterns = [
            /expecting a function but got/,
            /ResizeObserver loop limit exceeded/,
            /Script error\.?/,
            /Failed to fetch/,
            /Loading chunk \d+ failed/
        ];

Cypress.on('uncaught:exception', (err) => {
        return !ignoredErrorPatterns.some(pattern => pattern.test(err.message));
      });



