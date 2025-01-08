import Model from "./mvc/model.js";
import View from "./mvc/view.js";
import Controller from "./mvc/controller.js";
import initLibraries from "./lib.js";

const model = new Model();
const view = new View();
const controller = new Controller(model, view);

document.addEventListener("DOMContentLoaded", async (e) => {
  await controller.init();
  initLibraries(controller);
});
