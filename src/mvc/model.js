export default class Model {
  constructor() {
    this.mation = "";

    this.canvasElementListSkeleton = {};

    this.modalOnLargeSizeList = ["imgmap", "text", "codeblock", "image"];
    this._modalEditHandler = {};
    this._currentEdit = {
      key: "",
      target: "",
      modal: "",
    };

    this._imagemap = {
      workingElement: null,
      activeBox: null,
      isResizing: false,
      startX: 0,
      startY: 0,
      initialWidth: 0,
      initialHeight: 0,
      initialX: 0,
      initialY: 0,
    };
  }

  get currentEdit() {
    return this._currentEdit;
  }

  get currentEditKey() {
    return this._currentEdit.key;
  }

  get currentModalEditHandler() {
    return this._modalEditHandler[this._currentEdit.key];
  }

  get modalEditEvents() {
    const events = [];
    for (const handler of Object.values(this._modalEditHandler)) {
      if (handler.modalEvents) events.push(handler.modalEvents);
    }
    return events;
  }

  get imagemap() {
    return this._imagemap;
  }

  set imagemap(data) {
    if (this._imagemap) {
      Object.entries(data).forEach(([key, value]) => {
        if (key in this._imagemap) {
          this._imagemap[key] = value;
        }
      });
    }
  }

  set currentEdit(obj) {
    this._currentEdit.key = obj.key;
    this._currentEdit.target = obj.target;
    this._currentEdit.modal = obj.modal;
  }

  generateBlob(blobType, content) {
    const blob = new Blob([content], { type: blobType });
    return URL.createObjectURL(blob);
  }

  convertToBBCode(html) {
    if (this.mation === "") return;

    return this.mation
      .convert(html)
      .replace(/%NL%/g, "\n")
      .replace(/^\s+/gm, "")
      .replace(/^[\s]*\r?\n/gm, "")
      .replace(/%SPCITM%/g, "\n");
  }

  checkHTMLFormat(string) {
    const content = string;
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    const items = doc.querySelectorAll(".canvas-item");

    return items.length >= 1;
  }

  calcImgMapResizingData(data) {
    const { deltaX, deltaY, container } = data;

    let newWidth = this._imagemap.initialWidth + deltaX;
    let newHeight = this._imagemap.initialHeight + deltaY;

    newWidth = Math.max(50, Math.min(newWidth, container.offsetWidth - this._imagemap.initialX));
    newHeight = Math.max(50, Math.min(newHeight, container.offsetHeight - this._imagemap.initialY));

    return {
      width: ((newWidth / container.offsetWidth) * 100).toFixed(2),
      height: ((newHeight / container.offsetHeight) * 100).toFixed(2),
    };
  }

  calcImgMapMovingData(data) {
    const { deltaX, deltaY, container, activeBox } = data;

    let newX = this._imagemap.initialX + deltaX;
    let newY = this._imagemap.initialY + deltaY;

    newX = Math.max(0, Math.min(newX, container.offsetWidth - activeBox.offsetWidth));
    newY = Math.max(0, Math.min(newY, container.offsetHeight - activeBox.offsetHeight));

    return {
      top: ((newY / container.offsetHeight) * 100).toFixed(2),
      left: ((newX / container.offsetWidth) * 100).toFixed(2),
    };
  }

  registerModalEditHandler(key, obj) {
    this._modalEditHandler[key] = obj;
  }

  isRenderModalOnLargeSize() {
    return this.modalOnLargeSizeList.includes(this._currentEdit.key);
  }

  getCanvasElementSkeleton(key) {
    return this.canvasElementListSkeleton[key];
  }

  registerCanvasElementSkeleton(key, content) {
    this.canvasElementListSkeleton[key] = content;
  }

  extractYoutubeVideoId(youtubeLink) {
    const regex =
      /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)([a-zA-Z0-9_-]{11}))|https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
    const match = youtubeLink.match(regex);

    return match ? match[1] || match[2] : null;
  }

  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  rgbToHex(rgbString) {
    const [r, g, b] = rgbString.match(/\d+/g).map(Number);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  async fetchData(url, type) {
    const req = await fetch(url);
    const res = type === "json" ? await req.json() : await req.text();

    return res;
  }
}
