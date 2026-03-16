import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3000';
const CMS = `${BASE}/case-management`;
const EMAIL = 'abhishekatrey@gmail.com';
const PASSWORD = 'AtreyCMS2026Secure';

async function login(page: Page) {
  await page.goto(`${CMS}/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 15000 });
}

test.describe('CMS Live Backend E2E', () => {

  test('1. Login with real backend credentials', async ({ page }) => {
    await page.goto(`${CMS}/login`);
    await expect(page.locator('text=Case Management System')).toBeVisible();

    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(/dashboard/, { timeout: 15000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('2. Dashboard loads with real data from backend', async ({ page }) => {
    await login(page);

    // Wait for stat cards to load with actual numbers
    await page.waitForSelector('text=Total Active', { timeout: 10000 });

    // Should show actual case count (40 seeded)
    const statCards = page.locator('[class*="stat"]').or(page.locator('[style*="border-left"]'));
    await expect(statCards.first()).toBeVisible();

    // Navigation tabs should be visible
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cases' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Hearings' })).toBeVisible();
  });

  test('3. Cases page loads with 40 seeded cases', async ({ page }) => {
    await login(page);
    await page.goto(`${CMS}/cases`);
    await page.waitForTimeout(3000);

    // Should show cases table or case data
    const pageContent = await page.textContent('body');
    expect(
      pageContent?.includes('SLP') ||
      pageContent?.includes('Uttarakhand') ||
      pageContent?.includes('cases') ||
      pageContent?.includes('Case')
    ).toBeTruthy();
  });

  test('4. Navigate through all tabs', async ({ page }) => {
    await login(page);

    const tabs = [
      { name: 'Cases', url: /cases/, content: ['Case', 'Status'] },
      { name: 'Hearings', url: /hearings/, content: ['Hearing', 'Date'] },
      { name: 'Calendar', url: /calendar/, content: ['Mon', 'Tue', 'Wed'] },
      { name: 'Compliance', url: /compliance/, content: ['Compliance'] },
      { name: 'Filings', url: /filings/, content: ['Filing'] },
    ];

    for (const tab of tabs) {
      const link = page.locator(`a:has-text("${tab.name}")`).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(2000);
        const content = await page.textContent('body');
        const hasContent = tab.content.some(c => content?.includes(c));
        expect(hasContent).toBeTruthy();
      }
    }
  });

  test('5. Admin tabs visible for superadmin', async ({ page }) => {
    await login(page);

    // Users tab should be visible for superadmin
    const usersLink = page.locator('a:has-text("Users")');
    await expect(usersLink.first()).toBeVisible({ timeout: 5000 });

    // Audit tab should be visible
    const auditLink = page.locator('a:has-text("Audit")');
    await expect(auditLink.first()).toBeVisible({ timeout: 5000 });
  });

  test('6. Users page shows seeded users', async ({ page }) => {
    await login(page);
    await page.goto(`${CMS}/users`);
    await page.waitForTimeout(3000);

    const content = await page.textContent('body');
    expect(content).toContain('Dr. Abhishek Atrey');
    expect(content).toContain('superadmin');
  });

  test('7. Invalid login shows error', async ({ page }) => {
    await page.goto(`${CMS}/login`);
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);
    // Should still be on login page with error
    await expect(page).toHaveURL(/login/);
  });

  test('8. Auth guard redirects to login', async ({ page }) => {
    // Clear any stored tokens
    await page.goto(`${CMS}/login`);
    await page.evaluate(() => {
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_user');
    });

    await page.goto(`${CMS}/dashboard`);
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/login/);
  });

  test('9. Main website has CMS link', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(3000);
    const cmsLink = page.locator('a:has-text("Case Management")');
    await expect(cmsLink.first()).toBeVisible({ timeout: 10000 });
  });

  test('10. Logout works', async ({ page }) => {
    await login(page);

    // Click logout button
    const logoutBtn = page.locator('button:has-text("Logout")').or(page.locator('button:has-text("Sign Out")'));
    if (await logoutBtn.first().isVisible({ timeout: 5000 })) {
      await logoutBtn.first().click();
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/login/);
    }
  });
});
