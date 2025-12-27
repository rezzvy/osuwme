export default class View {
  constructor() {
    this.modalEdit = new bootstrap.Modal("#modal-edit");
    this.modalTemplate = new bootstrap.Modal("#modal-template");
    this.modalAudioPlayer = new bootstrap.Modal("#audio-modal");
    this.modalStarting = new bootstrap.Modal("#starting-modal");
    this.modalClone = new bootstrap.Modal("#clone-template");

    this.importProjectFileInput = document.getElementById("import-project-input");

    this.canvasWrapperElement = document.getElementById("canvas-wrapper");

    this.caches = {};

    this.menuStickyContainer = document.getElementById("element-list-section");
    this.menuStickyButtonWrapper = document.getElementById("canvas-element-list");
    this.isMenuSticky = true;

    this.isUpdating = false;
  }

  init(isMobile, isOnAuthRedirect) {
    this.modalStarting.show();

    this.remove(".placeholder-container");
    if (!isOnAuthRedirect) this.toggle("body", "pe-none", false);
    this.toggle("#canvas-element-list", "d-none", false);
    this.disable(true, "#undo-canvas-btn", "#redo-canvas-btn");
    this.initializeTooltip(`${isMobile ? "focus" : "hover"}`, "main", "#modal-wrapper");
    this.initializeStickyMenu();
  }

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
     Helpers
  ========================================= 
  */

  _target(target, parent = document, scope = "one", cache = false) {
    if (typeof target === "string") {
      if (target in this.caches) return this.caches[target];

      const element = scope === "one" ? parent?.querySelector(target) : parent?.querySelectorAll(target);
      if (cache) this.caches[target] = element;
      return element;
    }

    return target;
  }

  html(target, content, keep = false) {
    const targetElement = this._target(target);
    if (content === undefined) return targetElement.innerHTML;

    if (keep) {
      targetElement.innerHTML += content;
      return;
    }

    targetElement.innerHTML = content;
  }

  text(target, content) {
    const targetElement = this._target(target);
    if (content === undefined) return targetElement.textContent;

    targetElement.textContent = content;
  }

  val(target, value) {
    const targetElement = this._target(target);
    if (value === undefined) return targetElement.value;

    targetElement.value = value;
  }

  css(target, cssText) {
    this._target(target).style.cssText = cssText;
  }

  dataset(target, key, value) {
    return (this._target(target).dataset[key] = value);
  }

  toggle(target, className, boolean, parent = document) {
    this._target(target, parent, "one", true)?.classList.toggle(className, boolean);
  }

  replace(target, currentClass, newClass, parent = document) {
    this._target(target, parent)?.classList.replace(currentClass, newClass);
  }

  append(target, element) {
    this._target(target).append(element);
  }

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

  remove(target) {
    this._target(target).remove();
  }

  copy(target, callback) {
    const original = this._target(target);
    const copied = original.cloneNode(true);
    callback(copied, original);
  }

  on(target, type, handler) {
    this._target(target).addEventListener(type, handler);
  }

  onInline(target, type, handler) {
    this._target(target)[type] = handler;
  }

  el(target, parent = document) {
    return this._target(target, parent, "one");
  }

  els(target, parent = document) {
    return this._target(target, parent, "all");
  }

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

  download(source, name) {
    const a = document.createElement("a");
    a.href = source;
    a.download = name;

    a.click();
  }

  dialog(message) {
    return confirm(message);
  }

  /* 
  =========================================
     Canvas Item
  ========================================= 
  */

  clearSelectedCanvasItem() {
    this.els(".canvas-item.selected").forEach((item) => {
      item.classList.remove("selected");
    });
  }

  collapseCanvasItems(isCollapsed) {
    const elements = document.querySelectorAll(".canvas-item .collapse");
    elements.forEach((element) => this.toggle(element, "show", !isCollapsed));
  }

  /* 
  =========================================
     Utils
  ========================================= 
  */

  updateBootstrapCollapseId(element, uniqueID) {
    const collapseButton = element.querySelector('[data-bs-toggle="collapse"]');
    const collapseContent = element.querySelector("._content");

    collapseButton.dataset.bsTarget = `#${uniqueID}`;
    collapseContent.id = uniqueID;
  }

  renderModalEditSection(key, isLarge) {
    this.toggle("#modal-edit .modal-dialog", "modal-lg", isLarge);
    this.replace(".d-block[data-edit]", "d-block", "d-none");
    this.replace(`.d-none[data-edit="${key}"]`, "d-none", "d-block");
  }

  renderModalEditErrorMessage(boolean, text = "") {
    this.html("#modal-edit-alert span", text);
    this.toggle("#modal-edit-alert", "d-none", !boolean);
  }

  replacePlaceholder(element, boolean, isCenterized = true) {
    this.toggle(element, "d-none", !boolean);
    this.toggle(element.parentElement, "ph", !boolean);
    this.toggle(element.parentElement, "center-content", boolean && isCenterized);
  }

  replaceContainerPlaceHolder(boolean, sourceContainer, targetContainer) {
    if (targetContainer.classList.contains("ph")) this.toggle(targetContainer, "ph", false);
    this.toggle(sourceContainer, "ph", boolean && !sourceContainer.matches("li") && !sourceContainer.matches("summary"));
  }

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

  /* 
  =========================================
     Image Map
  ========================================= 
  */

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

  clearActiveImageMapItem(container) {
    const currentActive = this.el(".imgmap-edit-item.active", container);

    if (currentActive) {
      this.toggle(currentActive, "active", false);
    }
  }

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

  initializeTooltip(triggerType, ...parents) {
    for (const parent of parents) {
      new bootstrap.Tooltip(parent, { selector: '[data-bs-toggle="tooltip"]', trigger: triggerType });
    }
  }

  clearTooltip(element) {
    const tooltip = bootstrap.Tooltip.getInstance(element);
    tooltip?.dispose();
  }

  clearActiveTooltips() {
    const tooltips = document.querySelectorAll(".tooltip.bs-tooltip-auto.fade.show");
    tooltips.forEach((tooltip) => tooltip.remove());
  }

  /* 
  =========================================
     Auth
  ========================================= 
  */

  authLoginRedirectState(bool) {
    if (bool) {
      this.text("#osu-api-login-btn", "Logging in...");
      this.disable(true, "#osu-api-login-btn");
      this.toggle("body", "pe-none", true);
      return;
    }
    this.toggle("body", "pe-none", false);
  }

  login(bool, authData) {
    let tooltip = bootstrap.Tooltip.getInstance(this.el("#osu-api-login-btn"));
    if (tooltip) tooltip.dispose();

    if (bool) {
      const user = authData.user;

      this.toggle(document.body, "logged-in", true);
      this.replace("#osu-api-login-btn", "btn-success", "btn-danger");
      this.dataset("#osu-api-login-btn", "bsTitle", "Click to Logout");
      this.html("#osu-api-login-btn", `<img class="avatar-btn-img" src="${user.avatar}"> ${user.username}`);
      return;
    }

    this.toggle(document.body, "logged-in", false);
    this.replace("#osu-api-login-btn", "btn-danger", "btn-success");
    this.dataset("#osu-api-login-btn", "bsTitle", "Click to Login");
    this.html("#osu-api-login-btn", `<img class="avatar-btn-img" src="https://osu.ppy.sh/images/layout/avatar-guest.png"> Guest`);
  }

  /* 
  =========================================
     Clone
  ========================================= 
  */
  clone(state, userData) {
    if (state === "OnSubmitted") {
      this.buttonLoading(true, this.el("#clone-link-submit"));
      this.disable(true, "#clone-link-input", "#clone-open-userpge", "#clone-copy-bbcode");
      this.toggle("._cover > img", "d-none", true);
      this.toggle("._avatar > img", "d-none", true);
      this.text("._info > h3", "N/A");
      this.text("._info > p", "N/A");
      this.dataset("#clone-open-userpge", "url", "");
      this.dataset("#clone-copy-bbcode", "bbcode", "");
      return;
    }

    if (state === "onDataFetched") {
      this.el("._avatar > img").src = userData.avatar;
      this.el("._cover > img").src = userData.cover;

      this.text("._info > h3", userData.username);
      this.text("._info > p", userData.country);
      this.dataset("#clone-open-userpge", "url", `https://osu.ppy.sh/users/${userData.username}`);
      this.dataset("#clone-copy-bbcode", "bbcode", userData.page.raw);
      return;
    }

    if (state === "onDataFetchedReset") {
      this.buttonLoading(false, this.el("#clone-link-submit"));
      this.disable(!userData, "#clone-open-userpge", "#clone-copy-bbcode", "#cloned-userpage-render");
      this.disable(false, "#clone-link-input");
      this.val("#clone-link-input", "");
      return;
    }

    this.cloneResetUi();
  }

  cloneResetUi() {
    this.disable(false, "#clone-link-input");
    this.disable(true, "#clone-open-userpge", "#clone-copy-bbcode", "#clone-link-submit", "#cloned-userpage-render");
    this.toggle("._cover > img", "d-none", true);
    this.toggle("._avatar > img", "d-none", true);
    this.text("._info > h3", "N/A");
    this.text("._info > p", "N/A");
    this.dataset("#clone-open-userpge", "url", "");
    this.dataset("#clone-copy-bbcode", "bbcode", "");
  }
}
