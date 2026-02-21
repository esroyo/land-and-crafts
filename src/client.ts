import { LatLng, Map } from 'leaflet';
import { getZoom } from './common.ts';
const { detailsSection, mapSection } = window;

let map: Map;
Map.addInitHook(function (this: Map) {
    map = this;
});

export const eventBus = new EventTarget();

window.addEventListener('DOMContentLoaded', () => {
    const [entityKind, entityId] = window.location.hash.slice(1).split(':');
    if (entityKind === 'project' && entityId) {
        const projectCard = document.querySelector<HTMLElement>(
            `project-card[data-project-id="${entityId}"]`,
        );
        console.log(entityId, entityKind, projectCard);
        projectCard?.click();
    }
});

eventBus.addEventListener(
    'project:details',
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
        };
        const showDetails = () => {
            if (!hasSameDetails()) {
                updateDetails();
            }
            const extraLng = window.matchMedia(`(max-width: 768px)`).matches
                ? 0
                : 1;
            map?.flyTo(
                new LatLng(
                    projectCoordinates[0],
                    projectCoordinates[1] + extraLng,
                ),
                9,
            );
            history.replaceState(null, '', `#project:${projectId}`);
            detailsSection.querySelector('.details-collection')?.scrollTo({ top: 0 });
            detailsSection.classList.remove('hide');
        };
        const hideAndMaybeUpdate = () => {
            detailsSection.classList.add('hide');
            if (hasSameDetails()) {
                const initialCoordinates = mapSection.dataset.initialCoordinates
                    .split(',').map(Number);
                map?.flyTo(
                    new LatLng(initialCoordinates[0], initialCoordinates[1]),
                    getZoom(),
                );
                history.replaceState(null, '', '/');
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
