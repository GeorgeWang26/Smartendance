// The width and height of the captured photo. We will set the
// width to the value defined here, but the height will be
// calculated based on the aspect ratio of the input stream.


var computedWidth = getComputedStyle(document.querySelector('#video')).width    // We will scale the photo width to this
var width = computedWidth.slice(0, computedWidth.length-2)
var height = 0;     // This will be computed based on the input stream

// |streaming| indicates whether or not we're currently streaming
// video from the camera. Obviously, we start at false.

var streaming = false;

// The various HTML elements we need to configure or control. These
// will be set by the startup() function.

var video = null;
var canvas = null;
var photo = null;
var startbutton = null;

addEventListener('resize', function(event) {
    var computedStyle = getComputedStyle(document.querySelector('#video'))
    var newComputedWidth = computedStyle.width
    var newWidth = newComputedWidth.slice(0, newComputedWidth.length-2)
    var newHeight = newWidth / (video.videoWidth/video.videoHeight);
    video.setAttribute('height', newHeight);
})

function startup() {
    video = document.querySelector('#video');
    canvas = document.createElement('canvas');
    photo = document.querySelector('#photo');
    startbutton = document.querySelector('#startbutton');

    navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
    })
    .catch(function(err) {
        console.log("An error occurred: " + err);
    });

    video.addEventListener('canplay', function(ev){
        console.log("in")
        if (!streaming) {
            startbutton.removeAttribute('disabled')
            height = video.videoHeight / (video.videoWidth/width);
            
            // Firefox currently has a bug where the height can't be read from
            // the video, so we will make assumptions if this happens.
            
            if (isNaN(height)) {
                height = width / (4/3);
            }
            
            video.setAttribute('width', width);
            video.setAttribute('height', height);
            photo.setAttribute('height', 466/(video.videoWidth/video.videoHeight));
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            streaming = true;
        }
    });

    clearphoto();

}

// Fill the photo with an indication that none has been
// captured.

function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL();
    photo.setAttribute('src', data);
}

// Capture a photo by fetching the current contents of the video
// and drawing it into a canvas, then converting that to a PNG
// format data URL. By drawing it on an offscreen canvas and then
// drawing that to the screen, we can change its size and/or apply
// other changes before drawing it.

function takepicture() {
    $("#result").html('Processing...');
    console.log('snap');
    var context = canvas.getContext('2d');
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.transform(-1, 0, 0, 1, video.width, 0);    //mirror image
        context.drawImage(video, 0, 0, width, height);
        var dataURL = canvas.toDataURL();
        photo.setAttribute('src', dataURL);
        // console.log(dataURL);
        // console.log(typeof dataURL)
        console.log('uploading')
       
        $.ajax({
            url: '/search',
            data:{
                dataURL: dataURL
            },
            dateType: 'JSON',
            type: 'GET',
            success: function(data){
                $("#result").html(data.result);
            }
        });

    } else {
        clearphoto();
    }
}

// Set up our event listener to run the startup process
// once loading is complete.
window.addEventListener('load', startup);