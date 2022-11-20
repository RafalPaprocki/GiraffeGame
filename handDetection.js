import { Hands, HAND_CONNECTIONS, Results } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks, lerp } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";

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

/**
 * Initializs MediaPipe with hand detection
 * @param container {HTMLElement}
 */
export function mediaPipeInit(container) {
	console.log('container', container)
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

	_hands.onResults(onResults);

	const camera = new Camera(videoElement, {
		onFrame: async () => {
			await _hands.send({ image: videoElement });
		},
		width: 1280,
		height: 720
	});
	camera.start();
}

/**
 * On hands detection results callback
 * @param {Results} results Hands detection results
 */
function onResults(results) {
	console.log(results)
	drawHandOverlays(results, _overlayCanvasCtx);
	// updateHandLandmarks();
}

/**
 * Draws hand overlays ("skeleton")
 * @param {Results} results
 * @param {CanvasRenderingContext2D} canvasCtx
 */
function drawHandOverlays(results, canvasCtx) {
	const { canvas } = canvasCtx;
	canvasCtx.save();
	canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
	canvasCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

	if (results.multiHandLandmarks && results.multiHandedness) {
		for (let index = 0; index < results.multiHandLandmarks.length; index++) {
			const classification = results.multiHandedness[index];
			const isRightHand = classification.label === 'Right';
			const landmarks = results.multiHandLandmarks[index];
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
		}
	}
	canvasCtx.restore();
}

// function updateHandLandmarks() {
// 	if (results.multiHandWorldLandmarks) {
// 		// We only get to call updateLandmarks once, so we need to cook the data to
// 		// fit. The landmarks just merge, but the connections need to be offset.
// 		const landmarks = results.multiHandWorldLandmarks.reduce(
// 			(prev, current) => [...prev, ...current], []);
// 		const colors = [];
// 		/**
// 		 * @param {LandmarkConnectionArray}
// 		 */
// 		const connections = [];
// 		for (let loop = 0; loop < results.multiHandWorldLandmarks.length; ++loop) {
// 			const offset = loop * mpHands.HAND_CONNECTIONS.length;
// 			const offsetConnections =
// 				mpHands.HAND_CONNECTIONS.map(
// 					(connection) =>
// 						[connection[0] + offset, connection[1] + offset]
// 				);
// 			connections = connections.concat(offsetConnections);
// 			const classification = results.multiHandedness[loop];
// 			colors.push({
// 				list: offsetConnections.map((unused, i) => i + offset),
// 				color: classification.label,
// 			});
// 		}
// 		grid.updateLandmarks(landmarks, connections, colors);
// 	} else {
// 		grid.updateLandmarks([]);
// 	}
// }
