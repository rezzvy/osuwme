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

    this.editorContainer.querySelectorAll(".anchor-color").forEach((el) => {
      const color = el.style.color;
      el.parentElement.style.color = color;
      el.parentElement.innerHTML = el.textContent;
    });

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
      let color = null;
      let colorEl = null;

      paragraph.innerHTML = paragraph.innerHTML
        .replace(/\&nbsp;/g, " ") // Normalize all &nbsp; to regular space
        .replace(/\s+/g, " ") // Normalize multiple spaces
        .replace(/(?<=>)(\s|&nbsp;)+(?=<)/g, '<span class="inline-splitter"> </span>');

      for (const el of paragraph.children) {
        if (el.parentElement.tagName !== "P") span.parentElement.replaceWith(span);
        if (el.tagName === "BR") this.view.dataset(el, "spacing", "%SPCITM%");

        if (el.style.color && !color) {
          if (el.matches('a[style*="color"]') || el.querySelector("a")) {
            color = el.style.color;
            el.style.color = "";
            colorEl = el;
          }
        }
      }

      const anchor = colorEl?.querySelector("a");
      if (color && anchor && colorEl) {
        anchor.innerHTML = `<span class="anchor-color" style="color: ${color}">${anchor.innerHTML}</span>`;
      }

      if (!anchor && colorEl) {
        colorEl.style.color = color;
      }
    });

    this.view.html(this.targetContainer, editorContent.innerHTML);
  }
}
