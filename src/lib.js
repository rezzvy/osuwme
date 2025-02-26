export default function initLibraries(controller) {
  const { model, view } = controller;

  /* 
  =========================================
     Mation HTML
  ========================================= 
  */
  model.mation = new MationHTML();
  model.mation.ignoreSelectors = ["._duration", "blockquote > ._source", "._edit"];
  model.mation.noRuleFallback = (api) => api.content;

  // Spacing
  model.registerBBCodeConversion(".spacing-item", (api) => {
    const container = api.node.closest(".canvas-item");
    const prevContainer = container.previousElementSibling;
    const nextContainer = container.nextElementSibling;

    const value = parseInt(api.node.dataset.spacingLevel);
    let level = value > 0 ? value : 1;

    if (prevContainer && nextContainer) {
      const conditions = [
        view.el("ul", prevContainer) && view.el("ul", nextContainer),
        view.el("blockquote", prevContainer) && view.el("blockquote", nextContainer),
      ];

      level += conditions.filter(Boolean).length;
    }

    return `%SPCITM%`.repeat(level);
  });

  // Code
  model.registerBBCodeConversion("code", (api) => {
    if (api.node.classList.contains("inline")) {
      return `[c]${api.content}[/c]`;
    }

    return `[code]${api.node.dataset.raw ? api.node.dataset.raw : api.content}[/code]%NL%`;
  });

  // Spoilerbox / Box
  model.registerBBCodeConversion("details", (api) => {
    const isBox = api.node.dataset.box;

    if (isBox === "true") {
      return `[box=${api.content}[/box]%NL%`;
    }

    return `[spoilerbox]${api.content}[/spoilerbox]%NL%`;
  });

  // Title for Spoilerbox / Box
  model.registerBBCodeConversion("summary", (api) => {
    if (api.node.parentElement.dataset.box === "true") {
      return `${api.content}]`;
    }

    return "";
  });

  // Center
  model.registerBBCodeConversion("center", (api) => {
    return `[centre]${api.content}[/centre]`;
  });

  // Notice
  model.registerBBCodeConversion(".notice", (api) => {
    return `[notice]${api.content}[/notice]%NL%`;
  });

  // Youtube
  model.registerBBCodeConversion("iframe", (api) => {
    return `[youtube]${api.node.dataset.videoId}[/youtube]`;
  });

  // Audio
  model.registerBBCodeConversion(".play-audio-btn", (api) => {
    return `[audio]${api.node.dataset.src}[/audio]`;
  });

  // Image
  model.registerBBCodeConversion("img", (api) => {
    const inline = ["A", "P", "EM", "STRONG", "U", "SPAN", "CODE", "S"];
    if (inline.includes(api.node.parentElement.tagName)) {
      return `[img]${api.node.src}[/img]`;
    }

    return `[img]${api.node.src}[/img]%NL%`;
  });

  // Text
  model.registerBBCodeConversion("p", (api) => {
    return `${api.content}%NL%`;
  });

  // Heading
  model.registerBBCodeConversion(".heading", (api) => {
    return `[heading]${api.content}[/heading]%NL%`;
  });

  // List Item
  model.registerBBCodeConversion("ul", (api) => {
    const isOrdered = api.node.classList.contains("ol");

    if (isOrdered) {
      return `[list=1]%NL%${api.content}[/list]%NL%`;
    }

    return `[list]%NL%${api.content}[/list]%NL%`;
  });

  model.registerBBCodeConversion("ol", (api) => {
    return `[list=1]%NL%${api.content}[/list]%NL%`;
  });

  model.registerBBCodeConversion("li", (api) => {
    const title = api.node.dataset.title ? api.node.dataset.title : api.content;
    const content = title.trim() + "%NL%";

    return `[*]${content}`;
  });

  // Image Map
  model.registerBBCodeConversion(".imgmap-container", (api) => {
    return `[imagemap]%NL%${api.content}[/imagemap]%NL%`;
  });

  model.registerBBCodeConversion(".imgmap-container > img", (api) => {
    return `${api.node.src}%NL%`;
  });

  // Quote
  model.registerBBCodeConversion("blockquote", (api) => {
    const hasSource = api.node.dataset.includeSource;
    const sourceTitle = api.node.dataset.source;

    if (hasSource === "true") {
      return `[quote="${sourceTitle}"]${api.content}[/quote]%NL%`;
    }

    return `[quote]${api.content}[/quote]%NL%`;
  });

  // Inline Styles
  model.registerBBCodeConversion(".inline-splitter", (api) => {
    return api.node.closest("summary") ? "\u00A0" : " ";
  });

  model.registerBBCodeConversion(".spoiler", (api) => {
    return `[spoiler]${api.content}[/spoiler]`;
  });

  model.registerBBCodeConversion('[style*="color:"]', (api) => {
    return `[color=${model.rgbToHex(api.node.style.color)}]${api.content}[/color]`;
  });

  model.registerBBCodeConversion("strong", (api) => {
    return `[b]${api.content}[/b]`;
  });

  model.registerBBCodeConversion("em", (api) => {
    return `[i]${api.content}[/i]`;
  });

  model.registerBBCodeConversion("s", (api) => {
    return `[s]${api.content}[/s]`;
  });

  model.registerBBCodeConversion("u", (api) => {
    return `[u]${api.content}[/u]`;
  });

  model.registerBBCodeConversion('[style*="font-size:"]', (api) => {
    const size = api.node.style.fontSize;
    const sizeMaps = {
      "50%": `[size=50]`,
      "85%": `[size=85]`,
      "100%": `[size=100]`,
      "150%": `[size=150]`,
    };

    return `${sizeMaps[size]}${api.content}[/size]`;
  });

  // Link
  model.registerBBCodeConversion("a", (api) => {
    let content = api.content;
    let link = decodeURI(api.node.href);

    if (api.node.parentElement.classList.contains("imgmap-container")) {
      link = model.isValidURL(api.node.dataset.link) ? encodeURI(api.node.dataset.link) : "https://google.com";

      const { width, height, top, left } = api.node.style;
      const title = api.node.dataset.bsTitle;

      return `${left.replace("%", "")} ${top.replace("%", "")} ${width.replace("%", "")} ${height.replace("%", "")} ${link} ${title}%NL%`;
    }

    if (model.isOsuProfileLink(link)) {
      return `[profile]${content}[/profile]`;
    }

    if (link.startsWith("mailto:")) {
      return `[email=${link.substring(7)}]${content}[/email]`;
    }

    return `[url=${link}]${content}[/url]`;
  });

  // BR
  model.registerBBCodeConversion('[data-spacing="%SPCITM%"]', () => {
    return "%SPCITM%";
  });

  /* 
  =========================================
     Dragula
  ========================================= 
  */

  model.drake = dragula({
    isContainer: (el) => {
      return el.hasAttribute("data-drop") || el.matches("#canvas-wrapper") || el.matches("#canvas-element-list");
    },
    moves: (el, source, handle) => {
      return handle.closest('[data-action="move"]');
    },
    accepts: (el, target) => {
      if (target.matches("#canvas-element-list")) return false;
      if (target.matches("summary") && target.querySelector(".canvas-item:not(.gu-transit)")) return false;
      if (el.matches(".canvas-element-list-btn") && el.dataset.key === "notice" && target.closest(".notice")) return false;
      if (el.matches(".canvas-element-list-btn") && el.dataset.key === "center" && target.closest("center")) return false;
      if (el.querySelector("center") && target.closest("center")) return false;
      if (el.querySelector(".notice") && target.closest(".notice")) return false;
      if (el.contains(target)) return false;

      return true;
    },

    copy: (el, source) => {
      return source.matches("#canvas-element-list");
    },
    revertOnSpill: true,
  });

  model.drake.on("drag", (el) => {
    view.toggle(document.body, "on-grabbing", true);
    if (el.matches(".canvas-element-list-btn")) return;

    view.toggle(view.menuStickyContainer, "d-none", view.menuStickyContainer.classList.contains("pinned"));

    const selectedItems = view.els(".canvas-item.selected");

    const obj = (element) => {
      return {
        action: "move",
        element: element,
        container: element.parentElement,
        sibling: element.nextSibling,
        targetContainer: null,
        targetSibling: null,
      };
    };

    if (selectedItems.length !== 0 && el.classList.contains("selected")) {
      selectedItems.forEach((item) => model.history.stack.tempMoveData.push(obj(item)));
    } else {
      model.history.stack.tempMoveData.push(obj(el));
    }
  });

  model.drake.on("cancel", () => {
    if (model.history.stack.tempMoveData) model.history.stack.tempMoveData.length = 0;
  });

  model.drake.on("dragend", (el) => {
    view.toggle(document.body, "on-grabbing", false);
    view.toggle(view.menuStickyContainer, "d-none", false);

    view._updateStickyState();
  });

  model.drake.on("shadow", (el) => {
    if (!el.matches(".canvas-element-list-btn")) return;

    el.classList.add("pe-none");
    el.style.dispay = "block";
    el.style.width = "100%";
  });

  model.drake.on("drop", (el, target, source, sibling) => {
    if (el.matches(".canvas-element-list-btn")) {
      const { key, editable } = el.dataset;
      const canvasItem = controller.renderToCanvas(key, editable, model.uniqueID, false);

      target.insertBefore(canvasItem, sibling);

      view.remove(el);

      controller.pushHistory("undo", {
        action: "add",
        element: canvasItem,
        container: target,
        sibling: sibling,
      });
    }

    if (model.history.stack.tempMoveData.length !== 0) {
      const nodes = model.history.stack.tempMoveData.map((item) => item.element);

      for (let i = model.history.stack.tempMoveData.length - 1; i >= 0; i--) {
        const currentNode = model.history.stack.tempMoveData[i].element;

        if (nodes.some((otherNode) => otherNode !== currentNode && otherNode.contains(currentNode))) {
          currentNode.classList.remove("selected");
          model.history.stack.tempMoveData.splice(i, 1);
        }
      }

      model.history.stack.tempMoveData.forEach((item) => {
        target.insertBefore(item.element, sibling && sibling.parentNode === target ? sibling : null);

        item.element.classList.remove("selected");
        item.targetContainer = target;
        item.targetSibling = sibling;
      });

      controller.pushHistory("undo", [...model.history.stack.tempMoveData]);
      model.history.stack.tempMoveData.length = 0;
    }

    view.replaceContainerPlaceHolder(model.isNodeEmpty(source), source, target);
  });

  /* 
  =========================================
     Quill
  ========================================= 
  */

  const FontSize = Quill.import("attributors/style/size");
  FontSize.whitelist = ["50%", "85%", "100%", "150%"];

  const inlineCodeBlot = model.createInlineBlot({
    blotName: "inlinecode",
    tagName: "code",
    className: "inline",
  });

  const spoilerBlot = model.createInlineBlot({
    blotName: "spoiler",
    tagName: "span",
    className: "spoiler",
  });

  Quill.register(inlineCodeBlot);
  Quill.register(spoilerBlot);
  Quill.register(FontSize, true);

  model.quill = new Quill("#text-editor", {
    modules: {
      toolbar: {
        container: "#text-editor-toolbar",
      },
      clipboard: {
        matchVisual: false,
      },
    },
  });

  view.on(model.quill.root, "click", (e) => {
    model.latestSelection = null;

    const isLink = e.target.matches("a");
    const color = e.target.style.color;

    view.toggle(".link-form", "d-none", !isLink);
    view.toggle(".gradient-form", "d-none", true);
    view.dataset("#text-editor-color-gradient", "open", false);

    if (color) {
      model.pickr.setColor(color);
    } else {
      model.pickr.setColor("#fff");
    }

    if (isLink) {
      view.val(".link-form input", e.target.href);

      view.onInline(".link-form button", "onclick", () => {
        e.target.href = view.val(".link-form input");
        view.toggle(".link-form", "d-none", true);
      });
    }
  });

  model.quill.getModule("toolbar").addHandler("link", (value) => {
    const inputLink = document.querySelector('.link-form input[type="text"]');
    const range = model.quill.getSelection();

    if (value && range) {
      view.val(".link-form input", "");
      view.toggle(".link-form", "d-none", false);

      view.onInline(".link-form button", "onclick", () => {
        model.quill.format("link", inputLink.value);
        view.toggle(".link-form", "d-none", true);

        const currentFormats = model.quill.getFormat(range);
        if (currentFormats.color) {
          model.quill.format("color", false);
        }
      });

      return;
    }

    model.quill.format("link", false);
  });

  model.quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node) => {
    const Delta = Quill.import("delta");

    const format = (el) => {
      const obj = {};

      if (el.tagName === "STRONG") obj.bold = true;
      if (el.tagName === "EM") obj.italic = true;
      if (el.tagName === "U") obj.underline = true;
      if (el.tagName === "S") obj.strike = true;
      if (el.tagName === "A") obj.link = el.getAttribute("href");
      if (el.style.fontSize) obj.size = el.style.fontSize;
      if (el.style.color) obj.color = el.style.color;

      return obj;
    };

    if (node.tagName === "IMG") return new Delta().insert({ image: node.getAttribute("src") });
    return new Delta().insert(node.innerText || "", { ...format(node) });
  });

  model.quill.on("text-change", function () {
    view.toggle(".link-form", "d-none", true);
  });

  view.on("#text-editor-color-gradient", "click", (e) => {
    if (!model.latestSelection) model.latestSelection = model.quill.getSelection();

    if (model.selectionHasLink()) {
      view.toggle(".gradient-form", "d-none", true);
      return alert("Cant gradient color when there's link in selection");
    }

    const state = e.target.dataset.open === "true" ? false : true;
    e.target.dataset.open = state;

    view.toggle(".gradient-form", "d-none", !state);

    const colorStart = model.gradientColorStart.getColor().toHEXA().toString();
    const colorMiddle = model.gradientColorMiddle.getColor().toHEXA().toString();
    const colorEnd = model.gradientColorEnd.getColor().toHEXA().toString();

    controller.formatTextToGradient(model.currentGradient, model.latestSelection, colorStart, colorMiddle, colorEnd);
  });

  /* 
  =========================================
     Pickr
  ========================================= 
  */

  const pickrComponents = {
    preview: true,
    opacity: false,
    hue: true,
    interaction: { input: true },
  };

  model.pickr = Pickr.create({
    el: "#text-editor-color-picker",
    theme: "nano",
    default: "#ff66ab",
    components: pickrComponents,
  });

  model.gradientColorStart = Pickr.create({
    el: "#gradient-color-start",
    theme: "nano",
    default: "#00ECFF",
    components: pickrComponents,
  });

  model.gradientColorMiddle = Pickr.create({
    el: "#gradient-color-middle",
    theme: "nano",
    default: "#FF00E5",
    components: pickrComponents,
  });

  model.gradientColorEnd = Pickr.create({
    el: "#gradient-color-end",
    theme: "nano",
    default: "#FDD205",
    components: pickrComponents,
  });

  view.colorPickerSolid = model.pickr.getRoot().button;
  view.colorPickerGradientStart = model.gradientColorStart.getRoot().button;
  view.colorPickerGradientMiddle = model.gradientColorMiddle.getRoot().button;
  view.colorPickerGradientEnd = model.gradientColorEnd.getRoot().button;

  model.pickr.on("change", (color) => {
    const hex = color.toHEXA().toString();

    view.colorPickerSolid.style.setProperty("--pcr-color", hex);

    if (!model.latestSelection) return;
    model.quill.formatText(model.latestSelection.index, model.latestSelection.length, "color", hex);
  });

  model.pickr.on("show", (color) => {
    const hex = color.toHEXA().toString();
    if (!model.latestSelection) model.latestSelection = model.quill.getSelection();
    if (model.selectionHasLink()) {
      model.pickr.hide();
      return alert("Cant apply color when there's link in selection");
    }

    model.quill.formatText(model.latestSelection.index, model.latestSelection.length, "color", hex);
  });

  model.gradientColorStart.on("change", (color) => {
    const colorStart = color.toHEXA().toString();
    const colorMiddle = model.gradientColorMiddle.getColor().toHEXA().toString();
    const colorEnd = model.gradientColorEnd.getColor().toHEXA().toString();

    view.colorPickerGradientStart.style.setProperty("--pcr-color", colorStart);

    if (model.latestSelection) {
      controller.formatTextToGradient(model.currentGradient, model.latestSelection, colorStart, colorMiddle, colorEnd);
    }
  });

  model.gradientColorMiddle.on("change", (color) => {
    const colorStart = model.gradientColorStart.getColor().toHEXA().toString();
    const colorMiddle = color.toHEXA().toString();
    const colorEnd = model.gradientColorEnd.getColor().toHEXA().toString();

    view.colorPickerGradientMiddle.style.setProperty("--pcr-color", colorMiddle);

    if (model.latestSelection) {
      controller.formatTextToGradient(model.currentGradient, model.latestSelection, colorStart, colorMiddle, colorEnd);
    }
  });

  model.gradientColorEnd.on("change", (color) => {
    const colorStart = model.gradientColorStart.getColor().toHEXA().toString();
    const colorMiddle = model.gradientColorMiddle.getColor().toHEXA().toString();
    const colorEnd = color.toHEXA().toString();

    view.colorPickerGradientEnd.style.setProperty("--pcr-color", colorEnd);

    if (model.latestSelection) {
      controller.formatTextToGradient(model.currentGradient, model.latestSelection, colorStart, colorMiddle, colorEnd);
    }
  });
}
