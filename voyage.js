/* Initialise le panier à la premiere visite puis pour les prochaine est bon car stocké dans le local storage */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* Obets du panier */
const cartItems = document.getElementById("cart-items");
/* Prix total du panier */
const cartTotal = document.getElementById("cart-total");
/* Compteur  du panier */
const cartCount = document.getElementById("cart-count");

/* Container des cards */
const cardcontainer = document.getElementById("cards-container");

/* Filtre des continents */
const continentFilter = document.getElementById("continent-filter");

/* CheckBox des langues */
const languageCheckboxes = [
  document.getElementById("Français"),
  document.getElementById("Anglais"),
  document.getElementById("Espagnol"),
  document.getElementById("Allemand")
];

/* Switch des visites guidées */
const isGuided = document.getElementById("flexSwitchCheckDefault");

/* Boutons permettant la selection du nombre de personnes */
const personsButtons = document.querySelectorAll(".persons-btn");
/* Choix du bouton initialités à nulle */
let selectedPersons = "";

/* Prix minimum */
const priceMinInput = document.getElementById("price-min");
/* Prix maximum */
const priceMaxInput = document.getElementById("price-max");

/* Tableau qui contiendra toute les données des voyages*/
let dataTrips = [];

/* Récupération des données dans le fichier json */
fetch("data.json") 
  .then(response => response.json())
  .then(data => {
    dataTrips = data;
    displayCards(dataTrips);
    updateCartUI();
  })
  .catch(error => console.error("Erreur chargement données :", error));

/* ================= AFFICHAGE CARTES ================= */
function displayCards(data) {
  cardcontainer.innerHTML = "";

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

    cardcontainer.appendChild(card);
  });
}

/* ================= FILTRES COMBINÉS ================= */
function applyFilters() {
  let filteredData = dataTrips;

  const selectedContinent = continentFilter.value;
  if (selectedContinent) {
    filteredData = filteredData.filter(item => item.continent === selectedContinent);
  }

  const selectedLanguages = languageCheckboxes
    .filter(cb => cb.checked)
    .map(cb => cb.id);
  if (selectedLanguages.length > 0) {
    filteredData = filteredData.filter(item =>
      item.langues.some(lang => selectedLanguages.includes(lang))
    );
  }

  if (isGuided.checked) {
    filteredData = filteredData.filter(item => item.guidée === 1);
  }

  if (selectedPersons) {
    filteredData = filteredData.filter(item => item.personnes === selectedPersons);
  }

  const minPrice = parseInt(priceMinInput.value);
  if (!isNaN(minPrice)) filteredData = filteredData.filter(item => item.prix >= minPrice);

  const maxPrice = parseInt(priceMaxInput.value);
  if (!isNaN(maxPrice)) filteredData = filteredData.filter(item => item.prix <= maxPrice);

  displayCards(filteredData);
}

/* ================= ÉVÉNEMENTS FILTRES ================= */
continentFilter.addEventListener("change", applyFilters);
languageCheckboxes.forEach(cb => cb.addEventListener("change", applyFilters));
isGuided.addEventListener("change", applyFilters);
priceMinInput.addEventListener("input", applyFilters);
priceMaxInput.addEventListener("input", applyFilters);

personsButtons.forEach(btn => {
  btn.addEventListener("click", () => {
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

/* ================= PANIER ================= */
function addToCart(product) {
  const found = cart.find(item => item.id === product.id);
  if (found) found.qty++;
  else cart.push({ ...product, qty: 1 });
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
  let total = 0, count = 0;

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

/* ================= MODAL ================= */
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
