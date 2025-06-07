// JavaScript untuk fitur kamera, filter, stiker, template kolase, perekaman video, emoji drag-drop, slideshow otomatis, dan background virtual video

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureBtn = document.getElementById('captureBtn');
const filterSelect = document.getElementById('filter');
const stickerContainer = document.getElementById('stickerContainer');
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const emojiContainer = document.getElementById('emojiContainer');
const slideshowCanvas = document.getElementById('slideshowCanvas');
const backgroundInput = document.getElementById('backgroundInput');

let mediaRecorder;
let recordedChunks = [];
let stream;
let stickers = [];
let emojis = [];
let slideshowImages = [];
let slideshowIndex = 0;

// Inisialisasi kamera
async function initCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  video.srcObject = stream;
}

captureBtn.addEventListener('click', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0);
  applyFilter();
  drawStickers();
  drawEmojis();
});

filterSelect.addEventListener('change', applyFilter);

function applyFilter() {
  const filter = filterSelect.value;
  canvas.style.filter = filter;
}

// Stiker
function addSticker(imgSrc) {
  const img = new Image();
  img.src = imgSrc;
  img.onload = () => stickers.push({ img, x: 50, y: 50 });
}

function drawStickers() {
  stickers.forEach(sticker => {
    context.drawImage(sticker.img, sticker.x, sticker.y, 100, 100);
  });
}

// Template kolase
function setTemplate(template) {
  const sizeMap = {
    '2': [800, 400],
    '4': [800, 800],
    '6': [800, 1200]
  };
  const [w, h] = sizeMap[template];
  canvas.width = w;
  canvas.height = h;
}

// Perekaman video
recordBtn.addEventListener('click', () => {
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
  mediaRecorder.onstop = saveVideo;
  mediaRecorder.start();
});

stopBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
});

function saveVideo() {
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'recording.webm';
  a.click();
}

// Emoji Drag-Drop
function addEmoji(emoji) {
  const span = document.createElement('span');
  span.textContent = emoji;
  span.classList.add('draggable-emoji');
  span.style.position = 'absolute';
  span.style.left = '50px';
  span.style.top = '50px';
  span.draggable = true;
  emojiContainer.appendChild(span);

  span.addEventListener('dragend', e => {
    span.style.left = `${e.pageX - 25}px`;
    span.style.top = `${e.pageY - 25}px`;
    emojis.push({ emoji: span.textContent, x: e.pageX - 25, y: e.pageY - 25 });
  });
}

function drawEmojis() {
  context.font = '40px Arial';
  emojis.forEach(e => context.fillText(e.emoji, e.x, e.y));
}

// Slideshow Otomatis
function startSlideshow() {
  if (slideshowImages.length === 0) return;
  slideshowCanvas.width = 800;
  slideshowCanvas.height = 600;
  const ctx = slideshowCanvas.getContext('2d');

  setInterval(() => {
    const img = new Image();
    img.src = slideshowImages[slideshowIndex];
    img.onload = () => {
      ctx.clearRect(0, 0, slideshowCanvas.width, slideshowCanvas.height);
      ctx.drawImage(img, 0, 0, slideshowCanvas.width, slideshowCanvas.height);
      slideshowIndex = (slideshowIndex + 1) % slideshowImages.length;
    };
  }, 2000);
}

function uploadSlideshowImage(file) {
  const reader = new FileReader();
  reader.onload = e => {
    slideshowImages.push(e.target.result);
  };
  reader.readAsDataURL(file);
}

// Background Virtual Video
backgroundInput.addEventListener('change', () => {
  const bgImg = new Image();
  bgImg.src = URL.createObjectURL(backgroundInput.files[0]);
  bgImg.onload = () => {
    setInterval(() => {
      context.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }, 100);
  };
});

initCamera();
