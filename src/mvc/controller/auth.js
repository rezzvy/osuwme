export default (controller) => {
  const model = controller.model;
  const view = controller.view;

  controller.login = async (code) => {
    const res = await controller.osuApiRequest("login", code);
    if (!res) return;

    controller.cloneUserpage(res.user);
    model.clearUserPageAuthData();

    alert("Login successful! The canvas is now synced with your latest me! page");
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

  controller.checkAuthSession = () => {
    if (!model.checkAuthSession()) {
      alert("Your session is no longer valid. Please log in again. You will be logged out.");
      controller.logout();
    }
  };

  controller.cloneUserpage = (userData) => {
    const container = document.createElement("div");

    controller.cleanRawOsuPage(userData, container);

    const html = model.clonedMation.convert(container.innerHTML);
    controller.setCanvasContent(html);
  };
};
