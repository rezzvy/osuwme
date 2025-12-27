export default class Model {
  constructor() {
    this.imagemap = {
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

    this.largeSizeList = ["imgmap", "text", "codeblock", "image"];

    this.handler = {};
    this.skeleton = {};
    this.editHandlers = {};

    this.currentEdit = {
      key: "",
      target: "",
      modal: "",
    };

    this.currentGradient = "horizontal";

    this.history = {
      STACK_SIZE: 50,
      stack: {
        undo: [],
        redo: [],
        tempMoveData: [],
      },
    };

    this.apiConfig = {
      OSU_CLIENT_ID: "46987",
      API_BASE: "http://localhost:3000/api",
      REDIRECT: "http://127.0.0.1:5500/",
    };
  }

  /* 
  =========================================
     History (Undo/Redo)
  ========================================= 
  */

  getHistory(type) {
    const stack = type === "undo" ? this.history.stack.undo : this.history.stack.redo;

    return stack.length !== 0 ? stack.pop() : false;
  }

  pushHistory(type, stackData) {
    const stack = type === "undo" ? this.history.stack.undo : this.history.stack.redo;
    if (stack.length >= this.history.STACK_SIZE) stack.shift();

    stack.push(stackData);
  }

  clearHistory() {
    this.history.stack.undo.length = 0;
    this.history.stack.redo.length = 0;
  }

  /* 
  =========================================
     Modal Edit Methods
  ========================================= 
  */

  setCurrentEdit(key, target, modal) {
    this.currentEdit.key = key;
    this.currentEdit.target = target;
    this.currentEdit.modal = modal;
  }

  clearCurrentEdit() {
    this.currentEdit.key = "";
    this.currentEdit.target = "";
    this.currentEdit.modal = "";
  }

  /* 
  =========================================
     Getter/Setter and Getter Methods
  ========================================= 
  */

  get currentHandler() {
    return this.handler[this.currentEdit.key];
  }

  get uniqueID() {
    return Date.now() + "-" + Math.floor(Math.random() * 1000000);
  }

  get isLargeSize() {
    return this.largeSizeList.includes(this.currentEdit.key);
  }

  getSkeleton(key) {
    return this.skeleton[key];
  }

  getSingleLine(string) {
    return string.replace(/\s{2,}/g, "").replace(/>\s+</g, "><");
  }

  getYoutubeVideoId(link) {
    const regex =
      /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)([a-zA-Z0-9_-]{11}))|https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
    const match = link.match(regex);

    return match ? match[1] || match[2] : null;
  }

  get latestCanvasContent() {
    return localStorage.getItem("latestCanvasItem") || null;
  }

  set latestCanvasContent(content) {
    localStorage.setItem("latestCanvasItem", content);
  }

  /* 
  =========================================
     Generate Output BBCode
  ========================================= 
  */

  output(html) {
    const content = this.getSingleLine(html);

    return this.mation
      .convert(content) // Converts the content to BBCode
      .replace(/%NL%/g, "\n") // Replaces placeholders with newlines
      .replace(/^\s+/gm, "") // Removes leading whitespace from lines
      .replace(/^[\s]*\r?\n/gm, "") // Removes empty lines
      .replace(/%SPCITM%\s*/g, "\n") // Replaces placeholder with newline
      .trim();
  }

  /* 
  =========================================
     Registration
  ========================================= 
  */

  registerHandler(key, instance) {
    this.handler[key] = instance;
  }

  registerSkeleton(key, value) {
    this.skeleton[key] = value;
  }

  registerBBCodeConversion(selector, handler) {
    return this.mation.register({
      selector: selector,
      format: (api) => {
        return handler(api);
      },
    });
  }

  registerClonedBBCodeConversion(selector, handler) {
    return this.clonedMation.register({
      selector: selector,
      format: (api) => {
        return handler(api);
      },
    });
  }

  /* 
  =========================================
     Helpers
  ========================================= 
  */

  async fetchData(url, type) {
    const req = await fetch(url);
    const res = type === "json" ? await req.json() : await req.text();

    return res;
  }

  asyncFetchData(url, type, callback) {
    return (async () => {
      const data = await this.fetchData(url, type);
      return callback(data);
    })();
  }

  isMobileDevice() {
    return "ontouchstart" in window;
  }

  isValidProjectFile(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    return doc.querySelectorAll(".canvas-item").length >= 1;
  }

  isNodeEmpty(target, length = 0, parent = document) {
    const node = typeof target === "string" ? parent.querySelector(target) : target;
    return node.children.length === length;
  }

  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  isOsuProfileLink(link) {
    return /https:\/\/osu\.ppy\.sh\/users\/(?!\d+$)[A-Za-z0-9_\-\[\]]+/.test(link);
  }

  createBlob(blobType, content) {
    const blob = new Blob([content], { type: blobType });
    return URL.createObjectURL(blob);
  }

  clearBlob(blob) {
    URL.revokeObjectURL(blob);
  }

  readFileAsText(file, callback) {
    const reader = new FileReader();

    reader.onload = (e) => {
      callback(e.target.result);
    };

    reader.readAsText(file);
  }

  replaceTextAreaSpacing(isConvert, value) {
    if (isConvert) {
      return value.replace(/\n/g, "%SPCITM%").replace(/ /g, "&nbsp;");
    }

    return value.replace(/&nbsp;/g, " ").replace(/%SPCITM%/g, "\n");
  }

  replaceToNBS(boolean, value) {
    return boolean ? value.replace(/ /g, "&nbsp;") : value.replace(/&nbsp;/g, " ");
  }

  /* 
  =========================================
    Auth
  ========================================= 
  */

  getAuthData() {
    const authData = JSON.parse(localStorage.getItem("osuwme-auth-session"));

    return authData;
  }

  setAuthData(data) {
    localStorage.setItem("osuwme-auth-session", JSON.stringify(data));
  }

  clearAuthData() {
    localStorage.removeItem("osuwme-auth-session");
  }

  clearUserPageAuthData() {
    const authData = this.getAuthData();
    authData.user.page = null;

    this.setAuthData(authData);
  }

  checkAuthSession() {
    const authData = this.getAuthData();

    if (authData) {
      if (Date.now() > Number(authData.expire)) return false;
    }

    return true;
  }
}
