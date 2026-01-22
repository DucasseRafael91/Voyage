/* ================= PANIER ================= */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");

/* ================= CARDS ET FILTRES ================= */
const container = document.getElementById("cards-container");
const continentFilter = document.getElementById("continent-filter");

const languageCheckboxes = [
  document.getElementById("Français"),
  document.getElementById("Anglais"),
  document.getElementById("Espagnol"),
  document.getElementById("Allemand")
];

const guidedSwitch = document.getElementById("flexSwitchCheckDefault");

const personsButtons = document.querySelectorAll(".persons-btn");
let selectedPersons = "";

const priceMinInput = document.getElementById("price-min");
const priceMaxInput = document.getElementById("price-max");


let allData = [];

/* ================= CHARGEMENT DONNÉES ================= */
fetch("data.json")
  .then(response => response.json())
  .then(data => {
    allData = data;
    displayCards(allData);
    updateCartUI();
  })
  .catch(error => console.error("Erreur chargement données :", error));

/* ================= AFFICHAGE CARTES ================= */
function displayCards(data) {
  container.innerHTML = "";

  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "col-12 col-md-6 col-lg-4 mb-4 d-flex justify-content-center";

    card.innerHTML = `
      <div class="card h-100 w-100 cursor-pointer">
        <img src="${item.image}" class="card-img-top" alt="${item.nom}">
        <div class="card-body">
          <h5 class="card-title">${item.nom}</h5>
          <p>À partir de <strong>${item.prix} €</strong></p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-bold">${item.personnes} Pers</span>
            <button class="btn btn-primary rounded-pill add-to-cart-btn"
              onclick='addToCart(${JSON.stringify(item)})'>
              Ajouter au panier
            </button>
          </div>
          <p class="card-text mt-2">${item.description}</p>
        </div>
      </div>
    `;

    card.querySelector(".card").addEventListener("click", (e) => {
      if (e.target.classList.contains("add-to-cart-btn")) return;
      showModal(item);
    });

    container.appendChild(card);
  });
}


/* ================= FILTRES COMBINÉS ================= */
function applyFilters() {
  const selectedContinent = continentFilter.value;

  const selectedLanguages = languageCheckboxes
    .filter(cb => cb.checked)
    .map(cb => cb.id);

  const isGuidedOnly = guidedSwitch.checked;

  const minPrice = parseInt(priceMinInput.value);
  const maxPrice = parseInt(priceMaxInput.value);

  let filteredData = allData;

  if (selectedContinent !== "") {
    filteredData = filteredData.filter(
      item => item.continent === selectedContinent
    );
  }

  if (selectedLanguages.length > 0) {
    filteredData = filteredData.filter(item =>
      item.langues.some(lang => selectedLanguages.includes(lang))
    );
  }

  if (isGuidedOnly) {
    filteredData = filteredData.filter(item => item.guidée === 1);
  }

  if (selectedPersons !== "") {
    filteredData = filteredData.filter(
      item => item.personnes === selectedPersons
    );
  }

  // ✅ FILTRE PRIX
  if (!isNaN(minPrice)) {
    filteredData = filteredData.filter(item => item.prix >= minPrice);
  }

  if (!isNaN(maxPrice)) {
    filteredData = filteredData.filter(item => item.prix <= maxPrice);
  }

  displayCards(filteredData);
}




continentFilter.addEventListener("change", applyFilters);
languageCheckboxes.forEach(cb => cb.addEventListener("change", applyFilters));
guidedSwitch.addEventListener("change", applyFilters);
priceMinInput.addEventListener("input", applyFilters);
priceMaxInput.addEventListener("input", applyFilters);



function addToCart(product) {
  const found = cart.find(item => item.id === product.id);

  if (found) {
    found.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

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
        <button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </li>
    `;
  });

  cartTotal.textContent = total;
  cartCount.textContent = count;
}

personsButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // Toggle (désélection si recliqué)
    if (selectedPersons === btn.dataset.personnes) {
      selectedPersons = "";
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-outline-primary");
    } else {
      selectedPersons = btn.dataset.personnes;

      personsButtons.forEach(b => {
        b.classList.remove("btn-primary");
        b.classList.add("btn-outline-primary");
      });

      btn.classList.remove("btn-outline-primary");
      btn.classList.add("btn-primary");
    }

    applyFilters();
  });
});


function showModal(item) {
  const modal = new bootstrap.Modal(document.getElementById("cardModal"));

  document.getElementById("cardModalLabel").textContent = item.nom;
  document.getElementById("modalImage").src = item.image;
  document.getElementById("modalImage").alt = item.nom;
  document.getElementById("modalDescription").textContent = item.description;
  document.getElementById("modalPrice").textContent = item.prix;
  document.getElementById("modalPersons").textContent = item.personnes;
  document.getElementById("modalLanguages").textContent = item.langues.join(", ");
  document.getElementById("modalContinent").textContent = item.continent;
  document.getElementById("modalGuidee").textContent = item.guidée;

  modal.show();
}
