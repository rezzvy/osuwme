export default (controller) => {
  const model = controller.model;

  controller.osuApiRequest = async (type, val) => {
    if (type === "get-user") return await fetchUser(val);
    if (type === "login") return await handleAuthCallback(val);

    await logoutAndClearAuthData(val);
  };

  async function logoutAndClearAuthData(alreadyExpired = false) {
    if (alreadyExpired) {
      model.clearAuthData();

      alert("You've been logged out!");
      return true;
    }

    const res = await osuApiFetch("/logout", {
      method: "DELETE",
    });

    model.clearAuthData();

    if (!res.ok) {
      alert("Opsiee! there is a problem connecting to the server. Performing local logout instead. Your token will expire automatically.");
    } else {
      alert("You've been logged out!");
    }
  }

  async function osuApiFetch(endpoint, options = {}) {
    const authData = model.getAuthData();
    const token = authData ? authData.token : "";

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${model.apiConfig.API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      let body = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }

      if (body?.error === true) {
        return {
          ok: false,
          status: res.status,
          code: body.code,
          message: body.message,
          details: body.details,
        };
      }

      return { ok: true, status: res.status, data: body?.data };
    } catch (err) {
      return { ok: false, type: "network", message: "Network error", error: err };
    }
  }

  async function fetchUser(username) {
    const res = await osuApiFetch(`/users/${username}`);

    if (!res.ok) {
      handleApiError(res);
      return null;
    }

    return res.data;
  }

  async function handleAuthCallback(code) {
    if (!code) return null;

    window.history.replaceState({}, "", window.location.pathname);

    const res = await osuApiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      handleApiError(res);
      return null;
    }

    const userData = {
      token: res.data.access_token,
      expire: Date.now() + res.data.expires_in * 1000 - 60000,
      user: res.data.user,
    };

    model.setAuthData(userData);
    return userData;
  }

  function handleApiError(res) {
    if (res.code === "OSU_AUTH_FAILED" || res.code === "MISSING_TOKEN") {
      alert("Your session has expired. Please log in again. You will be logged out shortly.");

      controller.logout(true);
      return;
    }

    if (res.code === "RATE_LIMIT_EXCEEDED" || res.code === "OSU_RATE_LIMIT") {
      alert("Too many requests. Please try again later.");
      return;
    }

    if (res.code === "OSU_RESOURCE_NOT_FOUND") {
      alert("Requested data not found.");
      return;
    }

    if (res.code === "INTERNAL_SERVER_ERROR" || res.code === "PROXY_ERROR") {
      alert("Server error. Please try again later.");
      return;
    }

    console.log(res);
    alert(`Something went wrong: ${res.message || "Unknown error"}`);
  }
};
