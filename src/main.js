const canvasElementListContainer = document.getElementById("canvas-element-list");
const canvasElementModalEditContainer = new bootstrap.Modal("#modal-edit");
const canvasElementModalEditBody = document.getElementById("modal-edit-body");
const canvasElement = document.getElementById("canvas-wrapper");

const modalRenderLargeList = ["imgmap", "text", "codeblock", "image"];
const modalSaveButton = document.getElementById("modal-edit-save");
const modalEditAlert = document.getElementById("modal-edit-alert");

const getCodeModal = new bootstrap.Modal("#getcode-modal");
const audioModal = new bootstrap.Modal("#audio-modal");

new bootstrap.Tooltip(document.querySelector("main"), {
  selector: '[data-bs-toggle="tooltip"]',
  trigger: "hover",
});

new bootstrap.Tooltip(document.getElementById("modal-wrapper"), {
  selector: '[data-bs-toggle="tooltip"]',
  trigger: "hover",
});

const editHandler = {
  spacing: {
    modalEvents: spacingEditEventHandler,
    open: spacingOnOpen,
    save: spacingOnSave,
  },
  codeblock: {
    open: codeblockOnOpen,
    save: codeblockOnSave,
  },
  spoilerbox: {
    modalEvents: spoilerboxEditEventHandler,
    open: spoilerboxOnOpen,
    save: spoilerboxOnSave,
  },
  youtube: {
    modalEvents: youtubeEditEventHandler,
    save: youtubeOnSave,
    open: youtubeOnOpen,
  },
  audio: {
    modalEvents: audioEditEventHandler,
    save: audioOnSave,
    open: audioOnOpen,
  },
  image: {
    modalEvents: imageEditEventHandler,
    save: imageOnSave,
    open: imageOnOpen,
  },
  text: {
    modalEvents: textEditEventHandler,
    save: textOnSave,
    open: textOnOpen,
  },
  heading: {
    modalEvents: headingEditEventHandler,
    save: headingOnSave,
    open: headingOnOpen,
  },
  list: {
    modalEvents: listEditEventHandler,
    save: listOnSave,
    open: listOnOpen,
  },
  quote: {
    modalEvents: quoteEditEventHandler,
    save: quoteOnSave,
    open: quoteOnOpen,
  },
  imgmap: {
    modalEvents: imgmapEditEventHandler,
    save: imgmapOnSave,
    open: imgmapOnOpen,
  },
};

let currentActionKey = "";
let modalSaveTarget = "";
let modalSaveCurrentRender = "";

