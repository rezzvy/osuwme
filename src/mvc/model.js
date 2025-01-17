export default class Model {
  constructor() {
    this.imagemap = {
      workingElement: null, // Currently active image map element
      activeBox: null, // Selected box for interaction
      isResizing: false, // Indicates if resizing is active
      startX: 0,
      startY: 0,
      initialWidth: 0,
      initialHeight: 0,
      initialX: 0,
      initialY: 0,
    };

    // List of large-size content types
    this.largeSizeList = ["imgmap", "text", "codeblock", "image"];

    this.handler = {};
    this.skeleton = {};
    this.editHandlers = {};

    // Current edit session data
    this.currentEdit = {
      key: "", // Key of the edit session
      target: "", // Target element for the edit
      modal: "", // Associated modal for the edit
    };
  }

  /* =========================================
     General
  ========================================= */

  // Sets the current edit session
  setCurrentEdit(key, target, modal) {
    this.currentEdit.key = key;
    this.currentEdit.target = target;
    this.currentEdit.modal = modal;
  }

  // Clears the current edit session
  clearCurrentEdit() {
    this.currentEdit.key = "";
    this.currentEdit.target = "";
    this.currentEdit.modal = "";
  }

  /* =========================================
     Getter/Setter and Getter Methods
  ========================================= */

  // Returns the current handler based on the active edit key
  get currentHandler() {
    return this.handler[this.currentEdit.key];
  }

  // Generates a unique ID based on the current timestamp
  get uniqueID() {
    return Date.now();
  }

  // Checks if the current edit key represents a large-size content type
  get isLargeSize() {
    return this.largeSizeList.includes(this.currentEdit.key);
  }

  // Retrieves a skeleton template by its key
  getSkeleton(key) {
    return this.skeleton[key];
  }

  // Converts a string into a single-line representation
  getSingleLine(string, isHTML = true) {
    if (isHTML) return string.replace(/\s{2,}/g, "").replace(/>\s+</g, "><");
    return string.replace(/\s+/g, " ").trim();
  }

  // Extracts a YouTube video ID from a URL
  getYoutubeVideoId(link) {
    const regex =
      /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)([a-zA-Z0-9_-]{11}))|https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
    const match = link.match(regex);

    return match ? match[1] || match[2] : null;
  }

  /* =========================================
     Local Storage (Auto Save Project)
  ========================================= */

  // Gets the latest canvas content from local storage
  get latestCanvasContent() {
    return localStorage.getItem("latestCanvasItem") || null;
  }

  // Sets the latest canvas content in local storage
  set latestCanvasContent(content) {
    localStorage.setItem("latestCanvasItem", content);
  }

  /* =========================================
     Blob / File Reader
  ========================================= */

  // Creates a Blob object and returns its URL
  createBlob(blobType, content) {
    const blob = new Blob([content], { type: blobType });
    return URL.createObjectURL(blob);
  }

  // Revokes the URL for a previously created Blob object
  clearBlob(blob) {
    URL.revokeObjectURL(blob);
  }

  // Reads a file as text and invokes a callback with the result
  readFileAsText(file, callback) {
    const reader = new FileReader();

    reader.onload = (e) => {
      callback(e.target.result);
    };

    reader.readAsText(file);
  }

  /* =========================================
     Methods
  ========================================= */

  // Converts HTML into a single-line string and processes it into BBCode
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

  /* =========================================
     Registration
  ========================================= */

  // Registers a handler with a specified key
  registerHandler(key, instance) {
    this.handler[key] = instance;
  }

  // Registers a skeleton template with a specified key
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

  /* =========================================
     Data Fetching
  ========================================= */

  // Fetches data from a URL and parses it as JSON or text based on the type
  async fetchData(url, type) {
    const req = await fetch(url);
    const res = type === "json" ? await req.json() : await req.text();

    return res;
  }

  // Fetches data asynchronously and applies a callback to the result
  asyncFetchData(url, type, callback) {
    return (async () => {
      const data = await this.fetchData(url, type);
      return callback(data);
    })();
  }

  /* =========================================
     Logic Methods
  ========================================= */
  isMobileDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  // Validates if the imported project HTML contains at least one canvas item
  isValidProjectFile(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    return doc.querySelectorAll(".canvas-item").length >= 1;
  }

  // Checks if a node is empty, with an optional length and parent element
  isNodeEmpty(target, length = 0, parent = document) {
    const node = typeof target === "string" ? parent.querySelector(target) : target;
    return node.children.length === length;
  }

  // Validates if a given URL is correctly formatted
  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Checks if a link is an osu! profile link with a valid username
  isOsuProfileLink(link) {
    return /^https:\/\/osu\.ppy\.sh\/users\/[a-zA-Z][a-zA-Z0-9\s-_]*[a-zA-Z0-9]$/.test(link);
  }

  /* =========================================
     Color Conversion
  ========================================= */

  // Converts an RGB string to a hexadecimal color
  rgbToHex(rgbString) {
    const [r, g, b] = rgbString.match(/\d+/g).map(Number);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  // Converts a hexadecimal color to an RGB object
  hexToRgb(hex) {
    return {
      r: parseInt(hex.substring(1, 3), 16),
      g: parseInt(hex.substring(3, 5), 16),
      b: parseInt(hex.substring(5, 7), 16),
    };
  }

  /* =========================================
     Gradient
  ========================================= */

  // Generates gradient colors between two specified colors for a given text
  generateGradient(text, colorStart = "#FF0000", colorEnd = "#0000FF") {
    const colors = [];

    const colorStartRgb = this.hexToRgb(colorStart);
    const colorEndRgb = this.hexToRgb(colorEnd);

    const textLength = text.length;

    const rinc = (colorEndRgb.r - colorStartRgb.r) / textLength;
    const ginc = (colorEndRgb.g - colorStartRgb.g) / textLength;
    const binc = (colorEndRgb.b - colorStartRgb.b) / textLength;

    for (let i = 0; i < textLength; i++) {
      const r = Math.round(colorStartRgb.r + rinc * i);
      const g = Math.round(colorStartRgb.g + ginc * i);
      const b = Math.round(colorStartRgb.b + binc * i);

      colors.push(this.rgbToHex(`rgb(${r}, ${g}, ${b})`));
    }

    return colors;
  }

  /* =========================================
     Quill JS Library Helper
  ========================================= */

  // Checks if the current selection in Quill has a link
  selectionHasLink() {
    if (!this.latestSelection) return;

    for (let i = this.latestSelection.index; i < this.latestSelection.index + this.latestSelection.length; i++) {
      const charFormat = this.quill.getFormat(i, 1);
      if (charFormat.link) {
        return true;
      }
    }
    return false;
  }

  // Creates and registers a custom inline blot for Quill
  createInlineBlot({ blotName, tagName, className }) {
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
  }

  /* =========================================
     Image Map
  ========================================= */

  // Sets image map data for resizing or moving operations
  setImageMapData(event, element) {
    this.imagemap.workingElement = element;
    this.imagemap.activeBox = element;
    this.imagemap.startY = event.touches?.[0]?.clientY ?? event.clientY;
    this.imagemap.startX = event.touches?.[0]?.clientX ?? event.clientX;
    this.imagemap.initialX = element.offsetLeft;
    this.imagemap.initialY = element.offsetTop;
    this.imagemap.initialWidth = element.offsetWidth;
    this.imagemap.initialHeight = element.offsetHeight;
    this.imagemap.isResizing = event.target.classList.contains("_resizer");
  }

  // Calculates new pointer data for resizing or moving within a container
  calculatePointerData(event, container, type) {
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const clientY = event.touches?.[0]?.clientY ?? event.clientY;

    const deltaX = clientX - this.imagemap.startX;
    const deltaY = clientY - this.imagemap.startY;

    if (type === "resizing") {
      let newWidth = this.imagemap.initialWidth + deltaX;
      let newHeight = this.imagemap.initialHeight + deltaY;

      const minWidth = container.offsetWidth * 0.02;
      const minHeight = container.offsetHeight * 0.02;

      newWidth = Math.max(minWidth, Math.min(newWidth, container.offsetWidth - this.imagemap.initialX));
      newHeight = Math.max(minHeight, Math.min(newHeight, container.offsetHeight - this.imagemap.initialY));

      const width = ((newWidth / container.offsetWidth) * 100).toFixed(2);
      const height = ((newHeight / container.offsetHeight) * 100).toFixed(2);

      return [width, height];
    } else if (type === "moving") {
      let newX = this.imagemap.initialX + deltaX;
      let newY = this.imagemap.initialY + deltaY;

      newX = Math.max(0, Math.min(newX, container.offsetWidth - this.imagemap.activeBox.offsetWidth));
      newY = Math.max(0, Math.min(newY, container.offsetHeight - this.imagemap.activeBox.offsetHeight));

      const top = ((newY / container.offsetHeight) * 100).toFixed(2);
      const left = ((newX / container.offsetWidth) * 100).toFixed(2);

      return [top, left];
    }
  }
}
