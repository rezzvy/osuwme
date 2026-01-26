export default (controller) => {
  const model = controller.model;
  const view = controller.view;

  controller.initCanvas = () => {
    controller.renderLatestCanvasContent();
    controller.initWatchCanvasChange();
  };

  controller.setCanvasContent = (html) => {
    model.clearHistory();
    controller.toggleUndoRedoButtons();

    view.html("#canvas-wrapper", html);
    view.css("#canvas", "");
    view.clearSelectedCanvasItem();

    view.els(".inline-splitter").forEach((el) => {
      el.textContent = " ";
    });

    // legacy support
    view.els("._content > .heading").forEach((el) => {
      const value = el.textContent;
      const canvasItem = el.closest(".canvas-item");

      const newCanvasItem = controller.renderToCanvas("text", "true", controller.model.uniqueID, false);

      const content = controller.view.el("._content", newCanvasItem);
      view.html(content, `<h2>${value}</h2>`);

      canvasItem.replaceWith(newCanvasItem);
    });

    view.els("code").forEach((el) => {
      if (el.classList.contains("inline") || !el.dataset.raw) return;

      view.text(el, model.replaceTextAreaSpacing(false, el.dataset.raw));
    });

    controller.hotkeyReady = true;
  };

  controller.renderLatestCanvasContent = () => {
    const content = model.latestCanvasContent;

    if (content) {
      view.text("#starting-modal-new-project-btn span", "Continue");
    } else {
      view.text("#starting-modal-new-project-btn span", "New Project");
    }

    controller.setCanvasContent(content);
  };

  controller.renderToCanvas = (key, editable, uniqueID, autoAppend = true) => {
    const skeleton = model.getSkeleton(key);
    const canvasItem = view.generateCanvasItem(key, editable, uniqueID, skeleton);

    if (autoAppend) {
      view.append("#canvas-wrapper", canvasItem);

      controller.pushHistory("undo", {
        action: "add",
        element: canvasItem,
        container: canvasItem.parentElement,
        sibling: canvasItem.nextSibling,
      });

      return;
    }

    return canvasItem;
  };

  controller.initWatchCanvasChange = () => {
    const saveContentDebounced = controller.debounce(() => {
      model.latestCanvasContent = view.html("#canvas-wrapper");
    }, 250);

    controller.observer = new MutationObserver((mutations) => {
      if (document.body.classList.contains("on-grabbing")) return;

      const isIrrelevant = mutations.every((mutation) => {
        const ignoredAttributes = ["aria-describedby", "title", "data-bs-original-title", "data-original-title"];

        if (mutation.type === "attributes" && ignoredAttributes.includes(mutation.attributeName)) {
          return true;
        }

        if (mutation.target?.classList?.contains("tooltip")) {
          return true;
        }

        return false;
      });

      if (isIrrelevant) return;

      saveContentDebounced();
    });

    controller.observer.observe(view.canvasWrapperElement, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  };
};
