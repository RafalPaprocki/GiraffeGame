import {
	Application,
	Assets,
	Sprite
} from 'pixi.js';

import { lerp } from '@mediapipe/drawing_utils';
import { extensions } from '@pixi/core';
import { InteractionManager } from '@pixi/interaction';
extensions.add(InteractionManager);

import { forEachLandmarks, getLastHandsResults, registerEventHandler } from './handDetection';
import HandLandmarks from './HandLandmarks';


/**
 * The application will create a canvas element for you that you
 * can then insert into the DOM
 * @param {HTMLDivElement} container Game canvas container element
 */
export async function pixiInit(container = document.body) {
    const app = new Application({
        width: container.offsetWidth,
        height: container.offsetHeight,
    });
    const { renderer } = app;
    const { interaction } = renderer.plugins;

    container.appendChild(app.view);

    // load the texture we need
    const texture = await Assets.load("assets/bunny.png");

    // This creates a texture from a 'bunny.png' image
    const bunny = new Sprite(texture);

    // Setup the position of the bunny
    bunny.x = renderer.width / 2;
    bunny.y = renderer.height / 2;

    // Rotate around the center
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;

    // Add the bunny to the scene we are building
    app.stage.addChild(bunny);

    // Listen for frame updates
    app.ticker.add(() => {
        // each frame we spin the bunny around a bit
        bunny.rotation += 0.01;
    });
    app.ticker.add(() => {
        const mousePosition = interaction.mouse.global;
        bunny.position = mousePosition;
    })
	app.ticker.add(() => {
		const handsResults = getLastHandsResults();
		if (handsResults !== null) {
			forEachLandmarks(handsResults, ({ landmarks, worldLandmarks }) => {
				const fingertipLandmark = landmarks[HandLandmarks.INDEX_FINGER_TIP];
				const scaledLandmarkX = lerp(fingertipLandmark.x, 1, 0, 0, renderer.width);
				const scaledLandmarkY = lerp(fingertipLandmark.y, 0, 1, 0, renderer.height);

				bunny.position.x = scaledLandmarkX;
				bunny.position.y = scaledLandmarkY;
			})
		}
	});
}
