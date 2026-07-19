/**
 * CDA Recruit Simulator — moteur de recherche et filtrage
 * Indexation plein texte pour orientation RAG.
 */
const SearchEngine = (() => {
  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function buildIndex(fiche) {
    const parts = [
      fiche.id,
      fiche.categorie,
      fiche.sousCategorie,
      fiche.niveau,
      fiche.question,
      fiche.pourquoi,
      fiche.evaluation,
      fiche.reponse,
      fiche.explication,
      fiche.exemple,
      fiche.code,
      fiche.conseils,
      ...(fiche.erreurs || []),
      ...(fiche.bonnesPratiques || []),
      ...(fiche.variantes || []),
      ...(fiche.motsCles || []),
      ...(fiche.technologies || []),
      ...(fiche.liensNotions || []),
      ...(fiche.competences || []),
      ...(fiche.tags || []),
      ...((fiche.ressources || []).map((r) => `${r.titre} ${r.url}`)),
    ];
    return normalize(parts.join(" "));
  }

  function enrich(fiches) {
    return fiches.map((f) => ({
      ...f,
      _index: buildIndex(f),
    }));
  }

  function matchesQuery(fiche, query) {
    if (!query) return true;
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    return tokens.every((token) => fiche._index.includes(token));
  }

  function filter(fiches, filters = {}) {
    const {
      query = "",
      categorie = "",
      difficulte = "",
      niveau = "",
      technologie = "",
      motCle = "",
    } = filters;

    return fiches.filter((f) => {
      if (!matchesQuery(f, query)) return false;
      if (categorie && f.categorie !== categorie) return false;
      if (difficulte && Number(f.difficulte) !== Number(difficulte)) return false;
      if (niveau && f.niveau !== niveau) return false;
      if (technologie && !(f.technologies || []).includes(technologie)) return false;
      if (motCle && !(f.motsCles || []).includes(motCle) && !(f.tags || []).includes(motCle)) {
        return false;
      }
      return true;
    });
  }

  function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b), "fr")
    );
  }

  function facets(fiches) {
    return {
      categories: uniqueSorted(fiches.map((f) => f.categorie)),
      technologies: uniqueSorted(fiches.flatMap((f) => f.technologies || [])),
      motsCles: uniqueSorted(fiches.flatMap((f) => [...(f.motsCles || []), ...(f.tags || [])])),
      niveaux: uniqueSorted(fiches.map((f) => f.niveau)),
    };
  }

  function countByCategory(fiches) {
    return fiches.reduce((acc, f) => {
      acc[f.categorie] = (acc[f.categorie] || 0) + 1;
      return acc;
    }, {});
  }

  return { enrich, filter, facets, countByCategory, normalize };
})();
