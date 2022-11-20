import {
    Application,
    Assets,
    Sprite,
} from 'pixi.js';

import { lerp } from '@mediapipe/drawing_utils';
import { extensions } from '@pixi/core';
import { InteractionManager } from '@pixi/interaction';
extensions.add(InteractionManager);

import { getLastHandsResults, PINCH_RELEASE_THRESHOLD, PINCH_THRESHOLD, registerEventHandler } from './handDetection';
import * as HandLandmarks from './handDetection/HandLandmarks';
import { forEachLandmarks } from './handDetection/utils';

let _app = null;
let _renderer = null;
let _interaction = null;

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
    _app = app;
    _renderer = app.renderer;
    _interaction = app.renderer.plugins.interaction;

    container.appendChild(app.view);

    // load the texture we need
    const texture = await Assets.load("assets/bunny.png");

    // This creates a texture from a 'bunny.png' image
    const bunny = new Sprite(texture);

    // Setup the position of the bunny
    bunny.scale.set(2);
    bunny.x = _renderer.width / 2;
    bunny.y = _renderer.height / 2;

    // Rotate around the center
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;

    // Add the bunny to the scene we are building
    app.stage.addChild(bunny);

    // Listen for frame updates
    app.ticker.add(rotateSlowlyTicker(bunny));
    // app.ticker.add(followMouseTicker(bunny));
    // app.ticker.add(followIndexFingertipTicker(bunny));

    const events = {
        pinch: null,
    };
    const bunnyFollowPinchedFingers = followPinchedFingersTicker(bunny, events);
    registerEventHandler('pinch', (event) => {
        console.log('!!! pinch', event);
        // bunny.scale.set(0.8);
        events.pinch = event;
        app.ticker.add(bunnyFollowPinchedFingers);
    });
    registerEventHandler('pinchMove', (event) => {
        // console.log('pinchMove', event);
        events.pinch = event;
        if (event.pinched) {
            bunny.position.x = event.middleX;
            bunny.position.y = event.middleY;
            const scale = lerp(event.pinchDistance, PINCH_THRESHOLD, PINCH_RELEASE_THRESHOLD, 1, 2);
            console.log(scale);
            bunny.scale.set(scale);
        }
    });
    registerEventHandler('pinchRelease', (event) => {
        console.log('!!! pinchRelease', event);
        bunny.scale.set(2);
        events.pinch = event;
        app.ticker.remove(bunnyFollowPinchedFingers);
    });
}

const rotateSlowlyTicker = (container) => () => {
    // each frame we spin the bunny around a bit
    container.rotation += 0.01;
};

const followMouseTicker = (container) => () => {
    const mousePosition = _interaction.mouse.global;
    container.position = mousePosition;
};

const followIndexFingertipTicker = (container) => () => {
    const handsResults = getLastHandsResults();
    if (handsResults !== null) {
        forEachLandmarks(handsResults, ({ landmarks, worldLandmarks }) => {
            const fingertipLandmark = landmarks[HandLandmarks.INDEX_FINGER_TIP];
            const scaledLandmarkX = lerp(fingertipLandmark.x, 1, 0, 0, _renderer.width);
            const scaledLandmarkY = lerp(fingertipLandmark.y, 0, 1, 0, _renderer.height);

            container.position.x = scaledLandmarkX;
            container.position.y = scaledLandmarkY;
        })
    }
};

const followPinchedFingersTicker = (container, events) => () => {
    container.position.x = events.pinch.middleX;
    container.position.y = events.pinch.middleY;
};
