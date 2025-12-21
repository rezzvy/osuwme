export default class {
  constructor(controller) {
    this.controller = controller;
    this.model = this.controller.model;
    this.view = this.controller.view;

    this.assets = {
      "osu! Diff Icons": [
        "./assets/diff_icons/osu/easy-o.png",
        "./assets/diff_icons/osu/normal-o.png",
        "./assets/diff_icons/osu/hard-o.png",
        "./assets/diff_icons/osu/insane-o.png",
        "./assets/diff_icons/osu/expert-o.png",
        "./assets/diff_icons/osu/expertplus-o.png",
        "./assets/diff_icons/osu/na-o.png",
      ],
      "osu!taiko Diff Icons": [
        "./assets/diff_icons/taiko/easy-t.png",
        "./assets/diff_icons/taiko/normal-t.png",
        "./assets/diff_icons/taiko/hard-t.png",
        "./assets/diff_icons/taiko/insane-t.png",
        "./assets/diff_icons/taiko/expert-t.png",
        "./assets/diff_icons/taiko/expertplus-t.png",
        "./assets/diff_icons/taiko/na-t.png",
      ],
      "osu!catch Diff Icons": [
        "./assets/diff_icons/catch/easy-c.png",
        "./assets/diff_icons/catch/normal-c.png",
        "./assets/diff_icons/catch/hard-c.png",
        "./assets/diff_icons/catch/insane-c.png",
        "./assets/diff_icons/catch/expert-c.png",
        "./assets/diff_icons/catch/expertplus-c.png",
        "./assets/diff_icons/catch/na-c.png",
      ],
      "osu!mania Diff Icons": [
        "./assets/diff_icons/mania/easy-m.png",
        "./assets/diff_icons/mania/normal-m.png",
        "./assets/diff_icons/mania/hard-m.png",
        "./assets/diff_icons/mania/insane-m.png",
        "./assets/diff_icons/mania/expert-m.png",
        "./assets/diff_icons/mania/expertplus-m.png",
        "./assets/diff_icons/mania/na-m.png",
      ],
      "Gamemode Icons": [
        "./assets/gamemode_icons/osu.png",
        "./assets/gamemode_icons/taiko.png",
        "./assets/gamemode_icons/catch.png",
        "./assets/gamemode_icons/mania.png",
      ],
    };
  }

  renderAssets() {
    const box = this.view.el("#assets-render", this.assetContainer);
    let skeleton = "";

    for (const asset in this.assets) {
      skeleton += `<div>
           <div class="badge text-bg-dark">${asset}</div>
           <div class="d-flex gap-1 flex-item-no-shrink overflow-auto">
      `;
      for (const item of this.assets[asset]) {
        skeleton += `
      <button class="btn btn-outline-light btn-sm" data-action="assets">
              <img class="pe-none" src="${item}">
      </button>
        `;
      }
      skeleton += `</div></div>`;
    }

    this.view.html(box, skeleton);
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

  getCountries(query) {
    this.view.html(this.countryAssetWrapper, "");

    const filteredCountries = this.countries.filter((country) => country.name.toLowerCase().startsWith(query));
    if (!filteredCountries.length) {
      this.view.html(this.countryAssetWrapper, '<div class="p-2 pe-none">No results found!</div>');
    }

    filteredCountries.forEach((country, index) => {
      const { img, name } = country;

      const skeleton = `
     <button class="btn btn-outline-light btn-sm" data-action="assets">
              <img class="pe-none" src="./assets/countries/${img}" alt="${name}" />
      </button>
    `;

      this.view.html(this.countryAssetWrapper, skeleton, true);
    });
  }

  seperatedListItems(container) {
    const originalLists = Array.from(container.querySelectorAll("ol, ul"));

    originalLists.forEach((list) => {
      const items = Array.from(list.children);
      let currentType = null;
      let newList = null;

      items.forEach((item) => {
        const type = item.getAttribute("data-list");

        if (currentType !== type) {
          newList = document.createElement("ol");
          newList.setAttribute("data-type", type);

          list.parentNode.insertBefore(newList, list);
          currentType = type;
        }

        newList.appendChild(item);
      });

      if (!list.hasChildNodes()) list.remove();
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

    this.countries = this.model.handler.flags.countries;
    this.assetContainer = this.view.el(".assets-form", this.parent);
    this.cuontryAssetInput = this.view.el("#assets-country-input", this.parent);
    this.countryAssetWrapper = this.view.el("#country-assets-search-result", this.parent);
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

    this.view.on(this.cuontryAssetInput, "input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        this.view.html(this.countryAssetWrapper, "");
        return;
      }

      this.getCountries(query);
    });
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
    if (this.view.el("#text-editor-assets").dataset.open === "true") {
      this.view.html(this.model.handler.text.countryAssetWrapper, "");
      this.model.handler.text.cuontryAssetInput.value = "";
    }

    this.view.toggle(".gradient-form", "d-none", true);
    this.view.toggle(".assets-form", "d-none", true);
    this.view.dataset("#text-editor-color-gradient", "open", false);
    this.view.dataset("#text-editor-assets", "open", false);

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

    this.seperatedListItems(editorContent);
    this.view.html(this.targetContainer, editorContent.innerHTML);
  }
}
