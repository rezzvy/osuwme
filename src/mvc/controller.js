export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async init() {
    await this.getCanvasElementList();
    await this.getCanvasTemplates();

    this.initializeModalEditHandlers();
    this.renderLatestCanvasContent();

    this.view.initializeTooltip(this.view.main);
    this.view.initializeTooltip(this.view.modalWrapper);
    this.view.initializeStickyMenu();
    this.view.removeTempElements(this.view.canvasElementListContainer);

    this.view.canvasElement.addEventListener("click", (e) => {
      if (e.target.dataset.action === "edit") {
        return this.canvasItemEditHandler(e);
      }

      if (e.target.dataset.action === "duplicate") {
        return this.canvasItemDuplicateHandler(e);
      }

      if (e.target.dataset.action === "remove") {
        return this.canvasItemRemoveHandler(e);
      }
    });

    this.view.canvasElementListContainer.addEventListener("click", (e) => {
      if (!e.target.dataset.key) return;

      this.canvasElementListButtonHandler(e);
    });

    this.view.canvasModalEdit._element.addEventListener("show.bs.modal", (e) => {
      this.canvasModalEditOnOpen(e);
    });

    this.view.canvasModalEdit._element.addEventListener("hide.bs.modal", () => {
      this.canvasModalEditOnClose();
    });

    this.view.audioModal._element.addEventListener("hide.bs.modal", () => {
      if (!this.view.audioModalPreview.paused) {
        this.view.audioModalPreview.pause();
        this.view.audioModalPreview.currentTime = 0;
      }
    });

    this.view.modalEditSaveButton.addEventListener("click", (e) => {
      if (typeof this.model.currentModalEditHandler.save === "function") this.model.currentModalEditHandler.save();

      this.view.canvasModalEdit.hide();
    });

    this.view.getCodeModal._element.addEventListener("hide.bs.modal", () => {
      this.view.renderClipboardAlert(false);
    });

    this.view.getCodeButton.addEventListener("click", (e) => {
      const content = this.model.convertToBBCode(this.view.canvasElement.innerHTML);
      this.view.setOutputCode(content);

      const isEmpty = this.view.canvasElement.children.length === 0;

      this.view.disableButton(isEmpty, this.view.copyBBCodeToClipboard, this.view.downloadBBCodeAsTextButton);

      this.view.getCodeModal.show();
    });

    this.view.copyBBCodeToClipboard.addEventListener("click", (e) => {
      const content = this.view.codeOutputTextArea;

      content.select();
      if (document.execCommand("copy")) {
        this.view.renderClipboardAlert(true);
      }
    });

    this.view.downloadBBCodeAsTextButton.addEventListener("click", () => {
      const content = this.view.codeOutputTextArea.value;
      const blob = this.model.generateBlob("text/plain", content);
      const a = this.view.generateDownloadableElement(blob, "osuwme-bbcode.txt");

      a.click();
      URL.revokeObjectURL(blob);
    });

    this.view.importProjectFileInput.addEventListener("input", (e) => {
      const file = e.target.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = (event) => {
          const content = event.target.result;

          const isValid = this.model.checkHTMLFormat(content);

          if (isValid) {
            this.view.toggleCanvasPlaceHolder(false);
            this.view.canvasElement.innerHTML = content;
          } else {
            alert("We can't process this file because it does not contain a recognized format.");
          }
        };

        reader.readAsText(file);
      }
    });

    this.view.importProjectButton.addEventListener("click", (e) => {
      this.view.importProjectFileInput.click();
    });

    this.view.exportProjectButton.addEventListener("click", (e) => {
      const isEmpty = this.view.canvasElement.children.length === 0;
      if (isEmpty) return alert("The canvas is empty, and there is nothing to export at the moment.");

      const content = this.view.canvasElement.innerHTML;

      const blob = this.model.generateBlob("text/html", content);
      const a = this.view.generateDownloadableElement(blob, "osuwme-bbcode.html");

      a.click();
      URL.revokeObjectURL(blob);
    });

    this.view.editModeSwitch.addEventListener("click", (e) => {
      document.body.classList.toggle("view-mode", !e.target.checked);
    });

    this.view.expandAllCanvasButton.addEventListener("click", (e) => {
      this.view.collapseAllCanvasItem(false);
    });

    this.view.collapseAllCanvasButton.addEventListener("click", (e) => {
      this.view.collapseAllCanvasItem(true);
    });

    this.view.canvasMenuStickySwitch.addEventListener("input", (e) => {
      const element = document.getElementById("element-list-section");
      element.classList.toggle("pinned", e.target.checked);

      this.view.isMenuSticky = e.target.checked;
    });

    this.view.resetCanvasSizeButton.addEventListener("click", (e) => {
      this.view.canvas.style.cssText = "";
    });

    this.view.clearCanvasButton.addEventListener("click", (e) => {
      const confirmDialog = confirm("Are you sure?");

      if (confirmDialog) {
        this.view.canvasElement.innerHTML = "";
        this.view.toggleCanvasPlaceHolder(true);
      }
    });

    this.view.canvasTemplatesModalBody.addEventListener("click", async (e) => {
      if (e.target.dataset.action !== "render") return;

      if (this.view.canvasElement.children.length !== 0) {
        const confirmDialog = confirm("Existing Canvas will be wiped, continue?");
        if (!confirmDialog) return;
      }

      const content = await this.model.fetchData(e.target.dataset.templatePath, "text");
      this.view.canvasElement.innerHTML = content;
      this.view.canvasTemplatesModal.hide();
      this.view.toggleCanvasPlaceHolder(false);
    });

    window.addEventListener("beforeunload", (e) => {
      this.model.saveLatestCanvasContent(this.view.canvasElement.innerHTML);
    });
  }

  canvasModalEditOnOpen(e) {
    const modalDialogElement = e.target.querySelector(".modal-dialog");
    modalDialogElement.classList.toggle("modal-lg", this.model.isRenderModalOnLargeSize());

    const activeModal = document.querySelector("#modal-edit .d-block[data-edit]");
    if (activeModal) activeModal.classList.replace("d-block", "d-none");

    const currentModal = document.querySelector(`#modal-edit [data-edit="${this.model.currentEdit.key}"]`);
    if (currentModal) currentModal.classList.replace("d-none", "d-block");

    if (typeof this.model.currentModalEditHandler.open === "function") this.model.currentModalEditHandler.open();
  }

  canvasModalEditOnClose() {
    if (typeof this.model.currentModalEditHandler.close === "function") this.model.currentModalEditHandler.close();
    this.view.renderModalEditErrorMessage(false);
    this.model.currentEdit = {
      key: "",
      target: "",
      modal: "",
    };
  }

  canvasElementListButtonHandler(e) {
    const btn = e.target;
    const skeleton = this.model.getCanvasElementSkeleton(btn.dataset.key);

    this.view.appendItemToCanvas(skeleton, btn.dataset.key, btn.dataset.editable);
    this.view.toggleCanvasPlaceHolder(false);
  }

  canvasItemEditHandler(e) {
    this.model.currentEdit = {
      key: e.target.dataset.key,
      target: e.target.closest(".canvas-item").querySelector("._content"),
      modal: document.querySelector(`[data-edit="${e.target.dataset.key}"]`),
    };

    this.view.disableButton(true, this.view.modalEditSaveButton);
    this.view.canvasModalEdit.show();
  }

  canvasItemDuplicateHandler(e) {
    const originalElement = e.target.closest(".canvas-item");
    const copiedElement = originalElement.cloneNode(true);
    const uniqueID = "CANVAS" + Date.now();

    const collapseBtn = copiedElement.querySelector('[data-bs-toggle="collapse"]');
    collapseBtn.dataset.bsTarget = `#${uniqueID}`;

    const collapseContent = copiedElement.querySelector("._content");
    collapseContent.id = uniqueID;

    originalElement.parentElement.insertBefore(copiedElement, originalElement.nextSibling);
  }

  canvasItemRemoveHandler(e) {
    const canvasItem = e.target.closest(".canvas-item");
    const content = canvasItem.closest("._content");

    const tooltip = bootstrap.Tooltip.getInstance(e.target);

    canvasItem.remove();
    if (tooltip) tooltip.dispose();
    if (content) {
      this.view.toggleContainerPlaceholder(content);
    }
    this.view.toggleCanvasPlaceHolder(this.view.canvasElement.children.length === 0);
  }

  renderLatestCanvasContent() {
    const content = this.model.getLatestCanvasContent();

    if (content) {
      this.view.canvasElement.innerHTML = content;
      this.view.toggleCanvasPlaceHolder(false);
    }
  }

  async getCanvasTemplates() {
    const data = await this.model.fetchData("./src/json/canvas-templates.json", "json");

    const element = [];

    for (const key in data) {
      const { title, des, templatePath } = data[key];
      element.push(this.view.generateCanvasTemplateItem(title, des, templatePath));
    }

    this.view.canvasTemplatesModalBody.innerHTML = element.join("");

    return true;
  }

  async getCanvasElementList() {
    const data = await this.model.fetchData("./src/json/canvas-element-list.json", "json");

    const buttonPromises = [];
    const modalPromises = [];
    const skeletonPromises = [];

    for (const key in data) {
      buttonPromises.push(this.view.generateCanvasElementListButton(key, data[key]));

      if (data[key].modalPath) {
        modalPromises.push(
          (async () => {
            const content = await this.model.fetchData(data[key].modalPath, "text");
            return this.view.generateCanvasElementListModal(key, content);
          })()
        );
      }

      if (data[key].skeletonPath) {
        skeletonPromises.push(
          (async () => {
            const content = await this.model.fetchData(data[key].skeletonPath, "text");
            this.model.registerCanvasElementSkeleton(key, content);
          })()
        );
      }
    }

    const buttons = (await Promise.all(buttonPromises)).join("");
    const modals = (await Promise.all(modalPromises)).join("");
    await Promise.all(skeletonPromises);

    this.view.canvasElementListContainer.innerHTML = buttons;
    this.view.canvasElementListModalBody.innerHTML = modals;

    return true;
  }

  initializeModalEditHandlers() {
    /* =========================================
       Spacing
       ========================================= */
    this.model.registerModalEditHandler("spacing", {
      open: () => {
        const currentEdit = this.model.currentEdit;
        const spacingItemElement = currentEdit.target.querySelector(".spacing-item");
        const spacingInput = currentEdit.modal.querySelector('[type="number"]');
        const spacingPreview = currentEdit.modal.querySelector("#spacing-preview");

        spacingInput.value = spacingItemElement.dataset.spacingLevel;
        spacingPreview.style.setProperty("--spacing-level", spacingItemElement.dataset.spacingLevel);

        this.view.disableButton(false, this.view.modalEditSaveButton);
      },
      save: () => {
        const currentEdit = this.model.currentEdit;
        const spacingItemElement = currentEdit.target.querySelector(".spacing-item");
        const spacingInput = currentEdit.modal.querySelector('[type="number"]');

        spacingItemElement.dataset.spacingLevel = spacingInput.value;
        spacingItemElement.style.setProperty("--spacing-level", spacingInput.value);
      },
      modalEvents: () => {
        const wrapper = document.querySelector('[data-edit="spacing"]');
        const spacingInput = wrapper.querySelector('[type="number"]');
        const spacingPreview = wrapper.querySelector("#spacing-preview");

        spacingInput.addEventListener("input", (e) => {
          spacingPreview.style.setProperty("--spacing-level", e.target.value);
        });
      },
    });

    /* =========================================
       Codeblock
       ========================================= */
    this.model.registerModalEditHandler("codeblock", {
      open: () => {
        const currentEdit = this.model.currentEdit;

        const modalTextArea = currentEdit.modal.querySelector("textarea");
        const codeElement = currentEdit.target.querySelector("code");

        modalTextArea.value = codeElement.textContent;

        this.view.disableButton(false, this.view.modalEditSaveButton);
      },
      save: () => {
        const currentEdit = this.model.currentEdit;

        const modalTextArea = currentEdit.modal.querySelector("textarea");
        const codeElement = currentEdit.target.querySelector("code");

        codeElement.textContent = modalTextArea.value;
      },
    });

    /* =========================================
       Spoilerbox
       ========================================= */
    this.model.registerModalEditHandler("spoilerbox", {
      open: () => {
        const currentEdit = this.model.currentEdit;
        const spoilerboxElement = currentEdit.target.querySelector("details");
        const useBoxInput = currentEdit.modal.querySelector('input[type="checkbox"]');
        const titleInput = currentEdit.modal.querySelector('input[type="text"]');

        useBoxInput.checked = spoilerboxElement.dataset.box === "true";
        titleInput.value = spoilerboxElement.dataset.title;

        this.view.disableButton(false, this.view.modalEditSaveButton);
      },
      save: () => {
        const currentEdit = this.model.currentEdit;
        const spoilerboxElement = currentEdit.target.querySelector("details");
        const spoilerboxTitle = spoilerboxElement.querySelector("summary");

        const useBoxInput = currentEdit.modal.querySelector('input[type="checkbox"]');
        const titleInput = currentEdit.modal.querySelector('input[type="text"]');

        spoilerboxElement.dataset.box = useBoxInput.checked;
        spoilerboxElement.dataset.title = titleInput.value;
        spoilerboxTitle.textContent = useBoxInput.checked ? titleInput.value : "Spoiler";
      },
      modalEvents: () => {
        const wrapper = document.querySelector('[data-edit="spoilerbox"]');
        const useBoxInput = wrapper.querySelector('input[type="checkbox"]');
        const titleInput = wrapper.querySelector('input[type="text"]');

        useBoxInput.addEventListener("input", (e) => {
          titleInput.disabled = !e.target.checked;
        });
      },
    });

    /* =========================================
       Youtube
       ========================================= */
    this.model.registerModalEditHandler("youtube", {
      open: () => {
        const currentEdit = this.model.currentEdit;

        const modalIframe = currentEdit.modal.querySelector("iframe");
        const modalLinkInput = currentEdit.modal.querySelector('input[type="text"]');
        const submitButton = currentEdit.modal.querySelector("#youtube-link-submit-btn");
        const targetIframe = currentEdit.target.querySelector("iframe");

        this.view.disableButton(true, submitButton);

        if (targetIframe.dataset.videoId) {
          modalLinkInput.value = `https://youtu.be/${targetIframe.dataset.videoId}`;
          modalIframe.src = targetIframe.src;
          return;
        }

        modalLinkInput.value = "";
      },
      close: () => {
        const currentEdit = this.model.currentEdit;

        const modalIframe = currentEdit.modal.querySelector("iframe");
        modalIframe.removeAttribute("src");

        this.view.toggleElementPlaceholder(true, modalIframe);
      },
      save: () => {
        const currentEdit = this.model.currentEdit;

        const modalIframe = currentEdit.modal.querySelector("iframe");
        const targetIframe = currentEdit.target.querySelector("iframe");

        targetIframe.src = modalIframe.src;
        targetIframe.dataset.videoId = modalIframe.dataset.videoId;
        this.view.toggleElementPlaceholder(false, targetIframe, false);
      },
      modalEvents: () => {
        const wrapper = document.querySelector('[data-edit="youtube"]');

        const submitButton = wrapper.querySelector("#youtube-link-submit-btn");
        const linkInput = wrapper.querySelector('input[type="text"]');
        const iframe = wrapper.querySelector("iframe");

        linkInput.addEventListener("input", (e) => {
          const isValueEmpty = e.target.value === "";
          this.view.disableButton(isValueEmpty, submitButton);
        });

        submitButton.addEventListener("click", (e) => {
          const value = linkInput.value;
          const videoId = this.model.extractYoutubeVideoId(value);

          if (!this.model.isValidURL(value)) {
            this.view.renderModalEditErrorMessage(true, "The given link is not valid.");
            this.view.disableButton(true, this.view.modalEditSaveButton);
            this.view.toggleElementPlaceholder(true, iframe);
            return;
          }

          if (videoId) {
            this.view.setButtonLoadingState(true, submitButton);
            this.view.disableButton(true, submitButton);
            iframe.src = `https://www.youtube.com/embed/${videoId}?feature=oembed`;
            iframe.dataset.videoId = videoId;
            return;
          }

          this.view.setButtonLoadingState(false, submitButton);
          this.view.renderModalEditErrorMessage(true, "Unable to find YouTube video ID in the link.");
          this.view.disableButton(true, this.view.modalEditSaveButton);
          this.view.toggleElementPlaceholder(true, iframe);
        });

        iframe.onload = () => {
          if (this.model.currentEditKey !== "youtube") return;

          this.view.toggleElementPlaceholder(false, iframe);
          this.view.setButtonLoadingState(false, submitButton);
          this.view.disableButton(false, submitButton, this.view.modalEditSaveButton);
          this.view.renderModalEditErrorMessage(false);
        };

        iframe.onerror = () => {
          if (this.model.currentEditKey !== "youtube") return;

          this.view.toggleElementPlaceholder(true, iframe);
          this.view.setButtonLoadingState(false, submitButton);
          this.view.disableButton(false, submitButton);
          this.view.disableButton(true, this.view.modalEditSaveButton);
          this.view.renderModalEditErrorMessage(true, "Unable to process the link.");
        };
      },
    });
    /* =========================================
       Audio
       ========================================= */
    this.model.registerModalEditHandler("audio", {
      open: () => {
        const currentEdit = this.model.currentEdit;

        const playButton = currentEdit.target.querySelector(".play-audio-btn");
        const modalAudio = currentEdit.modal.querySelector("audio");
        const modalLinkInput = currentEdit.modal.querySelector('input[type="text"]');
        const submitButton = currentEdit.modal.querySelector("#audio-link-submit-btn");

        this.view.disableButton(true, submitButton);

        if (playButton.dataset.audioUrl) {
          modalAudio.src = playButton.dataset.audioUrl;
          modalLinkInput.value = playButton.dataset.audioUrl;
          return;
        }

        modalLinkInput.value = "";
      },
      save: () => {
        const currentEdit = this.model.currentEdit;

        const playButton = currentEdit.target.querySelector(".play-audio-btn");
        const modalAudio = currentEdit.modal.querySelector("audio");

        if (!modalAudio.paused) {
          modalAudio.pause();
          modalAudio.currentTime = 0;
        }

        if (playButton.dataset.event === "false") {
          playButton.dataset.event = "true";
          playButton.removeAttribute("data-bs-title");
          playButton.removeAttribute("data-bs-toggle");

          playButton.addEventListener("click", (e) => {
            const audio = document.getElementById("audio-modal-preview");

            this.view.audioModal.show();
            audio.src = playButton.dataset.audioUrl;
            audio.play();
          });
        }

        playButton.dataset.audioUrl = modalAudio.src;
      },
      close: () => {
        const currentEdit = this.model.currentEdit;

        const audio = currentEdit.modal.querySelector("audio");

        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }

        audio.removeAttribute("src");

        this.view.toggleElementPlaceholder(true, audio);
      },
      modalEvents: () => {
        const wrapper = document.querySelector('[data-edit="audio"]');

        const submitButton = wrapper.querySelector("#audio-link-submit-btn");
        const linkInput = wrapper.querySelector('input[type="text"]');
        const audio = wrapper.querySelector("audio");

        linkInput.addEventListener("input", (e) => {
          const isValueEmpty = e.target.value === "";
          this.view.disableButton(isValueEmpty, submitButton);
        });

        submitButton.addEventListener("click", (e) => {
          const value = linkInput.value;

          if (!this.model.isValidURL(value)) {
            this.view.renderModalEditErrorMessage(true, "The given link is not valid.");
            this.view.disableButton(true, this.view.modalEditSaveButton);
            this.view.toggleElementPlaceholder(true, audio);
            return;
          }

          audio.src = value;
          this.view.setButtonLoadingState(true, submitButton);
        });

        audio.oncanplaythrough = () => {
          if (this.model.currentEditKey !== "audio") return;

          this.view.toggleElementPlaceholder(false, audio);
          this.view.setButtonLoadingState(false, submitButton);
          this.view.disableButton(false, submitButton, this.view.modalEditSaveButton);
          this.view.renderModalEditErrorMessage(false);
        };

        audio.onerror = () => {
          if (this.model.currentEditKey !== "audio") return;

          this.view.toggleElementPlaceholder(true, audio);
          this.view.setButtonLoadingState(false, submitButton);
          this.view.disableButton(false, submitButton);
          this.view.disableButton(true, this.view.modalEditSaveButton);
          this.view.renderModalEditErrorMessage(true, "Unable to process the link.");
        };
      },
    });

    /* =========================================
       Image
       ========================================= */
    this.model.registerModalEditHandler("image", {
      open: () => {
        const currentEdit = this.model.currentEdit;

        const modalImg = currentEdit.modal.querySelector("img");
        const modalLinkInput = currentEdit.modal.querySelector('input[type="text"]');
        const submitButton = currentEdit.modal.querySelector("#image-link-submit-btn");
        const targetImg = currentEdit.target.querySelector("img");

        this.view.disableButton(true, submitButton);

        if (targetImg.dataset.src) {
          modalLinkInput.value = targetImg.dataset.src;
          modalImg.src = targetImg.dataset.src;
          return;
        }

        modalLinkInput.value = "";
      },
      save: () => {
        const currentEdit = this.model.currentEdit;

        const modalImg = currentEdit.modal.querySelector("img");
        const targetImg = currentEdit.target.querySelector("img");

        targetImg.src = modalImg.src;
        targetImg.dataset.src = modalImg.src;
        this.view.toggleElementPlaceholder(false, targetImg, false);
      },
      close: () => {
        const currentEdit = this.model.currentEdit;

        const modalImg = currentEdit.modal.querySelector("img");
        modalImg.removeAttribute("src");

        this.view.toggleElementPlaceholder(true, modalImg);
      },
      modalEvents: () => {
        const wrapper = document.querySelector('[data-edit="image"]');

        const submitButton = wrapper.querySelector("#image-link-submit-btn");
        const linkInput = wrapper.querySelector('input[type="text"]');
        const img = wrapper.querySelector("img");

        linkInput.addEventListener("input", (e) => {
          const isValueEmpty = e.target.value === "";
          this.view.disableButton(isValueEmpty, submitButton);
        });

        submitButton.addEventListener("click", (e) => {
          const value = linkInput.value;

          if (!this.model.isValidURL(value)) {
            this.view.renderModalEditErrorMessage(true, "The given link is not valid.");
            this.view.disableButton(true, this.view.modalEditSaveButton);
            this.view.toggleElementPlaceholder(true, img);
            return;
          }

          img.src = value;
          this.view.setButtonLoadingState(true, submitButton);
        });

        img.onload = () => {
          if (this.model.currentEditKey !== "image") return;

          this.view.toggleElementPlaceholder(false, img);
          this.view.setButtonLoadingState(false, submitButton);
          this.view.disableButton(false, submitButton, this.view.modalEditSaveButton);
          this.view.renderModalEditErrorMessage(false);
        };

        img.onerror = () => {
          if (this.model.currentEditKey !== "image") return;

          this.view.toggleElementPlaceholder(true, img);
          this.view.setButtonLoadingState(false, submitButton);
          this.view.disableButton(false, submitButton);
          this.view.disableButton(true, this.view.modalEditSaveButton);
          this.view.renderModalEditErrorMessage(true, "Unable to process the link.");
        };
      },
    });

    /* =========================================
       Text
       ========================================= */
    this.model.registerModalEditHandler("text", {
      open: () => {
        const currentEdit = this.model.currentEdit;

        const textEditorContent = currentEdit.modal.querySelector(".ql-editor");
        textEditorContent.innerHTML = currentEdit.target.innerHTML;

        this.view.disableButton(false, this.view.modalEditSaveButton);
      },
      close: () => {
        if (!this.model.quill) return;

        this.model.quill.history.clear();
      },
      save: () => {
        const currentEdit = this.model.currentEdit;

        const textEditorContent = currentEdit.modal.querySelector(".ql-editor");
        const emptyElements = textEditorContent.querySelectorAll("p");
        emptyElements.forEach((element) => {
          const br = element.querySelector("br");
          if (br) br.dataset.spacing = "%SPCITM%";
          if (element.innerHTML.trim() === "") element.remove();
        });

        currentEdit.target.innerHTML = textEditorContent.innerHTML;
      },
    });

    /* =========================================
       Heading
       ========================================= */
    this.model.registerModalEditHandler("heading", {
      open: () => {
        const currentEdit = this.model.currentEdit;

        const heading = currentEdit.target.querySelector(".heading");
        const titleInput = currentEdit.modal.querySelector('input[type="text"]');

        titleInput.value = heading.textContent;

        this.view.disableButton(false, this.view.modalEditSaveButton);
      },
      save: () => {
        const currentEdit = this.model.currentEdit;

        const heading = currentEdit.target.querySelector(".heading");
        const titleInput = currentEdit.modal.querySelector('input[type="text"]');

        heading.textContent = titleInput.value;
      },
      modalEvents: () => {
        const wrapper = document.querySelector('[data-edit="heading"]');
        const titleInput = wrapper.querySelector('input[type="text"]');

        titleInput.addEventListener("input", (e) => {
          const isValueEmpty = e.target.value === "";
          this.view.disableButton(isValueEmpty, this.view.modalEditSaveButton);
        });
      },
    });

    /* =========================================
       List 
       ========================================= */
    this.model.registerModalEditHandler("list", {
      open: () => {
        const currentEdit = this.model.currentEdit;

        const orderedCheck = currentEdit.modal.querySelector("#ordered-list-check");
        const ulTarget = currentEdit.target.querySelector("ul");
        const isOrdered = ulTarget.dataset.ordered;

        const listItemEditContainer = currentEdit.modal.querySelector("#list-item-edit-container");

        orderedCheck.checked = isOrdered === "true";

        if (ulTarget.children.length > 0) {
          this.view.disableButton(false, this.view.modalEditSaveButton);

          for (const li of ulTarget.children) {
            const div = document.createElement("div");
            div.classList.add("list-item");
            div.innerHTML = this.view.generateListItemEdit({ title: li.dataset.title, content: li.innerHTML });

            listItemEditContainer.appendChild(div);
          }
        }

        listItemEditContainer.classList.toggle("ph", ulTarget.children.length === 0);
      },
      close: () => {
        const currentEdit = this.model.currentEdit;
        const listItemEditContainer = currentEdit.modal.querySelector("#list-item-edit-container");

        listItemEditContainer.innerHTML = "";
      },
      save: () => {
        const currentEdit = this.model.currentEdit;

        const orderedCheck = currentEdit.modal.querySelector("#ordered-list-check");
        const ulTarget = currentEdit.target.querySelector("ul");

        ulTarget.classList.toggle("ol", orderedCheck.checked);
        ulTarget.dataset.ordered = orderedCheck.checked;

        const listItemModal = currentEdit.modal.querySelectorAll(".list-item");
        let li = "";
        for (const item of listItemModal) {
          const title = item.querySelector(".list-title-input");
          const content = item.querySelector("._list-content");

          li += this.view.generateListItem(title.value, content.innerHTML);
        }

        ulTarget.innerHTML = li;
        this.view.toggleElementPlaceholder(false, ulTarget, false);
      },

      modalEvents: () => {
        const wrapper = document.querySelector('[data-edit="list"]');

        const addListButton = wrapper.querySelector("#add-list-btn");
        const listItemEditContainer = wrapper.querySelector("#list-item-edit-container");

        addListButton.addEventListener("click", (e) => {
          const div = document.createElement("div");
          div.classList.add("list-item");
          div.innerHTML = this.view.generateListItemEdit();

          listItemEditContainer.appendChild(div);
          listItemEditContainer.classList.remove("ph");
          this.view.disableButton(false, this.view.modalEditSaveButton);
        });

        listItemEditContainer.addEventListener("click", (e) => {
          if (e.target.dataset.action !== "delete") return;

          e.target.closest(".list-item").remove();

          if (listItemEditContainer.children.length === 0) {
            listItemEditContainer.classList.add("ph");
            this.view.disableButton(true, this.view.modalEditSaveButton);
          }
        });
      },
    });

    /* =========================================
       Quote 
       ========================================= */
    this.model.registerModalEditHandler("quote", {
      open: () => {
        const currentEdit = this.model.currentEdit;

        const blockquote = currentEdit.target.querySelector("blockquote");
        const modalSourceInput = currentEdit.modal.querySelector('input[type="text"]');
        const modalSourceChecked = currentEdit.modal.querySelector("#quote-include-source-check");

        modalSourceInput.value = blockquote.dataset.source;
        modalSourceInput.disabled = blockquote.dataset.includeSource !== "true";
        modalSourceChecked.checked = blockquote.dataset.includeSource === "true";

        this.view.disableButton(false, this.view.modalEditSaveButton);
      },
      save: () => {
        const currentEdit = this.model.currentEdit;

        const blockquote = currentEdit.target.querySelector("blockquote");
        const blockquoteSource = blockquote.querySelector("._source");
        const blockquoteSourceText = blockquoteSource.querySelector("span");

        const modalSourceInput = currentEdit.modal.querySelector('input[type="text"]');
        const modalSourceChecked = currentEdit.modal.querySelector("#quote-include-source-check");

        blockquoteSourceText.textContent = modalSourceInput.value;
        blockquoteSource.classList.toggle("d-none", !modalSourceChecked.checked);

        blockquote.dataset.source = modalSourceInput.value;
        blockquote.dataset.includeSource = modalSourceChecked.checked;
      },
      modalEvents: () => {
        const wrapper = document.querySelector('[data-edit="quote"]');

        const sourceIncludeCheckbox = wrapper.querySelector("#quote-include-source-check");
        const sourceInput = wrapper.querySelector('input[type="text"]');

        sourceIncludeCheckbox.addEventListener("input", (e) => {
          sourceInput.disabled = !e.target.checked;

          if (e.target.checked && sourceInput.value === "") this.view.disableButton(true, this.view.modalEditSaveButton);
          if (!e.target.checked && sourceInput.value === "") this.view.disableButton(false, this.view.modalEditSaveButton);
        });

        sourceInput.addEventListener("input", (e) => {
          if (sourceIncludeCheckbox.checked) {
            const isValueEmpty = e.target.value === "";
            this.view.disableButton(isValueEmpty, this.view.modalEditSaveButton);
          }
        });
      },
    });

    /* =========================================
       Image Map 
       ========================================= */

    this.model.registerModalEditHandler("imgmap", {
      open: () => {
        const currentEdit = this.model.currentEdit;
        const modalImageMapContainer = currentEdit.modal.querySelector("#imgmap-edit-container");
        const modalImg = modalImageMapContainer.querySelector("img");
        const modalLinkInput = currentEdit.modal.querySelector("#imgmap-link-input");

        const addImageMapItemButton = currentEdit.modal.querySelector("#add-imgmap-item-btn");

        const targetImageMapContainer = currentEdit.target.querySelector(".imgmap-container");
        const targetImg = targetImageMapContainer.querySelector("img");
        const existingImageMapItem = targetImageMapContainer.querySelectorAll(".output-imgmap-item");

        this.view.disableInput(true, addImageMapItemButton);

        if (existingImageMapItem.length !== 0) {
          const fragment = document.createDocumentFragment();
          modalLinkInput.value = targetImg.src;
          modalImg.src = targetImg.src;

          for (const item of existingImageMapItem) {
            const a = this.view.generateImageMapItem({
              style: item.getAttribute("style"),
              title: item.dataset.title,
              link: item.dataset.link,
            });

            fragment.appendChild(a);
          }

          modalImageMapContainer.appendChild(fragment);
          this.view.toggleElementPlaceholder(false, modalImageMapContainer, false);
          this.view.disableButton(false, this.view.modalEditSaveButton);
          return;
        }

        modalLinkInput.value = "";
        this.view.toggleElementPlaceholder(true, modalImageMapContainer);
      },
      close: () => {
        const currentEdit = this.model.currentEdit;

        const modalImageMapContainer = currentEdit.modal.querySelector("#imgmap-edit-container");
        const modalImg = modalImageMapContainer.querySelector("img");

        const imgMapItemTitleInput = currentEdit.modal.querySelector("#imgmap-title-input-item");
        const imgMapItemLinkInput = currentEdit.modal.querySelector("#imgmap-link-input-item");
        const imgMapItemWidthInput = currentEdit.modal.querySelector("#imgmap-width-input-item");
        const imgMapItemHeightInput = currentEdit.modal.querySelector("#imgmap-height-input-item");
        const removeButton = currentEdit.modal.querySelector("#imgmap-remove-btn");
        const duplicateButton = currentEdit.modal.querySelector("#imgmap-duplicate-btn");
        const addImageMapItemButton = currentEdit.modal.querySelector("#add-imgmap-item-btn");

        this.view.clearInput(imgMapItemTitleInput, imgMapItemLinkInput, imgMapItemWidthInput, imgMapItemHeightInput);
        this.view.disableInput(
          true,
          imgMapItemTitleInput,
          imgMapItemLinkInput,
          imgMapItemWidthInput,
          imgMapItemHeightInput,
          duplicateButton,
          removeButton,
          addImageMapItemButton
        );

        modalImg.removeAttribute("src");

        const items = modalImageMapContainer.querySelectorAll(".imgmap-edit-item");
        if (items.length !== 0) {
          items.forEach((item) => item.remove());
        }
      },
      save: () => {
        const currentEdit = this.model.currentEdit;

        const targetImageMapContainer = currentEdit.target.querySelector(".imgmap-container");
        const existingImageMapItem = targetImageMapContainer.querySelectorAll(".output-imgmap-item");
        const targetImg = targetImageMapContainer.querySelector("img");

        const modalLinkInput = currentEdit.modal.querySelector("#imgmap-link-input");
        const modalImageMapContainer = currentEdit.modal.querySelector("#imgmap-edit-container");
        const modalImageMapItems = modalImageMapContainer.querySelectorAll(".imgmap-edit-item");

        const fragment = document.createDocumentFragment();

        if (existingImageMapItem.length !== 0) existingImageMapItem.forEach((item) => item.remove());

        for (const item of modalImageMapItems) {
          const link = this.model.isValidURL(item.dataset.link) ? item.dataset.link : "https://google.com";
          const style = item.getAttribute("style");
          const title = item.dataset.title;

          fragment.appendChild(this.view.generateOutputImageMapItem(link, style, title));
        }

        this.view.toggleElementPlaceholder(false, targetImageMapContainer, false);
        targetImageMapContainer.appendChild(fragment);
        targetImg.src = modalLinkInput.value;
      },
      modalEvents: () => {
        const wrapper = document.querySelector('[data-edit="imgmap"]');

        const submitButton = wrapper.querySelector("#imgmap-link-submit-btn");
        const linkInput = wrapper.querySelector("#imgmap-link-input");

        const imageMapContainer = wrapper.querySelector("#imgmap-edit-container");
        const img = imageMapContainer.querySelector("img");

        const addImageMapItemButton = wrapper.querySelector("#add-imgmap-item-btn");
        const removeButton = wrapper.querySelector("#imgmap-remove-btn");
        const duplicateButton = wrapper.querySelector("#imgmap-duplicate-btn");

        const imgMapItemTitleInput = wrapper.querySelector("#imgmap-title-input-item");
        const imgMapItemLinkInput = wrapper.querySelector("#imgmap-link-input-item");
        const imgMapItemWidthInput = wrapper.querySelector("#imgmap-width-input-item");
        const imgMapItemHeightInput = wrapper.querySelector("#imgmap-height-input-item");

        duplicateButton.addEventListener("click", (e) => {
          const activeElement = this.model.imagemap.workingElement;
          if (!activeElement) return;

          const copied = activeElement.cloneNode(true);
          copied.classList.remove("active");

          imageMapContainer.appendChild(copied);
        });

        removeButton.addEventListener("click", (e) => {
          const activeElement = this.model.imagemap.workingElement;
          if (!activeElement) return;

          activeElement.remove();
          this.model.imagemap.workingElement = "";
          this.view.clearInput(imgMapItemTitleInput, imgMapItemLinkInput, imgMapItemWidthInput, imgMapItemHeightInput);
          this.view.disableInput(
            true,
            imgMapItemTitleInput,
            imgMapItemLinkInput,
            imgMapItemWidthInput,
            imgMapItemHeightInput,
            duplicateButton,
            removeButton
          );

          const items = imageMapContainer.querySelectorAll(".imgmap-edit-item");
          if (items.length === 0) {
            this.view.disableButton(true, this.view.modalEditSaveButton);
          }
        });

        imgMapItemTitleInput.addEventListener("input", (e) => {
          const activeElement = this.model.imagemap.workingElement;
          if (!activeElement) return;

          activeElement.dataset.title = e.target.value;
        });

        imgMapItemLinkInput.addEventListener("input", (e) => {
          const activeElement = this.model.imagemap.workingElement;
          if (!activeElement) return;

          activeElement.dataset.link = e.target.value;
        });

        imgMapItemWidthInput.addEventListener("input", (e) => {
          const activeElement = this.model.imagemap.workingElement;
          if (!activeElement) return;

          this.view.changeImageMapItemSize(e.target, activeElement, "width");
        });

        imgMapItemHeightInput.addEventListener("input", (e) => {
          const activeElement = this.model.imagemap.workingElement;
          if (!activeElement) return;

          this.view.changeImageMapItemSize(e.target, activeElement, "height");
        });

        linkInput.addEventListener("input", (e) => {
          const isValueEmpty = e.target.value === "";
          this.view.disableButton(isValueEmpty, submitButton);
        });

        submitButton.addEventListener("click", (e) => {
          const value = linkInput.value;

          if (!this.model.isValidURL(value)) {
            this.view.renderModalEditErrorMessage(true, "The given link is not valid.");
            this.view.disableButton(true, this.view.modalEditSaveButton);
            this.view.toggleElementPlaceholder(true, imageMapContainer);
            return;
          }

          const items = imageMapContainer.querySelectorAll(".imgmap-edit-item");
          if (items.length !== 0) {
            const confirmDialog = confirm("Existing image map items will be removed. Do you want to continue?");
            if (!confirmDialog) return;

            items.forEach((item) => item.remove());
            this.view.clearInput(imgMapItemTitleInput, imgMapItemLinkInput, imgMapItemWidthInput, imgMapItemHeightInput);
            this.view.disableInput(
              true,
              imgMapItemTitleInput,
              imgMapItemLinkInput,
              imgMapItemWidthInput,
              imgMapItemHeightInput,
              duplicateButton,
              removeButton
            );
          }

          img.src = value;
          this.view.setButtonLoadingState(true, submitButton);
        });

        addImageMapItemButton.addEventListener("click", (e) => {
          const a = this.view.generateImageMapItem();

          imageMapContainer.appendChild(a);
          this.view.disableButton(false, this.view.modalEditSaveButton);
        });

        imageMapContainer.addEventListener("click", (e) => {
          const itemElement = e.target.closest(".imgmap-edit-item");

          if (itemElement) {
            this.model.imagemap.workingElement = itemElement;

            this.view.disableInput(
              false,
              imgMapItemTitleInput,
              imgMapItemLinkInput,
              imgMapItemWidthInput,
              imgMapItemHeightInput,
              duplicateButton,
              removeButton
            );
            return;
          }

          this.model.imagemap.workingElement = null;
          this.view.clearActiveImageMapItem(imageMapContainer);
          this.view.clearInput(imgMapItemTitleInput, imgMapItemLinkInput, imgMapItemWidthInput, imgMapItemHeightInput);
          this.view.disableInput(
            true,
            imgMapItemTitleInput,
            imgMapItemLinkInput,
            imgMapItemWidthInput,
            imgMapItemHeightInput,
            duplicateButton,
            removeButton
          );
        });

        document.addEventListener("mousemove", (e) => {
          const imagemap = this.model.imagemap;
          if (!imagemap.activeBox) return;

          const deltaX = e.clientX - imagemap.startX;
          const deltaY = e.clientY - imagemap.startY;

          if (imagemap.isResizing) {
            const data = this.model.calcImgMapResizingData({
              deltaX: deltaX,
              deltaY: deltaY,
              container: imageMapContainer,
            });

            imagemap.activeBox.style.width = data.width + "%";
            imagemap.activeBox.style.height = data.height + "%";

            imgMapItemWidthInput.value = data.width + "%";
            imgMapItemHeightInput.value = data.height + "%";
            return;
          }

          const data = this.model.calcImgMapMovingData({
            deltaX: deltaX,
            deltaY: deltaY,
            container: imageMapContainer,
            activeBox: imagemap.activeBox,
          });

          imagemap.activeBox.style.top = data.top + "%";
          imagemap.activeBox.style.left = data.left + "%";
        });

        document.addEventListener("mousedown", (e) => {
          const itemElement = e.target.closest(".imgmap-edit-item");
          if (!itemElement) return;
          e.preventDefault();

          this.view.toggleActiveImageMapItem(itemElement, imageMapContainer);
          imgMapItemTitleInput.value = itemElement.dataset.title;
          imgMapItemLinkInput.value = itemElement.dataset.link;
          imgMapItemWidthInput.value = itemElement.style.width;
          imgMapItemHeightInput.value = itemElement.style.height;

          this.model.imagemap = {
            workingElement: itemElement,
            activeBox: itemElement,
            startY: e.clientY,
            startX: e.clientX,
            initialX: itemElement.offsetLeft,
            initialY: itemElement.offsetTop,
            initialWidth: itemElement.offsetWidth,
            initialHeight: itemElement.offsetHeight,
            isResizing: e.target.classList.contains("_resizer"),
          };

          if (this.model.imagemap.isResizing) this.model.imagemap.activeBox.classList.add("resize-cursor");
        });

        document.addEventListener("mouseup", (e) => {
          if (this.model.imagemap.isResizing) this.model.imagemap.activeBox.classList.remove("resize-cursor");

          this.model.imagemap = {
            isResizing: false,
            activeBox: null,
          };
        });

        img.onload = () => {
          if (this.model.currentEditKey !== "imgmap") return;

          this.view.toggleElementPlaceholder(false, imageMapContainer, false);
          this.view.setButtonLoadingState(false, submitButton);
          this.view.disableButton(false, submitButton, addImageMapItemButton);
          this.view.renderModalEditErrorMessage(false);
        };

        img.onerror = () => {
          if (this.model.currentEditKey !== "imgmap") return;

          this.view.toggleElementPlaceholder(true, imageMapContainer);
          this.view.setButtonLoadingState(false, submitButton);
          this.view.disableButton(false, submitButton);
          this.view.disableButton(true, this.view.modalEditSaveButton);
          this.view.renderModalEditErrorMessage(true, "Unable to process the link.");
        };
      },
    });

    for (const event of this.model.modalEditEvents) {
      if (typeof event === "function") event();
    }
  }
}
