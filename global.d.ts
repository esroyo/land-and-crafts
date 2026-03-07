interface Window {
    detailsSection: HTMLDivElement;
    headerSection: HTMLDivElement;
    mapSection: HTMLDivElement;
    sidebarSection: HTMLDivElement;
    map: {
        getZoom: () => number;
        getCenter: () => { lat: number; lng: number };
    };
}
