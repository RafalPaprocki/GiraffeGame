import { Hands, HAND_CONNECTIONS, Results } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks, lerp } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
import { drawCircle, drawLine, forEachLandmarks, landmarkScaler, scaleLandmark, withCanvas } from "./utils";
import { INDEX_FINGER_TIP, THUMB_TIP } from "./HandLandmarks";

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
let _containerWidth, _containerHeight;

const _eventHandlers = {
	pointTip: [],
	pinch: [],
	pinchRelease: [],
	pinchMove: [],
};
export const GESTURE_EVENTS = Object.keys(_eventHandlers);

const _gestureState = {
	pinch: {
		pinched: false,
	}
};

const PINCH_THRESHOLD = 0.08;
const PINCH_RELEASE_THRESHOLD = 0.12;


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
	_containerWidth = container.offsetWidth;
	_containerHeight = container.offsetHeight;
	const videoElement = document.createElement('video');
	videoElement.width = _containerWidth;
	videoElement.height = _containerHeight;
	videoElement.classList.add('input_video');
	const canvasElement = document.createElement('canvas');
	canvasElement.width = _containerWidth;
	canvasElement.height = _containerHeight;
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

/**
 * Registers gesture event handler
 * @param {Function} handler Event handler function
 */
export function registerEventHandler(eventName, handler) {
	if (typeof handler === 'function' && GESTURE_EVENTS.includes(eventName)) {
		_eventHandlers[eventName].push(handler);
	}
}

export function removeEventHandler(eventName, handler) {
	if (GESTURE_EVENTS.includes(eventName)) {
		_eventHandlers[eventName] = _eventHandlers[eventName].filter(x => x !== handler);
	}
}

/**
 * Sends event to all registered event handlers
 * @param {string} event Detected gesture event name
 * @param {GestureEvent} event Detected gesture event object
 */
function _fireEvent(eventName, eventData) {
	if (GESTURE_EVENTS.includes(eventName)) {
		_eventHandlers[eventName].forEach((handler) => handler(eventData));
	}
}

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
			// _drawHandOverlays(results, ctx);
		});
		const pinchMeasurement = _calcPinchDistance(results)[0];
		console.log('pinchMeasurement', pinchMeasurement);
		if (!_gestureState.pinch.pinched && pinchMeasurement.pinchDist < PINCH_THRESHOLD) {
			_gestureState.pinch.pinched = true;
			_fireEvent('pinch', { pinched: true, ...pinchMeasurement });
		} else if (_gestureState.pinch.pinched && pinchMeasurement.pinchDist > PINCH_RELEASE_THRESHOLD) {
			_gestureState.pinch.pinched = false;
			_fireEvent('pinchRelease', { pinched: false, ...pinchMeasurement });
		}
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
	forEachLandmarks(results, ({ landmarks, isRightHand }) => {
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

/**
 * Calculate "pinch" distance (between index finger and thumb)
 * @param {Results} results Hands detestion results
 */
const _calcPinchDistance = (results) => {
	console.log('calcPichDist  start')
	return forEachLandmarks(results, ({ landmarks }) => {
		console.log('calcPichDist  forEach iteration')
		const scaleLandmark = landmarkScaler(_containerWidth, _containerHeight);
		const indexFingertipRaw = landmarks[INDEX_FINGER_TIP];
		const thumbFingertipRaw = landmarks[THUMB_TIP];
		const indexFingertip = scaleLandmark(indexFingertipRaw);
		const thumbFingertip = scaleLandmark(thumbFingertipRaw);
		console.log('calcPinchDist: index', indexFingertipRaw.x, indexFingertipRaw.y, indexFingertipRaw.z)
		console.log('calcPinchDist: thumb', thumbFingertipRaw.x, thumbFingertipRaw.y, thumbFingertipRaw.z)
		const pinchDist = _euclideanDistance(indexFingertipRaw.x, thumbFingertipRaw.x, indexFingertipRaw.y, thumbFingertipRaw.y)
		const pinchDistRawPercent = Math.round(100 * pinchDist);
		withCanvas(_overlayCanvasCtx, _markPinchDist(pinchDistRawPercent, indexFingertip, thumbFingertip), false);

		const lineMiddlePoint = (x0, x1) => x0 + ((x1 - x0) / 2);
		return {
			pinchDist,
			middleX: lineMiddlePoint(indexFingertip.x, thumbFingertip.x),
			middleY: lineMiddlePoint(indexFingertip.y, thumbFingertip.y),
		};
	});
};

const _euclideanDistance = (x0, x1, y0, y1) => {
	const dX = x1 - x0;
	const dY = y1 - y0;
	return Math.sqrt(dX ** 2 + dY ** 2);
};

const _markPinchDist = (pinchDist, indexFingertip, thumbFingertip) => (ctx) => {
	drawLine(ctx, indexFingertip.x, indexFingertip.y, thumbFingertip.x, thumbFingertip.y, '#BADA55');
	drawCircle(ctx, indexFingertip.x, indexFingertip.y, 5, 'blue');
	drawCircle(ctx, thumbFingertip.x, thumbFingertip.y, 5, 'red');
	const lineMiddlePoint = (x0, x1) => x0 + ((x1 - x0) / 2);
	const middleX = lineMiddlePoint(indexFingertip.x, thumbFingertip.x);
	const middleY = lineMiddlePoint(indexFingertip.y, thumbFingertip.y);
	ctx.font = '25px serif-sans';
	ctx.fillText(pinchDist, middleX, middleY);
};
