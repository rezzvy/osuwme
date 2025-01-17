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
    this.parent = this.view.el('[data-edit="heading"]');
    this.titleInput = this.view.el('input[type="text"]', this.parent);
  }

  _target() {
    this.targetContainer = this.model.currentEdit.target;
    this.targetElement = this.view.el(".heading", this.targetContainer);
  }

  /* 
  =========================================
     Events
  ========================================= 
  */

  init() {
    this._vars();

    this.view.on(this.titleInput, "input", (e) => {
      this.view.disable(!e.target.value.trim(), "#modal-edit-save");
    });
  }

  /* 
  =========================================
     States
  ========================================= 
  */

  open() {
    this._target();

    this.view.val(this.titleInput, this.targetElement.textContent);
    this.view.disable(false, "#modal-edit-save");
  }

  save() {
    this.view.text(this.targetElement, this.titleInput.value);
  }
}
