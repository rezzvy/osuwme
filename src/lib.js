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
    const hasCenterBlock = api.node.parentElement?.closest("center");
    return hasCenterBlock ? api.content : `[centre]${api.content}[/centre]`;
  });

  // Notice
  model.registerBBCodeConversion(".notice", (api) => {
    const hasNoticeBlock = api.node.parentElement?.closest(".notice");
    return hasNoticeBlock ? api.content : `[notice]${api.content}[/notice]%NL%`;
  });

  // Youtube
  model.registerBBCodeConversion("iframe", (api) => {
    return `[youtube]${api.node.dataset.videoId ?? model.getYoutubeVideoId(api.node.src)}[/youtube]`;
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
    const title = api.node.dataset.title ? `${api.node.dataset.title}%NL%${api.content}` : api.content;
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
    if (api.node.matches("a") && model.isOsuProfileLink(api.node.href)) return api.content;
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
    if (api.node.matches("a")) return api.content;
    return `${sizeMaps[size]}${api.content}[/size]`;
  });

  // Link
  model.registerBBCodeConversion("a", (api) => {
    const size = api.node.style.fontSize;
    const sizeMaps = {
      "50%": `[size=50]`,
      "85%": `[size=85]`,
      "100%": `[size=100]`,
      "150%": `[size=150]`,
    };

    let content = api.content;
    let link = decodeURI(api.node.href);

    if (api.node.parentElement.classList.contains("imgmap-container")) {
      link = model.isValidURL(api.node.dataset.link) ? encodeURI(api.node.dataset.link) : "https://google.com";
      const { width, height, top, left } = api.node.style;
      const title = api.node.dataset.bsTitle;
      return `${left.replace("%", "")} ${top.replace("%", "")} ${width.replace("%", "")} ${height.replace("%", "")} ${link} ${title}%NL%`;
    }

    if (model.isOsuProfileLink(link)) {
      if (size) {
        return `${sizeMaps[size]}[profile]${content}[/profile][/size]`;
      }
      return `[profile]${content}[/profile]`;
    }

    if (link.startsWith("mailto:")) {
      if (size) {
        return `${sizeMaps[size]}[email=${link.substring(7)}]${content}[/email][/size]`;
      }
      return `[email=${link.substring(7)}]${content}[/email]`;
    }

    if (size) {
      return `${sizeMaps[size]}[url=${link}]${content}[/url][/size]`;
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

    const isHiding =
      view.menuStickyContainer.classList.contains("pinned") &&
      !el.parentElement?.closest("#list-item-edit-container") &&
      !el.parentElement.closest("#flag-edit-item-container");

    view.toggle(view.menuStickyContainer, "d-none", isHiding);

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

  model.Delta = Quill.import("delta");

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
        handlers: {
          youtube: function () {
            const rawURL = prompt("Youtube URL");
            if (rawURL) {
              const videoID = model.getYoutubeVideoId(rawURL);
              if (videoID) {
                const url = `https://www.youtube.com/embed/${videoID}?feature=oembed`;

                const range = model.getSmartSelection();

                model.quill.insertEmbed(range.index, "video", url);
                model.quill.setSelection(range.index + 1);
              } else {
                alert("Invalid youtube link!");
              }
            }
          },
          profile: function () {
            var username = prompt("Username:");
            if (username) {
              const range = model.getSmartSelection();

              model.quill.insertText(range.index, username, {
                link: `https://osu.ppy.sh/users/${username}`,
              });
              model.quill.setSelection(range.index + username.length + 1);
            }
          },
        },
      },
      clipboard: {
        matchVisual: false,
      },
    },
  });

  model.quill.on("selection-change", (range) => {
    if (range) {
      model.latestSelection = range;
    }
  });

  model.getSmartSelection = () => {
    const current = model.quill.getSelection();
    if (current) return current;

    if (model.latestSelection) return model.latestSelection;

    return { index: model.quill.getLength(), length: 0 };
  };

  view.on(model.quill.root, "click", (e) => {
    model.currentSelectedElement = null;

    const isLink = e.target.matches("a");
    const parentColorEl = e.target.closest('[style*="color:"]');
    const color = e.target.style.color || parentColorEl?.style.color;

    if (view.el("#text-editor-assets").dataset.open === "true") {
      view.html(model.handler.text.countryAssetWrapper, "");
      model.handler.text.cuontryAssetInput.value = "";
    }

    view.toggle(".link-form", "d-none", !isLink);
    view.toggle(".gradient-form", "d-none", true);
    view.toggle(".assets-form", "d-none", true);
    view.dataset("#text-editor-color-gradient", "open", false);
    view.dataset("#text-editor-assets", "open", false);

    if (color) {
      model.pickr.setColor(color);
    }

    if (isLink) {
      view.val(".link-form input", e.target.href);

      view.onInline(".link-form button", "onclick", () => {
        e.target.href = view.val(".link-form input");
        view.toggle(".link-form", "d-none", true);
      });
    }

    if (!e.target.matches("p") && !e.target.matches(".ql-editor")) {
      if (e.target.matches("a") && model.isOsuProfileLink(e.target.href)) return;
      if (model.quill.getSelection()?.length !== 0) return;

      model.currentSelectedElement = parentColorEl && !e.target.matches("p") ? parentColorEl : null;
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

  view.on(".assets-form", "click", (e) => {
    if (e.target.matches(`[data-action="assets"]`)) {
      const range = model.getSmartSelection();

      model.quill.insertEmbed(range.index, "image", e.target.firstElementChild.src);
      model.quill.setSelection(range.index + 1);

      model.latestSelection = { index: range.index + 1, length: 0 };
    }
  });

  view.on("#text-editor-assets", "click", (e) => {
    const state = e.target.dataset.open === "true" ? false : true;
    e.target.dataset.open = state;

    if (!e.target.dataset.isRendered) {
      e.target.dataset.isRendered = "true";
      model.handler.text.renderAssets();
    }

    if (!state) {
      view.html(model.handler.text.countryAssetWrapper, "");
      model.handler.text.cuontryAssetInput.value = "";
    }

    view.toggle(".assets-form", "d-none", !state);
    view.toggle(".gradient-form", "d-none", true);
    view.dataset("#text-editor-color-gradient", "open", false);
  });

  view.on("#text-editor-color-gradient", "click", (e) => {
    if (!model.latestSelection) model.latestSelection = model.getSmartSelection();

    if (model.selectionHasProfileLink()) {
      view.toggle(".gradient-form", "d-none", true);
      return alert("Can't apply gradients when there's a special link (profile link) in the selection.");
    }

    if (view.el("#text-editor-assets").dataset.open === "true") {
      view.html(model.handler.text.countryAssetWrapper, "");
      model.handler.text.cuontryAssetInput.value = "";
    }

    const state = e.target.dataset.open === "true" ? false : true;
    e.target.dataset.open = state;

    view.toggle(".gradient-form", "d-none", !state);
    view.toggle(".assets-form", "d-none", true);
    view.dataset("#text-editor-assets", "open", false);

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

    if (model.currentSelectedElement) {
      model.currentSelectedElement.style.color = hex;
      return;
    }

    if (!model.latestSelection) return;
    model.quill.formatText(model.latestSelection.index, model.latestSelection.length, "color", hex);
  });

  model.pickr.on("show", (color) => {
    const hex = color.toHEXA().toString();

    if (model.currentSelectedElement) {
      model.currentSelectedElement.style.color = hex;
      return;
    }

    if (!model.latestSelection) model.latestSelection = model.getSmartSelection();

    if (model.selectionHasProfileLink()) {
      alert("Can't apply color when there's a special link (profile link) in the selection.");
      model.latestSelection = null;
      model.pickr.hide();
      return;
    }

    if (model.latestSelection) {
      model.quill.formatText(model.latestSelection.index, model.latestSelection.length, "color", hex);
    }
  });

  model.gradientColorStart.on(
    "change",
    controller.debounce((color) => {
      const colorStart = color.toHEXA().toString();
      const colorMiddle = model.gradientColorMiddle.getColor().toHEXA().toString();
      const colorEnd = model.gradientColorEnd.getColor().toHEXA().toString();

      view.colorPickerGradientStart.style.setProperty("--pcr-color", colorStart);

      if (model.latestSelection) {
        controller.formatTextToGradient(model.currentGradient, model.latestSelection, colorStart, colorMiddle, colorEnd);
      }
    }, 50)
  );

  model.gradientColorMiddle.on(
    "change",
    controller.debounce((color) => {
      const colorStart = model.gradientColorStart.getColor().toHEXA().toString();
      const colorMiddle = color.toHEXA().toString();
      const colorEnd = model.gradientColorEnd.getColor().toHEXA().toString();

      view.colorPickerGradientMiddle.style.setProperty("--pcr-color", colorMiddle);

      if (model.latestSelection) {
        controller.formatTextToGradient(model.currentGradient, model.latestSelection, colorStart, colorMiddle, colorEnd);
      }
    }, 50)
  );

  model.gradientColorEnd.on(
    "change",
    controller.debounce((color) => {
      const colorStart = model.gradientColorStart.getColor().toHEXA().toString();
      const colorMiddle = model.gradientColorMiddle.getColor().toHEXA().toString();
      const colorEnd = color.toHEXA().toString();

      view.colorPickerGradientEnd.style.setProperty("--pcr-color", colorEnd);

      if (model.latestSelection) {
        controller.formatTextToGradient(model.currentGradient, model.latestSelection, colorStart, colorMiddle, colorEnd);
      }
    }, 50)
  );
}
