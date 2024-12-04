let imgBox = document.getElementById('imgBox');
let qrImg = document.getElementById('qrImg');
let qrText = document.getElementById('qrText');
let clearBtn = document.querySelector('.secondary-btn.clear');
let downloadBtn = document.querySelector('.secondary-btn.download');
let qrColor = document.getElementById('qrColor');
let logoInput = document.getElementById('logoInput');
let emojiInput = document.getElementById('emojiInput');

function generateQRCode() {
    if (qrText.value.length > 0) {
        let qr = qrcode(0, 'L');
        qr.addData(qrText.value);
        qr.make();

        let canvas = document.createElement('canvas');
        let size = 300;
        canvas.width = size;
        canvas.height = size;
        let ctx = canvas.getContext('2d');

        // Draw QR code
        let cellSize = size / qr.getModuleCount();
        for (let row = 0; row < qr.getModuleCount(); row++) {
            for (let col = 0; col < qr.getModuleCount(); col++) {
                ctx.fillStyle = qr.isDark(row, col) ? qrColor.value : '#ffffff';
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }

        // Add logo or emoji
        let logo = new Image();
        logo.onload = function() {
            let logoSize = size * 0.2;
            let x = (size - logoSize) / 2;
            let y = (size - logoSize) / 2;
            
            // Add border radius
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.clip();
            
            ctx.drawImage(logo, x, y, logoSize, logoSize);
            ctx.restore();
            qrImg.src = canvas.toDataURL('image/png');
        };

        if (logoInput.files && logoInput.files[0] && emojiInput.value) {
            alert('Please choose only one option: Image or Emoji');
        }
        else if (logoInput.files && logoInput.files[0]) {
            logo.src = URL.createObjectURL(logoInput.files[0]);
        } else if (emojiInput.value) {
            // Create emoji image
            let emojiCanvas = document.createElement('canvas');
            emojiCanvas.width = 100;
            emojiCanvas.height = 100;
            let emojiCtx = emojiCanvas.getContext('2d');
            emojiCtx.font = '80px Arial';
            emojiCtx.fillText(emojiInput.value, 10, 80);
            logo.src = emojiCanvas.toDataURL('image/png');
        } else {
            qrImg.src = canvas.toDataURL('image/png');
        }

        imgBox.classList.add('show-img');
        clearBtn.classList.remove('hidden');
        downloadBtn.classList.remove('hidden');
    } else {
        qrText.classList.add('error');
        setTimeout(() => {
            qrText.classList.remove('error');
        }, 1000);
    }
}

function clearValues() {
    qrText.value = '';
    logoInput.value = '';
    emojiInput.value = '';
    imgBox.classList.remove('show-img');
    clearBtn.classList.add('hidden');
    downloadBtn.classList.add('hidden');
}

function downloadImg() {
    if (qrImg.src.length === 0) {
        qrText.classList.add('error');
        setTimeout(() => {
            qrText.classList.remove('error');
        }, 1000);
        return;
    }
    const link = document.createElement('a');
    link.href = qrImg.src;
    link.download = 'qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

downloadBtn.addEventListener('click', downloadImg);

