import timeout from "studio/src/plugin/timeout";
import { CAR_RENTAL } from "../support/selectors";

export default class CarRentalPage {
    elements = CAR_RENTAL;

    selectDate(daysToAdd, isStartDate = true) {
        const dateType = isStartDate ? 'pickup' : 'end';
        cy.log(`Selecting date (${dateType}) ${daysToAdd + 1} days after from first available`)

        return this.openDatePicker(isStartDate)
        .then(() => this.validateCalendarVisible())
        .then(() => this.selectAvailableDay(daysToAdd))
        .then((dayNumber) => { 
            cy.log(`Date ${dateType} selected: day ${dayNumber}`);
            return dayNumber;
        });
    }

    openDatePicker(isStartDate) {
        const selector = isStartDate 
        ? '[is-active*="start"]' 
        : '.ct-landing-page__calendar--return-header--label';
        return cy.get(selector, { timeout: 20000})
        .should('be.visible')
        .click({ force: true})
        .then(() => cy.wait(1500));
    }

    validateCalendarVisible() {
        return cy.get('#select-dates > .ct-slide-panel > .ct-slide-panel__content', { timeout: 20000})
        .should(($el) => {
            const styles = window.getComputedStyle($el[0]);
            expect(styles.visibility).to.equal('visible');
            expect(styles.opacity).to.equal('1');
            expect(styles.display).not.to.equal('none');
        });
    }

    selectAvailableDay(dayIndex = 0) {
        return cy.get(':nth-child(1) > .ct-datepicker-month', { timeout: 20000 })
        .should('be.visible')
        .and(($el) => {
            expect($el.css('opacity')).to.equal('1');
            expect($el.css('display')).not.to.equal('none');
        })
        .should('be.visible')
        .then(() => {
            return cy.get(':nth-child(1) > .ct-datepicker-month', { timeout: 20000 })
                .should('be.visible')
                .and('not.have.css', 'visibility', 'hidden')
                .then(() => {
                    const availableDays = '[id^="day"]:not(.ct-disable) > span';
                    
                    return cy.get(availableDays, { timeout: 30000 })
                        .filter(':visible')
                        .should('have.length.gt', dayIndex)
                        .then(($days) => {
                            const targetDay = $days.eq(dayIndex);
                            const dayNumber = targetDay.text().trim();

                            return cy.wrap(targetDay)
                                .should('not.have.class', 'ct-disable')
                                .should('not.have.attr', 'aria-disabled', 'true')
                                .scrollIntoView({ offset: { top: -100, left: 0 } })
                                .click({ force: true })
                                .then(() => {
                                    Cypress.env('pickupDay', dayNumber);
                                    Cypress.env('pickupIndex', dayIndex);
                                    return dayNumber;
                                });
                        });
                });
        });
}

clickReturnDateButton() {
    return cy.get('body').then(($body) => {
        if ($body.find('.ct-modal-close').length > 0) {
            cy.get('.ct-modal-close').click({ force: true });
        }
        
        return cy.get('.ct-landing-page__calendar--return-header--label', { timeout: 15000 })
            .should(($btn) => {
                expect($btn).to.be.visible;
                expect($btn.css('pointer-events')).to.equal('auto');
            })
            .click({ force: true })
            .then(() => cy.wait(500));
    });
}

    selectReturnDate(returnDay = 0) {
        const pickupDaySet = Cypress.env('pickupDay') || 0;
        const returnDaySet = pickupDaySet + returnDay;

        cy.log('Selecting return date (day ${returnDateSet})');
        return this.selectAvailableDay(returnDaySet);
    }

    selectRangeAge(ageRange = '30-69', specificAge = 22) {
        cy.log(`Selecting driver age range: ${ageRange}`);
        cy.get('.ct-age-button', { timeout: 15000 })
        .first()
        .should('be.visible')
        .click({ force: true });

    cy.wait(3000);

    let index;
   if(ageRange === '18-29') {
    index = 1;
   } else if(ageRange === '30-69') {
    index = 2;
   } else if(ageRange === '70+') {
    index = 3;
   } else {
    index = 2;
   }

   const selector = `:nth-child(${index}) > .ct-age-button`;
   cy.log(`Using selector: ${selector} for range ${ageRange}`);

    cy.get(selector, { timeout: 15000})
    .should('be.visible')
    .click({ force: true});

    // if range is 18 - 29, add specific age
    if(ageRange === '18-29') {
        cy.log(`Entering specific age: ${specificAge} in age panel`);

        // waiting to appear the age textbox
        cy.contains('label', 'Enter your age', { timeout: 10000 })
        .should('be.visible')
        .then(($label) => {
            const inputId = $label.attr('for');

            cy.log(`Found label with for="${inputId}"`);

            cy.get(`#${inputId}`, { timeout: 10000})
            .should('be.visible')
            .clear()
            .type(specificAge.toString(), { delay: 100});

            cy.get('.ct-btn', { timeout: 15000})
            .should('be.visible')
            .click({ force: true});
        })

        // 🛑 Wait for loader to disappear
        cy.get('.ct-loading-spinner, .loading, .spinner', { timeout: 30000 })
        .should('not.exist');

    }

    cy.log(`✅ Age range ${ageRange} selected successfully`);
    cy.wait(1000);

}

    selectSearch() {
        cy.log('Searching for cars....')
        cy.get('body', { timeout: 30000 })
        .should('not.contain', 'Cargando...');

        cy.intercept('GET', '/book?*').as('searchRequest');

        cy.log('Clicking search button...');
        cy.get('.ct-btn, [data-testid="search-button"], button:contains("buscar")', { timeout: 30000})
        .filter(':visible')
        .first()
        .should('be.visible')
        .click({ force: true});

        cy.wait('@searchRequest', { timeout: 30000}).then((interception) => {
            cy.log(`Search response status: ${interception.response.statusCode}`);

            if(interception.response.statusCode === 302) {
                const redirectUrl = interception.response.headers.location;
                const fullUrl = `https://cars.vueling.com${redirectUrl}`;
                cy.log(`🚗 Redirecting to results: ${fullUrl}`);

                cy.visit(fullUrl, { timeout: 60000, failOnStatusCode: false});
            }
        });

        cy.log('⏳ Waiting for results to load...');
        cy.get('[data-testid="car-item"], .ct-car-item, .car-list', { timeout: 60000})
        .should('be.visible')
        .then(($cars) => {
            cy.log(`✅ Found ${$cars.length} cars!`);

            cy.wrap($cars.first()).click({ force: true});
            cy.log('✅ Search completed sucessfully');
        })

    }

    selectLocation(location, type = 'pickup') {
        const elements = {
            pickup: {
                button: this.elements.SEARCH_FROM.PICKUP_LOCATION,
                modal: this.elements.SEARCH_FROM.PICKUP_MODAL,
                input: this.elements.SEARCH_FROM.PICKUP_SEARCH_INPUT
            },
            return: {

            }
        }[type];

        cy.get(elements.button, { timeout: 15000})
        .should('be.visible')
        .click({ force: true});

        cy.get(elements.modal, { timeout:10000})
        .should('be.visible')
        .within(() => {
            cy.get(elements.input)
            .type(location, { delay: 100})
            .wait(500);

            cy.get(elements.result)
            .first()
            .click({ force: true});
        });
    }
}