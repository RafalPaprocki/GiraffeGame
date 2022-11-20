import { Hands, HAND_CONNECTIONS, Results } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks, lerp } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";

console.log('Initializing hands detection...')
const _hands = new Hands({
	locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

_hands.setOptions({
	maxNumHands: 2,
	modelComplexity: 1,
	minDetectionConfidence: 0.5,
	minTrackingConfidence: 0.5,
});

let _overlayCanvasCtx;

// const _eventHandlers = []; // TODO


/**
 * Last detected raw hand detection results
 * @returns {Results}
 */
export const getLastHandsResults = () => _lastHandsResults;
let _lastHandsResults = null;

/**
 * Initializes MediaPipe with hand detection
 * @param container {HTMLElement}
 */
export function mediaPipeInit(container) {
	const videoElement = document.createElement('video');
	videoElement.width = container.offsetWidth;
	videoElement.height = container.offsetHeight;
	videoElement.classList.add('input_video');
	const canvasElement = document.createElement('canvas');
	canvasElement.width = container.offsetWidth;
	canvasElement.height = container.offsetHeight;
	canvasElement.classList.add('output_canvas', 'selfie')
	container.appendChild(videoElement);
	container.appendChild(canvasElement);
	_overlayCanvasCtx = canvasElement.getContext('2d');

	_hands.onResults(_onResults);

	const camera = new Camera(videoElement, {
		onFrame: async () => {
			await _hands.send({ image: videoElement });
		},
		// width: 1280,
		// height: 720
	});
	camera.start();
}

// TODO //
// /**
//  * Registers gesture event handler
//  * @param {Function} handler Event handler function
//  */
// export function registerEventHandler(handler) {
// 	if (typeof handler === 'function') {
// 		_eventHandlers.push(handler);
// 	}
// }

// /**
//  * Sends event to all registered event handlers
//  * @param {GestureEvent} event Detected gesture event object
//  */
// function _notifyEvent(event) {
// 	_eventHandlers.forEach((handler) => handler(event));
// }

/**
 * On hands detection results callback
 * @param {Results} results Hands detection results
 */
function _onResults(results) {
	const SHOW_VIDEO = true;

	if (results.multiHandLandmarks.length && results.multiHandedness.length) {
		_lastHandsResults = results;
		withCanvas(_overlayCanvasCtx, (ctx) => {
			if (SHOW_VIDEO) ctx.drawImage(results.image, 0, 0, ctx.canvas.width, ctx.canvas.height);
			_drawHandOverlays(results, ctx, true);
		});
	} else {
		_lastHandsResults = null;
		withCanvas(_overlayCanvasCtx, (ctx) => {
			if (SHOW_VIDEO) ctx.drawImage(results.image, 0, 0, ctx.canvas.width, ctx.canvas.height);
		})
	}
}

/**
 * Draws hand overlays ("skeleton")
 * @param {Results} results
 * @param {CanvasRenderingContext2D} canvasCtx
 */
const _drawHandOverlays = (results, canvasCtx) => {
	forEachLandmarks(results, ({landmarks, isRightHand}) => {
		drawConnectors(
			canvasCtx, landmarks, HAND_CONNECTIONS,
			{ color: isRightHand ? '#00FF00' : '#FF0000' }
		);
		drawLandmarks(canvasCtx, landmarks, {
			color: isRightHand ? '#00FF00' : '#FF0000',
			fillColor: isRightHand ? '#FF0000' : '#00FF00',
			radius: (data) => {
				return lerp(data.from.z, -0.15, .1, 10, 1);
			}
		});
	});
}

const clearCanvas = (canvasCtx) => {
	const { canvas } = canvasCtx;
	canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * @param {CanvasRenderingContext2D} canvasCtx Canvas 2D context
 */
 const withCanvas = (canvasCtx, drawingFunction) => {
	canvasCtx.save();
	clearCanvas(canvasCtx);
	if (typeof drawingFunction === 'function') {
		drawingFunction(canvasCtx);
	}
	canvasCtx.restore();
}

/**
 * Do something for each result landmark
 * @param {Results} results
 * @param {Funnction} callback Calback to run for each result
 */
export const forEachLandmarks = (results, callback) => {
	for (let index = 0; index < results.multiHandLandmarks.length; index++) {
		const classification = results.multiHandedness[index];
		const isRightHand = classification.label === 'Right';
		const landmarks = results.multiHandLandmarks[index];
		const worldLandmarks = results.multiHandWorldLandmarks[index];
		callback({
			isRightHand,
			landmarks,
			worldLandmarks,
		});
	}
}
