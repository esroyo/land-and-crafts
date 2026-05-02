import { expect, test } from '@playwright/test';

test.describe('carousel gallery', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Open the first project that has a carousel.
        await page.locator('project-card').first().click();

        // Find a visible carousel inside the open details panel.
        const carousel = page.locator(
            'project-details[data-project-selected="1"] carousel-gallery',
        ).first();
        await expect(carousel, 'carousel is mounted').toBeVisible();
        await expect(
            carousel.locator('.carousel-container'),
            'carousel structure is built',
        ).toBeVisible();
    });

    test('navigates with the next/prev buttons and updates indicators', async ({ page }) => {
        const carousel = page.locator(
            'project-details[data-project-selected="1"] carousel-gallery',
        ).first();

        // First indicator is active by default.
        await expect(
            carousel.locator('.carousel-indicator').nth(0),
            'first indicator active by default',
        ).toHaveClass(/active/);

        await carousel.locator('.carousel-nav.next').click();
        await expect(
            carousel.locator('.carousel-indicator').nth(1),
            'second indicator active after next',
        ).toHaveClass(/active/);

        await carousel.locator('.carousel-nav.prev').click();
        await expect(
            carousel.locator('.carousel-indicator').nth(0),
            'first indicator active after prev',
        ).toHaveClass(/active/);

        // aria-label reflects current slide.
        await expect(carousel).toHaveAttribute('aria-label', /Image 1 of \d+/);
    });

    test('clicking an indicator jumps to that slide', async ({ page }) => {
        const carousel = page.locator(
            'project-details[data-project-selected="1"] carousel-gallery',
        ).first();
        const indicators = carousel.locator('.carousel-indicator');
        const count = await indicators.count();
        expect(count, 'has at least 2 indicators').toBeGreaterThan(1);

        await indicators.nth(2).click();
        await expect(indicators.nth(2)).toHaveClass(/active/);
        await expect(carousel).toHaveAttribute(
            'aria-label',
            'Image 3 of ' + count,
        );
    });

    test('clicking a slide image opens the lightbox', async ({ page }) => {
        const carousel = page.locator(
            'project-details[data-project-selected="1"] carousel-gallery',
        ).first();
        const lightbox = page.locator('dialog.carousel-lightbox');

        // Lightbox is created lazily — should be absent before first open.
        await expect(lightbox, 'lightbox absent initially').toHaveCount(0);

        await carousel.locator('.carousel-slide img').first().click();

        await expect(lightbox, 'lightbox opens on image click').toHaveAttribute(
            'open',
            '',
        );
        await expect(
            lightbox.locator('.carousel-lightbox-image'),
            'lightbox image is visible',
        ).toBeVisible();
    });

    test('lightbox prev/next navigates and updates the displayed image', async ({ page }) => {
        const carousel = page.locator(
            'project-details[data-project-selected="1"] carousel-gallery',
        ).first();
        const lightbox = page.locator('dialog.carousel-lightbox');
        const lightboxImg = lightbox.locator('.carousel-lightbox-image');

        await carousel.locator('.carousel-slide img').first().click();
        await expect(lightbox).toHaveAttribute('open', '');

        const firstSrc = await lightboxImg.getAttribute('src');
        await lightbox.locator('.carousel-lightbox-nav.next').click();
        const secondSrc = await lightboxImg.getAttribute('src');
        expect(secondSrc, 'src changes after next').not.toBe(firstSrc);

        await lightbox.locator('.carousel-lightbox-nav.prev').click();
        const backSrc = await lightboxImg.getAttribute('src');
        expect(backSrc, 'src returns after prev').toBe(firstSrc);
    });

    test('lightbox closes on ESC key', async ({ page }) => {
        const carousel = page.locator(
            'project-details[data-project-selected="1"] carousel-gallery',
        ).first();
        const lightbox = page.locator('dialog.carousel-lightbox');

        await carousel.locator('.carousel-slide img').first().click();
        await expect(lightbox).toHaveAttribute('open', '');

        await page.keyboard.press('Escape');
        await expect(lightbox, 'closes on escape').not.toHaveAttribute(
            'open',
            '',
        );
    });

    test('lightbox closes on close button', async ({ page }) => {
        const carousel = page.locator(
            'project-details[data-project-selected="1"] carousel-gallery',
        ).first();
        const lightbox = page.locator('dialog.carousel-lightbox');

        await carousel.locator('.carousel-slide img').first().click();
        await expect(lightbox).toHaveAttribute('open', '');

        await lightbox.locator('.carousel-lightbox-close').click();
        await expect(lightbox, 'closes on close button').not.toHaveAttribute(
            'open',
            '',
        );
    });

    test('closing the lightbox clears the image src to avoid stale flashes', async ({ page }) => {
        const carousel = page.locator(
            'project-details[data-project-selected="1"] carousel-gallery',
        ).first();
        const lightbox = page.locator('dialog.carousel-lightbox');
        const lightboxImg = lightbox.locator('.carousel-lightbox-image');

        await carousel.locator('.carousel-slide img').first().click();
        await expect(lightbox).toHaveAttribute('open', '');
        await expect(lightboxImg, 'has a src while open').toHaveAttribute(
            'src',
            /.+/,
        );

        await page.keyboard.press('Escape');
        await expect(lightbox).not.toHaveAttribute('open', '');
        await expect(
            lightboxImg,
            'src is cleared on close',
        ).not.toHaveAttribute('src', /.+/);
    });

    test('arrow keys inside lightbox navigate images', async ({ page }) => {
        const carousel = page.locator(
            'project-details[data-project-selected="1"] carousel-gallery',
        ).first();
        const lightbox = page.locator('dialog.carousel-lightbox');
        const lightboxImg = lightbox.locator('.carousel-lightbox-image');

        await carousel.locator('.carousel-slide img').first().click();
        await expect(lightbox).toHaveAttribute('open', '');

        const firstSrc = await lightboxImg.getAttribute('src');
        await page.keyboard.press('ArrowRight');
        const afterRight = await lightboxImg.getAttribute('src');
        expect(afterRight, 'arrow right advances').not.toBe(firstSrc);

        await page.keyboard.press('ArrowLeft');
        const afterLeft = await lightboxImg.getAttribute('src');
        expect(afterLeft, 'arrow left returns').toBe(firstSrc);
    });
});
