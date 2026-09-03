/* =========================================================
   D.A.B.S.y VISION ENGINE
   ========================================================= */

window.DABSyVision = (() => {

  const state = {
    enabled: false,
    stream: null,

    video: null,

    lastFrameTime: 0,
    lastMotionTime: 0,

    previousFrame: null,

    motionScore: 0,

    userDetected: false,

    userX: 0.5,
    userY: 0.5,

    cameraWidth: 320,
    cameraHeight: 240,

    analysisTimer: null,

    listeners: new Map()
  };

  function emit(eventName, data = {}) {

    const listeners = state.listeners.get(eventName);

    if (!listeners) return;

    for (const callback of listeners) {
      try {
        callback(data);
      } catch (error) {
        console.error(
          "[D.A.B.S.y Vision] listener error:",
          error
        );
      }
    }
  }

  function on(eventName, callback) {

    if (!state.listeners.has(eventName)) {
      state.listeners.set(eventName, []);
    }

    state.listeners.get(eventName).push(callback);

    return () => {
      const list = state.listeners.get(eventName);

      if (!list) return;

      const index = list.indexOf(callback);

      if (index !== -1) {
        list.splice(index, 1);
      }
    };
  }

  async function enable(videoElement) {

    if (!videoElement) {
      throw new Error("Camera video element was not provided.");
    }

    state.video = videoElement;

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "Camera access is not supported by this browser."
      );
    }

    if (!window.isSecureContext) {
      throw new Error(
        "Camera access requires HTTPS or localhost."
      );
    }

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: {
            ideal: 640
          },
          height: {
            ideal: 480
          }
        },
        audio: false
      });

      state.stream = stream;

      state.video.srcObject = stream;

      await state.video.play();

      state.enabled = true;

      state.previousFrame = null;

      startAnalysis();

      emit("enabled");

      return true;

    } catch (error) {

      state.enabled = false;

      emit("error", {
        error
      });

      throw error;
    }
  }

  function disable() {

    stopAnalysis();

    if (state.stream) {

      for (const track of state.stream.getTracks()) {
        track.stop();
      }
    }

    state.stream = null;

    if (state.video) {
      state.video.srcObject = null;
    }

    state.enabled = false;

    state.userDetected = false;

    state.motionScore = 0;

    emit("disabled");
  }

  function startAnalysis() {

    stopAnalysis();

    /*
      This intentionally runs locally.

      We do NOT upload each frame.
      The first version uses simple image-difference
      perception as a lightweight movement signal.

      A future vision model can subscribe to meaningful
      events rather than receiving every camera frame.
    */

    state.analysisTimer = window.setInterval(
      analyzeFrame,
      250
    );
  }

  function stopAnalysis() {

    if (state.analysisTimer) {
      clearInterval(state.analysisTimer);
      state.analysisTimer = null;
    }
  }

  function analyzeFrame() {

    if (!state.enabled || !state.video) return;

    if (
      state.video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return;
    }

    const width = state.cameraWidth;
    const height = state.cameraHeight;

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );

    if (!context) return;

    context.drawImage(
      state.video,
      0,
      0,
      width,
      height
    );

    const image = context.getImageData(
      0,
      0,
      width,
      height
    );

    const pixels = image.data;

    if (!state.previousFrame) {

      state.previousFrame = new Uint8ClampedArray(
        pixels
      );

      return;
    }

    let changedPixels = 0;

    /*
      Sample pixels rather than examining every pixel.
      This keeps phone CPU usage lower.
    */

    const step = 12;

    for (
      let i = 0;
      i < pixels.length;
      i += 4 * step
    ) {

      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      const oldR = state.previousFrame[i];
      const oldG = state.previousFrame[i + 1];
      const oldB = state.previousFrame[i + 2];

      const difference =
        Math.abs(r - oldR) +
        Math.abs(g - oldG) +
        Math.abs(b - oldB);

      if (difference > 70) {
        changedPixels++;
      }
    }

    state.previousFrame.set(pixels);

    const sampleCount =
      Math.floor(pixels.length / (4 * step));

    const motionScore =
      sampleCount > 0
        ? changedPixels / sampleCount
        : 0;

    state.motionScore =
      state.motionScore * 0.7 +
      motionScore * 0.3;

    const now = performance.now();

    if (
      state.motionScore > 0.08 &&
      now - state.lastMotionTime > 900
    ) {

      state.lastMotionTime = now;

      emit("movement", {
        score: state.motionScore
      });
    }

    /*
      This version cannot reliably identify a face using
      browser-native APIs on every device.

      So we do not fake face recognition.

      We provide the perception foundation and emit
      movement events. A proper face/hand model can later
      plug into this exact layer.
    */
  }

  /*
    Capture one frame ONLY when requested.

    This is intentionally separate from continuous analysis.
  */

  function captureFrame() {

    if (
      !state.enabled ||
      !state.video ||
      state.video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return null;
    }

    const canvas = document.createElement("canvas");

    canvas.width = state.video.videoWidth || 640;
    canvas.height = state.video.videoHeight || 480;

    const context = canvas.getContext("2d");

    if (!context) return null;

    context.drawImage(
      state.video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL(
      "image/jpeg",
      0.75
    );
  }

  function getState() {

    return {
      enabled: state.enabled,
      motionScore: state.motionScore,
      userDetected: state.userDetected,
      userX: state.userX,
      userY: state.userY
    };
  }

  return {
    enable,
    disable,
    captureFrame,
    getState,
    on
  };

})();
