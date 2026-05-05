const modelURL = "models/model.json";
const metadataURL = "models/metadata.json";
const webcamElement = document.getElementById("webcam");
const captureButton = document.getElementById("captureButton");
const imageInput = document.getElementById("imageInput");
const predictionList = document.getElementById("predictionList");
const statusText = document.getElementById("statusText");
const videoOverlay = document.getElementById("video-overlay");
const canvas = document.getElementById("captureCanvas");
let model;
let webcamStream;

function setControlsEnabled(enabled) {
  captureButton.disabled = !enabled;
  imageInput.disabled = !enabled;
}

function showStatus(message, hint) {
  statusText.textContent = message;
  if (hint) {
    predictionList.innerHTML = `<p class="hint-text">${hint}</p>`;
  }
}

async function initCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    videoOverlay.textContent = "您的裝置不支援相機，請改用上傳照片。";
    return;
  }

  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    webcamElement.srcObject = webcamStream;
    videoOverlay.style.display = "none";
  } catch (error) {
    console.error("Camera init error:", error);
    videoOverlay.textContent = "請允許相機存取或改用上傳照片。";
  }
}

async function loadModel() {
  setControlsEnabled(false);

  if (window.location.protocol === "file:") {
    console.error("Model load error: file:// protocol not supported for model loading.");
    showStatus(
      "模型載入失敗",
      "請使用本機伺服器開啟此頁面，不要直接以檔案方式打開。"
    );
    return;
  }

  try {
    showStatus("載入模型中...", "請稍候。這可能需要幾秒鐘。");
    model = await tmImage.load(modelURL, metadataURL);
    showStatus("模型已準備好", "請按「拍照辨識」或上傳照片。");
    setControlsEnabled(true);
  } catch (error) {
    console.error("Model load error:", error);
    showStatus(
      "模型載入失敗",
      "請檢查 models 資料夾與本機伺服器是否啟動。"
    );
  }
}

function renderPredictions(predictions) {
  if (!predictions || predictions.length === 0) {
    predictionList.innerHTML = `<p class="hint-text">目前沒有辨識結果。</p>`;
    return;
  }

  const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
  predictionList.innerHTML = sorted
    .map(
      (item) =>
        `<div class="prediction-item"><strong>${item.className}</strong><span class="probability">${(
          item.probability * 100
        ).toFixed(1)}%</span></div>`
    )
    .join("");
}

async function classifyImage(source) {
  if (!model) return;
  statusText.textContent = "辨識中...";

  try {
    const predictions = await model.predict(source);
    renderPredictions(predictions);
    statusText.textContent = "辨識完成";
  } catch (error) {
    console.error("Prediction error:", error);
    statusText.textContent = "辨識失敗，請重試。";
    predictionList.innerHTML = `<p class="hint-text">請重新拍照或上傳另一張照片。</p>`;
  }
}

function captureFrame() {
  if (!webcamElement.videoWidth || !webcamElement.videoHeight) {
    return null;
  }

  canvas.width = webcamElement.videoWidth;
  canvas.height = webcamElement.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(webcamElement, 0, 0, canvas.width, canvas.height);
  return canvas;
}

captureButton.addEventListener("click", async () => {
  const source = captureFrame();
  if (!source) {
    statusText.textContent = "無法取得相機畫面，請改用上傳照片。";
    return;
  }
  await classifyImage(source);
});

imageInput.addEventListener("change", async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const image = new Image();
  image.onload = async () => {
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    await classifyImage(canvas);
  };
  image.onerror = () => {
    statusText.textContent = "無法讀取照片，請選擇其他圖片。";
  };
  image.src = URL.createObjectURL(file);
});

window.addEventListener("load", async () => {
  await loadModel();
  await initCamera();
});
