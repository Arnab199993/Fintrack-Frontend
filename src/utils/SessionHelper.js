class SessionHelper {
  static GetCustomer() {
    if (typeof window === "undefined") return null;
    return window.localStorage?.getItem("authToken") || null;
  }

  static SetCustomer(token) {
    if (typeof window !== "undefined") {
      if (token) {
        window.localStorage?.setItem("authToken", token);
      } else {
        window.localStorage?.removeItem("authToken");
      }
    }
  }

  static ClearSession() {
    if (typeof window !== "undefined") {
      window.localStorage?.removeItem("authToken");
      window.localStorage?.removeItem("fintrackLoggedIn");
    }
  }

  static IsAuthenticated() {
    return !!this.GetCustomer();
  }
}

export default SessionHelper;
