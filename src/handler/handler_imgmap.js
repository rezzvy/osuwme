export default class {
  constructor(controller) {
    this.controller = controller;
    this.model = this.controller.model;
    this.view = this.controller.view;

    this.imagemap = this.model.imagemap;

    this.moveable = null;
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

    this.autoSnapCheckbox = this.view.el("#imagemap-auto-snap", this.parent);

    this.imageMapContainer = this.view.el("#imgmap-edit-container", this.parent);
    this.imageMapStickyToolbar = this.view.el("#imagemap-sticky-toolbar", this.parent);
    this.imageMapAddItemButton = this.view.el("#add-imgmap-item-btn", this.parent);
    this.imageMapAddItemButtonShortcut = this.view.el("#imgmap-add-shortcut-btn", this.parent);

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

  initMoveable() {
    if (this.moveable) return;

    const directions = {
      top: true,
      left: true,
      bottom: true,
      right: true,
      center: true,
      middle: true,
    };

    const isAutoSnapOn = this.autoSnapCheckbox ? this.autoSnapCheckbox.checked : true;

    this.moveable = new Moveable(this.imageMapContainer, {
      target: null,
      draggable: true,
      resizable: true,
      snappable: true,
      bounds: { left: 0, top: 0, right: 0, bottom: 0, position: "css" },
      snapContainer: this.imageMapContainer,
      isDisplaySnapDigit: isAutoSnapOn,
      isDisplayInnerSnapDigit: false,
      snapGap: isAutoSnapOn,
      snapDirections: isAutoSnapOn ? directions : {},
      elementSnapDirections: isAutoSnapOn ? directions : {},
      snapThreshold: 10,
      elementGuidelines: [this.imageMapContainer],
    });

    this.moveable.on("drag", ({ target, left, top }) => {
      const parentWidth = this.imageMapContainer.offsetWidth;
      const parentHeight = this.imageMapContainer.offsetHeight;

      target.style.left = `${(left / parentWidth) * 100}%`;
      target.style.top = `${(top / parentHeight) * 100}%`;

      this.updateInputValues(target);
    });

    this.moveable.on("resize", ({ target, width, height, drag }) => {
      const parentWidth = this.imageMapContainer.offsetWidth;
      const parentHeight = this.imageMapContainer.offsetHeight;

      target.style.width = `${(width / parentWidth) * 100}%`;
      target.style.height = `${(height / parentHeight) * 100}%`;
      target.style.left = `${(drag.left / parentWidth) * 100}%`;
      target.style.top = `${(drag.top / parentHeight) * 100}%`;

      this.updateInputValues(target);
    });
  }

  _updateSnapGuidelines() {
    if (!this.moveable) return;
    const allItems = Array.from(this.view.els(".imgmap-edit-item", this.imageMapContainer));
    this.moveable.elementGuidelines = [this.imageMapContainer, ...allItems];
  }

  updateInputValues(target) {
    const width = parseFloat(target.style.width).toFixed(2) + "%";
    const height = parseFloat(target.style.height).toFixed(2) + "%";

    this.setImageMapItemInputValue(null, null, width, height);
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

  _addImageMapItem(appendOnView = false) {
    const newItem = this.view.generateEditImageMapItem();
    const { title, link } = newItem.dataset;
    const { width, height } = newItem.style;

    const container = this.imageMapContainer;
    const sticky = this.imageMapStickyToolbar;

    if (appendOnView && sticky && container) {
      const stickyRect = sticky.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const topPx = stickyRect.bottom - containerRect.top + container.scrollTop;

      const rawPercent = (topPx / container.scrollHeight) * 100;

      const topPercent = Math.min(100, Math.max(0, rawPercent));

      newItem.style.top = `${topPercent}%`;
    }

    this.imagemap.workingElement = newItem;
    this.moveable.target = newItem;

    this._updateSnapGuidelines();

    this.view.append(container, newItem);
    this.view.toggle(newItem, "active", true);
    this.view.disable(false, "#modal-edit-save");
    this.disableImageMapItemInput(false);
    this.setImageMapItemInputValue(title, link, parseFloat(width).toFixed(2) + "%", parseFloat(height).toFixed(2) + "%");
  }

  _submitButtonHandler() {
    const value = this.view.val(this.linkInput);

    if (!this.model.isNodeEmpty(this.imageMapContainer, 2)) {
      if (!this.view.dialog("Existing item will be wiped, continue?")) return;

      this.view.els(".imgmap-edit-item", this.imageMapContainer).forEach((item) => {
        this.view.remove(item);
      });

      this.moveable.target = null;
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
    this.view.disable(false, this.linkInput, this.imageMapAddItemButton, this.imageMapAddItemButtonShortcut);
    this.view.renderModalEditErrorMessage(false);
    this.view.replacePlaceholder(this.imageMapContainer, true, false);

    setTimeout(() => this.moveable.updateRect(), 100);
  }

  _imgErrorHandler() {
    this.view.buttonLoading(false, this.submitButton);
    this.view.disable(false, this.linkInput);
    this.view.renderModalEditErrorMessage(true, "Can't proceseed the link");
    this.view.replacePlaceholder(this.imageMapContainer, false);
  }

  _itemClickHandler(e, element) {
    const { title, link } = element.dataset;
    const { width, height } = element.style;

    this.imagemap.workingElement = element;

    this.disableImageMapItemInput(false);
    this.setImageMapItemInputValue(title, link, parseFloat(width).toFixed(2) + "%", parseFloat(height).toFixed(2) + "%");

    this._updateSnapGuidelines();

    this.moveable.target = element;

    this.view.clearActiveImageMapItem(this.imageMapContainer);
    this.view.toggle(element, "active", true);

    this.moveable.dragStart(e);
  }

  _removeButtonHandler() {
    if (!this.imagemap.workingElement) return;

    this.disableImageMapItemInput(true);
    this.setImageMapItemInputValue("", "", "", "");

    this.view.remove(this.imagemap.workingElement);
    this.moveable.target = null;
    this.imagemap.workingElement = null;

    this._updateSnapGuidelines();

    this.view.disable(this.model.isNodeEmpty(this.imageMapContainer, 1), "#modal-edit-save");
  }

  _duplicateButtonHandler() {
    if (!this.imagemap.workingElement) return;

    this.view.copy(this.imagemap.workingElement, (copied) => {
      this.view.toggle(this.imagemap.workingElement, "active", false);
      this.view.toggle(copied, "active", true);
      this.view.append(this.imageMapContainer, copied);

      copied.style.top = parseFloat(copied.style.top) + 2 + "%";
      copied.style.left = parseFloat(copied.style.left) + 2 + "%";

      this.imagemap.workingElement = copied;

      this._updateSnapGuidelines();

      this.moveable.target = copied;
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
      return this.view.renderModalEditErrorMessage(true, "We can't fetch the image.");
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

    this.moveable.target = null;
    this.imagemap.workingElement = null;

    this.view.disable(false, this.imageMapAddItemButton, this.imageMapAddItemButtonShortcut, "#modal-edit-save");
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

    this.initMoveable();

    this.view.on(this.autoSnapCheckbox, "change", (e) => {
      if (this.moveable) {
        const isOn = e.target.checked;
        const directions = { top: true, left: true, bottom: true, right: true, center: true, middle: true };

        this.moveable.snapGap = isOn;
        this.moveable.isDisplaySnapDigit = isOn;

        this.moveable.snapDirections = isOn ? directions : {};
        this.moveable.elementSnapDirections = isOn ? directions : {};
      }
    });

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
      this._addImageMapItem();
    });

    this.view.on(this.imageMapAddItemButtonShortcut, "click", (e) => {
      this._addImageMapItem(true);
    });

    this.view.on(this.imageMapContainer, "mousedown", (e) => {
      const imgmapItem = e.target.closest(".imgmap-edit-item");

      if (imgmapItem) {
        this._itemClickHandler(e, imgmapItem);
      } else if (e.target === this.imageMapContainer || e.target === this.img) {
        this.moveable.target = null;
        this.imagemap.workingElement = null;

        this.disableImageMapItemInput(true);
        this.setImageMapItemInputValue("", "", "", "");
        this.view.clearActiveImageMapItem(this.imageMapContainer);
      }
    });

    this.view.on(this.imageMapItemInputTitle, "input", (e) => {
      if (!this.imagemap.workingElement) return;
      this.view.dataset(this.imagemap.workingElement, "title", e.target.value);
    });

    this.view.on(this.imageMapItemInputLink, "input", (e) => {
      if (!this.imagemap.workingElement) return;
      this.view.dataset(this.imagemap.workingElement, "link", e.target.value);
    });

    const updateSizeFromInput = (e, direction) => {
      if (!this.imagemap.workingElement) return;
      this.view.setImageMapItemSize(e, this.imagemap.workingElement, direction, this.imageMapContainer);
      this.moveable.updateRect();
    };

    this.view.on(this.imageMapItemInputWidth, "change", (e) => updateSizeFromInput(e, "width"));
    this.view.on(this.imageMapItemInputHeight, "change", (e) => updateSizeFromInput(e, "height"));

    this.view.on(this.imageMapItemRemoveButton, "click", () => this._removeButtonHandler());
    this.view.on(this.imageMapItemDuplicateButton, "click", () => this._duplicateButtonHandler());

    this.view.on(this.imageMapContainer, "dragstart", (e) => e.preventDefault());

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

    this.view.disable(true, this.imageMapAddItemButton, this.imageMapAddItemButtonShortcut, this.submitButton);
    this.disableImageMapItemInput(true);

    if (this.moveable && this.autoSnapCheckbox) {
      const isOn = this.autoSnapCheckbox.checked;
      const directions = { top: true, left: true, bottom: true, right: true, center: true, middle: true };

      this.moveable.snappable = true;
      this.moveable.snapGap = isOn;
      this.moveable.snapDirections = isOn ? directions : {};
      this.moveable.elementSnapDirections = isOn ? directions : {};
    }

    setTimeout(() => this.moveable && this.moveable.updateRect(), 200);
  }

  close() {
    this.imagemap.workingElement = null;
    if (this.moveable) this.moveable.target = null;

    this.view.el(this.img).removeAttribute("src");

    this.view.val(this.linkInput, "");
    this.view.els(".imgmap-edit-item", this.imageMapContainer).forEach((item) => this.view.remove(item));
    this.view.replacePlaceholder(this.imageMapContainer, false);
    this.setImageMapItemInputValue("", "", "", "");

    this.renderMainEditor(true);
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
