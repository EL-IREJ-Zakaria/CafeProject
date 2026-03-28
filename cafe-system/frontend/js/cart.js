import { APP_CONFIG } from "./config.js";
import { formatCurrency } from "./utils.js";

function sanitizeItem(item) {
  return {
    key: String(item.key ?? item.id ?? item.name),
    id: item.id ? Number(item.id) : null,
    name: String(item.name),
    category: String(item.category ?? ""),
    price: Number(item.price),
    image: String(item.image ?? ""),
    quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1),
  };
}

export function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.cart) ?? "[]");
    return Array.isArray(cart) ? cart.map(sanitizeItem) : [];
  } catch {
    return [];
  }
}

export function saveCart(items) {
  localStorage.setItem(APP_CONFIG.storageKeys.cart, JSON.stringify(items.map(sanitizeItem)));
}

export function addToCart(item, quantity = 1) {
  const cart = getCart();
  const sanitized = sanitizeItem({ ...item, quantity });
  const existingIndex = cart.findIndex((cartItem) => cartItem.key === sanitized.key);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += sanitized.quantity;
  } else {
    cart.push(sanitized);
  }

  saveCart(cart);
  syncCartIndicators();
  return cart;
}

export function updateCartItemQuantity(key, quantity) {
  const cart = getCart();
  const itemIndex = cart.findIndex((item) => item.key === String(key));
  if (itemIndex < 0) {
    return cart;
  }

  if (quantity <= 0) {
    cart.splice(itemIndex, 1);
  } else {
    cart[itemIndex].quantity = Math.max(1, Number.parseInt(quantity, 10) || 1);
  }

  saveCart(cart);
  syncCartIndicators();
  return cart;
}

export function removeCartItem(key) {
  const cart = getCart().filter((item) => item.key !== String(key));
  saveCart(cart);
  syncCartIndicators();
  return cart;
}

export function clearCart() {
  localStorage.removeItem(APP_CONFIG.storageKeys.cart);
  syncCartIndicators();
}

export function getCartSummary() {
  const items = getCart();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    items,
    totalQuantity,
    subtotal: Number(subtotal.toFixed(2)),
    formattedSubtotal: formatCurrency(subtotal),
  };
}

export function syncCartIndicators(root = document) {
  const { totalQuantity, formattedSubtotal } = getCartSummary();

  root.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = String(totalQuantity);
  });

  root.querySelectorAll("[data-cart-total]").forEach((node) => {
    node.textContent = formattedSubtotal;
  });
}
