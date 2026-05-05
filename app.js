const BASE_URL = new URL(".", window.location.href).href;
const MODEL_URL = new URL("models/model.json", BASE_URL).href;
const METADATA_URL = new URL("models/metadata.json", BASE_URL).href;

const elements = {
  webcam: document.getElementById("webcam"),
  captureButton: document.getElementById("captureButton"),
  imageInput: document.getElementById("imageInput"),
  predictionList: document.getElementById("predictionList"),
  statusText: document.getElementById("statusText"),
  videoOverlay: document.getElementById("video-overlay"),
  canvas: document.getElementById("captureCanvas"),
};

const state = {
  model: null,
  webcamStream: null,
};

function setControlsEnabled(enabled) {
  elements.captureButton.disabled = !enabled;
  elements.imageInput.disabled = !enabled;
}

function updateStatus(message) {
  elements.statusText.textContent = message;
}

function updateHint(message) {
  elements.predictionList.innerHTML = `<p class="hint-text">${message}</p>`;
}

async function initCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    elements.videoOverlay.textContent = "您的裝置不支援相機，請改用上傳照片。";
    return;
  }

  try {
    state.webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    elements.webcam.srcObject = state.webcamStream;
    elements.videoOverlay.style.display = "none";
  } catch (error) {
    console.error("Camera init error:", error);
    elements.videoOverlay.textContent = "請允許相機存取或改用上傳照片。";
  }
}

async function loadModel() {
  setControlsEnabled(false);

  if (window.location.protocol === "file:") {
    console.error("Model load error: file:// protocol not supported for model loading.");
    updateStatus("模型載入失敗");
    updateHint("請使用靜態網站主機或部署至 GitHub Pages，再重新整理頁面。\n不要直接以 file:// 開啟。 ");
    return;
  }

  try {
    updateStatus("載入模型中...");
    state.model = await tmImage.load(MODEL_URL, METADATA_URL);
    updateStatus("模型已準備好");
    updateHint("請按「拍照辨識」或上傳照片。" );
    setControlsEnabled(true);
  } catch (error) {
    console.error("Model load error:", error);
    updateStatus("模型載入失敗");
    updateHint(
      `載入模型失敗，請確認模型檔案可存取，或部署至靜態網站主機再重新整理。`
    );
  }
}

function renderPredictions(predictions) {
  if (!predictions || predictions.length === 0) {
    elements.predictionList.innerHTML = `<p class="hint-text">目前沒有辨識結果。</p>`;
    return;
  }

  const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
  elements.predictionList.innerHTML = sorted
    .map(
      (item) =>
        `<div class="prediction-item"><strong>${item.className}</strong><span class="probability">${(
          item.probability * 100
        ).toFixed(1)}%</span></div>`
    )
    .join("");
}

async function classifyImage(source) {
  if (!state.model) return;
  updateStatus("辨識中...");

  try {
    const predictions = await state.model.predict(source);
    renderPredictions(predictions);
    updateStatus("辨識完成");
  } catch (error) {
    console.error("Prediction error:", error);
    updateStatus("辨識失敗，請重試。");
    updateHint("請重新拍照或上傳另一張照片。");
  }
}

function captureFrame() {
  if (!elements.webcam.videoWidth || !elements.webcam.videoHeight) {
    return null;
  }

  elements.canvas.width = elements.webcam.videoWidth;
  elements.canvas.height = elements.webcam.videoHeight;
  const ctx = elements.canvas.getContext("2d");
  ctx.drawImage(elements.webcam, 0, 0, elements.canvas.width, elements.canvas.height);
  return elements.canvas;
}

elements.captureButton.addEventListener("click", async () => {
  const source = captureFrame();
  if (!source) {
    updateStatus("無法取得相機畫面，請改用上傳照片。");
    return;
  }
  await classifyImage(source);
});

elements.imageInput.addEventListener("change", async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const image = new Image();
  image.onload = async () => {
    elements.canvas.width = image.width;
    elements.canvas.height = image.height;
    const ctx = elements.canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    await classifyImage(elements.canvas);
  };
  image.onerror = () => {
    updateStatus("無法讀取照片，請選擇其他圖片。");
  };
  image.src = URL.createObjectURL(file);
});

window.addEventListener("DOMContentLoaded", async () => {
  setControlsEnabled(false);
  await loadModel();
  await initCamera();
});
