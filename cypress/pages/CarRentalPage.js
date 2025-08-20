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

        cy.wait(500);
    }

    selectRangeAge() {
        cy.get(':nth-child(2) > .ct-age-button', { timeout: 15000 })
        .should('be.visible')
        .and('have.css', 'cursor', 'pointer')
        .click({ force: true });

    cy.get('.ct-modal', { timeout: 20000 })
        .should('be.visible')
        .within(() => {
            cy.get('.ct-btn', { timeout: 20000 })
                .should('be.visible')
                .and(($btn) => {
                    const btnText = $btn.text().trim();
                    expect(btnText).to.match(/confirmar/i);
                })
                .click({ force: true });
        });

    cy.get('.ct-modal', { timeout: 20000 })
        .should('not.be.visible');
}

    selectSearch() {
        cy.get('body', { timeout: 30000 })
        .should('not.contain', 'Cargando...');

    cy.get('.ct-btn', { timeout: 30000 })
        .filter(':visible')
        .should(($buttons) => {
            const confirmBtn = $buttons.filter((i, el) => 
                el.textContent.trim().match(/confirmar|continuar/i)
            );
            expect(confirmBtn).to.have.length(1);
        })
        .first()
        .click({ force: true });

    cy.url({ timeout: 45000 })
        .should('include', '/reservation');
    cy.get('.reservation-container', { timeout: 30000 })
        .should('be.visible');

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