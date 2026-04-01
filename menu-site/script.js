const API_URL = "http://localhost/CafeProject/cafe_api/add_commande.php";
const MAX_ITEMS_PER_TABLE = 100;

const menuItems = [
  { name: "Espresso", price: 2.50, category: "Cafe", note: "Court, intense, signature maison" },
  { name: "Cappuccino", price: 3.80, category: "Cafe", note: "Mousse dense et texture veloutee" },
  { name: "Latte", price: 4.20, category: "Cafe", note: "Doux, cremeux, tres equilibre" },
  { name: "Mocha", price: 4.50, category: "Cafe", note: "Cafe, lait et chocolat noir" },
  { name: "Americano", price: 3.00, category: "Cafe", note: "Long, net et aromatique" },
  { name: "Croissant", price: 2.20, category: "Viennoiserie", note: "Beurre fin et feuilletage leger" },
  { name: "Cheesecake", price: 4.90, category: "Dessert", note: "Cremeux, doux, touche premium" },
  { name: "Jus d'orange", price: 3.50, category: "Boisson", note: "Frais, vif et desalterant" }
];

const cart = [];

const productSelect = document.getElementById("productSelect");
const quantityInput = document.getElementById("quantity");
const unitPriceElement = document.getElementById("unitPrice");
const linePriceElement = document.getElementById("linePrice");
const cartTotalElement = document.getElementById("cartTotal");
const cartCountElement = document.getElementById("cartCount");
const remainingCountElement = document.getElementById("remainingCount");
const capacityFillElement = document.getElementById("capacityFill");
const menuContainer = document.getElementById("menuContainer");
const cartItems = document.getElementById("cartItems");
const orderForm = document.getElementById("orderForm");
const messageBox = document.getElementById("messageBox");
const submitBtn = document.getElementById("submitBtn");
const addToCartBtn = document.getElementById("addToCartBtn");
const clearCartBtn = document.getElementById("clearCartBtn");

function formatPrice(price) {
  return `${price.toFixed(2)} DH`;
}

function getCartQuantity() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getRemainingCapacity() {
  return MAX_ITEMS_PER_TABLE - getCartQuantity();
}

function updateCapacityUI() {
  const count = getCartQuantity();
  const remaining = getRemainingCapacity();
  const percent = Math.min((count / MAX_ITEMS_PER_TABLE) * 100, 100);

  cartCountElement.textContent = count;
  remainingCountElement.textContent = remaining;
  capacityFillElement.style.width = `${percent}%`;

  addToCartBtn.disabled = remaining <= 0;
}

