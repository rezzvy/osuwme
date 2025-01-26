export default class {
  constructor(controller) {
    this.controller = controller;
    this.model = this.controller.model;
    this.view = this.controller.view;

    this.imagemap = this.model.imagemap;
    this.isUpdating = false;
    this.isMobile = this.model.isMobileDevice();
    this.eventName = {
      move: this.isMobile ? "touchmove" : "mousemove",
      down: this.isMobile ? "touchstart" : "mousedown",
      up: this.isMobile ? "touchend" : "mouseup",
    };
  }

  /* 
  =========================================
     Variables
  ========================================= 
  */

  _vars() {
    this.parent = this.view.el('[data-edit="imgmap"]');

    this.submitButton = this.view.el("#imgmap-link-submit-btn", this.parent);
    this.linkInput = this.view.el("#imgmap-link-input", this.parent);
    this.img = this.view.el("img", this.parent);

    this.imageMapContainer = this.view.el("#imgmap-edit-container", this.parent);
    this.imageMapAddItemButton = this.view.el("#add-imgmap-item-btn", this.parent);

    this.imageMapItemInputTitle = this.view.el("#imgmap-title-input-item", this.parent);
    this.imageMapItemInputLink = this.view.el("#imgmap-link-input-item", this.parent);
    this.imageMapItemInputWidth = this.view.el("#imgmap-width-input-item", this.parent);
    this.imageMapItemInputHeight = this.view.el("#imgmap-height-input-item", this.parent);

    this.imageMapItemDuplicateButton = this.view.el("#imgmap-duplicate-btn", this.parent);
    this.imageMapItemRemoveButton = this.view.el("#imgmap-remove-btn", this.parent);

    this.importFromBBCodeExecuteButton = this.view.el("#imgmap-from-bbcode-execute", this.parent);
  }

  _target() {
    this.targetContainer = this.model.currentEdit.target;

    this.targetElement = this.view.el(".imgmap-container", this.targetContainer);
    this.targetImg = this.view.el("img", this.targetContainer);
  }

  /* 
  =========================================
     Methods
  ========================================= 
  */

  generateEditItems(source) {
    this._target();

    if (source.length > 0) {
      const fragment = document.createDocumentFragment();

      for (const item of source) {
        const { title, link, style } =
          item instanceof Element
            ? { title: item.dataset.title, link: item.dataset.link, style: item.style.cssText }
            : { title: item.title, link: item.link, style: item.style };

        this.view.append(fragment, this.view.generateEditImageMapItem(title, link, style));
      }

      return fragment;
    }

    return false;
  }

  disableImageMapItemInput(boolean) {
    this.view.disable(
      boolean,
      this.imageMapItemInputTitle,
      this.imageMapItemInputLink,
      this.imageMapItemInputWidth,
      this.imageMapItemInputHeight,
      this.imageMapItemDuplicateButton,
      this.imageMapItemRemoveButton
    );
  }

  setImageMapItemInputValue(...data) {
    const [title, link, width, height] = data;

    if (title !== null) this.view.val(this.imageMapItemInputTitle, title);
    if (link !== null) this.view.val(this.imageMapItemInputLink, link);
    if (width !== null) this.view.val(this.imageMapItemInputWidth, width);
    if (height !== null) this.view.val(this.imageMapItemInputHeight, height);
  }

  renderMainEditor(boolean) {
    this.view.renderModalEditErrorMessage(false);
    this.view.disable(true, "#imgmap-from-bbcode-execute");
    this.view.val("#imgmap-from-bbcode-input", "");

    this.view.toggle(".imgmap-from-bbcode", "d-none", boolean);
    this.view.toggle(".imgmap-main", "d-none", !boolean);
    this.view.toggle("#modal-edit-save", "d-none", !boolean);
  }

  /* 
  =========================================
     Handlers
  ========================================= 
  */

  _submitButtonHandler() {
    const value = this.view.val(this.linkInput);

    if (!this.model.isNodeEmpty(this.imageMapContainer, 1)) {
      if (!this.view.dialog("Existing item will be wiped, continue?")) return;

      this.view.els(".imgmap-edit-item", this.imageMapContainer).forEach((item) => {
        this.view.remove(item);
      });
    }

    this.view.disable(true, "#modal-edit-save", this.linkInput);

    if (!this.model.isValidURL(value)) {
      this.view.disable(false, this.linkInput);
      this.view.renderModalEditErrorMessage(true, "Invalid URL.");
      this.view.replacePlaceholder(this.imageMapContainer, false);
      return;
    }

    this.img.src = value;
    this.view.buttonLoading(true, this.submitButton);
    this.view.renderModalEditErrorMessage(false);
  }

  _imgLoadHandler() {
    this.view.buttonLoading(false, this.submitButton);
    this.view.disable(false, this.linkInput, this.imageMapAddItemButton);
    this.view.renderModalEditErrorMessage(false);
    this.view.replacePlaceholder(this.imageMapContainer, true, false);
  }

  _imgErrorHandler() {
    this.view.buttonLoading(false, this.submitButton);
    this.view.disable(false, this.linkInput);
    this.view.renderModalEditErrorMessage(true, "Can't proceseed the link");
    this.view.replacePlaceholder(this.imageMapContainer, false);
  }

  _mouseMoveHandler(e) {
    if (!this.imagemap.activeBox) {
      this.isUpdating = false;
      return;
    }

    if (this.imagemap.isResizing) {
      const [width, height] = this.model.calculatePointerData(e, this.imageMapContainer, "resizing");

      this.view.el(this.imagemap.activeBox).style.width = `${width}%`;
      this.view.el(this.imagemap.activeBox).style.height = `${height}%`;

      this.setImageMapItemInputValue(null, null, `${width}%`, `${height}%`);
    } else {
      const [top, left] = this.model.calculatePointerData(e, this.imageMapContainer, "moving");

      this.view.el(this.imagemap.activeBox).style.top = `${top}%`;
      this.view.el(this.imagemap.activeBox).style.left = `${left}%`;
    }

    this.isUpdating = false;
  }

  _mouseDownHandler(e, element) {
    const { title, link } = element.dataset;
    const { width, height } = element.style;

    this.model.setImageMapData(e, element);
    this.view.toggleActiveImageMapItem(element, this.imageMapContainer);
    this.view.toggle(this.imagemap.activeBox, "resize-cursor", this.imagemap.isResizing);

    this.disableImageMapItemInput(false);
    this.setImageMapItemInputValue(title, link, width, height);
  }

  _mouseUpHandler() {
    this.imagemap.activeBox = null;
    this.imagemap.isResizing = false;

    this.view.toggle(this.imagemap.activeBox, "resize-cursor", this.imagemap.isResizing);
  }

  _removeButtonHandler() {
    this.disableImageMapItemInput(true);
    this.setImageMapItemInputValue("", "", "", "");

    this.view.remove(this.imagemap.workingElement);
    this.view.disable(this.model.isNodeEmpty(this.imageMapContainer, 1), "#modal-edit-save");

    this.imagemap.workingElement = null;
  }

  _duplicateButtonHandler() {
    this.view.copy(this.imagemap.workingElement, (copied) => {
      this.view.toggle(this.imagemap.workingElement, "active", false);
      this.view.toggle(copied, "active", true);
      this.view.append(this.imageMapContainer, copied);

      this.imagemap.workingElement = copied;
    });
  }

  async _ImportFromBBCode(e) {
    const button = e.target;
    this.view.disable(true, button);

    const val = this.view.val("#imgmap-from-bbcode-input");
    const data = await this.model.parseImagemap(val);

    if (!data.status) {
      this.view.disable(false, button);
      return this.view.renderModalEditErrorMessage(true, data.message);
    }

    if (!data.image.isAvailable) {
      this.view.disable(false, button);
      return this.view.renderModalEditErrorMessage(true, "We can't fetch the image. Please check if it's valid or try uploading it elsewhere.");
    }

    const items = data.items.map((item) => {
      return {
        title: item.alt,
        link: item.href,
        style: `left:${item.x}%; top:${item.y}%; width:${item.width}%; height:${item.height}%;`,
      };
    });

    for (const item of this.view.els(".imgmap-edit-item", this.imageMapContainer)) {
      await this.view.remove(item);
    }

    this.view.disable(false, this.imageMapAddItemButton, "#modal-edit-save");
    this.view.el(this.img).src = data.image.url;
    this.view.val(this.linkInput, data.image.url);

    this.view.append(this.imageMapContainer, this.generateEditItems(items));
    this.disableImageMapItemInput(true);
    this.renderMainEditor(true);
  }

  /* 
  =========================================
     Events
  ========================================= 
  */

  init() {
    this._vars();
    this.view.disable(true, "#imgmap-from-bbcode-execute");

    this.view.on(this.linkInput, "input", (e) => {
      this.view.disable(!e.target.value, this.submitButton);
    });

    this.view.on(this.submitButton, "click", () => {
      this._submitButtonHandler();
    });

    this.view.on(this.img, "load", () => {
      if (this.model.currentEdit.key !== "imgmap") return;

      this._imgLoadHandler();
    });

    this.view.on(this.img, "error", () => {
      if (this.model.currentEdit.key !== "imgmap") return;

      this._imgErrorHandler();
    });

    this.view.on(this.imageMapAddItemButton, "click", (e) => {
      this.view.append(this.imageMapContainer, this.view.generateEditImageMapItem());
      this.view.disable(false, "#modal-edit-save");
    });

    this.view.on(document, this.eventName.move, (e) => {
      if (this.isUpdating || !this.imagemap.activeBox) return;

      this.isUpdating = true;
      requestAnimationFrame(() => this._mouseMoveHandler(e));
    });

    this.view.on(document, this.eventName.down, (e) => {
      const imgmapItem = e.target.closest(".imgmap-edit-item");
      if (!imgmapItem) return;

      this._mouseDownHandler(e, imgmapItem);
    });

    this.view.on(document, this.eventName.up, (e) => {
      if (!this.imagemap.activeBox) return;

      this._mouseUpHandler(e);
    });

    this.view.on(this.imageMapItemInputTitle, "input", (e) => {
      if (!this.imagemap.workingElement) return;

      this.view.dataset(this.imagemap.workingElement, "title", e.target.value);
    });

    this.view.on(this.imageMapItemInputLink, "input", (e) => {
      if (!this.imagemap.workingElement) return;

      this.view.dataset(this.imagemap.workingElement, "link", e.target.value);
    });

    this.view.on(this.imageMapItemInputWidth, "change", (e) => {
      if (!this.imagemap.workingElement) return;

      this.view.setImageMapItemSize(e, this.imagemap.workingElement, "width", this.imageMapContainer);
    });

    this.view.on(this.imageMapItemInputHeight, "change", (e) => {
      if (!this.imagemap.workingElement) return;

      this.view.setImageMapItemSize(e, this.imagemap.workingElement, "height", this.imageMapContainer);
    });

    this.view.on(this.imageMapItemRemoveButton, "click", (e) => {
      if (!this.imagemap.workingElement) return;

      this._removeButtonHandler();
    });

    this.view.on(this.imageMapItemDuplicateButton, "click", (e) => {
      if (!this.imagemap.workingElement) return;

      this._duplicateButtonHandler();
    });

    this.view.on(this.imageMapContainer, "dragstart", (e) => {
      e.preventDefault();
    });

    this.view.on(this.imageMapContainer, "click", (e) => {
      const item = e.target.closest(".imgmap-edit-item");
      if (item && item === this.imagemap.workingElement) return;
      this.imagemap.workingElement = null;

      this.disableImageMapItemInput(true);
      this.setImageMapItemInputValue("", "", "", "");

      this.view.clearActiveImageMapItem(this.imageMapContainer);
    });

    this.view.on(this.importFromBBCodeExecuteButton, "click", async (e) => {
      await this._ImportFromBBCode(e);
    });

    this.view.on("#imgmap-from-bbcode-input", "input", (e) => {
      this.view.disable(!e.target.value.trim(), "#imgmap-from-bbcode-execute");
    });

    this.view.on("#go-to-imgmap-import-btn", "click", (e) => {
      this.renderMainEditor(false);
    });

    this.view.on("#imgmap-from-bbcode-go-back", "click", (e) => {
      this.renderMainEditor(true);
    });
  }

  /* 
  =========================================
     States
  ========================================= 
  */

  open() {
    this._target();

    const items = this.view.els(".output-imgmap-item", this.targetContainer);

    if (items.length > 0) {
      this.view.el(this.img).src = this.targetImg.src;
      this.view.val(this.linkInput, this.targetImg.src);

      this.view.append(this.imageMapContainer, this.generateEditItems(items));
      this.view.replacePlaceholder(this.imageMapContainer, true, false);
      this.view.disable(false, "#modal-edit-save");
    }

    this.view.disable(true, this.imageMapAddItemButton, this.submitButton);
    this.disableImageMapItemInput(true);
  }

  close() {
    this.imagemap.workingElement = null;

    this.view.el(this.img).removeAttribute("src");

    this.view.val(this.linkInput, "");
    this.view.els(".imgmap-edit-item", this.imageMapContainer).forEach((item) => this.view.remove(item));
    this.view.replacePlaceholder(this.imageMapContainer, false);
    this.setImageMapItemInputValue("", "", "", "");
  }

  save() {
    let content = `<img src="${this.img.src}">`;

    this.view.els(".imgmap-edit-item").forEach((item) => {
      const { title, link } = item.dataset;
      const style = item.style.cssText;

      content += this.view.generateOutputImageMapItem(title, link, style);
    });

    this.view.replacePlaceholder(this.targetElement, true, false);
    this.view.html(this.targetElement, content);
  }
}
