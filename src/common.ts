export const title = 'Land & Crafts';
export const description =
    'Map of Site-specific art installations exploring human-nature relationships through biocentric, multispecies design. Each project creates aesthetic experiences integrated with local environments using traditional and contemporary crafts.';
export const TILES_URL = 'https://b.tile.openstreetmap.fr/hot';
// zoom = floor((width - 100) / 350) + 3
export const getZoom = (
    w: number = window?.visualViewport?.width ?? window.innerWidth,
) => Math.max(3, Math.min(6, Math.floor((w - 100) / 350) + 3));
