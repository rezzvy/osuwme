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
    this.parent = this.view.el('[data-edit="text"]');
    this.editorContainer = this.view.el("#text-editor", this.parent);
  }

  _target() {
    this.targetContainer = this.model.currentEdit.target;
  }

  /* 
  =========================================
     Events
  ========================================= 
  */

  init() {
    this._vars();
  }

  /* 
  =========================================
     States
  ========================================= 
  */

  open() {
    this._target();

    this.view.toggle("body", "select-costum", true);
    this.view.disable(false, "#modal-edit-save");

    this.view.html(this.editorContainer.firstElementChild, this.targetContainer.innerHTML.trim());
  }

  close() {
    this.model.quill.history.clear();
    this.model.latestSelection = null;

    this.view.html(".ql-editor", "");
    this.view.toggle("body", "select-costum", false);
  }

  save() {
    const editorContent = this.editorContainer.firstElementChild;

    this.view.els("p", editorContent).forEach((paragraph) => {
      const spacingElement = this.view.el("br", paragraph);

      if (spacingElement) this.view.dataset(spacingElement, "spacing", "%SPCITM%");
      if (!paragraph.innerHTML.trim()) this.view.remove(paragraph);

      this.view.html(
        paragraph,
        paragraph.innerHTML.replace(/(?<=^|>)[^<>]+(?=<|$)/g, (text) => text.replace(/ /g, "\u00A0"))
      );
    });

    this.view.html(this.targetContainer, editorContent.innerHTML);
  }
}
