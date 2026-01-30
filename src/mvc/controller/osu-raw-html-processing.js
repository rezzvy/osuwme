export default (controller) => {
  controller.cleanRawOsuPage = (userData, container) => {
    container.innerHTML = replaceCacheSourceToOriginal(userData);

    cleanGarbageBBCode(container);
    extractSpacing(container);
    unwrapNestedBreaks(container);
    wrapText(container);
    splitParagraphByBr(container);
    convertInterElementSpaces(container);
    explodeInlineFormatters(container);
    flattenNestedSpans(container);
    processColorSpans(container);
    flagElements(container);
    cleanDomContainer(container);

    unwrapElements(container, "p.bb-single-content a > audio", "p.bb-single-content");
    unwrapElements(container, "p.bb-single-content a > iframe", "p.bb-single-content");
    controller.cleanupRedundantTags(container);
  };

  function unwrapElements(container, selector, wrapper) {
    const audios = container.querySelectorAll(selector);

    audios.forEach((audio) => {
      const container = audio.closest(wrapper);

      if (container && container.contains(audio)) {
        container.replaceWith(audio);
      }
    });
  }

  function unwrapNestedBreaks(container) {
    const selector = "strong, em, del, u, a, code, span";
    const elements = container.querySelectorAll(selector);

    for (const el of elements) {
      if (el.textContent.trim() !== "") continue;
      if (el.children.length === 0) continue;

      const children = Array.from(el.children);
      const isAllBr = children.every((child) => child.tagName === "BR");

      if (isAllBr) {
        el.replaceWith(...children);
      }
    }
  }

  function flagElements(container) {
    container.querySelectorAll("*").forEach((el) => {
      if (el.matches("p, a, img, br, hr, iframe, .js-spoilerbox__body, center, .inline-splitter") || el.closest(".js-spoilerbox__link")) return;

      if (el.children.length === 0) {
        if (el.textContent.trim() === "") {
          if (el.tagName === "SPAN") {
            el.classList.add("inline-splitter");
            el.textContent = " ";
          } else {
            el.innerHTML = "<span class='inline-splitter'> </span>";
          }
        }
      }
    });

    container.querySelectorAll("p").forEach((p) => {
      if (
        p.children.length === 2 &&
        p.firstElementChild?.matches(".bbcode-spoilerbox__link") &&
        !p.firstElementChild.textContent.trim() &&
        p.lastElementChild?.matches(".inline-splitter")
      ) {
        p.innerHTML = "";
      }

      if (p.children.length === 1) {
        const child = p.firstElementChild;
        if (!child) return;

        if (["A", "IFRAME", "IMG"].includes(child.tagName)) return;

        if (p.matches(".bb-single-content") && (child.firstElementChild?.matches(".inline-splitter") || child.matches(".inline-splitter"))) {
          p.classList.add("imposter-text");
        }
      }
    });

    container.querySelectorAll(".js-spoilerbox.bbcode-spoilerbox").forEach((box) => {
      const body = box.querySelector(".js-spoilerbox__body.bbcode-spoilerbox__body");
      const linkIcon = box.querySelector(".bbcode-spoilerbox__link-icon");

      if (linkIcon) linkIcon.remove();

      if (body) {
        const header = document.createElement("div");
        header.className = "bbcode-spoilerbox__header";

        while (box.firstChild && box.firstChild !== body) {
          header.appendChild(box.firstChild);
        }

        header.querySelectorAll("p.bb-single-content").forEach((p) => {
          if (p.innerHTML.trim() === "<br>") {
            p.remove();
          } else if (p.innerHTML.trim() === "") {
            p.remove();
          }
        });

        box.insertBefore(header, body);
      }
    });
  }

  function extractSpacing(container) {
    container.querySelectorAll("*").forEach((el) => {
      if (el.closest("code") || el.classList.contains("inline-splitter")) return;
      if (["OL", "LI", "PRE"].includes(el.tagName)) return;

      if (el.childNodes.length === 1 && el.firstChild.nodeType === Node.TEXT_NODE) {
        if (el.firstChild.nodeValue.trim() === "") {
          return;
        }
      }

      const firstNode = el.firstChild;

      if (firstNode && firstNode.nodeType === Node.TEXT_NODE) {
        let text = firstNode.nodeValue;
        const leadingMatch = text.match(/^(\s+)/);

        if (leadingMatch) {
          const spaceContent = leadingMatch[1];

          if (text.length === spaceContent.length && el.childNodes.length === 1) {
            return;
          }

          const span = document.createElement("span");
          span.classList.add("inline-splitter");
          span.textContent = spaceContent;

          el.parentNode.insertBefore(span, el);
          firstNode.nodeValue = text.substring(spaceContent.length);
        }
      }

      const lastNode = el.lastChild;

      if (lastNode && lastNode.nodeType === Node.TEXT_NODE) {
        let text = lastNode.nodeValue;
        const trailingMatch = text.match(/(\s+)$/);

        if (trailingMatch) {
          const spaceContent = trailingMatch[1];

          if (text.trim().length === 0) return;

          const span = document.createElement("span");
          span.classList.add("inline-splitter");
          span.textContent = spaceContent;

          if (el.nextSibling) {
            el.parentNode.insertBefore(span, el.nextSibling);
          } else {
            el.parentNode.appendChild(span);
          }

          lastNode.nodeValue = text.substring(0, text.length - spaceContent.length);
        }
      }
    });
  }

  function wrapText(container) {
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

        let finalLevel = brCount;
        if (config.enableBrCleaning && lastWasParagraph) {
          finalLevel = brCount > 0 ? brCount - 1 : 0;
        }

        if (finalLevel > 0) {
          let remaining = finalLevel;
          const MAX_PER_TAG = 100;

          while (remaining > 0) {
            const currentChunk = Math.min(remaining, MAX_PER_TAG);
            const mergedBr = document.createElement("br");

            if (currentChunk > 1) {
              mergedBr.setAttribute("data-level", currentChunk);
            }

            fragment.appendChild(mergedBr);
            remaining -= currentChunk;
          }
        }

        lastWasParagraph = false;
        i += brCount - 1;
        continue;
      }

      if (isBlock(node)) {
        flushBuffer();
        wrapText(node);
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

  // function explodeInlineFormatters(container) {
  //   const inlineTags = ["STRONG", "B", "EM", "I", "U", "S", "STRIKE"];

  //   while (true) {
  //     let targetSpan = null;
  //     let parentElement = null;

  //     const allSpans = container.querySelectorAll("span");

  //     for (const span of allSpans) {
  //       if (span.parentElement && inlineTags.includes(span.parentElement.tagName)) {
  //         if (span.parentElement.childNodes.length === 1 && !span.classList.contains("inline-splitter")) {
  //           continue;
  //         }

  //         targetSpan = span;
  //         parentElement = span.parentElement;
  //         break;
  //       }
  //     }

  //     if (!targetSpan || !parentElement) break;

  //     const fragment = document.createDocumentFragment();

  //     Array.from(parentElement.childNodes).forEach((node) => {
  //       if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === "") {
  //         return;
  //       }

  //       const isSplitter = node.nodeType === Node.ELEMENT_NODE && node.classList.contains("inline-splitter");

  //       if (isSplitter) {
  //         fragment.appendChild(node.cloneNode(true));
  //       } else {
  //         const newWrapper = parentElement.cloneNode(false);
  //         newWrapper.removeAttribute("id");
  //         newWrapper.appendChild(node.cloneNode(true));
  //         fragment.appendChild(newWrapper);
  //       }
  //     });

  //     parentElement.replaceWith(fragment);
  //   }
  // }

  function explodeInlineFormatters(container) {
    const inlineTags = ["STRONG", "B", "EM", "I", "U", "S", "STRIKE", "SPAN"];

    const selector = inlineTags.join(",");

    let hasChanges = true;

    while (hasChanges) {
      hasChanges = false;

      const elements = Array.from(container.querySelectorAll(selector));

      for (const parent of elements) {
        const children = Array.from(parent.childNodes).filter((node) => {
          return !(node.nodeType === 3 && node.textContent.trim() === "");
        });

        if (children.length > 1) {
          const fragment = document.createDocumentFragment();

          children.forEach((child) => {
            const newWrapper = parent.cloneNode(false);
            newWrapper.removeAttribute("id");

            newWrapper.appendChild(child.cloneNode(true));

            fragment.appendChild(newWrapper);
          });

          parent.replaceWith(fragment);
          hasChanges = true;
        }
      }
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
    const validTags = [
      "quote",
      "imagemap",
      "list",
      "heading",
      "b",
      "i",
      "u",
      "c",
      "strike",
      "url",
      "profile",
      "email",
      "size",
      "color",
      "spoiler",
      "img",
      "audio",
      "youtube",
      "notice",
      "centre",
      "spoilerbox",
      "box",
      "code",
    ];

    const tagsPattern = validTags.join("|");
    const regex = new RegExp(`\\[\\/?(${tagsPattern})(?:=[^\\]]*)?\\]`, "gi");

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

  function replaceCacheSourceToOriginal(userData) {
    if (!userData || !userData.page || !userData.page.raw || !userData.page.html) {
      return null;
    }

    const rawContent = userData.page.raw;
    const htmlContent = userData.page.html;

    const bbCodeMediaRegex = /\[img\]([\s\S]*?)\[\/img\]|\[imagemap\](?:\s*[\r\n]+\s*)(https?:\/\/[^\s]+)|\[audio\]([\s\S]*?)\[\/audio\]/gi;

    const originalUrls = [];
    let match;

    while ((match = bbCodeMediaRegex.exec(rawContent)) !== null) {
      const rawUrl = match[1] ?? match[2] ?? match[3] ?? "";
      if (rawUrl === "") continue;

      if (match[3] !== undefined && /[\r\n]/.test(rawUrl)) {
        continue;
      }

      originalUrls.push(rawUrl.trim());
    }

    let mediaIndex = 0;
    const htmlMediaTagRegex = /<(img|audio)\s+[^>]*?>/gi;

    const fixedHtml = htmlContent.replace(htmlMediaTagRegex, (fullTag) => {
      const isSmiley = fullTag.includes('class="smiley"') || fullTag.includes("/smilies/") || fullTag.includes("bbcode-spoilerbox__link-icon");

      if (isSmiley) {
        return fullTag;
      }

      if (mediaIndex >= originalUrls.length) return fullTag;

      const originalUrl = originalUrls[mediaIndex];
      mediaIndex++;

      if (originalUrl.length === 0) {
        return fullTag;
      }

      let newTag = fullTag.replace(/src="([^"]*)"/, (matchStr, currentCachedUrl) => {
        return `src="${currentCachedUrl}" data-cached-src="${currentCachedUrl}" data-original-src="${originalUrl}"`;
      });

      return newTag;
    });

    return fixedHtml;
  }

  function cleanDomContainer(container) {
    const spoilers = container.querySelectorAll(".js-spoilerbox.bbcode-spoilerbox");

    spoilers.forEach((spoiler) => {
      const children = Array.from(spoiler.childNodes);
      const elementsToMove = document.createDocumentFragment();

      children.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const isHeader = child.classList.contains("bbcode-spoilerbox__header");
          const isBody = child.classList.contains("bbcode-spoilerbox__body");

          if (!isHeader && !isBody) {
            elementsToMove.appendChild(child);
          }
        } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== "") {
          elementsToMove.appendChild(child);
        }
      });

      if (elementsToMove.childNodes.length > 0) {
        spoiler.after(elementsToMove);
      }
    });

    function unwrapNested(parentSelector, childSelector) {
      while (container.querySelector(`${parentSelector} ${childSelector}`)) {
        const nestedElements = container.querySelectorAll(`${parentSelector} ${childSelector}`);

        nestedElements.forEach((element) => {
          element.replaceWith(...element.childNodes);
        });
      }
    }

    unwrapNested(".well", ".well");
    unwrapNested("center", "center");
  }
};
