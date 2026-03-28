import { APP_CONFIG } from "./config.js";

async function request(path, options = {}) {
  const isJsonBody = options.body && typeof options.body === "object" && !(options.body instanceof FormData);
  const response = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
    body: isJsonBody ? JSON.stringify(options.body) : options.body,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : { success: response.ok, message: "Unexpected response from server." };

  if (!response.ok || payload.success === false) {
    const message = payload.message ?? "Request failed.";
    const error = new Error(message);
    error.details = payload.errors ?? {};
    throw error;
  }

  return payload;
}

export function getMenu(options = {}) {
  const searchParams = new URLSearchParams();
  if (typeof options === "string" && options) {
    searchParams.set("category", options);
  } else {
    if (options.category) {
      searchParams.set("category", options.category);
    }
    if (options.includeUnavailable) {
      searchParams.set("include_unavailable", "true");
    }
  }

  const query = searchParams.toString();
  return request(`/menu${query ? `?${query}` : ""}`);
}

export function createOrder(payload) {
  return request("/order", {
    method: "POST",
    body: payload,
  });
}

export function getOrders(filters = {}) {
  const searchParams = new URLSearchParams();
  if (filters.status) {
    searchParams.set("status", filters.status);
  }

  if (filters.tableNumber) {
    searchParams.set("table_number", String(filters.tableNumber));
  }

  const query = searchParams.toString();
  return request(`/orders${query ? `?${query}` : ""}`);
}

export function updateOrderStatus(orderId, status) {
  return request(`/order/${orderId}/status`, {
    method: "PUT",
    body: { status },
  });
}

export function createMenuItem(payload) {
  return request("/menu", {
    method: "POST",
    body: payload,
  });
}

export function updateMenuItem(menuId, payload) {
  return request(`/menu/${menuId}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteMenuItem(menuId) {
  return request(`/menu/${menuId}`, {
    method: "DELETE",
  });
}
