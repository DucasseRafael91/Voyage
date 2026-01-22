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
    /* Affichage des cards */
    displayCards(dataTrips);
    /* Mise à jour du panier si des valeurs sont stockées dans le localStorage*/
    updateCartInterface();
  })
  /* Erreur si récupération des données impossibles*/
  .catch(error => console.error("Erreur chargement données :", error));

/* Fonction permettant d'afficher les cards dans le HTML */
function displayCards(data) {
  cardcontainer.innerHTML = "";

  /* Boucle pour chaque card */
  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "col-12 col-md-6 col-lg-4 mb-4 d-flex justify-content-center";

    card.innerHTML = `
      <!-- Taille de la card -->
      <div class="card h-100 w-100 cursor-pointer">
        <!-- Image + nom de la card en alt -->
        <img src="${item.image}" class="card-img-top" alt="${item.nom}">
        <div class="card-body">
          <!-- Nom de la card -->
          <h5 class="card-title">${item.nom}</h5>
          <!-- Prix de la card -->
          <p>À partir de <strong>${item.prix} €</strong></p>
          <div class="d-flex justify-content-between align-items-center">
            <!-- Nombre de personnes de la card -->
            <span class="fw-bold">${item.personnes} Pers</span>
            <!-- Bouton pour ajouter la card au panier -->
            <button class="btn btn-primary rounded-pill add-to-cart-btn"
              onclick='addToCart(${JSON.stringify(item)})'>
              Ajouter au panier
            </button>
          </div>
          <!-- Description de la card -->
          <p class="card-text mt-2">${item.description}</p>
        </div>
      </div>
    `;

    /* Si clique sur le bouton ajouter au panier ne fait rien sinon montre la modal detail de la card  */
    card.querySelector(".card").addEventListener("click", (e) => {
      if (e.target.classList.contains("add-to-cart-btn")) 
        return;
      showModal(item);
    });

    /* Stocke le HTML en card dans cardcontainer  */
    cardcontainer.appendChild(card);
  });
}

/* Fonction pour appliquer le filtre */
function applyFilters() {

  /* Recupere les données des voyages dans filtetedData */
  let filteredData = dataTrips;

  /* Recupere quel continent à été choisie */
  const selectedContinent = continentFilter.value;
  /* Si le continent n'est pas vide filtedData enleve toutes les données n'ayant pas le bon continent */
  if (selectedContinent) {
    filteredData = filteredData.filter(item => item.continent === selectedContinent);
  }

  /* Recupere les langues selectionnés */
  const selectedLanguages = languageCheckboxes
    .filter(cb => cb.checked)
    .map(cb => cb.id);
  /* Si le nombre de langues n'est pas vide filtedData enleve toutes les données n'ayant pas la ou les bonnes langues */
  if (selectedLanguages.length > 0) {
    filteredData = filteredData.filter(item =>
      item.langues.some(lang => selectedLanguages.includes(lang))
    );
  }

  /* Si le switch de visite guidée est checkée filteredData enleve toutes les données n'ayant pas de visite guidée  */
  if (isGuided.checked) {
    filteredData = filteredData.filter(item => item.guidée === 1);
  }

  /* Si selectedPersons n'est pas vide alors filteredData enleve toutes les données n'ayant pas le bon nombre de personnes */
  if (selectedPersons) {
    filteredData = filteredData.filter(item => item.personnes === selectedPersons);
  }

  /* Recupere la valeur du prix minimum */
  const minPrice = Number.parseInt(priceMinInput.value);
  /* Si la valeur existe alors filteredData enleve toutes les données yant un prix inférieur au prix minimum*/
  if (minPrice) 
    filteredData = filteredData.filter(item => item.prix >= minPrice);

  /* Recupere la valeur du prix maximum */
  const maxPrice = Number.parseInt(priceMaxInput.value);
  /* Si la valeur existe alors filteredData enleve toutes les données yant un prix supérieur au prix maximum*/
  if (maxPrice) 
    filteredData = filteredData.filter(item => item.prix <= maxPrice);

  /* Affichage des cards filtrés*/
  displayCards(filteredData);
}

/* A chaque changement d'un paramétre dans les filtres réappelle applyFilters */
continentFilter.addEventListener("change", applyFilters);
languageCheckboxes.forEach(cb => cb.addEventListener("change", applyFilters));
isGuided.addEventListener("change", applyFilters);
priceMinInput.addEventListener("input", applyFilters);
priceMaxInput.addEventListener("input", applyFilters);

/* Fonction qui change le bouton du nombre de personne selectionné et change aussi la couleur pruis réapplique le filtre*/
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

/* ================= Fonction pour ajouter un produit au banier================= */
function addToCart(product) {
  // Cherche si le produit est déjà dans le panier
  let product_found = null;
  for (const element of cart) {
    if (element.id === product.id) {
      product_found = element;
      break;
    }
  }

  if (product_found === null) {
    // Sinon, on ajoute le produit au panier avec qty = 1
    const productToAdd = {
      id: product.id,
      nom: product.nom,
      prix: product.prix,
      personnes: product.personnes,
      image: product.image,
      description: product.description,
      langues: product.langues,
      continent: product.continent,
      guidée: product.guidée,
      qty: 1
    };
    cart.push(productToAdd);
  } 
  else {
    // Si le produit est déjà dans le panier, on augmente la quantité
    product_found.qty = product_found.qty + 1;
  }

  // Sauvegarde le panier dans le localStorage et met à jour l'affichage
  saveCart();
}


function removeFromCart(id) {
  // Crée un nouveau tableau pour stocker les produits qui restent dans le panier
  let newCart = [];

  // Parcourt tous les produits du panier
  for (const element of cart) {
    let item = element;

    // Si l'id du produit actuel est différent de celui qu'on veut supprimer,
    // on le garde dans le nouveau panier
    if (item.id !== id) {
      newCart.push(item);
    }
  }

  // Remplace l'ancien panier par le nouveau panier filtré
  cart = newCart;

  // Sauvegarde le panier mis à jour dans le localStorage et met à jour l'affichage
  saveCart();
}

// Sauvegarde le panier mis à jour dans le localStorage et met à jour l'affichage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartInterface();
}

function updateCartInterface() {
  if (!cartItems) 
    return;

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
