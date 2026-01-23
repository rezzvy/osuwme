class Normalizer {
  constructor(config = {}) {
    this.config = {
      targetSelector: config.targetSelector,
      stylesToHoist: config.stylesToHoist || [],
      stylesToPushDown: config.stylesToPushDown || [],
      tagsToMerge: config.tagsToMerge || [],
    };
  }

  processAsync(htmlString) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const result = this.process(htmlString);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 0);
    });
  }

  process(htmlString) {
    if (!this.config.targetSelector) return htmlString;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const containers = doc.querySelectorAll(this.config.targetSelector);

    if (containers.length === 0) return htmlString;

    containers.forEach((container) => {
      this._optimizeRecursive(container);
    });

    return doc.body.innerHTML;
  }

  _isSplitterNode(node) {
    if (!node) return false;
    if (node.nodeType !== Node.ELEMENT_NODE) return false;

    if (node.tagName === "SPAN" && node.classList.contains("inline-splitter")) {
      return true;
    }

    const hasSplitterInside = node.querySelector && node.querySelector(".inline-splitter");
    if (!hasSplitterInside) return false;

    const textContent = node.textContent || "";
    if (textContent.trim() !== "") return false;

    return true;
  }

  _areNodesIdentical(nodeA, nodeB) {
    if (nodeA.tagName !== nodeB.tagName) return false;
    if (nodeA.attributes.length !== nodeB.attributes.length) return false;
    for (let i = 0; i < nodeA.attributes.length; i++) {
      const attrName = nodeA.attributes[i].name;
      const valA = nodeA.getAttribute(attrName);
      const valB = nodeB.getAttribute(attrName);
      if (valB === null) return false;
      if (attrName === "style") {
        if (valA.replace(/\s/g, "").toLowerCase() !== valB.replace(/\s/g, "").toLowerCase()) return false;
      } else {
        if (valA !== valB) return false;
      }
    }
    return true;
  }

  _optimizeRecursive(element) {
    this._cleanUselessWrappers(element);
    this._unwrapSplitters(element);
    this._pushDownProperties(element);

    Array.from(element.children).forEach((child) => this._optimizeRecursive(child));

    this._mergeSiblings(element);
    this._hoistCommonStyles(element);
  }

  _unwrapSplitters(parent) {
    const children = Array.from(parent.children);
    children.forEach((child) => {
      if (this.config.tagsToMerge.includes(child.tagName.toLowerCase())) {
        const hasSingleChild = child.children.length === 1;
        const firstChild = child.firstElementChild;

        if (hasSingleChild && firstChild && firstChild.classList.contains("inline-splitter")) {
          const hasSignificantText = Array.from(child.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "");

          if (!hasSignificantText) {
            parent.insertBefore(firstChild, child);
            child.remove();
          }
        }
      }
    });
  }

  _cleanUselessWrappers(element) {
    const children = Array.from(element.children);
    children.forEach((child) => {
      if (child.tagName !== "SPAN") return;
      if (child.classList.contains("inline-splitter")) return;

      const hasMeaningfulAttributes = Array.from(child.attributes).some((attr) => {
        if (attr.name === "style") return attr.value.trim() !== "";
        if (attr.name === "class") return attr.value.trim() !== "";
        return true;
      });

      if (!hasMeaningfulAttributes) {
        while (child.firstChild) {
          element.insertBefore(child.firstChild, child);
        }
        child.remove();
      }
    });
  }

  _pushDownProperties(element) {
    if (this.config.tagsToMerge.length === 0) return;
    if (!this.config.tagsToMerge.includes(element.tagName.toLowerCase())) return;

    const stylesToMove = [];
    let hasOtherStyles = false;

    if (element.style && element.style.length > 0) {
      for (let i = 0; i < element.style.length; i++) {
        const prop = element.style[i];
        if (this.config.stylesToPushDown.includes(prop)) {
          stylesToMove.push({
            prop: prop,
            value: element.style.getPropertyValue(prop),
          });
        } else {
          hasOtherStyles = true;
        }
      }
    }

    let hasOtherAttrs = false;
    if (element.hasAttributes()) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attrName = element.attributes[i].name;
        if (attrName !== "style" && attrName !== "class") {
          hasOtherAttrs = true;
          break;
        }

        if (attrName === "class" && element.attributes[i].value.trim() !== "") {
          hasOtherAttrs = true;
          break;
        }
      }
    }

    const hasClasses = element.classList.length > 0;
    const isSpan = element.tagName === "SPAN";
    const shouldPush = stylesToMove.length > 0 && (hasOtherStyles || hasOtherAttrs || hasClasses || !isSpan);

    if (shouldPush) {
      const hasSingleElementChild = element.children.length === 1 && element.childNodes.length === 1;

      if (hasSingleElementChild) {
        const child = element.firstElementChild;
        stylesToMove.forEach((s) => {
          child.style.setProperty(s.prop, s.value);
          element.style.removeProperty(s.prop);
        });
        if (element.style.length === 0) element.removeAttribute("style");
      } else {
        const newWrapper = document.createElement("span");
        stylesToMove.forEach((s) => {
          newWrapper.style.setProperty(s.prop, s.value);
          element.style.removeProperty(s.prop);
        });
        while (element.firstChild) newWrapper.appendChild(element.firstChild);
        element.appendChild(newWrapper);
        if (element.style.length === 0) element.removeAttribute("style");
      }
    }
  }

  _mergeSiblings(parent) {
    if (this.config.tagsToMerge.length === 0) return;

    let current = parent.firstElementChild;

    while (current) {
      const isMergeableTag = this.config.tagsToMerge.includes(current.tagName.toLowerCase());

      if (isMergeableTag) {
        let nextSibling = current.nextSibling;
        const intermediateNodes = [];
        let canMerge = false;

        while (nextSibling) {
          if (nextSibling.nodeType === Node.TEXT_NODE) {
            if (nextSibling.textContent.trim() === "") {
              intermediateNodes.push(nextSibling);
              nextSibling = nextSibling.nextSibling;
              continue;
            } else {
              canMerge = false;
              break;
            }
          }

          if (nextSibling.nodeType === Node.ELEMENT_NODE) {
            if (this._isSplitterNode(nextSibling)) {
              let nodeToMove = nextSibling;

              while (
                nodeToMove.nodeType === Node.ELEMENT_NODE &&
                !nodeToMove.classList.contains("inline-splitter") &&
                nodeToMove.children.length === 1 &&
                this.config.tagsToMerge.includes(nodeToMove.tagName.toLowerCase())
              ) {
                nodeToMove = nodeToMove.firstElementChild;
              }

              intermediateNodes.push(nodeToMove);

              const wrapperNode = nextSibling;
              const nextAfterWrapper = nextSibling.nextSibling;

              if (wrapperNode !== nodeToMove) {
                wrapperNode.remove();
              }

              nextSibling = nextAfterWrapper;
              continue;
            }

            if (this._areNodesIdentical(current, nextSibling)) {
              canMerge = true;
            }

            break;
          }

          nextSibling = nextSibling.nextSibling;
        }

        if (canMerge && nextSibling) {
          intermediateNodes.forEach((node) => {
            current.appendChild(node);
          });

          while (nextSibling.firstChild) {
            current.appendChild(nextSibling.firstChild);
          }

          nextSibling.remove();
          this._mergeSiblings(current);

          continue;
        } else {
          if (intermediateNodes.length > 0) {
            intermediateNodes.forEach((node) => {
              if (nextSibling) {
                parent.insertBefore(node, nextSibling);
              } else {
                parent.appendChild(node);
              }
            });
          }
        }
      }

      current = current.nextElementSibling;
    }
  }

  _hoistCommonStyles(parent) {
    const children = Array.from(parent.children);
    if (children.length === 0) return;
    if (this.config.stylesToHoist.length === 0) return;

    const propsToHoist = [];

    this.config.stylesToHoist.forEach((prop) => {
      const firstChild = children[0];
      if (!firstChild.style) return;
      const refValue = firstChild.style.getPropertyValue(prop);
      if (!refValue) return;

      const allMatch = children.every((child) => child.style && child.style.getPropertyValue(prop).trim() === refValue.trim());

      if (allMatch) {
        propsToHoist.push({ prop: prop, value: refValue });
      }
    });

    if (propsToHoist.length === 0) return;

    let targetElement = parent;
    let needsWrapper = false;

    if (parent.tagName !== "SPAN") {
      targetElement = document.createElement("span");
      needsWrapper = true;
    }

    propsToHoist.forEach((p) => {
      targetElement.style.setProperty(p.prop, p.value);
      children.forEach((child) => {
        child.style.removeProperty(p.prop);
        if (child.style.length === 0) child.removeAttribute("style");
      });
    });

    if (needsWrapper) {
      while (parent.firstChild) {
        targetElement.appendChild(parent.firstChild);
      }
      parent.appendChild(targetElement);
    }
  }
}
