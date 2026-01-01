export default class {
  constructor(controller) {
    this.controller = controller;
    this.model = this.controller.model;
    this.view = this.controller.view;
  }

  /* 
  =========================================
     Variables
  ========================================= 
  */

  _vars() {
    this.parent = this.view.el('[data-edit="audio"]');

    this.audio = this.view.el("audio", this.parent);
    this.linkInput = this.view.el('input[type="text"]', this.parent);
    this.submitButton = this.view.el("#audio-link-submit-btn", this.parent);
  }

  _target() {
    this.targetContainer = this.model.currentEdit.target;
    this.targetElement = this.view.el(".play-audio-btn", this.targetContainer);
  }

  /* 
  =========================================
     Methods
  ========================================= 
  */

  stop() {
    this.view.el(this.audio).removeAttribute("src");
    this.view.el(this.audio).pause();
    this.view.el(this.audio).load();
  }

  /* 
  =========================================
     Handlers
  ========================================= 
  */

  _submitButtonHandler() {
    const value = this.linkInput.value;

    if (value.startsWith("https://drive.google.com/")) {
      const match = value.match(/\/d\/(.+?)\//);
      const fileId = match && match[1] ? match[1] : null;

      const directLink = fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : value;
      const keepCustomLink = confirm("Google Drive link detected. Preview won't work, but it still works on osu-web. Continue?");

      if (keepCustomLink) {
        this.save(directLink);
        this.controller.view.modalEdit.hide();
      }

      return;
    }

    this.view.disable(true, "#modal-edit-save", this.linkInput);

    this.stop();

    if (!this.model.isValidURL(value)) {
      this.view.disable(false, this.linkInput);
      this.view.renderModalEditErrorMessage(true, "Invalid URL.");
      this.view.replacePlaceholder(this.audio, false);
      return;
    }

    this.view.el(this.audio).src = value;
    this.view.renderModalEditErrorMessage(false);
    this.view.buttonLoading(true, this.submitButton);
  }

  _audioLoadHandler() {
    this.view.buttonLoading(false, this.submitButton);
    this.view.disable(false, "#modal-edit-save", this.linkInput);
    this.view.renderModalEditErrorMessage(false);
    this.view.replacePlaceholder(this.audio, true);
  }

  _audioErrorHandler() {
    this.view.buttonLoading(false, this.submitButton);
    this.view.disable(false, this.linkInput);
    if (this.audio.src.startsWith("https://drive.google.com")) {
      this.view.renderModalEditErrorMessage(true, "Preview is not available for google drive link");
    } else {
      this.view.renderModalEditErrorMessage(true, "Can't proceseed the link");
    }
    this.view.replacePlaceholder(this.audio, false);
  }

  /* 
  =========================================
     Events
  ========================================= 
  */

  init() {
    this._vars();

    this.view.on(this.linkInput, "input", (e) => {
      this.view.disable(!e.target.value, this.submitButton);
    });

    this.view.on(this.submitButton, "click", () => {
      this._submitButtonHandler();
    });

    this.view.on(this.audio, "canplaythrough", () => {
      if (this.model.currentEdit.key !== "audio") return;

      this._audioLoadHandler();
    });

    this.view.on(this.audio, "error", () => {
      if (this.model.currentEdit.key !== "audio") return;

      this._audioErrorHandler();
    });
  }

  /* 
  =========================================
     States
  ========================================= 
  */

  open() {
    this._target();
    this.view.disable(true, this.submitButton);

    if (!this.targetElement.dataset.src) return;
    const source = this.targetElement.dataset.src;

    this.view.val(this.linkInput, source);
    this.view.el(this.audio).src = source;
  }

  close() {
    this.stop();

    this.view.replacePlaceholder(this.audio, false);
    this.view.val(this.linkInput, "");
  }

  save(costumSrc) {
    this.view.dataset(this.targetElement, "src", costumSrc ? costumSrc : this.audio.src);

    const cachedSrc = this.targetElement.dataset.cachedSrc;

    if (this.targetElement.dataset.src !== cachedSrc) {
      this.targetElement.dataset.originalSrc = "";
      this.targetElement.dataset.cachedSrc = "";
    }

    if (costumSrc) {
      this.view.el(this.targetElement).dataset.bsTitle = "Preview is not available for costum audio source (e.g Google Drive Direct Link)";
      this.view.el(this.targetElement).dataset.bsToggle = "tooltip";
      this.view.el(this.targetElement).dataset.event = "false";
      return;
    }

    if (this.targetElement.dataset.event === "false") {
      this.view.dataset(this.targetElement, "event", "true");
      this.view.el(this.targetElement).removeAttribute("data-bs-toggle");
      this.view.el(this.targetElement).removeAttribute("data-bs-title");
    }
  }
}
