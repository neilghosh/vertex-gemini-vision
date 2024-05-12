const fileTag = document.getElementById("filetag"),
    preview = document.getElementById("preview"),
    uploadButton = document.getElementById("upload"),
    dimensions = document.getElementById("dimensions"),
    responseDiv = document.getElementById("response"),
    form = document.querySelector('form');
// Overrides the default form submit behavior which redirects to the actions page
// Here we want to to Ajax request
function handleSubmit(event) {
    event.preventDefault();
    upload();
}
form.addEventListener('submit', handleSubmit);

/**
 * Timer 
 */
var timerVar;

var totalSeconds = 0;

function countTimer() {
    ++totalSeconds;

    var hour = Math.floor(totalSeconds / 3600);
    var minute = Math.floor((totalSeconds - hour * 3600) / 60);
    var seconds = totalSeconds - (hour * 3600 + minute * 60);
    if (hour < 10)
        hour = "0" + hour;
    if (minute < 10)
        minute = "0" + minute;
    if (seconds < 10)
        seconds = "0" + seconds;

    document.getElementById("timer").innerHTML = hour + ":" + minute + ":" + seconds;
}

function changeImage(input) {
    var reader;

    if (input.files && input.files[0]) {
        reader = new FileReader();

        reader.onload = function (e) {
            var avatarImg = new Image();
            var src = reader.result;
            avatarImg.src = src;
            avatarImg.onload = function () {
                var ctx = preview.getContext("2d");
                ctx.reset();

                var factor = Math.min(1000 / avatarImg.width, 1000 / avatarImg.height);
                ctx.scale(factor, factor);
                ctx.drawImage(avatarImg, 0, 0);
                ctx.scale(1 / factor, 1 / factor);
                dimensions.value = JSON.stringify({ "w": avatarImg.width * factor, "h": avatarImg.height * factor });
                console.log(dimensions.value);
            }
        }
        reader.readAsDataURL(input.files[0]);
    }
}

fileTag.addEventListener("change", function () {
    changeImage(this);
});

function callback(response) {
    console.log(response);
    responseDiv.innerHTML = response;
    var ctx = preview.getContext("2d");
    ctx.beginPath();
    const dims = JSON.parse(response).bounding_box
    ctx.strokeStyle = 'Red';
    ctx.lineWidth = 5;
    ctx.rect(dims[0], dims[1], dims[2] - dims[0], dims[3] - dims[1]);
    ctx.stroke();
    uploadButton.disabled = false;
    uploadButton.innerText = 'Upload';
    clearInterval(timerVar);
}

function upload() {
    const form = document.querySelector('form');
    const data = new FormData(form);
    //TODO Move to Axios for cleaner code 
    var xhr = new XMLHttpRequest;
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            callback(xhr.response);
        }
    };
    xhr.open("POST", "/upload");
    xhr.send(data);
    uploadButton.disabled = true;
    uploadButton.innerText = 'Processing';
    totalSeconds = 0;
    timerVar = setInterval(countTimer, 1000);
}