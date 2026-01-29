export default class {
  constructor(controller) {
    this.controller = controller;
    this.model = this.controller.model;
    this.view = this.controller.view;

    this.countries = [
      { code: "ad", name: "Andorra" },
      { code: "ae", name: "United Arab Emirates" },
      { code: "af", name: "Afghanistan" },
      { code: "ag", name: "Antigua and Barbuda" },
      { code: "ai", name: "Anguilla" },
      { code: "al", name: "Albania" },
      { code: "am", name: "Armenia" },
      { code: "ao", name: "Angola" },
      { code: "ar", name: "Argentina" },
      { code: "as", name: "American Samoa" },
      { code: "at", name: "Austria" },
      { code: "au", name: "Australia" },
      { code: "aw", name: "Aruba" },
      { code: "az", name: "Azerbaijan" },
      { code: "ba", name: "Bosnia and Herzegovina" },
      { code: "bb", name: "Barbados" },
      { code: "bd", name: "Bangladesh" },
      { code: "be", name: "Belgium" },
      { code: "bf", name: "Burkina Faso" },
      { code: "bg", name: "Bulgaria" },
      { code: "bh", name: "Bahrain" },
      { code: "bi", name: "Burundi" },
      { code: "bj", name: "Benin" },
      { code: "bm", name: "Bermuda" },
      { code: "bn", name: "Brunei" },
      { code: "bo", name: "Bolivia" },
      { code: "br", name: "Brazil" },
      { code: "bs", name: "Bahamas" },
      { code: "bt", name: "Bhutan" },
      { code: "bw", name: "Botswana" },
      { code: "by", name: "Belarus" },
      { code: "bz", name: "Belize" },
      { code: "ca", name: "Canada" },
      { code: "cd", name: "Congo (Kinshasa)" },
      { code: "cf", name: "Central African Republic" },
      { code: "cg", name: "Congo (Brazzaville)" },
      { code: "ch", name: "Switzerland" },
      { code: "ci", name: "Ivory Coast" },
      { code: "ck", name: "Cook Islands" },
      { code: "cl", name: "Chile" },
      { code: "cm", name: "Cameroon" },
      { code: "cn", name: "China" },
      { code: "co", name: "Colombia" },
      { code: "cr", name: "Costa Rica" },
      { code: "cu", name: "Cuba" },
      { code: "cv", name: "Cape Verde" },
      { code: "cy", name: "Cyprus" },
      { code: "cz", name: "Czech Republic" },
      { code: "de", name: "Germany" },
      { code: "dj", name: "Djibouti" },
      { code: "dk", name: "Denmark" },
      { code: "dm", name: "Dominica" },
      { code: "do", name: "Dominican Republic" },
      { code: "dz", name: "Algeria" },
      { code: "ec", name: "Ecuador" },
      { code: "ee", name: "Estonia" },
      { code: "eg", name: "Egypt" },
      { code: "eh", name: "Western Sahara" },
      { code: "er", name: "Eritrea" },
      { code: "es", name: "Spain" },
      { code: "et", name: "Ethiopia" },
      { code: "fi", name: "Finland" },
      { code: "fj", name: "Fiji" },
      { code: "fm", name: "Micronesia" },
      { code: "fr", name: "France" },
      { code: "ga", name: "Gabon" },
      { code: "gb", name: "United Kingdom" },
      { code: "gd", name: "Grenada" },
      { code: "ge", name: "Georgia" },
      { code: "gh", name: "Ghana" },
      { code: "gi", name: "Gibraltar" },
      { code: "gl", name: "Greenland" },
      { code: "gm", name: "Gambia" },
      { code: "gn", name: "Guinea" },
      { code: "gq", name: "Equatorial Guinea" },
      { code: "gr", name: "Greece" },
      { code: "gt", name: "Guatemala" },
      { code: "gw", name: "Guinea-Bissau" },
      { code: "gy", name: "Guyana" },
      { code: "hk", name: "Hong Kong" },
      { code: "hn", name: "Honduras" },
      { code: "hr", name: "Croatia" },
      { code: "ht", name: "Haiti" },
      { code: "hu", name: "Hungary" },
      { code: "id", name: "Indonesia" },
      { code: "ie", name: "Ireland" },
      { code: "il", name: "Israel" },
      { code: "in", name: "India" },
      { code: "iq", name: "Iraq" },
      { code: "ir", name: "Iran" },
      { code: "is", name: "Iceland" },
      { code: "it", name: "Italy" },
      { code: "jm", name: "Jamaica" },
      { code: "jo", name: "Jordan" },
      { code: "jp", name: "Japan" },
      { code: "ke", name: "Kenya" },
      { code: "kg", name: "Kyrgyzstan" },
      { code: "kh", name: "Cambodia" },
      { code: "ki", name: "Kiribati" },
      { code: "km", name: "Comoros" },
      { code: "kn", name: "Saint Kitts and Nevis" },
      { code: "kp", name: "North Korea" },
      { code: "kr", name: "South Korea" },
      { code: "kw", name: "Kuwait" },
      { code: "kz", name: "Kazakhstan" },
      { code: "la", name: "Laos" },
      { code: "lb", name: "Lebanon" },
      { code: "lc", name: "Saint Lucia" },
      { code: "li", name: "Liechtenstein" },
      { code: "lk", name: "Sri Lanka" },
      { code: "lr", name: "Liberia" },
      { code: "ls", name: "Lesotho" },
      { code: "lt", name: "Lithuania" },
      { code: "lu", name: "Luxembourg" },
      { code: "lv", name: "Latvia" },
      { code: "ly", name: "Libya" },
      { code: "ma", name: "Morocco" },
      { code: "mc", name: "Monaco" },
      { code: "md", name: "Moldova" },
      { code: "mg", name: "Madagascar" },
      { code: "mh", name: "Marshall Islands" },
      { code: "mk", name: "North Macedonia" },
      { code: "ml", name: "Mali" },
      { code: "mm", name: "Myanmar" },
      { code: "mn", name: "Mongolia" },
      { code: "mo", name: "Macau" },
      { code: "mr", name: "Mauritania" },
      { code: "mt", name: "Malta" },
      { code: "mu", name: "Mauritius" },
      { code: "mv", name: "Maldives" },
      { code: "mw", name: "Malawi" },
      { code: "mx", name: "Mexico" },
      { code: "my", name: "Malaysia" },
      { code: "mz", name: "Mozambique" },
      { code: "na", name: "Namibia" },
      { code: "ne", name: "Niger" },
      { code: "ng", name: "Nigeria" },
      { code: "ni", name: "Nicaragua" },
      { code: "nl", name: "Netherlands" },
      { code: "no", name: "Norway" },
      { code: "np", name: "Nepal" },
      { code: "nr", name: "Nauru" },
      { code: "nz", name: "New Zealand" },
      { code: "om", name: "Oman" },
      { code: "pa", name: "Panama" },
      { code: "pe", name: "Peru" },
      { code: "pg", name: "Papua New Guinea" },
      { code: "ph", name: "Philippines" },
      { code: "pk", name: "Pakistan" },
      { code: "pl", name: "Poland" },
      { code: "pr", name: "Puerto Rico" },
      { code: "ps", name: "Palestine" },
      { code: "pt", name: "Portugal" },
      { code: "pw", name: "Palau" },
      { code: "py", name: "Paraguay" },
      { code: "qa", name: "Qatar" },
      { code: "ro", name: "Romania" },
      { code: "ru", name: "Russia" },
      { code: "rw", name: "Rwanda" },
      { code: "sa", name: "Saudi Arabia" },
      { code: "sb", name: "Solomon Islands" },
      { code: "sc", name: "Seychelles" },
      { code: "sd", name: "Sudan" },
      { code: "se", name: "Sweden" },
      { code: "sg", name: "Singapore" },
      { code: "si", name: "Slovenia" },
      { code: "sk", name: "Slovakia" },
      { code: "sl", name: "Sierra Leone" },
      { code: "sm", name: "San Marino" },
      { code: "sn", name: "Senegal" },
      { code: "so", name: "Somalia" },
      { code: "sr", name: "Suriname" },
      { code: "st", name: "Sao Tome and Principe" },
      { code: "sv", name: "El Salvador" },
      { code: "sy", name: "Syria" },
      { code: "sz", name: "Eswatini" },
      { code: "tc", name: "Turks and Caicos Islands" },
      { code: "td", name: "Chad" },
      { code: "tg", name: "Togo" },
      { code: "th", name: "Thailand" },
      { code: "tj", name: "Tajikistan" },
      { code: "tk", name: "Tokelau" },
      { code: "tl", name: "East Timor" },
      { code: "tm", name: "Turkmenistan" },
      { code: "tn", name: "Tunisia" },
      { code: "to", name: "Tonga" },
      { code: "tr", name: "Turkey" },
      { code: "tt", name: "Trinidad and Tobago" },
      { code: "tv", name: "Tuvalu" },
      { code: "tw", name: "Taiwan" },
      { code: "tz", name: "Tanzania" },
      { code: "ua", name: "Ukraine" },
      { code: "ug", name: "Uganda" },
      { code: "us", name: "United States" },
      { code: "uy", name: "Uruguay" },
      { code: "uz", name: "Uzbekistan" },
      { code: "va", name: "Vatican City" },
      { code: "vc", name: "Saint Vincent and the Grenadines" },
      { code: "ve", name: "Venezuela" },
      { code: "vn", name: "Vietnam" },
      { code: "vu", name: "Vanuatu" },
      { code: "ws", name: "Samoa" },
      { code: "ye", name: "Yemen" },
      { code: "za", name: "South Africa" },
      { code: "zm", name: "Zambia" },
      { code: "zw", name: "Zimbabwe" },
    ];

    this.activeItem = null;
    this.type = "new";
  }

  /* 
  =========================================
     Variables
  ========================================= 
  */

  _vars() {
    this.parent = this.view.el('[data-edit="flags"]');
    this.addFlagButton = this.view.el("#add-flag-item-btn", this.parent);
    this.countryNameInput = this.view.el("#country-name-input", this.parent);
    this.usernameInput = this.view.el("#username-input", this.parent);
    this.autoCompleteContainer = this.view.el("._auto-complete", this.parent);
    this.splitterInput = this.view.el("#splitter-input", this.parent);
    this.itemContainer = this.view.el("#flag-edit-item-container", this.parent);

    this.displayHorizontalCheck = this.view.el("#flag-display-horizontal-check", this.parent);
    this.useNewFlagSwitch = this.view.el("#switch-flag-style-icons-fe", this.parent);
  }

  _target() {
    this.targetContainer = this.model.currentEdit.target;
    this.targetElement = this.view.el(".flag-container", this.targetContainer);
  }

  /* 
  =========================================
     Methods
  ========================================= 
  */

  buildSrc(type, code) {
    const path = type === "old" ? "./assets/countries/" : "./assets/countries/new/";
    const prefix = type === "old" ? ".gif" : ".svg";

    return path + code + prefix;
  }

  getCountries(query) {
    this.view.html(this.autoCompleteContainer, "");

    const filteredCountries = this.countries.filter((country) => country.name.toLowerCase().startsWith(query));
    if (!filteredCountries.length) {
      this.view.html(this.autoCompleteContainer, '<div class="p-2 pe-none">No results found!</div>');
    }

    filteredCountries.forEach((country, index) => {
      const { code, name } = country;

      const skeleton = `
    <div class="_item p-2" tabindex="${index + 1}" data-code="${code}" data-name="${name}">
      <img class="pe-none" src="${this.buildSrc(this.type, code)}" alt="${name}" />
      <span class="pe-none">${name}</span>
    </div>
    `;

      this.view.html(this.autoCompleteContainer, skeleton, true);
    });
  }

  clear(boolean, name = "", country = "") {
    this.usernameInput.value = name;
    this.countryNameInput.value = country;
    this.view.disable(boolean, this.usernameInput, this.countryNameInput);
  }

  updateRenderedFlag(itemSelector, parent, type) {
    this.view.els(itemSelector, parent).forEach((el) => {
      const img = this.view.el("img", el);
      img.src = this.buildSrc(type, el.dataset.code);
    });
  }

  /* 
  =========================================
     Events
  ========================================= 
  */

  init() {
    this._vars();

    this.view.on(this.itemContainer, "click", (e) => {
      if (e.target.matches('[data-action="remove"]')) return this.deleteItemHandler(e);
      if (e.target.matches(".flag-item-content")) return this.itemSelectedHandler(e);

      this.view.toggle(this.activeItem, "active", false);
      this.clear(true);

      this.activeItem = null;
    });

    this.view.on(this.parent, "click", (e) => {
      if (e.target === this.autoCompleteContainer || e.target === this.countryNameInput) return;

      this.view.toggle(this.autoCompleteContainer, "d-none", true);
    });

    this.view.on(this.addFlagButton, "click", (e) => {
      this.view.append(this.itemContainer, this.view.generateFlagItem("rezzvy", "id", "Indonesia", this.buildSrc(this.type, "id")));

      this.view.disable(false, "#modal-edit-save");
      this.view.toggle(this.itemContainer, "ph", false);
    });

    this.view.on(this.autoCompleteContainer, "click", (e) => {
      if (!e.target.matches("._item")) {
        this.view.toggle(this.autoCompleteContainer, "d-none", true);
        return;
      }

      const { name, code } = e.target.dataset;

      if (this.activeItem) {
        this.activeItem.dataset.code = code;
        this.activeItem.dataset.countryName = name;

        const img = this.activeItem.firstElementChild;
        img.src = this.buildSrc(this.type, e.target.dataset.code);
      }

      this.view.val(this.countryNameInput, name);
      this.view.toggle(this.autoCompleteContainer, "d-none", true);
    });

    this.view.on(this.countryNameInput, "click", (e) => {
      this.countrySearchHandler(e);
    });

    this.view.on(this.countryNameInput, "input", (e) => {
      this.countrySearchHandler(e);
    });

    this.view.on(this.usernameInput, "input", (e) => {
      if (!this.activeItem) return;

      this.activeItem.dataset.username = e.target.value;
      this.view.text(this.activeItem.lastElementChild, e.target.value);
    });

    this.view.on(this.useNewFlagSwitch, "input", (e) => {
      this.type = e.target.checked === true ? "new" : "old";
      this.updateRenderedFlag(".flag-item-content", this.itemContainer, this.type);

      this.view.toggle(this.activeItem, "active", false);
      this.clear(true);

      this.activeItem = null;
    });
  }

  /* 
  =========================================
     Handlers
  ========================================= 
  */

  countrySearchHandler(e) {
    const query = e.target.value.trim();
    if (!query) {
      this.view.toggle(this.autoCompleteContainer, "d-none", true);
      return;
    }

    this.view.toggle(this.autoCompleteContainer, "d-none", false);
    this.getCountries(query.toLowerCase());
  }

  deleteItemHandler(e) {
    const item = e.target.closest(".flag-item");

    if (this.view.el(".flag-item-content", item) === this.activeItem) this.activeItem = null;
    item?.remove();

    if (this.model.isNodeEmpty(this.itemContainer)) {
      this.view.toggle(this.itemContainer, "ph", true);
      this.view.disable(true, "#modal-edit-save");

      this.clear(true);
    }
  }

  itemSelectedHandler(e) {
    if (this.activeItem) this.view.toggle(this.activeItem, "active", false);
    this.activeItem = e.target;

    this.view.disable(false, this.usernameInput, this.countryNameInput);
    this.view.toggle(this.activeItem, "active", true);

    this.clear(false, this.activeItem.dataset.username, this.activeItem.dataset.countryName);
  }

  /* 
  =========================================
     States
  ========================================= 
  */

  open() {
    this._target();

    this.view.toggle(this.itemContainer, "ph", true);
    this.view.disable(true, "#modal-edit-save");
    this.view.val(this.splitterInput, this.model.replaceToNBS(false, this.targetElement.dataset.splitter));
    this.clear(true);

    if (this.targetElement.dataset.horizontal === undefined) {
      this.targetElement.dataset.horizontal = "true";
    }

    this.view.el(this.displayHorizontalCheck).checked = this.targetElement.dataset.horizontal === "true" ? true : false;

    if (!this.model.isNodeEmpty(this.targetElement)) {
      this.view.disable(false, "#modal-edit-save");

      const fragment = document.createDocumentFragment();
      const items = this.view.els("span", this.targetElement);

      for (const item of items) {
        const { username, code, countryName } = item.dataset;
        fragment.appendChild(this.view.generateFlagItem(username, code, countryName, this.buildSrc(this.type, code)));
      }

      this.view.append(this.itemContainer, fragment);
      this.view.toggle(this.itemContainer, "ph", false);
    }
  }

  close() {
    this.view.toggle(this.autoCompleteContainer, "d-none", true);
    this.view.html(this.itemContainer, "");
  }

  save() {
    const lastItemElement = this.itemContainer.lastElementChild;
    const splitter = this.model.replaceToNBS(true, this.splitterInput.value);

    let content = "<p>";
    for (const item of this.itemContainer.children) {
      const wrapper = this.view.el(".flag-item-content", item);
      const [img, username] = [wrapper.firstElementChild, wrapper.lastElementChild];
      const { countryName, code } = wrapper.dataset;

      const spacing = item !== lastItemElement ? splitter : "";
      const lineBreak = '<br data-spacing="%SPCITM%">';
      const endOfLine = this.displayHorizontalCheck.checked
        ? `${spacing}`
        : `${spacing === "" ? "" : lineBreak}${spacing}${item !== lastItemElement ? lineBreak : ""}`;

      content += `<span data-country-name="${countryName}" data-code="${code}" data-username="${username.textContent}"><img src="${img.src}">&nbsp;<a target="_blank" href="https://osu.ppy.sh/users/${username.textContent}">${username.textContent}</a></span>${endOfLine}`;
    }
    content += "</p>";

    this.view.toggle(this.targetElement, "ph", false);
    this.view.dataset(this.targetElement, "splitter", splitter);
    this.view.dataset(this.targetElement, "horizontal", this.displayHorizontalCheck.checked);
    this.view.html(this.targetElement, content);
  }
}
