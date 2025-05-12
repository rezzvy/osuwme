export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.hotkeyReady = false;
    this.onModalStarting = false;
    this.lastEditModeScrollTop = 0;
    this.lastViewModeScrollTop = 0;
  }

  async init() {
    await this.renderCanvasElementList();
    await this.renderCanvasTemplateList();
    await this.renderChangeLogs();
    this.attachEvents();
    this.renderLatestCanvasContent();

    this.view.init(this.model.isMobileDevice());
  }

  /* 
  =========================================
     Events
  ========================================= 
  */

  attachEvents() {
    // Initialize each handler class.
    for (const key in this.model.handler) this.model.handler[key]?.init?.();

    // Event delegation for element list button.
    this.view.on("#canvas-element-list", "click", (e) => {
      if (!e.target.dataset.key) return;
      this.renderToCanvas(e.target.dataset.key, e.target.dataset.editable, this.model.uniqueID);
    });

    // Event delegation for canvas items.
    this.view.on("#canvas-wrapper", "click", (e) => {
      const canvasItem = e.target.closest(".canvas-item");

      if (canvasItem && e.shiftKey && !document.body.classList.contains("view-mode")) {
        window.getSelection().removeAllRanges();
        canvasItem.classList.toggle("selected", !canvasItem.classList.contains("selected"));
      }

      if (!e.target.dataset.action) return;

      switch (e.target.dataset.action) {
        case "play":
          if (e.target.dataset.event === "true") this.canvasItemAudioPlayerHandler(e.target);
          break;
        case "edit":
          this.canvasItemEditHandler(e.target);
          break;
        case "duplicate":
          this.canvasItemDuplicateHandler(e.target);
          break;
        case "remove":
          this.canvasItemRemoveHandler(e.target);
          break;
      }
    });

    // Modal Edit on Open Event
    this.view.on("#modal-edit", "show.bs.modal", () => {
      this.view.disable(true, "#modal-edit-save");

      this.model.currentHandler?.open?.();
      this.view.renderModalEditSection(this.model.currentEdit.key, this.model.isLargeSize);
    });

    // Modal Edit on Close Event
    this.view.on("#modal-edit", "hide.bs.modal", () => {
      this.model.currentHandler?.close?.();

      this.model.clearCurrentEdit();
      this.view.clearActiveTooltips();
      this.view.renderModalEditErrorMessage(false);

      this.view.toggle(".gradient-form", "d-none", true);
      this.view.dataset("#text-editor-color-gradient", "open", false);
    });

    // Modal Edit Save Button Event
    this.view.on("#modal-edit-save", "click", () => {
      const stack = {
        action: "edit",
        element: this.model.currentEdit.target.closest(".canvas-item"),
        content: this.model.currentEdit.target.innerHTML,
      };

      this.model.currentHandler?.save?.();

      stack.newContent = this.model.currentEdit.target.innerHTML;
      this.pushHistory("undo", stack);

      this.view.modalEdit.hide();
    });

    // Edit Mode Switch Event
    this.view.on("#canvas-mode-switch", "input", (e) => {
      const isViewMode = !e.target.checked;

      if (isViewMode) {
        this.lastEditModeScrollTop = window.scrollY;
        this.view.toggle("body", "view-mode", true);
        window.scrollTo({ top: this.lastViewModeScrollTop || 0, behavior: "instant" });
        return;
      }

      this.lastViewModeScrollTop = window.scrollY;
      this.view.toggle("body", "view-mode", false);
      window.scrollTo({ top: this.lastEditModeScrollTop || 0, behavior: "instant" });
    });

    // Event delegation for loading template.
    this.view.on("#modal-template-body", "click", async (e) => {
      if (!e.target.dataset.templatePath) return;
      await this.loadTemplateHandler(e.target);
    });

    // Project Action: Import Button Event
    this.view.on("#import-project-btn", "click", () => {
      this.view.importProjectFileInput.click();
    });

    // Project Action: Import File Input Event
    this.view.on("#import-project-input", "change", (e) => {
      const files = e.target.files;
      if (files.length === 0) {
        if (this.onModalStarting) this.onModalStarting = false;
        return;
      }

      this.model.readFileAsText(files[0], (content) => {
        if (!this.model.isValidProjectFile(content)) return alert("Can't recognize HTML formats!");
        if (this.onModalStarting) this.view.modalStarting.hide();

        this.setCanvasContent(content);
        this.view.clearActiveTooltips();
      });
    });

    // Project Action: Export Event
    this.view.on("#export-project-btn", "click", () => {
      if (this.model.isNodeEmpty("#canvas-wrapper")) return;

      const content = this.model.getSingleLine(this.view.html("#canvas-wrapper"));
      this.download(content, "text/html", "osuwme-project.html");
    });

    // Canvas Action: Expand Event
    this.view.on("#expand-all-canvas-btn", "click", () => {
      this.view.collapseCanvasItems(false);
    });

    // Canvas Action: Collapse Event
    this.view.on("#collapse-all-canvas-btn", "click", () => {
      this.view.collapseCanvasItems(true);
    });

    // Canvas Action: Clear Canvas Event
    this.view.on("#clear-canvas-btn", "click", () => {
      if (!this.model.isNodeEmpty("#canvas-wrapper") && !this.view.dialog("Are you sure?")) return;
      this.setCanvasContent("");
    });

    this.view.on("#clear-canvas-selection-btn", "click", () => {
      this.view.clearSelectedCanvasItem();
    });

    // Canvas Action: Reset Canvas Size Event
    this.view.on("#reset-canvas-size-btn", "click", () => {
      this.view.css("#canvas", "");
    });

    // Preference: Sticky menu switch event
    this.view.on("#canvas-menu-sticky-switch", "input", (e) => {
      this.view.toggle("#element-list-section", "pinned", e.target.checked);
      this.view.isMenuSticky = e.target.checked;
    });

    // Preference: Hide content on move switch event
    this.view.on("#hide-on-move-switch ", "input", (e) => {
      this.view.toggle("body", "hide-on-move", e.target.checked);
    });

    // Get Code Modal on Open Event
    this.view.on("#getcode-modal", "show.bs.modal", () => {
      this.view.html("#code-output-textarea", this.model.output(this.view.html("#canvas-wrapper")));
    });

    // Get Code Modal on Close Event
    this.view.on("#getcode-modal", "hide.bs.modal", () => {
      this.view.toggle("#clipboard-alert", "d-none", true);
    });

    // Copy to Clipboard Event
    this.view.on("#copy-to-clipboard", "click", async () => {
      const textarea = this.view.el("#code-output-textarea");
      await this.toClipboardHandler(textarea);
    });

    // Download as Text Button Event
    this.view.on("#download-as-text", "click", () => {
      const content = this.view.val("#code-output-textarea");
      this.download(content, "text/plain", "osuwme-bbcode-output.txt");
    });

    // Window Before Page Close Event
    this.view.on(window, "beforeunload", () => {
      this.model.latestCanvasContent = this.view.html("#canvas-wrapper");
    });

    // Audio Modal on Close Event
    this.view.on("#audio-modal", "hide.bs.modal", () => {
      const audio = this.view.el("#audio-modal-preview");
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    // Element List Slider Button Event
    this.view.on("#canvas-element-list-slider", "click", (e) => {
      if (!e.target.matches("[data-action]")) return;

      const action = e.target.dataset.action;
      const container = this.view.menuStickyButtonWrapper;

      if (action === "scroll-to-left") {
        container.scrollTo({ left: container.scrollLeft - 250, behavior: "smooth" });
      } else if (action === "scroll-to-right") {
        container.scrollTo({ left: container.scrollLeft + 250, behavior: "smooth" });
      }
    });

    // Gradient Select Event
    this.view.on("#gradient-type-select", "change", (e) => {
      this.gradientSelectHandler(e);
    });

    // Gradient Randomize Button Event
    this.view.on("#randomize-selected-text-btn", "click", (e) => {
      if (this.model.latestSelection && this.model.currentGradient !== "random") return;

      const [colorStart, colorMiddle, colorEnd] = [this.model.gradientColorStart, this.model.gradientColorMiddle, this.model.gradientColorEnd].map(
        (color) => color.getColor().toHEXA().toString()
      );

      this.formatTextToGradient(this.model.currentGradient, this.model.latestSelection, colorStart, colorMiddle, colorEnd);
    });

    // Undo Button Event
    this.view.on("#undo-canvas-btn", "click", () => {
      this.historyHandler("undo");
    });

    // Redo Button Event
    this.view.on("#redo-canvas-btn", "click", () => {
      this.historyHandler("redo");
    });

    // Starting Modal New Project/Continue Button Event
    this.view.on("#starting-modal-new-project-btn", "click", () => {
      this.hotkeyReady = true;
      this.view.modalStarting.hide();
    });

    // Starting Modal Load Project Button Event
    this.view.on("#starting-modal-load-project-btn", "click", () => {
      this.onModalStarting = true;
      this.view.importProjectFileInput.click();
    });

    // Starting Modal Templates Button Event
    this.view.on("#starting-modal-templates-btn", "click", () => {
      this.view.modalStarting.hide();
      this.view.modalTemplate.show();
    });

    this.view.on(document, "keydown", (e) => {
      const key = e.key.toLowerCase();
      const blockedKeys = ["o", "s", "1", "2", "3", "4", "5", "e", "z", "y"];

      if (e.ctrlKey && blockedKeys.includes(key)) {
        e.preventDefault();
      }

      if (this.hotkeyReady) {
        if (e.ctrlKey && key === "1") {
          this.view.el("#expand-all-canvas-btn").click();
        }

        if (e.ctrlKey && key === "2") {
          this.view.el("#collapse-all-canvas-btn").click();
        }

        if (e.ctrlKey && key === "3") {
          this.view.el("#clear-canvas-btn").click();
        }

        if (e.ctrlKey && key === "4") {
          this.view.el("#clear-canvas-selection-btn").click();
        }

        if (e.ctrlKey && key === "5") {
          this.view.el("#reset-canvas-size-btn").click();
        }

        if (e.ctrlKey && key === "s") {
          this.view.el("#export-project-btn").click();
        }

        if (e.ctrlKey && key === "o") {
          this.view.el("#import-project-btn").click();
        }

        if (e.ctrlKey && key === "e") {
          const editModeInput = this.view.el("#canvas-mode-switch");
          editModeInput.checked = !editModeInput.checked;
          editModeInput.dispatchEvent(new Event("input", { bubbles: true }));
        }

        if (!document.body.classList.contains("select-costum")) {
          if (e.ctrlKey && key === "z") {
            this.view.el("#undo-canvas-btn").click();
          }

          if (e.ctrlKey && key === "y") {
            this.view.el("#redo-canvas-btn").click();
          }
        }
      }
    });
  }

  /* 
  =========================================
     Handler
  ========================================= 
  */

  // Handler for undo / redo button click
  historyHandler(type) {
    const item = this.model.getHistory(type);

    if (!item) return;

    this.pushHistory(type === "undo" ? "redo" : "undo", item);

    if (item.action === "add" || item.action === "copy") {
      if (type === "undo") {
        this.view.remove(item.element);
      } else {
        let container = null;
        if (item.container.matches("li") && item.container.dataset.listItem) {
          container = document.querySelector(`[data-list-item="${item.container.dataset.listItem}"]`);
        }

        this.view.appendBefore(container ? container : item.container, item.element, item.sibling);
      }
    }

    if (item.action === "remove") {
      if (type === "undo") {
        this.view.appendBefore(item.container, item.element, item.sibling);
      } else {
        this.view.remove(item.element);
      }
    }

    if (item.action === "edit") {
      const content = this.view.el("._content", item.element);

      this.view.html(content, type === "undo" ? item.content : item.newContent);
    }

    if (Array.isArray(item)) {
      if (type === "undo") {
        for (let i = item.length - 1; i >= 0; i--) {
          const obj = item[i];
          if (obj.action === "move") {
            let container = null;
            if (obj.container.matches("li") && obj.container.dataset.listItem) {
              container = document.querySelector(`[data-list-item="${obj.container.dataset.listItem}"]`);
            }

            this.view.appendBefore(container ? container : obj.container, obj.element, obj.sibling);
            this.view.replaceContainerPlaceHolder(this.model.isNodeEmpty(obj.targetContainer), obj.targetContainer, obj.container);
          }
        }
      } else if (type === "redo") {
        item.forEach((obj) => {
          if (obj.action === "move") {
            let container = null;
            if (obj.targetContainer.matches("li") && obj.targetContainer.dataset.listItem) {
              container = document.querySelector(`[data-list-item="${obj.targetContainer.dataset.listItem}"]`);
            }

            this.view.appendBefore(container ? container : obj.targetContainer, obj.element, obj.targetSibling);
            this.view.replaceContainerPlaceHolder(this.model.isNodeEmpty(obj.container), obj.container, obj.targetContainer);
          }
        });
      }
    }

    if (item.action === "add" || item.action === "remove") {
      this.view.toggle(
        item.container,
        "ph",
        this.model.isNodeEmpty(item.container) && !item.container.matches("#canvas-wrapper") && !item.container.matches("li")
      );
    }
  }

  // Handler for Gradient Select's "onChange"
  gradientSelectHandler(e) {
    const value = e.target.value;
    this.model.currentGradient = value;

    if (this.model.latestSelection) {
      const [colorStart, colorMiddle, colorEnd] = [this.model.gradientColorStart, this.model.gradientColorMiddle, this.model.gradientColorEnd].map(
        (color) => color.getColor().toHEXA().toString()
      );

      this.formatTextToGradient(value, this.model.latestSelection, colorStart, colorMiddle, colorEnd);
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
  }

  // Handler for copying text to the clipboard.
  async toClipboardHandler(textarea) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(textarea.value);
      this.view.toggle("#clipboard-alert", "d-none", false);
      return;
    }

    textarea.select();
    if (document.execCommand("copy")) {
      this.view.toggle("#clipboard-alert", "d-none", false);
    }
  }

  // Handler for the "Edit Template" button click.
  async loadTemplateHandler(button) {
    if (!this.model.isNodeEmpty("#canvas-wrapper") && !this.view.dialog("Existing canvas will be wiped. Continue?")) return;
    const text = button.textContent;

    this.view.toggle("body", "pe-none", true);
    this.view.html(button, "Fetching...");
    const content = await this.model.fetchData(button.dataset.templatePath, "text");

    this.view.toggle("body", "pe-none", false);
    this.view.html(button, text);
    this.view.css("#canvas", null);

    this.setCanvasContent(content);
    this.view.modalTemplate.hide();
  }

  // Handler for editing a canvas item.
  canvasItemEditHandler(e) {
    const canvasItem = e.closest(".canvas-item");
    const canvasItemContent = this.view.el("._content", canvasItem);
    const modal = this.view.el(`[data-edit="${e.dataset.key}"]`);

    this.model.setCurrentEdit(e.dataset.key, canvasItemContent, modal);
    this.view.modalEdit.show();
  }

  // Handler for duplicating a canvas item.
  canvasItemDuplicateHandler(e) {
    this.view.copy(e.closest(".canvas-item"), (copied, original) => {
      this.view.updateBootstrapCollapseId(copied, this.model.uniqueID);
      this.view.appendAfter(copied, original);

      this.pushHistory("undo", {
        action: "copy",
        element: copied,
        container: copied.parentElement,
        sibling: copied.nextSibling,
      });
    });
  }

  // Handler for removing a canvas item.
  canvasItemRemoveHandler(e) {
    const canvasItem = e.closest(".canvas-item");
    const canvasItemContent = canvasItem.closest("._content");
    const innerContainer = this.view.el("[data-container]", canvasItemContent);

    this.pushHistory("undo", {
      action: "remove",
      element: canvasItem,
      container: canvasItem.parentElement,
      sibling: canvasItem.nextSibling,
    });

    this.view.clearTooltip(e);
    this.view.clearActiveTooltips();
    this.view.remove(canvasItem);

    if (innerContainer) {
      this.view.toggle(innerContainer, "ph", this.model.isNodeEmpty(innerContainer));
    }

    if (this.model.isNodeEmpty("#canvas-wrapper")) {
      this.view.text("#canvas-wrapper", "");
    }
  }

  // Handler for playing an audio file in a canvas item.
  canvasItemAudioPlayerHandler(e) {
    this.view.modalAudioPlayer.show();

    this.view.el("#audio-modal-preview").src = e.dataset.src;
    this.view.el("#audio-modal-preview").play();
  }

  /* 
  =========================================
     Methods
  ========================================= 
  */

  // Adds an action to the history stack and toggles the undo and redo buttons
  pushHistory(type, stack) {
    this.model.pushHistory(type, stack);
    this.toggleUndoRedoButtons();
  }

  // Toggles undo and redo buttons based on their availability
  toggleUndoRedoButtons() {
    this.view.disable(!this.model.history.stack.undo.length, "#undo-canvas-btn");
    this.view.disable(!this.model.history.stack.redo.length, "#redo-canvas-btn");
  }

  // Render a canvas element, optionally auto-append or return the element.
  renderToCanvas(key, editable, uniqueID, autoAppend = true) {
    const skeleton = this.model.getSkeleton(key);
    const canvasItem = this.view.generateCanvasItem(key, editable, uniqueID, skeleton);

    if (autoAppend) {
      this.view.append("#canvas-wrapper", canvasItem);

      this.pushHistory("undo", {
        action: "add",
        element: canvasItem,
        container: canvasItem.parentElement,
        sibling: canvasItem.nextSibling,
      });

      return;
    }

    return canvasItem;
  }

  // Render the latest saved canvas content.
  renderLatestCanvasContent() {
    const content = this.model.latestCanvasContent;

    if (content) {
      this.view.text("#starting-modal-new-project-btn span", "Continue");
    } else {
      this.view.text("#starting-modal-new-project-btn span", "New Project");
    }

    this.setCanvasContent(content);
  }

  // Set canvas content as HTML and adjust visibility of placeholders.
  setCanvasContent(html) {
    this.model.clearHistory();
    this.toggleUndoRedoButtons();

    this.view.html("#canvas-wrapper", html);
    this.view.css("#canvas", "");
    this.view.clearSelectedCanvasItem();

    this.view.els(".inline-splitter").forEach((el) => {
      el.textContent = " ";
    });

    this.view.els("code").forEach((el) => {
      if (el.classList.contains("inline") || !el.dataset.raw) return;

      this.view.text(el, this.model.replaceTextAreaSpacing(false, el.dataset.raw));
    });
  }

  // Generate a downloadable blob and clear it afterward.
  download(content, blobType, downloadName) {
    const blob = this.model.createBlob(blobType, content);

    this.view.download(blob, downloadName);
    this.model.clearBlob(blob);
  }

  // Format selected text with a gradient, using start and end colors.
  formatTextToGradient(type, range, colorStart, colorMiddle, colorEnd) {
    if (!range) return;

    const text = this.model.quill.getText(range.index, range.length);

    let gradients = "";
    if (type === "horizontal") gradients = this.model.generateGradient(text, colorStart, colorEnd);
    if (type === "middle") gradients = this.model.generateMiddleGradient(text, colorStart, colorMiddle);
    if (type === "threeColored") gradients = this.model.generateThreeColorGradient(text, colorStart, colorMiddle, colorEnd);
    if (type === "rainbow") gradients = this.model.generateRainbowColors(text);
    if (type === "random") gradients = this.model.generateRandomColors(text);

    let colorIndex = 0;
    for (let i = 0; i < range.length; i++) {
      this.model.quill.formatText(range.index + i, 1, "color", gradients[colorIndex]);
      colorIndex = (colorIndex + 1) % gradients.length;
    }
  }

  /* 
  =========================================
     Data Fetching and Rendering
  ========================================= 
  */

  // Get canvas element list JSON, render modal sections, element list buttons, and register handlers.
  async renderCanvasElementList() {
    const data = await this.model.fetchData("./src/json/canvas-element-list.json", "json");
    const temp = { modal: [], skeleton: [], handler: [], button: "" };

    for (const key in data) {
      const { modalPath, skeletonPath, handlerPath } = data[key];
      temp.button += this.view.generateCanvasElementListButton(key, data[key]);

      if (modalPath) {
        const promise = this.model.asyncFetchData(modalPath, "text", (res) => {
          return this.view.generateModalEditSection(key, res);
        });
        temp.modal.push(promise);
      }
      if (skeletonPath) {
        const promise = this.model.asyncFetchData(skeletonPath, "text", (res) => {
          this.model.registerSkeleton(key, res);
          return true;
        });
        temp.skeleton.push(promise);
      }
      if (handlerPath) {
        const promise = import(handlerPath).then((module) => {
          const HandlerClass = module.default;
          if (HandlerClass) {
            const instance = new HandlerClass(this);
            this.model.registerHandler(key, instance);
            return true;
          }
          return false;
        });

        temp.handler.push(promise);
      }
    }

    const modals = (await Promise.all(temp.modal)).join("");
    await Promise.all(temp.skeleton);
    await Promise.all(temp.handler);

    this.view.html("#modal-edit-body", modals);
    this.view.html("#canvas-element-list", temp.button);
  }

  // Get the changelogs and render them in the list.
  async renderChangeLogs() {
    const data = await this.model.fetchData("./src/json/version.json", "json");

    let content = "";
    for (const change of data.changelogs) {
      const { date, changes } = change;
      content += this.view.generateChangelogItem(date, changes);
    }

    this.view.html("#changelog-wrapper", content);
  }

  // Get canvas template list JSON and render template item buttons.
  async renderCanvasTemplateList() {
    const data = await this.model.fetchData("./src/json/canvas-templates.json", "json");
    let template = "";

    for (const key in data) {
      const { title, des, templatePath } = data[key];
      template += this.view.generateCanvasTemplateItem(title, des, templatePath);
    }

    this.view.html("#modal-template-body", template);
  }
}
