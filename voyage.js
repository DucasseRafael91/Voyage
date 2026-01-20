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
              <p class="fw-bold">A partir de ${item.prix} €</p>
            </div>
          </div>
        </div>
      `;
      container.innerHTML += card;
    });
  })
  .catch(error => console.error('Erreur chargement data:', error));

