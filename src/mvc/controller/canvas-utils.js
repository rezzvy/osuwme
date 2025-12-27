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
    controller.observer = new MutationObserver((mutations) => {
      model.latestCanvasContent = view.html("#canvas-wrapper");
    });

    controller.observer.observe(view.canvasWrapperElement, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  };
};
