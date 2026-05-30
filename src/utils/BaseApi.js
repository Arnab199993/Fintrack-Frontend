import SessionHelper from "./SessionHelper.js";

class BaseApi {
  static BaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

  static async BaseGetRequestAsync(endpoint) {
    return this.BaseGetRequestInternalAsync(endpoint);
  }

  static async BasePostRequestAsync(endpoint, model) {
    return this.BasePostRequestInternalAsync(endpoint, model);
  }

  static async BasePostRequestFileAsync(endpoint, file) {
    return this.BasePostRequestFileInternalAsync(endpoint, file);
  }

  static async BasePatchRequestAsync(endpoint, model) {
    return this.BasePatchRequestInternalAsync(endpoint, model);
  }

  static async BaseDeleteRequestAsync(endpoint) {
    return this.BaseDeleteRequestInternalAsync(endpoint);
  }

  static async BasePostRequestInternalAsync(endpoint, model) {
    const finalApiUrl = this.BaseUrl + "/" + endpoint.replace(/^\/+/, "");
    const apiAuthorization = SessionHelper.GetCustomer();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(apiAuthorization && { Authorization: `Bearer ${apiAuthorization}` }),
      },
    };

    try {
      const response = await fetch(finalApiUrl, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify(model),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "API request failed" }));
        throw new Error(error?.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("POST Error:", error);
      throw error;
    }
  }

  static async BaseGetRequestInternalAsync(endpoint) {
    const finalApiUrl = this.BaseUrl + "/" + endpoint.replace(/^\/+/, "");
    const apiAuthorization = SessionHelper.GetCustomer();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(apiAuthorization && { Authorization: `Bearer ${apiAuthorization}` }),
      },
    };

    try {
      const response = await fetch(finalApiUrl, {
        method: "GET",
        headers: config.headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "API request failed" }));
        throw new Error(error?.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("GET Error:", error);
      throw error;
    }
  }

  static async BasePostRequestFileInternalAsync(endpoint, formData) {
    const finalApiUrl = this.BaseUrl + "/" + endpoint.replace(/^\/+/, "");
    const apiAuthorization = SessionHelper.GetCustomer();

    // const formData = new FormData();
    // formData.append("file", file);

    const config = {
      headers: {
        ...(apiAuthorization && { Authorization: `Bearer ${apiAuthorization}` }),
      },
    };

    try {
      const response = await fetch(finalApiUrl, {
        method: "POST",
        headers: config.headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "File upload failed" }));
        throw new Error(error?.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("File Upload Error:", error);
      throw error;
    }
  }

  static async BasePatchRequestInternalAsync(endpoint, model) {
    const finalApiUrl = this.BaseUrl + "/" + endpoint.replace(/^\/+/, "");
    const apiAuthorization = SessionHelper.GetCustomer();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(apiAuthorization && { Authorization: `Bearer ${apiAuthorization}` }),
      },
    };

    try {
      const response = await fetch(finalApiUrl, {
        method: "PATCH",
        headers: config.headers,
        body: JSON.stringify(model),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "API request failed" }));
        throw new Error(error?.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("PATCH Error:", error);
      throw error;
    }
  }

  static async BaseDeleteRequestInternalAsync(endpoint) {
    const finalApiUrl = this.BaseUrl + "/" + endpoint.replace(/^\/+/, "");
    const apiAuthorization = SessionHelper.GetCustomer();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(apiAuthorization && { Authorization: `Bearer ${apiAuthorization}` }),
      },
    };

    try {
      const response = await fetch(finalApiUrl, {
        method: "DELETE",
        headers: config.headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "API request failed" }));
        throw new Error(error?.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("DELETE Error:", error);
      throw error;
    }
  }
}

export default BaseApi;
