export default (controller) => {
  const model = controller.model;
  const view = controller.view;

  controller.attachEvents = () => {
    for (const key in model.handler) model.handler[key]?.init?.();

    /* 
     =========================================
        Global Events
     ========================================= 
    */

    view.on(document, "keydown", (e) => {
      const key = e.key?.toLowerCase();
      const blockedKeys = ["o", "s", "1", "2", "3", "4", "5", "e"];

      if (e.ctrlKey && blockedKeys.includes(key)) {
        e.preventDefault();
      }

      if (document.body.classList.contains("modal-open")) {
        return;
      }

      if (controller.hotkeyReady) {
        if (e.ctrlKey && key === "1") {
          view.el("#expand-all-canvas-btn").click();
        }

        if (e.ctrlKey && key === "2") {
          view.el("#collapse-all-canvas-btn").click();
        }

        if (e.ctrlKey && key === "3") {
          view.el("#clear-canvas-btn").click();
        }

        if (e.ctrlKey && key === "4") {
          view.el("#clear-canvas-selection-btn").click();
        }

        if (e.ctrlKey && key === "5") {
          view.el("#reset-canvas-size-btn").click();
        }

        if (e.ctrlKey && key === "s") {
          view.el("#export-project-btn").click();
        }

        if (e.ctrlKey && key === "o") {
          view.el("#import-project-btn").click();
        }

        if (e.ctrlKey && key === "e") {
          const editModeInput = view.el("#canvas-mode-switch");
          editModeInput.checked = !editModeInput.checked;
          editModeInput.dispatchEvent(new Event("input", { bubbles: true }));
        }

        if (e.ctrlKey && key === "z" && !document.body.classList.contains("view-mode")) {
          view.el("#undo-canvas-btn").click();
        }

        if (e.ctrlKey && key === "y" && !document.body.classList.contains("view-mode")) {
          view.el("#redo-canvas-btn").click();
        }
      }
    });

    /* 
     =========================================
        Input File Event
     ========================================= 
    */

    view.on("#import-project-input", "change", (e) => {
      const files = e.target.files;
      if (files.length === 0) {
        if (controller.onModalStarting) controller.onModalStarting = false;
        return;
      }

      model.readFileAsText(files[0], (content) => {
        if (!model.isValidProjectFile(content)) return alert("Can't recognize HTML formats!");
        if (controller.onModalStarting) view.modalStarting.hide();

        controller.setCanvasContent(content);
        view.clearActiveTooltips();
        e.target.value = "";
      });
    });
    /* 
     =========================================
        Bootstrap Modal Show/Hide Events
     ========================================= 
    */

    view.on("#modal-edit", "show.bs.modal", () => {
      view.disable(true, "#modal-edit-save");

      model.currentHandler?.open?.();
      view.renderModalEditSection(model.currentEdit.key, model.isLargeSize);
    });

    view.on("#getcode-modal", "show.bs.modal", () => {
      const fixRepetitiveLinks = controller.mergeGradientLinks(view.html("#canvas-wrapper"));
      view.html("#code-output-textarea", model.output(fixRepetitiveLinks));
    });

    view.on("#modal-edit", "hide.bs.modal", () => {
      model.currentHandler?.close?.();

      model.clearCurrentEdit();
      view.clearActiveTooltips();
      view.renderModalEditErrorMessage(false);
    });

    view.on("#getcode-modal", "hide.bs.modal", () => {
      view.toggle("#clipboard-alert", "d-none", true);
    });

    view.on("#clone-template", "hide.bs.modal", () => {
      view.clone("onReset");
      model.currentClonedData = null;
    });

    view.on("#audio-modal", "hide.bs.modal", () => {
      const audio = view.el("#audio-modal-preview");
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    /* 
     =========================================
        Starting Modal Events
     ========================================= 
    */

    view.on("#starting-modal-new-project-btn", "click", () => {
      controller.hotkeyReady = true;
      view.modalStarting.hide();
    });

    view.on("#starting-modal-load-project-btn", "click", () => {
      controller.onModalStarting = true;
      view.importProjectFileInput.click();
    });

    view.on("#starting-modal-templates-btn", "click", () => {
      view.modalStarting.hide();
      view.modalTemplate.show();
    });

    view.on("#starting-modal-clone-btn", "click", () => {
      view.modalStarting.hide();
      view.modalClone.show();
    });

    view.on("#osu-api-login-btn", "click", (e) => {
      const authData = model.getAuthData();

      if (authData) {
        controller.logout();
        return;
      }

      view.disable(true, e.target);

      window.location.href = `https://osu.ppy.sh/oauth/authorize?client_id=${model.apiConfig.OSU_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        model.apiConfig.REDIRECT
      )}&response_type=code&scope=public`;
    });

    /* 
     =========================================
        Get Code Modal Events
     ========================================= 
    */

    view.on("#copy-to-clipboard", "click", async () => {
      const textarea = view.el("#code-output-textarea");
      await controller.toClipboardHandler(textarea);

      view.toggle("#clipboard-alert", "d-none", false);
    });

    view.on("#download-as-text", "click", () => {
      const content = view.val("#code-output-textarea");
      controller.download(content, "text/plain", "osuwme-bbcode-output.txt");
    });

    /* 
     =========================================
        Edit Modal Event
     ========================================= 
    */

    view.on("#modal-edit-save", "click", () => {
      const stack = {
        action: "edit",
        element: model.currentEdit.target.closest(".canvas-item"),
        content: model.currentEdit.target.innerHTML,
      };

      model.currentHandler?.save?.();

      stack.newContent = model.currentEdit.target.innerHTML;
      controller.pushHistory("undo", stack);

      view.modalEdit.hide();
    });

    /* 
     =========================================
        Template Modal Event
     ========================================= 
    */

    view.on("#modal-template-body", "click", async (e) => {
      if (!e.target.dataset.templatePath) return;
      await controller.loadTemplateHandler(e.target);
    });

    /* 
     =========================================
       Clone Modal Events
     ========================================= 
    */

    view.on("#cloned-userpage-render", "click", (e) => {
      if (!model.currentClonedData) return;

      controller.cloneUserpage(model.currentClonedData);

      view.clone("onReset");
      view.modalClone.hide();
    });

    view.on("#clone-link-submit", "click", async (e) => {
      const authData = model.getAuthData();
      if (!authData) return;

      view.clone("OnSubmitted");

      const username = view.val("#clone-link-input");
      model.currentClonedData = await controller.osuApiRequest("get-user", username);

      const data = model.currentClonedData;
      if (data) {
        view.clone("onDataFetched", data);
      }

      view.clone("onDataFetchedReset", data);
    });

    view.on("#clone-copy-bbcode", "click", async (e) => {
      const bbcode = e.currentTarget.dataset.bbcode;
      if (!bbcode) return;

      const textarea = view.generateGhostTextArea(bbcode);
      document.body.appendChild(textarea);

      await controller.toClipboardHandler(textarea);
      document.body.removeChild(textarea);

      alert("Copied!");
    });

    view.on("#clone-open-userpge", "click", (e) => {
      if (!e.target.dataset.url) return;

      window.open(e.target.dataset.url, "_blank");
    });

    view.on("._avatar > img", "load", (e) => {
      view.toggle(e.target, "d-none", false);
    });

    view.on("._cover > img", "load", (e) => {
      view.toggle(e.target, "d-none", false);
    });

    view.on("#clone-link-input", "input", (e) => {
      view.disable(!e.target.value.trim(), "#clone-link-submit");
    });
    /* 
     =========================================
        Canvas Main Interface Events
     ========================================= 
    */

    view.on("#undo-canvas-btn", "click", () => {
      controller.historyHandler("undo");
    });

    view.on("#redo-canvas-btn", "click", () => {
      controller.historyHandler("redo");
    });

    view.on("#canvas-mode-switch", "input", (e) => {
      const isViewMode = !e.target.checked;

      if (isViewMode) {
        controller.lastEditModeScrollTop = window.scrollY;
        view.toggle("body", "view-mode", true);
        window.scrollTo({ top: controller.lastViewModeScrollTop || 0, behavior: "instant" });
        return;
      }

      controller.lastViewModeScrollTop = window.scrollY;
      view.toggle("body", "view-mode", false);
      window.scrollTo({ top: controller.lastEditModeScrollTop || 0, behavior: "instant" });
    });

    view.on("#canvas-element-list-slider", "click", (e) => {
      if (!e.target.matches("[data-action]")) return;

      const action = e.target.dataset.action;
      const container = view.menuStickyButtonWrapper;

      if (action === "scroll-to-left") {
        container.scrollTo({ left: container.scrollLeft - 250, behavior: "smooth" });
      } else if (action === "scroll-to-right") {
        container.scrollTo({ left: container.scrollLeft + 250, behavior: "smooth" });
      }
    });

    view.on("#canvas-element-list", "click", (e) => {
      if (!e.target.dataset.key) return;
      controller.renderToCanvas(e.target.dataset.key, e.target.dataset.editable, model.uniqueID);
    });

    view.on("#element-list-btn-order-setting", "click", (e) => {
      view.html("#order-container", "");
      view.modalOrder.show();

      const fragment = document.createDocumentFragment();

      for (const child of view.el("#canvas-element-list").children) {
        const item = view.generateOrderListItem(child.dataset.bsTitle);

        item.dataset.key = child.dataset.key;

        fragment.append(item);
      }

      view.append("#order-container", fragment);
    });

    view.on("#order-save-btn", "click", (e) => {
      const modalContainer = view.el("#order-container");
      const mainList = view.el("#canvas-element-list");

      const sortedItems = modalContainer.querySelectorAll(".order-item");

      const orderKeys = [];

      sortedItems.forEach((modalItem, index) => {
        const key = modalItem.dataset.key;

        orderKeys.push(key);

        const originalBtn = mainList.querySelector(`[data-key="${key}"]`);
        if (originalBtn) {
          originalBtn.style.order = index + 1;
          mainList.appendChild(originalBtn);
        }
      });

      localStorage.setItem("canvas-btn-order", JSON.stringify(orderKeys));
      view.modalOrder.hide();
    });

    /* 
     =========================================
        Canvas Action Events
     ========================================= 
    */

    view.on("#open-main-menu-btn", "click", (e) => {
      controller.onModalStarting = true;
      view.modalStarting.show();
    });

    view.on("#import-project-btn", "click", () => {
      view.importProjectFileInput.click();
    });

    view.on("#export-project-btn", "click", () => {
      if (model.isNodeEmpty("#canvas-wrapper")) return;

      const content = model.getSingleLine(view.html("#canvas-wrapper"));
      controller.download(content, "text/html", "osuwme-project.html");
    });

    view.on("#expand-all-canvas-btn", "click", () => {
      view.collapseCanvasItems(false);
    });

    view.on("#collapse-all-canvas-btn", "click", () => {
      view.collapseCanvasItems(true);
    });

    view.on("#clear-canvas-btn", "click", () => {
      if (!model.isNodeEmpty("#canvas-wrapper") && !view.dialog("Are you sure?")) return;
      controller.setCanvasContent("");
    });

    view.on("#clear-canvas-selection-btn", "click", () => {
      view.clearSelectedCanvasItem();
    });

    view.on("#reset-canvas-size-btn", "click", () => {
      view.css("#canvas", "");
    });

    view.on("#edit-mode-canvas-action-btn", "click", () => {
      const editModeInput = view.el("#canvas-mode-switch");
      editModeInput.checked = !editModeInput.checked;
      editModeInput.dispatchEvent(new Event("input", { bubbles: true }));
    });

    view.on("#undo-canvas-action-btn", "click", () => {
      view.el("#undo-canvas-btn").click();
    });

    view.on("#redo-canvas-action-btn", "click", () => {
      view.el("#redo-canvas-btn").click();
    });

    view.on("#canvas-menu-sticky-switch", "input", (e) => {
      view.toggle("#element-list-section", "pinned", e.target.checked);
      view.isMenuSticky = e.target.checked;
    });

    view.on("#hide-on-move-switch ", "input", (e) => {
      view.toggle("body", "hide-on-move", e.target.checked);
    });

    /* 
     =========================================
        Canvas Item Events
     ========================================= 
    */

    view.on("#canvas-wrapper", "input", (e) => {
      if (e.target.matches(".canvas-item-title")) {
        e.target.setAttribute("value", e.target.value);
      }
    });

    view.on("#canvas-wrapper", "click", (e) => {
      const canvasItem = e.target.closest(".canvas-item");

      if (canvasItem && e.shiftKey && !document.body.classList.contains("view-mode")) {
        window.getSelection().removeAllRanges();
        canvasItem.classList.toggle("selected", !canvasItem.classList.contains("selected"));
      }

      if (!e.target.dataset.action) return;

      switch (e.target.dataset.action) {
        case "play":
          if (e.target.dataset.event === "true") controller.canvasItemAudioPlayerHandler(e.target);
          break;
        case "edit":
          controller.canvasItemEditHandler(e.target);
          break;
        case "duplicate":
          controller.canvasItemDuplicateHandler(e.target);
          break;
        case "remove":
          controller.canvasItemRemoveHandler(e.target);
          break;
      }
    });
  };
};
