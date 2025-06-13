const video = document.getElementById('video');
const thumbnails = document.getElementById('thumbnails');
const cheeseBtn = document.getElementById('cheeseBtn');
const result = document.getElementById('result');
const photosPanel = document.getElementById('photosPanel');
const countdownDisplay = document.getElementById('countdownDisplay');
const saveBtn = document.getElementById('saveBtn');
const mirrorToggle = document.getElementById('mirrorToggle');

let isMirrored = true;
let stream;
let snapshots = [];

// Start camera
navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
  stream = s;
  video.srcObject = stream;
});

// Mirror toggle
mirrorToggle.onclick = () => {
  isMirrored = !isMirrored;
  video.style.transform = isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
};

// Countdown function
function countdown(seconds) {
  return new Promise(async (resolve) => {
    countdownDisplay.style.display = 'block';
    for (let i = seconds; i > 0; i--) {
      countdownDisplay.innerText = i;
      await new Promise(res => setTimeout(res, 1000));
    }
    countdownDisplay.innerText = '📸';
    await new Promise(res => setTimeout(res, 500));
    countdownDisplay.style.display = 'none';
    resolve();
  });
}

// Capture function
function capture() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (isMirrored) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

// Main capture process
cheeseBtn.onclick = async () => {
  cheeseBtn.disabled = true;

  // Tunggu sampai kamera siap
  while (!video.videoWidth || video.videoWidth === 0) {
    console.log("Menunggu kamera siap...");
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log("Kamera siap. Mulai mengambil foto.");

  snapshots = [];
  thumbnails.innerHTML = '';
  photosPanel.innerHTML = '';
  result.style.display = 'none';

  for (let i = 0; i < 4; i++) {
    console.log(`Pose ke-${i + 1}`);
    await countdown(3);

    const imgData = capture();
    snapshots.push(imgData);

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.innerHTML = `<img src="${imgData}" />`;
    thumbnails.appendChild(thumb);
  }

  cheeseBtn.disabled = false;
  showResults();
};

// Show result with draggable emojis
function showResults() {
  result.style.display = 'block';
  photosPanel.innerHTML = '';

  snapshots.forEach(src => {
    const wrapper = document.createElement('div');
    wrapper.className = 'photo-wrapper';
    const img = document.createElement('img');
    img.src = src;
    img.style.width = '200px';
    wrapper.appendChild(img);

    wrapper.ondrop = function(e) {
      e.preventDefault();
      const emoji = e.dataTransfer.getData("text");
      const sticker = document.createElement('div');
      sticker.className = 'sticker';
      sticker.innerText = emoji;
      sticker.style.left = (e.offsetX - 10) + 'px';
      sticker.style.top = (e.offsetY - 10) + 'px';
      wrapper.appendChild(sticker);
    };
    wrapper.ondragover = function(e) {
      e.preventDefault();
    };

    photosPanel.appendChild(wrapper);
  });

  saveBtn.style.display = 'inline-block';
}

// Drag and drop for emoji
document.querySelectorAll('.emoji').forEach(el => {
  el.ondragstart = function(e) {
    e.dataTransfer.setData("text", e.target.innerText);
  };
});

// Save result as one image
saveBtn.onclick = async () => {
  const photoElements = document.querySelectorAll('.photo-wrapper');
  const width = 200;
  const height = photoElements[0].offsetHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < photoElements.length; i++) {
    const wrapper = photoElements[i];
    const img = wrapper.querySelector('img');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');

    await new Promise((res) => {
      const image = new Image();
      image.onload = () => {
        tempCtx.drawImage(image, 0, 0, width, height);

        // Render stickers
        wrapper.querySelectorAll('.sticker').forEach(sticker => {
          const x = parseInt(sticker.style.left || 0);
          const y = parseInt(sticker.style.top || 0);
          tempCtx.font = '2em serif';
          tempCtx.fillText(sticker.innerText, x, y + 20);
        });

        const posX = (i % 2) * width;
        const posY = Math.floor(i / 2) * height;
        ctx.drawImage(tempCanvas, posX, posY);
        res();
      };
      image.src = img.src;
    });
  }

  const link = document.createElement('a');
  link.download = 'kotak4_photos.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
};
