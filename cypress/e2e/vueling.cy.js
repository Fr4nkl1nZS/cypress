/// <reference types="cypress" />
import HomePage from "../pages/HomePage";
import CarRentalPage from "../pages/CarRentalPage";
describe('Car rental Insurance Test Suite', () => {
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

    //Acept initial cookies
    cy.get('[data-testid="cookieAccept"]', { timeout: 15000})
    .should('be.visible')
    .click({ force: true })
    .wait(500);
  });

  /**
   * Helper function to navigate select car
   */

  function navigateToCarRental() {
    cy.get('.ct-landing-page__item--dismss', { timeout: 20000})
    .should('be.visible')
    .click({ force: true});
  }

  /**
   * Helper function to select location
   */

  function selectPickupLocation(location = 'Barcelona') {
    cy.get('.ct-landing-page__item--dismss', { timeout: 10000})
    .should('be.visible')
    .click({ force: true});

    cy.wait(2000);

    cy.get('#search-cars-pickup-modal-input', { timeout: 10000})
    .should('be.visible')
    .and('not.be.disabled')
    .then(($input) => {
      cy.wrap($input).clear();

      cy.wrap($input)
      .type(location, { delay: 100, force: true})
      .wait(500)
    });

    cy.get(':nth-child(1) > section > .ct-list-simple > [name="LocSelected-0"] > .ct-side-panel-locations-location-name', { timeout: 15000})
    .should('exist')
    .click();
  }

  /**
   * Helper function to select date
   */

  function selectDates(pickupDaysFromToday = 2, rentalDuration = 3) {
    // Open schedule
    cy.get('[is-active="$ctrl.calendarMode === \'start\' && $ctrl.calendarVisible"]', { timeout: 15000})
    .should('be.visible')
    .click({ force: true});

    // select pickup date
    return carRentalPage.selectAvailableDay(pickupDaysFromToday)
    .then((pickupDay) => {
      cy.log(`Pickup day selected: ${pickupDay}`);
      Cypress.env('pickupDay', pickupDay);
      return carRentalPage.clickReturnDateButton();
    })
    .then(() => {
      //select return date
      return carRentalPage.selectAvailableDay(pickupDaysFromToday + rentalDuration);
    })
    .then((returnDay) => {
      cy.log(`Return day selected: ${returnDay}`);
      cy.screenshot('date-selection');

       // 🔴 ESPERA SIMPLE PERO EFECTIVA
            cy.log('⏳ Waiting for page to stabilize and ads to pass...');
            
            // Esperar a que cualquier overlay desaparezca
            cy.get('.ct-modal, .overlay, [class*="modal"]', { timeout: 45000 })
                .should('not.exist');
            
            // Esperar a que los botones de edad estén visibles
            cy.get('.ct-age-button', { timeout: 30000 })
                .should('be.visible')
                .first();
            
            cy.log('✅ Ready for age selection');
    });
  }

  /**
   * Helper function select insurance
   */

  function selectInsurance(insuranceType = 'BASIC') {
    cy.log(`Selecting ${insuranceType} insurance`);

    //waiting for results
    cy.wait(3000);

    if(insuranceType === 'BASIC') {
      cy.get('[data-testid="basic-rate"], .ct-insurance-basic', { timeout: 15000})
      .should('be.visible')
      .click({ force: true});
    } else if (insuranceType === 'PREMIUM') {
      cy.get('[data-testid="premium-rate"], .ct-insurance-premium', { timeout: 15000})
      .should('be.visible')
      .click({ force: true});
    }

    // continue with the reserv
    cy.contains('button', /continuar|Search|continue|next/i, { timeout: 15000})
    .should('be.visible')
    .click({ force: true});
  }

  /**
   * Helper function for continue without insurance
   */

  function skipInsurance() {
    cy.log('Skipping insurance selection');

    //Search option for continue without insurance
    cy.get('body').then(($body) => {
      const skipBtn = $body.find('button:contains("skip"), button:contains("Omitir"), button:contains("Continuar sin seguro")');

      if(skipBtn.length) {
        cy.wrap(skipBtn.first()).click({ force: true});
      } else {
        // if there is not specific button, continue
        cy.contains('button', /continuar|Search|continue/i, { timeout: 15000 })
        .click({ force: true});
      }
    });
  }

  /* ========== TEST CASES ========== */

  //TC01: Persone 22 years without Insurance
    it('TC01 - Age 22 (18 - 29) - NO insurance', () => {
      cy.log('🚗 TEST CASE 1: Age 22, No insurance');

      navigateToCarRental();
      selectPickupLocation('Barcelona');
          
      // Select dates (pickup in 2 days, duration 3 days)
      selectDates(2, 3);

      // Select age range 18 - 29 with specific age 22
      carRentalPage.selectRangeAge('18-29', 22);

      // Search car
      //carRentalPage.selectSearch();

      // Select first available car
      cy.get('[data-testid="car-item"], .ct-car-item, .car-list, [class*="result"]', { timeout: 60000})
      .should('be.visible')
      .first()
      .click({ force: true});
      
      // dont select insurance
      skipInsurance();

      // Verified that we are on the driver page
      cy.url({ timeout: 15000}).should('include', 'driver-info');

      // Verified the insurance doesnt was selected
      cy.log('✅ Test TC01 completed: Age 22, No insurance');
      cy.screenshot('TC01-age-22-no-insurance');

});
});