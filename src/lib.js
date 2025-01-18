export default function initLibraries(controller) {
  const { model, view } = controller;

  /* 
  =========================================
     Mation HTML
  ========================================= 
  */
  model.mation = new MationHTML();
  model.mation.ignoreSelectors = ["._duration", "blockquote > ._source"];
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

  // Empty Content
  model.registerBBCodeConversion("._content > p > *", (api) => {
    const text = api.node.textContent;
    if (text.trim() !== "") return api.content;

    return "&nbsp;" + api.node.textContent;
  });

  // Code
  model.registerBBCodeConversion("code", (api) => {
    if (api.node.classList.contains("inline")) {
      return `[c]${api.content}[/c]`;
    }

    return `[code]${api.content}[/code]%NL%`;
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

  model.registerBBCodeConversion("li", (api) => {
    const content = api.node.dataset.title.trim() ? "%NL%" + api.content : api.content;

    return `[*]${api.node.dataset.title} ${content}`;
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

  model.drake.on("dragend", (el) => {
    if (!el.matches(".canvas-element-list-btn")) return;

    if (view.el("#canvas-wrapper-ph").classList.contains("d-none") && model.isNodeEmpty("#canvas-wrapper")) {
      view.toggle(view.canvasWrapperPhElement, "d-none", false);
    }
  });

  model.drake.on("shadow", (el) => {
    if (!el.matches(".canvas-element-list-btn")) return;

    if (!view.el("#canvas-wrapper-ph").classList.contains("d-none")) {
      view.toggle("#canvas-wrapper-ph", "d-none", true);
    }

    el.style.dispay = "block";
    el.style.width = "100%";
  });

  model.drake.on("drop", (el, target, source, sibling) => {
    if (el.matches(".canvas-element-list-btn")) {
      const { key, editable } = el.dataset;
      const canvasItem = controller.renderToCanvas(key, editable, model.uniqueID, false);

      target.insertBefore(canvasItem, sibling);

      if ((target.matches("summary") || target.matches("details")) && !model.isNodeEmpty(target, 2)) view.remove(canvasItem);
      view.remove(el);
    }

    if (target.classList.contains("ph")) view.toggle(target, "ph", false);
    view.toggle(source, "ph", model.isNodeEmpty(source) && !source.matches("li") && !source.matches("summary"));
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

  model.quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
    const Delta = Quill.import("delta");

    if (node.tagName === "IMG") {
      return new Delta().insert({ image: node.getAttribute("src") });
    }

    if (node.tagName === "A") {
      const href = node.getAttribute("href");
      const text = node.innerText || href;
      return new Delta().insert(text, { link: href });
    }

    return new Delta().insert(node.innerText || "");
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
    const colorEnd = model.gradientColorEnd.getColor().toHEXA().toString();

    controller.formatTextToGradient(model.latestSelection, colorStart, colorEnd);
  });

  /* 
  =========================================
     Pickr
  ========================================= 
  */

  const pickrComponents = {
    preview: true,
    opacity: true,
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

  model.gradientColorEnd = Pickr.create({
    el: "#gradient-color-end",
    theme: "nano",
    default: "#FDD205",
    components: pickrComponents,
  });

  model.pickr.on("change", (color) => {
    const hex = color.toHEXA().toString();
    model.pickr.getRoot().button.style.setProperty("--pcr-color", hex);

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
    const colorEnd = model.gradientColorEnd.getColor().toHEXA().toString();

    model.gradientColorStart.getRoot().button.style.setProperty("--pcr-color", colorStart);

    if (model.latestSelection) {
      controller.formatTextToGradient(model.latestSelection, colorStart, colorEnd);
    }
  });

  model.gradientColorEnd.on("change", (color) => {
    const colorStart = model.gradientColorStart.getColor().toHEXA().toString();
    const colorEnd = color.toHEXA().toString();

    model.gradientColorEnd.getRoot().button.style.setProperty("--pcr-color", colorEnd);

    if (model.latestSelection) {
      controller.formatTextToGradient(model.latestSelection, colorStart, colorEnd);
    }
  });
}
