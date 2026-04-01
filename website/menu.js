const API_BASE_URL = 'http://127.0.0.1:8080/api';
const STORAGE_KEY = 'brew-haven-cart';
const TABLE_KEY = 'brew-haven-table';

const menuItems = [
  { id: 1, name: 'Espresso', category: 'Coffee', price: 2.5, description: 'Bold, concentrated espresso shot with a rich crema.' },
  { id: 2, name: 'Cappuccino', category: 'Coffee', price: 3.75, description: 'Velvety milk foam with a smooth double espresso.' },
  { id: 3, name: 'Iced Latte', category: 'Coffee', price: 4.25, description: 'Chilled espresso, milk, and ice for a refreshing sip.' },
  { id: 4, name: 'Mocha', category: 'Coffee', price: 4.5, description: 'Espresso, steamed milk, and dark chocolate.' },
  { id: 5, name: 'Matcha Frappe', category: 'Cold Drinks', price: 4.95, description: 'Creamy blended matcha with a frosty finish.' },
  { id: 6, name: 'Orange Tonic', category: 'Cold Drinks', price: 3.5, description: 'Fresh orange juice topped with tonic and citrus zest.' },
  { id: 7, name: 'Blueberry Muffin', category: 'Desserts', price: 2.95, description: 'Soft bakery muffin packed with blueberries.' },
  { id: 8, name: 'Cheesecake Slice', category: 'Desserts', price: 4.8, description: 'Creamy cheesecake finished with berry sauce.' },
  { id: 9, name: 'Turkey Club', category: 'Food', price: 6.9, description: 'Toasted triple-layer sandwich with turkey and greens.' },
  { id: 10, name: 'Veggie Wrap', category: 'Food', price: 6.25, description: 'Grilled vegetables, hummus, and herbs in a soft wrap.' }
];

const state = {
  cart: loadCart(),
  category: 'all',
};

const menuGrid = document.getElementById('menuGrid');
const categoryFilter = document.getElementById('categoryFilter');
const cartItems = document.getElementById('cartItems');
const totalPrice = document.getElementById('totalPrice');
const tableNumberInput = document.getElementById('tableNumber');
const feedback = document.getElementById('feedback');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const clearCartBtn = document.getElementById('clearCartBtn');

document.addEventListener('DOMContentLoaded', () => {
  populateCategories();
  restoreTableNumber();
  renderMenu();
  renderCart();

  categoryFilter.addEventListener('change', (event) => {
    state.category = event.target.value;
    renderMenu();
  });

  tableNumberInput.addEventListener('input', () => {
    localStorage.setItem(TABLE_KEY, tableNumberInput.value);
  });

  placeOrderBtn.addEventListener('click', submitOrder);
  clearCartBtn.addEventListener('click', clearCart);
});

function populateCategories() {
  [...new Set(menuItems.map((item) => item.category))].forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function restoreTableNumber() {
  tableNumberInput.value = localStorage.getItem(TABLE_KEY) || '';
}

function renderMenu() {
  const itemsToRender = state.category === 'all'
    ? menuItems
    : menuItems.filter((item) => item.category === state.category);

  menuGrid.innerHTML = itemsToRender.map((item) => `
    <div class="col-md-6 col-xl-4">
      <article class="card menu-card h-100">
        <div class="card-body p-4">
          <div class="item-meta">
            <span class="category-pill">${item.category}</span>
            <span class="price-tag">${formatPrice(item.price)}</span>
          </div>
          <div>
            <h3 class="h4 mb-2">${item.name}</h3>
            <p class="text-muted mb-0">${item.description}</p>
          </div>
          <button class="btn btn-primary mt-auto" data-item-id="${item.id}">Add to order</button>
        </div>
      </article>
    </div>
  `).join('');

  menuGrid.querySelectorAll('[data-item-id]').forEach((button) => {
    button.addEventListener('click', () => addToCart(Number(button.dataset.itemId)));
  });
}

function renderCart() {
  const cartList = Object.values(state.cart);

  if (cartList.length === 0) {
    cartItems.innerHTML = '<p class="empty-state mb-0">No items selected yet.</p>';
  } else {
    cartItems.innerHTML = cartList.map((item) => `
      <div class="cart-row">
        <div>
          <h4 class="h6 mb-1">${item.name}</h4>
          <p class="small text-muted mb-2">${formatPrice(item.price)} each</p>
          <div class="cart-actions">
            <button type="button" data-action="decrease" data-item-id="${item.id}">-</button>
            <span class="px-2 fw-semibold">${item.quantity}</span>
            <button type="button" data-action="increase" data-item-id="${item.id}">+</button>
          </div>
        </div>
        <strong>${formatPrice(item.price * item.quantity)}</strong>
      </div>
    `).join('');
  }

  totalPrice.textContent = formatPrice(calculateTotal());

  cartItems.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const itemId = Number(button.dataset.itemId);
      if (button.dataset.action === 'increase') {
        updateQuantity(itemId, 1);
      } else {
        updateQuantity(itemId, -1);
      }
    });
  });
}

function addToCart(itemId) {
  const item = menuItems.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  if (!state.cart[itemId]) {
    state.cart[itemId] = { ...item, quantity: 0 };
  }

  state.cart[itemId].quantity += 1;
  persistCart();
  renderCart();
  showFeedback(`${item.name} added to your order.`, 'success');
}

function updateQuantity(itemId, delta) {
  const item = state.cart[itemId];
  if (!item) {
    return;
  }

  item.quantity += delta;
  if (item.quantity <= 0) {
    delete state.cart[itemId];
  }

  persistCart();
  renderCart();
}

function clearCart() {
  state.cart = {};
  persistCart();
  renderCart();
  showFeedback('Cart cleared.', 'secondary');
}

function calculateTotal() {
  return Object.values(state.cart).reduce((total, item) => total + (item.price * item.quantity), 0);
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function persistCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
}

async function submitOrder() {
  const tableNumber = Number(tableNumberInput.value);
  const items = Object.values(state.cart).map((item) => ({
    name: item.name,
    price: Number(item.price.toFixed(2)),
    quantity: item.quantity,
  }));
  const total = Number(calculateTotal().toFixed(2));

  if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
    showFeedback('Please enter a valid table number.', 'danger');
    return;
  }

  if (items.length === 0) {
    showFeedback('Please add at least one menu item before placing the order.', 'danger');
    return;
  }

  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = 'Sending order...';

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table_number: tableNumber,
        items,
        total_price: total,
      }),
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      const errors = payload.errors ? Object.values(payload.errors).join(' ') : payload.message;
      throw new Error(errors || 'Order request failed.');
    }

    state.cart = {};
    persistCart();
    renderCart();
    showFeedback(`Order #${payload.data.id} sent successfully for table ${payload.data.table_number}.`, 'success');
  } catch (error) {
    showFeedback(error.message || 'Unable to send your order right now.', 'danger');
  } finally {
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Place order';
  }
}

function showFeedback(message, type) {
  feedback.className = `alert alert-${type}`;
  feedback.textContent = message;
  feedback.classList.remove('d-none');
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

