export default function initLibraries(controller) {
  /* =========================================
       Mation HTML
       ========================================= */
  controller.model.mation = new MationHTML();
  controller.model.mation.ignoreSelectors = ["summary", "._duration", "blockquote > ._source"];
  controller.model.mation.noRuleFallback = (api) => {
    return api.content;
  };

  controller.model.mation.register([
    {
      selector: ".spacing-item",
      format: (api) => {
        const container = api.node.closest(".canvas-item");
        const prevContainer = container.previousElementSibling;
        const nextContainer = container.nextElementSibling;

        const value = parseInt(api.node.dataset.spacingLevel);
        let level = value > 0 ? value : 1;

        if (prevContainer && nextContainer) {
          if (prevContainer.querySelector("ul") && nextContainer.querySelector("ul")) {
            level += 1;
          }

          if (prevContainer.querySelector("blockquote") && nextContainer.querySelector("blockquote")) {
            level += 1;
          }
        }

        return `%SPCITM%`.repeat(level);
      },
    },

    {
      selector: "p",
      format: (api) => `${api.content}%NL%`,
    },

    {
      selector: ".notice",
      format: (api) => `[notice]${api.content}[/notice]%NL%`,
    },
    {
      selector: "center",
      format: (api) => {
        return `[centre]${api.content}[/centre]`;
      },
    },
    {
      selector: "iframe",
      format: (api) => `[youtube]${api.node.dataset.videoId}[/youtube]`,
    },
    {
      selector: ".play-audio-btn",
      format: (api) => `[audio]${api.node.dataset.audioUrl ? api.node.dataset.audioUrl : "about:blank"}[/audio]`,
    },
    {
      selector: "img",
      format: (api) => {
        const inline = ["A", "P", "EM", "STRONG", "U", "SPAN", "CODE", "S"];
        if (inline.includes(api.node.parentElement.tagName)) {
          return `[img]${api.node.src}[/img]`;
        }

        return `[img]${api.node.src}[/img]%NL%`;
      },
    },
    {
      selector: ".heading",
      format: (api) => `[heading]${api.content}[/heading]%NL%`,
    },
    {
      selector: "strong",
      format: (api) => `[b]${api.content}[/b]`,
    },
    {
      selector: "em",
      format: (api) => `[i]${api.content}[/i]`,
    },
    {
      selector: "s",
      format: (api) => `[s]${api.content}[/s]`,
    },
    {
      selector: "u",
      format: (api) => `[u]${api.content}[/u]`,
    },
    {
      selector: ".spoiler",
      format: (api) => `[spoiler]${api.content}[/spoiler]`,
    },
    {
      selector: "code",
      format: (api) => {
        if (api.node.classList.contains("inline")) {
          return `[c]${api.content}[/c]`;
        }

        return `[code]${api.content}[/code]%NL%`;
      },
    },
    {
      selector: ".imgmap-container",
      format: (api) => `[imagemap]%NL%${api.content}[/imagemap]%NL%`,
    },
    {
      selector: ".imgmap-container > img",
      format: (api) => `${api.node.src}%NL%`,
    },
    {
      selector: "ul",
      format: (api) => {
        const isOrdered = api.node.classList.contains("ol");

        if (isOrdered) {
          return `[list=1]%NL%${api.content}[/list]%NL%`;
        }

        return `[list]%NL%${api.content}[/list]%NL%`;
      },
    },
    {
      selector: "li",
      format: (api) => {
        const content = api.node.dataset.title.trim() ? "%NL%" + api.content : api.content;

        return `[*]${api.node.dataset.title} ${content}`;
      },
    },
    {
      selector: "a",
      format: (api) => {
        const link = controller.model.isValidURL(api.node.href) ? decodeURIComponent(api.node.href) : "https://google.com";

        if (api.node.parentElement.classList.contains("imgmap-container")) {
          const width = api.node.style.width.replace("%", "");
          const height = api.node.style.height.replace("%", "");
          const top = api.node.style.top.replace("%", "");
          const left = api.node.style.left.replace("%", "");
          const title = api.node.dataset.bsTitle;

          return `${left} ${top} ${width} ${height} ${link} ${title}%NL%`;
        }

        if (/^https:\/\/osu\.ppy\.sh\/users\/[a-zA-Z][a-zA-Z0-9\s-_]*[a-zA-Z0-9]$/.test(link)) {
          return `[profile]${api.content}[/profile]`;
        }

        const renderableAsEmail = link.startsWith("mailto:");
        if (renderableAsEmail) {
          return `[email=${link.substring(7)}]${api.content}[/email]`;
        }

        return `[url=${link}]${api.content}[/url]`;
      },
    },
    {
      selector: '[style*="color:"]',
      format: (api) => {
        const content = api.node.textContent;
        if (api.node.textContent.trim() === "") {
          return " " + content;
        }

        return `[color=${controller.model.rgbToHex(api.node.style.color)}]${api.content}[/color]`;
      },
    },
    {
      selector: '[style*="font-size:"]',
      format: (api) => {
        const size = api.node.style.fontSize;
        const sizeMaps = {
          "50%": `[size=50]`,
          "85%": `[size=85]`,
          "100%": `[size=100]`,
          "150%": `[size=150]`,
        };

        return `${sizeMaps[size]}${api.content}[/size]`;
      },
    },
    {
      selector: "blockquote",
      format: (api) => {
        const hasSource = api.node.dataset.includeSource;
        const sourceTitle = api.node.dataset.source;

        if (hasSource === "true") {
          return `[quote="${sourceTitle}"]${api.content}[/quote]%NL%`;
        }

        return `[quote]${api.content}[/quote]%NL%`;
      },
    },
    {
      selector: "details",
      format: (api) => {
        const title = api.node.dataset.title;
        const isBox = api.node.dataset.box;

        if (isBox === "true") {
          return `[box=${title}]${api.content}[/box]%NL%`;
        }

        return `[spoilerbox]${api.content}[/spoilerbox]%NL%`;
      },
    },
    {
      selector: '[data-spacing="%SPCITM%"]',
      format: (api) => `%SPCITM%`,
    },
  ]);

  /* =========================================
       DRAGULA
       ========================================= */
  controller.model.drake = dragula({
    isContainer: (el) => {
      return el.hasAttribute("data-drop") || el.matches("#canvas-wrapper") || el.matches("#canvas-element-list");
    },
    moves: (el, source, handle) => {
      return handle.closest('[data-action="move"]');
    },
    accepts: (el, target) => {
      if (target.matches("#canvas-element-list")) {
        return false;
      }

      if (el.querySelector("center") && target.closest("center")) {
        return false;
      }

      if (el.querySelector(".notice") && target.closest(".notice")) {
        return false;
      }

      if (el.contains(target)) {
        return false;
      }

      return true;
    },
    revertOnSpill: true,
    copy: (el, source) => {
      if (source.matches("#canvas-element-list")) {
        return true;
      }

      return false;
    },
  });

  controller.model.drake.on("shadow", (el, container, source) => {
    el.style.dispay = "block";
    el.style.width = "100%";
  });

  controller.model.drake.on("drop", (el, target, source, sibling) => {
    if (el.matches(".canvas-element-list-btn")) {
      const canvasSkeleton = controller.canvasElementListButtonHandler(el, false);

      target.insertBefore(canvasSkeleton, sibling);

      el.remove();

      controller.view.toggleCanvasPlaceHolder(false);
    }

    if (target.classList.contains("ph")) {
      target.classList.remove("ph");
    }

    if (source.children.length === 0 && source.tagName !== "LI") {
      source.classList.add("ph");
    }
  });

  /* =========================================
   QUIL JS
   ========================================= */
  const Inline = Quill.import("blots/inline");
  const FontSize = Quill.import("attributors/style/size");
  FontSize.whitelist = ["50%", "85%", "100%", "150%"];

  class CodeBlot extends Inline {
    static create(value) {
      let node = super.create(value);
      node.classList.add("inline");
      return node;
    }

    static formats(node) {
      return node.classList.contains("inline");
    }
  }

  class SpoilerBlot extends Inline {
    static create(value) {
      let node = super.create(value);
      node.classList.add("spoiler");
      return node;
    }

    static formats(node) {
      return node.classList.contains("spoiler");
    }
  }

  CodeBlot.blotName = "inlinecode";
  CodeBlot.tagName = "code";
  CodeBlot.className = "inline";
  SpoilerBlot.blotName = "spoiler";
  SpoilerBlot.tagName = "span";
  SpoilerBlot.className = "spoiler";

  Quill.register(SpoilerBlot);
  Quill.register(CodeBlot);
  Quill.register(FontSize, true);

  controller.model.quill = new Quill("#text-editor", {
    modules: {
      toolbar: {
        container: "#text-editor-toolbar",
      },
      clipboard: {
        matchVisual: false,
      },
    },
  });

  controller.model.quill.clipboard.addMatcher(Node.ELEMENT_NODE, function (node, delta) {
    var Delta = Quill.import("delta");

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

  controller.model.quill.on("text-change", function () {
    const linkFormCostum = document.querySelector(".link-form");
    linkFormCostum.classList.toggle("d-none", true);
  });

  controller.model.quill.root.addEventListener("click", function (event) {
    const color = event.target.style.color;
    controller.model.latestSelection = null;

    if (color !== "") {
      controller.model.pickr.setColor(color);
    }

    const linkFormCostum = document.querySelector(".link-form");
    const gradientForm = document.querySelector(".gradient-form");
    const saveButton = linkFormCostum.querySelector("button");

    document.getElementById("text-editor-color-gradient").dataset.open = "false";
    gradientForm.classList.toggle("d-none", true);

    const a = event.target.closest("a");
    linkFormCostum.classList.toggle("d-none", !a);
    if (!a) return;

    const inputLink = linkFormCostum.querySelector('input[type="text"]');
    inputLink.value = a.href;

    saveButton.onclick = () => {
      a.href = inputLink.value;
      linkFormCostum.classList.toggle("d-none", true);
    };
  });

  controller.model.quill.getModule("toolbar").addHandler("link", (value) => {
    const linkFormCostum = document.querySelector(".link-form");
    const inputLink = linkFormCostum.querySelector('input[type="text"]');
    const saveButton = linkFormCostum.querySelector("button");
    inputLink.value = "";

    if (value) {
      const range = controller.model.quill.getSelection();
      if (range && range.length !== 0) {
        linkFormCostum.classList.toggle("d-none", false);

        saveButton.onclick = () => {
          controller.model.quill.format("link", inputLink.value);
          linkFormCostum.classList.toggle("d-none", true);
        };
      }
    } else {
      controller.model.quill.format("link", false);
    }
  });

  document.getElementById("text-editor-color-gradient").addEventListener("click", (e) => {
    document.body.classList.add("select-costum");

    const gradientForm = document.querySelector(".gradient-form");
    controller.model.latestSelection = controller.model.quill.getSelection();

    const state = e.target.dataset.open === "true" ? false : true;
    e.target.dataset.open = state;

    gradientForm.classList.toggle("d-none", !state);

    const colorStart = controller.model.gradientColorStart.getColor().toHEXA().toString();
    const colorEnd = controller.model.gradientColorEnd.getColor().toHEXA().toString();

    controller.model.formatTextToGradient(colorStart, colorEnd);
  });

  /* =========================================
       PICKR JS
       ========================================= */
  controller.model.pickr = Pickr.create({
    el: "#text-editor-color-picker",
    theme: "nano",
    default: "#ff66ab",
    components: {
      preview: true,
      opacity: true,
      hue: true,
      interaction: {
        input: true,
      },
    },
  });

  controller.model.pickr.on("show", (color) => {
    controller.model.latestSelection = controller.model.quill.getSelection();

    const hexColor = color.toHEXA().toString();
    document.body.classList.add("select-costum");

    const range = controller.model.latestSelection;
    if (range) {
      controller.model.quill.formatText(range.index, range.length, "color", hexColor);
    }
  });

  controller.model.pickr.on("hide", () => {
    document.body.classList.remove("select-costum");
    controller.model.latestSelection = null;
  });

  controller.model.pickr.on("change", (color) => {
    const hex = color.toHEXA().toString();
    controller.model.pickr.getRoot().button.style.setProperty("--pcr-color", hex);

    if (!controller.model.latestSelection) return;

    for (let i = controller.model.latestSelection.index; i < controller.model.latestSelection.index + controller.model.latestSelection.length; i++) {
      const charFormat = controller.model.quill.getFormat(i, 1);
      if (charFormat.link) {
        controller.model.latestSelection = null;
        alert("Color cannot be applied while there is a link in the selected text.");
        return;
      }
    }

    if (controller.model.latestSelection) {
      const range = controller.model.latestSelection;
      controller.model.quill.formatText(range.index, range.length, "color", hex);
    }
  });

  controller.model.gradientColorStart = Pickr.create({
    el: "#gradient-color-start",
    theme: "nano",
    default: "#00ECFF",
    components: {
      preview: true,
      opacity: true,
      hue: true,
      interaction: {
        input: true,
      },
    },
  });

  controller.model.gradientColorEnd = Pickr.create({
    el: "#gradient-color-end",
    theme: "nano",
    default: "#FDD205",
    components: {
      preview: true,
      opacity: true,
      hue: true,
      interaction: {
        input: true,
      },
    },
  });

  controller.model.gradientColorStart.on("change", (color) => {
    const colorStart = color.toHEXA().toString();
    controller.model.gradientColorStart.getRoot().button.style.setProperty("--pcr-color", colorStart);

    if (!controller.model.latestSelection) return;

    for (let i = controller.model.latestSelection.index; i < controller.model.latestSelection.index + controller.model.latestSelection.length; i++) {
      const charFormat = controller.model.quill.getFormat(i, 1);
      if (charFormat.link) {
        controller.model.latestSelection = null;

        alert("Gradient color cannot be applied while there is a link in the selected text.");
        return;
      }
    }

    const colorEnd = controller.model.gradientColorEnd.getColor().toHEXA().toString();

    controller.model.formatTextToGradient(colorStart, colorEnd);
  });

  controller.model.gradientColorStart.on("show", () => {
    document.body.classList.add("select-costum");
  });

  controller.model.gradientColorStart.on("hide", () => {
    document.body.classList.remove("select-costum");
  });

  controller.model.gradientColorEnd.on("change", (color) => {
    const colorEnd = color.toHEXA().toString();
    controller.model.gradientColorEnd.getRoot().button.style.setProperty("--pcr-color", colorEnd);

    if (!controller.model.latestSelection) return;

    for (let i = controller.model.latestSelection.index; i < controller.model.latestSelection.index + controller.model.latestSelection.length; i++) {
      const charFormat = controller.model.quill.getFormat(i, 1);
      if (charFormat.link) {
        controller.model.latestSelection = null;

        alert("Gradient color cannot be applied while there is a link in the selected text.");
        return;
      }
    }

    const colorStart = controller.model.gradientColorStart.getColor().toHEXA().toString();

    controller.model.formatTextToGradient(colorStart, colorEnd);
  });

  controller.model.gradientColorEnd.on("show", () => {
    document.body.classList.add("select-costum");
  });

  controller.model.gradientColorEnd.on("hide", () => {
    document.body.classList.remove("select-costum");
  });
}
