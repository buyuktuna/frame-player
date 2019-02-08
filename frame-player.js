(() => {
    
    var config = {
        url: "http://storage.googleapis.com/alyo/assignments/images/",
        width: 640,
        height: 360,
        frameRate: 10,
    }

    var downloadFinished = false;
    var loadingContainer = document.getElementsByClassName('loading-container')[0];
    var frames = [];
    var timer = null;
    var currentFrame = 0;
    var playing = false;


    class FramePlayer extends EventEmitter{
        
        constructor (id) {
            super();
            this.init(id);
            
        }

        init(id) {
            this.containerId = id;
            this.container = document.getElementById(id);
            this.canvas = document.createElement("canvas")
            this.canvas.id = "canvas";
            this.canvas.width = config.width;
            this.canvas.height = config.height;
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

    function drawFrame(){
        var ctx = player.canvas.getContext('2d');
        var image = new Image(config.width, config.height);
        image.src = frames[currentFrame]
        image.onload = () => {
            ctx.drawImage(image, 0, 0);
        }

        if(playing){
            // currentFrame = (currentFrame + 1) % frames.length;
            currentFrame++;
            if(currentFrame === frames.length){
                currentFrame = 0;
                player.emit("end");
            }
            timer = setTimeout(drawFrame, 1000 / config.frameRate);
        }
    }

    function downloadImg(index) {
        
        var image = new Image();
        image.crossOrigin="anonymous";
        
        var url = config.url + index + ".jpg";
        image.src = url;
        
        image.onload = function () {
            extractFrames(player, this, index);
        };

        image.onError = function (err) {
            console.log("error, ", err)
            return null;
        }

    }

    function extractFrames(player, img, index) {
        if(img){
            var canvas = player.canvas;
            var ctx = canvas.getContext('2d');
            var w = config.width / 5;
            var h = config.height / 5;
            for(var i = 0; i < 5; i++){
                for(var j = 0; j < 5; j++){
                    ctx.drawImage(img, j * w, i * h, w, h, 0, 0, canvas.width, canvas.height);
                    frames.push(canvas.toDataURL('image/jpeg'));
                }
            }
            player.emit("extractcomplete", index);
        }
    }

    function onExtractComplete(index){
        console.log("extraction complete of ", index);
        if(index < 6){
            downloadImg(index+1)
        }else{
            player.emit("downloadcomplete");
        }
    }

    function onDownloadComplete(){
        console.log("all is downloaded and frames are extracted"); 
        downloadFinished = true;
        loadingContainer.style.display="none";
        //player.play();
    }

    function onPlay(ms) {
        console.log("on play", ms);
    }
    
    function onPause(ms) {
        console.log("on pause", ms);
        
    }
    
    function onEnd() {
        playing = false;
        console.log("on end")
    }

    function onClick() {
        console.log("onclick");
        if(!downloadFinished){
            return;
        }
        if(playing){
            player.pause();
        }else{
            player.play();
        }
    }


    var player = new FramePlayer("container");
    player.container.addEventListener("click", onClick)
    player.on("extractcomplete", (index) => onExtractComplete(index))
    player.on("downloadcomplete", () => onDownloadComplete())
    player.on("play", (ms) => onPlay(ms))
    player.on("pause", (ms) => onPause(ms))
    player.on("end", () => onEnd())
    var img = downloadImg(0); // this will trigger downloads of remaining images

    
    
    
})();