import { LatLng, Map } from 'leaflet';
const { details: detailsSection } = window;

let map: Map;
Map.addInitHook(function (this: Map) {
    map = this;
});

export const eventBus = new EventTarget();

eventBus.addEventListener(
    'project:show-details',
    (ev: CustomEvent<Record<'projectCoordinates' | 'projectId', string>>) => {
        const projectId = ev.detail.projectId;
        const projectCoordinates = ev.detail.projectCoordinates.split(',').map(
            Number,
        );
        const isHidden = () => detailsSection.classList.contains('hide');
        const hasSameDetails = () =>
            !!detailsSection.querySelector(
                `project-details[data-project-id="${projectId}"][data-project-selected="1"]`,
            );
        const updateDetails = () => {
            for (
                const projectDetails of detailsSection.querySelectorAll<
                    HTMLElement
                >('project-details')
            ) {
                const selected = projectDetails.dataset.projectId === projectId
                    ? '1'
                    : '0';
                projectDetails.dataset.projectSelected = selected;
            }
            map?.flyTo(
                new LatLng(
                    projectCoordinates[0],
                    projectCoordinates[1] + 1,
                ),
                8,
            );
        };
        const showDetails = () => {
            if (!hasSameDetails()) {
                updateDetails();
            }
            detailsSection.classList.remove('hide');
        };
        const hideAndMaybeUpdate = () => {
            detailsSection.classList.add('hide');
            if (hasSameDetails()) {
                return;
            }
            detailsSection.addEventListener('transitionend', showDetails, {
                once: true,
            });
        };
        if (isHidden()) {
            showDetails();
        } else {
            hideAndMaybeUpdate();
        }
    },
);
