import { CAR_RENTAL, HOME_PAGE } from "../support/selectors";

class HomePage {
    elements = HOME_PAGE;
    carRentalElements = CAR_RENTAL;

    acceptCookies() {
            const maxAttempts = 3;
            let attempts = 0;
            
            const tryAcceptCookies = () => {
                attempts++; 
                cy.log(`Attempt ${attempts} of ${maxAttempts} to accept cookies`);

                return cy.get('body', { timeout: 10000}).then(($body) => {
                    const banner = $body.find(this.elements.COOKIES.ACTIVE_BANNER);
                    const acceptBtn = $body.find(this.elements.COOKIES.ACCEPT_BTN);

                    if(!banner.length || !acceptBtn.length || !acceptBtn.is(':visible')) {
                        cy.log('No visible cookie accept button found');
                        return cy.wrap(false);
                        }

                        cy.log('Cookie banner found - attempting to accept...');
                        return cy.get(this.elements.COOKIES.ACCEPT_BTN)
                        .should('be.visible')
                        .click({ force: true})
                        .then(() => {
                            return cy.get(this.elements.COOKIES.ACCEPT_BTN, { timeout: 10000})
                            .should('not.be.visible')
                            .then(() => true, () => {
                                return cy.get(this.elements.COOKIES.ACTIVE_BANNER)
                                .should('have.css', 'display', 'none')
                                .then(() => true, () => false);
                            });
                        });
                    });
            };
            const executeWithRetry = () => {
            return tryAcceptCookies()
            .then((success) => {
                if(success) { 
                    cy.log('Cookies accepted successfully');
                    return this.verifyCookiesAccepted().then(() => true);
                }
                if(attempts < maxAttempts) {
                cy.log(`Retrying... (attempt ${attempts} of ${maxAttempts})`);
                cy.wait(2000);
                return executeWithRetry();
            }
            cy.log(`Proceding without accepting cookies after ${maxAttempts} attempts`);
            cy.window.then(win => {
                const banner = win.document.querySelector('#onetrust-banner-sdk');
                if(banner) {
                    banner.style.display = 'none';
                    banner.classList.add('ot-hide');
                }
            });

                cy.log(`Failed to accept cookies after ${maxAttempts} attempts`);
                return cy.wrap(false);
            });
};
    return executeWithRetry();
}

    verifyCookiesAccepted() {
        cy.get(this.elements.COOKIES.BANNER, { timeout: 15000})
        .should('not.be.visible');

        return cy.getCookie('OptanonConsent')
            .should('exist')
            .then((cookie) => {
                if(!cookie.value.includes('granted')) {
                    cy.log('cookie exist but without "granted" flag: ', cookie.value);
                    return cy.wrap(false);
                }
                return cy.wrap(true);
            });
    }

