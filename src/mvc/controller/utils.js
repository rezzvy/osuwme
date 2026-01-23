export default (controller) => {
  const model = controller.model;

  controller.mergeGradientLinks = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const links = Array.from(doc.querySelectorAll("a"));

    links.forEach((currentLink) => {
      if (currentLink.matches(".output-imgmap-item")) return;

      if (!currentLink.style.color && !currentLink.querySelector('[style*="color:"]')) {
        return;
      }

      let spacingColor = null;
      if (currentLink.hasAttribute("data-spacing-color")) {
        spacingColor = currentLink;
      } else {
        spacingColor = currentLink.querySelector("[data-spacing-color]");
      }

      if (spacingColor) {
        spacingColor.style.color = null;
      }

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
    let colors = [];

    if (type === "horizontal") colors = model.generateGradient(text, colorStart, colorEnd);
    if (type === "middle") colors = model.generateMiddleGradient(text, colorStart, colorMiddle);
    if (type === "threeColored") colors = model.generateThreeColorGradient(text, colorStart, colorMiddle, colorEnd);
    if (type === "rainbow") colors = model.generateRainbowColors(text);
    if (type === "random") colors = model.generateRandomColors(text);

    const segments = model.getSegments(text);

    const operations = [];
    let lastRetain = 0;
    let currentTextIndex = 0;

    for (let i = 0; i < segments.length; i++) {
      const segmentStr = segments[i];
      const colorCode = colors[i];
      const len = segmentStr.length;

      const globalIndex = range.index + currentTextIndex;
      const retainOffset = globalIndex - lastRetain;

      if (retainOffset > 0) {
        operations.push({ retain: retainOffset });
      }

      const op = { retain: len };

      if (colorCode === "THIS_IS_SPACE") {
        op.attributes = { color: "#fff", "spacing-color": "true" };
      } else if (colorCode) {
        op.attributes = { color: colorCode };
      }

      operations.push(op);

      lastRetain = globalIndex + len;
      currentTextIndex += len;
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

        if (!child.parentElement) continue;

        const ancestor = child.parentElement.closest(tagName);

        if (ancestor) {
          if (child.getAttribute("style")) {
            ancestor.style.cssText += ";" + child.style.cssText;
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
