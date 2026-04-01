const API_URL = "http://localhost/CafeProject/cafe_api/add_commande.php";

const menuItems = [
  { name: "Espresso", price: 2.50, category: "Cafe" },
  { name: "Cappuccino", price: 3.80, category: "Cafe" },
  { name: "Latte", price: 4.20, category: "Cafe" },
  { name: "Mocha", price: 4.50, category: "Cafe" },
  { name: "Americano", price: 3.00, category: "Cafe" },
  { name: "Croissant", price: 2.20, category: "Viennoiserie" },
  { name: "Cheesecake", price: 4.90, category: "Dessert" },
  { name: "Jus d'orange", price: 3.50, category: "Boisson" }
];

const productSelect = document.getElementById("productSelect");
const quantityInput = document.getElementById("quantity");
const unitPriceElement = document.getElementById("unitPrice");
const totalPriceElement = document.getElementById("totalPrice");
const menuContainer = document.getElementById("menuContainer");
const orderForm = document.getElementById("orderForm");
const messageBox = document.getElementById("messageBox");
const submitBtn = document.getElementById("submitBtn");

function formatPrice(price) {
  return `${price.toFixed(2)} DH`;
}

function renderMenu() {
  menuContainer.innerHTML = "";

  menuItems.forEach((item, index) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="card menu-card">
        <div class="card-body">
          <span class="menu-badge">${item.category}</span>
          <h3 class="h5 fw-bold">${item.name}</h3>
          <p class="text-muted mb-3">Un excellent choix pour accompagner votre moment cafe.</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="menu-price">${formatPrice(item.price)}</span>
            <button class="btn btn-sm btn-outline-dark" data-index="${index}">
              Choisir
            </button>
          </div>
        </div>
      </div>
    `;

    menuContainer.appendChild(col);
  });

  document.querySelectorAll("[data-index]").forEach((button) => {
    button.addEventListener("click", () => {
      productSelect.value = button.dataset.index;
      updatePrice();
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

function updatePrice() {
  const selectedIndex = productSelect.value;
  const quantity = parseInt(quantityInput.value, 10) || 1;

  if (selectedIndex === "") {
    unitPriceElement.textContent = "0.00 DH";
    totalPriceElement.textContent = "0.00 DH";
    return;
  }

  const selectedItem = menuItems[selectedIndex];
  const total = selectedItem.price * quantity;

  unitPriceElement.textContent = formatPrice(selectedItem.price);
  totalPriceElement.textContent = formatPrice(total);
}

function showMessage(type, text) {
  messageBox.className = `alert alert-${type} mt-3`;
  messageBox.textContent = text;
  messageBox.classList.remove("d-none");
}

productSelect.addEventListener("change", updatePrice);
quantityInput.addEventListener("input", updatePrice);

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const tableNumber = parseInt(document.getElementById("tableNumber").value, 10);
  const selectedIndex = productSelect.value;
  const quantity = parseInt(quantityInput.value, 10);

  if (!tableNumber || tableNumber < 1) {
    showMessage("danger", "Veuillez entrer un numero de table valide.");
    return;
  }

  if (selectedIndex === "") {
    showMessage("danger", "Veuillez selectionner un produit.");
    return;
  }

  if (!quantity || quantity < 1) {
    showMessage("danger", "Veuillez entrer une quantite valide.");
    return;
  }

  const selectedItem = menuItems[selectedIndex];
  const totalPrice = selectedItem.price * quantity;

  submitBtn.disabled = true;
  submitBtn.textContent = "Envoi en cours...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        table_number: tableNumber,
        produit: `${selectedItem.name} x${quantity}`,
        prix: Number(totalPrice.toFixed(2))
      })
    });

    const result = await response.json();

    if (result.success) {
      showMessage(
        "success",
        `Commande envoyee avec succes pour la table ${tableNumber}.`
      );
      orderForm.reset();
      unitPriceElement.textContent = "0.00 DH";
      totalPriceElement.textContent = "0.00 DH";
    } else {
      showMessage("danger", result.message || "Une erreur est survenue.");
    }
  } catch (error) {
    showMessage("danger", "Impossible d'envoyer la commande au serveur.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Commander";
  }
});

populateProductSelect();
renderMenu();
updatePrice();

