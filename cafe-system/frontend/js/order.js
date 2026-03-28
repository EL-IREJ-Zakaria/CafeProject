import { createOrder } from "./api.js";
import { clearCart, getCartSummary, syncCartIndicators } from "./cart.js";
import {
  buildTableUrl,
  escapeHtml,
  formatCurrency,
  formatDateTime,
  renderStatusBadge,
  resolveTableNumber,
  setGlobalLoading,
  showToast,
  wireTableLinks,
} from "./utils.js";

function renderOrderSummary() {
  const { items, subtotal } = getCartSummary();
  const orderRoot = document.querySelector("[data-order-root]");
  const confirmButton = document.querySelector("[data-confirm-order]");

  if (!orderRoot || !confirmButton) {
    return;
  }

  if (items.length === 0) {
    confirmButton.classList.add("d-none");
    orderRoot.innerHTML = `
      <div class="empty-state">
        <h3 class="section-title fs-2 mb-2">No items ready to submit</h3>
        <p class="muted-copy mb-3">Your cart is empty, so there is nothing to confirm yet.</p>
        <a href="${buildTableUrl("menu.html")}" class="btn btn-coffee">Return To Menu</a>
      </div>
    `;
    return;
  }

  orderRoot.innerHTML = `
    <div class="summary-card p-4">
      <div class="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
        <div>
          <div class="feature-pill mb-3">Order Summary</div>
          <h2 class="section-title mb-2">Ready to send this order to the waiter?</h2>
          <p class="muted-copy mb-0">The backend will save the order, mark it as pending, and expose it to the waiter mobile application through the REST API.</p>
        </div>
        <div class="table-pill align-self-start">Table <span data-table-number></span></div>
      </div>
      <div class="mb-4">
        ${items
          .map(
            (item) => `
              <div class="order-line py-3 d-flex justify-content-between gap-3">
                <div>
                  <div class="fw-bold">${escapeHtml(item.name)}</div>
                  <div class="muted-copy small">${item.quantity} x ${formatCurrency(item.price)}</div>
                </div>
                <div class="fw-bold">${formatCurrency(item.quantity * item.price)}</div>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <div class="muted-copy">Total</div>
          <div class="section-title fs-2 mb-0">${formatCurrency(subtotal)}</div>
        </div>
        <a href="${buildTableUrl("cart.html")}" class="btn btn-outline-coffee px-4 py-3">Edit Cart</a>
      </div>
    </div>
  `;

  wireTableLinks(document);
}

function renderSuccess(order) {
  const orderRoot = document.querySelector("[data-order-root]");
  const confirmButton = document.querySelector("[data-confirm-order]");
  if (!orderRoot || !confirmButton) {
    return;
  }

  confirmButton.classList.add("d-none");
  orderRoot.innerHTML = `
    <div class="summary-card p-4 p-lg-5">
      <div class="feature-pill mb-3">Order Sent</div>
      <h2 class="section-title mb-3">Order #${escapeHtml(order.id)} was sent successfully</h2>
      <p class="muted-copy">The waiter app can now retrieve this order from <code>GET /api/orders</code> and update it later with <code>PUT /api/order/${escapeHtml(order.id)}/status</code>.</p>

      <div class="row g-3 my-2">
        <div class="col-md-4">
          <div class="stat-card h-100">
            <div class="muted-copy small mb-2">Table</div>
            <div class="stat-card__value">${escapeHtml(order.table_number)}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card h-100">
            <div class="muted-copy small mb-2">Status</div>
            <div>${renderStatusBadge(order.status)}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card h-100">
            <div class="muted-copy small mb-2">Created At</div>
            <div class="fw-bold fs-5">${formatDateTime(order.created_at)}</div>
          </div>
        </div>
      </div>

      <div class="surface-card p-4 mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="section-title fs-3 mb-0">Submitted items</h3>
          <div class="fw-bold">${formatCurrency(order.total_price)}</div>
        </div>
        ${order.items
          .map(
            (item) => `
              <div class="order-line py-3 d-flex justify-content-between gap-3">
                <div>
                  <div class="fw-bold">${escapeHtml(item.item_name)}</div>
                  <div class="muted-copy small">${escapeHtml(item.quantity)} x ${formatCurrency(item.price)}</div>
                </div>
                <div class="fw-bold">${formatCurrency(item.quantity * item.price)}</div>
              </div>
            `
          )
          .join("")}
      </div>

      <div class="d-flex flex-wrap gap-3 mt-4">
        <a href="${buildTableUrl("menu.html")}" class="btn btn-coffee px-4 py-3">Start Another Order</a>
        <a href="/frontend/admin.html" class="btn btn-outline-coffee px-4 py-3">Open Admin Dashboard</a>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const tableNumber = resolveTableNumber();
  wireTableLinks(document, tableNumber);
  syncCartIndicators(document);
  renderOrderSummary();

  const confirmButton = document.querySelector("[data-confirm-order]");
  if (!confirmButton) {
    return;
  }

  confirmButton.addEventListener("click", async () => {
    const { items, subtotal } = getCartSummary();
    if (items.length === 0) {
      showToast("Add items to the cart before confirming the order.", "warning");
      return;
    }

    setGlobalLoading(true, "Sending the order...");

    try {
      const response = await createOrder({
        table_number: tableNumber,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: subtotal,
        status: "pending",
      });

      clearCart();
      syncCartIndicators(document);
      renderSuccess(response.data);
      showToast("Order confirmed successfully.");
    } catch (error) {
      showToast(error.message, "danger");
    } finally {
      setGlobalLoading(false);
    }
  });
});
