const canvasElementListContainer = document.getElementById("canvas-element-list");
const canvasElementModalEditContainer = new bootstrap.Modal("#modal-edit");
const canvasElementModalEditBody = document.getElementById("modal-edit-body");
const canvasElement = document.getElementById("canvas-wrapper");

const modalRenderLargeList = ["imgmap", "text", "codeblock"];

new bootstrap.Tooltip(document.querySelector("main"), {
  selector: '[data-bs-toggle="tooltip"]',
  trigger: "hover",
});

new bootstrap.Tooltip(canvasElementModalEditBody, {
  selector: '[data-bs-toggle="tooltip"]',
  trigger: "hover",
});

let currentActionKey = "";

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

  if (source.children.length === 0) {
    source.classList.add("ph");
  }
});

let pickr = null;
let quill = null;

const skeleton = {};

function generateCanvasItem(key, content) {
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
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Edit" data-action="edit" data-key="${key}">
        <i class="fa fa-pencil fa-fw"></i>
      </button>
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Duplicate" data-action="duplicate">
        <i class="fa fa-copy fa-fw"></i>
      </button>
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Remove" data-action="remove">
        <i class="fa fa-trash fa-fw"></i>
      </button>
    </div>
  </div>

  <div class="_content p-2 collapse show" id="VY${uniqueID}">
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
    canvasElement.appendChild(generateCanvasItem(key, skeleton[key]));
  }
});

canvasElement.addEventListener("click", (e) => {
  const removeButton = e.target.closest('button[data-action="remove"]');
  const duplicateButton = e.target.closest('button[data-action="duplicate"]');
  const editButton = e.target.closest('button[data-action="edit"]');

  if (removeButton) {
    const tooltip = bootstrap.Tooltip.getInstance(removeButton);
    if (tooltip) {
      tooltip.dispose();
    }

    e.target.closest(".canvas-item").remove();
    return;
  }

  if (duplicateButton) {
    const copied = e.target.closest(".canvas-item").cloneNode(true);
    e.target.closest(".canvas-item").parentElement.appendChild(copied);
    return;
  }

  if (editButton) {
    currentActionKey = editButton.dataset.key;
    canvasElementModalEditContainer.show();
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

canvasElementModalEditContainer._element.addEventListener("hide.bs.modal", () => {
  currentActionKey = "";
});
