/**
 * CDA Recruit Simulator — application principale
 */
(function () {
  const PAGE_SIZE = 12;
  const FAV_KEY = "cda-recruit-favorites";
  const THEME_KEY = "cda-recruit-theme";

  let fiches = [];
  let filtered = [];
  let facets = { categories: [], technologies: [], motsCles: [], niveaux: [] };
  let page = 1;
  let currentView = "home";
  let previousView = "catalog";
  let currentFiche = null;
  let simFiche = null;

  const els = {
    views: {
      home: document.getElementById("view-home"),
      catalog: document.getElementById("view-catalog"),
      categories: document.getElementById("view-categories"),
      detail: document.getElementById("view-detail"),
      simulate: document.getElementById("view-simulate"),
      favorites: document.getElementById("view-favorites"),
    },
    homeStats: document.getElementById("home-stats"),
    featuredCategories: document.getElementById("featured-categories"),
    homeSearchForm: document.getElementById("home-search-form"),
    homeSearch: document.getElementById("home-search"),
    filterSearch: document.getElementById("filter-search"),
    filterCategorie: document.getElementById("filter-categorie"),
    filterDifficulte: document.getElementById("filter-difficulte"),
    filterNiveau: document.getElementById("filter-niveau"),
    filterTechno: document.getElementById("filter-techno"),
    filterMotcle: document.getElementById("filter-motcle"),
    resetFilters: document.getElementById("reset-filters"),
    catalogList: document.getElementById("catalog-list"),
    catalogCount: document.getElementById("catalog-count"),
    pagination: document.getElementById("pagination"),
    categoriesGrid: document.getElementById("categories-grid"),
    ficheDetail: document.getElementById("fiche-detail"),
    backBtn: document.getElementById("back-btn"),
    simCategorie: document.getElementById("sim-categorie"),
    simDifficulte: document.getElementById("sim-difficulte"),
    simDraw: document.getElementById("sim-draw"),
    simCard: document.getElementById("sim-card"),
    simMeta: document.getElementById("sim-meta"),
    simQuestion: document.getElementById("sim-question"),
    simReveal: document.getElementById("sim-reveal"),
    simNext: document.getElementById("sim-next"),
    simFavorite: document.getElementById("sim-favorite"),
    simAnswer: document.getElementById("sim-answer"),
    favoritesList: document.getElementById("favorites-list"),
    favoritesEmpty: document.getElementById("favorites-empty"),
    themeToggle: document.getElementById("theme-toggle"),
    logoHome: document.getElementById("logo-home"),
  };

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function setFavorites(ids) {
    localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  }

  function toggleFavorite(id) {
    const favs = getFavorites();
    const idx = favs.indexOf(id);
    if (idx >= 0) favs.splice(idx, 1);
    else favs.push(id);
    setFavorites(favs);
    return favs.includes(id);
  }

  function isFavorite(id) {
    return getFavorites().includes(id);
  }

  function showView(name) {
    if (name !== "detail") previousView = currentView === "detail" ? previousView : currentView;
    currentView = name;
    Object.entries(els.views).forEach(([key, el]) => {
      const active = key === name;
      el.hidden = !active;
      el.classList.toggle("is-visible", active);
    });
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.view === name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getFilters() {
    return {
      query: els.filterSearch.value.trim(),
      categorie: els.filterCategorie.value,
      difficulte: els.filterDifficulte.value,
      niveau: els.filterNiveau.value,
      technologie: els.filterTechno.value,
      motCle: els.filterMotcle.value,
    };
  }

  function applyFilters() {
    filtered = SearchEngine.filter(fiches, getFilters());
    page = 1;
    renderCatalog();
  }

  function renderCatalog() {
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > totalPages) page = totalPages;
    const start = (page - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);

    els.catalogCount.textContent = `${total} fiche${total > 1 ? "s" : ""} trouvée${total > 1 ? "s" : ""}`;
    els.catalogList.innerHTML = slice.length
      ? slice.map(UI.renderFicheCard).join("")
      : `<p class="empty-state">Aucune fiche ne correspond à vos critères.</p>`;
    els.pagination.innerHTML = UI.renderPagination(page, totalPages);
  }

  function openFiche(id) {
    const fiche = fiches.find((f) => f.id === id);
    if (!fiche) return;
    currentFiche = fiche;
    els.ficheDetail.innerHTML = UI.renderDetail(fiche, isFavorite(id));
    showView("detail");
  }

  function renderFavorites() {
    const favIds = getFavorites();
    const list = fiches.filter((f) => favIds.includes(f.id));
    els.favoritesEmpty.hidden = list.length > 0;
    els.favoritesList.innerHTML = list.map(UI.renderFicheCard).join("");
  }

  function drawSimulation() {
    const cat = els.simCategorie.value;
    const maxDiff = Number(els.simDifficulte.value || 5);
    const pool = fiches.filter(
      (f) => (!cat || f.categorie === cat) && Number(f.difficulte) <= maxDiff
    );
    if (!pool.length) {
      els.simCard.hidden = false;
      els.simQuestion.textContent = "Aucune question pour ces filtres.";
      els.simMeta.innerHTML = "";
      els.simAnswer.hidden = true;
      return;
    }
    simFiche = pool[Math.floor(Math.random() * pool.length)];
    els.simCard.hidden = false;
    els.simMeta.innerHTML = UI.renderSimMeta(simFiche);
    els.simQuestion.textContent = simFiche.question;
    els.simAnswer.hidden = true;
    els.simAnswer.innerHTML = "";
    els.simFavorite.textContent = isFavorite(simFiche.id) ? "★ Favori" : "☆ Favori";
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.setAttribute("data-theme", saved);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    if (next === "light") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem(THEME_KEY, next === "light" ? "" : "dark");
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const view = el.dataset.view;
        if (view === "favorites") renderFavorites();
        if (view === "catalog") applyFilters();
        showView(view);
      });
    });

    els.logoHome.addEventListener("click", (e) => {
      e.preventDefault();
      showView("home");
    });

    els.homeSearchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      els.filterSearch.value = els.homeSearch.value;
      showView("catalog");
      applyFilters();
    });

    [
      els.filterSearch,
      els.filterCategorie,
      els.filterDifficulte,
      els.filterNiveau,
      els.filterTechno,
      els.filterMotcle,
    ].forEach((el) => {
      el.addEventListener("input", applyFilters);
      el.addEventListener("change", applyFilters);
    });

    els.resetFilters.addEventListener("click", () => {
      els.filterSearch.value = "";
      els.filterCategorie.value = "";
      els.filterDifficulte.value = "";
      els.filterNiveau.value = "";
      els.filterTechno.value = "";
      els.filterMotcle.value = "";
      applyFilters();
    });

    els.catalogList.addEventListener("click", (e) => {
      const card = e.target.closest("[data-id]");
      if (card) openFiche(card.dataset.id);
    });

    els.favoritesList.addEventListener("click", (e) => {
      const card = e.target.closest("[data-id]");
      if (card) openFiche(card.dataset.id);
    });

    els.pagination.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-page]");
      if (!btn) return;
      page = Number(btn.dataset.page);
      renderCatalog();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    els.featuredCategories.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-categorie]");
      if (!chip) return;
      els.filterCategorie.value = chip.dataset.categorie;
      showView("catalog");
      applyFilters();
    });

    els.categoriesGrid.addEventListener("click", (e) => {
      const card = e.target.closest("[data-categorie]");
      if (!card) return;
      els.filterCategorie.value = card.dataset.categorie;
      showView("catalog");
      applyFilters();
    });

    els.backBtn.addEventListener("click", () => {
      showView(previousView || "catalog");
      if (previousView === "favorites") renderFavorites();
    });

    els.ficheDetail.addEventListener("click", (e) => {
      const btn = e.target.closest("#toggle-favorite");
      if (!btn || !currentFiche) return;
      const on = toggleFavorite(currentFiche.id);
      btn.textContent = on ? "★ Retirer des favoris" : "☆ Ajouter aux favoris";
    });

    els.simDraw.addEventListener("click", drawSimulation);
    els.simNext.addEventListener("click", drawSimulation);
    els.simReveal.addEventListener("click", () => {
      if (!simFiche) return;
      els.simAnswer.hidden = false;
      els.simAnswer.innerHTML = UI.renderSimAnswer(simFiche);
    });
    els.simFavorite.addEventListener("click", () => {
      if (!simFiche) return;
      const on = toggleFavorite(simFiche.id);
      els.simFavorite.textContent = on ? "★ Favori" : "☆ Favori";
    });
    els.simAnswer.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open-detail]");
      if (btn) openFiche(btn.dataset.openDetail);
    });

    els.themeToggle.addEventListener("click", toggleTheme);
  }

  function init() {
    if (!window.FICHES || !Array.isArray(window.FICHES)) {
      document.getElementById("main").innerHTML =
        '<p class="empty-state">Erreur : base de connaissances introuvable (js/data/fiches.js).</p>';
      return;
    }

    fiches = SearchEngine.enrich(window.FICHES);
    filtered = fiches.slice();
    facets = SearchEngine.facets(fiches);
    const counts = SearchEngine.countByCategory(fiches);

    els.homeStats.innerHTML = UI.renderHomeStats(fiches, counts);
    els.featuredCategories.innerHTML = UI.renderCategoryChips(facets.categories);
    els.categoriesGrid.innerHTML = UI.renderCategoriesGrid(counts);

    UI.fillSelect(els.filterCategorie, facets.categories, "Toutes");
    UI.fillSelect(els.filterTechno, facets.technologies, "Toutes");
    UI.fillSelect(els.filterMotcle, facets.motsCles.slice(0, 200), "Tous");
    UI.fillSelect(els.simCategorie, facets.categories, "Toutes");

    bindEvents();
    initTheme();
    renderCatalog();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
