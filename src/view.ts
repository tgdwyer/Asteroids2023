// Update the view according to the given State.
// All dependencies on SVG and HTML are isolated to this file.
export { updateView }

import { State, Body, Constants } from './types'
import { attr, isNotNullOrUndefined } from './util'

/**
 * Update the SVG game view.  
 * 
 * @param onFinish a callback function to be applied when the game ends.  For example, to clean up subscriptions.
 * @param s the current game model State
 * @returns void
 */
function updateView(onFinish: () => void) {
    return function (s: State):void {
        const
            svg = document.getElementById("svgCanvas"),
            ship = document.getElementById("ship")

        // if getElement is null, exit function early without doing anything
        if (!svg || !ship) return

        // document.getElementById can return null
        // so use optional chaining to safely access method on element
        const show = (id: string, condition: boolean) => ((e: HTMLElement | null) =>
            condition ? e?.classList.remove('hidden')
                : e?.classList.add('hidden'))(document.getElementById(id))

        // null checking above cannot apply in updateBodyView
        // typescript cannot narrow the type down outside the scope because
        // it can't guarantee that this function gets called synchronously
        const updateBodyView = (rootSVG: HTMLElement) => (b: Body) => {
            function createBodyView() {
                const v = document.createElementNS(rootSVG.namespaceURI, "ellipse");
                attr(v, { id: b.id, rx: b.radius, ry: b.radius });
                v.classList.add(b.viewType)
                rootSVG.appendChild(v)
                return v;
            }
            const v = document.getElementById(b.id) || createBodyView();
            attr(v, { cx: b.pos.x, cy: b.pos.y });
        };
        attr(ship, { transform: `translate(${s.ship.pos.x},${s.ship.pos.y}) rotate(${s.ship.angle})` });
        show("leftThrust", s.ship.torque < 0);
        show("rightThrust", s.ship.torque > 0);
        show("thruster", s.ship.acc.len() > 0);
        s.bullets.forEach(updateBodyView(svg));
        s.rocks.forEach(updateBodyView(svg));
        s.exit.map(o => document.getElementById(o.id))
            .filter(isNotNullOrUndefined)
            .forEach(v => {
                try {
                    svg.removeChild(v)
                } catch (e) {
                    // rarely it can happen that a bullet can be in exit
                    // for both expiring and colliding in the same tick,
                    // which will cause this exception
                    console.log("Already removed: " + v.id)
                }
            })
        if (s.gameOver) {
            const v = document.createElementNS(svg.namespaceURI, "text");
            attr(v, { x: Constants.CanvasSize / 6, y: Constants.CanvasSize / 2, class: "gameover" });
            v.textContent = "Game Over";
            svg.appendChild(v);
            onFinish();
        }
    }
}