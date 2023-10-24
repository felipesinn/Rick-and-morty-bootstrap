const searchInput = document.querySelector('input[type="search"]');
const characterCardsContainer = document.getElementById("character-card");
const btnAnterior = document.getElementById("btn-Anterior");
const btnProximo = document.getElementById("btn-Proximo");

let currentPage = 1;
let characters = [];
const PER_PAGE = 6;

// Função para buscar a API

const fetchApi = async (page) => {
  try {
    const response = await api.get(`/character/?page=${page}`);

    if (response.status !== 200) {
      throw new Error("Falha ao buscar dados na API");
    }

    return response.data.results || [];
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return [];
  }
};

// Função para criar e exibir personagens na tela
const displayCharacterCards = (characters) => {
  characterCardsContainer.innerHTML = "";

  characters.forEach((character) => {
    const characterCard = document.createElement("div");
    characterCard.classList.add(
      "character-card",
      "card",
      "bg-black",
      "bg-opacity-10"
    );
    characterCard.style.minWidth = "250px";
    characterCard.style.maxWidth = "350px";

    characterCard.innerHTML = `
  <img src="${character.image}" class="card-img-top" alt="${character.name}">
  <div class="card-body">
    <h5 class="card-title">${character.name}</h5>
    <p class="card-text">Status: <span class="status-badge ${character.status.toLowerCase()}">${character.status}</span></p>
    <h6 class="card-subtitle mb-2 text-muted">${character.species}</h6>
    <p class="card-text">${character.type ? `Tipo: ${character.type}` : ''}</p>
    <p class="card-text">Origem: ${character.origin.name}</p>
  </div>
`;

    characterCardsContainer.appendChild(characterCard);
  });
};

// Função para carregar
const loadCharacters = async () => {
  const newCharacters = await fetchApi(currentPage);

  if (newCharacters.length > 0) {
    characters = newCharacters;
    displayCharacterCards(characters.slice(0, PER_PAGE));
  } else {
    console.log("Não foi possível encontrar dados para a página atual.");
  }
};
// Botão "Anterior"
btnAnterior.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updateCurrentPage();
    loadCharacters();
  }
});

// Botão "Próximo"
btnProximo.addEventListener("click", () => {
  currentPage++;
  updateCurrentPage(); 
  loadCharacters();
});

const updateCurrentPage = () => {
  const currentPageElement = document.getElementById("currentPage");
  currentPageElement.textContent = currentPage;
};

// Pesquisar personagens
const noResultsDiv = document.getElementById("no-results");

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const matchingCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchTerm)
  );

  if (matchingCharacters.length > 0) {
    displayCharacterCards(matchingCharacters.slice(0, PER_PAGE));
    noResultsDiv.style.display = "none";
  } else {
    noResultsDiv.style.display = "block";
  }
});

// Função para pesquisa quando digitamos na barra de pesquisa
const realTimeSearch = (searchTerm) => {
  const matchingCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchTerm)
  );

  if (matchingCharacters.length > 0) {
    displayCharacterCards(matchingCharacters.slice(0, PER_PAGE));
    noResultsDiv.style.display = "none";
  } else {
    noResultsDiv.style.display = "block";
  }
};

// Função para pesquisa com atraso pra evitar quebra no codigo
const delayedSearch = async (searchTerm) => {
  if (searchTerm) {
    const matchingCharacters = await searchCharacters(searchTerm);

    if (matchingCharacters.length > 0) {
      displayCharacterCards(matchingCharacters.slice(0, PER_PAGE));
      noResultsDiv.style.display = "none";
    } else {
      noResultsDiv.style.display = "block";
    }
  } else {
    characterCardsContainer.innerHTML = "";
    noResultsDiv.style.display = "none";
  }
};

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.trim().toLowerCase();

  realTimeSearch(searchTerm);

  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {
    delayedSearch(searchTerm);
  }, 300);
});

// clique nos cards dos personagens e abre modal
characterCardsContainer.addEventListener("click", async (event) => {
  const clickedCard = event.target.closest(".character-card");
  if (clickedCard) {
    const characterIndex = Array.from(characterCardsContainer.children).indexOf(
      clickedCard
    );
    const character = characters[characterIndex];

    document.getElementById("modalCharacterName").textContent = character.name;
    document.getElementById("modalCharacterSpecies").textContent =
      character.species;
    document.getElementById(
      "modalCharacterOrigin"
    ).textContent = `Origem: ${character.origin.name}`;

    const characterImage = document.getElementById("modalCharacterImage");
    characterImage.src = character.image;

    const modal = document.getElementById("characterModal");
    modal.style.display = "block";
  }
});

//  botão Fechar da modal
const closeModalButton = document.getElementById("closeModalButton");
closeModalButton.addEventListener("click", function () {
  const modal = document.getElementById("characterModal");
  modal.style.display = "none";
});

window.addEventListener("click", function (event) {
  const modal = document.getElementById("characterModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

//recarrega a pagina sempre at
loadCharacters();
