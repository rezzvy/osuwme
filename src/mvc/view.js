export default class View {
  constructor() {
    this.main = document.querySelector("main");
    this.modalWrapper = document.querySelector("#modal-wrapper");

    this.canvasPlaceholder = document.getElementById("canvas-wrapper-placeholder");
    this.canvasElementListContainer = document.getElementById("canvas-element-list");
    this.canvasElementListModalBody = document.getElementById("modal-edit-body");
    this.canvasElement = document.getElementById("canvas-wrapper");
    this.canvas = document.getElementById("canvas");
    this.canvasModalEdit = new bootstrap.Modal("#modal-edit");
    this.canvasTemplatesModal = new bootstrap.Modal("#templates-modal");
    this.canvasTemplatesModalBody = document.getElementById("templates-modal-body");

    this.audioModal = new bootstrap.Modal("#audio-modal");
    this.audioModalPreview = document.getElementById("audio-modal-preview");

    this.modalEditSaveButton = document.getElementById("modal-edit-save");
    this.modalEditAlert = document.getElementById("modal-edit-alert");

    this.getCodeModal = new bootstrap.Modal("#getcode-modal");
    this.getCodeButton = document.getElementById("getcode-btn-modal");

    this.codeOutputTextArea = document.getElementById("code-output-textarea");

    this.downloadBBCodeAsTextButton = document.getElementById("download-as-text");

    this.clipboardAlert = document.getElementById("clipboard-alert");
    this.copyBBCodeToClipboard = document.getElementById("copy-to-clipboard");

    this.importProjectButton = document.getElementById("import-project-btn");
    this.importProjectFileInput = document.getElementById("import-project-input");
    this.exportProjectButton = document.getElementById("export-project-btn");
    this.collapseAllCanvasButton = document.getElementById("collapse-all-canvas-btn");
    this.expandAllCanvasButton = document.getElementById("expand-all-canvas-btn");
    this.canvasMenuStickySwitch = document.getElementById("canvas-menu-sticky-switch");
    this.resetCanvasSizeButton = document.getElementById("reset-canvas-size-btn");
    this.clearCanvasButton = document.getElementById("clear-canvas-btn");

    this.editModeSwitch = document.getElementById("canvas-mode-switch");

    this.isMenuSticky = true;
  }

  initializeTemplateOpenAnchor() {
    const el = document.querySelector("#template-open-anchor");

    el.dataset.bsTarget = "#templates-modal";
    el.dataset.bsToggle = "modal";
    el.classList.add("pe-auto");
  }

  initializeStickyMenu() {
    const updateStickyState = () => {
      if (!this.isMenuSticky) return;

      const element = document.getElementById("element-list-section");

      const elementBottom = element.offsetTop + element.offsetHeight + 16;
      const viewportBottom = window.innerHeight + window.scrollY - 16;

      element.classList.toggle("pinned", elementBottom >= viewportBottom);
    };

    window.addEventListener("scroll", (e) => {
      if (!this.isMenuSticky) return;

      updateStickyState();
    });

    new ResizeObserver(updateStickyState).observe(this.canvasElement);
  }

  clearActiveTooltips() {
    const tooltips = document.querySelectorAll(".tooltip.bs-tooltip-auto.fade.show");
    if (tooltips.length === 0) return;

    tooltips.forEach((tooltip) => {
      tooltip.remove();
    });
  }

  collapseAllCanvasItem(boolean) {
    const elements = document.querySelectorAll(".canvas-item .collapse");

    elements.forEach((element) => {
      element.classList.toggle("show", !boolean);
    });
  }

  removeTempElements(replacement) {
    const placeholders = document.querySelectorAll(".placeholder-container");

    placeholders.forEach((element) => {
      element.remove();
    });

    replacement.classList.toggle("d-none", false);
  }

  renderClipboardAlert(boolean) {
    this.clipboardAlert.classList.toggle("d-none", !boolean);
  }

  generateDownloadableElement(src, downloadName) {
    const link = document.createElement("a");
    link.href = src;
    link.download = downloadName;

    return link;
  }

  setOutputCode(content) {
    this.codeOutputTextArea.value = content.trim();
  }

  setButtonLoadingState(boolean, button) {
    const i = button.querySelector("i");

    if (boolean) {
      i.dataset.class = i.className;
      i.className = "fa fa-spinner fa-pulse fa-fw";
      return;
    }

    if (i.dataset.class) {
      i.className = i.dataset.class;
      i.removeAttribute("data-class");
    }
  }

  disableEvents(boolean) {
    document.body.classList.toggle("pe-none", boolean);
  }

  disableButton(boolean, ...buttons) {
    for (const button of buttons) {
      button.classList.toggle("pe-none", boolean);
      button.classList.toggle("opacity-50", boolean);
    }
  }

  renderModalEditErrorMessage(boolean, text = "") {
    this.modalEditAlert.querySelector("span").textContent = text;
    this.modalEditAlert.classList.toggle("d-none", !boolean);
  }

  clearActiveImageMapItem(container) {
    const currentActive = container.querySelector(".imgmap-edit-item.active");
    if (currentActive) currentActive.classList.remove("active");
  }

  toggleCanvasPlaceHolder(boolean) {
    this.canvasPlaceholder.classList.toggle("d-none", !boolean);
  }

  toggleActiveImageMapItem(element, container) {
    const itemElement = element;
    this.clearActiveImageMapItem(container);

    if (itemElement) {
      itemElement.classList.add("active");
      return true;
    }

    return false;
  }

  toggleElementPlaceholder(boolean, element, isCenterized = true) {
    element.classList.toggle("d-none", boolean);
    element.parentElement.classList.toggle("ph", boolean);
    if (isCenterized) element.parentElement.classList.toggle("center-content", !boolean);
  }

  toggleContainerPlaceholder(container) {
    const content = container.querySelector("[data-container]");
    if (content) content.classList.toggle("ph", content && content.children.length === 0);
  }

  initializeTooltip(parentElement) {
    return new bootstrap.Tooltip(parentElement, {
      selector: '[data-bs-toggle="tooltip"]',
      trigger: "hover",
    });
  }

  generateCanvasItem(content, key, isEditable) {
    const div = document.createElement("div");
    const uniqueID = "CANVAS" + Date.now();
    div.classList.add("canvas-item", "osu-style");

    div.innerHTML = `
  <div class="_edit d-flex align-items-center p-2 gap-2 flex-wrap">
    <div class="d-flex gap-2 flex-fill">
      <div>
        <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="collapse" data-bs-target="#${uniqueID}"></button>
      </div>
      <div class="flex-fill">
        <input type="text" class="form-control-plaintext h-100 text-light" value="${key}" />
      </div>
    </div>

    <div>
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Move" data-action="move">
        <i class="fa fa-arrows fa-fw"></i>
      </button>
      ${
        isEditable === "true"
          ? `<button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Edit" data-action="edit" data-key="${key}">
              <i class="fa fa-pencil fa-fw"></i>
             </button>`
          : ""
      } 
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Duplicate" data-action="duplicate">
        <i class="fa fa-copy fa-fw"></i>
      </button>
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Remove" data-action="remove">
        <i class="fa fa-trash fa-fw"></i>
      </button>
    </div>
  </div>

  <div class="_content p-2 collapse show" id="${uniqueID}" data-key="${key}">
    ${content}
  </div>
  `;

    return div;
  }

  appendItemToCanvas(element) {
    this.canvasElement.appendChild(element);
  }

  generateOutputImageMapItem(link, style, title) {
    const a = document.createElement("a");
    a.href = link;
    a.style = style;
    a.dataset.link = link;
    a.dataset.bsToggle = "tooltip";
    a.dataset.bsTitle = title;
    a.dataset.title = title;
    a.classList.add("output-imgmap-item");

    return a;
  }

  generateCanvasElementListButton(key, data) {
    return `
  <button class="canvas-element-list-btn btn btn-dark py-3 px-5" data-action="move" data-bs-toggle="tooltip" data-bs-title="${data.tooltipTitle}" data-key="${key}" data-editable="${data.editable}">
      <i class="fa ${data.icon} fa-fw fa-lg"></i>
  </button>`;
  }

  generateListItem(title, content) {
    return `<li data-title="${title}" data-drop>${content}</li>`;
  }

  generateCanvasTemplateItem(title, des, templatePath) {
    return `
      <div class="d-flex flex-wrap align-items-center justify-content-between p-3 rounded-2 modal-box gap-3">
        <div class="flex-fill">
          <h3 class="h5 mb-0 text-light">${title}</h3>
          <p class="m-0">${des}</p>
        </div>

        <button class="btn btn-light btn-sm fw-bold" data-template-path="${templatePath}" data-action="render">Edit This Template</button>
      </div>
    `;
  }

  generateListItemEdit(obj = { title: "", content: "" }) {
    return `
  <div class="input-group input-group-sm gap-1">
    <div class="input-group-text">
      <button class="btn btn-outline-light btn-sm" data-action="move">
        <i class="fa fa-arrows fa-fw"></i>
      </button>
    </div>
  <input type="text" class="list-title-input form-control rounded-2" placeholder="Title" value="${obj.title}" />
    <div class="input-group-text">
      <button class="btn btn-outline-light btn-sm" data-action="delete">
        <i class="fa fa-trash fa-fw"></i>
     </button>
    </div>
  </div>
  <div class="_list-content d-none">${obj.content}</div>
  `;
  }

  generateCanvasElementListModal(key, content) {
    return `<div class="d-none" data-edit="${key}">${content}</div>`;
  }

  generateImageMapItem(data = { style: "", title: "Untitled", link: "#" }) {
    const a = document.createElement("a");
    a.classList.add("imgmap-edit-item");
    a.innerHTML = ' <div class="_resizer"></div>';
    a.dataset.title = data.title;
    a.dataset.link = data.link;

    if (data.style === "") {
      a.style.width = "15%";
      a.style.height = "15%";
      a.style.top = "0%";
      a.style.left = "0%";
    } else {
      a.style.cssText = data.style;
    }

    return a;
  }

  changeImageMapItemSize(event, element, direction) {
    if (event.value.includes("%")) event.value = event.value.replace("%", "");
    if (isNaN(event.value)) return;

    const activeElement = element;
    const value = parseInt(event.value);
    let size = direction === "width" ? "width" : "height";

    if (value <= 0) {
      event.value = activeElement.style[size];
      return;
    }

    if (value > 100) {
      event.value = 100;
      activeElement.style[size] = "100%";
      activeElement.style.top = "0%";
      activeElement.style.left = "0%";
      return;
    }

    activeElement.style[size] = event.value + "%";
  }

  clearInput(...els) {
    for (const element of els) {
      if (element.tagName !== "INPUT") continue;

      element.value = "";
    }
  }

  disableInput(boolean, ...els) {
    for (const element of els) {
      if (element.tagName === "INPUT") {
        element.disabled = boolean;
        continue;
      }

      this.disableButton(boolean, element);
    }
  }
}
