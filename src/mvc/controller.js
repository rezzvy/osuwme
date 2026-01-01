export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.hotkeyReady = false;
    this.onModalStarting = false;
    this.lastEditModeScrollTop = 0;
    this.lastViewModeScrollTop = 0;
  }

  /* 
   =========================================
      App Init
   ========================================= 
  */

  async init() {
    const isAlreadyLoggedIn = this.model.getAuthData();
    const isOnAuthRedirect = isAlreadyLoggedIn ? false : this.isOnAboutToLogin();

    if (isOnAuthRedirect) this.view.authLoginRedirectState(true);

    await this.fetchAndRenderInitElements();
    this.attachEvents();
    this.initCanvas();

    this.view.init(this.model.isMobileDevice(), isOnAuthRedirect);

    await this.authLogin(isOnAuthRedirect);
    // this.checkAuthSession();
  }
}
