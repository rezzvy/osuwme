export default (controller) => {
  const model = controller.model;
  const view = controller.view;

  /* 
  =========================================
     Undo / Redo Handler
  ========================================= 
  */

  controller.historyHandler = (type) => {
    const item = model.getHistory(type);
    if (!item) return;

    controller.pushHistory(type === "undo" ? "redo" : "undo", item);

    if (item.action === "add" || item.action === "copy") {
      if (type === "undo") {
        view.remove(item.element);
      } else {
        let container = null;
        if (item.container.matches("li") && item.container.dataset.listItem) {
          container = document.querySelector(`[data-list-item="${item.container.dataset.listItem}"]`);
        }

        view.appendBefore(container ? container : item.container, item.element, item.sibling);
      }
    }

    if (item.action === "remove") {
      view.clearActiveTooltips();
      if (type === "undo") {
        view.appendBefore(item.container, item.element, item.sibling);
      } else {
        view.remove(item.element);
      }
    }

    if (item.action === "edit") {
      const content = view.el("._content", item.element);

      view.html(content, type === "undo" ? item.content : item.newContent);
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

            view.appendBefore(container ? container : obj.container, obj.element, obj.sibling);
            view.replaceContainerPlaceHolder(model.isNodeEmpty(obj.targetContainer), obj.targetContainer, obj.container);
          }
        }
      } else if (type === "redo") {
        item.forEach((obj) => {
          if (obj.action === "move") {
            let container = null;
            if (obj.targetContainer.matches("li") && obj.targetContainer.dataset.listItem) {
              container = document.querySelector(`[data-list-item="${obj.targetContainer.dataset.listItem}"]`);
            }

            view.appendBefore(container ? container : obj.targetContainer, obj.element, obj.targetSibling);
            view.replaceContainerPlaceHolder(model.isNodeEmpty(obj.container), obj.container, obj.targetContainer);
          }
        });
      }
    }

    if (item.action === "add" || item.action === "remove") {
      view.toggle(
        item.container,
        "ph",
        model.isNodeEmpty(item.container) && !item.container.matches("#canvas-wrapper") && !item.container.matches("li"),
      );
    }
  };

  /* 
  =========================================
     Copy To Clipboard Handler
  ========================================= 
  */

  controller.toClipboardHandler = async (textarea) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(textarea.value);
      return;
    }

    textarea.select();
    document.execCommand("copy");
  };

  /* 
  =========================================
     Load Template Handler
  ========================================= 
  */

  controller.loadTemplateHandler = async (button) => {
    if (!model.isNodeEmpty("#canvas-wrapper") && !view.dialog("Existing canvas will be wiped. Continue?")) return;
    const text = button.textContent;

    view.toggle("body", "pe-none", true);
    view.html(button, "Fetching...");
    const content = await model.fetchData(button.dataset.templatePath, "text");

    view.toggle("body", "pe-none", false);
    view.html(button, text);
    view.css("#canvas", null);

    controller.setCanvasContent(content);
    view.modalTemplate.hide();
  };

  /* 
  =========================================
     Canvas Item Handlers
  ========================================= 
  */

  controller.canvasItemEditHandler = (e) => {
    const canvasItem = e.closest(".canvas-item");
    const canvasItemContent = view.el("._content", canvasItem);
    const modal = view.el(`[data-edit="${e.dataset.key}"]`);

    model.setCurrentEdit(e.dataset.key, canvasItemContent, modal);
    view.modalEdit.show();
  };

  controller.canvasItemDuplicateHandler = (e) => {
    view.copy(e.closest(".canvas-item"), (copied, original) => {
      view.updateBootstrapCollapseId(copied, model.uniqueID);

      view.els("[data-list-item]", copied).forEach((li) => {
        li.dataset.listItem = model.uniqueID;
      });

      view.appendAfter(copied, original);

      controller.pushHistory("undo", {
        action: "copy",
        element: copied,
        container: copied.parentElement,
        sibling: copied.nextSibling,
      });
    });
  };

  controller.canvasItemRemoveHandler = (e) => {
    const canvasItem = e.closest(".canvas-item");
    const canvasItemContent = canvasItem.closest("._content");
    const innerContainer = view.el("[data-container]", canvasItemContent);

    controller.pushHistory("undo", {
      action: "remove",
      element: canvasItem,
      container: canvasItem.parentElement,
      sibling: canvasItem.nextSibling,
    });

    view.clearTooltip(e);
    view.clearActiveTooltips();
    view.remove(canvasItem);

    if (innerContainer) {
      view.toggle(innerContainer, "ph", model.isNodeEmpty(innerContainer));
    }

    if (model.isNodeEmpty("#canvas-wrapper")) {
      view.text("#canvas-wrapper", "");
    }
  };

  controller.canvasItemAudioPlayerHandler = (e) => {
    view.modalAudioPlayer.show();

    view.el("#audio-modal-preview").src = e.dataset.src;
    view.el("#audio-modal-preview").play();
  };
};
