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
    this.parent = this.view.el('[data-edit="youtube"]');

    this.iframe = this.view.el("iframe", this.parent);
    this.linkInput = this.view.el('input[type="text"]', this.parent);
    this.submitButton = this.view.el("#youtube-link-submit-btn", this.parent);
  }

  _target() {
    this.targetContainer = this.model.currentEdit.target;
    this.targetElement = this.view.el("iframe", this.targetContainer);
  }

  /* 
  =========================================
     Handlers
  ========================================= 
  */

  _submitButtonHandler() {
    const value = this.linkInput.value;
    const videoId = this.model.getYoutubeVideoId(value);

    this.view.disable(true, "#modal-edit-save", this.linkInput);

    if (!this.model.isValidURL(value)) {
      this.view.disable(false, this.linkInput);
      this.view.renderModalEditErrorMessage(true, "Invalid URL.");
      this.view.replacePlaceholder(this.iframe, false);
      return;
    }

    if (!videoId) {
      this.view.disable(false, this.linkInput);
      this.view.renderModalEditErrorMessage(true, "YouTube video ID not found.");
      this.view.replacePlaceholder(this.iframe, false);
      return;
    }

    this.view.el(this.iframe).src = `https://www.youtube.com/embed/${videoId}?feature=oembed`;
    this.view.dataset(this.iframe, "videoId", videoId);

    this.view.renderModalEditErrorMessage(false);
    this.view.buttonLoading(true, this.submitButton);
  }

  _iframeLoadHandler() {
    this.view.buttonLoading(false, this.submitButton);
    this.view.disable(false, "#modal-edit-save", this.linkInput);
    this.view.renderModalEditErrorMessage(false);
    this.view.replacePlaceholder(this.iframe, true);
  }

  _iframeErrorHandler() {
    this.view.buttonLoading(false, this.submitButton);
    this.view.disable(false, this.linkInput);
    this.view.renderModalEditErrorMessage(true, "Can't proceseed the link");
    this.view.replacePlaceholder(this.iframe, false);
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

    this.view.on(this.iframe, "load", () => {
      if (this.model.currentEdit.key !== "youtube") return;

      this._iframeLoadHandler();
    });

    this.view.on(this.iframe, "error", () => {
      if (this.model.currentEdit.key !== "youtube") return;

      this._iframeErrorHandler();
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

    if (!this.targetElement.dataset.videoId) return;

    this.view.val(this.linkInput, `https://youtu.be/${this.targetElement.dataset.videoId}`);
    this.view.el(this.iframe).src = this.targetElement.src;
  }

  close() {
    this.view.replacePlaceholder(this.iframe, false);

    this.view.el(this.iframe).removeAttribute("src");
    this.view.val(this.linkInput, "");
  }

  save() {
    this.view.replacePlaceholder(this.targetElement, true, false);

    this.view.el(this.targetElement).src = this.iframe.src;
    this.view.dataset(this.targetElement, "videoId", this.iframe.dataset.videoId);
  }
}
