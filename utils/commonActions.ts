import { Page, Locator, expect } from '@playwright/test';

export async function waitForVisibility(page: Page, selector: string, timeout = 5000) {
    try {
        await page.locator(selector).waitFor({ state: 'visible', timeout });
        console.log(`Element visible: ${selector}`);
    } catch (err) {
        console.error(`Element not visible: ${selector}`, err);
        throw err;
    }
}

export async function waitForInvisibility(page: Page, selector: string, timeout = 5000) {
    try {
        await page.locator(selector).waitFor({ state: 'hidden', timeout });
        console.log(`Element hidden: ${selector}`);
    } catch (err) {
        console.error(`Element still visible: ${selector}`, err);
        throw err;
    }
}

export async function verifyTextContains(page: Page, selector: string, expectedText: string) {
    try {
        const text = await page.locator(selector).textContent();
        expect(text).toContain(expectedText);
        console.log(`Element ${selector} contains text: ${expectedText}`);
    } catch (err) {
        console.error(`Text not found in ${selector}`, err);
        throw err;
    }
}

export async function verifyTextNotContains(page: Page, selector: string, notExpectedText: string) {
    try {
        const text = await page.locator(selector).textContent();
        expect(text).not.toContain(notExpectedText);
        console.log(`Element ${selector} does not contain text: ${notExpectedText}`);
    } catch (err) {
        console.error(`Text unexpectedly found in ${selector}`, err);
        throw err;
    }
}

export async function selectDropdownByText(page: Page, selector: string, optionText: string) {
    try {
        await page.locator(selector).selectOption({ label: optionText });
        console.log(`Selected '${optionText}' from ${selector}`);
    } catch (err) {
        console.error(`Failed to select ${optionText} from ${selector}`, err);
        throw err;
    }
}

export async function scrollToElement(page: Page, selector: string) {
    try {
        await page.locator(selector).scrollIntoViewIfNeeded();
        console.log(`Scrolled to ${selector}`);
    } catch (err) {
        console.error(`Failed to scroll to ${selector}`, err);
        throw err;
    }
}

export async function verifyAttributeValue(page: Page, selector: string, attribute: string, expectedValue: string) {
    try {
        const actual = await page.locator(selector).getAttribute(attribute);
        expect(actual).toBe(expectedValue);
        console.log(`Verified ${attribute} of ${selector} is ${expectedValue}`);
    } catch (err) {
        console.error(`Attribute verification failed for ${selector}`, err);
        throw err;
    }
}

export async function clickElement(page: Page, selector: string) {
    try {
        await page.locator(selector).click();
        console.log(`Clicked element with selector: ${selector}`);
    } catch (err) {
        console.error(`Error clicking element (${selector}):`, err);
        throw err;
    }
}

export async function enterText(page: Page, selector: string, value: string) {
    try {
        await page.locator(selector).fill(value);
        console.log(`Filled element ${selector} with value: ${value}`);
    } catch (err) {
        console.error(`Fill failed on ${selector}:`, err);
        throw err;
    }
}
