import { test, expect } from '@playwright/test';

// ----- Helpers -----

const LOGIN_EMAIL = 'abhishekatrey@gmail.com';
const LOGIN_PASSWORD = 'test123';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/case-management/login');
  await page.waitForSelector('h1:has-text("Case Management System")');
  await page.fill('#cms-email', LOGIN_EMAIL);
  await page.fill('#cms-password', LOGIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/case-management/dashboard', { timeout: 15000 });
}

// ============================================================
// Test 1: Login Flow
// ============================================================

test('Test 1: Login Flow', async ({ page }) => {
  // Navigate to login page
  await page.goto('/case-management/login');

  // Verify login page loads
  await expect(page.locator('h1')).toContainText('Case Management System');

  // Fill credentials
  await page.fill('#cms-email', LOGIN_EMAIL);
  await page.fill('#cms-password', LOGIN_PASSWORD);

  // Click Sign In
  await page.click('button[type="submit"]');

  // Verify redirect to dashboard
  await page.waitForURL('**/case-management/dashboard', { timeout: 15000 });
  expect(page.url()).toContain('/dashboard');

  // Verify dashboard loads with stat cards visible (wait for loading to finish)
  // The stat cards are inside a grid; each card has a label like "Total Active"
  await page.waitForSelector('text=Total Active', { timeout: 15000 });
  const statCards = page.locator('text=Total Active');
  await expect(statCards.first()).toBeVisible();
});

// ============================================================
// Test 2: Dashboard Verification
// ============================================================

test('Test 2: Dashboard Verification', async ({ page }) => {
  await login(page);

  // Verify header with "Case Management System" text
  await expect(page.locator('h1:has-text("Case Management System")')).toBeVisible();

  // Wait for dashboard data to load (stat cards appear after async fetch)
  await page.waitForSelector('text=Total Active', { timeout: 15000 });

  // Verify at least 3 stat cards are visible
  // Stat card labels: Total Active, Hearings This Week, Pending Compliance, Counter Not Filed, Disposed, By Court
  const statLabels = ['Total Active', 'Hearings This Week', 'Pending Compliance'];
  for (const label of statLabels) {
    await expect(page.locator(`text=${label}`).first()).toBeVisible();
  }

  // Verify navigation tabs are visible (Dashboard, Cases, Hearings, etc.)
  const navTabs = ['Dashboard', 'Cases', 'Hearings', 'Calendar', 'Compliance', 'Filings'];
  for (const tab of navTabs) {
    await expect(page.locator(`nav >> text=${tab}`).first()).toBeVisible();
  }
});

// ============================================================
// Test 3: Cases Page
// ============================================================

test('Test 3: Cases Page', async ({ page }) => {
  await login(page);

  // Navigate to cases page
  await page.goto('/case-management/cases');

  // Wait for cases to load (the "All Cases" heading appears immediately, table loads after)
  await expect(page.locator('h1:has-text("All Cases")')).toBeVisible();

  // Wait for loading to finish - cases table rows or "total" text appears
  await page.waitForFunction(
    () => {
      const text = document.body.innerText;
      return text.includes('total') && !text.includes('loading...');
    },
    { timeout: 15000 }
  );

  // Verify the cases table loads with data rows
  // The table has rows with case number links
  const tableRows = page.locator('table tbody tr');
  await expect(tableRows.first()).toBeVisible({ timeout: 10000 });
  const rowCount = await tableRows.count();
  expect(rowCount).toBeGreaterThan(0);

  // Verify filter dropdowns are present (CaseFilters has select elements)
  const filterSelects = page.locator('select');
  const selectCount = await filterSelects.count();
  expect(selectCount).toBeGreaterThan(0);

  // Verify search input exists
  const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], input[placeholder*="search"]');
  await expect(searchInput.first()).toBeVisible();

  // Verify pagination shows (CasePagination component)
  // Look for page numbers or "Showing" text
  const pagination = page.locator('text=/Showing|Page/i');
  await expect(pagination.first()).toBeVisible();
});

// ============================================================
// Test 4: Navigation
// ============================================================

