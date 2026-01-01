import { defineConfig } from 'cypress';

export default defineConfig({
  chromeWebSecurity: false,
  video: true,
  screenshotOnRunFailure: true,
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
  },
  experimentalWebKitSupport: true,
});
