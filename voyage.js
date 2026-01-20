fetch('data.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('cards-container');

    data.forEach(item => {
      const card = `
        <div class="col-md-4">
          <div class="card h-100">
            <img src="${item.image}" class="card-img-top" alt="${item.nom}">
            <div class="card-body">
              <h5 class="card-title">${item.nom}</h5>
              <p>A partir de ${item.prix} €</p>

              <!-- Ligne chiffre + bouton -->
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold">${item.personnes} Pers</span>
                <button type="button" class="btn btn-primary rounded-pill">
                  Ajouter au panier
                </button>
              </div>

              <p class="card-text mt-2">${item.description}</p>
            </div>
          </div>
        </div>
      `;

      container.innerHTML += card;
    });
  })
  .catch(error => console.error('Erreur chargement données:', error));
