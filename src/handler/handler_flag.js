export default class {
  constructor(controller) {
    this.controller = controller;
    this.model = this.controller.model;
    this.view = this.controller.view;

    this.countries = [
      { img: "ad.gif", name: "Andorra" },
      { img: "ae.gif", name: "United Arab Emirates" },
      { img: "af.gif", name: "Afghanistan" },
      { img: "ag.gif", name: "Antigua and Barbuda" },
      { img: "ai.gif", name: "Anguilla" },
      { img: "al.gif", name: "Albania" },
      { img: "am.gif", name: "Armenia" },
      { img: "an.gif", name: "Netherlands Antilles" },
      { img: "ao.gif", name: "Angola" },
      { img: "ar.gif", name: "Argentina" },
      { img: "as.gif", name: "American Samoa" },
      { img: "at.gif", name: "Austria" },
      { img: "au.gif", name: "Australia" },
      { img: "aw.gif", name: "Aruba" },
      { img: "az.gif", name: "Azerbaijan" },
      { img: "ba.gif", name: "Bosnia and Herzegovina" },
      { img: "bb.gif", name: "Barbados" },
      { img: "bd.gif", name: "Bangladesh" },
      { img: "be.gif", name: "Belgium" },
      { img: "bf.gif", name: "Burkina Faso" },
      { img: "bg.gif", name: "Bulgaria" },
      { img: "bh.gif", name: "Bahrain" },
      { img: "bi.gif", name: "Burundi" },
      { img: "bj.gif", name: "Benin" },
      { img: "bm.gif", name: "Bermuda" },
      { img: "bn.gif", name: "Brunei" },
      { img: "bo.gif", name: "Bolivia" },
      { img: "br.gif", name: "Brazil" },
      { img: "bs.gif", name: "Bahamas" },
      { img: "bt.gif", name: "Bhutan" },
      { img: "bw.gif", name: "Botswana" },
      { img: "by.gif", name: "Belarus" },
      { img: "bz.gif", name: "Belize" },
      { img: "ca.gif", name: "Canada" },
      { img: "cd.gif", name: "Congo (Kinshasa)" },
      { img: "cf.gif", name: "Central African Republic" },
      { img: "cg.gif", name: "Congo (Brazzaville)" },
      { img: "ch.gif", name: "Switzerland" },
      { img: "ci.gif", name: "Ivory Coast" },
      { img: "ck.gif", name: "Cook Islands" },
      { img: "cl.gif", name: "Chile" },
      { img: "cm.gif", name: "Cameroon" },
      { img: "cn.gif", name: "China" },
      { img: "co.gif", name: "Colombia" },
      { img: "cr.gif", name: "Costa Rica" },
      { img: "cu.gif", name: "Cuba" },
      { img: "cv.gif", name: "Cape Verde" },
      { img: "cy.gif", name: "Cyprus" },
      { img: "cz.gif", name: "Czech Republic" },
      { img: "de.gif", name: "Germany" },
      { img: "dj.gif", name: "Djibouti" },
      { img: "dk.gif", name: "Denmark" },
      { img: "dm.gif", name: "Dominica" },
      { img: "do.gif", name: "Dominican Republic" },
      { img: "dz.gif", name: "Algeria" },
      { img: "ec.gif", name: "Ecuador" },
      { img: "ee.gif", name: "Estonia" },
      { img: "eg.gif", name: "Egypt" },
      { img: "eh.gif", name: "Western Sahara" },
      { img: "er.gif", name: "Eritrea" },
      { img: "es.gif", name: "Spain" },
      { img: "et.gif", name: "Ethiopia" },
      { img: "fi.gif", name: "Finland" },
      { img: "fj.gif", name: "Fiji" },
      { img: "fm.gif", name: "Micronesia" },
      { img: "fr.gif", name: "France" },
      { img: "ga.gif", name: "Gabon" },
      { img: "gb.gif", name: "United Kingdom" },
      { img: "gd.gif", name: "Grenada" },
      { img: "ge.gif", name: "Georgia" },
      { img: "gh.gif", name: "Ghana" },
      { img: "gi.gif", name: "Gibraltar" },
      { img: "gl.gif", name: "Greenland" },
      { img: "gm.gif", name: "Gambia" },
      { img: "gn.gif", name: "Guinea" },
      { img: "gq.gif", name: "Equatorial Guinea" },
      { img: "gr.gif", name: "Greece" },
      { img: "gt.gif", name: "Guatemala" },
      { img: "gw.gif", name: "Guinea-Bissau" },
      { img: "gy.gif", name: "Guyana" },
      { img: "hk.gif", name: "Hong Kong" },
      { img: "hn.gif", name: "Honduras" },
      { img: "hr.gif", name: "Croatia" },
      { img: "ht.gif", name: "Haiti" },
      { img: "hu.gif", name: "Hungary" },
      { img: "id.gif", name: "Indonesia" },
      { img: "ie.gif", name: "Ireland" },
      { img: "il.gif", name: "Israel" },
      { img: "in.gif", name: "India" },
      { img: "iq.gif", name: "Iraq" },
      { img: "ir.gif", name: "Iran" },
      { img: "is.gif", name: "Iceland" },
      { img: "it.gif", name: "Italy" },
      { img: "jm.gif", name: "Jamaica" },
      { img: "jo.gif", name: "Jordan" },
      { img: "jp.gif", name: "Japan" },
      { img: "ke.gif", name: "Kenya" },
      { img: "kg.gif", name: "Kyrgyzstan" },
      { img: "kh.gif", name: "Cambodia" },
      { img: "ki.gif", name: "Kiribati" },
      { img: "km.gif", name: "Comoros" },
      { img: "kn.gif", name: "Saint Kitts and Nevis" },
      { img: "kp.gif", name: "North Korea" },
      { img: "kr.gif", name: "South Korea" },
      { img: "kw.gif", name: "Kuwait" },
      { img: "kz.gif", name: "Kazakhstan" },
      { img: "la.gif", name: "Laos" },
      { img: "lb.gif", name: "Lebanon" },
      { img: "lc.gif", name: "Saint Lucia" },
      { img: "li.gif", name: "Liechtenstein" },
      { img: "lk.gif", name: "Sri Lanka" },
      { img: "lr.gif", name: "Liberia" },
      { img: "ls.gif", name: "Lesotho" },
      { img: "lt.gif", name: "Lithuania" },
      { img: "lu.gif", name: "Luxembourg" },
      { img: "lv.gif", name: "Latvia" },
      { img: "ly.gif", name: "Libya" },
      { img: "ma.gif", name: "Morocco" },
      { img: "mc.gif", name: "Monaco" },
      { img: "md.gif", name: "Moldova" },
      { img: "mg.gif", name: "Madagascar" },
      { img: "mh.gif", name: "Marshall Islands" },
      { img: "mk.gif", name: "North Macedonia" },
      { img: "ml.gif", name: "Mali" },
      { img: "mm.gif", name: "Myanmar" },
      { img: "mn.gif", name: "Mongolia" },
      { img: "mo.gif", name: "Macau" },
      { img: "mr.gif", name: "Mauritania" },
      { img: "mt.gif", name: "Malta" },
      { img: "mu.gif", name: "Mauritius" },
      { img: "mv.gif", name: "Maldives" },
      { img: "mw.gif", name: "Malawi" },
      { img: "mx.gif", name: "Mexico" },
      { img: "my.gif", name: "Malaysia" },
      { img: "mz.gif", name: "Mozambique" },
      { img: "na.gif", name: "Namibia" },
      { img: "ne.gif", name: "Niger" },
      { img: "ng.gif", name: "Nigeria" },
      { img: "ni.gif", name: "Nicaragua" },
      { img: "nl.gif", name: "Netherlands" },
      { img: "no.gif", name: "Norway" },
      { img: "np.gif", name: "Nepal" },
      { img: "nr.gif", name: "Nauru" },
      { img: "nz.gif", name: "New Zealand" },
      { img: "om.gif", name: "Oman" },
      { img: "pa.gif", name: "Panama" },
      { img: "pe.gif", name: "Peru" },
      { img: "pg.gif", name: "Papua New Guinea" },
      { img: "ph.gif", name: "Philippines" },
      { img: "pk.gif", name: "Pakistan" },
      { img: "pl.gif", name: "Poland" },
      { img: "pr.gif", name: "Puerto Rico" },
      { img: "ps.gif", name: "Palestine" },
      { img: "pt.gif", name: "Portugal" },
      { img: "pw.gif", name: "Palau" },
      { img: "py.gif", name: "Paraguay" },
      { img: "qa.gif", name: "Qatar" },
      { img: "ro.gif", name: "Romania" },
      { img: "ru.gif", name: "Russia" },
      { img: "rw.gif", name: "Rwanda" },
      { img: "sa.gif", name: "Saudi Arabia" },
      { img: "sb.gif", name: "Solomon Islands" },
      { img: "sc.gif", name: "Seychelles" },
      { img: "sd.gif", name: "Sudan" },
      { img: "se.gif", name: "Sweden" },
      { img: "sg.gif", name: "Singapore" },
      { img: "si.gif", name: "Slovenia" },
      { img: "sk.gif", name: "Slovakia" },
      { img: "sl.gif", name: "Sierra Leone" },
      { img: "sm.gif", name: "San Marino" },
      { img: "sn.gif", name: "Senegal" },
      { img: "so.gif", name: "Somalia" },
      { img: "sr.gif", name: "Suriname" },
      { img: "st.gif", name: "Sao Tome and Principe" },
      { img: "sv.gif", name: "El Salvador" },
      { img: "sy.gif", name: "Syria" },
      { img: "sz.gif", name: "Eswatini" },
      { img: "tc.gif", name: "Turks and Caicos Islands" },
      { img: "td.gif", name: "Chad" },
      { img: "tg.gif", name: "Togo" },
      { img: "th.gif", name: "Thailand" },
      { img: "tj.gif", name: "Tajikistan" },
      { img: "tk.gif", name: "Tokelau" },
      { img: "tl.gif", name: "East Timor" },
      { img: "tm.gif", name: "Turkmenistan" },
      { img: "tn.gif", name: "Tunisia" },
      { img: "to.gif", name: "Tonga" },
      { img: "tr.gif", name: "Turkey" },
      { img: "tt.gif", name: "Trinidad and Tobago" },
      { img: "tv.gif", name: "Tuvalu" },
      { img: "tw.gif", name: "Taiwan" },
      { img: "tz.gif", name: "Tanzania" },
      { img: "ua.gif", name: "Ukraine" },
      { img: "ug.gif", name: "Uganda" },
      { img: "us.gif", name: "United States" },
      { img: "uy.gif", name: "Uruguay" },
      { img: "uz.gif", name: "Uzbekistan" },
      { img: "va.gif", name: "Vatican City" },
      { img: "vc.gif", name: "Saint Vincent and the Grenadines" },
      { img: "ve.gif", name: "Venezuela" },
      { img: "vn.gif", name: "Vietnam" },
      { img: "vu.gif", name: "Vanuatu" },
      { img: "ws.gif", name: "Samoa" },
      { img: "ye.gif", name: "Yemen" },
      { img: "za.gif", name: "South Africa" },
      { img: "zm.gif", name: "Zambia" },
      { img: "zw.gif", name: "Zimbabwe" },
    ];

    this.activeItem = null;
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

  getCountries(query) {
    this.view.html(this.autoCompleteContainer, "");

    const filteredCountries = this.countries.filter((country) => country.name.toLowerCase().startsWith(query));
    if (!filteredCountries.length) {
      this.view.html(this.autoCompleteContainer, '<div class="p-2 pe-none">No results found!</div>');
    }

    filteredCountries.forEach((country, index) => {
      const { img, name } = country;

      const skeleton = `
    <div class="_item p-2" tabindex="${index + 1}" data-code="${img.substring(0, 2)}" data-name="${name}">
      <img class="pe-none" src="./assets/countries/${img}" alt="${name}" />
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
      this.view.append(this.itemContainer, this.view.generateFlagItem("Kumi Lone Wolf", "id", "Indonesia"));

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
        img.src = `./assets/countries/${e.target.dataset.code}.gif`;
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

    if (!this.model.isNodeEmpty(this.targetElement)) {
      this.view.disable(false, "#modal-edit-save");

      const fragment = document.createDocumentFragment();
      const items = this.view.els("span", this.targetElement);

      for (const item of items) {
        const { username, code, countryName } = item.dataset;
        fragment.appendChild(this.view.generateFlagItem(username, code, countryName));
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
      content += `
      <span 
        data-country-name="${countryName}" 
        data-code="${code}" 
        data-username="${username.textContent}">
          <img src="${img.src}">&nbsp;<a target="_blank" href="https://osu.ppy.sh/users/${username.textContent}">${username.textContent}</a>   
       </span>${spacing}`;
    }
    content += "</p>";

    this.view.toggle(this.targetElement, "ph", false);
    this.view.dataset(this.targetElement, "splitter", splitter);
    this.view.html(this.targetElement, content);
  }
}
