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
        "./assets/gamemode_icons/osu_white.png",
        "./assets/gamemode_icons/taiko_white.png",
        "./assets/gamemode_icons/catch_white.png",
        "./assets/gamemode_icons/mania_white.png",
      ],
    };

    this.type === "new";
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

  collectAddedFontSize() {
    let data = [];
    let options = "";

    Array.from(this.fontSizeContainer.children).forEach((el) => {
      const title = this.view.el(".font-size-title-input", el).value;
      let size = Number(this.view.el(".font-size-size-input", el).value);

      if (Number.isNaN(size) || size < 50 || size > 200) {
        size = 100;
      }

      options += `<option value="${size}%" ${title === "Normal" ? "selected" : ""}>${title}</option>`;
      data.push({ name: title, size: size });
    });

    if (data.length === 0) {
      const fragment = document.createDocumentFragment();
      data = [...this.model.fontSizesDefault];

      data.forEach((item) => {
        const el = this.view.generateCostumFontSizeEdit(item.name, item.size);
        fragment.appendChild(el);

        options += `<option value="${item.size}%" ${item.name === "Normal" ? "selected" : ""}>${item.name}</option>`;
      });

      this.view.append(this.fontSizeContainer, fragment);
      this.view.toggle(this.fontSizeContainer, "ph", false);
    }

    return { array: data, html: options };
  }

  getCountries(query) {
    this.view.html(this.countryAssetWrapper, "");

    const filteredCountries = this.countries.filter((country) => country.name.toLowerCase().startsWith(query));
    if (!filteredCountries.length) {
      this.view.html(this.countryAssetWrapper, '<div class="p-2 pe-none">No results found!</div>');
    }

    filteredCountries.forEach((country, index) => {
      const { code, name } = country;

      const skeleton = `
     <button class="country-item-assets btn btn-outline-light btn-sm" data-action="assets" data-code="${code}">
              <img class="pe-none" src="${this.model.handler.flags.buildSrc(this.type, code)}"  alt="${name}" />
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

    this.fontSizeContainer = this.view.el("#define-font-size-item-container", this.parent);

    this.useNewFlagSwitch = this.view.el("#switch-flag-style-icons-te", this.parent);
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

    // Gradient Select Event
    this.view.on("#gradient-type-select", "change", (e) => {
      const value = e.target.value;
      this.model.currentGradient = value;

      if (this.model.latestSelection) {
        const [colorStart, colorMiddle, colorEnd] = [this.model.gradientColorStart, this.model.gradientColorMiddle, this.model.gradientColorEnd].map(
          (color) => color.getColor().toHEXA().toString(),
        );

        this.controller.formatTextToGradient(value, this.model.latestSelection, colorStart, colorMiddle, colorEnd);
      }

      const settings = {
        horizontal: {
          text: "Start",
          columns: ["row-cols-3", "row-cols-2"],
          toggles: { middle: true, start: false, end: false, randomize: true },
        },
        middle: {
          text: "Start/End",
          columns: ["row-cols-3", "row-cols-2"],
          toggles: { middle: false, start: false, end: true, randomize: true },
        },
        threeColored: {
          text: "Start",
          columns: ["row-cols-2", "row-cols-3"],
          toggles: { middle: false, start: false, end: false, randomize: true },
        },
        random: {
          toggles: { middle: true, start: true, end: true, randomize: false },
        },
        default: {
          toggles: { start: true, middle: true, end: true, randomize: true },
        },
      };

      const toggleSettings = settings[value] || settings.default;

      if (toggleSettings.text) this.view.text("#gradient-start div", toggleSettings.text);
      if (toggleSettings.columns) this.view.replace(".color-picker-wrapper", ...toggleSettings.columns);

      const toggles = toggleSettings.toggles;
      this.view.toggle("#gradient-start", "d-none", toggles.start);
      this.view.toggle("#gradient-middle", "d-none", toggles.middle);
      this.view.toggle("#gradient-end", "d-none", toggles.end);
      this.view.toggle(".randomize-btn-container", "d-none", toggles.randomize);
    });

    // Gradient Randomize Button Event
    this.view.on(
      "#randomize-selected-text-btn",
      "click",
      this.controller.debounce((e) => {
        if (this.model.latestSelection && this.model.currentGradient !== "random") return;

        const [colorStart, colorMiddle, colorEnd] = [this.model.gradientColorStart, this.model.gradientColorMiddle, this.model.gradientColorEnd].map(
          (color) => color.getColor().toHEXA().toString(),
        );

        this.controller.formatTextToGradient(this.model.currentGradient, this.model.latestSelection, colorStart, colorMiddle, colorEnd);
      }, 100),
    );

    this.view.on("#define-costum-font-size-modal-btn", "click", (e) => {
      this.view.toggle("#text-editor-toolbar", "d-none", true);
      this.view.toggle("#modal-edit-save", "d-none", true);
      this.view.toggle("#modal-edit .btn-close", "d-none", true);
      this.view.toggle("#define-font-size-container", "d-none", false);
    });

    this.view.on("#define-font-size-close-container-btn", "click", (e) => {
      this.view.toggle("#text-editor-toolbar", "d-none", false);
      this.view.toggle("#modal-edit-save", "d-none", false);
      this.view.toggle("#modal-edit .btn-close", "d-none", false);
      this.view.toggle("#define-font-size-container", "d-none", true);

      const collected = this.collectAddedFontSize();

      this.model.fontSizes = collected.array;
      localStorage.setItem("font-size", JSON.stringify(this.model.fontSizes));

      this.view.html(".ql-size.form-select", collected.html);
    });

    this.view.on("#define-font-size-add-btn", "click", (e) => {
      const el = this.view.generateCostumFontSizeEdit("Untitled", "100");
      this.view.append(this.fontSizeContainer, el);
      this.view.toggle(this.fontSizeContainer, "ph", false);
    });

    this.view.on(this.fontSizeContainer, "click", (e) => {
      const action = e.target.dataset.action;
      if (!action) return;

      if (action === "remove") {
        this.view.remove(e.target.closest(".font-size-item"));
        this.view.toggle(this.fontSizeContainer, "ph", this.model.isNodeEmpty(this.fontSizeContainer));
      }
    });

    this.view.on(this.fontSizeContainer, "change", (e) => {
      if (!e.target.matches(".font-size-size-input")) return;

      let value = Number(e.target.value);

      if (Number.isNaN(value)) {
        e.target.value = 100;
        return;
      }

      if (value < 50) e.target.value = 50;
      if (value > 200) e.target.value = 200;
    });

    this.view.on(this.useNewFlagSwitch, "input", (e) => {
      this.type = e.target.checked === true ? "new" : "old";

      this.model.handler.flags.updateRenderedFlag(".country-item-assets", this.assetContainer, this.type);
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

    this.view.els("p, ol > li, h2", editorContent).forEach((paragraph) => {
      paragraph.innerHTML = paragraph.innerHTML
        .replace(/\&nbsp;/g, " ") // Normalize all &nbsp; to regular space
        .replace(/\s+/g, " ") // Normalize multiple spaces
        .replace(/(?<=>)(\s|&nbsp;)+(?=<)/g, '<span class="inline-splitter"> </span>')
        .replace(/<br\s*\/?>/gi, '<br data-spacing="%SPCITM%">');

      this.view.els(`[data-spacing-color][style*="color"], .ql-cursor`, paragraph).forEach((el) => {
        if (el.matches(".ql-cursor")) {
          el.remove();
          return;
        }

        if (el.matches("a") || el.querySelector("a")) {
          return;
        }

        el.style.color = null;
      });

      this.controller.swapLinks(paragraph);
    });

    this.seperatedListItems(editorContent);
    this.view.html(this.targetContainer, editorContent.innerHTML);
  }
}
