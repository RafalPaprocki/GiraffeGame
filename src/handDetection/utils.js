import { lerp } from "@mediapipe/drawing_utils";
import { Results, NormalizedLandmarkListList } from "@mediapipe/hands";

export const clearCanvas = (canvasCtx) => {
	const { canvas } = canvasCtx;
	canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * @param {CanvasRenderingContext2D} canvasCtx Canvas 2D context
 */
export const withCanvas = (canvasCtx, drawingFunction, shouldClear = true) => {
	canvasCtx.save();
	if (shouldClear) clearCanvas(canvasCtx);
	if (typeof drawingFunction === 'function') {
		drawingFunction(canvasCtx);
	}
	canvasCtx.restore();
}

/**
 * @typedef {Object} LandmarksObject
 * @property {boolean} isRightHand
 * @property {NormalizedLandmarkList} landmarks
 * @property {LandmarkList} worldLandmarks
 */
/**
 * @callback landmarksCallback
 * @param {LandmarksObject}
 */
/**
 * Do something for each result landmark
 * @param {Results} results
 * @param {landmarksCallback} callback Calback to run for each result
 */
export const forEachLandmarks = (results, callback) => {
	const mappedResult = [];
	for (let index = 0; index < results.multiHandLandmarks.length; index++) {
		const classification = results.multiHandedness[index];
		const isRightHand = classification.label === 'Right';
		const landmarks = results.multiHandLandmarks[index];
		const worldLandmarks = results.multiHandWorldLandmarks[index];
		mappedResult.push(callback({
			isRightHand,
			landmarks,
			worldLandmarks,
		}));
	}
	return mappedResult;
}

export const landmarkScaler = (maxWidth, maxHeight, maxDepth = 0) => (normalizedLandmark) => {
	const { x, y, z } = normalizedLandmark;
	return {
		x: lerp(x, 0, 1, 0, maxWidth),
		y: lerp(y, 0, 1, 0, maxHeight),
		z: lerp(z, 0, 1, 0, maxDepth),
	};
}

export function drawCircle(ctx, centerX, centerY, radius, fillColor = '#0001', borderColor = '#0000', borderSize = 0) {
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = fillColor;
	ctx.fill();
	ctx.lineWidth = borderSize;
	ctx.strokeStyle = borderColor;
	ctx.stroke();
}
export function drawLine(ctx, x0, y0, x1, y1, borderColor = '#0000', borderSize = 0) {
	ctx.beginPath();
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.lineWidth = borderSize;
	ctx.strokeStyle = borderColor;
	ctx.stroke();
}
