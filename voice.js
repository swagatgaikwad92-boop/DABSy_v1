/* =========================================================
   D.A.B.S.y VOICE ENGINE
   ========================================================= */

window.DABSyVoice = (() => {

  const state = {
    speaking: false,
    listening: false,

    recognition: null,

    supported: false
  };

  const listeners = new Map();

  function emit(
    event,
    data = {}
  ) {

    const list = listeners.get(event);

    if (!list) return;

    for (const callback of list) {

      try {
        callback(data);
      } catch (error) {
        console.error(
          "[D.A.B.S.y Voice]",
          error
        );
      }
    }
  }

  function on(
    event,
    callback
  ) {

    if (!listeners.has(event)) {
      listeners.set(event, []);
    }

    listeners.get(event).push(callback);

    return () => {

      const list = listeners.get(event);

      if (!list) return;

      const index =
        list.indexOf(callback);

      if (index !== -1) {
        list.splice(index, 1);
      }
    };
  }

  function initialize() {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      state.supported = false;

      return false;
    }

    state.supported = true;

    state.recognition =
      new SpeechRecognition();

    state.recognition.lang = "en-IN";

    state.recognition.continuous = false;

    state.recognition.interimResults = false;

    state.recognition.maxAlternatives = 1;

    state.recognition.onstart = () => {

      state.listening = true;

      emit("listening");
    };

    state.recognition.onend = () => {

      state.listening = false;

      emit("stopped-listening");
    };

    state.recognition.onerror = (event) => {

      state.listening = false;

      emit(
        "error",
        {
          error: event.error
        }
      );
    };

    state.recognition.onresult = (event) => {

      const result =
        event.results[
          event.results.length - 1
        ];

      const text =
        result[0].transcript.trim();

      emit(
        "result",
        {
          text
        }
      );
    };

    return true;
  }

  function listen() {

    if (!state.recognition) {
      initialize();
    }

    if (!state.recognition) {

      emit(
        "error",
        {
          error:
            "Speech recognition is not supported."
        }
      );

      return false;
    }

    try {

      state.recognition.start();

      return true;

    } catch (error) {

      console.warn(
        "[D.A.B.S.y Voice] listen:",
        error
      );

      return false;
    }
  }

  function stopListening() {

    if (!state.recognition) return;

    try {
      state.recognition.stop();
    } catch (_) {}
  }

  function speak(
    text
  ) {

    if (!text) return;

    if (!window.speechSynthesis) {

      emit(
        "error",
        {
          error:
            "Speech synthesis is not supported."
        }
      );

      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.lang = "en-IN";

    /*
      Slightly higher pitch gives D.A.B.S.y
      a more creature-like voice without trying
      to imitate a particular person.
    */

    utterance.rate = 0.96;
    utterance.pitch = 1.18;
    utterance.volume = 0.95;

    utterance.onstart = () => {

      state.speaking = true;

      emit("speaking");
    };

    utterance.onend = () => {

      state.speaking = false;

      emit("stopped-speaking");
    };

    utterance.onerror = () => {

      state.speaking = false;

      emit("stopped-speaking");
    };

    state.speaking = true;

    window.speechSynthesis.speak(
      utterance
    );
  }

  function stopSpeaking() {

    if (!window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

    state.speaking = false;

    emit("stopped-speaking");
  }

  function getState() {

    return {
      speaking: state.speaking,
      listening: state.listening,
      supported: state.supported
    };
  }

  initialize();

  return {
    on,
    listen,
    stopListening,
    speak,
    stopSpeaking,
    getState
  };

})();