test('Test 4: Navigation through tabs', async ({ page }) => {
  await login(page);

  // Dashboard -> verify stat cards
  await page.click('nav >> text=Dashboard');
  await page.waitForURL('**/dashboard');
  await page.waitForSelector('text=Total Active', { timeout: 15000 });
  await expect(page.locator('text=Total Active').first()).toBeVisible();

  // Cases -> verify table
  await page.click('nav >> text=Cases');
  await page.waitForURL('**/cases');
  await expect(page.locator('h1:has-text("All Cases")')).toBeVisible();
  // Wait for table to load
  await page.waitForFunction(
    () => !document.body.innerText.includes('Loading cases...'),
    { timeout: 15000 }
  );
  await expect(page.locator('table').first()).toBeVisible({ timeout: 10000 });

  // Hearings -> verify hearing diary content
  await page.click('nav >> text=Hearings');
  await page.waitForURL('**/hearings');
  await expect(page.locator('h1:has-text("Hearing Diary")')).toBeVisible();
  // Wait for loading to finish
  await page.waitForFunction(
    () => !document.body.innerText.includes('Loading hearing data...'),
    { timeout: 15000 }
  );

  // Calendar -> verify calendar grid
  await page.click('nav >> text=Calendar');
  await page.waitForURL('**/calendar');
  await expect(page.locator('h1:has-text("Calendar View")')).toBeVisible();
  // Wait for loading to finish
  await page.waitForFunction(
    () => !document.body.innerText.includes('Loading calendar data...'),
    { timeout: 15000 }
  );
  // Verify month navigation is present (month name like "January", "March", etc.)
  const monthNav = page.locator('text=/January|February|March|April|May|June|July|August|September|October|November|December/');
  await expect(monthNav.first()).toBeVisible();

  // Compliance -> verify compliance content
  await page.click('nav >> text=Compliance');
  await page.waitForURL('**/compliance');
  await expect(page.locator('h1:has-text("Compliance Tracker")')).toBeVisible();
  // Wait for loading to finish
  await page.waitForFunction(
    () => {
      const text = document.body.innerText;
      return !text.includes('animate-pulse') || text.includes('total') || text.includes('All');
    },
    { timeout: 15000 }
  );

  // Filings -> verify filings content
  await page.click('nav >> text=Filings');
  await page.waitForURL('**/filings');
  await expect(page.locator('h1:has-text("Filings Tracker")')).toBeVisible();
});

// ============================================================
// Test 5: Case Detail
// ============================================================

test('Test 5: Case Detail', async ({ page }) => {
  await login(page);

  // Navigate to cases page
  await page.goto('/case-management/cases');

  // Wait for cases table to load
  await page.waitForFunction(
    () => !document.body.innerText.includes('Loading cases...'),
    { timeout: 15000 }
  );

  // Click the first case's view button/link (the case number link in the table)
  const firstCaseLink = page.locator('table tbody tr a').first();
  await expect(firstCaseLink).toBeVisible({ timeout: 10000 });

  // Get the href to verify navigation
  const href = await firstCaseLink.getAttribute('href');
  expect(href).toContain('/case-management/cases/');

  await firstCaseLink.click();

  // Verify case detail page loads
  await page.waitForURL('**/case-management/cases/**');

  // Wait for loading to finish - case info should appear
  await page.waitForFunction(
    () => {
      const text = document.body.innerText;
      return text.includes('Case Information') || text.includes('Back to Cases');
    },
    { timeout: 15000 }
  );

  // Verify case detail page has case information
  await expect(page.locator('text=Case Information')).toBeVisible();
  await expect(page.locator('text=Back to Cases')).toBeVisible();

  // Verify key fields are present
  await expect(page.locator('text=Case No.').first()).toBeVisible();
  await expect(page.getByText('Court', { exact: true }).first()).toBeVisible();
});

// ============================================================
// Test 6: Main Website CMS Link
// ============================================================

test('Test 6: Main Website CMS Link', async ({ page }) => {
  // Navigate to the main homepage
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // Verify "Case Management" link exists in the navigation
  const cmsLink = page.locator('a:has-text("Case Management")');
  await expect(cmsLink.first()).toBeVisible({ timeout: 10000 });

  // Verify the link points to the CMS dashboard
  const href = await cmsLink.first().getAttribute('href');
  expect(href).toContain('case-management');
});

// ============================================================
// Test 7: Login Required (Auth Guard)
// ============================================================

test('Test 7: Login Required - redirect to login when not authenticated', async ({ page }) => {
  // Navigate to the dashboard first with a clean state (no login)
  // Clear any potential localStorage by navigating to the app first
  await page.goto('/case-management/login');
  await page.waitForLoadState('domcontentloaded');

  // Clear localStorage to simulate logged-out state
  await page.evaluate(() => {
    localStorage.clear();
  });

  // Navigate directly to dashboard
  await page.goto('/case-management/dashboard');

  // Verify redirect to login page
  await page.waitForURL('**/case-management/login', { timeout: 15000 });
  expect(page.url()).toContain('/case-management/login');

  // Verify login page is shown
  await expect(page.locator('h1:has-text("Case Management System")')).toBeVisible();
});
