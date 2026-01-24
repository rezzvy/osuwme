export default (controller) => {
  const model = controller.model;
  const view = controller.view;

  controller.renderFontSizeItems = () => {
    const savedData = localStorage.getItem("font-size");
    if (savedData) model.fontSizes = JSON.parse(savedData);

    let options = "";

    const fragment = document.createDocumentFragment();
    model.fontSizes.forEach((font) => {
      const el = view.generateCostumFontSizeEdit(font.name, font.size);
      options += `<option value="${font.size}%" ${font.name === "Normal" ? "selected" : ""}>${font.name}</option>`;
      fragment.appendChild(el);
    });

    view.append("#define-font-size-item-container", fragment);
    view.html(".ql-size.form-select", options);
  };

  controller.initCanvasButtonOrders = () => {
    const savedData = localStorage.getItem("canvas-btn-order");

    if (!savedData) return;

    try {
      const orderKeys = JSON.parse(savedData);
      const mainList = view.el("#canvas-element-list");

      orderKeys.forEach((key, index) => {
        const btn = mainList.querySelector(`[data-key="${key}"]`);

        if (btn) {
          btn.style.order = index + 1;

          mainList.appendChild(btn);
        }
      });
    } catch (error) {
      localStorage.removeItem("my_canvas_order");
    }
  };

  controller.initPreferenceSettings = () => {
    const isStickyMenu = localStorage.getItem("preference-sticky-menu") === "true" ? true : false;
    const isHideOnMove = localStorage.getItem("preference-hide-on-move") === "true" ? true : false;
    const isAutoHideMenu = localStorage.getItem("preference-auto-hide-menu") === "true" ? true : false;

    view.el("#canvas-menu-sticky-switch").checked = isStickyMenu;
    view.el("#hide-on-move-switch").checked = isHideOnMove;
    view.el("#auto-hide-canvas-menu-switch").checked = isAutoHideMenu;

    view.toggle("#element-list-section", "pinned", isStickyMenu);
    view.isMenuSticky = isStickyMenu;
    view.toggle("body", "hide-on-move", isHideOnMove);
    view.toggle("body", "auto-hide-canvas-menu", isAutoHideMenu);
  };

  controller.fetchAndRenderInitElements = async () => {
    await controller.renderCanvasElementList();
    await controller.renderCanvasTemplateList();
    await controller.renderChangeLogs();
    await controller.renderSupportText();
    controller.initCanvasButtonOrders();
    controller.initPreferenceSettings();
    controller.renderFontSizeItems();

    view.on("#anchor-login-btn", "click", () => {
      view.el("#osu-api-login-btn").click();
    });
  };

  controller.renderCanvasElementList = async () => {
    const data = await model.fetchData("./src/json/canvas-element-list.json", "json");
    const temp = { modal: [], skeleton: [], handler: [], button: "" };

    let buttonIndex = 1;

    for (const key in data) {
      const currentIndex = buttonIndex;
      const { modalPath, skeletonPath, handlerPath } = data[key];

      temp.button += view.generateCanvasElementListButton(key, data[key], currentIndex);

      if (modalPath) {
        const promise = model.asyncFetchData(modalPath, "text", (res) => {
          return view.generateModalEditSection(key, res, currentIndex);
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

      buttonIndex++;
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
