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

    const { isEmpty, html } = clonedUserpage;

    alert("Login successful!");

    if (view.dialog("Do you want to sync this app with your latest me! page? This will overwrite any existing project.")) {
      if (!isEmpty) {
        controller.setCanvasContent(html);
        view.text("#starting-modal-new-project-btn span", "Start Editing");

        alert("Synced! You may proceed by clicking the 'Start Editing' button.");
      } else {
        alert("Opsiee! It looks like you don't have any me! page content yet. You can either clone someone else's userpage or create your own.");
      }
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

  controller.logout = async (alreadyExpired = false) => {
    view.text("#osu-api-login-btn", "Logging out...");
    view.disable(true, "#osu-api-login-btn");

    await controller.osuApiRequest("logout", alreadyExpired);

    view.login(false);
    view.disable(false, "#osu-api-login-btn");
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

    return { isEmpty: model.isNodeEmpty(container), html: html || "" };
  };
};
