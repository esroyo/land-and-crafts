import { expect, test } from '@playwright/test';

test.describe('header description on desktop', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('is open by default and shows the description', async ({ page }) => {
        await page.goto('/');

        const details = page.locator('#headerDescription');
        await expect(details, 'details element is open').toHaveAttribute(
            'open',
            '',
        );
        await expect(
            details.locator('p'),
            'description paragraph is visible',
        ).toBeVisible();
    });

    test('does not collapse the map area', async ({ page }) => {
        await page.goto('/');

        const map = page.locator('#mapSection');
        const box = await map.boundingBox();
        expect(box, 'map has a bounding box').not.toBeNull();
        expect(box!.width, 'map has positive width').toBeGreaterThan(0);
        expect(box!.height, 'map has positive height').toBeGreaterThan(0);
    });
});

test.describe('header description on mobile', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('is closed by default and hides the description', async ({ page }) => {
        await page.goto('/');

        const details = page.locator('#headerDescription');
        await expect(details, 'details element is closed').not.toHaveAttribute(
            'open',
            '',
        );
        await expect(
            details.locator('p'),
            'description paragraph is hidden',
        ).toBeHidden();
    });

    test('opens when summary is clicked', async ({ page }) => {
        await page.goto('/');

        const details = page.locator('#headerDescription');
        await details.locator('summary').click();

        await expect(details, 'details element is now open').toHaveAttribute(
            'open',
            '',
        );
        await expect(
            details.locator('p'),
            'description paragraph is now visible',
        ).toBeVisible();
    });

    test('does not collapse the map area', async ({ page }) => {
        await page.goto('/');

        const map = page.locator('#mapSection');
        const box = await map.boundingBox();
        expect(box, 'map has a bounding box').not.toBeNull();
        expect(box!.width, 'map has positive width').toBeGreaterThan(0);
        expect(box!.height, 'map has positive height').toBeGreaterThan(0);
    });
});
