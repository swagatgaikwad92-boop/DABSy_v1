/* =========================================================
   D.A.B.S.y CORE
   Brain:
   perception → attention → mood → personality → decision
   → action
   ========================================================= */

(() => {

  "use strict";

  const state = {

    mood: "idle",

    behavior: "IDLE",

    attention: "NOTHING",

    visionEnabled: false,

    studyMode: false,

    sleeping: false,

    speaking: false,

    listening: false,

    lastInteraction: 0,

    lastSpontaneousAction: 0,

    touchStart: null,

    touchMoved: false,

    userPresent: false,

    booted: false

  };

  const elements = {

    creature:
      document.getElementById("creature"),

    eyeLeft:
      document.getElementById("eyeLeft"),

    eyeRight:
      document.getElementById("eyeRight"),

    subtitle:
      document.getElementById("subtitle"),

    statusText:
      document.getElementById("statusText"),

    statusPill:
      document.getElementById("statusPill"),

    visionButton:
      document.getElementById("visionButton"),

    voiceButton:
      document.getElementById("voiceButton"),

    studyButton:
      document.getElementById("studyButton"),

    sleepButton:
      document.getElementById("sleepButton"),

    visionIndicator:
      document.getElementById("visionIndicator"),

    permissionMessage:
      document.getElementById("permissionMessage"),

    retryCameraButton:
      document.getElementById("retryCameraButton"),

    camera:
      document.getElementById("camera"),

    studyPanel:
      document.getElementById("studyPanel"),

    closeStudyButton:
      document.getElementById("closeStudyButton"),

    studyInput:
      document.getElementById("studyInput"),

    studySendButton:
      document.getElementById("studySendButton"),

    studyOutput:
      document.getElementById("studyOutput")

  };

  /* =====================================================
     BASIC UI
     ===================================================== */

  function setStatus(
    text,
    active = false
  ) {

    elements.statusText.textContent =
      text;

    elements.statusPill.classList.toggle(
      "active",
      active
    );
  }

  function showSubtitle(
    text,
    duration = 3200
  ) {

    if (!text) return;

    elements.subtitle.textContent =
      text;

    elements.subtitle.classList.add(
      "visible"
    );

    clearTimeout(
      showSubtitle.timer
    );

    showSubtitle.timer =
      setTimeout(() => {

        elements.subtitle.classList.remove(
          "visible"
        );

      }, duration);
  }

  function setExpression(
    expression
  ) {

    const expressions = [
      "thinking",
      "happy",
      "surprised",
      "sleepy",
      "away",
      "blinking",
      "look-left",
      "look-right",
      "look-up",
      "look-down",
      "curious",
      "confused"
    ];

    for (const name of expressions) {

      elements.creature.classList.remove(
        name
      );
    }

    if (expression) {

      elements.creature.classList.add(
        expression
      );
    }
  }

  function changeMood(
    mood
  ) {

    state.mood = mood;

    switch (mood) {

      case "happy":
        state.behavior = "HAPPY";
        setExpression("happy");
        break;

      case "curious":
        state.behavior = "CURIOUS";
        setExpression("curious");
        break;

      case "thinking":
        state.behavior = "THINKING";
        setExpression("thinking");
        break;

      case "sleepy":
        state.behavior = "SLEEPY";
        setExpression("sleepy");
        break;

      case "confused":
        state.behavior = "CONFUSED";
        setExpression("confused");
        break;

      case "excited":
        state.behavior = "EXCITED";
        setExpression("surprised");
        break;

      default:
        state.behavior = "IDLE";
        setExpression(null);
    }
  }

  /* =====================================================
     BLINK SYSTEM
     ===================================================== */

  function blink() {

    if (state.studyMode) return;

    elements.creature.classList.add(
      "blinking"
    );

    setTimeout(() => {

      elements.creature.classList.remove(
        "blinking"
      );

    }, 130);
  }

  function scheduleBlink() {

    const delay =
      2200 +
      Math.random() * 4200;

    setTimeout(() => {

      if (
        !state.sleeping &&
        !state.studyMode
      ) {
        blink();
      }

      scheduleBlink();

    }, delay);
  }

  /* =====================================================
     EYE MOVEMENT
     ===================================================== */

  function look(
    direction
  ) {

    const directions = [
      "look-left",
      "look-right",
      "look-up",
      "look-down"
    ];

    for (const name of directions) {

      elements.creature.classList.remove(
        name
      );
    }

    if (direction) {

      elements.creature.classList.add(
        direction
      );
    }

    setTimeout(() => {

      if (!state.sleeping) {
        setExpression(
          state.mood === "happy"
            ? "happy"
            : null
        );
      }

    }, 650);
  }

  function randomLook() {

    const directions = [
      "look-left",
      "look-right",
      "look-up",
      "look-down"
    ];

    look(
      directions[
        Math.floor(
          Math.random() *
          directions.length
        )
      ]
    );
  }

  /* =====================================================
     TOUCH
     ===================================================== */

  function setupTouch() {

    elements.creature.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    elements.creature.addEventListener(
      "pointermove",
      handlePointerMove
    );

    elements.creature.addEventListener(
      "pointerup",
      handlePointerUp
    );

    elements.creature.addEventListener(
      "pointercancel",
      handlePointerUp
    );
  }

  function handlePointerDown(
    event
  ) {

    if (state.studyMode) return;

    state.touchStart = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now()
    };

    state.touchMoved = false;

    try {
      elements.creature.setPointerCapture(
        event.pointerId
      );
    } catch (_) {}
  }

  function handlePointerMove(
    event
  ) {

    if (!state.touchStart) return;

    const dx =
      event.clientX -
      state.touchStart.x;

    const dy =
      event.clientY -
      state.touchStart.y;

    if (
      Math.abs(dx) > 12 ||
      Math.abs(dy) > 12
    ) {

      state.touchMoved = true;

      /*
        Dragging changes gaze.
      */

      if (Math.abs(dx) > Math.abs(dy)) {

        look(
          dx > 0
            ? "look-right"
            : "look-left"
        );

      } else {

        look(
          dy > 0
            ? "look-down"
            : "look-up"
        );
      }
    }
  }

  function handlePointerUp(
    event
  ) {

    if (!state.touchStart) return;

    const duration =
      performance.now() -
      state.touchStart.time;

    const dx =
      event.clientX -
      state.touchStart.x;

    const dy =
      event.clientY -
      state.touchStart.y;

    state.touchStart = null;

    if (state.touchMoved) {

      state.lastInteraction =
        performance.now();

      changeMood("curious");

      showSubtitle(
        "👁️"
      );

      return;
    }

    /*
      Duration gives the interaction meaning.
    */

    if (duration < 220) {

      quickTap();

    } else if (duration < 900) {

      gentleTouch();

    } else {

      longTouch();

    }
  }

  function quickTap() {

    state.lastInteraction =
      performance.now();

    if (state.sleeping) {

      wakeUp();

      return;
    }

    changeMood("happy");

    showSubtitle(
      "Hey. 👁️"
    );

    setTimeout(() => {

      changeMood("idle");

    }, 900);
  }

  function gentleTouch() {

    state.lastInteraction =
      performance.now();

    changeMood("happy");

    showSubtitle(
      "Heh."
    );

    setTimeout(() => {

      changeMood("idle");

    }, 1100);
  }

  function longTouch() {

    state.lastInteraction =
      performance.now();

    changeMood("happy");

    showSubtitle(
      "You found me."
    );

    setTimeout(() => {

      changeMood("idle");

    }, 1600);
  }

  /* =====================================================
     VISION
     ===================================================== */

  async function toggleVision() {

    if (state.visionEnabled) {

      DABSyVision.disable();

      state.visionEnabled = false;

      elements.visionIndicator.classList.add(
        "hidden"
      );

      elements.visionButton.innerHTML =
        `<span class="control-icon">◉</span>
         <span>Vision</span>`;

      setStatus(
        "Vision is off",
        false
      );

      showSubtitle(
        "My eyes are resting."
      );

      changeMood("idle");

      return;
    }

    try {

      setStatus(
        "Opening my eyes...",
        true
      );

      await DABSyVision.enable(
        elements.camera
      );

      state.visionEnabled = true;

      elements.visionIndicator.classList.remove(
        "hidden"
      );

      elements.visionButton.innerHTML =
        `<span class="control-icon">◉</span>
         <span>Vision ON</span>`;

      setStatus(
        "D.A.B.S.y is watching",
        true
      );

      changeMood("curious");

      showSubtitle(
        "My eyes are open. 👁️"
      );

    } catch (error) {

      console.error(
        "[D.A.B.S.y]",
        error
      );

      state.visionEnabled = false;

      setStatus(
        "Camera unavailable",
        false
      );

      elements.permissionMessage.classList.remove(
        "hidden"
      );

      showSubtitle(
        "I couldn't open the camera."
      );
    }
  }

  /* =====================================================
     VISION EVENTS
     ===================================================== */

  function setupVisionEvents() {

    DABSyVision.on(
      "movement",
      data => {

        if (!state.visionEnabled) {
          return;
        }

        /*
          Movement doesn't automatically make D.A.B.S.y
          talk. It simply changes attention/behavior.
        */

        state.attention = "MOVEMENT";

        changeMood("curious");

        randomLook();

        setTimeout(() => {

          if (
            state.mood === "curious"
          ) {

            changeMood("idle");
          }

        }, 1200);
      }
    );

    DABSyVision.on(
      "error",
      ({ error }) => {

        console.error(
          "[D.A.B.S.y Vision]",
          error
        );
      }
    );
  }

  /* =====================================================
     VOICE
     ===================================================== */

  function setupVoice() {

    DABSyVoice.on(
      "listening",
      () => {

        state.listening = true;

        setStatus(
          "Listening...",
          true
        );

        changeMood("curious");

        showSubtitle(
          "I'm listening."
        );
      }
    );

    DABSyVoice.on(
      "stopped-listening",
      () => {

        state.listening = false;

        if (state.visionEnabled) {

          setStatus(
            "D.A.B.S.y is watching",
            true
          );

        } else {

          setStatus(
            "D.A.B.S.y is awake",
            true
          );
        }
      }
    );

    DABSyVoice.on(
      "result",
      async ({ text }) => {

        state.listening = false;

        await handleConversation(
          text
        );
      }
    );

    DABSyVoice.on(
      "speaking",
      () => {

        state.speaking = true;

        changeMood("happy");
      }
    );

    DABSyVoice.on(
      "stopped-speaking",
      () => {

        state.speaking = false;

        if (!state.sleeping) {
          changeMood("idle");
        }
      }
    );

    DABSyVoice.on(
      "error",
      ({ error }) => {

        console.warn(
          "[D.A.B.S.y Voice]",
          error
        );

        state.listening = false;

        setStatus(
          "Voice unavailable",
          false
        );

        showSubtitle(
          "My voice input isn't supported here."
        );
      }
    );
  }

  function talkToDABSy() {

    if (state.speaking) {

      DABSyVoice.stopSpeaking();

      return;
    }

    if (state.listening) {

      DABSyVoice.stopListening();

      return;
    }

    DABSyVoice.listen();
  }

  async function handleConversation(
    text
  ) {

    if (!text) return;

    state.attention = "USER";

    state.lastInteraction =
      performance.now();

    const lower =
      text.toLowerCase();

    if (
      lower.includes("sleep") ||
      lower.includes("good night")
    ) {

      sleep();

      return;
    }

    if (
      lower.includes("wake") ||
      lower.includes("wake up")
    ) {

      wakeUp();

      return;
    }

    if (
      lower.includes("study") ||
      lower.includes("homework")
    ) {

      openStudyMode();

      return;
    }

    changeMood("thinking");

    showSubtitle(
      "Thinking..."
    );

    const response =
      await DABSyAI.ask(
        text,
        {
          context: {
            mood: state.mood,
            behavior: state.behavior,
            attention: state.attention
          }
        }
      );

    showSubtitle(
      response,
      5000
    );

    DABSyVoice.speak(
      response
    );
  }

  /* =====================================================
     STUDY MODE
     ===================================================== */

  function openStudyMode() {

    if (state.sleeping) {
      wakeUp();
    }

    state.studyMode = true;

    state.attention = "USER";

    elements.studyPanel.classList.remove(
      "hidden"
    );

    setStatus(
      "Study Mode",
      true
    );

    changeMood("thinking");

    setTimeout(() => {

      elements.studyInput.focus();

    }, 100);
  }

  function closeStudyMode() {

    state.studyMode = false;

    elements.studyPanel.classList.add(
      "hidden"
    );

    changeMood("idle");

    if (state.visionEnabled) {

      setStatus(
        "D.A.B.S.y is watching",
        true
      );

    } else {

      setStatus(
        "D.A.B.S.y is awake",
        true
      );
    }
  }

  async function submitStudyQuestion() {

    const question =
      elements.studyInput.value.trim();

    if (!question) return;

    addStudyMessage(
      question,
      "user"
    );

    elements.studyInput.value = "";

    addStudyMessage(
      "Thinking...",
      "dabsy",
      "thinkingMessage"
    );

    const answer =
      await DABSyAI.ask(
        question,
        {
          context: {
            mode: "study",
            behavior: "STUDYING"
          }
        }
      );

    const thinkingMessage =
      document.getElementById(
        "thinkingMessage"
      );

    if (thinkingMessage) {

      thinkingMessage.remove();
    }

    addStudyMessage(
      answer,
      "dabsy"
    );

    changeMood("happy");
  }

  function addStudyMessage(
    text,
    sender,
    id = ""
  ) {

    const message =
      document.createElement("div");

    message.className =
      `study-message ${sender}`;

    if (id) {
      message.id = id;
    }

    const label =
      document.createElement("span");

    label.className =
      "study-message-label";

    label.textContent =
      sender === "user"
        ? "YOU"
        : "D.A.B.S.y";

    const content =
      document.createElement("div");

    content.textContent =
      text;

    message.appendChild(label);
    message.appendChild(content);

    elements.studyOutput.appendChild(
      message
    );

    elements.studyOutput.scrollTop =
      elements.studyOutput.scrollHeight;
  }

  /* =====================================================
     SLEEP
     ===================================================== */

  function sleep() {

    state.sleeping = true;

    state.attention = "NOTHING";

    changeMood("sleepy");

    setStatus(
      "D.A.B.S.y is resting",
      false
    );

    showSubtitle(
      "zzz..."
    );
  }

  function wakeUp() {

    state.sleeping = false;

    changeMood("happy");

    setStatus(
      state.visionEnabled
        ? "D.A.B.S.y is watching"
        : "D.A.B.S.y is awake",
      state.visionEnabled
    );

    showSubtitle(
      "I'm back."
    );

    setTimeout(() => {

      changeMood("idle");

    }, 1300);
  }

  /* =====================================================
     SPONTANEOUS BEHAVIOR
     ===================================================== */

  function behaviorLoop() {

    if (
      state.sleeping ||
      state.studyMode ||
      state.speaking ||
      state.listening
    ) {

      scheduleBehaviorLoop();

      return;
    }

    const now =
      performance.now();

    const timeSinceInteraction =
      now - state.lastInteraction;

    /*
      D.A.B.S.y gets occasional independent behavior.

      It does NOT spam the user.
    */

    if (
      timeSinceInteraction > 9000 &&
      now - state.lastSpontaneousAction > 7000
    ) {

      const roll =
        Math.random();

      state.lastSpontaneousAction =
        now;

      if (roll < 0.34) {

        randomLook();

      } else if (roll < 0.60) {

        blink();

      } else if (roll < 0.78) {

        changeMood("curious");

        setTimeout(() => {

          changeMood("idle");

        }, 900);

      } else {

        /*
          Sometimes D.A.B.S.y simply does nothing.

          That's important for making it feel less
          like a notification machine.
        */

        changeMood("idle");
      }
    }

    scheduleBehaviorLoop();
  }

  function scheduleBehaviorLoop() {

    setTimeout(
      behaviorLoop,
      1800 +
      Math.random() * 2500
    );
  }

  /* =====================================================
     BUTTONS
     ===================================================== */

  function setupButtons() {

    elements.visionButton.addEventListener(
      "click",
      toggleVision
    );

    elements.voiceButton.addEventListener(
      "click",
      talkToDABSy
    );

    elements.studyButton.addEventListener(
      "click",
      openStudyMode
    );

    elements.sleepButton.addEventListener(
      "click",
      () => {

        if (state.sleeping) {
          wakeUp();
        } else {
          sleep();
        }

      }
    );

    elements.closeStudyButton.addEventListener(
      "click",
      closeStudyMode
    );

    elements.studySendButton.addEventListener(
      "click",
      submitStudyQuestion
    );

    elements.studyInput.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          submitStudyQuestion();
        }
      }
    );

    elements.retryCameraButton.addEventListener(
      "click",
      async () => {

        elements.permissionMessage.classList.add(
          "hidden"
        );

        await toggleVision();

      }
    );
  }

  /* =====================================================
     BOOT
     ===================================================== */

  function boot() {

    setupTouch();

    setupButtons();

    setupVisionEvents();

    setupVoice();

    scheduleBlink();

    scheduleBehaviorLoop();

    state.booted = true;

    setStatus(
      "D.A.B.S.y is awake",
      true
    );

    /*
      Initial creature greeting.
    */

    setTimeout(() => {

      showSubtitle(
        "Hello. I'm D.A.B.S.y. 👁️",
        4200
      );

      changeMood("happy");

      setTimeout(() => {

        changeMood("idle");

      }, 1200);

    }, 650);

    console.log(
      "D.A.B.S.y booted successfully."
    );
  }

  /*
    Expose a 
