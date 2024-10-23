const uploadDecryptor = document.getElementById('upload-decryptor');
const canvasDecryptor = document.getElementById('canvas-decryptor');
const ctxD = canvasDecryptor.getContext('2d');
const textAreaDecryptor = document.getElementById('textArea-decryptor');

textAreaDecryptor.disabled = true;
let string = '';
let bits = [];

uploadDecryptor.addEventListener("change", (event) => {
    reset();
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = () => {
                canvasDecryptor.width = img.width;
                canvasDecryptor.height = img.height;
                ctxD.drawImage(img, 0, 0);
                decode();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function compareDecode(red, blue, element, index) {
    const fixR = red.toString(16).padStart(2, '0').charAt(0);
    const fixB = blue.toString(16).padStart(2, '0').charAt(0);

    let fix = (fixR > fixB) ? String(element[index]).slice(-1) : String(element[index - 2]).slice(-1);
    bits.push(fix);
}

function decode() {
    const imageData = ctxD.getImageData(0, 0, canvasDecryptor.width, canvasDecryptor.height);
    const data = imageData.data;
    const dataArray = [];

    for (let index = 0; index < data.length; index += 4) {
        dataArray.push([data[index], data[index + 1], data[index + 2], data[index + 3]]);
    }

    dataArray.forEach(element => {
        for (let index = 0; index < element.length; index++) {
            if (index === 3) {
                compareDecode(element[0], element[2], element, index);
            }
        }
    });

    let arr = bits.filter(item => item !== '');

    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if (index % 8 === 0) {
            if (index !== 0) {
                string += ' '
            }
        }
        if (element === '1' || element === '0') {
            string += element;
        } else {
            break;
        }

    }
    console.log(string);
    textAreaDecryptor.value = binaryToText(string);
}

function binaryToText(message) {
    return message.split(' ').map(binario => {
        return String.fromCharCode(parseInt(binario, 2));
    }).join('');
}

function reset() {
    textAreaDecryptor.value = '';
    string = '';
    bits = [];
}