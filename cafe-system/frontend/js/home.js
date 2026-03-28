import { buildTableUrl, resolveTableNumber, wireTableLinks } from "./utils.js";
import { syncCartIndicators } from "./cart.js";

document.addEventListener("DOMContentLoaded", () => {
  const tableNumber = resolveTableNumber();
  wireTableLinks(document, tableNumber);
  syncCartIndicators(document);

  const qrUrlNode = document.querySelector("[data-qr-url]");
  if (qrUrlNode) {
    qrUrlNode.textContent = `${window.location.origin}/table/${tableNumber}`;
  }

  const qrAction = document.querySelector("[data-home-action]");
  if (qrAction) {
    qrAction.setAttribute("href", buildTableUrl("menu.html", tableNumber));
  }
});
