export const HOME_PAGE = {
    COOKIES: { 
        BANNER: '#onetrust-banner-sdk, .onetrust-banner-container',
            ACCEPT_BTN: '#onetrust-accept-btn-handler',
            ACTIVE_BANNER: '#onetrust-banner-sdk:not(.ot-hide)'
    },
    NAV_TABS: {
        FLIGHTS:'#tabFlight',
        HOTELS: '#hotels-tab',
        CARS: '[data-testid="cars-tab"], :nth-child(3) > .btn--secondary, a[href*="cars.vueling"]'
    }
};

export const CAR_RENTAL = {
    COOKIES: {
        CAR_ACCEPT_COOKIES: '[data-testid="cookieAccept"]',
    },
    SEARCH_FROM: {
        PICKUP_LOCATION: 'button.ct-landing-page__item--dismss',
        PICKUP_MODAL: '.pickup-location-modal',
        PICKUP_SEARCH_INPUT: 'input[arias-label="Search for a location"]',
        PICKUP_RESULTS: '.location-results li',
        DATE_PICKER: {
            PICKUP_DATE: '[is-active="$ctrl.calendarMode === \\\'start\\\' && $ctrl.calendarVisible"]',
            RETURN_DATE: '.day.active',
            DAY_BUTTON: (day) => `button[data-day="${day}"]`
        },
        RETURN_DATE: '#until',
        DRIVE_AGE: {
            DROPDOWN: '#ct-compact-age-type',
            OTHER_OPTION: 'label[for="2"]',
            AGE_INPUT: '#driverAgeInput',
            CONFIRM_BUTTON: '#ageConfirmButton'
        },
        SEARCH_BUTTON: '#car-search-button'
    },
    CAR_LIST: {
        SUV_FILTER: '[data-testid="filter-suv"]',
        FIRST_SUV: '[data-testid="car-card"]',
        SELECT_BUTTON: 'SELECT_BUTTON'
    },
    INSURANCE_OPTIONS: {
        BASIC_RATE: '[data-testid="basic-rate-options"]',
        PREMIUM_RATE: 'PREMIUM',
        CONTINUE_BUTTON: 'CONTINUE_BUTTON'
    },
    DRIVER_INFO: {
        PAGE_TITLE: 'TITULO DE PAGINA',
        SELECTED_RATE: 'SELECTED'
    }
};