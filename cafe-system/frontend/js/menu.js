import { getMenu } from "./api.js";
import { addToCart, getCartSummary, syncCartIndicators } from "./cart.js";
import {
  buildTableUrl,
  escapeHtml,
  formatCurrency,
  resolveTableNumber,
  setGlobalLoading,
  showToast,
  wireTableLinks,
} from "./utils.js";

function createCategoryNavigation(categories) {
  const container = document.querySelector("[data-category-nav]");
  if (!container) {
    return;
  }

  container.innerHTML = categories
    .map(
      (category) => `
        <a class="category-chip me-2 mb-2" href="#category-${category.toLowerCase().replace(/\s+/g, "-")}">
          ${escapeHtml(category)}
        </a>
      `
    )
    .join("");
}

function renderMenuItems(data) {
  const menuRoot = document.querySelector("[data-menu-root]");
  if (!menuRoot) {
    return;
  }

  const markup = data.categories
    .map((category, categoryIndex) => {
      const items = data.items[category] ?? [];
      if (items.length === 0) {
        return "";
      }

      const sectionId = `category-${category.toLowerCase().replace(/\s+/g, "-")}`;
      const cards = items
        .map(
          (item, index) => `
            <div class="col-12 col-md-6 col-xl-3 reveal reveal-delay-${(index + categoryIndex) % 4}">
              <article class="menu-card">
                <div class="menu-card__media">
                  <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
                </div>
                <div class="menu-card__body">
                  <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <div class="fw-bold fs-5">${escapeHtml(item.name)}</div>
                      <div class="muted-copy small">${escapeHtml(item.category)}</div>
                    </div>
                    <span class="price-tag">${formatCurrency(item.price)}</span>
                  </div>
                  <button
                    class="btn btn-coffee w-100"
                    type="button"
                    data-add-item
                    data-item='${escapeHtml(JSON.stringify(item))}'
                  >
                    Add To Cart
                  </button>
                </div>
              </article>
            </div>
          `
        )
        .join("");

      return `
        <section class="mb-5 section-anchor" id="${sectionId}">
          <div class="section-header">
            <div>
              <div class="feature-pill mb-3">${escapeHtml(category)}</div>
              <h2 class="section-title mb-2">${escapeHtml(category)}</h2>
              <p class="section-copy mb-0">Freshly prepared favorites curated for cafe table service.</p>
            </div>
          </div>
          <div class="row g-4">
            ${cards}
          </div>
        </section>
      `;
    })
    .join("");

  menuRoot.innerHTML = markup;
}

function updateStickyCart() {
  const { totalQuantity, formattedSubtotal } = getCartSummary();
  const summaryRoot = document.querySelector("[data-sticky-cart]");
  if (!summaryRoot) {
    return;
  }

  summaryRoot.classList.toggle("d-none", totalQuantity === 0);
  summaryRoot.querySelector("[data-cart-count]").textContent = String(totalQuantity);
  summaryRoot.querySelector("[data-cart-total]").textContent = formattedSubtotal;
  summaryRoot.querySelector("[data-cart-link]").setAttribute("href", buildTableUrl("cart.html"));
}

async function loadMenu() {
  setGlobalLoading(true, "Loading the menu...");

  try {
    const response = await getMenu();
    createCategoryNavigation(response.data.categories);
    renderMenuItems(response.data);
    updateStickyCart();
  } catch (error) {
    showToast(error.message, "danger");
    const menuRoot = document.querySelector("[data-menu-root]");
    if (menuRoot) {
      menuRoot.innerHTML = `
        <div class="empty-state">
          <h3 class="section-title fs-2 mb-2">Menu unavailable</h3>
          <p class="muted-copy mb-0">We could not load the menu right now. Please try again in a moment.</p>
        </div>
      `;
    }
  } finally {
    setGlobalLoading(false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tableNumber = resolveTableNumber();
  wireTableLinks(document, tableNumber);
  syncCartIndicators(document);
  updateStickyCart();
  loadMenu();

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-item]");
    if (!button) {
      return;
    }

    const item = JSON.parse(button.getAttribute("data-item") || "{}");
    addToCart(item, 1);
    syncCartIndicators(document);
    updateStickyCart();
    showToast(`${item.name} added to cart.`);
  });
});
