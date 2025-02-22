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

    let content = this.targetContainer.innerHTML.trim();
    this.view.html(this.editorContainer.firstElementChild, content);

    this.editorContainer.querySelectorAll(".inline-splitter").forEach((el) => el.replaceWith(document.createTextNode(" ")));
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
      paragraph.innerHTML = paragraph.innerHTML
        .replace(/\s+/g, " ") // Normalize multiple spaces
        .replace(/(?<=>)(\s|&nbsp;)+(?=<)/g, '<span class="inline-splitter"> </span>');

      for (const el of paragraph.children) {
        if (el.parentElement.tagName !== "P") span.parentElement.replaceWith(span);
        if (el.tagName === "BR") this.view.dataset(el, "spacing", "%SPCITM%");
      }
    });

    this.view.html(this.targetContainer, editorContent.innerHTML);
  }
}
