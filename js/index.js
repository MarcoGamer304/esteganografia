const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const uploadInput = document.getElementById("upload");
const downloadBtn = document.getElementById("downloadBtn");
const textArea = document.getElementById('textArea');

let mensaje;

let message = [];
let countPositive = 0;
let countNegative = 0;

downloadBtn.disabled = true;
uploadInput.disabled = true;

textArea.addEventListener('keyup', () => {
    if (textArea.value !== '') {
        uploadInput.disabled = false;
    } else {
        uploadInput.disabled = true;
    }
});

uploadInput.addEventListener("change", (event) => {
    mensaje = textArea.value;
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                countPositive = 0;
                countNegative = 0;
                getDataImg();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function getDataImg() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const dataArray = [];

    for (let index = 0; index < data.length; index += 4) {
        dataArray.push([data[index], data[index + 1], data[index + 2], data[index + 3]]);
    }
    codifier(dataArray);
}

function textToBinary(text) {
    return text.split('').map(char => {
        let binary = char.charCodeAt(0).toString(2);
        return binary.padStart(8, '0');
    }).join(' ');
}

function codifier(dataArray) {
    message = [];
    const binario = textToBinary(mensaje);
    const arrayFixed = Array.from(binario).filter(item => item !== ' ');

    dataArray.forEach(element => {
        for (let index = 0; index < element.length; index++) {
            if (index === 3) {
                compareRB(element[0], element[2], element, index, arrayFixed);
            }
        }
    });
    updateCanvas(message);
}

function compareRB(red, blue, element, index, arrayFixed) {
    const fixR = red.toString(16).padStart(2, '0').charAt(0);
    const fixB = blue.toString(16).padStart(2, '0').charAt(0);
    if (fixR > fixB) { // 0 C  5 f
        if (arrayFixed.length > 0) {
            countPositive++;
            let parse = String(element[index]).slice(0, -1);
            let firstElement = arrayFixed.shift();
            message.push(element[0], element[1], element[2], Number(parse + firstElement));
        } else {
            message.push(element[0], element[1], element[2], element[3]);
        }
    } else {
        if (arrayFixed.length > 0) {
            countNegative++;
            let parse = String(element[index - 2]).slice(0, -1);
            let firstElement = arrayFixed.shift();
            message.push(element[0],    Number(parse + firstElement), element[2], element[3]);
        } else {
            message.push(element[0], element[1], element[2], element[3]);
        }
    }
}

function updateCanvas(message) {
    if (message.length % 4 !== 0) {
        console.error("Message length is not a multiple of 4");
        return;
    }

    const newImageData = new ImageData(new Uint8ClampedArray(message), canvas.width, canvas.height);
    ctx.putImageData(newImageData, 0, 0);

    downloadBtn.disabled = false;
}

downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "message.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    window.location.reload();
});