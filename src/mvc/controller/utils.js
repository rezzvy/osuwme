export default (controller) => {
  const model = controller.model;

  controller.mergeGradientLinks = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const links = Array.from(doc.querySelectorAll("a"));

    links.forEach((currentLink) => {
      const prevLink = currentLink.previousElementSibling;

      if (prevLink && prevLink.tagName === "A" && prevLink.href === currentLink.href) {
        while (currentLink.firstChild) {
          prevLink.appendChild(currentLink.firstChild);
        }

        currentLink.remove();
      }
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

      const currentWrapper = anchor.parentNode;
      const newAnchor = anchor.cloneNode(false);
      const originalContent = Array.from(anchor.childNodes);

      currentWrapper.innerHTML = "";
      originalContent.forEach((node) => currentWrapper.appendChild(node));

      const grandWrapperClone = grandWrapper.cloneNode(true);
      newAnchor.appendChild(grandWrapperClone);

      parentElement.replaceChild(newAnchor, grandWrapper);
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
};
