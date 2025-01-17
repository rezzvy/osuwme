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
    this.parent = this.view.el('[data-edit="spoilerbox"]');

    this.useBoxSwitch = this.view.el('input[type="checkbox"]', this.parent);
    this.boxTitleInput = this.view.el('input[type="text"]', this.parent);
  }

  _target() {
    this.targetContainer = this.model.currentEdit.target;

    this.targetElement = this.view.el("details", this.targetContainer);
    this.targetTitleElement = this.view.el("details > summary", this.targetContainer);
  }

  /* 
  =========================================
     Events
  ========================================= 
  */

  init() {
    this._vars();

    this.view.on(this.useBoxSwitch, "input", (e) => {
      this.view.el(this.boxTitleInput).disabled = !e.target.checked;
    });
  }

  /* 
  =========================================
     States
  ========================================= 
  */

  open() {
    this._target();

    const { title, box } = this.targetElement.dataset;

    this.view.el(this.boxTitleInput).value = title;
    this.view.el(this.boxTitleInput).disabled = box !== "true";
    this.view.el(this.useBoxSwitch).checked = box === "true";

    this.view.disable(false, "#modal-edit-save");
  }

  save() {
    this.view.dataset(this.targetElement, "box", this.useBoxSwitch.checked);
    this.view.dataset(this.targetElement, "title", this.boxTitleInput.value);

    const isDropable = !this.boxTitleInput.value && this.useBoxSwitch.checked;

    if (isDropable) {
      this.view.el(this.targetTitleElement).setAttribute("data-drop", "true");
    } else {
      this.view.el(this.targetTitleElement).removeAttribute("data-drop");
    }

    const title = this.view.el(this.useBoxSwitch).checked ? this.boxTitleInput.value : "Spoiler";
    this.view.text(this.targetTitleElement, title);
  }
}
