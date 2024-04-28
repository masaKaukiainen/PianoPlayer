let video = document.getElementById("pose-video");
let canvas = document.getElementById("pose-canvas");
let ctx = canvas.getContext("2d");
let hands, detector;
let diff = 0; let oldKey, newKEy = 170;
var data, handData, keypoints
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


async function loadModel() {
    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig = {
        runtime: 'mediapipe',
        maxHands:2,
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands"
    };
    detector = await handPoseDetection.createDetector(model, detectorConfig);

    feedback("onModelReady");

    estimateHands();
}

async function estimateHands(){
    const estimationConfig = {flipHorizontal: useFront};
    const rawHands = await detector.estimateHands(video, estimationConfig);
    hands = getKeypoints(rawHands);

    feedback("onHands", hands);
    
    if(showKeyPoints){drawKeypoints();}

    window.requestAnimationFrame(estimateHands);
}

function drawCameraIntoCanvas() {
    if(useFront){
        ctx.clearRect(0, 0, 360, 360);
        ctx.save();
        ctx.scale(-1 , 1);
        ctx.translate( -360, 0);
        ctx.drawImage(video, 0, 0, 360, 360);	
        ctx.restore();
    }else{
        ctx.drawImage(video, 0, 0, 360, 360);
    }
    window.requestAnimationFrame(drawCameraIntoCanvas);				
}

function drawKeypoints() {

    for (let i = 0; i < hands.length; i += 1) {

        for (let j = 0; j < hands[i].keypoints.length; j += 1) {
            let keypoint = hands[i].keypoints[j];

            ctx.fillStyle="#ff0000";
            ctx.beginPath();
            ctx.arc(keypoint[0], keypoint[1], 3, 0, 2 * Math.PI);
            ctx.fill();

        }
    }
}

function getKeypoints(hands){
    let keypoints = [];
    for (let i = 0; i < hands.length; i += 1) {
        
        let hand = {};
        let points = [];
        for (let j = 0; j < hands[i].keypoints.length; j += 1) {
            let keypoint = hands[i].keypoints[j];
            newKEy = keypoint.x;
            diff = newKEy - oldKey
            if (diff < 25 && div > -25){
                points.push([keypoint.x, keypoint.y]);
                console.log("new value" + keypoint.x);
            }
            console.log(keypoint.x);
        }
        hand.handedness = hands[i].handedness;
        hand.keypoints = points;
        keypoints.push(hand);
    }
    return keypoints;
}

function parseThis(jsonString){
// Parse JSON string into JavaScript object
const data = JSON.parse(jsonString);

// Access the 'data' array
const handData = data.data;

// Iterate over each element of the 'data' array
handData.forEach(hand => {
    // Access the 'keypoints' array for each hand
    const keypoints = hand.keypoints;
    
    // Log the keypoints for this hand
    console.log("Hand keypoints:");
    keypoints.forEach((point, index) => {
        console.log(`Keypoint ${index + 1}: [${point.join(', ')}]`);
    });
});
}

function feedback(eventName, message){
    let log = {};
    log.event = eventName;
    if(message){log.data = message;}
    
    if(window.AppInventor){
        window.AppInventor.setWebViewString(JSON.stringify(log));
    }else{
       // console.log(JSON.stringify(log));
}
}

function toggleCamera(){
    useFront = !useFront;
    startVideo();
}

function toggleKeyPoints(){
    showKeyPoints = !showKeyPoints;
}

startVideo();

