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
      format: (api) => `%SPCITM%`.repeat(parseInt(api.node.dataset.spacingLevel) - 1),
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
      format: (api) => `[centre]${api.content}[/centre]%NL%`,
    },
    {
      selector: "iframe",
      format: (api) => `%NL%[youtube]${api.node.dataset.videoId}[/youtube]%NL%`,
    },
    {
      selector: ".play-audio-btn",
      format: (api) => `%NL%[audio]${api.node.dataset.audioUrl}[/audio]%NL%`,
    },
    {
      selector: "img",
      format: (api) => `%NL%[img]${api.node.src}[/img]%NL%`,
    },
    {
      selector: ".heading",
      format: (api) => `%NL%[heading]${api.content}[/heading]%NL%`,
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

        return `%NL%[code]${api.content}[/code]%NL%`;
      },
    },
    {
      selector: ".imgmap-container",
      format: (api) => `[imagemap]%NL%${api.content}[/imagemap]`,
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
          return `[list=1]%NL%${api.content}[/list]`;
        }

        return `[list]%NL%${api.content}[/list]`;
      },
    },
    {
      selector: "li",
      format: (api) => `[*]${api.node.dataset.title} ${api.content}%NL%`,
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

        const renderableAsProfile = link.match(/^https:\/\/osu\.ppy\.sh\/users\/([a-zA-Z\s-]+)$/);
        if (renderableAsProfile) {
          return `[profile]${renderableAsProfile[1]}[/profile]`;
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
      format: (api) => `[color=${controller.model.rgbToHex(api.node.style.color)}]${api.content}[/color]`,
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
          return `%NL%[quote=${sourceTitle}]${api.content}[/quote]%NL%`;
        }

        return `%NL%[quote]${api.content}[/quote]%NL%`;
      },
    },
    {
      selector: "details",
      format: (api) => {
        const title = api.node.dataset.title;
        const isBox = api.node.dataset.box;

        if (isBox === "true") {
          return `%NL%[box=${title}]%NL%${api.content}[/box]%NL%`;
        }

        return `%NL%[spoilerbox]%NL%${api.content}[/spoilerbox]%NL%`;
      },
    },
  ]);

  /* =========================================
       DRAGULA
       ========================================= */
  controller.model.drake = dragula({
    isContainer: (el) => {
      return el.hasAttribute("data-drop") || el === document.querySelector("#canvas-wrapper");
    },
    moves: (el, source, handle) => {
      return handle.closest('[data-action="move"]');
    },
    accepts: (el, target) => {
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
  });

  controller.model.drake.on("drop", (el, target, source, sibling) => {
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
    var plaintext = node.innerText;
    var Delta = Quill.import("delta");
    return new Delta().insert(plaintext);
  });

  controller.model.quill.on("text-change", function () {
    const linkFormCostum = document.querySelector(".link-form");
    linkFormCostum.classList.toggle("d-none", true);

    const isEmpty = controller.model.quill.getText().trim() === "";
    controller.view.disableButton(isEmpty, controller.view.modalEditSaveButton);
  });

  controller.model.quill.root.addEventListener("click", function (event) {
    const linkFormCostum = document.querySelector(".link-form");
    const saveButton = linkFormCostum.querySelector("button");
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
    controller.latestSelection = controller.model.quill.getSelection();

    const hexColor = color.toHEXA().toString();
    document.body.classList.add("select-costum");

    const range = controller.latestSelection;
    if (range) {
      controller.model.quill.formatText(range.index, range.length, "color", hexColor);
    }
  });

  controller.model.pickr.on("hide", () => {
    document.body.classList.remove("select-costum");
    controller.latestSelection = null;
  });

  controller.model.pickr.on("change", (color) => {
    const hexColor = color.toHEXA().toString();
    document.querySelector(".pcr-button").style.setProperty("--pcr-color", hexColor);

    const range = controller.latestSelection ? controller.latestSelection : controller.model.quill.getSelection();
    if (range) {
      controller.model.quill.formatText(range.index, range.length, "color", hexColor);
    }
  });
}
