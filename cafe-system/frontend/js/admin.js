import { createMenuItem, deleteMenuItem, getMenu, getOrders, updateOrderStatus } from "./api.js";
import {
  escapeHtml,
  formatCurrency,
  formatDateTime,
  renderEmptyState,
  renderStatusBadge,
  resolveTableNumber,
  setGlobalLoading,
  showToast,
  wireTableLinks,
} from "./utils.js";
import { APP_CONFIG } from "./config.js";

let refreshTimer = null;

function renderStats(orders) {
  const statsRoot = document.querySelector("[data-admin-stats]");
  if (!statsRoot) {
    return;
  }

  const totals = {
    pending: orders.filter((order) => order.status === "pending").length,
    preparing: orders.filter((order) => order.status === "preparing").length,
    served: orders.filter((order) => order.status === "served").length,
    revenue: orders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + Number(order.total_price), 0),
  };

  statsRoot.innerHTML = `
    <div class="col-6 col-xl-3">
      <div class="stat-card h-100">
        <div class="muted-copy small mb-2">Pending</div>
        <div class="stat-card__value">${totals.pending}</div>
      </div>
    </div>
    <div class="col-6 col-xl-3">
      <div class="stat-card h-100">
        <div class="muted-copy small mb-2">Preparing</div>
        <div class="stat-card__value">${totals.preparing}</div>
      </div>
    </div>
    <div class="col-6 col-xl-3">
      <div class="stat-card h-100">
        <div class="muted-copy small mb-2">Served</div>
        <div class="stat-card__value">${totals.served}</div>
      </div>
    </div>
    <div class="col-6 col-xl-3">
      <div class="stat-card h-100">
        <div class="muted-copy small mb-2">Revenue</div>
        <div class="stat-card__value fs-3">${formatCurrency(totals.revenue)}</div>
      </div>
    </div>
  `;
}

function renderOrders(orders) {
  const ordersRoot = document.querySelector("[data-orders-root]");
  if (!ordersRoot) {
    return;
  }

  if (orders.length === 0) {
    ordersRoot.innerHTML = renderEmptyState(
      "No orders yet",
      "Incoming table orders will appear here as soon as customers confirm them."
    );
    return;
  }

  ordersRoot.innerHTML = `
    <div class="admin-order-grid">
      ${orders
        .map(
          (order) => `
            <article class="order-card">
              <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <div class="feature-pill mb-2">Table ${escapeHtml(order.table_number)}</div>
                  <h3 class="section-title fs-3 mb-1">Order #${escapeHtml(order.id)}</h3>
                  <div class="muted-copy small">${formatDateTime(order.created_at)}</div>
                </div>
                <div>${renderStatusBadge(order.status)}</div>
              </div>
              <div class="surface-card p-3 mb-3">
                ${order.items
                  .map(
                    (item) => `
                      <div class="order-line py-2 d-flex justify-content-between gap-2">
                        <div>
                          <div class="fw-bold">${escapeHtml(item.item_name)}</div>
                          <div class="muted-copy small">Qty ${escapeHtml(item.quantity)}</div>
                        </div>
                        <div class="fw-semibold">${formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    `
                  )
                  .join("")}
              </div>
              <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
                <div>
                  <div class="muted-copy small">Order total</div>
                  <div class="fw-bold fs-4">${formatCurrency(order.total_price)}</div>
                </div>
                <div class="w-100" style="max-width: 220px;">
                  <label class="form-label small fw-semibold">Update status</label>
                  <select class="form-select" data-order-status data-order-id="${escapeHtml(order.id)}">
                    ${APP_CONFIG.statuses
                      .map(
                        (status) => `
                          <option value="${escapeHtml(status)}" ${status === order.status ? "selected" : ""}>
                            ${escapeHtml(status.charAt(0).toUpperCase() + status.slice(1))}
                          </option>
                        `
                      )
                      .join("")}
                  </select>
                </div>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderMenuItems(menuItems) {
  const menuRoot = document.querySelector("[data-admin-menu-root]");
  if (!menuRoot) {
    return;
  }

  if (menuItems.length === 0) {
    menuRoot.innerHTML = renderEmptyState("No menu items", "Create your first product from the form on the left.");
    return;
  }

  menuRoot.innerHTML = `
    <div class="surface-card overflow-hidden">
      ${menuItems
        .map(
          (item) => `
            <div class="menu-row p-3 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div class="d-flex align-items-center gap-3">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="rounded-4" style="width: 72px; height: 72px; object-fit: cover;">
                <div>
                  <div class="fw-bold">${escapeHtml(item.name)}</div>
                  <div class="muted-copy small">${escapeHtml(item.category)}</div>
                  <div class="fw-semibold mt-1">${formatCurrency(item.price)}</div>
                </div>
              </div>
              <button class="btn btn-outline-danger" type="button" data-delete-menu-item="${escapeHtml(item.id)}">
                Delete
              </button>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

async function loadDashboard({ silent = false } = {}) {
  if (!silent) {
    setGlobalLoading(true, "Refreshing dashboard...");
  }

  try {
    const [ordersResponse, menuResponse] = await Promise.all([
      getOrders(),
      getMenu({ includeUnavailable: true }),
    ]);
    const menuItems = menuResponse.data.flat_items ?? [];
    renderStats(ordersResponse.data);
    renderOrders(ordersResponse.data);
    renderMenuItems(menuItems);
  } catch (error) {
    showToast(error.message, "danger");
  } finally {
    if (!silent) {
      setGlobalLoading(false);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  resolveTableNumber();
  wireTableLinks(document);
  loadDashboard();

  refreshTimer = window.setInterval(() => {
    loadDashboard({ silent: true });
  }, APP_CONFIG.refreshIntervalMs);

  const form = document.querySelector("[data-menu-form]");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    setGlobalLoading(true, "Adding menu item...");

    try {
      await createMenuItem(payload);
      form.reset();
      showToast("Menu item added successfully.");
      await loadDashboard({ silent: true });
    } catch (error) {
      showToast(error.message, "danger");
    } finally {
      setGlobalLoading(false);
    }
  });

  document.addEventListener("change", async (event) => {
    const select = event.target.closest("[data-order-status]");
    if (!select) {
      return;
    }

    setGlobalLoading(true, "Updating order status...");
    try {
      await updateOrderStatus(select.getAttribute("data-order-id"), select.value);
      showToast("Order status updated.");
      await loadDashboard({ silent: true });
    } catch (error) {
      showToast(error.message, "danger");
    } finally {
      setGlobalLoading(false);
    }
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-menu-item]");
    if (!button) {
      return;
    }

    const shouldDelete = window.confirm("Delete this menu item?");
    if (!shouldDelete) {
      return;
    }

    setGlobalLoading(true, "Deleting menu item...");
    try {
      await deleteMenuItem(button.getAttribute("data-delete-menu-item"));
      showToast("Menu item deleted.");
      await loadDashboard({ silent: true });
    } catch (error) {
      showToast(error.message, "danger");
    } finally {
      setGlobalLoading(false);
    }
  });
});

window.addEventListener("beforeunload", () => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer);
  }
});
