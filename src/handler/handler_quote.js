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
    this.parent = this.view.el('[data-edit="quote"]');

    this.sourceSwitch = this.view.el('input[type="checkbox"]', this.parent);
    this.sourceInput = this.view.el('input[type="text"]', this.parent);
  }

  _target() {
    this.targetContainer = this.controller.model.currentEdit.target;

    this.targetElement = this.view.el("blockquote", this.targetContainer);
    this.targetTitleElement = this.view.el("blockquote > ._source", this.targetContainer);
    this.targetTitleTextElement = this.view.el("blockquote > ._source > span", this.targetContainer);
  }

  /* 
  =========================================
     Events
  ========================================= 
  */

  init() {
    this._vars();

    this.view.on(this.sourceInput, "input", (e) => {
      this.view.disable(!e.target.value, "#modal-edit-save");
    });

    this.view.on(this.sourceSwitch, "input", (e) => {
      this.view.el(this.sourceInput).disabled = !e.target.checked;
      this.view.disable(e.target.checked && !this.view.val(this.sourceInput), "#modal-edit-save");
    });
  }

  /* 
  =========================================
     States
  ========================================= 
  */

  open() {
    this._target();

    this.view.el(this.sourceSwitch).checked = this.targetElement.dataset.includeSource === "true";
    this.view.val(this.sourceInput, this.targetElement.dataset.source);

    this.view.disable(false, "#modal-edit-save");
    this.view.disable(!this.sourceSwitch.checked, this.sourceInput);
  }

  save() {
    this.view.dataset(this.targetElement, "source", this.sourceInput.value);
    this.view.dataset(this.targetElement, "includeSource", this.sourceSwitch.checked);

    this.view.toggle(this.targetTitleElement, "d-none", !this.sourceSwitch.checked);
    this.view.text(this.targetTitleTextElement, this.sourceInput.value);
  }
}
