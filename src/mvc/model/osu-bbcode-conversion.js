export default function (controller) {
  const model = controller.model;
  const view = controller.view;

  model.mation = new MationHTML();
  model.mation.ignoreSelectors = ["._duration", "blockquote > ._source", "._edit"];
  model.mation.noRuleFallback = (api) => api.content;

  const getEffectiveLastNode = (node) => {
    if (!node) return null;

    const group = node.querySelector("._content > .group");

    if (group) {
      const items = group.querySelectorAll(":scope > .canvas-item");
      if (items.length > 0) {
        return getEffectiveLastNode(items[items.length - 1]);
      }
    }

    return node;
  };

  const getEffectiveFirstNode = (node) => {
    if (!node) return null;

    const group = node.querySelector("._content > .group");

    if (group) {
      const items = group.querySelectorAll(":scope > .canvas-item");
      if (items.length > 0) {
        return getEffectiveFirstNode(items[0]);
      }
    }

    return node;
  };

  model.registerBBCodeConversion(".spacing-item", (api) => {
    const container = api.node.closest(".canvas-item");
    const prevContainer = container.previousElementSibling;
    const nextContainer = container.nextElementSibling;

    const value = parseInt(api.node.dataset.spacingLevel);
    let level = value > 0 ? value : 1;

    if (prevContainer && nextContainer) {
      const actualPrev = getEffectiveLastNode(prevContainer);
      const actualNext = getEffectiveFirstNode(nextContainer);

      const conditions = [
        view.el("ul", actualPrev) && view.el("ul", actualNext),
        view.el("blockquote", actualPrev) && view.el("blockquote", actualNext),
      ];

      level += conditions.filter(Boolean).length;
    }

    return `%SPCITM%`.repeat(level);
  });

  model.registerBBCodeConversion("code", (api) => {
    if (api.node.classList.contains("inline")) {
      return `[c]${api.content}[/c]`;
    }

    const raw = api.node.dataset.raw ? api.node.dataset.raw : api.content;
    const safe = raw.replace(/\u00A0/g, "@CODEWS@");

    return `[code]${safe}[/code]%NL%`;
  });

  model.registerBBCodeConversion("details", (api) => {
    const isBox = api.node.dataset.box;
    if (isBox === "true") {
      return `[box=${api.content}[/box]%NL%`;
    }
    return `[spoilerbox]${api.content}[/spoilerbox]%NL%`;
  });

  model.registerBBCodeConversion("summary", (api) => {
    if (api.node.parentElement.dataset.box === "true") {
      return `${api.content}]`;
    }
    return "";
  });

  model.registerBBCodeConversion("center", (api) => {
    const hasCenterBlock = api.node.parentElement?.closest("center");

    return hasCenterBlock ? api.content : `[centre]${api.content}[/centre]`;
  });

  model.registerBBCodeConversion(".notice", (api) => {
    const hasNoticeBlock = api.node.parentElement?.closest(".notice");
    return hasNoticeBlock ? api.content : `[notice]${api.content}[/notice]%NL%`;
  });

  model.registerBBCodeConversion("iframe", (api) => {
    return `[youtube]${api.node.dataset.videoId ?? model.getYoutubeVideoId(api.node.src)}[/youtube]`;
  });

  model.registerBBCodeConversion(".play-audio-btn", (api) => {
    const source = api.node.dataset.originalSrc || api.node.dataset.src;

    return `[audio]${source}[/audio]`;
  });

  model.registerBBCodeConversion("img", (api) => {
    const inline = ["A", "P", "EM", "STRONG", "U", "SPAN", "CODE", "S", "LI", "H2"];
    const source = api.node.dataset.originalSrc || api.node.src;

    if (inline.includes(api.node.parentElement.tagName)) {
      return `[img]${source}[/img]`;
    }

    return `[img]${source}[/img]%NL%`;
  });

  model.registerBBCodeConversion("p", (api) => {
    return `${api.content}%NL%`;
  });

  model.registerBBCodeConversion(".heading, h2", (api) => {
    return `[heading]${api.content}[/heading]%NL%`;
  });

  model.registerBBCodeConversion("ul", (api) => {
    const isOrdered = api.node.classList.contains("ol");
    if (isOrdered) {
      return `[list=1]%NL%${api.content}[/list]%NL%`;
    }
    return `[list]%NL%${api.content}[/list]%NL%`;
  });

  model.registerBBCodeConversion("ol", (api) => {
    return `[list${api.node.dataset?.type === "ordered" ? "=1" : ""}]%NL%${api.content}[/list]%NL%`;
  });

  model.registerBBCodeConversion("li", (api) => {
    const title = api.node.dataset.title ? `${api.node.dataset.title}%NL%${api.content}` : api.content;
    const content = title.trim() + "%NL%";
    return `[*]${content}`;
  });

  model.registerBBCodeConversion(".imgmap-container", (api) => {
    return `[imagemap]%NL%${api.content}[/imagemap]%NL%`;
  });

  model.registerBBCodeConversion(".imgmap-container > img", (api) => {
    const source = api.node.dataset.originalSrc || api.node.src;

    return `${source}%NL%`;
  });

  model.registerBBCodeConversion("blockquote", (api) => {
    const hasSource = api.node.dataset.includeSource;
    const sourceTitle = api.node.dataset.source;
    if (hasSource === "true") {
      return `[quote="${sourceTitle}"]${api.content}[/quote]%NL%`;
    }
    return `[quote]${api.content}[/quote]%NL%`;
  });

  model.registerBBCodeConversion(".inline-splitter", (api) => {
    return api.node.closest("summary") ? "\u00A0" : " ";
  });

  model.registerBBCodeConversion(".spoiler", (api) => {
    return `[spoiler]${api.content}[/spoiler]`;
  });

  model.registerBBCodeConversion('[style*="color:"]', (api) => {
    if (api.node.matches("a") && model.isOsuProfileLink(api.node.href)) return api.content;

    if (api.node.matches("h2") && api.node.style.color) {
      return `[heading][color=${model.rgbToHex(api.node.style.color)}]${api.content}[/color][/heading]`;
    }

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
    const rawSize = api.node.style.fontSize;

    let size = parseInt(rawSize, 10);

    if (isNaN(size)) {
      size = 100;
    }

    if (api.node.matches("a")) return api.content;
    return `[size=${size}]${api.content}[/size]`;
  });

  model.registerBBCodeConversion("a", (api) => {
    if (api.node.children?.length === 0 && api.node.textContent.trim() === "" && !api.node.matches(".output-imgmap-item")) {
      return api.content;
    }

    const rawSize = api.node.style.fontSize;
    let sizePrefix = "";
    let sizeSuffix = "";

    if (rawSize) {
      let sizeVal = parseInt(rawSize, 10);
      if (isNaN(sizeVal)) sizeVal = 100;

      sizePrefix = `[size=${sizeVal}]`;
      sizeSuffix = `[/size]`;
    }

    let content = api.content;
    let link = decodeURI(api.node.href);

    if (api.node.parentElement.classList.contains("imgmap-container")) {
      link = model.isValidURL(api.node.dataset.link) ? encodeURI(api.node.dataset.link) : "https://google.com";
      const { width, height, top, left } = api.node.style;
      const title = api.node.dataset.title || "";
      return `${left.replace("%", "")} ${top.replace("%", "")} ${width.replace("%", "")} ${height.replace("%", "")} ${link} ${title}%NL%`;
    }

    if (model.isOsuProfileLink(link)) {
      const text = api.node.textContent.trim();
      if (text === "") return "";

      const child = api.node.firstElementChild;
      let isSpoiler = false;
      let isCode = false;

      if (child) {
        if (child.matches(".spoiler")) {
          isSpoiler = true;

          if (child.querySelector(".inline")) {
            isCode = true;
          }
        } else if (child.matches(".inline")) {
          isCode = true;
        }
      }

      let output = `[profile]${text}[/profile]`;

      if (isCode) {
        output = `[c]${output}[/c]`;
      }

      if (isSpoiler) {
        output = `[spoiler]${output}[/spoiler]`;
      }

      return `${sizePrefix}${output}${sizeSuffix}`;
    }

    if (link.startsWith("mailto:")) {
      return `${sizePrefix}[email=${link.substring(7)}]${content}[/email]${sizeSuffix}`;
    }

    return `${sizePrefix}[url=${link}]${content}[/url]${sizeSuffix}`;
  });

  model.registerBBCodeConversion('[data-spacing="%SPCITM%"]', () => {
    return "%SPCITM%";
  });
}