    clickRentCarButton() {
        const selector = this.elements.NAV_TABS.CARS;

        return cy.get(selector, { timeout: 20000})
        .should('be.visible')
        .should('not.be.disabled')
        .then(($btn) => {
            const href = $btn.attr('href');
            $btn.get(0).removeAttribute('target');

            return cy.wrap($btn)
            .scrollIntoView()
            .click({ force: true, waitForAnimations: true})
            .then(() => {
                return cy.url({ timeout: 15000})
                .should('include', 'cars.vueling.com')
                .then(() => {
                    cy.wait(1000)
                    return href;
                })
            });
        });
}

acceptCarRentalCookies() {
    return cy.origin('https://cars.vueling.com' , () => {
        const acceptCookies =  (attempt = 0) => {
            if(attempt >= 3) {
                cy.log('Max attempts reached, proceeding without accepting car rental cookies');
                return;
            }

            cy.get('body', { timeout: 15000}).then(($body) => {
                const cookieButton = $body.find('[data-testid="cookieAccept"]');
                if(cookieButton.length && cookieButton.is(':visible')) {
                    cy.get('[data-testid="cookieAccept"]')
                    .should('be.visible')
                    .click({ force: true})
                    .then(() => {
                        cy.get('[data-testid="cookieAccept"]').should('not.exist');
                    });
                } else {
                    cy.wait(2000)
                    acceptCookies(attempt + 1);
                }
            });
        };
        acceptCookies();
    });
}

selectPickupLocation(location) {
    const maxAttempts = 3;
    let attempts = 0;

    const pickupButtonLocator = this.carRentalElements.SEARCH_FROM.PICKUP_LOCATION;
    const modalSelector = this.carRentalElements.SEARCH_FROM.PICKUP_MODAL;
    const searchInputSelector = this.carRentalElements.SEARCH_FROM.PICKUP_SEARCH_INPUT;
    const resultsSelector = this.carRentalElements.SEARCH_FROM.PICKUP_RESULTS;

    const trySelectPickup = () => {
        attempts++;
        cy.log(`Attempt ${attempts} of ${maxAttempts} to select pickup location`);

        return cy.get('body').then(($body) => {
            const button = $body.find(pickupButtonLocator);

            if(!button.length || !button.is(':visible')) {
            cy.log('pickup location button not found or not visible');
            return cy.wrap(false);
        }
        return cy.get(pickupButtonLocator)
        .should('be.visible')
        .click({ force: true})
        .then(() => {
            return cy.get(modalSelector, { timeout: 10000})
            .should('be.visible')
            .then(() => {
                cy.get(searchInputSelector)
                .should('be.visible')
                .type(location, { force: true});

                cy.get(resultSelector, { timeout: 10000})
                .first()
                .should('be.visible')
                .click({ force: true});

                return cy.get(pickupButtonLocator)
                .should('contain', location.split(' ')[0])
                .then(() => true);
            }, () => false);
        });
    });
};

const executeWithRetry = () => {
    return trySelectPickup().then((success) => {
        if(success) {
            cy.log('Successfully opened pickup location modal');
            return cy.wrap(true);
        }

        if(attempts < maxAttempts) {
            cy.wait(2000);
            return executeWithRetry();
        }

        cy.log(`Failed to select pickup location after ${maxAttempts} attempts`);

        cy.window().then(win => {
            const event = new win.Event('click');
            win.document.querySelector(pickupButtonLocator).dispatchEvent(event);
        });
        return cy.wrap(false);
    });
};
return executeWithRetry();
}


    navigateTo(tabName) {
        const tabKey = tabName.toUpperCase();
        const tabLocator = this.elements.NAV_TABS[tabKey];

        cy.get(tabLocator)
        .should('be.visible')
        .click({ force: true});
        return this;
    }

    setDriverAge(age) {
        cy.log(`Setting driver age to ${age}`);

        cy.get(this.carRentalElements.SEARCH_FROM.DRIVE_AGE.DROPDOWN, { timeout: 10000})
        .should('be.visible')
        .click();
    }

    searchForCar(pickupLocation, pickupDate, returnDate, driverAge) {
        cy.viewport(430, 932);

        cy.log('Filling car  search from')
        .then(() => {
            return cy.get(this.carRentalElements.SEARCH_FROM.PICKUP_SEARCH_INPUT)
            .type(pickupLocation)
            .type('{enter}');
        })
        cy.get(this.carRentalElements.SEARCH_FROM.PICKUP_LOCATION, { timeout: 15000})
        .type(pickupLocation)
        .should(`${pickupLocation}{enter}`);

        cy.get(this.carRentalElements.SEARCH_FROM.PICHUP_DATE)
        .clear()
        .type(pickupDate)
        .should('have.value', pickupDate);

        cy.get(this.carRentalElements.SEARCH_FROM.RETURN_DATE)
        .clear()
        .type(returnDate)
        .should('have.value', returnDate);

        cy.get(this.carRentalElements.SEARCH_FROM.SEARCH_BUTTON)
        .click();

        return cy.get(this.carRentalElements.CAR_LIST.SUV_FILTER)
        .should('exist');
    }

    selectInsuranceOption(insuranceType) {
        const selector = insuranceType === 'Basic'
        ? this.carRentalElements.INSURANCE_OPTIONS.BASIC_RATE
        : this.carRentalElements.INSURANCE_OPTIONS.PREMIUM_RATE;

        return cy.get(selector, { timeout: 15000})
        .should('be.visible')
        .click({ force: true})
        .then(() => this);
    }

    continueToDriverInfo() {
        return cy.get(this.carRentalElements.INSURANCE_OPTIONS.CONTINUE_BUTTON)
        .should('be.visible')
        .click({ force: true})
        .then(() => {
            return cy.url().should('include', '/driver-info');
        });
    }
    
}

export default HomePage;