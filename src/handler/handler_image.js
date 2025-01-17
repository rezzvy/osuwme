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
    this.parent = this.view.el('[data-edit="image"]');

    this.img = this.view.el("img", this.parent);
    this.linkInput = this.view.el('input[type="text"]', this.parent);
    this.submitButton = this.view.el("#image-link-submit-btn", this.parent);
  }

  _target() {
    this.targetContainer = this.model.currentEdit.target;
    this.targetElement = this.view.el("img", this.targetContainer);
  }

  /* 
  =========================================
     Handlers
  ========================================= 
  */

  _submitButtonHandler() {
    const value = this.linkInput.value;

    this.view.disable(true, "#modal-edit-save", this.linkInput);

    if (!this.model.isValidURL(value)) {
      this.view.disable(false, this.linkInput);
      this.view.renderModalEditErrorMessage(true, "Invalid URL.");
      this.view.replacePlaceholder(this.img, false);
      return;
    }

    this.view.el(this.img).src = value;

    this.view.renderModalEditErrorMessage(false);
    this.view.buttonLoading(true, this.submitButton);
  }

  _imgLoadHandler() {
    this.view.buttonLoading(false, this.submitButton);
    this.view.disable(false, "#modal-edit-save", this.linkInput);
    this.view.renderModalEditErrorMessage(false);
    this.view.replacePlaceholder(this.img, true);
  }

  _imgErrorHandler() {
    this.view.buttonLoading(false, this.submitButton);
    this.view.disable(false, this.linkInput);
    this.view.renderModalEditErrorMessage(true, "Can't proceseed the link");
    this.view.replacePlaceholder(this.img, false);
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

    this.view.on(this.img, "load", () => {
      if (this.model.currentEdit.key !== "image") return;

      this._imgLoadHandler();
    });

    this.view.on(this.img, "error", () => {
      if (this.model.currentEdit.key !== "image") return;

      this._imgErrorHandler();
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
    this.view.el(this.img).src = source;
  }

  close() {
    this.view.replacePlaceholder(this.img, false);

    this.view.el(this.img).removeAttribute("src");
    this.view.val(this.linkInput, "");
  }

  save() {
    this.view.replacePlaceholder(this.targetElement, true, false);

    this.view.el(this.targetElement).src = this.img.src;
    this.view.dataset(this.targetElement, "src", this.img.src);
  }
}
