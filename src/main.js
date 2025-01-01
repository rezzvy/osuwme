const canvasElementListContainer = document.getElementById("canvas-element-list");
const canvasElementModalEditContainer = new bootstrap.Modal("#modal-edit");
const canvasElementModalEditBody = document.getElementById("modal-edit-body");
const canvasElement = document.getElementById("canvas");

new bootstrap.Tooltip(document.body, {
  selector: '[data-bs-toggle="tooltip"]',
  trigger: "hover",
});

let pickr = null;
let quill = null;

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
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Move">
        <i class="fa fa-arrows fa-fw"></i>
      </button>
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Edit">
        <i class="fa fa-pencil fa-fw"></i>
      </button>
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Duplicate">
        <i class="fa fa-copy fa-fw"></i>
      </button>
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Remove">
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
  const canvasFragment = document.createDocumentFragment();

  for (const key in canvasElementList) {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-dark", "py-3", "px-5");
    button.dataset.bsToggle = "tooltip";
    button.dataset.bsTitle = canvasElementList[key].tooltipTitle;
    button.innerHTML = `<i class="fa ${canvasElementList[key].icon} fa-fw fa-lg"></i>`;
    buttonFragment.appendChild(button);

    if (canvasElementList[key].modalPath) {
      const content = await fetch(canvasElementList[key].modalPath).then((res) => res.text());
      const div = document.createElement("div");
      div.dataset.edit = key;
      div.innerHTML = content;

      modalFragment.appendChild(div);
    }

    if (canvasElementList[key].skeletonPath) {
      const content = await fetch(canvasElementList[key].skeletonPath).then((res) => res.text());
      canvasFragment.appendChild(generateCanvasItem(key, content));
    }
  }

  canvasElementModalEditBody.appendChild(modalFragment);
  canvasElementListContainer.appendChild(buttonFragment);
  canvasElement.appendChild(canvasFragment);

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
