export default class {
  constructor(controller) {
    this.controller = controller;
    this.model = this.controller.model;
    this.view = this.controller.view;
  }

  swapLinks(parentElement) {
    const directChildren = Array.from(parentElement.children);

    directChildren.forEach((grandWrapper) => {
      const anchor = grandWrapper.querySelector("a");

      if (!anchor) {
        return;
      }

      const currentWrapper = anchor.parentNode;
      const newAnchor = anchor.cloneNode(false);
      const originalContent = Array.from(anchor.childNodes);

      currentWrapper.innerHTML = "";
      originalContent.forEach((node) => currentWrapper.appendChild(node));

      const grandWrapperClone = grandWrapper.cloneNode(true);
      newAnchor.appendChild(grandWrapperClone);

      parentElement.replaceChild(newAnchor, grandWrapper);
    });
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

    const latestSelectedChilds = this.view.els(".text-editor-item-selected", editorContent);
    latestSelectedChilds.forEach((item) => {
      item.classList.remove("text-editor-item-selected");
    });

    this.view.els("p", editorContent).forEach((paragraph) => {
      paragraph.innerHTML = paragraph.innerHTML
        .replace(/\&nbsp;/g, " ") // Normalize all &nbsp; to regular space
        .replace(/\s+/g, " ") // Normalize multiple spaces
        .replace(/(?<=>)(\s|&nbsp;)+(?=<)/g, '<span class="inline-splitter"> </span>');

      for (const el of paragraph.children) {
        if (el.parentElement.tagName !== "P") span.parentElement.replaceWith(span);
        if (el.tagName === "BR") this.view.dataset(el, "spacing", "%SPCITM%");
      }

      this.swapLinks(paragraph);
    });

    this.view.html(this.targetContainer, editorContent.innerHTML);
  }
}
