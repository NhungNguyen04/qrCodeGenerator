let imgBox = document.getElementById('imgBox');
let qrImg = document.getElementById('qrImg');
let qrText = document.getElementById('qrText');
let clearBtn = document.querySelector('.secondary-btn.clear');
let downloadBtn = document.querySelector('.secondary-btn.download');
let shareBtn = document.querySelector('.secondary-btn.share');
let qrColor = document.getElementById('qrColor');
let logoInput = document.getElementById('logoInput');
let emojiInput = document.getElementById('emojiInput');

async function generateQRCode() {
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

            ctx.save();
            ctx.beginPath();
            ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.clip();

            ctx.drawImage(logo, x, y, logoSize, logoSize);
            ctx.restore();
            qrImg.src = canvas.toDataURL('image/png');

            if (localStorage.getItem('token')) {
                const token = localStorage.getItem('token');
                const image = canvas.toDataURL('image/png');
                saveQRCodeToDatabase(token, qrText.value, image);
            }

            // Show the image and buttons
            imgBox.classList.add('show-img');
            clearBtn.classList.remove('hidden');
            downloadBtn.classList.remove('hidden');
            document.getElementById('shareOptions').classList.remove('hidden');
        };

        // Handle logo or emoji input
        if (logoInput.files && logoInput.files[0] && emojiInput.value) {
            alert('Please choose only one option: Image or Emoji');
        }
        else if (logoInput.files && logoInput.files[0]) {
            logo.src = URL.createObjectURL(logoInput.files[0]);
        } else if (emojiInput.value) {
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

    } else {
        qrText.classList.add('error');
        setTimeout(() => {
            qrText.classList.remove('error');
        }, 1000);
    }
}

async function saveQRCodeToDatabase(token, text, image) {
    const response = await fetch('/save-qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, text, image })
    });

    const data = await response.json();
    if (response.status !== 201) {
        alert(data.message);
    }
}

function clearValues() {
    qrText.value = '';
    logoInput.value = '';
    emojiInput.value = '';
    imgBox.classList.remove('show-img');
    clearBtn.classList.add('hidden');
    downloadBtn.classList.add('hidden');
    document.getElementById('shareOptions').classList.add('hidden');
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

function showShareOptions() {
    const shareOptions = document.getElementById('shareOptions');
    if (shareOptions.classList.contains('hidden')) {
        shareOptions.classList.remove('hidden');
    } else {
        shareOptions.classList.add('hidden');
    }
}

function shareToSocialMedia(platform) {
    if (qrImg.src.length === 0) {
        qrText.classList.add('error');
        setTimeout(() => {
            qrText.classList.remove('error');
        }, 1000);
        return;
    }

    let shareUrl = '';
    const imageUrl = qrImg.src;
    const text = 'Check out this QR code!';

    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(imageUrl)}`;
            break;
        case 'instagram':
            alert('To share on Instagram, please download the image and upload it manually to the Instagram app.');
            return;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

function shareToFacebook() {
    shareToSocialMedia('facebook');
}

function shareToTwitter() {
    shareToSocialMedia('twitter');
}

function shareToInstagram() {
    shareToSocialMedia('instagram');
}

async function copyToClipboard() {
    try {
        const blob = await fetch(qrImg.src).then(r => r.blob());
        await navigator.clipboard.write([
            new ClipboardItem({
                'image/png': blob
            })
        ]);
        alert('QR code image copied to clipboard!');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Unable to copy to clipboard. Please try downloading instead.');
    }
}

downloadBtn.addEventListener('click', downloadImg);
