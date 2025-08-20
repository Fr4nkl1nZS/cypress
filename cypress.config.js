  const { defineConfig } = require("cypress");
  const path = require('path')
  const fs = require('fs')

  module.exports = defineConfig({
    e2e: {
      baseUrl: "https://cars.vueling.com",
      defaultCommandTimeout: 40000,
      pageLoadTimeout: 60000,
      viewportWidth: 430,
      viewportHeight: 932,
      chromeWebSecurity: false,
      video: true,
      experimentalSessionAndOrigin: true,
      experimentalMemoryManagement: true,
      numTestsKeptInMemory: 1,
      specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx,spec.js}',
      supportFile: 'cypress/support/e2e.js',
      fixturesFolder: 'cypress/fixtures',
      excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
      setupNodeEvents(on, config) {
        require('@babel/register')({
          presets: ['@babel/preset-env']
        });


        on('before:browser:launch', (browser, launchOptions) => {
          if(browser.name == 'chrome') {
            launchOptions.args.push(
              '--disable-web-securty',
              '--disable-site-isolation-trials',
              '--user-data-dir=' + path.join(__dirname, 'chrome_temp'),
              '--disable-extensions'
            );
          }
          if(browser.name == 'firefox') {
            launchOptions.preferences = {
              'network.cookie.lifetimePolicy': 0,
              'privacy.trackingprotection.enabled': false,
              'dom.webnotifications.enabled': false,
              'browser.cache.disk.enabled': false,
              'browser.sessionstore.resume_from_crash': false,
              'browser.shell.checkDefaultBrowser': false,
              'network.http.redirection-limit': 10
            };
            launchOptions.args = [
              '-foreground',
              '-new-instance',
              '-no-remote'
            ];
          }
          return launchOptions;
        });

        //task to clean cookies
        on('task', {
          clearHardcodedCookies() {
            try {
            const cookiesPath = path.join (
              __dirname,"cypress", "support", "cookies.json");

            if(fs.existsSync(cookiesPath)) {
              fs.unlinkSync(cookiesPath);
              console.log("[Cookies] Successfully removed cookies file");
            } else {
              console.log("[Cookies] Not cookies file found at ", cookiesPath);
            }
              return null;
            } catch (error) {
              console.error("[Cookies] Error cleanning cookies: ", error.message);
              return { success: false, error: error.message };
            }
          }
        });
        return config;
      },
    },
    env: {
      // entorn variable
      acceptCookiesSelector: '#onetrust-accept-btn-handler, #accept-recommended-btn-handler',
      blockCookiesSelectors: [
        '.onetrust-pc-dark-filter',
        '.ot-prevent-interaction'
      ],
      blockedDomains: [
        'cookies-cdn.cookiepro.com',
        'optanon.blob.core.windows.net',
        'go-mpulse.net',
        'quantummetric.com'
      ]
    }
  });
