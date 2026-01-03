export default (controller) => {
  const model = controller.model;

  controller.mergeGradientLinks = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const links = Array.from(doc.querySelectorAll("a"));

    links.forEach((currentLink) => {
      if (currentLink.matches(".output-imgmap-item")) return;

      const prevLink = currentLink.previousElementSibling;

      if (prevLink && prevLink.tagName === "A" && prevLink.href === currentLink.href) {
        if (prevLink.hasAttribute("style")) {
          const hostSpan = document.createElement("span");
          hostSpan.style.cssText = prevLink.style.cssText;

          while (prevLink.firstChild) {
            hostSpan.appendChild(prevLink.firstChild);
          }

          prevLink.appendChild(hostSpan);
          prevLink.removeAttribute("style");
        }

        const spanWrapper = document.createElement("span");
        spanWrapper.style.cssText = currentLink.style.cssText;

        while (currentLink.firstChild) {
          spanWrapper.appendChild(currentLink.firstChild);
        }

        prevLink.appendChild(spanWrapper);
        currentLink.remove();
      }
    });

    Array.from(doc.querySelectorAll("p")).forEach((p) => {
      controller.cleanupRedundantTags(p);
    });

    return doc.body.innerHTML;
  };

  controller.swapLinks = (parentElement) => {
    const directChildren = Array.from(parentElement.children);

    directChildren.forEach((grandWrapper) => {
      const anchor = grandWrapper.querySelector("a");

      if (!anchor) {
        return;
      }

      if (!grandWrapper.style.color) {
        return;
      }

      const wrapperText = grandWrapper.textContent.trim();
      const anchorText = anchor.textContent.trim();

      const isExactMatch = wrapperText.length === anchorText.length;

      let hasContentBefore = false;
      let sibling = anchor.previousSibling;

      while (sibling) {
        if (sibling.nodeType === 1 || (sibling.nodeType === 3 && sibling.textContent.trim() !== "")) {
          hasContentBefore = true;
          break;
        }
        sibling = sibling.previousSibling;
      }

      if (!isExactMatch && hasContentBefore) {
        return;
      }

      const newAnchor = anchor.cloneNode(false);
      const anchorParent = anchor.parentNode;

      while (anchor.firstChild) {
        anchorParent.insertBefore(anchor.firstChild, anchor);
      }

      anchorParent.removeChild(anchor);
      parentElement.replaceChild(newAnchor, grandWrapper);
      newAnchor.appendChild(grandWrapper);
    });
  };

  controller.formatTextToGradient = (type, range, colorStart, colorMiddle, colorEnd) => {
    if (!range) return;

    const text = model.quill.getText(range.index, range.length);
    let gradients = [];

    if (type === "horizontal") gradients = model.generateGradient(text, colorStart, colorEnd);
    if (type === "middle") gradients = model.generateMiddleGradient(text, colorStart, colorMiddle);
    if (type === "threeColored") gradients = model.generateThreeColorGradient(text, colorStart, colorMiddle, colorEnd);
    if (type === "rainbow") gradients = model.generateRainbowColors(text);
    if (type === "random") gradients = model.generateRandomColors(text);

    const operations = [];
    let colorIndex = 0;
    let lastRetain = 0;

    const isProblematicSequence = (text, i) => {
      const fourChar = text.slice(i, i + 4);
      if (fourChar === "<---" || fourChar === "--->") return 4;

      const threeChar = text.slice(i, i + 3);
      if (threeChar === "<--" || threeChar === "-->") return 3;

      const twoChar = text.slice(i, i + 2);
      if (twoChar === "<-" || twoChar === "->") return 2;

      return 0;
    };

    const isSurrogatePair = (text, i) => {
      const code = text.charCodeAt(i);
      return code >= 0xd800 && code <= 0xdbff;
    };

    for (let i = 0; i < text.length; ) {
      let len = isProblematicSequence(text, i);

      if (len === 0) {
        if (isSurrogatePair(text, i)) {
          len = 2;
        } else {
          len = 1;
        }
      }

      const globalIndex = range.index + i;

      const retainOffset = globalIndex - lastRetain;
      if (retainOffset > 0) {
        operations.push({ retain: retainOffset });
      }

      const colorToApply = gradients[colorIndex % gradients.length];

      operations.push({
        retain: len,
        attributes: { color: colorToApply },
      });

      lastRetain = globalIndex + len;

      colorIndex++;
      i += len;
    }

    model.quill.updateContents(new model.Delta(operations), Quill.sources.USER);
  };

  controller.validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_\[\] \-]{1,15}$/;
    if (!username) return false;

    return regex.test(username);
  };

  controller.cleanupRedundantTags = (container) => {
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
  };
};
