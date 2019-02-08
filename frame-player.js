(() => {
    
    var config = {
        url: "http://storage.googleapis.com/alyo/assignments/images/",
        width: 640,
        height: 360,
        frameRate: 10,
    }

    var downloadFinished = false;
    var loadingContainer = document.getElementsByClassName("loading-container")[0];
    var images = [];
    var frames = [];
    var timer = null;
    var currentFrame = 0;
    var frameCount = 7 * 25;
    var playing = false;
    var downloadStartTime = null;
    var downloadFinishTime = null;

    var steps = [];
    var progressBar = document.getElementById("progress-bar");
    var progress = document.getElementById("progress");

    class FramePlayer extends EventEmitter{
        
        constructor (id) {
            super();
            this._init(id);
        }

        _init(id) {
            this.containerId = id;
            this.container = document.getElementById(id);
            this.canvas = document.createElement("canvas")
            this.canvas.id = "canvas";
            this.container.appendChild(this.canvas);
        }
        
        play() {
            playing = true;
            drawFrame();
            this.emit("play", currentFrame * 1000 / config.frameRate)
        }
        
        pause() {
            playing = false;
            clearTimeout(timer);
            this.emit("pause", currentFrame * 1000 / config.frameRate)
        }
    }

    //init player
    var player = new FramePlayer("container");
    player.container.addEventListener("click", togglePlay)
    player.on("downloadcomplete", () => onDownloadComplete())
    player.on("extractcomplete", () => onExtractComplete())
    player.on("play", (ms) => onPlay(ms))
    player.on("pause", (ms) => onPause(ms))
    player.on("end", () => onEnd());
    progressBar.addEventListener("click", seek)
    initProgressBar();
    initDownload();

    //functions
    function drawFrame(){
        var ctx = player.canvas.getContext('2d');
        var image = new Image(config.width, config.height);
        image.src = frames[currentFrame];
        image.onload = () => {
            ctx.drawImage(image, 0, 0);
        }

        var percentage = (currentFrame / frameCount).toFixed(2);
        var stepIndex = findNearestStep(percentage * 100);
        updateProgress(stepIndex);
        
        if(playing){
            currentFrame++;
            if(currentFrame === frames.length){
                currentFrame = 0;
                player.emit("end");
            }
            timer = setTimeout(drawFrame, 1000 / config.frameRate);
        }
    }

    function initDownload() {
        downloadStartTime = new Date().getTime();
        downloadImg(0);
    }

    function downloadImg(index) {
        var image = new Image();
        image.crossOrigin="anonymous";
        
        var url = config.url + index + ".jpg";
        image.src = url;
        
        image.onload = function () {
            images.push(image);
            if(index < 6){
                downloadImg(index + 1);
            }else{
                player.emit("downloadcomplete")
            }
        };
    }

    function extractFrames(player) {
        var canvas = player.canvas;
        var ctx = canvas.getContext('2d');
        var w = config.width / 5;
        var h = config.height / 5;
        for(var k = 0; k < images.length; k++){
            for(var i = 0; i < 5; i++){
                for(var j = 0; j < 5; j++){
                    ctx.drawImage(images[k], j * w, i * h, w, h, 0, 0, canvas.width, canvas.height);
                    frames.push(canvas.toDataURL('image/jpeg'));
                }
            }
        }
        player.emit("extractcomplete");
    }

    function onExtractComplete(){
        loadingContainer.style.display="none";
        var extractFinishTime = new Date().getTime();
        console.log("extraction of frames complete in ", extractFinishTime - downloadFinishTime , "ms");
    }

    function onDownloadComplete(){
        downloadFinished = true;
        downloadFinishTime = new Date().getTime();
        player.canvas.getContext("2d").clearRect(0,0,config.width, config.height);
        console.log("images downloaded in ", downloadFinishTime - downloadStartTime + "ms"); 
        extractFrames(player)
    }

    function onPlay(ms) {
        console.log("on play", ms, "ms");
    }
    
    function onPause(ms) {
        console.log("video is paused at", ms, "ms");
    }
    
    function onEnd() {
        playing = false;
        console.log("on end")
    }

    function togglePlay() {
        if(!downloadFinished){
            return;
        }
        if(playing){
            player.pause();
        }else{
            player.play();
        }
    }

    function initProgressBar(){
        var stepSize = (frameCount / 100);
        var step = 0;
        while(step < 100){
            steps.push(step);
            step += stepSize;
        }
    }

    function findNearestStep(percentage) {
        var diffToLarger, diffToSmaller, index;
        for(var i = 1; i < steps.length; i++){
            if(percentage < steps[i]){
                diffToLarger = steps[i] - percentage;
                diffToSmaller = percentage - steps[i-1];
                index = i;
                break;
            }
        }
        if(diffToLarger > diffToSmaller){
            return index-1;
        }else{
            return index;
        }
    }

    function seek(evt){
        clearTimeout(timer);
        var offsetX = evt.offsetX;
        var percentage = (offsetX / config.width).toFixed(2);
        var stepIndex = findNearestStep(percentage * 100);
        updateProgress(stepIndex);
        currentFrame = Math.floor(frameCount * percentage);
        drawFrame();
        evt.stopPropagation();
    }

    function updateProgress(stepIndex){
        var progressWidth = steps[stepIndex];
        progress.style.width = progressWidth+"%";
    }
    
})();