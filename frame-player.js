(() => {
    
    var config = {
        url: "http://storage.googleapis.com/alyo/assignments/images/",
        width: 640,
        height: 360,
        frameRate: 10,
    }

    var downloadFinished = false;
    var dataUris = [];
    var frames = [];

    class FramePlayer extends EventEmitter{
        
        constructor (id) {
            super();
            this.init(id);
        }

        init(id) {
            this.containerId = id;
            this.container = document.getElementById(id);
            this.canvas = document.createElement("canvas")
            this.canvas.id = "player";
            this.canvas.width = config.width;
            this.canvas.height = config.height;
            this.container.appendChild(this.canvas);
        }
        
        play() {

        }

        pause() {

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

        image.onError = function () {
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
                    ctx.drawImage(img, j * w, i * h, w, h, 
                                       0, 0, canvas.width, canvas.height);
                    dataUris.push(canvas.toDataURL('image/jpeg'));
                }
            }
            player.emit("extractcomplete", index);
        }
    }

    function onExtractComplete(index){
        console.log("extraction complete of ", index);
        if(index < 6){
            downloadImg(index+1)
        }
        player.emit("downloadcomplete");
        

    }

    function onDownloadComplete(){
        console.log("all is downloaded and frames are extracted");  
        downloadFinished = true;

        // var c = document.getElementById("test");
        // c.width = config.width;
        // c.height = config.height;
        
        var frameNo = 0;
        var showFrames = setInterval(() => {
            console.log("frameno: ", dataUris[frameNo])
            var i = new Image(config.width, config.height);
            i.src = dataUris[frameNo++]
            // c.getContext('2d').drawImage(i, 0, 0);
            player.canvas.getContext('2d').drawImage(i, 0, 0);
            if(frameNo === dataUris.length){
                clearInterval(showFrames);
            }

        }, 1000/config.frameRate);

        
    }

    var player = new FramePlayer("container");
    player.on("extractcomplete", (index) => onExtractComplete(index))
    player.on("downloadcomplete", () => onDownloadComplete())
    var img = downloadImg(0);

    
    
    
})();