import Model from "./mvc/model.js";
import View from "./mvc/view.js";
import Controller from "./mvc/controller.js";
import initLibraries from "./lib.js";

import renderController from "./mvc/controller/render.js";
import osuApiController from "./mvc/controller/osu-api.js";
import eventsController from "./mvc/controller/events.js";
import handlersController from "./mvc/controller/handlers.js";
import osuRawHtmlProcessingController from "./mvc/controller/osu-raw-html-processing.js";
import canvasUtilsController from "./mvc/controller/canvas-utils.js";
import helperController from "./mvc/controller/helper.js";
import utilsController from "./mvc/controller/utils.js";
import authController from "./mvc/controller/auth.js";

import colorsModel from "./mvc/model/colors.js";
import imageMapParserModel from "./mvc/model/imagemap-parser.js";
import quillUtilsModel from "./mvc/model/quill-utils.js";
import osuRawHTMLConversionModel from "./mvc/model/osu-raw-html-conversion.js";
import osuBBCodeConversionModel from "./mvc/model/osu-bbcode-conversion.js";

import elementsGeneratorView from "./mvc/view/elements-generator.js";

const model = new Model();
const view = new View();
const controller = new Controller(model, view);

document.addEventListener("DOMContentLoaded", async () => {
  // Model
  colorsModel(controller);
  imageMapParserModel(controller);
  quillUtilsModel(controller);
  osuRawHTMLConversionModel(controller);
  osuBBCodeConversionModel(controller);

  // View
  elementsGeneratorView(controller);

  // Controller
  osuApiController(controller);
  eventsController(controller);
  handlersController(controller);
  osuRawHtmlProcessingController(controller);
  renderController(controller);
  canvasUtilsController(controller);
  helperController(controller);
  utilsController(controller);
  authController(controller);

  await controller.init();
  initLibraries(controller);
});
