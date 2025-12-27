export default (controller) => {
  controller.cleanRawOsuPage = (userData, container) => {
    container.innerHTML = replaceCacheSourceToOriginal(userData);

    cleanGarbageBBCode(container);
    extractSpacing(container);
    wrapText(container);
    splitParagraphByBr(container);
    convertInterElementSpaces(container);
    explodeInlineFormatters(container);
    flattenNestedSpans(container);
    processColorSpans(container);

    cleanupRedundantTags(container);
  };

  function extractSpacing(container) {
    container.querySelectorAll("*").forEach((el) => {
      if (el.firstElementChild || (el.tagName === "SPAN" && el.textContent.trim() === "")) return;

      let text = el.textContent;

      const leadingMatch = text.match(/^(\s+)/);

      if (leadingMatch) {
        const spaceContent = leadingMatch[1];

        const span = document.createElement("span");
        span.textContent = spaceContent;

        el.parentNode.insertBefore(span, el);

        text = text.replace(/^(\s+)/, "");
        el.textContent = text;
      }

      const trailingMatch = text.match(/(\s+)$/);

      if (trailingMatch) {
        const spaceContent = trailingMatch[1];

        const span = document.createElement("span");
        span.textContent = spaceContent;

        el.parentNode.insertBefore(span, el.nextSibling);

        text = text.replace(/(\s+)$/, "");
        el.textContent = text;
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

  function cleanupRedundantTags(container) {
    const tags = ["STRONG", "B", "EM", "I", "U", "S", "STRIKE"];

    const selector = tags.join(",");

    let hasChanges = true;

    while (hasChanges) {
      hasChanges = false;

      const elements = Array.from(container.querySelectorAll(selector));

      for (const child of elements) {
        const tagName = child.tagName;
        const parent = child.parentElement;

        if (!parent) continue;

        let targetParent = null;

        if (parent.tagName === tagName) {
          targetParent = parent;
        } else if (parent.tagName === "A" && parent.parentElement && parent.parentElement.tagName === tagName) {
          targetParent = parent.parentElement;
        }

        if (targetParent) {
          if (child.getAttribute("style")) {
            targetParent.style.cssText += ";" + child.style.cssText;
          }

          const fragment = document.createDocumentFragment();
          while (child.firstChild) {
            fragment.appendChild(child.firstChild);
          }
          child.replaceWith(fragment);

          hasChanges = true;
        }
      }
    }
  }

  function explodeInlineFormatters(container) {
    const inlineTags = ["STRONG", "B", "EM", "I", "U", "S", "STRIKE"];

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

  function replaceCacheSourceToOriginal(userData) {
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
};
