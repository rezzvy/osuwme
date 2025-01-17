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
    this.parent = this.view.el('[data-edit="list"]');

    this.addListItemButton = this.view.el("#add-list-btn", this.parent);
    this.listItemContainer = this.view.el("#list-item-edit-container", this.parent);
    this.orderedListSwitch = this.view.el("#ordered-list-check", this.parent);
  }

  _target() {
    this.targetContainer = this.model.currentEdit.target;
    this.targetElement = this.view.el("ul", this.targetContainer);
  }

  /* 
  =========================================
     Events
  ========================================= 
  */

  init() {
    this._vars();

    this.view.on(this.addListItemButton, "click", () => {
      this.view.toggle(this.listItemContainer, "ph", false);
      this.view.append(this.listItemContainer, this.view.generateListItemEdit());

      this.view.disable(false, "#modal-edit-save");
    });

    this.view.on(this.listItemContainer, "click", (e) => {
      if (!e.target.dataset.action) return;
      this.view.remove(e.target.closest(".list-item"));

      const isContainerEmpty = this.model.isNodeEmpty(this.listItemContainer);
      this.view.toggle(this.listItemContainer, "ph", isContainerEmpty);
      this.view.disable(isContainerEmpty, "#modal-edit-save");
    });
  }

  /* 
  =========================================
     States
  ========================================= 
  */

  open() {
    this._target();

    if (!this.model.isNodeEmpty(this.targetElement)) {
      const fragment = document.createDocumentFragment();

      for (const li of this.targetElement.children) {
        const title = li.dataset.title;
        const content = li.innerHTML;

        this.view.append(fragment, this.view.generateListItemEdit(title, content));
      }

      this.view.el(this.orderedListSwitch).checked = this.targetElement.dataset.ordered === "true";
      this.view.append(this.listItemContainer, fragment);
      this.view.toggle(this.listItemContainer, "ph", false);
      this.view.disable(false, "#modal-edit-save");
    }
  }

  close() {
    this.view.el(this.orderedListSwitch).checked = false;

    this.view.toggle(this.listItemContainer, "ph", true);
    this.view.html(this.listItemContainer, "");
    this.view.disable(true, "#modal-edit-save");
  }

  save() {
    let li = "";
    for (const item of this.listItemContainer.children) {
      const title = this.view.el(".list-title-input", item);
      const content = this.view.el("._list-content", item);

      li += this.view.generateListItem(title.value, content.innerHTML);
    }

    this.view.toggle(this.targetElement, "ol", this.orderedListSwitch.checked);
    this.view.dataset(this.targetElement, "ordered", this.orderedListSwitch.checked);

    this.view.replacePlaceholder(this.targetElement, true, false);
    this.view.html(this.targetElement, li);
  }
}
