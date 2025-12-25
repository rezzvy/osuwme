export default function initClone(controller) {
  controller.model.clonedMation = new MationHTML();

  controller.model.registerClonedBBCodeConversion(".imagemap", (api) => {
    const el = generateClonedItem("imgmap", "true");

    const ph = controller.view.el(".ph-map", el);
    const container = controller.view.el(".imgmap-container", el);
    const img = controller.view.el("img", el);

    const origImg = controller.view.el("img", api.node);

    let item = "";
    controller.view.els(".imagemap__link", api.node).forEach((itm) => {
      const title = itm.dataset.origTitle ?? itm.title;
      const link = itm.href;
      const style = itm.style.cssText;

      item += controller.view.generateOutputImageMapItem(title, link, style);
    });

    img.src = origImg.src;
    container.innerHTML += item;
    ph.classList.remove("ph");
    container.classList.remove("d-none");

    return el.outerHTML;
  });

  controller.model.registerClonedBBCodeConversion("h2", (api) => {
    if (api.node.firstElementChild) {
      const el = generateClonedItem("text", "true", `<p><strong style="font-size:150%">${api.content}</strong></p>`);

      return el.outerHTML;
    }

    const el = generateClonedItem("heading", "true", `<div class='heading'>${api.content}</div>`);

    return el.outerHTML;
  });

  controller.model.registerClonedBBCodeConversion("ol", (api) => {
    const el = generateClonedItem("list", "true");
    const ul = controller.view.el("ul", el);
    ul.innerHTML = api.content;
    ul.dataset.ordered = api.node.classList.contains("unordered") ? "false" : "true";
    ul.classList.toggle("ol", !api.node.classList.contains("unordered"));

    if (!controller.model.isNodeEmpty(ul)) {
      ul.parentElement.classList.remove("ph");
      ul.classList.remove("d-none");
    }

    return el.outerHTML;
  });

  controller.model.registerClonedBBCodeConversion("li", (api) => {
    return `<li data-list-item="${controller.model.uniqueID}" data-title="" data-drop>${api.content}</li>`;
  });

  controller.model.registerClonedBBCodeConversion("audio", (api) => {
    const el = generateClonedItem("audio", "true");
    const audioSource = api.node.dataset.audioUrl ?? api.node.src;

    const playButton = controller.view.el(".play-audio-btn", el);
    playButton.dataset.src = audioSource;
    playButton.dataset.bsTitle = `This audio was generated using the clone feature. Please try re-saving it through the editor to see if it works.`;

    return el.outerHTML;
  });

  controller.model.registerClonedBBCodeConversion("iframe", (api) => {
    const videoId = controller.model.getYoutubeVideoId(api.node.src);

    const el = generateClonedItem("youtube", "true");
    if (!videoId) return el.outerHTML;

    const iframe = controller.view.el("iframe", el);
    const ph = controller.view.el(".ph-youtube", el);

    ph.classList.remove("ph");
    iframe.src = `https://www.youtube.com/embed/${videoId}?feature=oembed`;
    iframe.dataset.videoId = videoId;
    iframe.classList.remove("d-none");

    return el.outerHTML;
  });

  controller.model.registerClonedBBCodeConversion(".js-spoilerbox.bbcode-spoilerbox", (api) => {
    const rawContent = document.createElement("div");
    rawContent.innerHTML = api.content;

    const el = generateClonedItem("spoilerbox", "true");

    const details = controller.view.el("details", el);
    details.removeAttribute("open");
    const summary = controller.view.el("summary", el);
    const content = controller.view.el(".spoilerbox-content", el);

    if (!controller.model.isNodeEmpty(controller.view.el(".js-spoilerbox__body", api.node))) {
      content.classList.remove("ph");
    }

    details.dataset.title = "";
    summary.dataset.drop = true;

    const trashSpan = controller.view.el(".bbcode-spoilerbox__link-icon", rawContent.firstElementChild);
    trashSpan?.remove();

    summary.innerHTML = rawContent.firstElementChild.outerHTML;
    rawContent.firstElementChild.remove();

    content.innerHTML = rawContent.innerHTML;

    return el.outerHTML;
  });

  controller.model.registerClonedBBCodeConversion("code", (api) => {
    const style = api.node.style.cssText ? `style="${api.node.style.cssText}"` : ``;

    return `<code ${style} class="inline">${api.content}</code>`;
  });

  controller.model.registerClonedBBCodeConversion("strong", (api) => {
    const style = api.node.style.cssText ? `style="${api.node.style.cssText}"` : ``;

    return `<strong ${style}>${api.content}</strong>`;
  });

  controller.model.registerClonedBBCodeConversion("em", (api) => {
    const style = api.node.style.cssText ? `style="${api.node.style.cssText}"` : ``;

    return `<em ${style}>${api.content}</em>`;
  });

  controller.model.registerClonedBBCodeConversion("del", (api) => {
    const style = api.node.style.cssText ? `style="${api.node.style.cssText}"` : ``;

    return `<s ${style}>${api.content}</s>`;
  });

  controller.model.registerClonedBBCodeConversion("u", (api) => {
    const style = api.node.style.cssText ? `style="${api.node.style.cssText}"` : ``;

    return `<u ${style}>${api.content}</u>`;
  });

  controller.model.registerClonedBBCodeConversion("pre", (api) => {
    const el = generateClonedItem("codeblock", "true");
    const code = controller.view.el("code", el);
    code.textContent = api.node.textContent;

    return el.outerHTML;
  });

  controller.model.registerClonedBBCodeConversion(".well", (api) => {
    const el = generateClonedItem("notice", "false");
    const notice = controller.view.el(".notice", el);
    notice.innerHTML = api.content;

    if (!controller.model.isNodeEmpty(api.node)) notice.classList.remove("ph");

    return el.outerHTML;
  });

  controller.model.registerClonedBBCodeConversion("center", (api) => {
    if (api.node.parentElement?.closest("center")) {
      return api.content;
    }

    const el = generateClonedItem("center", "false");
    const center = controller.view.el("center", el);
    center.innerHTML = api.content;

    if (!controller.model.isNodeEmpty(api.node)) center.classList.remove("ph");

    return el.outerHTML;
  });

  controller.model.registerClonedBBCodeConversion("img", (api) => {
    return `<img src="${api.node.src}"/>`;
  });

  controller.model.registerClonedBBCodeConversion("span", (api) => {
    if (api.node.textContent.trim() === "") {
      return `<span class="inline-splitter"> </span>`;
    }

    const style = api.node.style.cssText ? `style="${api.node.style.cssText}"` : "";
    const className = api.node.classList.length ? `class="${[...api.node.classList].join(" ")}"` : "";

    return `<span ${className} ${style}>${api.content}</span>`;
  });

  controller.model.registerClonedBBCodeConversion("a", (api) => {
    if (api.node.matches(".js-spoilerbox__link")) {
      return api.content;
    }

    const style = api.node.style.cssText ? `style="${api.node.style.cssText}"` : ``;

    if (api.node.matches("[data-user-id")) {
      return `<a ${style} href="https://osu.ppy.sh/users/${api.content}" rel="noopener noreferrer" target="_blank">${api.content}</a>`;
    }

    return `<a ${style}  href="${api.node.href}" rel="noopener noreferrer" target="_blank">${api.content}</a>`;
  });

  controller.model.registerClonedBBCodeConversion("br", (api) => {
    if (api.node.closest("a")) return "";
    if (api.node.closest("p")) return `<br data-spacing="%SPCITM%">`;

    const el = generateClonedItem("spacing", "true");
    const item = controller.view.el(".spacing-item", el);

    controller.view.dataset(item, "spacingLevel", 1);
    item.style.setProperty("--spacing-level", "1");
    return el.outerHTML;
  });

  controller.model.registerClonedBBCodeConversion("blockquote", (api) => {
    const title = controller.view.el("h4", api.node);

    if (title) {
      const el = generateClonedItem("quote", "true");
      const blockquote = controller.view.el("blockquote", el);
      const username = title.textContent.split("wrote")[0];

      if (!controller.model.isNodeEmpty(api.node)) {
        controller.view.el("._quote-content", el).classList.remove("ph");
      }

      controller.view.dataset(blockquote, "includeSource", true);
      controller.view.dataset(blockquote, "source", username);

      controller.view.el("._source span", el).textContent = username;
      controller.view.el("._quote-content", el).innerHTML = api.content.replace(/^.*?wrote:\s*/gim, "");

      return el.outerHTML;
    }

    const el = generateClonedItem("quote", "true");
    const blockquote = controller.view.el("blockquote", el);

    if (!controller.model.isNodeEmpty(api.node)) {
      controller.view.el("._quote-content", el).classList.remove("ph");
    }

    controller.view.dataset(blockquote, "includeSource", false);
    controller.view.dataset(blockquote, "source", "");

    controller.view.el("._source", el).classList.add("d-none");
    controller.view.el("._quote-content", el).innerHTML = api.content;
    return el.outerHTML;
  });

  controller.model.registerClonedBBCodeConversion("p", (api) => {
    if (api.node.firstElementChild?.matches("br") && api.node.children.length === 1) {
      const el = generateClonedItem("spacing", "true");
      const item = controller.view.el(".spacing-item", el);

      controller.view.dataset(item, "spacingLevel", 1);
      item.style.setProperty("--spacing-level", "1");
      return el.outerHTML;
    }

    if (api.node.matches(".bb-single-content") && api.node.firstElementChild?.matches("img")) {
      const el = generateClonedItem("image", "true");
      const img = controller.view.el("img", el);
      img.src = api.node.firstElementChild.src;
      img.dataset.src = api.node.firstElementChild.src;
      img.classList.add("single");
      controller.view.el(".ph-img", el).classList.remove("ph");

      return el.outerHTML;
    }

    const el = generateClonedItem("text", "true", `<p>${api.content}</p>`);
    return el.outerHTML;
  });

  // divider

  controller.view.on("#cloned-userpage-render", "click", (e) => {
    if (!controller.model.currentClonedData) return;

    const container = document.createElement("div");

    container.innerHTML = controller.model.currentClonedData.page.html;
    cleanGarbageBBCode(container);
    formatBBCode(container);
    splitParagraphByBr(container);
    convertInterElementSpaces(container);
    explodeInlineFormatters(container);
    flattenNestedSpans(container);
    processColorSpans(container);

    const html = controller.model.clonedMation.convert(container.innerHTML);

    controller.model.currentClonedData = null;
    controller.setCanvasContent(html);

    controller.view.modalClone.hide();

    controller.view.disable(true, "#cloned-userpage-render", "#clone-open-userpge", "#clone-copy-bbcode");
    controller.view.toggle("._cover > img", "d-none", true);
    controller.view.toggle("._avatar > img", "d-none", true);
    controller.view.el("._info > h3").textContent = "N/A";
    controller.view.el("._info > p").textContent = "N/A";
    controller.view.dataset("#clone-open-userpge", "url", "");
    controller.view.dataset("#clone-copy-bbcode", "bbcode", "");
  });

  controller.view.on("._avatar > img", "load", (e) => {
    controller.view.toggle(e.target, "d-none", false);
  });

  controller.view.on("._cover > img", "load", (e) => {
    controller.view.toggle(e.target, "d-none", false);
  });

  controller.view.on("#clone-link-input", "input", (e) => {
    controller.view.disable(!e.target.value, "#clone-link-submit");
  });

  controller.view.on("#clone-copy-bbcode", "click", (e) => {
    const bbcode = e.currentTarget.dataset.bbcode;
    if (!bbcode) return;

    const textarea = document.createElement("textarea");
    textarea.value = bbcode;
    textarea.style.cssText = "visually-hidden";

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    document.execCommand("copy");
    document.body.removeChild(textarea);

    alert("Copied!");
  });

  controller.view.on("#clone-open-userpge", "click", (e) => {
    if (!e.target.dataset.url) return;

    window.open(e.target.dataset.url, "_blank");
  });

  controller.view.on("#osu-api-login-btn", "click", (e) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      controller.logout();
      return;
    }

    controller.view.disable(true, e.target);

    const authUrl = `https://osu.ppy.sh/oauth/authorize?client_id=${controller.model.apiConfig.clientID}&redirect_uri=${encodeURIComponent(
      controller.model.apiConfig.redirectURI
    )}&response_type=code&scope=public`;

    window.location.href = authUrl;
  });

  controller.view.on("#clone-link-submit", "click", async (e) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    controller.view.buttonLoading(true, e.target);
    controller.view.disable(true, "#clone-link-input", "#clone-open-userpge", "#clone-copy-bbcode");
    controller.view.toggle("._cover > img", "d-none", true);
    controller.view.toggle("._avatar > img", "d-none", true);
    controller.view.el("._info > h3").textContent = "N/A";
    controller.view.el("._info > p").textContent = "N/A";
    controller.view.dataset("#clone-open-userpge", "url", "");
    controller.view.dataset("#clone-copy-bbcode", "bbcode", "");

    const username = controller.view.val("#clone-link-input");
    controller.model.currentClonedData = await controller.getUserByUsername(username);

    if (!controller.model.currentClonedData) {
      controller.view.disable(false, "#cloned-userpage-render");
      return;
    }

    controller.model.currentClonedData.page.html = replaceLinks(controller.model.currentClonedData);

    const data = controller.model.currentClonedData;
    controller.view.el("._avatar > img").src = data.avatar;
    controller.view.el("._cover > img").src = data.cover;
    controller.view.el("._info > h3").textContent = data.username;
    controller.view.el("._info > p").textContent = data.country;

    controller.view.dataset("#clone-open-userpge", "url", `https://osu.ppy.sh/users/${data.username}`);
    controller.view.dataset("#clone-copy-bbcode", "bbcode", data.page.raw);

    controller.view.buttonLoading(false, e.target);
    controller.view.disable(!data, "#clone-open-userpge", "#clone-copy-bbcode");
    controller.view.disable(false, "#clone-link-input", "#cloned-userpage-render");
    controller.view.val("#clone-link-input", "");
  });

  // Divider

  function generateClonedItem(key, editable, html = "") {
    const el = controller.renderToCanvas(key, editable, controller.model.uniqueID, false);

    const content = controller.view.el("._content", el);

    if (html) {
      content.innerHTML = html;
    }

    return el;
  }

  /* 
  =========================================
     Links Replace Utils
  ========================================= 
  */

  function replaceLinks(userData) {
    if (!userData || !userData.page || !userData.page.raw || !userData.page.html) {
      return null;
    }

    const rawContent = userData.page.raw;
    const htmlContent = userData.page.html;

    const bbCodeMediaRegex = /\[img\](.*?)\[\/img\]|\[imagemap\]\s*(https?:\/\/[^\s]+)|\[audio\](.*?)\[\/audio\]/gi;

    const originalUrls = [];
    let match;

    while ((match = bbCodeMediaRegex.exec(rawContent)) !== null) {
      const url = (match[1] || match[2] || match[3]).trim();
      originalUrls.push(url);
    }

    let mediaIndex = 0;

    const htmlMediaTagRegex = /<(img|audio)\s+[^>]*?>/gi;

    const fixedHtml = htmlContent.replace(htmlMediaTagRegex, (fullTag) => {
      if (mediaIndex >= originalUrls.length) return fullTag;

      const originalUrl = originalUrls[mediaIndex];
      mediaIndex++;

      let newTag = fullTag.replace(/src="([^"]*)"/, `src="${originalUrl}"`);

      if (newTag.includes("data-src=")) {
        newTag = newTag.replace(/data-src="([^"]*)"/, `data-src="${originalUrl}"`);
      }

      return newTag;
    });

    return fixedHtml;
  }

  /* 
  =========================================
     raw osu-web html processing
  ========================================= 
  */
  const config = {
    enableBrCleaning: true,
    blockTags: ["DIV", "CENTER", "BLOCKQUOTE", "LI", "UL", "OL"],
    inlineTags: ["STRONG", "EM", "DEL", "U", "A", "CODE", "SPAN", "IMG"],
    ignoredClasses: ["audio-player", "imagemap"],
  };

  function isBlock(node) {
    return node.nodeType === 1 && config.blockTags.includes(node.tagName);
  }

  function isInline(node) {
    return node.nodeType === 3 || (node.nodeType === 1 && config.inlineTags.includes(node.tagName));
  }

  function shouldIgnore(node) {
    if (node.nodeType !== 1) return false;
    return config.ignoredClasses.some((cls) => node.classList.contains(cls));
  }

  function formatBBCode(container) {
    if (shouldIgnore(container)) return;

    const children = Array.from(container.childNodes);
    const fragment = document.createDocumentFragment();

    let buffer = [];
    let lastWasParagraph = false;

    const flushBuffer = () => {
      const realContent = buffer.filter((n) => {
        return n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim().length > 0);
      });

      if (realContent.length > 0) {
        const p = document.createElement("p");

        const isSingleImage = realContent.length === 1;

        p.classList.add(isSingleImage ? "bb-single-content" : "bb-mixed-content");

        buffer.forEach((n) => p.appendChild(n));
        fragment.appendChild(p);

        buffer = [];
        lastWasParagraph = true;
        return true;
      } else {
        buffer.forEach((n) => fragment.appendChild(n));
        buffer = [];
        lastWasParagraph = false;
        return false;
      }
    };

    for (let i = 0; i < children.length; i++) {
      const node = children[i];

      if (node.nodeType === 1 && node.tagName === "BR") {
        flushBuffer();

        let brCount = 1;
        let j = i + 1;
        while (j < children.length && children[j].tagName === "BR") {
          brCount++;
          j++;
        }

        let brToKeep = brCount;

        if (config.enableBrCleaning && lastWasParagraph) {
          brToKeep = brCount - 1;
        }

        if (brToKeep < 0) brToKeep = 0;

        for (let k = 0; k < brToKeep; k++) {
          fragment.appendChild(document.createElement("br"));
        }

        lastWasParagraph = false;
        i += brCount - 1;
        continue;
      }

      if (isBlock(node)) {
        flushBuffer();
        formatBBCode(node);
        fragment.appendChild(node);
        lastWasParagraph = false;
        continue;
      }

      if (isInline(node)) {
        buffer.push(node);
        continue;
      }

      flushBuffer();
      fragment.appendChild(node);
      lastWasParagraph = false;
    }

    flushBuffer();

    container.innerHTML = "";
    container.appendChild(fragment);
  }

  // Divider

  function processColorSpans(container) {
    if (!container) return;

    const allSpans = Array.from(container.querySelectorAll('span[style*="color"]'));

    allSpans.forEach((targetSpan) => {
      const parent = targetSpan.parentElement;
      if (!parent) return;

      const hasSiblings = Array.from(parent.childNodes).some((node) => {
        if (node === targetSpan) return false;
        if (node.nodeType === 3 && node.textContent.trim().length > 0) return true;
        if (node.nodeType === 1) return true;
        return false;
      });

      if (hasSiblings) {
        return;
      }

      if (parent.tagName === "A") {
        const siblingsInLink = Array.from(parent.querySelectorAll('span[style*="color"]'));
        const isMixedColors = siblingsInLink.some((s) => s.style.color !== targetSpan.style.color);

        if (isMixedColors) return;

        parent.style.color = targetSpan.style.color;
        unwrapSpan(targetSpan);
        return;
      }

      if (parent.tagName === "P" || parent.tagName === "DIV") return;

      parent.style.color = targetSpan.style.color;
      unwrapSpan(targetSpan);
    });

    function unwrapSpan(span) {
      span.style.removeProperty("color");
      if (!span.getAttribute("style")) {
        span.outerHTML = span.innerHTML;
      }
    }
  }

  function convertInterElementSpaces(container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);

    const targets = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;

      if (!/^\s+$/.test(node.nodeValue)) continue;

      const prev = node.previousSibling;
      const next = node.nextSibling;

      if (prev && next && prev.nodeType === Node.ELEMENT_NODE && next.nodeType === Node.ELEMENT_NODE) {
        targets.push(node);
      }
    }

    for (const textNode of targets) {
      const span = document.createElement("span");
      span.classList.add("inline-splitter");
      span.textContent = textNode.nodeValue;
      textNode.parentNode.replaceChild(span, textNode);
    }
  }

  function explodeInlineFormatters(container) {
    const inlineTags = ["STRONG", "B", "EM", "I", "U", "S", "STRIKE"];

    while (true) {
      let targetSpan = null;
      let parentElement = null;

      const allSpans = container.querySelectorAll("span");

      for (const span of allSpans) {
        if (span.parentElement && inlineTags.includes(span.parentElement.tagName)) {
          if (span.parentElement.childNodes.length === 1 && !span.classList.contains("inline-splitter")) {
            continue;
          }

          targetSpan = span;
          parentElement = span.parentElement;
          break;
        }
      }

      if (!targetSpan || !parentElement) break;

      const fragment = document.createDocumentFragment();

      Array.from(parentElement.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === "") {
          return;
        }

        const isSplitter = node.nodeType === Node.ELEMENT_NODE && node.classList.contains("inline-splitter");

        if (isSplitter) {
          fragment.appendChild(node.cloneNode(true));
        } else {
          const newWrapper = parentElement.cloneNode(false);
          newWrapper.removeAttribute("id");
          newWrapper.appendChild(node.cloneNode(true));
          fragment.appendChild(newWrapper);
        }
      });

      parentElement.replaceWith(fragment);
    }
  }

  function flattenNestedSpans(container) {
    while (true) {
      const nestedSpan = container.querySelector("span:not(.inline-splitter) > span[style*='color']:not(.inline-splitter)");

      if (!nestedSpan) break;

      const parentSpan = nestedSpan.parentNode;

      if (parentSpan.tagName !== "SPAN" || parentSpan.classList.contains("inline-splitter")) {
        break;
      }

      const parentStyle = parentSpan.getAttribute("style") || "";
      const fragment = document.createDocumentFragment();

      Array.from(parentSpan.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent.length > 0) {
            const newSpan = document.createElement("span");
            newSpan.textContent = node.textContent;
            newSpan.setAttribute("style", parentStyle);
            fragment.appendChild(newSpan);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "SPAN") {
          if (node.classList.contains("inline-splitter")) {
            fragment.appendChild(node.cloneNode(true));
          } else {
            const childStyle = node.getAttribute("style") || "";
            const mergedStyle = parentStyle ? `${parentStyle};${childStyle}` : childStyle;
            node.setAttribute("style", mergedStyle);
            fragment.appendChild(node);
          }
        } else {
          fragment.appendChild(node.cloneNode(true));
        }
      });

      parentSpan.replaceWith(fragment);
    }
  }

  function cleanGarbageBBCode(container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);

    let node;

    const regex = /\[\/?[a-zA-Z0-9-_]+(?:=[^\]]*)?\]/g;

    while ((node = walker.nextNode())) {
      if (regex.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(regex, "");
      }
    }
  }

  function splitParagraphByBr(container) {
    if (!container || !(container instanceof HTMLElement)) {
      return;
    }

    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return [node.cloneNode(true)];
      }
      if (node.nodeName.toUpperCase() === "BR") {
        return ["BREAK"];
      }

      const childNodes = Array.from(node.childNodes);
      let chunks = [];
      let currentChunk = [];
      let hasBreak = false;

      childNodes.forEach((child) => {
        const processedChildren = processNode(child);
        processedChildren.forEach((item) => {
          if (item === "BREAK") {
            hasBreak = true;
            chunks.push(currentChunk);
            currentChunk = [];
          } else {
            currentChunk.push(item);
          }
        });
      });
      chunks.push(currentChunk);

      if (!hasBreak) {
        return [node.cloneNode(true)];
      }

      let resultNodes = [];
      chunks.forEach((chunk, index) => {
        const wrapperClone = node.cloneNode(false);
        chunk.forEach((child) => wrapperClone.appendChild(child));
        resultNodes.push(wrapperClone);
        if (index < chunks.length - 1) {
          resultNodes.push("BREAK");
        }
      });

      return resultNodes;
    }

    const allParagraphs = container.querySelectorAll("p");

    allParagraphs.forEach((pNode) => {
      if (!pNode.querySelector("br")) return;

      const pAttributes = Array.from(pNode.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {});

      let flattenedNodes = [];
      Array.from(pNode.childNodes).forEach((child) => {
        flattenedNodes = flattenedNodes.concat(processNode(child));
      });

      let newParagraphs = [];
      let currentNodes = [];

      const createP = () => {
        const newP = document.createElement("p");

        for (const [key, value] of Object.entries(pAttributes)) {
          newP.setAttribute(key, value);
        }

        currentNodes.forEach((n) => newP.appendChild(n));
        const hasText = newP.textContent.trim().length > 0;
        const hasMedia = newP.querySelector("img, video, audio, iframe, svg");

        if (!hasText && !hasMedia) {
          newP.innerHTML = "";
          newP.appendChild(document.createElement("br"));
        }

        newParagraphs.push(newP);
        currentNodes = [];
      };

      flattenedNodes.forEach((item) => {
        if (item === "BREAK") {
          createP();
        } else {
          currentNodes.push(item);
        }
      });
      createP();

      if (newParagraphs.length > 0) {
        pNode.replaceWith(...newParagraphs);
      }
    });
  }
}
