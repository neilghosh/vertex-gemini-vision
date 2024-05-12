const fileTag = document.getElementById("filetag"),
    preview = document.getElementById("preview"),
    uploadButton = document.getElementById("upload"),
    dimensions = document.getElementById("dimensions"),
    form = document.querySelector('form');

form.addEventListener('submit', handleSubmit);
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


function handleSubmit(event) {
    event.preventDefault();
    upload();
}

fileTag.addEventListener("change", function () {
    changeImage(this);
});

function changeImage(input) {
    var reader;

    if (input.files && input.files[0]) {
        reader = new FileReader();

        reader.onload = function (e) {
            var avatarImg = new Image();
            var src = reader.result;
            avatarImg.src = src;
            avatarImg.onload = function () {
                //preview.setAttribute('src', e.target.result);
                var ctx = preview.getContext("2d");
                ctx.reset();

                // ctx.canvas.width = 1000;
                // ctx.canvas.height = 1000 * avatarImg.height / avatarImg.width;

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

function callback(response) {
    console.log(response);
    var ctx = preview.getContext("2d");
    ctx.beginPath();
    const dims = JSON.parse(response).bounding_box

    ctx.rect(dims[0], dims[1], dims[2]-dims[0], dims[3]-dims[1]);
    ctx.stroke();
    uploadButton.disabled=false;
    uploadButton.innerText='Upload';
    clearInterval(timerVar);
}

function upload() {
    var picture = document.getElementById('preview');

    picture.toBlob(function (blob) {
        const form = document.querySelector('form');
        const data = new FormData(form);

        //formData.append("image", blob, { type: 'application/octet-stream' });
        var xhr = new XMLHttpRequest;
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              callback(xhr.response);
            }
          };
        xhr.open("POST", "/upload");
        xhr.send(data);
        uploadButton.disabled=true;
        uploadButton.innerText='Processing';
        timerVar = setInterval(countTimer, 1000);
    }, "image/png");
}