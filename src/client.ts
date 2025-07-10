import { LatLng, Map } from 'leaflet';
const { details } = window;

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
        const projectSelector = `[data-project-id="${projectId}"]`;
        const isHidden = () => details.classList.contains('hide');
        const hasSameDetails = () =>
            !!details.querySelector(projectSelector);
        const updateDetails = () => {
            const tmpl = document.querySelector<HTMLTemplateElement>(
                `${projectSelector} template`,
            );
            if (tmpl) {
                details.replaceChildren(tmpl.content.cloneNode(true));
                map?.flyTo(
                    new LatLng(
                        projectCoordinates[0],
                        projectCoordinates[1] + 1,
                    ),
                    8,
                );
            }
        };
        const showDetails = () => {
            if (!hasSameDetails()) {
                updateDetails();
            }
            details.classList.remove('hide');
        };
        const hideAndMaybeUpdate = () => {
            details.classList.add('hide');
            if (hasSameDetails()) {
                return;
            }
            details.addEventListener('transitionend', showDetails, {
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
