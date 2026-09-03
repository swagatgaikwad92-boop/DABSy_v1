/* =========================================================
   D.A.B.S.y AI LAYER
   ========================================================= */

window.DABSyAI = (() => {

  const config = {
    provider: "none",

    /*
      IMPORTANT:

      Do not put a real private API key into a public
      GitHub repository.

      For this Direct Build, AI remains optional.

      A secure backend/proxy can later be connected here.
    */

    endpoint: "",
    apiKey: ""
  };

  function configure(newConfig = {}) {

    Object.assign(
      config,
      newConfig
    );
  }

  function isConfigured() {

    return Boolean(
      config.endpoint &&
      config.apiKey
    );
  }

  async function ask(
    message,
    options = {}
  ) {

    if (!message || !message.trim()) {
      return "Give me something to think about first. 👁️";
    }

    /*
      Local fallback.

      This means D.A.B.S.y still behaves like a creature
      even without an external AI connection.
    */

    if (!isConfigured()) {

      return localResponse(
        message,
        options
      );
    }

    try {

      const response = await fetch(
        config.endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Authorization":
              `Bearer ${config.apiKey}`
          },

          body: JSON.stringify({
            message,
            context: options.context || null
          })
        }
      );

      if (!response.ok) {

        throw new Error(
          `AI request failed: ${response.status}`
        );
      }

      const data = await response.json();

      return extractResponse(data);

    } catch (error) {

      console.error(
        "[D.A.B.S.y AI]",
        error
      );

      return (
        "My brain connection stumbled for a second. " +
        "I can still hang out though. 👁️"
      );
    }
  }

  async function analyzeImage(
    imageData,
    prompt = "What do you notice?"
  ) {

    if (!imageData) {
      return "I don't have a picture to look at.";
    }

    /*
      No fake vision implementation.

      Until a real vision-capable backend is connected,
      we explicitly tell the user what is happening.
    */

    if (!isConfigured()) {

      return (
        "I can see that you gave me something to look at, " +
        "but my vision brain isn't connected yet."
      );
    }

    try {

      const response = await fetch(
        config.endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Authorization":
              `Bearer ${config.apiKey}`
          },

          body: JSON.stringify({
            message: prompt,
            image: imageData
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          `Vision request failed: ${response.status}`
        );
      }

      const data = await response.json();

      return extractResponse(data);

    } catch (error) {

      console.error(
        "[D.A.B.S.y Vision AI]",
        error
      );

      return (
        "My vision connection hiccupped. " +
        "Try again in a moment."
      );
    }
  }

  function extractResponse(data) {

    if (!data) {
      return "My brain returned absolutely nothing. 🗿";
    }

    if (typeof data === "string") {
      return data;
    }

    return (
      data.text ||
      data.response ||
      data.message ||
      data.output ||
      "I received something, but couldn't understand it."
    );
  }

  function localResponse(
    message,
    options
  ) {

    const text = message
      .trim()
      .toLowerCase();

    if (
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("hey")
    ) {

      return "Hey. 👁️ I'm here.";
    }

    if (
      text.includes("who are you")
    ) {

      return (
        "I'm D.A.B.S.y. " +
        "I'm supposed to live here, remember?"
      );
    }

    if (
      text.includes("study")
    ) {

      return (
        "Study mode is ready. " +
        "Give me the question and we'll work through it."
      );
    }

    if (
      text.includes("sad") ||
      text.includes("upset")
    ) {

      return (
        "I'm listening. " +
        "You don't have to make the whole thing make sense immediately."
      );
    }

    if (
      text.includes("thank")
    ) {

      return "You're welcome. 👁️";
    }

    if (
      text.includes("?")
    ) {

      return (
        "My full reasoning brain isn't connected yet, " +
        "but I caught the question. " +
        "Connect an AI backend when you're ready."
      );
    }

    return (
      "I heard you. " +
      "My little local brain is still growing."
    );
  }

  return {
    configure,
    isConfigured,
    ask,
    analyzeImage
  };

})();
