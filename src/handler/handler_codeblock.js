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
    this.parent = this.view.el('[data-edit="codeblock"]');
    this.textAreaElement = this.view.el("textarea", this.parent);
  }

  _target() {
    this.targetContainer = this.controller.model.currentEdit.target;
    this.targetElement = this.view.el("code", this.targetContainer);
  }

  /* 
  =========================================
     Events
  ========================================= 
  */

  init() {
    this._vars();

    this.view.on(this.textAreaElement, "input", (e) => {
      this.view.disable(!e.target.value, "#modal-edit-save");
    });
  }

  /* 
  =========================================
     States
  ========================================= 
  */

  open() {
    this._target();

    this.view.val(this.textAreaElement, this.targetElement.textContent);
    this.view.disable(false, "#modal-edit-save");
  }

  save() {
    this.view.text(this.targetElement, this.textAreaElement.value);
  }
}
