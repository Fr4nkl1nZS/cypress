import timeout from "studio/src/plugin/timeout";
import HomePage from "../pages/HomePage";
import { CAR_RENTAL, HOME_PAGE } from "../support/selectors";
import { resolve } from "path";

describe('car rental insurance verification with firefox', { browser: 'firefox' }, () => {
    let homePage;
    let testData;


    before (() => {
        cy.fixture('carRental').then((data) => {
            testData = data;
        });

        Cypress.on('window:before:load', (win) => {
            Object.defineProperty(win.navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Windows NT 10.0: Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0',

                writable: true
            });
        });
    });

    beforeEach(() => {
        homePage = new HomePage();

        cy.clearCookies({ domain: '.vueling.com'});
        cy.clearLocalStorage();
        cy.clearAllSessionStorage();
        cy.task('clearHardcodedCookies');        
    });

    function performCarSearch() {
        return cy.visit('/', {
            failOnStatusCode: false,
            timeout: 60000,
            headers: {'Accept-Language': 'en-US,en;q=0.9'},
            
        })
        .then(() => {
            return cy.document()
            .should('have.property', 'readyState', 'complete')
            .then(() => homePage.acceptCookies())
            .then(() => homePage.clickRentCarButton())
            .then((carRentalUrl) => {
                cy.log('Navigation to car rental section:', carRentalUrl);

                return homePage.acceptCarRentalCookies().then(() => {
                    return cy.origin('https://cars.vueling.com', { args: { testData } }, ({ testData}) => {

                        cy.retryOperation(acceptCookies, { delay: 2000, maxAttempts: 3});
                        const pickupDate = new Date();
                        pickupDate.setDate(pickupDate.getDate() + testData.pickupDaysFromToday);

                        const returnDate = new Date(pickupDate);
                        returnDate.setDate(pickupDate.getDate() + testData.rentalDurationDays);

                        cy.get(CAR_RENTAL.SEARCH_FROM.PICKUP_LOCATION, { timeout: 15000})
                        .click({ force: true});

                        cy.get(CAR_RENTAL.SEARCH_FROM.DATE_PICKER.ACTIVE_DAY).click();
                        cy.contains(returnDate.getDate().toString()).click();

                        cy.get(CAR_RENTAL.SEARCH_FROM.DRIVE_AGE.DROPDOWN).click();
                        cy.get(CAR_RENTAL.SEARCH_FROM.DRIVE_AGE.OTHER_OPTION).click();
                        cy.get(CAR_RENTAL.SEARCH_FROM.DRIVE_AGE.AGE_INPUT)
                        .clear()
                        .type(`${testData.driverAge}{enter}`);

                        cy.get(CAR_RENTAL.SEARCH_FROM.SEARCH_BUTTON).click();

                        cy.get(CAR_RENTAL.SEARCH_FROM.PICKUP_LOCATION)
                        .should('be.visible');

                    });
                });
            });
        });                 
}

    function selectFirstSUV() {
        cy.get(CAR_RENTAL.CAR_LIST.SUV_FILTER, { timeout: 15000 }).click();
        cy.get(CAR_RENTAL.CAR_LIST.FIRST_SUV, { timeout: 15000})
        .first()
        .should('be.visible')
        .click();
    }

    function verifyInsuranceSelection(insranceType) {
        const insuranceSelector = insranceType === 'Basic'
        ? CAR_RENTAL.INSURANCE_OPTIONS.BASIC_RATE
        : CAR_RENTAL.INSURANCE_OPTIONS.PREMIUM_RATE;

        cy.get(insuranceSelector, { timeout: 15000})
        .should('be.visible')
        .click();

        cy.get(CAR_RENTAL.INSURANCE_OPTIONS.CONTINUE_BUTTON)
        .should('be.visible')
        .click();

        cy.url().should('include', '/driver-info');
        cy.get(CAR_RENTAL.DRIVER_INFO.SELECTED_RATE)
        .should('contain', insranceType);
    }

    it('should complete car rental flow with basic insurance', () => {
        cy.viewport(430, 932);
        cy.forceCleanCookies();
        cy.blockTrackingRequests();
        performCarSearch()
        .then(() => {
            cy.waitForPageLoad();
            selectFirstSUV();
            verifyInsuranceSelection(testData.insurance[0])
        })
    });

    it('Should select pickup location', () => {
        const homePage = new HomePage();

        homePage.acceptCookies()
        .then(() => homePage.clickRentCarButton())
        .then(() => {
            return homePage.selectPickupLocation()
            .then(() => {
                cy.get(homePage.carRentalElements.SEARCH_FROM.PICKUP_SEARCH_INPUT)
                .type('Barcelona')
                .type('{enter}');
            });
        });
    });

    it('should complete car rental flow with premium insurance', () => {
        cy.viewport(430, 932);
        cy.forceCleanCookies();
        cy.blockTrackingRequests();
        performCarSearch();
        selectFirstSUV();
        verifyInsuranceSelection(testData.insurance[1]);
    });
});