export const APP_CONFIG = {
  name: "Bean Scene Cafe",
  currency: "MAD",
  apiBaseUrl: `${window.location.origin}/api`,
  refreshIntervalMs: 15000,
  statuses: ["pending", "preparing", "served", "cancelled"],
  storageKeys: {
    cart: "bean-scene-cart",
    table: "bean-scene-table",
  },
};
