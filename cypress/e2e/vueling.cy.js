/// <reference types="cypress" />
import HomePage from "../pages/HomePage";
import CarRentalPage from "../pages/CarRentalPage";
describe('vueling - car rental test', () => {
  const homePage = new HomePage();
  const carRentalPage = new CarRentalPage();
  let testData;

    before(() => {
        Cypress.automation('remote:debugger:protocol', {
            command: 'Network.setUserAgentOverride',
            params: {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        cy.fixture('carRental').then((data) => {
          testData = data;
        });
    });

    beforeEach(() => {
      cy.forceCleanCookies();
        cy.blockTrackingRequests();

        cy.visit('/', {
          failOnStatusCode: false,
          timeout: 60000
        })
    });

    it('Should complete car rental process with basic insurance', () => {
      cy.wait(2000);

      cy.get('[data-testid="cookieAccept"]', { timeout: 15000})
      .should('be.visible')
      .click({ force: true})
      .wait(500);

          cy.get('.ct-landing-page__item--dismss', { timeout: 20000})
          .should('be.visible')
          .and('not.be.disabled')
          .then(($btn) => {
            const btn = $btn[0];
            const rect = btn.getBoundingClientRect();
 
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
 
            cy.wrap($btn)
            .click({ force: true, x: rect.width/2, y: rect.height/2 })
          });
          
          const searchTerm = 'Barcelona';

          cy.get('#search-cars-pickup-modal-input', { timeout: 10000})
          .should('be.visible')
          .and('not.be.disabled')
          .then(($input) => {
            cy.wrap($input).clear();

            cy.wrap($input)
            .type(searchTerm, { delay: 100, force: true})
            .wait(500)
          });

          cy.get(':nth-child(1) > section > .ct-list-simple > [name="LocSelected-0"] > .ct-side-panel-locations-location-name', { timeout: 15000})
          .should('exist')
          .click();

          cy.get('[is-active="$ctrl.calendarMode === \\\'start\\\' && $ctrl.calendarVisible"]', { timeout: 15000})
          .should('be.visible')
          .then(($btn) => {
            const btn = $btn[0];
            const rect = btn.getBoundingClientRect();
 
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
 
            cy.wrap($btn)
            .click({ force: true, x: rect.width/2, y: rect.height/2 })
          });

          cy.wrap(null).then(() => {
            return carRentalPage.selectAvailableDay(2)
            .then((pickupDay) => {
                cy.log(`Pickup day selected: ${pickupDay}`);
                Cypress.env('pickupDay', pickupDay);
                
                return carRentalPage.clickReturnDateButton();
            })
            .then(() => {
                return carRentalPage.selectAvailableDay(3);
            })
            .then((returnDay) => {
                expect(returnDay).to.be.a('string').and.not.to.be.empty;
                cy.log(`Return day selected: ${returnDay}`);
                cy.screenshot('final-date-selection');
            })
            .then(() => {
                return carRentalPage.selectRangeAge();
            })
            .then(() => {
                // Esperar breve para el recargo de la página
                cy.wait(1000);
                return carRentalPage.selectSearch();
          });
        });
      })

});