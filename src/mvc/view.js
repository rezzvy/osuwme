export default class View {
  constructor() {
    // Modals
    this.modalEdit = new bootstrap.Modal("#modal-edit");
    this.modalTemplate = new bootstrap.Modal("#modal-template");
    this.modalAudioPlayer = new bootstrap.Modal("#audio-modal");
    this.modalStarting = new bootstrap.Modal("#starting-modal");

    // File Input
    this.importProjectFileInput = document.getElementById("import-project-input");

    // Canvas Wrapper
    this.canvasWrapperElement = document.getElementById("canvas-wrapper");

    // Caches
    this.caches = {};

    // Sticky Element List Button
    this.menuStickyContainer = document.getElementById("element-list-section");
    this.menuStickyButtonWrapper = document.getElementById("canvas-element-list");
    this.isMenuSticky = true;

    this.isUpdating = false;
  }

  // Initialize the View
  init(isMobile) {
    this.modalStarting.show();

    this.remove(".placeholder-container");
    this.toggle("body", "pe-none", false);
    this.toggle("#canvas-element-list", "d-none", false);
    this.disable(true, "#undo-canvas-btn", "#redo-canvas-btn");
    this.initializeTooltip(`${isMobile ? "focus" : "hover"}`, "main", "#modal-wrapper");
    this.initializeStickyMenu();
  }

  // Initialize sticky menu behavior on scroll and resize
  _stickyOnWindowScroll() {
    if (!this.isMenuSticky || this.isUpdating) return;

    this.isUpdating = true;
    requestAnimationFrame((timestamp) => {
      this._updateStickyState();
    });
  }

  _updateStickyState() {
    if (!this.isMenuSticky) return;

    if (document.body.classList.contains("on-grabbing")) {
      this.isUpdating = false;
      return;
    }

    const element = this.menuStickyContainer;
    const elementBottom = element.offsetTop + element.offsetHeight + 16;
    const viewportBottom = window.innerHeight + window.scrollY - 16;

    this.toggle(element, "pinned", elementBottom >= viewportBottom);
    this.isUpdating = false;
  }

  initializeStickyMenu() {
    this.on(window, "scroll", () => {
      this._stickyOnWindowScroll();
    });

    new ResizeObserver(() => {
      this._updateStickyState();
    }).observe(this.canvasWrapperElement);
  }

  /* 
  =========================================
     Helper
  ========================================= 
  */

  // Get one or multiple elements, or return the provided element
  _target(target, parent = document, scope = "one", cache = false) {
    if (typeof target === "string") {
      if (target in this.caches) return this.caches[target];

      const element = scope === "one" ? parent?.querySelector(target) : parent?.querySelectorAll(target);
      if (cache) this.caches[target] = element;
      return element;
    }

    return target;
  }

  /* 
  =========================================
     Utils
  ========================================= 
  */

  // Get or set inner HTML content of a target element
  html(target, content, keep = false) {
    const targetElement = this._target(target);
    if (content === undefined) return targetElement.innerHTML;

    if (keep) {
      targetElement.innerHTML += content;
      return;
    }

    targetElement.innerHTML = content;
  }

  // Get or set text content of a target element
  text(target, content) {
    const targetElement = this._target(target);
    if (content === undefined) return targetElement.textContent;

    targetElement.textContent = content;
  }

  // Get or set the value of a target input element
  val(target, value) {
    const targetElement = this._target(target);
    if (value === undefined) return targetElement.value;

    targetElement.value = value;
  }

  // Apply CSS styles to a target element
  css(target, cssText) {
    this._target(target).style.cssText = cssText;
  }

  // Set a data attribute on a target element
  dataset(target, key, value) {
    return (this._target(target).dataset[key] = value);
  }

  // Toggle a class on a target element based on a boolean value
  toggle(target, className, boolean, parent = document) {
    this._target(target, parent, "one", true)?.classList.toggle(className, boolean);
  }

  // Replace an existing class with a new class on a target element
  replace(target, currentClass, newClass, parent = document) {
    this._target(target, parent)?.classList.replace(currentClass, newClass);
  }

  // Append a child element to a target element
  append(target, element) {
    this._target(target).append(element);
  }

  // Insert a new element after a specified target element
  appendAfter(target, element) {
    const targetElement = this._target(target);
    element.parentElement.insertBefore(targetElement, element.nextElementSibling);
  }

  appendBefore(container, element, sibling) {
    const targetContainer = this._target(container);

    if (sibling && sibling.parentNode !== targetContainer) {
      sibling = null;
    }

    targetContainer.insertBefore(element, sibling);
  }

  // Remove a target element from the DOM
  remove(target) {
    this._target(target).remove();
  }

  // Clone a target element and execute a callback with the clone and original elements
  copy(target, callback) {
    const original = this._target(target);
    const copied = original.cloneNode(true);
    callback(copied, original);
  }

  // Add an event listener to a target element
  on(target, type, handler) {
    this._target(target).addEventListener(type, handler);
  }

  // Add an inline event handler to a target element
  onInline(target, type, handler) {
    this._target(target)[type] = handler;
  }

  // Get a single element based on a selector
  el(target, parent = document) {
    return this._target(target, parent, "one");
  }

  // Get all matching elements based on a selector
  els(target, parent = document) {
    return this._target(target, parent, "all");
  }

  // Enable or disable elements, applying or removing classes for disabled styles
  disable(boolean, ...selectors) {
    for (const selector of selectors) {
      const element = this._target(selector);

      if (element.tagName === "INPUT") {
        element.disabled = boolean;
        continue;
      }

      this.toggle(element, "pe-none", boolean);
      this.toggle(element, "opacity-50", boolean);
    }
  }

  /* 
  =========================================
     Methods
  ========================================= 
  */

  // Generate a downloadable element and trigger its click event
  download(source, name) {
    const a = document.createElement("a");
    a.href = source;
    a.download = name;

    a.click();
  }

  // Display a confirmation dialog with the given message
  dialog(message) {
    return confirm(message);
  }

  /* 
  =========================================
     General
  ========================================= 
  */

  clearSelectedCanvasItem() {
    this.els(".canvas-item.selected").forEach((item) => {
      item.classList.remove("selected");
    });
  }

  // Adjust the width or height of an image map item based on a math expression, clamping the result to fit within the container
  setImageMapItemSize(event, element, direction, container) {
    const isWidth = direction === "width";

    const size = isWidth ? "width" : "height";
    const rawValue = event.target.value.replace("%", "").trim();

    let evaluatedValue;

    try {
      evaluatedValue = eval(rawValue);
    } catch {
      event.target.value = element.style[size];
      return;
    }

    const value = parseFloat(evaluatedValue);
    if (isNaN(value)) return;

    const containerSize = isWidth ? container.offsetWidth : container.offsetHeight;
    const elementPosition = isWidth ? element.offsetLeft : element.offsetTop;

    const maxAllowedSize = containerSize - elementPosition;
    const newSizeInPixels = Math.max(1, Math.min((value / 100) * containerSize, maxAllowedSize));
    const clampedValue = Math.max(2, parseFloat(((newSizeInPixels / containerSize) * 100).toFixed(2)));

    element.style[size] = clampedValue + "%";
    event.target.value = clampedValue + "%";
  }

  // Update Bootstrap collapse API attributes for the given element
  updateBootstrapCollapseId(element, uniqueID) {
    const collapseButton = element.querySelector('[data-bs-toggle="collapse"]');
    const collapseContent = element.querySelector("._content");

    collapseButton.dataset.bsTarget = `#${uniqueID}`;
    collapseContent.id = uniqueID;
  }

  // Collapse or expand all canvas items based on the given state
  collapseCanvasItems(isCollapsed) {
    const elements = document.querySelectorAll(".canvas-item .collapse");
    elements.forEach((element) => this.toggle(element, "show", !isCollapsed));
  }

  // Display the active modal edit section, hide the previous one, and adjust the modal size based on the isLarge flag
  renderModalEditSection(key, isLarge) {
    this.toggle("#modal-edit .modal-dialog", "modal-lg", isLarge);
    this.replace(".d-block[data-edit]", "d-block", "d-none");
    this.replace(`.d-none[data-edit="${key}"]`, "d-none", "d-block");
  }

  // Show or hide the modal edit error message alert and update its text
  renderModalEditErrorMessage(boolean, text = "") {
    this.html("#modal-edit-alert span", text);
    this.toggle("#modal-edit-alert", "d-none", !boolean);
  }

  // Replace placeholder with the actual content and optionally center the content
  replacePlaceholder(element, boolean, isCenterized = true) {
    this.toggle(element, "d-none", !boolean);
    this.toggle(element.parentElement, "ph", !boolean);
    this.toggle(element.parentElement, "center-content", boolean && isCenterized);
  }

  replaceContainerPlaceHolder(boolean, sourceContainer, targetContainer) {
    if (targetContainer.classList.contains("ph")) this.toggle(targetContainer, "ph", false);
    this.toggle(sourceContainer, "ph", boolean && !sourceContainer.matches("li") && !sourceContainer.matches("summary"));
  }

  // Replace the button icon with a loading animation, and restore the original icon when set to false
  buttonLoading(boolean, button) {
    this.disable(boolean, button);

    const icon = button.querySelector("i");
    if (!icon) return;

    if (boolean) {
      icon.dataset.class = icon.className;
      icon.className = "fa fa-spinner fa-pulse fa-fw";
    } else {
      icon.className = icon.dataset.class || icon.className;
      delete icon.dataset.class;
    }
  }

  // Clear the currently active image map item in the specified container
  clearActiveImageMapItem(container) {
    const currentActive = this.el(".imgmap-edit-item.active", container);

    if (currentActive) {
      this.toggle(currentActive, "active", false);
    }
  }

  // Toggle the active state of an image map item in the specified container
  toggleActiveImageMapItem(element, container) {
    if (!element || element.classList.contains("active")) return false;

    this.clearActiveImageMapItem(container);
    this.toggle(element, "active", true);

    return true;
  }

  /* 
  =========================================
     Tooltip
  ========================================= 
  */

  // Create an instance of Bootstrap tooltip
  initializeTooltip(triggerType, ...parents) {
    for (const parent of parents) {
      new bootstrap.Tooltip(parent, { selector: '[data-bs-toggle="tooltip"]', trigger: triggerType });
    }
  }

  // Clear a specific tooltip from an element
  clearTooltip(element) {
    const tooltip = bootstrap.Tooltip.getInstance(element);
    tooltip?.dispose();
  }

  // Clear all active tooltips in the document
  clearActiveTooltips() {
    const tooltips = document.querySelectorAll(".tooltip.bs-tooltip-auto.fade.show");
    tooltips.forEach((tooltip) => tooltip.remove());
  }

  /* 
  =========================================
     Elements Generator
  ========================================= 
  */

  // Generate Canvas Item
  generateCanvasItem(key, editable, uniqueID, content) {
    const div = document.createElement("div");
    div.classList.add("canvas-item", "osu-style");

    const buttonEdit = `
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Edit" data-action="edit" data-key="${key}">
        <i class="fa fa-pencil fa-fw"></i>
      </button>
    `;

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
          ${editable === "true" ? buttonEdit : ""}
          <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Duplicate" data-action="duplicate">
            <i class="fa fa-copy fa-fw"></i>
          </button>
          <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Remove" data-action="remove">
            <i class="fa fa-trash fa-fw"></i>
          </button>
        </div>
      </div>
  
      <div class="_content p-2 collapse show" id="${uniqueID}">
        ${content}
      </div>
    `;

    return div;
  }

  // Generate Canvas Template Item
  generateCanvasTemplateItem(title, des, templatePath) {
    return `
      <div class="d-flex flex-wrap align-items-center justify-content-between p-3 rounded-2 modal-box gap-3">
        <div class="flex-fill">
          <h3 class="h5 mb-0 text-light">${title}</h3>
          <p class="m-0">${des}</p>
        </div>
  
        <button class="btn btn-light btn-sm fw-bold" data-template-path="${templatePath}" data-action="render">
          Edit This Template
        </button>
      </div>
    `;
  }

  // Generate Canvas Element List Button
  generateCanvasElementListButton(key, data) {
    const { editable, icon, tooltipTitle } = data;
    return `
      <button class="canvas-element-list-btn btn btn-dark py-3 px-5" 
        data-action="move" 
        data-bs-toggle="tooltip" 
        data-bs-title="${tooltipTitle}" 
        data-key="${key}" 
        data-editable="${editable}">
        <i class="fa ${icon} fa-fw fa-lg"></i>
      </button>
    `;
  }

  // Generate Flag Item
  generateFlagItem(username, countryId, countryName) {
    const div = document.createElement("div");

    div.className = "flag-item d-flex align-items-center gap-1";
    div.innerHTML = `
    <div style="background:rgb(66, 53, 60)"> 
      <button class="btn btn-outline-light btn-sm" data-action="move">
         <i class="fa fa-arrows fa-fw"></i>
      </button>
    </div>

    <div 
    data-username="${username}" 
    data-country-name="${countryName}" 
    data-code="${countryId}" 
    class="flag-item-content flex-fill rounded-2 px-2 d-flex align-items-center gap-1" 
    style="background:rgba(255, 255, 255, 0.125); min-height:31px;">
      <img class="pe-none" src="./assets/countries/${countryId}.gif"> 
      <span class="pe-none d-block flex-fill fw-bold link-pink">${username}</span>
    </div>
 
    <div style="background:rgb(66, 53, 60)"> 
      <button class="btn btn-outline-light btn-sm" data-action="remove">
          <i class="fa fa-trash fa-fw"></i>
      </button>
    </div>
    `;

    return div;
  }

  // Generate List Item Edit Element
  generateListItemEdit(title = "", content = "") {
    const div = document.createElement("div");
    div.classList.add("list-item");
    div.innerHTML = `
      <div class="input-group input-group-sm gap-1">
        <div class="input-group-text">
          <button class="btn btn-outline-light btn-sm" data-action="move">
            <i class="fa fa-arrows fa-fw"></i>
          </button>
        </div>
        <input type="text" class="list-title-input form-control rounded-2" placeholder="Title" value="${title}" />
        <div class="input-group-text">
          <button class="btn btn-outline-light btn-sm" data-action="remove">
            <i class="fa fa-trash fa-fw"></i>
          </button>
        </div>
      </div>
      <div class="_list-content d-none">${content}</div>
    `;

    return div;
  }

  // Generate Edit (Input) Image Map Item
  generateEditImageMapItem(title = "Untitled", link = "#", style = "") {
    const item = document.createElement("a");
    item.classList.add("imgmap-edit-item");
    item.innerHTML = '<div class="_resizer"></div>';
    item.dataset.title = title;
    item.dataset.link = link;

    if (style === "") {
      item.style.width = "20%";
      item.style.height = "20%";
      item.style.top = "0%";
      item.style.left = "0%";
    } else {
      item.style.cssText = style;
    }

    return item;
  }

  // Generate Output Image Map Item
  generateOutputImageMapItem(title, link, style) {
    return `
      <a class="output-imgmap-item" target="_blank" data-link="${link}" href="${link}" style="${style}" data-title="${title}" data-bs-toggle="tooltip" data-bs-title="${title}"></a>
    `;
  }
  // Generate Modal Edit Section
  generateModalEditSection(key, content) {
    return `<div data-edit="${key}" class="d-none">${content}</div>`;
  }

  // Generate List Item Element
  generateListItem(title, content) {
    return `<li data-title="${title}" data-drop>${content}</li>`;
  }

  generateChangelogItem(date, changes) {
    return `
    <div>
      <div class="mb-1"><span class="badge text-bg-dark">${date}</span></div>
      <ul>
        ${changes.map((change) => `<li>${change}</li>`).join("")}
      </ul>
    </div>`;
  }
}
