import { getCartSummary, removeCartItem, syncCartIndicators, updateCartItemQuantity } from "./cart.js";
import {
  buildTableUrl,
  escapeHtml,
  formatCurrency,
  renderEmptyState,
  resolveTableNumber,
  wireTableLinks,
} from "./utils.js";

function renderCart() {
  const { items, subtotal, formattedSubtotal } = getCartSummary();
  const cartRoot = document.querySelector("[data-cart-root]");
  const summaryRoot = document.querySelector("[data-cart-summary]");
  const checkoutLink = document.querySelector("[data-checkout-link]");

  if (!cartRoot || !summaryRoot || !checkoutLink) {
    return;
  }

  checkoutLink.setAttribute("href", buildTableUrl("order.html"));

  if (items.length === 0) {
    cartRoot.innerHTML = renderEmptyState(
      "Your cart is empty",
      "Add drinks, sandwiches, or desserts from the menu before you place an order.",
      "Browse Menu",
      buildTableUrl("menu.html")
    );
    summaryRoot.innerHTML = "";
    return;
  }

  cartRoot.innerHTML = items
    .map(
      (item) => `
        <div class="cart-row py-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div class="d-flex gap-3 align-items-center">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="rounded-4" style="width: 88px; height: 88px; object-fit: cover;">
            <div>
              <div class="fw-bold fs-5">${escapeHtml(item.name)}</div>
              <div class="muted-copy small">${escapeHtml(item.category)}</div>
              <div class="fw-semibold mt-1">${formatCurrency(item.price)}</div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-3">
            <div class="quantity-stepper">
              <button type="button" data-quantity-action="decrease" data-item-key="${escapeHtml(item.key)}">-</button>
              <span class="fw-bold">${item.quantity}</span>
              <button type="button" data-quantity-action="increase" data-item-key="${escapeHtml(item.key)}">+</button>
            </div>
            <div class="text-end" style="min-width: 120px;">
              <div class="fw-bold">${formatCurrency(item.quantity * item.price)}</div>
              <button class="btn btn-link text-danger text-decoration-none p-0 mt-1" type="button" data-remove-item="${escapeHtml(item.key)}">
                Remove
              </button>
            </div>
          </div>
        </div>
      `
    )
    .join("");

  summaryRoot.innerHTML = `
    <div class="summary-card p-4">
      <div class="d-flex justify-content-between mb-2">
        <span class="muted-copy">Subtotal</span>
        <span class="fw-bold">${formattedSubtotal}</span>
      </div>
      <div class="d-flex justify-content-between mb-3">
        <span class="muted-copy">Service Flow</span>
        <span class="fw-bold">Waiter receives order instantly</span>
      </div>
      <div class="alert mb-0" style="background: rgba(76, 112, 84, 0.08); border: 1px solid rgba(76, 112, 84, 0.12);">
        <strong>Total due:</strong> ${formatCurrency(subtotal)}
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const tableNumber = resolveTableNumber();
  wireTableLinks(document, tableNumber);
  syncCartIndicators(document);
  renderCart();

  document.addEventListener("click", (event) => {
    const quantityButton = event.target.closest("[data-quantity-action]");
    if (quantityButton) {
      const action = quantityButton.getAttribute("data-quantity-action");
      const itemKey = quantityButton.getAttribute("data-item-key");
      const item = getCartSummary().items.find((entry) => entry.key === itemKey);
      if (!item) {
        return;
      }

      const nextQuantity = action === "increase" ? item.quantity + 1 : item.quantity - 1;
      updateCartItemQuantity(itemKey, nextQuantity);
      syncCartIndicators(document);
      renderCart();
      return;
    }

    const removeButton = event.target.closest("[data-remove-item]");
    if (removeButton) {
      removeCartItem(removeButton.getAttribute("data-remove-item"));
      syncCartIndicators(document);
      renderCart();
    }
  });
});
