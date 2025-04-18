import { Page, Locator, expect } from '@playwright/test';

export class CommonActions {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForVisibility(selector: string, timeout = 5000) {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout });
      console.log(`Element visible: ${selector}`);
    } catch (err) {
      console.error(`Element not visible: ${selector}`, err);
      throw err;
    }
  }

  async waitForInvisibility(selector: string, timeout = 5000) {
    try {
      await this.page.locator(selector).waitFor({ state: 'hidden', timeout });
      console.log(`Element hidden: ${selector}`);
    } catch (err) {
      console.error(`Element still visible: ${selector}`, err);
      throw err;
    }
  }

  async selectDropdownByText(selector: string, optionText: string) {
    try {
      await this.page.locator(selector).selectOption({ label: optionText });
      console.log(`Selected '${optionText}' from ${selector}`);
    } catch (err) {
      console.error(`Failed to select ${optionText} from ${selector}`, err);
      throw err;
    }
  }

  async scrollToElement(selector: string) {
    try {
      await this.page.locator(selector).scrollIntoViewIfNeeded();
      console.log(`Scrolled to ${selector}`);
    } catch (err) {
      console.error(`Failed to scroll to ${selector}`, err);
      throw err;
    }
  }

  async hoverElement(selector: string) {
    try {
      await this.page.locator(selector).hover();
      console.log(`Hovered over element: ${selector}`);
    } catch (error) {
      console.error(`Error hovering over element (${selector}):`, error);
      throw error;
    }
  }

  async clickElement(selector: string) {
    try {
      await this.page.locator(selector).click();
      console.log(`Clicked element with selector: ${selector}`);
    } catch (err) {
      console.error(`Error clicking element (${selector}):`, err);
      throw err;
    }
  }

  async doubleClickElement(selector: string) {
    try {
      await this.page.locator(selector).dblclick();
      console.log(`Double-clicked element: ${selector}`);
    } catch (error) {
      console.error(`Error double-clicking element (${selector}):`, error);
      throw error;
    }
  }

  async enterText(selector: string, value: string) {
    try {
      await this.page.locator(selector).fill(value);
      console.log(`Filled element ${selector} with value: ${value}`);
    } catch (err) {
      console.error(`Fill failed on ${selector}:`, err);
      throw err;
    }
  }

  async getTextFromElement(selector: string, timeout = 5000): Promise<string> {
    try {
      const locator: Locator = this.page.locator(selector);
      await locator.waitFor({ state: 'visible', timeout });
      const text = await locator.innerText();
      console.log(`Text retrieved from ${selector}: ${text}`);
      return text;
    } catch (error) {
      console.error(`Error retrieving text from element (${selector}):`, error);
      throw error;
    }
  }

  async verifyElementContains(selector: string, expectedText: string, timeout = 5000) {
    try {
      await expect(this.page.locator(selector)).toContainText(expectedText, { timeout });
      console.log(`Element ${selector} contains text: ${expectedText}`);
    } catch (error) {
      console.error(`Element (${selector}) did not contain text (${expectedText})`, error);
      await this.page.screenshot({ path: `screenshots/assert-${Date.now()}.png`, fullPage: true });
      throw error;
    }
  }

  async verifyElementNotContains(selector: string, notExpectedText: string, timeout = 5000) {
    try {
      const text = await this.page.locator(selector).innerText({ timeout });
      if (text.includes(notExpectedText)) {
        throw new Error(`Element (${selector}) contains forbidden text: ${notExpectedText}`);
      }
      console.log(`Element ${selector} does not contain text: ${notExpectedText}`);
    } catch (error) {
      console.error(`Element (${selector}) unexpectedly contains text (${notExpectedText})`, error);
      await this.page.screenshot({ path: `screenshots/assert-not-${Date.now()}.png`, fullPage: true });
      throw error;
    }
  }

  async verifyTextContains(selector: string, expectedText: string) {
    try {
      const text = await this.page.locator(selector).textContent();
      expect(text).toContain(expectedText);
      console.log(`Element ${selector} contains text: ${expectedText}`);
    } catch (err) {
      console.error(`Text not found in ${selector}`, err);
      throw err;
    }
  }

  async verifyTextNotContains(selector: string, notExpectedText: string) {
    try {
      const text = await this.page.locator(selector).textContent();
      expect(text).not.toContain(notExpectedText);
      console.log(`Element ${selector} does not contain text: ${notExpectedText}`);
    } catch (err) {
      console.error(`Text unexpectedly found in ${selector}`, err);
      throw err;
    }
  }

  async verifyAttributeValue(selector: string, attribute: string, expectedValue: string) {
    try {
      const actual = await this.page.locator(selector).getAttribute(attribute);
      expect(actual).toBe(expectedValue);
      console.log(`Verified ${attribute} of ${selector} is ${expectedValue}`);
    } catch (err) {
      console.error(`Attribute verification failed for ${selector}`, err);
      throw err;
    }
  }

  async attachScreenshot(name: string) {
    const screenshot = await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
    console.log(`📸 Screenshot taken: ${name}.png`);
    return screenshot;
  }

  async attachScreenshotOnFailure(testInfo: any) {
    const screenshot = await this.page.screenshot({ path: `screenshots/${testInfo.title}.png`, fullPage: true });
    await testInfo.attach('screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
  }
}
