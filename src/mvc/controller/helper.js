export default (controller) => {
  const model = controller.model;
  const view = controller.view;

  controller.debounce = (fn, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  controller.pushHistory = (type, stack) => {
    model.pushHistory(type, stack);
    controller.toggleUndoRedoButtons();
  };

  controller.toggleUndoRedoButtons = () => {
    view.disable(!model.history.stack.undo.length, "#undo-canvas-btn");
    view.disable(!model.history.stack.redo.length, "#redo-canvas-btn");
  };

  controller.isOnAboutToLogin = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    return code;
  };

  controller.download = (content, blobType, downloadName) => {
    const blob = model.createBlob(blobType, content);

    view.download(blob, downloadName);
    model.clearBlob(blob);
  };
};
