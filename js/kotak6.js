const video = document.getElementById('video');
const mirrorToggle = document.getElementById('mirrorToggle');
const thumbnails = document.getElementById('thumbnails');
const cheeseBtn = document.getElementById('cheeseBtn');
const result = document.getElementById('result');
const photosPanel = document.getElementById('photosPanel');
const countdownDisplay = document.getElementById('countdownDisplay');
const saveBtn = document.getElementById('saveBtn');

let stream;
let snapshots = [];

navigator.mediaDevices.getUserMedia({ video: true })
  .then(s => {
    stream = s;
    video.srcObject = stream;
  });

mirrorToggle.addEventListener('click', () => {
  video.classList.toggle('mirror');
});

cheeseBtn.onclick = async () => {
  snapshots = [];
  thumbnails.innerHTML = '';
  photosPanel.innerHTML = '';
  result.style.display = 'none';
  for (let i = 0; i < 6; i++) {
    await countdown(3);
    const img = capture();
    snapshots.push(img);
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.innerHTML = `<img src="${img}" />`;
    thumbnails.appendChild(thumb);
  }
  showResults();
};

function countdown(seconds) {
  return new Promise(async (resolve) => {
    countdownDisplay.style.display = 'block';
    countdownDisplay.innerText = 'CHEESE!';
    await new Promise(r => setTimeout(r, 1000));
    for (let i = seconds; i > 0; i--) {
      countdownDisplay.innerText = i;
      await new Promise(r => setTimeout(r, 1000));
    }
    countdownDisplay.style.display = 'none';
    resolve();
  });
}

function capture() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');

  if (video.classList.contains('mirror')) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL('image/png');
}

function addPolaroidImage(imageDataUrl) {
  const polaroidDiv = document.createElement('div');
  polaroidDiv.className = 'polaroid';

  const img = document.createElement('img');
  img.src = imageDataUrl;

  polaroidDiv.appendChild(img);

  polaroidDiv.ondrop = function (e) {
    e.preventDefault();
    const emoji = e.dataTransfer.getData("text");
    const sticker = document.createElement('div');
    sticker.className = 'sticker';
    sticker.innerText = emoji;
    sticker.style.left = (e.offsetX - 10) + 'px';
    sticker.style.top = (e.offsetY - 10) + 'px';
    polaroidDiv.appendChild(sticker);
  };

  polaroidDiv.ondragover = function (e) {
    e.preventDefault();
  };

  photosPanel.appendChild(polaroidDiv);
}

function showResults() {
  photosPanel.innerHTML = '';
  snapshots.forEach(src => {
    addPolaroidImage(src);
  });
  result.style.display = 'block';
  saveBtn.style.display = 'inline-block';
}

document.querySelectorAll('.emoji').forEach(el => {
  el.ondragstart = function (e) {
    e.dataTransfer.setData("text", e.target.innerText);
  };
});

saveBtn.onclick = async () => {
  const panel = document.getElementById('photosPanel');
  const photoElements = panel.querySelectorAll('.polaroid');
  const width = 220;
  const height = photoElements[0].offsetHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 3;
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
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, width, height);
        tempCtx.drawImage(image, 10, 10, width - 20, height - 20);
        wrapper.querySelectorAll('.sticker').forEach(sticker => {
          const x = parseInt(sticker.style.left || 0);
          const y = parseInt(sticker.style.top || 0);
          tempCtx.font = '2em serif';
          tempCtx.fillText(sticker.innerText, x, y + 20);
        });
        const x = (i % 2) * width;
        const y = Math.floor(i / 2) * height;
        ctx.drawImage(tempCanvas, x, y);
        res();
      };
      image.src = img.src;
    });
  }

  const link = document.createElement('a');
  link.download = 'photo_result.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
};
