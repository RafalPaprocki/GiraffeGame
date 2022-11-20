import { pixiInit } from './game';
import { mediaPipeInit, registerEventHandler } from './handDetection';

const CONTAINER_WIDTH = 900;
const CONTAINER_HEIGHT = 640;

function main() {
    const container = document.querySelector('.container');
    container.style.width = CONTAINER_WIDTH + 'px';
    container.style.height = CONTAINER_HEIGHT + 'px';
    pixiInit(container);
    mediaPipeInit(container);
    registerEventHandler((event) => {
        
    });
};

window.addEventListener('DOMContentLoaded', main);
