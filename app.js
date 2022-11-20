import {Application, Assets, Sprite, utils} from 'pixi.js';
import { mediaPipeInit } from './handDetection';

const CONTAINER_WIDTH = 900;
const CONTAINER_HEIGHT = 640;


// The application will create a canvas element for you that you
// can then insert into the DOM
async function pixiInit(container = document.body, viewWidth = CONTAINER_WIDTH, viewHeight = CONTAINER_HEIGHT) {
    const app = new Application({
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
    });

    container.appendChild(app.view);

    // load the texture we need
    const texture = await Assets.load("assets/bunny.png");

    // This creates a texture from a 'bunny.png' image
    const bunny = new Sprite(texture);

    // Setup the position of the bunny
    bunny.x = app.renderer.width / 2;
    bunny.y = app.renderer.height / 2;

    // Rotate around the center
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;

    // Add the bunny to the scene we are building
    app.stage.addChild(bunny);

    // Listen for frame updates
    app.ticker.add(() => {
        // each frame we spin the bunny around a bit
        bunny.rotation += 0.01;
    })
}

window.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    container.style.width = CONTAINER_WIDTH + 'px';
    container.style.height = CONTAINER_HEIGHT + 'px';
    pixiInit(container);
    mediaPipeInit(container);
});
