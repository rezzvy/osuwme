export default (controller) => {
  const model = controller.model;
  const view = controller.view;

  controller.fetchAndRenderInitElements = async () => {
    await controller.renderCanvasElementList();
    await controller.renderCanvasTemplateList();
    await controller.renderChangeLogs();
    await controller.renderSupportText();
  };

  controller.renderCanvasElementList = async () => {
    const data = await model.fetchData("./src/json/canvas-element-list.json", "json");
    const temp = { modal: [], skeleton: [], handler: [], button: "" };

    for (const key in data) {
      const { modalPath, skeletonPath, handlerPath } = data[key];
      temp.button += view.generateCanvasElementListButton(key, data[key]);

      if (modalPath) {
        const promise = model.asyncFetchData(modalPath, "text", (res) => {
          return view.generateModalEditSection(key, res);
        });
        temp.modal.push(promise);
      }
      if (skeletonPath) {
        const promise = model.asyncFetchData(skeletonPath, "text", (res) => {
          model.registerSkeleton(key, res);
          return true;
        });
        temp.skeleton.push(promise);
      }
      if (handlerPath) {
        const promise = import(handlerPath).then((module) => {
          const HandlerClass = module.default;
          if (HandlerClass) {
            const instance = new HandlerClass(controller);
            model.registerHandler(key, instance);
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

    view.html("#modal-edit-body", modals);
    view.html("#canvas-element-list", temp.button);
  };

  controller.renderChangeLogs = async () => {
    const data = await model.fetchData("./src/json/version.json", "json");

    let content = "";
    for (const change of data.changelogs) {
      const { date, changes } = change;
      content += view.generateChangelogItem(date, changes);
    }

    view.text("#last-update-date", data.latest_updated);
    view.html("#changelog-wrapper", content);
  };

  controller.renderSupportText = async () => {
    const data = await model.fetchData("./src/support.txt", "text");

    view.text("#support-modal code", data);
  };

  controller.renderCanvasTemplateList = async () => {
    const data = await model.fetchData("./src/json/canvas-templates.json", "json");
    let template = "";

    for (const key in data) {
      const { title, des, templatePath } = data[key];
      template += view.generateCanvasTemplateItem(title, des, templatePath);
    }

    view.html("#modal-template-body", template);
  };
};
