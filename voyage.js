/* ================= PANIER ================= */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");

/* ================= CARTES ================= */
fetch("data.json")
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById("cards-container");
    container.innerHTML = "";

    data.forEach(item => {
      const card = `
        <div class="col-12 col-md-6 col-lg-4 mb-4 d-flex justify-content-center">
          <div class="card h-100 w-100">
            <img src="${item.image}" class="card-img-top" alt="${item.nom}">
            <div class="card-body">
              <h5 class="card-title">${item.nom}</h5>

              <p>
                À partir de <strong>${item.prix} €</strong>
              </p>

              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold">${item.personnes} Pers</span>

                <button
                  type="button"
                  class="btn btn-primary rounded-pill"
                  onclick='addToCart(${JSON.stringify(item)})'
                >
                  Ajouter au panier
                </button>
              </div>

              <p class="card-text mt-2">${item.description}</p>
            </div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", card);
    });

    updateCartUI();
  })
  .catch(error => console.error("Erreur chargement données :", error));

/* ================= AJOUT AU PANIER ================= */
function addToCart(product) {
  const found = cart.find(item => item.id === product.id);

  if (found) {
    found.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
}

/* ================= SUPPRESSION ================= */
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

/* ================= SAUVEGARDE ================= */
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

/* ================= UI PANIER ================= */
function updateCartUI() {
  if (!cartItems) return;

  cartItems.innerHTML = "";
  let total = 0;
  let count = 0;

  cart.forEach(item => {
    total += item.prix * item.qty;
    count += item.qty;

    cartItems.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>${item.nom}</strong><br>
          ${item.qty} × ${item.prix} €
        </div>
        <button
          class="btn btn-sm btn-danger"
          onclick="removeFromCart(${item.id})"
        >
          <i class="bi bi-trash"></i>
        </button>
      </li>
    `;
  });

  cartTotal.textContent = total;
  cartCount.textContent = count;
}
