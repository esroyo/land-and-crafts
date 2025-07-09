export const eventBus = new EventTarget();

const { details, L, mainMap } = window;
const { LatLng } = L;

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
                mainMap.flyTo(
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
