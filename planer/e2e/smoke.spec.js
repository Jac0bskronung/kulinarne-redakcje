const { test, expect } = require('@playwright/test');

test.describe('Smoke — ładowanie aplikacji', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('strona ładuje się bez błędów', async ({ page }) => {
    await expect(page).toHaveTitle(/FinPulse|Planer|React|Emergent/i);
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
  });

  test('header jest widoczny', async ({ page }) => {
    await expect(page.locator('[data-testid="main-header"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('FinPulse');
  });

  test('nawigacja zakładek jest widoczna', async ({ page }) => {
    await expect(page.locator('[data-testid="tab-navigation"]').first()).toBeVisible();
  });

  test('zakładka Mieszkanie jest domyślnie aktywna', async ({ page }) => {
    const tab = page.locator('[data-testid="tab-housing"]').first();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  test('footer jest widoczny', async ({ page }) => {
    await expect(page.locator('[data-testid="main-footer"]')).toBeVisible();
    await expect(page.locator('[data-testid="main-footer"]')).toContainText('FinPulse');
  });
});

test.describe('Nawigacja zakładek', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Poczekaj na pełne załadowanie
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
  });

  test('przejście do zakładki Wiadomości AI', async ({ page }) => {
    await page.locator('[data-testid="tab-ai-news"]').first().click();

    // Poczekaj na animację przejścia (1.2s + bufor)
    await page.waitForTimeout(1500);

    const tab = page.locator('[data-testid="tab-ai-news"]').first();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  test('przejście do zakładki Remont', async ({ page }) => {
    await page.locator('[data-testid="tab-remont"]').first().click();

    await page.waitForTimeout(1500);

    const tab = page.locator('[data-testid="tab-remont"]').first();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  test('powrót do zakładki Mieszkanie', async ({ page }) => {
    // Przejdź do innej zakładki
    await page.locator('[data-testid="tab-remont"]').first().click();
    await page.waitForTimeout(1500);

    // Wróć do Mieszkanie
    await page.locator('[data-testid="tab-housing"]').first().click();
    await page.waitForTimeout(1500);

    const tab = page.locator('[data-testid="tab-housing"]').first();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  test('kliknięcie aktywnej zakładki nie powoduje błędu', async ({ page }) => {
    const tab = page.locator('[data-testid="tab-housing"]').first();
    await tab.click();
    await page.waitForTimeout(500);
    await expect(tab).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('Przyciski nagłówka', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
  });

  test('przycisk kalendarza jest klikalny', async ({ page }) => {
    await expect(page.locator('[data-testid="calendar-button"]')).toBeVisible();
    await page.locator('[data-testid="calendar-button"]').click();
  });

  test('przycisk powiadomień jest klikalny', async ({ page }) => {
    await expect(page.locator('[data-testid="notifications-button"]')).toBeVisible();
    await page.locator('[data-testid="notifications-button"]').click();
  });

  test('avatar użytkownika jest widoczny', async ({ page }) => {
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-avatar"]')).toContainText('MK');
  });
});

test.describe('Brak błędów JS w konsoli', () => {
  test('strona główna — brak błędów krytycznych', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    await page.waitForTimeout(1000);

    // Filtrujemy znane ostrzeżenia React (np. o brakujących key props w dev mode)
    const criticalErrors = errors.filter(
      (e) => !e.includes('Warning:') && !e.includes('ResizeObserver')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
