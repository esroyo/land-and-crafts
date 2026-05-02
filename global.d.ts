interface Window {
    detailsSection: HTMLDivElement;
    headerSection: HTMLDivElement;
    headerDescription: HTMLDivElement;
    mapSection: HTMLDivElement;
    sidebarSection: HTMLDivElement;
    map: {
        getZoom: () => number;
        getCenter: () => { lat: number; lng: number };
    };
}
