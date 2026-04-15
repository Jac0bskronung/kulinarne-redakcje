const { test, expect } = require('@playwright/test');

test.describe('Dodaj nowy koszt stały', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="housing-expenses-tab"]')).toBeVisible({ timeout: 10000 });
  });

  test('przycisk "Dodaj nowy koszt stały" jest widoczny obok napisu', async ({ page }) => {
    const btn = page.locator('[data-testid="add-category-btn"]');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText('Dodaj nowy koszt stały');
  });

  test('przycisk otwiera modal', async ({ page }) => {
    await page.locator('[data-testid="add-category-btn"]').click();
    await expect(page.locator('[data-testid="add-category-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-category-name-input"]')).toBeVisible();
  });

  test('przycisk X zamyka modal', async ({ page }) => {
    await page.locator('[data-testid="add-category-btn"]').click();
    await expect(page.locator('[data-testid="add-category-modal"]')).toBeVisible();

    await page.locator('[data-testid="add-category-modal-close"]').click();
    await expect(page.locator('[data-testid="add-category-modal"]')).not.toBeVisible();
  });

  test('kliknięcie backdrop zamyka modal', async ({ page }) => {
    await page.locator('[data-testid="add-category-btn"]').click();
    await expect(page.locator('[data-testid="add-category-modal"]')).toBeVisible();

    // Klik bezpośrednio na element backdrop
    await page.locator('.backdrop-blur-sm').click({ position: { x: 5, y: 5 }, force: true });
    await expect(page.locator('[data-testid="add-category-modal"]')).not.toBeVisible();
  });

  test('przycisk Dodaj jest nieaktywny gdy pole nazwy puste', async ({ page }) => {
    await page.locator('[data-testid="add-category-btn"]').click();
    const submitBtn = page.locator('[data-testid="add-category-submit"]');
    await expect(submitBtn).toBeDisabled();
  });

  test('przycisk Dodaj aktywuje się po wpisaniu nazwy', async ({ page }) => {
    await page.locator('[data-testid="add-category-btn"]').click();
    await page.locator('[data-testid="add-category-name-input"]').fill('Test Kategoria');
    const submitBtn = page.locator('[data-testid="add-category-submit"]');
    await expect(submitBtn).not.toBeDisabled();
  });

  test('wybór ikony zmienia aktywną ikonę', async ({ page }) => {
    await page.locator('[data-testid="add-category-btn"]').click();
    const zap = page.locator('[data-testid="icon-option-Zap"]');
    await zap.click();
    // Ikona powinna mieć klasę wybrania (border emerald)
    await expect(zap).toHaveClass(/border-emerald-500/);
  });

  test('anuluj zamyka modal bez zmian', async ({ page }) => {
    await page.locator('[data-testid="add-category-btn"]').click();
    await page.locator('[data-testid="add-category-name-input"]').fill('Coś do anulowania');
    await page.getByRole('button', { name: 'Anuluj' }).click();
    await expect(page.locator('[data-testid="add-category-modal"]')).not.toBeVisible();
  });
});
