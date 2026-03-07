import { expect, test } from '@playwright/test';

test('clicking a project card shows the project details', async ({ page }) => {
    await page.goto('/');

    const card = page.locator('project-card').first();
    const projectId = await card.getAttribute('data-project-id');
    const coords = (await card.getAttribute('data-project-coordinates'))
        .split(',').map(Number);
    const isDesktop = await page.evaluate(() =>
        !globalThis.matchMedia('(max-width: 768px)').matches
    );
    const expectedLng = coords[1] + (isDesktop ? 1 : 0);

    await card.click();

    const selectedDetails = page.locator(
        `project-details[data-project-id="${projectId}"]`,
    );
    await expect(selectedDetails, 'clicked card details are selected')
        .toHaveAttribute('data-project-selected', '1');
    await expect(selectedDetails, 'clicked card details are visible')
        .toBeVisible();

    await expect(page, 'url includes project hash').toHaveURL(/#project:.+/);

    await page.waitForFunction(() => globalThis.map !== undefined);
    await page.waitForFunction(
        () => globalThis.map.getZoom() === 9,
        undefined,
        {
            timeout: 10000,
        },
    );
    const zoom = await page.evaluate(() => globalThis.map.getZoom());
    const center = await page.evaluate(() => globalThis.map.getCenter());

    await expect(zoom, 'zoom level is 9').toBe(9);
    await expect(center.lat, 'lat matches').toBeCloseTo(coords[0], 2);
    await expect(center.lng, 'lng matches').toBeCloseTo(expectedLng, 2);

    const otherDetails = page.locator(
        `project-details:not([data-project-id="${projectId}"])`,
    );
    const otherCount = await otherDetails.count();
    for (let i = 0; i < otherCount; i++) {
        await expect(otherDetails.nth(i)).toHaveAttribute(
            'data-project-selected',
            '0',
        );
        await expect(otherDetails.nth(i)).not.toBeVisible();
    }
});
