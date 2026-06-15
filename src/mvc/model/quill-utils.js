export default (controller) => {
  const model = controller.model;

  model.selectionHasLink = () => {
    if (!model.latestSelection) return;

    for (let i = model.latestSelection.index; i < model.latestSelection.index + model.latestSelection.length; i++) {
      const charFormat = model.quill.getFormat(i, 1);
      if (charFormat.link) {
        return true;
      }
    }
    return false;
  };

  model.selectionHasProfileLink = () => {
    if (!model.latestSelection) return null;

    for (let i = model.latestSelection.index; i < model.latestSelection.index + model.latestSelection.length; i++) {
      const charFormat = model.quill.getFormat(i, 1);
      if (charFormat.link) {
        return model.isOsuProfileLink(charFormat.link);
      }
    }
    return null;
  };


  model.createInlineBlot = ({ blotName, tagName, className }) => {
    const Inline = Quill.import("blots/inline");

    const BlotClass = class extends Inline {
      static create(value) {
        const node = super.create(value);
        if (className) {
          node.classList.add(className);
        }
        return node;
      }

      static formats(node) {
        return className ? node.classList.contains(className) : false;
      }
    };

    BlotClass.blotName = blotName;
    BlotClass.tagName = tagName;
    BlotClass.className = className;

    return BlotClass;
  };

  model.createInlineEmbedBlot = ({ blotName, tagName, className, valueAttr = "src", attributes = {} }) => {
    const Embed = Quill.import("blots/embed");

    const BlotClass = class extends Embed {
      static create(value) {
        const node = super.create();

        const finalValue = typeof value === "string" ? value : value?.[valueAttr] || value?.url;

        if (className) {
          node.classList.add(className);
        }

        if (valueAttr && finalValue) {
          node.setAttribute(valueAttr, finalValue);
        }

        Object.entries(attributes).forEach(([key, attrValue]) => {
          node.setAttribute(key, attrValue);
        });

        node.setAttribute("contenteditable", "false");

        return node;
      }

      static value(node) {
        return node.getAttribute(valueAttr);
      }
    };

    BlotClass.blotName = blotName;
    BlotClass.tagName = tagName;
    BlotClass.className = className;

    return BlotClass;
  };
};
