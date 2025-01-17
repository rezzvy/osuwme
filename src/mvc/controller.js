export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async init() {
    await this.renderCanvasElementList();
    await this.renderCanvasTemplateList();
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
      this.model.currentHandler?.save?.();
      this.view.modalEdit.hide();
    });

    // Edit Mode Switch Event
    this.view.on("#canvas-mode-switch", "input", (e) => {
      this.view.toggle("body", "view-mode", !e.target.checked);
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
      if (files.length === 0) return;

      this.model.readFileAsText(files[0], (content) => {
        if (!this.model.isValidProjectFile(content)) return alert("Can't recognize HTML formats!");
        this.setCanvasContent(content);
        this.view.clearActiveTooltips();
      });
    });

    // Project Action: Export Event
    this.view.on("#export-project-btn", "click", () => {
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

    // Canvas Action: Reset Canvas Size Event
    this.view.on("#reset-canvas-size-btn", "click", () => {
      this.view.css("#canvas", "");
    });

    // Preference: Sticky menu switch event
    this.view.on("#canvas-menu-sticky-switch", "input", (e) => {
      this.view.toggle("#element-list-section", "pinned", e.target.checked);
      this.view.isMenuSticky = e.target.checked;
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
  }

  /* 
  =========================================
     Handler
  ========================================= 
  */

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
    });
  }

  // Handler for removing a canvas item.
  canvasItemRemoveHandler(e) {
    const canvasItem = e.closest(".canvas-item");
    const canvasItemContent = canvasItem.closest("._content");
    const innerContainer = this.view.el("[data-container]", canvasItemContent);

    this.view.clearTooltip(e);
    this.view.remove(canvasItem);

    if (innerContainer) {
      this.view.toggle(innerContainer, "ph", this.model.isNodeEmpty(innerContainer));
    }
    this.view.toggle("#canvas-wrapper-ph", "d-none", !this.model.isNodeEmpty("#canvas-wrapper"));
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

  // Render a canvas element, optionally auto-append or return the element.
  renderToCanvas(key, editable, uniqueID, autoAppend = true) {
    const skeleton = this.model.getSkeleton(key);
    const canvasItem = this.view.generateCanvasItem(key, editable, uniqueID, skeleton);
    this.view.toggle("#canvas-wrapper-ph", "d-none", true);

    if (autoAppend) {
      this.view.append("#canvas-wrapper", canvasItem);
      return;
    }

    return canvasItem;
  }

  // Render the latest saved canvas content.
  renderLatestCanvasContent() {
    this.setCanvasContent(this.model.latestCanvasContent);
  }

  // Set canvas content as HTML and adjust visibility of placeholders.
  setCanvasContent(html) {
    this.view.html("#canvas-wrapper", html);
    this.view.toggle("#canvas-wrapper-ph", "d-none", html);
    this.view.css("#canvas", "");
  }

  // Generate a downloadable blob and clear it afterward.
  download(content, blobType, downloadName) {
    const blob = this.model.createBlob(blobType, content);

    this.view.download(blob, downloadName);
    this.model.clearBlob(blob);
  }

  // Format selected text with a gradient, using start and end colors.
  formatTextToGradient(range, colorStart, colorEnd) {
    if (!range) return;

    const text = this.model.quill.getText(range.index, range.length);
    const gradients = this.model.generateGradient(text, colorStart, colorEnd);

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
