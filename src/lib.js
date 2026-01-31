export default function initLibraries(controller) {
  const { model, view } = controller;
  model.isInsideTextEditor = false;
  model.isEmojiRendered = false;

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
    if (el.closest(".canvas-element-list-btn, .list-item, .flag-item, .order-item, .font-size-item")) return;

    const isHiding =
      view.menuStickyContainer.classList.contains("pinned") &&
      !el.parentElement?.closest("#list-item-edit-container") &&
      !el.parentElement.closest("#flag-edit-item-container") &&
      !el.parentElement.closest("#order-container") &&
      !el.parentElement.closest("#define-font-size-item-container");

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
    if (el.closest(".list-item, .flag-item, .order-item, .font-size-item")) return;

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
     Emoji Thingy
  ========================================= 
  */

  const initEmojiThingy = () => {
    if (model.isEmojiRendered) return;

    model.emojiMart = new EmojiMart.Picker({
      set: "native",
      locale: "en",
      theme: "dark",
      dynamicWidth: true,
      previewPosition: "none",
      onEmojiSelect: (emoji) => {
        const range = model.getSmartSelection();
        model.quill.updateContents([
          { retain: range.index },
          {
            insert: emoji.native,
          },
        ]);
        model.quill.setSelection(range.index + emoji.native.length);

        view.toggle("#emoji-picker-container", "d-none", true);
      },
    });

    view.append("#emoji-picker-container", model.emojiMart);
    view.toggle("#emoji-picker-container", "d-none", true);
  };

  /* 
  =========================================
     Quill
  ========================================= 
  */

  const FANCY_NORMAL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const FANCY_MAPS = {
    boldscript: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃0123456789",
    double: "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡",
    circles: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ0①②③④⑤⑥⑦⑧⑨",
    squares: "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉0123456789",
    monospace: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿",
  };

  const normalizeFancy = (text) => {
    return [...text]
      .map((char) => {
        for (const [key, mapString] of Object.entries(FANCY_MAPS)) {
          const mapArray = [...mapString];
          const index = mapArray.indexOf(char);

          if (index !== -1) {
            return FANCY_NORMAL[index] || char;
          }
        }
        return char;
      })
      .join("");
  };

  const transformToFancy = (text, type) => {
    const cleanText = normalizeFancy(text);

    if (!type || !FANCY_MAPS[type]) return cleanText;

    const targetChars = [...FANCY_MAPS[type]];

    return [...cleanText]
      .map((char) => {
        const index = FANCY_NORMAL.indexOf(char);
        return index !== -1 ? targetChars[index] || char : char;
      })
      .join("");
  };

  // divider

  const getLinkBlotAt = (index) => {
    const [leaf] = model.quill.getLeaf(index);
    let blot = leaf;

    while (blot && blot.domNode?.tagName !== "A") {
      blot = blot.parent === model.quill.scroll ? null : blot.parent;
    }

    return blot;
  };

  const updateLinkFormState = (range) => {
    if (!range) {
      if (!document.activeElement?.closest(".link-form")) {
        view.toggle(".link-form", "d-none", true);
      }
      return;
    }

    const formats = model.quill.getFormat(range);
    const color = formats.color;

    if (color && !Array.isArray(color) && model.isInsideTextEditor && !formats["spacing-color"]) model.pickr.setColor(color);

    const link = formats.link;
    view.toggle(".link-form", "d-none", !link);

    if (!link) return;

    view.val(".link-form input", link);
  };

  model.Delta = Quill.import("delta");

  const FontSize = Quill.import("attributors/style/size");
  FontSize.whitelist = Array.from({ length: 151 }, (_, i) => `${50 + i}%`);

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

  const Parchment = Quill.import("parchment");

  const SpacingColor = new Parchment.Attributor("spacing-color", "data-spacing-color", {
    scope: Parchment.Scope.INLINE,
  });

  Quill.register(SpacingColor, true);

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

                model.quill.updateContents({
                  ops: [{ retain: range.index }, { insert: { video: url } }],
                });
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
              model.quill.updateContents([
                { retain: range.index },
                {
                  insert: username,
                  attributes: {
                    link: `https://osu.ppy.sh/users/${username}`,
                  },
                },
              ]);
              model.quill.setSelection(range.index + username.length);
            }
          },
          link: function (value) {
            const range = model.quill.getSelection();
            const formats = model.quill.getFormat(range);
            const linkValue = formats.link;

            if (linkValue && range.length === 0) return;

            if (range) {
              if (value) {
                view.toggle(".link-form", "d-none", false);

                const input = document.querySelector(".link-form input");
                if (input) {
                  input.value = "";
                  input.focus();
                }
              } else {
                model.quill.format("link", false);
                view.toggle(".link-form", "d-none", true);
              }
            }
          },
          emoji: function () {
            if (!model.isEmojiRendered) {
              initEmojiThingy();
              model.isEmojiRendered = true;
            }

            const container = view.el("#emoji-picker-container");
            view.toggle(container, "d-none", !container.classList.contains("d-none"));

            view.toggle(".gradient-form", "d-none", true);
            view.toggle(".assets-form", "d-none", true);
            view.dataset("#text-editor-color-gradient", "open", false);
            view.dataset("#text-editor-assets", "open", false);
          },
          fancyfont: function (value) {
            const range = model.quill.getSelection();
            if (!range || range.length === 0) return;

            const contents = model.quill.getContents(range.index, range.length);

            let hasChanges = false;

            contents.ops.forEach((op) => {
              if (typeof op.insert === "string") {
                const original = op.insert;
                const transformed = transformToFancy(original, value);

                if (original !== transformed) {
                  op.insert = transformed;
                  hasChanges = true;
                }
              }
            });

            if (hasChanges) {
              model.quill.deleteText(range.index, range.length, "api");

              const Delta = Quill.import("delta");
              const updateDelta = new Delta().retain(range.index).concat(contents);

              model.quill.updateContents(updateDelta, "api");

              const newLength = contents.length();
              model.quill.setSelection(range.index, newLength);
            }
          },
        },
      },
      clipboard: {
        matchVisual: false,
      },
    },
  });

  view.onInline(".link-form button", "onclick", () => {
    const range = model.quill.getSelection() || model.latestSelection;
    if (!range) return;

    const newLink = view.val(".link-form input");

    if (range.length === 0) {
      const blot = getLinkBlotAt(range.index);
      if (blot) {
        model.quill.setSelection(model.quill.getIndex(blot), blot.length());
      } else {
        model.quill.focus();
      }
    } else {
      model.quill.focus();
    }

    model.quill.format("link", newLink || false);

    if (newLink && model.quill.getFormat().color) {
      model.quill.format("color", false);
    }

    view.toggle(".link-form", "d-none", true);
  });

  model.quill.on("selection-change", (range, oldRange, source) => {
    if (range) {
      model.latestSelection = range;
    }

    updateLinkFormState(range);
  });

  model.quill.on("text-change", () => {
    const range = model.quill.getSelection();
    if (!range) return;

    const index = Math.min(range.index + 1, model.quill.getLength() - 1);
    const formats = model.quill.getFormat(index);

    view.toggle(".link-form", "d-none", !formats.link);
  });

  model.getSmartSelection = () => {
    const current = model.quill.getSelection();
    if (current) return current;

    if (model.latestSelection) return model.latestSelection;

    return { index: model.quill.getLength(), length: 0 };
  };

  view.on(model.quill.root, "click", (e) => {
    model.isInsideTextEditor = true;
    model.currentSelectedElement = null;

    view.toggle("#emoji-picker-container", "d-none", true);

    if (view.el("#text-editor-assets").dataset.open === "true") {
      view.html(model.handler.text.countryAssetWrapper, "");
      model.handler.text.cuontryAssetInput.value = "";
    }

    if (!e.target.closest(".link-form")) {
      view.toggle(".gradient-form", "d-none", true);
      view.toggle(".assets-form", "d-none", true);
      view.dataset("#text-editor-color-gradient", "open", false);
      view.dataset("#text-editor-assets", "open", false);
    }

    if (!e.target.matches("p") && !e.target.matches(".ql-editor")) {
      if (e.target.matches("a") && model.isOsuProfileLink(e.target.href)) return;
      if (model.quill.getSelection()?.length !== 0) return;

      const colorElement = e.target.closest('[style*="color:"]');
      model.currentSelectedElement = colorElement;
    }
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

  view.on(".assets-form", "click", (e) => {
    if (e.target.matches(`[data-action="assets"]`)) {
      const range = model.getSmartSelection();
      const url = e.target.firstElementChild.src;

      model.quill.updateContents({
        ops: [{ retain: range.index }, { insert: { image: url } }],
      });

      model.quill.setSelection(range.index + 1);
      model.latestSelection = { index: range.index + 1, length: 0 };

      view.toggle(".assets-form", "d-none", true);
      view.dataset("#text-editor-assets", "open", false);
    }
  });

  view.on("#text-editor-assets", "click", (e) => {
    model.isInsideTextEditor = false;

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
    view.toggle("#emoji-picker-container", "d-none", true);
    view.dataset("#text-editor-color-gradient", "open", false);
  });

  view.on("#text-editor-color-gradient", "click", (e) => {
    model.isInsideTextEditor = false;

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
    view.toggle("#emoji-picker-container", "d-none", true);
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
    opacity: true,
    hue: true,
    interaction: {
      hex: true,
      rgba: true,
      hsva: true,
      hsla: true,
      cmyk: true,
      input: true,
    },
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
    if (model.isInsideTextEditor) return;

    view.colorPickerSolid.style.setProperty("--pcr-color", hex);

    if (model.currentSelectedElement) {
      model.currentSelectedElement.style.color = hex;
      return;
    }

    if (!model.latestSelection) return;
    model.quill.formatText(model.latestSelection.index, model.latestSelection.length, "color", hex);
  });

  model.pickr.on("show", (color) => {
    model.isInsideTextEditor = false;

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
    }, 50),
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
    }, 50),
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
    }, 50),
  );

  // Divider

  model.optimizer = new Normalizer({
    targetSelector: "._content > p, ._content > ol > li, ._content > h2",
    tagsToMerge: ["strong", "em", "s", "u", "span", "code"],
    stylesToHoist: ["font-size"],
    stylesToPushDown: ["color"],
  });
}
