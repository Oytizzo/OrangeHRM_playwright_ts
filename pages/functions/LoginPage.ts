import { Page, expect } from '@playwright/test';
import { LoginLocators } from '../locators/LoginLocators';
import { clickElement, enterText } from '../../utils/commonActions';
import { envConfig } from '../../data/testData';

export class LoginPage {
    readonly page: Page;
    readonly url: string;

    constructor(page: Page, url: string) {
        this.page = page;
        this.url = url;
    }

    async goto() {
        await this.page.goto(this.url);
    }

    async enterUsername(username: string) {
        await enterText(this.page, LoginLocators.usernameInput, username);
    }

    async enterPassword(password: string) {
        await enterText(this.page, LoginLocators.passwordInput, password);
    }

    async clickLogin() {
        await clickElement(this.page, LoginLocators.loginBtn);
    }

    async login(username: string, password: string) {
        console.log('🔐 Attempting login with:', username);
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLogin();
    }

    async getRequiredError() {
        return this.page.locator(LoginLocators.requiredField);
    }

    // async getErrorMessage(): Promise<string> {
    //     try {
    //     const errorText = await this.page.locator('.oxd-alert-content-text').innerText();
    //     console.log(`⚠️ Error Message Displayed: ${errorText}`);
    //     return errorText;
    //     } catch (error) {
    //     console.error('❌ Failed to fetch error message', error);
    //     throw error;
    //     }
    // }

    async getErrorMessage() {
        return this.page.locator(LoginLocators.errorText); // this returns Locator
    }

    async assertDashboardLoaded() {
        try {
        const heading = this.page.getByRole('heading', { name: 'Dashboard' });
        await expect(heading).toBeVisible();
        console.log('✅ Dashboard loaded successfully');
        } catch (error) {
        console.error('❌ Dashboard did not load as expected', error);
        await this.page.screenshot({ path: `screenshots/dashboard-error-${Date.now()}.png`, fullPage: true });
        throw error;
        }
    }
}