function renderMenu() {
  menuContainer.innerHTML = "";

  menuItems.forEach((item, index) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-xl-4";

    col.innerHTML = `
      <div class="card menu-card">
        <div class="card-body">
          <div class="menu-meta">
            <span class="menu-category">${item.category}</span>
            <span class="menu-price">${formatPrice(item.price)}</span>
          </div>
          <div>
            <h3 class="menu-name">${item.name}</h3>
            <p class="menu-description">${item.note}</p>
          </div>
          <div class="menu-actions mt-auto">
            <span class="menu-note">Cliquez pour preselectionner</span>
            <button class="btn menu-pick" data-index="${index}">Choisir</button>
          </div>
        </div>
      </div>
    `;

    menuContainer.appendChild(col);
  });

  document.querySelectorAll("[data-index]").forEach((button) => {
    button.addEventListener("click", () => {
      productSelect.value = button.dataset.index;
      updateLinePrice();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function populateProductSelect() {
  menuItems.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${item.name} - ${formatPrice(item.price)}`;
    productSelect.appendChild(option);
  });
}

function updateLinePrice() {
  const selectedIndex = productSelect.value;
  const quantity = parseInt(quantityInput.value, 10) || 1;

  if (selectedIndex === "") {
    unitPriceElement.textContent = "0.00 DH";
    linePriceElement.textContent = "0.00 DH";
    return;
  }

  const selectedItem = menuItems[selectedIndex];
  const total = selectedItem.price * quantity;

  unitPriceElement.textContent = formatPrice(selectedItem.price);
  linePriceElement.textContent = formatPrice(total);
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty mb-0">Aucun produit ajoute.</p>';
    cartTotalElement.textContent = '0.00 DH';
    updateCapacityUI();
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item, index) => `
        <div class="cart-item">
          <div class="d-flex justify-content-between align-items-start gap-3">
            <div>
              <div class="cart-item-title">${item.name}</div>
              <div class="text-muted small">Quantite: ${item.quantity}</div>
              <div class="text-muted small">Prix unitaire: ${formatPrice(item.price)}</div>
            </div>
            <div class="text-end">
              <div class="fw-bold">${formatPrice(item.total)}</div>
              <button type="button" class="btn btn-sm btn-outline-danger mt-2" data-remove-index="${index}">Supprimer</button>
            </div>
          </div>
        </div>
      `
    )
    .join("");

  document.querySelectorAll("[data-remove-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.removeIndex);
      cart.splice(index, 1);
      renderCart();
    });
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  cartTotalElement.textContent = formatPrice(cartTotal);
  updateCapacityUI();
}

function showMessage(type, text) {
  messageBox.className = `alert alert-${type} mt-3`;
  messageBox.textContent = text;
  messageBox.classList.remove("d-none");
}

function resetSelection() {
  productSelect.value = "";
  quantityInput.value = 1;
  updateLinePrice();
}

function addToCart() {
  const selectedIndex = productSelect.value;
  const quantity = parseInt(quantityInput.value, 10);

  if (selectedIndex === "") {
    showMessage("danger", "Veuillez selectionner un produit.");
    return;
  }

  if (!quantity || quantity < 1) {
    showMessage("danger", "Veuillez entrer une quantite valide.");
    return;
  }

  if (quantity > MAX_ITEMS_PER_TABLE) {
    showMessage("danger", `La quantite maximale autorisee pour un ajout est ${MAX_ITEMS_PER_TABLE}.`);
    return;
  }

  const remaining = getRemainingCapacity();
  if (quantity > remaining) {
    showMessage("danger", `Impossible d'ajouter ${quantity} article(s). Il reste seulement ${remaining} place(s) pour cette table.`);
    return;
  }

  const selectedItem = menuItems[selectedIndex];
  cart.push({
    name: selectedItem.name,
    price: selectedItem.price,
    quantity,
    total: Number((selectedItem.price * quantity).toFixed(2))
  });

  renderCart();
  resetSelection();
  showMessage("success", `${selectedItem.name} a ete ajoute au panier.`);
}

async function submitWholeOrder(event) {
  event.preventDefault();

  const tableNumber = parseInt(document.getElementById("tableNumber").value, 10);

  if (!tableNumber || tableNumber < 1) {
    showMessage("danger", "Veuillez entrer un numero de table valide.");
    return;
  }

  if (cart.length === 0) {
    showMessage("danger", "Ajoutez au moins un produit au panier avant de commander.");
    return;
  }

  if (getCartQuantity() > MAX_ITEMS_PER_TABLE) {
    showMessage("danger", `La commande depasse la limite de ${MAX_ITEMS_PER_TABLE} articles pour cette table.`);
    return;
  }

  submitBtn.disabled = true;
  addToCartBtn.disabled = true;
  submitBtn.textContent = "Envoi en cours...";

  try {
    const responses = await Promise.all(
      cart.map((item) =>
        fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            table_number: tableNumber,
            produit: `${item.name} x${item.quantity}`,
            prix: item.total
          })
        }).then(async (response) => {
          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.message || "Une erreur est survenue lors de l'envoi.");
          }
          return result;
        })
      )
    );

    const count = responses.length;
    cart.length = 0;
    renderCart();
    resetSelection();
    showMessage("success", `${count} ligne(s) de commande ont ete envoyees avec succes pour la table ${tableNumber}.`);
  } catch (error) {
    showMessage("danger", error.message || "Impossible d'envoyer la commande au serveur.");
  } finally {
    submitBtn.disabled = false;
    addToCartBtn.disabled = getRemainingCapacity() <= 0;
    submitBtn.textContent = "Commander toute la table";
  }
}

productSelect.addEventListener("change", updateLinePrice);
quantityInput.addEventListener("input", () => {
  const value = parseInt(quantityInput.value, 10) || 1;
  if (value > MAX_ITEMS_PER_TABLE) {
    quantityInput.value = MAX_ITEMS_PER_TABLE;
  }
  updateLinePrice();
});
addToCartBtn.addEventListener("click", addToCart);
clearCartBtn.addEventListener("click", () => {
  cart.length = 0;
  renderCart();
  showMessage("secondary", "Le panier a ete vide.");
});
orderForm.addEventListener("submit", submitWholeOrder);

populateProductSelect();
renderMenu();
renderCart();
updateLinePrice();
updateCapacityUI();