const drake = dragula({
  isContainer: (el) => {
    return el.hasAttribute("data-drop") || el === canvasElement;
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

drake.on("drop", (el, target, source, sibling) => {
  if (target.classList.contains("ph")) {
    target.classList.remove("ph");
  }

  if (source.children.length === 0 && source.tagName !== "LI") {
    source.classList.add("ph");
  }
});

let pickr = null;
let quill = null;

const skeleton = {};

// Quill JS
var Size = Quill.import("attributors/class/size");
Size.whitelist = ["fs-tiny", "fs-small", "fs-normal", "fs-large"];
Quill.register(Size, true);

var Inline = Quill.import("blots/inline");

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
CodeBlot.blotName = "inlinecode";
CodeBlot.tagName = "code";
CodeBlot.className = "inline";
Quill.register(CodeBlot);

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
SpoilerBlot.blotName = "spoiler";
SpoilerBlot.tagName = "span";
SpoilerBlot.className = "spoiler";
Quill.register(SpoilerBlot);

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

function extractYoutubeID(youtubeLink) {
  const regex =
    /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)([a-zA-Z0-9_-]{11}))|https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
  const match = youtubeLink.match(regex);

  return match ? match[1] || match[2] : null;
}

function showErrorOnModalEdit(boolean, text = "") {
  modalEditAlert.classList.toggle("d-none", !boolean);
  modalEditAlert.querySelector("span").textContent = text;
}

function disableButton(button, boolean) {
  button.classList.toggle("pe-none", boolean);
  button.classList.toggle("opacity-50", boolean);
}

function setButtonLoadingState(button, boolean) {
  const i = button.querySelector("i");

  if (boolean) {
    i.dataset.class = i.className;
    i.className = "fa fa-spinner fa-pulse fa-fw";
    return;
  }

  if (i.dataset.class) {
    i.className = i.dataset.class;
    delete i.dataset.class;
  }
}

function attachModalEditEventHandlers() {
  for (const key in editHandler) {
    if (editHandler[key].modalEvents) {
      editHandler[key].modalEvents();
    }
  }
}

function generateCanvasItem(key, content, isEditable) {
  const div = document.createElement("div");
  const uniqueID = Date.now();
  div.classList.add("canvas-item");

  div.innerHTML = `
  <div class="_edit d-flex align-items-center p-2 gap-2 flex-wrap">
    <div class="d-flex gap-2 flex-fill">
      <div>
        <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="collapse" data-bs-target="#VY${uniqueID}"></button>
      </div>
      <div class="flex-fill">
        <input type="text" class="form-control-plaintext h-100 text-light" value="${key}" />
      </div>
    </div>

    <div>
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Move" data-action="move">
        <i class="fa fa-arrows fa-fw"></i>
      </button>
      ${
        isEditable === "true"
          ? `<button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Edit" data-action="edit" data-key="${key}">
              <i class="fa fa-pencil fa-fw"></i>
             </button>`
          : ""
      } 
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Duplicate" data-action="duplicate">
        <i class="fa fa-copy fa-fw"></i>
      </button>
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Remove" data-action="remove">
        <i class="fa fa-trash fa-fw"></i>
      </button>
    </div>
  </div>

  <div class="_content p-2 collapse show" id="VY${uniqueID}" data-key="${key}">
    ${content}
  </div>
  `;

  return div;
}

async function generateCanvasElementList(canvasElementList) {
  const buttonFragment = document.createDocumentFragment();
  const modalFragment = document.createDocumentFragment();

  for (const key in canvasElementList) {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-dark", "py-3", "px-5");
    button.dataset.bsToggle = "tooltip";
    button.dataset.bsTitle = canvasElementList[key].tooltipTitle;
    button.dataset.key = key;
    button.dataset.editable = canvasElementList[key].editable;
    button.innerHTML = `<i class="fa ${canvasElementList[key].icon} fa-fw fa-lg"></i>`;
    buttonFragment.appendChild(button);

    if (canvasElementList[key].modalPath) {
      const content = await fetch(canvasElementList[key].modalPath).then((res) => res.text());
      const div = document.createElement("div");
      div.dataset.edit = key;
      div.innerHTML = content;
      div.classList.add("d-none");
      modalFragment.appendChild(div);
    }

    if (canvasElementList[key].skeletonPath) {
      const content = await fetch(canvasElementList[key].skeletonPath).then((res) => res.text());
      skeleton[key] = content;
    }
  }

  canvasElementModalEditBody.appendChild(modalFragment);
  canvasElementListContainer.appendChild(buttonFragment);

  return true;
}

async function loadCanvasElements() {
  const response = await fetch("./src/json/canvas-element-list.json");
  const canvasElementList = await response.json();
  await generateCanvasElementList(canvasElementList);

  attachModalEditEventHandlers();
}

function updateStickyState() {
  const element = document.getElementById("element-list-section");

  const elementBottom = element.offsetTop + element.offsetHeight + 16;
  const viewportBottom = window.innerHeight + window.scrollY - 16;

  element.classList.toggle("pinned", elementBottom >= viewportBottom);
}

window.addEventListener("scroll", (e) => {
  updateStickyState();
});

new ResizeObserver(updateStickyState).observe(canvas);
loadCanvasElements();

canvasElementListContainer.addEventListener("click", (e) => {
  const elementListButton = e.target.closest("button[data-key]");

  if (elementListButton) {
    const key = elementListButton.dataset.key;
    const editable = elementListButton.dataset.editable;
    canvasElement.appendChild(generateCanvasItem(key, skeleton[key], editable));
  }
});

canvasElement.addEventListener("click", (e) => {
  const removeButton = e.target.closest('button[data-action="remove"]');
  const duplicateButton = e.target.closest('button[data-action="duplicate"]');
  const editButton = e.target.closest('button[data-action="edit"]');

  if (removeButton) {
    const tooltip = bootstrap.Tooltip.getInstance(removeButton);
    if (tooltip) tooltip.dispose();

    const canvasItem = e.target.closest(".canvas-item");
    const content = canvasItem.closest("._content");
    canvasItem.remove();

    if (content) {
      const innerContainer = content.querySelector("[data-container]");
      innerContainer.classList.toggle("ph", innerContainer && innerContainer.children.length === 0);
    }
  }

  if (duplicateButton) {
    const copied = e.target.closest(".canvas-item").cloneNode(true);
    const uniqueID = "VY" + Date.now();

    const collapseBtn = copied.querySelector('[data-bs-toggle="collapse"]');
    collapseBtn.dataset.bsTarget = `#${uniqueID}`;

    const collapseContent = copied.querySelector("._content");
    collapseContent.id = uniqueID;

    e.target.closest(".canvas-item").parentElement.appendChild(copied);
    return;
  }

  if (editButton) {
    currentActionKey = editButton.dataset.key;
    modalSaveTarget = e.target.closest(".canvas-item").querySelector("._content");
    modalSaveCurrentRender = canvasElementModalEditBody.querySelector(`[data-edit="${currentActionKey}"]`);
    canvasElementModalEditContainer.show();

    if (editHandler[currentActionKey] && editHandler[currentActionKey].open) {
      editHandler[currentActionKey].open();
    }
    return;
  }
});

canvasElementModalEditContainer._element.addEventListener("show.bs.modal", (e) => {
  const modalDialogElement = e.target.querySelector(".modal-dialog");
  if (modalRenderLargeList.includes(currentActionKey)) {
    modalDialogElement.classList.add("modal-lg");
  } else {
    modalDialogElement.classList.remove("modal-lg");
  }

  const currentRenderedModal = canvasElementModalEditBody.querySelector(".d-block[data-edit]");

  if (currentRenderedModal) {
    currentRenderedModal.classList.replace("d-block", "d-none");
  }

  const currentActionModal = canvasElementModalEditBody.querySelector(`[data-edit="${currentActionKey}"]`);

  if (currentActionModal) {
    currentActionModal.classList.replace("d-none", "d-block");
  }
});

canvasElementModalEditContainer._element.addEventListener("hide.bs.modal", (e) => {
  currentActionKey = "";
  modalSaveTarget = "";
  modalSaveCurrentRender = "";

  showErrorOnModalEdit(false);
  const audio = e.target.querySelector("audio");
  if (!audio.paused) {
    audio.pause();
    audio.currentTime = 0;
  }
  audio.removeAttribute("src");

  const iframe = e.target.querySelector("iframe");
  iframe.removeAttribute("src");
});

audioModal._element.addEventListener("hide.bs.modal", (e) => {
  const audio = e.target.querySelector("audio");

  if (!audio.paused) {
    audio.pause();
    audio.currentTime = 0;
  }
});

function spacingEditEventHandler() {
  const wrapper = canvasElementModalEditBody.querySelector('[data-edit="spacing"]');

  wrapper.querySelector('[type="number"]').addEventListener("input", (e) => {
    wrapper.querySelector("#spacing-preview").style.setProperty("--spacing-level", e.target.value);
  });
}

function spacingOnOpen() {
  const el = modalSaveTarget.querySelector(".spacing-item");

  if (!el.dataset.spacingLevel) {
    el.dataset.spacingLevel = "1";
  }

  modalSaveCurrentRender.querySelector('input[type="number"]').value = el.dataset.spacingLevel;
  modalSaveCurrentRender.querySelector("#spacing-preview").style.setProperty("--spacing-level", el.dataset.spacingLevel);
}

function spacingOnSave() {
  const spacingLevel = modalSaveCurrentRender.querySelector('[type="number"]').value;
  modalSaveTarget.querySelector(".spacing-item").dataset.spacingLevel = spacingLevel;
}

function codeblockOnOpen() {
  const content = modalSaveTarget.querySelector("code").textContent;
  modalSaveCurrentRender.querySelector("textarea").value = content;
}

function codeblockOnSave() {
  const content = modalSaveCurrentRender.querySelector("textarea").value;
  modalSaveTarget.querySelector("code").textContent = content;
}

function spoilerboxEditEventHandler() {
  const wrapper = canvasElementModalEditBody.querySelector('[data-edit="spoilerbox"]');

  wrapper.querySelector('input[type="checkbox"]').addEventListener("input", (e) => {
    wrapper.querySelector('input[type="text"]').disabled = !e.target.checked;
  });
}

function spoilerboxOnOpen() {
  const el = modalSaveTarget.querySelector("details");

  if (!el.dataset.title && !el.dataset.box) {
    el.dataset.title = "Show me";
    el.dataset.box = "true";
  }

  modalSaveCurrentRender.querySelector('input[type="checkbox"]').checked = el.dataset.box === "true" ? true : false;
  modalSaveCurrentRender.querySelector('input[type="text"]').value = el.dataset.title;
}

function spoilerboxOnSave() {
  const el = modalSaveTarget.querySelector("details");

  const checkbox = modalSaveCurrentRender.querySelector('input[type="checkbox"]');
  const boxTitle = modalSaveCurrentRender.querySelector('input[type="text"]').value;

  el.dataset.title = boxTitle;
  el.dataset.box = checkbox.checked;

  modalSaveTarget.querySelector("summary").textContent = checkbox.checked ? boxTitle : "Spoiler";
}

function youtubeEditEventHandler() {
  const wrapper = canvasElementModalEditBody.querySelector('[data-edit="youtube"]');

  const submitButton = wrapper.querySelector("#youtube-link-submit-btn");
  const iframe = wrapper.querySelector("iframe");

  wrapper.querySelector('input[type="text"]').addEventListener("input", (e) => {
    disableButton(submitButton, e.target.value === "");
  });

  wrapper.querySelector("#youtube-link-submit-btn").addEventListener("click", (e) => {
    const val = wrapper.querySelector('input[type="text"]').value;

    if (!isValidURL(val)) {
      iframe.classList.add("d-none");
      iframe.parentElement.classList.replace("center-content", "ph");
      showErrorOnModalEdit(true, "The given link is not valid.");
      disableButton(modalSaveButton, true);
      return;
    }

    const videoId = extractYoutubeID(val);

    if (videoId) {
      iframe.src = `https://www.youtube.com/embed/${videoId}?feature=oembed`;
      iframe.dataset.videoId = videoId;

      disableButton(submitButton, true);
      setButtonLoadingState(submitButton, true);
    } else {
      iframe.classList.add("d-none");
      iframe.parentElement.classList.replace("center-content", "ph");
      disableButton(modalSaveButton, true);
      showErrorOnModalEdit(true, "Unable to find YouTube video ID in the link.");
    }
  });

  wrapper.querySelector("iframe").onload = (e) => {
    if (!iframe.src) return;

    iframe.classList.remove("d-none");
    iframe.parentElement.classList.replace("ph", "center-content");

    disableButton(modalSaveButton, false);
    disableButton(submitButton, false);
    setButtonLoadingState(submitButton, false);
    showErrorOnModalEdit(false);
  };

  wrapper.querySelector("iframe").onerror = (e) => {
    if (!iframe.src) return;

    console.log(e);

    iframe.classList.add("d-none");
    iframe.parentElement.classList.replace("center-content", "ph");

    disableButton(modalSaveButton, true);
    disableButton(submitButton, false);
    setButtonLoadingState(submitButton, false);
    showErrorOnModalEdit(true, "Unable to process the link.");
  };
}

function youtubeOnOpen() {
  const iframeTarget = modalSaveTarget.querySelector("iframe");
  const iframeOrigin = modalSaveCurrentRender.querySelector("iframe");

  iframeOrigin.classList.add("d-none");
  iframeOrigin.parentElement.classList.replace("center-content", "ph");

  const inputLinkElement = modalSaveCurrentRender.querySelector('input[type="text"]');
  const submitButton = modalSaveCurrentRender.querySelector("#youtube-link-submit-btn");

  if (iframeTarget.dataset.videoId) {
    inputLinkElement.value = "https://youtu.be/" + iframeTarget.dataset.videoId;
    iframeOrigin.src = `https://www.youtube.com/embed/${iframeTarget.dataset.videoId}?feature=oembed`;
  } else {
    inputLinkElement.value = "";
    iframeOrigin.removeAttribute("src");
  }

  disableButton(submitButton, true);
}

function youtubeOnSave() {
  const iframeTarget = modalSaveTarget.querySelector("iframe");
  const iframeOrigin = modalSaveCurrentRender.querySelector("iframe");

  iframeTarget.parentElement.classList.toggle("ph", false);
  iframeTarget.classList.remove("d-none");
  iframeTarget.dataset.videoId = iframeOrigin.dataset.videoId;
  iframeTarget.src = iframeOrigin.src;
}

function audioEditEventHandler() {
  const wrapper = canvasElementModalEditBody.querySelector('[data-edit="audio"]');
  const submitButton = wrapper.querySelector("#audio-link-submit-btn");

  const audio = wrapper.querySelector("audio");

  wrapper.querySelector('input[type="text"]').addEventListener("input", (e) => {
    disableButton(submitButton, e.target.value === "");
  });

  wrapper.querySelector("#audio-link-submit-btn").addEventListener("click", (e) => {
    const val = wrapper.querySelector('input[type="text"]').value;

    if (!isValidURL(val)) {
      audio.classList.add("d-none");
      audio.parentElement.classList.replace("center-content", "ph");
      showErrorOnModalEdit(true, "The given link is not valid.");
      disableButton(modalSaveButton, true);

      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      return;
    }

    audio.src = val;
    disableButton(submitButton, true);
    setButtonLoadingState(submitButton, true);
  });

  wrapper.querySelector("audio").oncanplaythrough = (e) => {
    if (!audio.src) return;

    audio.classList.remove("d-none");
    audio.parentElement.classList.replace("ph", "center-content");

    disableButton(modalSaveButton, false);
    disableButton(submitButton, false);
    setButtonLoadingState(submitButton, false);
    showErrorOnModalEdit(false);
  };

  wrapper.querySelector("audio").onerror = (e) => {
    if (!audio.src) return;

    console.log(audio.src);

    audio.classList.add("d-none");
    audio.parentElement.classList.replace("center-content", "ph");

    disableButton(modalSaveButton, true);
    disableButton(submitButton, false);
    setButtonLoadingState(submitButton, false);
    showErrorOnModalEdit(true, "Unable to process the link.");
  };
}

function audioOnSave() {
  const playButton = modalSaveTarget.querySelector(".play-audio-btn");
  const modalAudio = modalSaveCurrentRender.querySelector("audio");
  playButton.dataset.audioUrl = modalSaveCurrentRender.querySelector('input[type="text"').value;

  if (!modalAudio.paused) {
    modalAudio.pause();
    modalAudio.currentTime = 0;
  }

  if (playButton.dataset.event === "false") {
    const audio = document.getElementById("audio-modal-preview");
    playButton.dataset.event = "true";

    playButton.addEventListener("click", (e) => {
      if (!e.currentTarget.dataset.audioUrl) return;

      audioModal.show();
      audio.src = e.currentTarget.dataset.audioUrl;
      audio.play();
    });
  }
}

function audioOnOpen() {
  const audio = modalSaveTarget.querySelector(".play-audio-btn");
  const audioModal = modalSaveCurrentRender.querySelector("audio");
  const inputLink = modalSaveCurrentRender.querySelector('input[type="text"]');
  const submitButton = modalSaveCurrentRender.querySelector("#audio-link-submit-btn");
  audioModal.classList.add("d-none");
  audioModal.parentElement.classList.replace("center-content", "ph");

  if (audio.dataset.audioUrl) {
    inputLink.value = audio.dataset.audioUrl;
    audioModal.src = audio.dataset.audioUrl;
  } else {
    inputLink.value = "";
    audioModal.removeAttribute("src");
  }

  disableButton(submitButton, true);
}

function imageEditEventHandler() {
  const wrapper = canvasElementModalEditBody.querySelector('[data-edit="image"]');
  const submitButton = wrapper.querySelector("#image-link-submit-btn");

  const img = wrapper.querySelector("img");

  wrapper.querySelector('input[type="text"]').addEventListener("input", (e) => {
    disableButton(submitButton, e.target.value === "");
  });

  wrapper.querySelector("#image-link-submit-btn").addEventListener("click", (e) => {
    const val = wrapper.querySelector('input[type="text"]').value;

    if (!isValidURL(val)) {
      img.classList.add("d-none");
      showErrorOnModalEdit(true, "The given link is not valid.");
      disableButton(modalSaveButton, true);
      return;
    }

    img.src = val;

    disableButton(submitButton, true);
    setButtonLoadingState(submitButton, true);
  });

  img.onload = () => {
    if (!img.src) return;

    img.classList.remove("d-none");
    img.parentElement.classList.replace("ph", "center-content");

    disableButton(modalSaveButton, false);
    disableButton(submitButton, false);
    setButtonLoadingState(submitButton, false);
    showErrorOnModalEdit(false);
  };

  img.onerror = () => {
    if (!img.src) return;

    console.log(img.src);

    img.classList.add("d-none");
    img.parentElement.classList.replace("center-content", "ph");

    disableButton(modalSaveButton, true);
    disableButton(submitButton, false);
    setButtonLoadingState(submitButton, false);
    showErrorOnModalEdit(true, "Unable to process the link.");
  };
}

function imageOnSave() {
  const imgTarget = modalSaveTarget.querySelector("img");
  const imgOrigin = modalSaveCurrentRender.querySelector("img");

  imgTarget.parentElement.classList.toggle("ph", false);
  imgTarget.classList.remove("d-none");
  imgTarget.dataset.src = imgOrigin.src;
  imgTarget.src = imgOrigin.src;
}

function imageOnOpen() {
  const img = modalSaveTarget.querySelector("img");
  const imgModal = modalSaveCurrentRender.querySelector("img");
  const inputLink = modalSaveCurrentRender.querySelector('input[type="text"]');
  const submitButton = modalSaveCurrentRender.querySelector("#image-link-submit-btn");

  imgModal.classList.add("d-none");
  imgModal.parentElement.classList.replace("center-content", "ph");

  if (img.dataset.src) {
    inputLink.value = img.dataset.src;
    imgModal.src = img.dataset.src;
  } else {
    inputLink.value = "";
    imgModal.removeAttribute("src");
  }

  disableButton(submitButton, true);
}

function textEditEventHandler() {
  quill = new Quill("#text-editor", {
    modules: {
      toolbar: {
        container: "#text-editor-toolbar",
      },
      clipboard: {
        matchVisual: false,
      },
    },
  });

  pickr = Pickr.create({
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

  quill.clipboard.addMatcher(Node.ELEMENT_NODE, function (node, delta) {
    var plaintext = node.innerText;
    var Delta = Quill.import("delta");
    return new Delta().insert(plaintext);
  });

  quill.getModule("toolbar").addHandler("link", (value) => {
    if (value) {
      const range = quill.getSelection();

      if (range && range.length !== 0) {
        const linkFormCostum = document.querySelector(".link-form");
        linkFormCostum.classList.toggle("d-none", false);

        linkFormCostum.querySelector("button").onclick = () => {
          const val = linkFormCostum.querySelector('input[type="text"]').value;
          if (!isValidURL(val)) return alert("The given link is not valid.");

          quill.format("link", val);
          linkFormCostum.classList.toggle("d-none", true);
        };
      }
    } else {
      quill.format("link", false);
    }
  });

  pickr.on("show", (color) => {
    const hexColor = color.toHEXA().toString();
    document.body.classList.add("select-costum");

    const range = quill.getSelection();
    if (range) {
      quill.formatText(range.index, range.length, "color", hexColor);
    }
  });

  pickr.on("hide", () => {
    document.body.classList.remove("select-costum");
  });

  pickr.on("change", (color) => {
    const hexColor = color.toHEXA().toString();
    document.querySelector(".pcr-button").style.setProperty("--pcr-color", hexColor);
    const range = quill.getSelection();
    if (range) {
      quill.formatText(range.index, range.length, "color", hexColor);
    }
  });

  document.getElementById("text-editor").addEventListener("click", (e) => {
    const a = e.target.closest("a");
    const linkFormCostum = document.querySelector(".link-form");

    if (a) {
      linkFormCostum.classList.toggle("d-none", false);

      linkFormCostum.querySelector("button").onclick = () => {
        const val = linkFormCostum.querySelector('input[type="text"]').value;
        if (!isValidURL(val)) return alert("The given link is not valid.");

        a.href = val;
        linkFormCostum.classList.toggle("d-none", true);
      };
    } else {
      linkFormCostum.classList.toggle("d-none", true);
    }
  });
}

function textOnSave() {
  modalSaveTarget.innerHTML = modalSaveCurrentRender.querySelector(".ql-editor").innerHTML;
}
function textOnOpen() {
  modalSaveCurrentRender.querySelector(".ql-editor").innerHTML = modalSaveTarget.innerHTML;
}

function headingEditEventHandler() {
  const wrapper = canvasElementModalEditBody.querySelector('[data-edit="heading"]');

  wrapper.querySelector('input[type="text"]').addEventListener("input", (e) => {
    disableButton(modalSaveButton, e.target.value === "");
  });
}

function listEditEventHandler() {
  const wrapper = canvasElementModalEditBody.querySelector('[data-edit="list"]');

  wrapper.querySelector("#add-list-btn").addEventListener("click", (e) => {
    disableButton(modalSaveButton, false);
    modalBox.classList.toggle("ph", false);

    const listSkeleton = `
 
    <div class="input-group input-group-sm gap-1">
      <div class="input-group-text">
        <button class="btn btn-outline-light btn-sm" data-action="move">
          <i class="fa fa-arrows fa-fw"></i>
        </button>
      </div>
      <input type="text" class="list-title-input form-control rounded-2" placeholder="Title" />
      <div class="input-group-text">
        <button class="btn btn-outline-light btn-sm" data-action="delete">
          <i class="fa fa-trash fa-fw"></i>
        </button>
      </div>
    </div>
        <div class="_list-content d-none"></div>
    `;

    const div = document.createElement("div");
    div.classList.add("list-item");
    div.innerHTML = listSkeleton;

    modalBox.appendChild(div);
  });

  const modalBox = wrapper.querySelector(".modal-box");

  modalBox.addEventListener("click", (e) => {
    const btn = e.target.dataset.action;

    if (btn === "delete") {
      e.target.closest(".list-item").remove();

      if (modalBox.children.length === 0) {
        modalBox.classList.add("ph");
        disableButton(modalSaveButton, true);
      }
    }
  });
}

function listOnSave() {
  const ul = modalSaveTarget.querySelector("ul");

  ul.parentElement.classList.remove("ph");
  ul.classList.remove("d-none");

  ul.classList.toggle("ol", modalSaveCurrentRender.querySelector("#ordered-list-check").checked);
  ul.dataset.ordered = modalSaveCurrentRender.querySelector("#ordered-list-check").checked;

  let li = "";
  const listItems = document.querySelectorAll(".list-item");
  listItems.forEach((item) => {
    const titleElement = item.querySelector(".list-title-input");
    const contentElement = item.querySelector("._list-content");
    li += `<li data-title="${titleElement.value}" data-drop>${contentElement.innerHTML}</li>`;
  });

  ul.innerHTML = li;
}

function listOnOpen() {
  const ul = modalSaveTarget.querySelector("ul");
  const modalBox = modalSaveCurrentRender.querySelector(".modal-box");

  const isChecked = ul.dataset.ordered === "true";

  modalSaveCurrentRender.querySelector("#ordered-list-check").checked = isChecked;

  modalBox.innerHTML = "";

  if (ul.children.length !== 0) {
    modalBox.classList.remove("ph");
    for (const li of ul.children) {
      const div = document.createElement("div");
      div.classList.add("list-item");
      div.innerHTML = `
  <div class="input-group input-group-sm gap-1">
    <div class="input-group-text">
      <button class="btn btn-outline-light btn-sm" data-action="move">
        <i class="fa fa-arrows fa-fw"></i>
      </button>
    </div>
    <input type="text" class="list-title-input form-control rounded-2" placeholder="Title" value="${li.dataset.title}" />
    <div class="input-group-text">
      <button class="btn btn-outline-light btn-sm" data-action="delete">
        <i class="fa fa-trash fa-fw"></i>
      </button>
    </div>
  </div>
        <div class="_list-content d-none">
       ${li.innerHTML}
       </div>
  `;

      modalBox.appendChild(div);
    }
  } else {
    modalBox.classList.add("ph");
  }
}

function headingOnSave() {
  modalSaveTarget.querySelector(".heading").textContent = modalSaveCurrentRender.querySelector('input[type="text"]').value;
}

function headingOnOpen() {
  modalSaveCurrentRender.querySelector('input[type="text"]').value = modalSaveTarget.querySelector(".heading").textContent;
}

function quoteEditEventHandler() {
  const wrapper = canvasElementModalEditBody.querySelector('[data-edit="quote"]');

  wrapper.querySelector("#quote-include-source-check").addEventListener("input", (e) => {
    wrapper.querySelector('input[type="text"]').disabled = !e.target.checked;

    const inputValue = wrapper.querySelector('input[type="text"]').value;

    if (e.target.checked && inputValue === "") disableButton(modalSaveButton, true);
    if (!e.target.checked && inputValue === "") disableButton(modalSaveButton, false);
  });

  wrapper.querySelector('input[type="text"]').addEventListener("input", (e) => {
    const includeSource = wrapper.querySelector("#quote-include-source-check").checked;
    if (includeSource) {
      disableButton(modalSaveButton, e.target.value === "");
    }
  });
}

function quoteOnSave() {
  const blockquote = modalSaveTarget.querySelector("blockquote");
  const blockquoteSource = blockquote.querySelector("._source");

  const modalSourceInput = modalSaveCurrentRender.querySelector('input[type="text"]');
  const modalSourceChecked = modalSaveCurrentRender.querySelector("#quote-include-source-check");

  blockquoteSource.querySelector("span").textContent = modalSourceInput.value;
  blockquoteSource.classList.toggle("d-none", !modalSourceChecked.checked);
  blockquote.dataset.includeSource = modalSourceChecked.checked;
  blockquote.dataset.source = modalSourceInput.value;
}

function quoteOnOpen() {
  const blockquote = modalSaveTarget.querySelector("blockquote");

  if (!blockquote.dataset.includeSource && !blockquote.dataset.source) {
    blockquote.dataset.includeSource = "true";
    blockquote.dataset.source = "Kumi Lone Wolf";
  }

  modalSaveCurrentRender.querySelector('input[type="text"]').value = blockquote.dataset.source;
  modalSaveCurrentRender.querySelector('input[type="text"]').disabled = blockquote.dataset.includeSource !== "true";
  modalSaveCurrentRender.querySelector("#quote-include-source-check").checked = blockquote.dataset.includeSource === "true";
}

function imgmapEditEventHandler() {
  const wrapper = canvasElementModalEditBody.querySelector('[data-edit="imgmap"]');

  const imgLinkInput = wrapper.querySelector("#imgmap-link-input");
  const imgSubmitButton = wrapper.querySelector("#imgmap-link-submit-btn");

  const imageMapContainer = wrapper.querySelector("#imgmap-edit-container");
  const img = imageMapContainer.querySelector("img");

  disableButton(imgSubmitButton, true);

  imgLinkInput.addEventListener("input", (e) => {
    disableButton(imgSubmitButton, e.target.value === "");
  });

  imgSubmitButton.addEventListener("click", (e) => {
    const value = imgLinkInput.value;

    if (imageMapContainer.children.length > 1) {
      const process = confirm("Are you sure you want to proceed? The existing item will be deleted.");

      if (process) {
        const a = imageMapContainer.querySelectorAll("a");

        a.forEach((item) => {
          item.remove();
        });

        disableButton(addImageMapItemButton, true);
        wrapper.querySelector("#imgmap-title-input-item").value = "";
        wrapper.querySelector("#imgmap-link-input-item").value = "";
        wrapper.querySelector("#imgmap-width-input-item").value = "";
        wrapper.querySelector("#imgmap-height-input-item").value = "";

        wrapper.querySelector("#imgmap-title-input-item").disabled = true;
        wrapper.querySelector("#imgmap-link-input-item").disabled = true;
        wrapper.querySelector("#imgmap-width-input-item").disabled = true;
        wrapper.querySelector("#imgmap-height-input-item").disabled = true;
        disableButton(wrapper.querySelector("#imgmap-duplicate-btn"), true);
        disableButton(wrapper.querySelector("#imgmap-remove-btn"), true);
      }
    }

    if (!isValidURL(value)) {
      showErrorOnModalEdit(true, "The given link is not valid.");
      imageMapContainer.classList.add("d-none");
      imageMapContainer.parentElement.classList.add("ph");
      return;
    }

    img.src = value;
  });

  img.onload = () => {
    imageMapContainer.classList.remove("d-none");
    imageMapContainer.parentElement.classList.remove("ph");

    disableButton(addImageMapItemButton, false);
  };

  img.onerror = () => {
    showErrorOnModalEdit(true, "Unable to process the link.");
    imageMapContainer.classList.add("d-none");
    imageMapContainer.parentElement.classList.add("ph");
  };

  const addImageMapItemButton = wrapper.querySelector("#add-imgmap-item-btn");

  disableButton(addImageMapItemButton, true);
  wrapper.querySelector("#imgmap-title-input-item").disabled = true;
  wrapper.querySelector("#imgmap-link-input-item").disabled = true;
  wrapper.querySelector("#imgmap-width-input-item").disabled = true;
  wrapper.querySelector("#imgmap-height-input-item").disabled = true;
  disableButton(wrapper.querySelector("#imgmap-duplicate-btn"), true);
  disableButton(wrapper.querySelector("#imgmap-remove-btn"), true);

  addImageMapItemButton.addEventListener("click", (e) => {
    const a = document.createElement("a");
    a.classList.add("imgmap-edit-item");
    a.innerHTML = ' <div class="_resizer"></div>';
    a.dataset.title = "Untitled";
    a.dataset.link = "#";
    a.dataset.width = "15%";
    a.dataset.height = "15%";

    a.style.width = "15%";
    a.style.height = "15%";
    a.style.top = "0%";
    a.style.left = "0%";

    imageMapContainer.appendChild(a);
  });

  imageMapContainer.addEventListener("click", (e) => {
    const item = e.target.classList.contains("imgmap-edit-item") || e.target.classList.contains("_resizer");

    if (item) {
      if (clickedImageMapItem) {
        clickedImageMapItem.classList.remove("active");
      }

      const el = e.target.classList.contains("imgmap-edit-item") ? e.target : e.target.parentElement;

      clickedImageMapItem = el;

      clickedImageMapItem.classList.add("active");

      wrapper.querySelector("#imgmap-title-input-item").value = el.dataset.title;
      wrapper.querySelector("#imgmap-link-input-item").value = el.dataset.link;
      wrapper.querySelector("#imgmap-width-input-item").value = el.dataset.width;
      wrapper.querySelector("#imgmap-height-input-item").value = el.dataset.height;

      wrapper.querySelector("#imgmap-title-input-item").disabled = false;
      wrapper.querySelector("#imgmap-link-input-item").disabled = false;
      wrapper.querySelector("#imgmap-width-input-item").disabled = false;
      wrapper.querySelector("#imgmap-height-input-item").disabled = false;
      disableButton(wrapper.querySelector("#imgmap-duplicate-btn"), false);
      disableButton(wrapper.querySelector("#imgmap-remove-btn"), false);
      return;
    }

    wrapper.querySelector("#imgmap-title-input-item").value = "";
    wrapper.querySelector("#imgmap-link-input-item").value = "";
    wrapper.querySelector("#imgmap-width-input-item").value = "";
    wrapper.querySelector("#imgmap-height-input-item").value = "";

    wrapper.querySelector("#imgmap-title-input-item").disabled = true;
    wrapper.querySelector("#imgmap-link-input-item").disabled = true;
    wrapper.querySelector("#imgmap-width-input-item").disabled = true;
    wrapper.querySelector("#imgmap-height-input-item").disabled = true;
    disableButton(wrapper.querySelector("#imgmap-duplicate-btn"), true);
    disableButton(wrapper.querySelector("#imgmap-remove-btn"), true);

    clickedImageMapItem.classList.remove("active");
    clickedImageMapItem = null;
  });

  wrapper.querySelector("#imgmap-title-input-item").addEventListener("input", (e) => {
    if (!clickedImageMapItem) return;
    clickedImageMapItem.dataset.title = e.target.value;
  });

  wrapper.querySelector("#imgmap-link-input-item").addEventListener("input", (e) => {
    if (!clickedImageMapItem) return;
    clickedImageMapItem.dataset.link = e.target.value;
    clickedImageMapItem.href = e.target.value;
  });

  wrapper.querySelector("#imgmap-width-input-item").addEventListener("input", (e) => {
    if (e.target.value.includes("%")) {
      e.target.value = e.target.value.replace("%", "");
    }

    if (!clickedImageMapItem || isNaN(e.target.value)) return;

    if (parseInt(e.target.value) > 100) {
      e.target.value = 100;
      clickedImageMapItem.style.width = "100%";
      clickedImageMapItem.style.top = "0%";
      clickedImageMapItem.style.left = "0%";
      return;
    }

    clickedImageMapItem.dataset.width = e.target.value + "%";
    clickedImageMapItem.style.width = e.target.value + "%";
  });

  wrapper.querySelector("#imgmap-height-input-item").addEventListener("input", (e) => {
    if (e.target.value.includes("%")) {
      e.target.value = e.target.value.replace("%", "");
    }

    if (!clickedImageMapItem || isNaN(e.target.value)) return;

    if (parseInt(e.target.value) > 100) {
      e.target.value = 100;
      clickedImageMapItem.style.height = "100%";
      clickedImageMapItem.style.top = "0%";
      clickedImageMapItem.style.left = "0%";
      return;
    }

    clickedImageMapItem.dataset.height = e.target.value + "%";
    clickedImageMapItem.style.height = e.target.value + "%";
  });

  wrapper.querySelector("#imgmap-duplicate-btn").addEventListener("click", (e) => {
    if (!clickedImageMapItem) return;

    const copied = clickedImageMapItem.cloneNode(true);
    copied.classList.remove("active");
    imageMapContainer.appendChild(copied);
  });

  wrapper.querySelector("#imgmap-remove-btn").addEventListener("click", (e) => {
    if (!clickedImageMapItem) return;

    clickedImageMapItem.remove();

    clickedImageMapItem = "";
    wrapper.querySelector("#imgmap-title-input-item").value = "";
    wrapper.querySelector("#imgmap-link-input-item").value = "";
    wrapper.querySelector("#imgmap-width-input-item").value = "";
    wrapper.querySelector("#imgmap-height-input-item").value = "";
  });
}

function imgmapOnSave() {
  const img = modalSaveCurrentRender.querySelector("#imgmap-edit-container img");
  const imgMapItems = modalSaveCurrentRender.querySelectorAll("#imgmap-edit-container .imgmap-edit-item");
  let item = `<img src="${img.src}">`;

  const saveImageMapContainer = modalSaveTarget.querySelector(".imgmap-container");

  imgMapItems.forEach((imgItem) => {
    const link = isValidURL(imgItem.dataset.link) ? imgItem.dataset.link : "https://google.com";
    const title = imgItem.dataset.title;

    item += `<a href="${link}" style="${imgItem.getAttribute("style")}" data-bs-toggle="tooltip" data-bs-title="${title}"></a>`;
    imgItem.remove();
  });

  saveImageMapContainer.parentElement.classList.remove("ph");
  saveImageMapContainer.classList.remove("d-none");
  saveImageMapContainer.innerHTML = item;
}

function imgmapOnOpen() {
  const saveImageMapContainer = modalSaveTarget.querySelector(".imgmap-container");
  const img = saveImageMapContainer.querySelector("img");

  const modalImageMapEditContainer = modalSaveCurrentRender.querySelector("#imgmap-edit-container");

  if (saveImageMapContainer.children.length > 1) {
    modalImageMapEditContainer.classList.remove("d-none");
    modalImageMapEditContainer.parentElement.classList.remove("ph");

    const items = saveImageMapContainer.querySelectorAll("a");

    modalImageMapEditContainer.querySelector("img").src = img.src;
    modalSaveCurrentRender.querySelector("#imgmap-link-input").value = img.src;
    items.forEach((item) => {
      const a = document.createElement("a");
      a.classList.add("imgmap-edit-item");
      a.innerHTML = ' <div class="_resizer"></div>';
      a.dataset.title = item.dataset.bsTitle;
      a.dataset.link = item.href;
      a.dataset.width = item.style.width;
      a.dataset.height = item.style.height;
      a.style = item.getAttribute("style");

      modalImageMapEditContainer.appendChild(a);
    });
  } else {
    const anchors = modalImageMapEditContainer.querySelectorAll("a");

    anchors.forEach((a) => {
      a.remove();
    });

    const addImageMapItemButton = modalSaveCurrentRender.querySelector("#add-imgmap-item-btn");
    modalImageMapEditContainer.classList.add("d-none");
    modalImageMapEditContainer.parentElement.classList.add("ph");

    disableButton(modalSaveCurrentRender.querySelector("#imgmap-link-submit-btn"), true);

    disableButton(addImageMapItemButton, true);
    modalSaveCurrentRender.querySelector("#imgmap-title-input-item").value = "";
    modalSaveCurrentRender.querySelector("#imgmap-link-input-item").value = "";
    modalSaveCurrentRender.querySelector("#imgmap-width-input-item").value = "";
    modalSaveCurrentRender.querySelector("#imgmap-height-input-item").value = "";

    modalSaveCurrentRender.querySelector("#imgmap-title-input-item").disabled = true;
    modalSaveCurrentRender.querySelector("#imgmap-link-input-item").disabled = true;
    modalSaveCurrentRender.querySelector("#imgmap-width-input-item").disabled = true;
    modalSaveCurrentRender.querySelector("#imgmap-height-input-item").disabled = true;
    disableButton(modalSaveCurrentRender.querySelector("#imgmap-duplicate-btn"), true);
    disableButton(modalSaveCurrentRender.querySelector("#imgmap-remove-btn"), true);

    modalSaveCurrentRender.querySelector("#imgmap-link-input").value = "";
  }
}

var clickedImageMapItem = "";

modalSaveButton.addEventListener("click", (e) => {
  if (editHandler[currentActionKey] && editHandler[currentActionKey].save) {
    editHandler[currentActionKey].save();
  }

  canvasElementModalEditContainer.hide();
});

let activeBox = null;
let isResizing = false;
let startX, startY, initialWidth, initialHeight, initialX, initialY;

function handleMouseMove(e) {
  const container = document.getElementById("imgmap-edit-container");
  if (!activeBox) return;

  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;

  if (isResizing) {
    let newWidth = initialWidth + deltaX;
    let newHeight = initialHeight + deltaY;

    newWidth = Math.max(50, Math.min(newWidth, container.offsetWidth - initialX));
    newHeight = Math.max(50, Math.min(newHeight, container.offsetHeight - initialY));

    activeBox.style.width = `${(newWidth / container.offsetWidth) * 100}%`;
    activeBox.style.height = `${(newHeight / container.offsetHeight) * 100}%`;

    activeBox.dataset.width = activeBox.style.width;
    activeBox.dataset.height = activeBox.style.height;

    document.getElementById("imgmap-width-input-item").value = activeBox.style.width;
    document.getElementById("imgmap-height-input-item").value = activeBox.style.height;
  } else {
    let newX = initialX + deltaX;
    let newY = initialY + deltaY;

    newX = Math.max(0, Math.min(newX, container.offsetWidth - activeBox.offsetWidth));
    newY = Math.max(0, Math.min(newY, container.offsetHeight - activeBox.offsetHeight));

    activeBox.style.left = `${(newX / container.offsetWidth) * 100}%`;
    activeBox.style.top = `${(newY / container.offsetHeight) * 100}%`;
  }
}

function handleMouseDown(e) {
  const box = e.target.closest(".imgmap-edit-item");
  if (!box) return;

  if (clickedImageMapItem) {
    clickedImageMapItem.classList.remove("active");
  }

  box.classList.add("active");

  document.querySelector("#imgmap-title-input-item").value = box.dataset.title;
  document.querySelector("#imgmap-link-input-item").value = box.dataset.link;
  document.querySelector("#imgmap-width-input-item").value = box.dataset.width;
  document.querySelector("#imgmap-height-input-item").value = box.dataset.height;

  activeBox = box;
  startX = e.clientX;
  startY = e.clientY;
  initialX = box.offsetLeft;
  initialY = box.offsetTop;
  initialWidth = box.offsetWidth;
  initialHeight = box.offsetHeight;

  if (e.target.classList.contains("_resizer")) {
    isResizing = true;
  }
}

function handleMouseUp() {
  isResizing = false;
  activeBox = null;
}

document.addEventListener("mousedown", handleMouseDown);
document.addEventListener("mousemove", handleMouseMove);
document.addEventListener("mouseup", handleMouseUp);

function rgbToHex(rgbString) {
  const [r, g, b] = rgbString.match(/\d+/g).map(Number);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const codeOutputTextArea = document.getElementById("code-output-textarea");
const mation = new MationHTML();

mation.ignoreSelectors = ["summary", "._duration", "blockquote > ._source"];

mation.register([
  {
    selector: ".spacing-item",
    format: (api) => `%SPCITM%`.repeat(parseInt(api.node.dataset.spacingLevel)),
  },
  {
    selector: "p",
    format: (api) => `%NL%${api.content}%NL%`,
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
    format: (api) => `%NL%[youtube[${api.node.dataset.videoId}[/youtube]%NL%`,
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
    format: (api) => `%ES%[b]${api.content}[/b]%ES%`,
  },
  {
    selector: "em",
    format: (api) => `%ES%[i]${api.content}[/i]%ES%`,
  },
  {
    selector: "s",
    format: (api) => `%ES%[s]${api.content}[/s]%ES%`,
  },
  {
    selector: "u",
    format: (api) => `%ES%[u]${api.content}[/u]%ES%`,
  },
  {
    selector: ".spoiler",
    format: (api) => `%ES%[spoiler]${api.content}[/spoiler]%ES%`,
  },
  {
    selector: "code",
    format: (api) => {
      if (api.node.classList.contains("inline")) {
        return `%ES%[c]${api.content}[/c]%ES%`;
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
      if (api.node.parentElement.classList.contains("imgmap-container")) {
        const width = api.node.style.width.replace("%", "");
        const height = api.node.style.height.replace("%", "");
        const top = api.node.style.top.replace("%", "");
        const left = api.node.style.left.replace("%", "");
        const title = api.node.dataset.bsTitle;
        const link = api.node.href;

        return `${left} ${top} ${width} ${height} ${link} ${title}%NL%`;
      }

      return `%ES%[url=${api.node.href}]${api.content}[/url]%ES%`;
    },
  },
  {
    selector: '[style*="color:"]',
    format: (api) => `%ES%[color=${rgbToHex(api.node.style.color)}]${api.content}[/color]%ES%`,
  },
  {
    selector: '[class^="ql-size-fs-"]',
    format: (api) => {
      const className = api.node.className.split(" ");
      const sizeMaps = {
        "ql-size-fs-tiny": `[size=50]`,
        "ql-size-fs-small": `[size=85]`,
        "ql-size-fs-normal": `[size=100]`,
        "ql-size-fs-large": `[size=150]`,
      };

      return `%ES%${sizeMaps[className[className.length - 1]]}${api.content}[/size]%ES%`;
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

mation.noRuleFallback = (api) => {
  return api.content;
};

document.getElementById("getcode-btn-modal").addEventListener("click", (e) => {
  const content = canvasElement.innerHTML;
  let cleanedContent = mation
    .convert(content)
    .replace(/%NL%/g, "\n")
    .replace(/%ES%/g, " ")
    .replace(/^[\s]*\r?\n/gm, "")
    .replace(/%SPCITM%/g, "\n");

  codeOutputTextArea.value = cleanedContent;

  getCodeModal.show();
});
