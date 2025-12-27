export default (controller) => {
  const view = controller.view;

  view.generateCanvasItem = (key, editable, uniqueID, content) => {
    const div = document.createElement("div");
    div.classList.add("canvas-item", "osu-style");

    const buttonEdit = `
      <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Edit" data-action="edit" data-key="${key}">
        <i class="fa fa-pencil fa-fw"></i>
      </button>
    `;

    div.innerHTML = `
      <div class="_edit d-flex align-items-center p-2 gap-2 flex-wrap">
        <div class="d-flex gap-2 flex-fill">
          <div>
            <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="collapse" data-bs-target="#${uniqueID}"></button>
          </div>
          <div class="flex-fill">
            <input type="text" class="canvas-item-title form-control-plaintext h-100 text-light" value="${key}" />
          </div>
        </div>
  
        <div>
          <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Move" data-action="move">
            <i class="fa fa-arrows fa-fw"></i>
          </button>
          ${editable === "true" ? buttonEdit : ""}
          <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Duplicate" data-action="duplicate">
            <i class="fa fa-copy fa-fw"></i>
          </button>
          <button class="btn btn-outline-light p-0 border-0" data-bs-toggle="tooltip" data-bs-title="Remove" data-action="remove">
            <i class="fa fa-trash fa-fw"></i>
          </button>
        </div>
      </div>
  
      <div class="_content p-2 collapse show" id="${uniqueID}">
        ${content}
      </div>
    `;

    return div;
  };

  view.generateCanvasTemplateItem = (title, des, templatePath) => {
    return `
      <div class="d-flex flex-wrap align-items-center justify-content-between p-3 rounded-2 modal-box gap-3">
        <div class="flex-fill">
          <h3 class="h5 mb-0 text-light">${title}</h3>
          <p class="m-0">${des}</p>
        </div>
  
        <button class="btn btn-light btn-sm fw-bold" data-template-path="${templatePath}" data-action="render">
          Edit This Template
        </button>
      </div>
    `;
  };

  view.generateCanvasElementListButton = (key, data) => {
    const { editable, icon, tooltipTitle } = data;
    return `
      <button class="canvas-element-list-btn btn btn-dark py-3 px-5" 
        data-action="move" 
        data-bs-toggle="tooltip" 
        data-bs-title="${tooltipTitle}" 
        data-key="${key}" 
        data-editable="${editable}">
        <i class="fa ${icon} fa-fw fa-lg"></i>
      </button>
    `;
  };

  view.generateFlagItem = (username, countryId, countryName) => {
    const div = document.createElement("div");

    div.className = "flag-item d-flex align-items-center gap-1";
    div.innerHTML = `
    <div style="background:rgb(66, 53, 60)"> 
      <button class="btn btn-outline-light btn-sm" data-action="move">
         <i class="fa fa-arrows fa-fw"></i>
      </button>
    </div>

    <div 
    data-username="${username}" 
    data-country-name="${countryName}" 
    data-code="${countryId}" 
    class="flag-item-content flex-fill rounded-2 px-2 d-flex align-items-center gap-1" 
    style="background:rgba(255, 255, 255, 0.125); min-height:31px;">
      <img class="pe-none" src="./assets/countries/${countryId}.gif"> 
      <span class="pe-none d-block flex-fill fw-bold link-pink">${username}</span>
    </div>
 
    <div style="background:rgb(66, 53, 60)"> 
      <button class="btn btn-outline-light btn-sm" data-action="remove">
          <i class="fa fa-trash fa-fw"></i>
      </button>
    </div>
    `;

    return div;
  };

  view.generateListItemEdit = (title = "", content = "") => {
    const div = document.createElement("div");
    div.classList.add("list-item");
    div.innerHTML = `
      <div class="input-group input-group-sm gap-1">
        <div class="input-group-text">
          <button class="btn btn-outline-light btn-sm" data-action="move">
            <i class="fa fa-arrows fa-fw"></i>
          </button>
        </div>
        <input type="text" class="list-title-input form-control rounded-2" placeholder="Title" value="${title}" />
        <div class="input-group-text">
          <button class="btn btn-outline-light btn-sm" data-action="remove">
            <i class="fa fa-trash fa-fw"></i>
          </button>
        </div>
      </div>
      <div class="_list-content d-none">${content}</div>
    `;

    return div;
  };

  view.generateEditImageMapItem = (title = "Untitled", link = "#", style = "") => {
    const item = document.createElement("a");
    item.classList.add("imgmap-edit-item");

    item.dataset.title = title;
    item.dataset.link = link;

    if (style === "") {
      item.style.width = "20%";
      item.style.height = "20%";
      item.style.top = "0%";
      item.style.left = "0%";
    } else {
      item.style.cssText = style;
    }

    return item;
  };

  view.generateOutputImageMapItem = (title, link, style) => {
    return `
      <a class="output-imgmap-item" target="_blank" data-link="${link}" href="${link}" style="${style}" data-title="${title}" data-bs-toggle="tooltip" data-bs-title="${title}"></a>
    `;
  };

  view.generateModalEditSection = (key, content) => {
    return `<div data-edit="${key}" class="d-none">${content}</div>`;
  };

  view.generateListItem = (title, content, uniqueID) => {
    return `<li data-list-item="${uniqueID}" data-title="${title}" data-drop>${content}</li>`;
  };

  view.generateChangelogItem = (date, changes) => {
    return `
    <div>
      <div class="mb-1"><span class="badge text-bg-dark">${date}</span></div>
      <ul>
        ${changes.map((change) => `<li>${change}</li>`).join("")}
      </ul>
    </div>`;
  };

  view.generateGhostTextArea = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "visually-hidden";

    return textarea;
  };
};
