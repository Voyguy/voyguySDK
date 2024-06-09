const WebSocket = require("ws");

class VoiceControl {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);

    this.ws.on("open", () => {
      console.log("WebSocket connection established.");
    });

    this.ws.on("message", (data) => {
      const response = JSON.parse(data);
      this.handleResponse(response);
    });

    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.sendCommand(transcript);
    };

    recognition.start();
  }

  sendCommand(command) {
    const domData = this.extractDOM();
    this.ws.send(JSON.stringify({ command, context: domData }));
  }

  extractDOM() {
    const inputs = document.querySelectorAll("input, button, select");
    return Array.from(inputs).map((el) => ({
      tag: el.tagName,
      id: el.id,
      classes: el.className,
      name: el.name,
      type: el.type,
    }));
  }

  handleResponse(response) {
    const actions = response.actions;
    actions.forEach((action) => {
      const element = document.querySelector(action.selector);
      if (action.type === "click") {
        element.click();
      } else if (action.type === "input") {
        element.value = action.value;
        element.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
  }
}

module.exports = VoiceControl;
