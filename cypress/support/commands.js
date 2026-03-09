import HomePage from "../pages/HomePage";
import { CAR_RENTAL } from "./selectors";

Cypress.Commands.add('forceCleanCookies', () => {
    cy.log(`Cleaning all cookies, storage and session data`);
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();

    cy.window().then((win) => {
        const domains = ['.vueling.com', 'vueling.com', 'cars.vueling.com'];
        domains.forEach(domain => { 
            const cookies = win.document.cookie.split('; ');
            cookies.forEach(cookie => {
                const [name] = cookie.split('=');
                 win.document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}; path=/`;
            });
        });
    });

    cy.task('clearHardcodedCookies', null, { timeout: 10000});
});

Cypress.Commands.add('blockTrackingRequests', () => {
    const blockedDomains = Cypress.env('blockedDomains') || [
        'cookies-cdn.cookiepro.com',
        'optanon.blob.core.windows.net',
        'go-mpulse.net',
        'quantummetric.com'
    ];
        
     blockedDomains.forEach(domain => {
         cy.intercept({
            method: 'ANY',
             hostname: domain
     }, { statusCode: 204 }).as(`blocked_${domain.replace(/\./g, '_')}`);
    });
});

Cypress.Commands.add('waitForPageLoad', () => {
    cy.document().should((doc) => {
        expect(doc.readyState).to.equal('complete');
    });
    cy.get('body').should('be.visible');
});

Cypress.Commands.add('retryOperation', {prevSubject: 'optional'},  (subject, operation, options = {}) => {
    const { delay = 1000, maxAttempts = 3 } = options;
    let attempts = 0;

    const tryOperation = () => {
        attempts++;
        return operation(subject).then((result) => {
            if(result === false && attempts < maxAttempts) {
                cy.wait(delay);
                return tryOperation();
            }
            return result;
        });
    };

    return tryOperation();
});

Cypress.Commands.add('waitForAny', (selectors, options = {}) => {
    const selectorText = selectors.join(', ');
    const timeout = options.timeout || Cypress.config('defaultCommandTimeout');
    const start = Date.now();

    return new Cypress.Promise((resolve, reject) => {
        function trySelectors() {
            cy.get('body').then(($body) => {
                const found = selectors.find(selectors => $body.find(selectors).length > 0);

                if(found) {
                    cy.log(`Found element with selector: ${found}`);
                    resolve(cy.get(found, options));
                }else if (Date.now() - start > timeout) {
                    reject(new Error(`Timed out waiting for any of: ${selectorText}`));
                } else {
                    setTimeout(trySelectors, 200);
                }
            });
        }
        trySelectors();
    });
});
