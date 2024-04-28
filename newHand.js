let video = document.getElementById("pose-video");
let canvas = document.getElementById("pose-canvas");
let ctx = canvas.getContext("2d");
let hands;
let detector;

let showKeyPoints = true;
let useFront = true;

function startVideo(){
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let mode = useFront ? "user" : "environment";
        navigator.mediaDevices.getUserMedia({ audio: false, video: {width:360,height:360,facingMode: mode} }).then(function(stream) {
            video.addEventListener("loadedmetadata",loadModel);
            video.srcObject = stream;
            video.play();

            drawCameraIntoCanvas();
            feedback("onVideoReady");
        });
    }else{
        feedback("onError","Failed to capture video");
    }
}

document.addEventListener("DOMContentLoaded", () => {
	async function start() {
		// Gestures
		const waveGesture = new fp.GestureDescription("wave");
		for (let finger of [
			fp.Finger.Thumb,
			fp.Finger.Index,
			fp.Finger.Middle,
			fp.Finger.Ring,
			fp.Finger.Pinky,
		]) {
			waveGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
			waveGesture.addDirection(finger, fp.FingerDirection.VerticalUp, 1.0);
		}

		const dieGesture = new fp.GestureDescription("die");
		for (let finger of [
			fp.Finger.Thumb,
			fp.Finger.Index,
			fp.Finger.Middle,
			fp.Finger.Ring,
			fp.Finger.Pinky,
		]) {
			dieGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
			dieGesture.addDirection(finger, fp.FingerDirection.HorizontalLeft, 1.0);
			dieGesture.addDirection(finger, fp.FingerDirection.HorizontalRight, 1.0);
		}

		const jumpGesture = new fp.GestureDescription("jump");
		jumpGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
		jumpGesture.addDirection(fp.Finger.Index, fp.FingerDirection.VerticalUp);
		jumpGesture.addDirection(
			fp.Finger.Thumb,
			fp.FingerDirection.DiagonalUpRight,
			1.0
		);
		jumpGesture.addDirection(
			fp.Finger.Thumb,
			fp.FingerDirection.DiagonalUpLleft,
			1.0
		);
		jumpGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
		for (let finger of [fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
			jumpGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
			jumpGesture.addDirection(finger, fp.FingerDirection.VerticalUp, 1.0);
			jumpGesture.addDirection(finger, fp.FingerDirection.VerticalDown, 1.0);
		}

		//
		const punchGesture = new fp.GestureDescription("punch");
		for (let finger of [
			fp.Finger.Thumb,
			fp.Finger.Index,
			fp.Finger.Middle,
			fp.Finger.Ring,
			fp.Finger.Pinky,
		]) {
			punchGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
		}
		const walkGesture = new fp.GestureDescription("walk");
		for (let finger of [
			fp.Finger.Thumb,
			fp.Finger.Ring,
			fp.Finger.Pinky,
		]) {
			walkGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
		}
		for (let finger of [fp.Finger.Index,fp.Finger.Middle,]) {
			walkGesture.addDirection(finger, fp.FingerDirection.VerticalDown, 1.0);
		}
		const danceGesture = new fp.GestureDescription("walk");
		for (let finger of [fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Index]) {
			danceGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
		}
		for (let finger of [fp.Finger.Thumb,]) {
			danceGesture.addDirection(finger, fp.FingerDirection.HorizontalLeft, 1.0);
		}
		for (let finger of [fp.Finger.Pinky,]) {
			danceGesture.addDirection(finger, fp.FingerDirection.DiagonalUpRight, 1.0);
		}
		//

		const gestureEstimator = new fp.GestureEstimator([
			fp.Gestures.ThumbsUpGesture,
			waveGesture,
			jumpGesture,
			dieGesture,
			punchGesture,
			walkGesture,
			danceGesture,
		]);
		const fadeToAction = (action, duration) => {
			if (activeAction === action) return;
			activeAction = action;
			activeAction.reset().fadeIn(duration).play();
		};

		// Detection
		const model = await handpose.load();

		const detect = async () => {
            /*
			if (activeAction !== idleAction) {
				window.requestAnimationFrame(detect);
				return;
			}
            */
			const predictions = await model.estimateHands(video);
			if (predictions.length > 0) {
				const estimatedGestures = gestureEstimator.estimate(
					predictions[0].landmarks,
					7.5
				);
				if (estimatedGestures.gestures.length > 0) {
					console.log(estimatedGestures.gestures.length);
					const bestConfidence = estimatedGestures.gestures.sort(
						(a, b) => b.confidence - a.confidence
					)[0];
					console.log(bestConfidence);

					if (bestConfidence.name === "thumbs_up") {
						fadeToAction(thumbsUpAction, 0.3);
					}
					if (bestConfidence.name === "wave") {
						fadeToAction(waveAction, 0.3);
					}
					if (bestConfidence.name === "jump") {
						fadeToAction(jumpAction, 0.3);
					}
					if (bestConfidence.name === "die") {
						fadeToAction(dieAction, 0.3);
					}
					if (bestConfidence.name === "punch") {
						fadeToAction(punchAction, 0.3);
					}
					if (bestConfidence.name === "walk") {
						fadeToAction(walkAction, 0.3);
					}
					if (bestConfidence.name === "dance") {
						fadeToAction(walkAction, 0.3);
					}
				}
			}
			window.requestAnimationFrame(detect);
		};
		window.requestAnimationFrame(detect);
	}
    document.getElementById('video').addEventListener('loadeddata',start);
});
