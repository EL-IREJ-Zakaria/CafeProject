import { APP_CONFIG } from "./config.js";

export function formatCurrency(value) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: APP_CONFIG.currency,
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character] ?? character;
  });
}

function toPositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function resolveTableNumber({ persist = true, fallback = 1 } = {}) {
  const searchParams = new URLSearchParams(window.location.search);
  const queryTable = toPositiveInt(searchParams.get("table"));
  const pathMatch = window.location.pathname.match(/\/table\/(\d+)/);
  const pathTable = toPositiveInt(pathMatch?.[1] ?? null);
  const storedTable = toPositiveInt(localStorage.getItem(APP_CONFIG.storageKeys.table));
  const explicitTable = queryTable ?? pathTable;
  const resolvedTable = explicitTable ?? storedTable ?? fallback;

  if (explicitTable && storedTable && explicitTable !== storedTable) {
    localStorage.removeItem(APP_CONFIG.storageKeys.cart);
  }

  if (persist) {
    localStorage.setItem(APP_CONFIG.storageKeys.table, String(resolvedTable));
  }

  return resolvedTable;
}

export function buildTableUrl(pageName, tableNumber = resolveTableNumber()) {
  return `/frontend/${pageName}?table=${tableNumber}`;
}

export function wireTableLinks(root = document, tableNumber = resolveTableNumber()) {
  root.querySelectorAll("[data-table-link]").forEach((link) => {
    const target = link.getAttribute("data-table-link");
    if (target) {
      link.setAttribute("href", buildTableUrl(target, tableNumber));
    }
  });

  root.querySelectorAll("[data-table-number]").forEach((node) => {
    node.textContent = String(tableNumber);
  });
}

export function setGlobalLoading(active, label = "Working...") {
  let overlay = document.querySelector("[data-loading-overlay]");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.setAttribute("data-loading-overlay", "true");
    overlay.innerHTML = `
      <div class="loading-overlay__card">
        <div class="loading-overlay__spinner"></div>
        <div class="fw-bold" data-loading-label>${escapeHtml(label)}</div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const labelNode = overlay.querySelector("[data-loading-label]");
  if (labelNode) {
    labelNode.textContent = label;
  }

  overlay.classList.toggle("is-active", active);
}

export function showToast(message, variant = "success") {
  let container = document.querySelector("[data-toast-container]");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container position-fixed top-0 end-0 p-3";
    container.setAttribute("data-toast-container", "true");
    container.style.zIndex = "1200";
    document.body.appendChild(container);
  }

  const toneClassMap = {
    success: "text-bg-success",
    danger: "text-bg-danger",
    warning: "text-bg-warning",
    info: "text-bg-dark",
  };

  const toast = document.createElement("div");
  toast.className = `toast align-items-center border-0 ${toneClassMap[variant] ?? toneClassMap.info}`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-semibold">${escapeHtml(message)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toast);
  const toastInstance = new bootstrap.Toast(toast, { delay: 2800 });
  toastInstance.show();
  toast.addEventListener("hidden.bs.toast", () => toast.remove(), { once: true });
}

export function renderStatusBadge(status) {
  const normalizedStatus = String(status || "pending").toLowerCase();
  const label = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
  return `<span class="status-badge status-${escapeHtml(normalizedStatus)}">${escapeHtml(label)}</span>`;
}

export function renderEmptyState(title, copy, actionLabel = "", actionHref = "#") {
  const actionMarkup = actionLabel
    ? `<a class="btn btn-coffee mt-3" href="${escapeHtml(actionHref)}">${escapeHtml(actionLabel)}</a>`
    : "";

  return `
    <div class="empty-state">
      <h3 class="section-title fs-2 mb-2">${escapeHtml(title)}</h3>
      <p class="muted-copy mb-0">${escapeHtml(copy)}</p>
      ${actionMarkup}
    </div>
  `;
}
