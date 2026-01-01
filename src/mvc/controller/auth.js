export default (controller) => {
  const model = controller.model;
  const view = controller.view;

  controller.login = async (code) => {
    const isAlreadyLoggedIn = model.getAuthData();
    if (isAlreadyLoggedIn) return;

    const res = await controller.osuApiRequest("login", code);
    if (!res) return;

    const clonedUserpage = controller.cloneUserpage(res.user);
    model.clearUserPageAuthData();

    if (clonedUserpage) {
      view.text("#starting-modal-new-project-btn span", "Continue");
      alert("Login successful! Your page is synced. Click 'Continue' to edit, or clone a me! page.");
    } else {
      alert("Login successful! Click 'New Project' or clone a user page to begin.");
    }
  };

  controller.authLogin = async (isOnAuthRedirect) => {
    const code = isOnAuthRedirect;

    if (code) await controller.login(code);

    const authData = model.getAuthData();

    if (authData) {
      view.login(true, authData);
    } else {
      view.login(false);
    }

    view.disable(false, "#osu-api-login-btn");
    view.authLoginRedirectState(false);
  };

  controller.logout = () => {
    view.text("#osu-api-login-btn", "Logging out...");
    view.disable(true, "#osu-api-login-btn");

    controller.osuApiRequest("logout");
    setTimeout(() => {
      view.login(false);
      view.disable(false, "#osu-api-login-btn");

      alert("You've been logged out!");
    }, 1000);
  };

  // controller.checkAuthSession = () => {
  //   if (!model.checkAuthSession()) {
  //     alert("Your session is no longer valid. Please log in again. You will be logged out.");
  //     controller.logout();
  //   }
  // };

  controller.cloneUserpage = (userData) => {
    const container = document.createElement("div");

    controller.cleanRawOsuPage(userData, container);

    const html = model.clonedMation.convert(container.innerHTML);
    controller.setCanvasContent(html);

    return !model.isNodeEmpty(container);
    // if (!model.isNodeEmpty(container)) view.text("#starting-modal-new-project-btn span", "Continue");
  };
};
