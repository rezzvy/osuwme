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
    this.parent = this.view.el('[data-edit="spacing"]');

    this.spacingLevelInput = this.view.el('input[type="number"]', this.parent);
    this.spacingLevelPreview = this.view.el("#spacing-preview", this.parent);
  }

  _target() {
    this.targetContainer = this.model.currentEdit.target;
    this.targetElement = this.view.el(".spacing-item", this.targetContainer);
  }

  /* 
  =========================================
     Events
  ========================================= 
  */

  init() {
    this._vars();

    this.view.on(this.spacingLevelInput, "input", (e) => {
      const value = parseInt(e.target.value);

      if (value < 0) e.target.value = 1;
      if (value >= 100) e.target.value = 100;

      this.view.disable(!e.target.value, "#modal-edit-save");
      this.view.el(this.spacingLevelPreview).style.setProperty("--spacing-level", e.target.value);
    });
  }

  /* 
  =========================================
     States
  ========================================= 
  */

  open() {
    this._target();

    const level = this.targetElement.dataset.spacingLevel;
    if (!level) return;

    this.view.val(this.spacingLevelInput, level);
    this.view.el(this.spacingLevelPreview).style.setProperty("--spacing-level", level);

    this.view.disable(false, "#modal-edit-save");
  }

  save() {
    const level = this.spacingLevelInput.value;

    this.view.el(this.targetElement).style.setProperty("--spacing-level", level);
    this.view.dataset(this.targetElement, "spacingLevel", level);
  }
}
