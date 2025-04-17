import { test as baseTest } from '@playwright/test';
import { LoginPage } from '../pages/functions/LoginPage';
import { DashboardPage } from '../pages/functions/DashboardPage';
import { AdminPage } from '../pages/functions/AdminPage';
import { MyInfoPage } from '../pages/functions/MyInfoPage';
import testData from '../data/testData';

type EnvType = keyof typeof testData;

type EnvConfig = {
  baseUrl: string;
  username: string;
  password: string;
};

type CustomFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  adminPage: AdminPage;
  myInfoPage: MyInfoPage;
  creds: EnvConfig;
};

export const test = baseTest.extend<CustomFixtures>({
  creds: async ({}, use) => {
    const env = (process.env.ENV || 'qa').trim();
    console.log('typeof env:', typeof env);
    const config = testData[env];
    console.log('config: ', config);
    console.log('testData: ', testData[env]);

    if (!config) {
      throw new Error(`❌ No configuration found for environment: ${env}`);
    }

    await use(config);
  },

  loginPage: async ({ page, creds }, use) => {
    await use(new LoginPage(page, creds.baseUrl));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },

  myInfoPage: async ({ page }, use) => {
    await use(new MyInfoPage(page));
  },

  page: async ({ page }, use, testInfo) => {
    await use(page);

    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshot = await page.screenshot();
      await testInfo.attach(`${testInfo.title}-failure.png`, {
        body: screenshot,
        contentType: 'image/png',
      });
    }
  }
});
