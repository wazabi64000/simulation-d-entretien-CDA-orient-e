/**
 * CDA Recruit Simulator — rendu UI
 */
const UI = (() => {
  const difficultyLabel = {
    1: "Fondamental",
    2: "Junior",
    3: "Intermédiaire",
    4: "Avancé",
    5: "Expert",
  };

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function badgeRow(fiche) {
    return `
      <span class="badge badge-cat">${escapeHtml(fiche.categorie)}</span>
      <span class="badge badge-level">${escapeHtml(fiche.niveau)}</span>
      <span class="badge badge-diff">Diff. ${fiche.difficulte} — ${difficultyLabel[fiche.difficulte] || ""}</span>
    `;
  }

  function renderHomeStats(fiches, counts) {
    const cats = Object.keys(counts).length;
    const tech = new Set(fiches.flatMap((f) => f.technologies || [])).size;
    return `
      <div class="stat"><span class="stat-value">${fiches.length}</span><span class="stat-label">Fiches</span></div>
      <div class="stat"><span class="stat-value">${cats}</span><span class="stat-label">Catégories</span></div>
      <div class="stat"><span class="stat-value">${tech}</span><span class="stat-label">Technologies</span></div>
      <div class="stat"><span class="stat-value">RAG</span><span class="stat-label">Indexable</span></div>
    `;
  }

  function renderCategoryChips(categories) {
    return categories
      .map(
        (c) =>
          `<button type="button" class="chip" data-categorie="${escapeHtml(c)}">${escapeHtml(c)}</button>`
      )
      .join("");
  }

  function renderFicheCard(fiche) {
    const excerpt = (fiche.reponse || "").slice(0, 160).trim() + "…";
    return `
      <button type="button" class="fiche-card" role="listitem" data-id="${escapeHtml(fiche.id)}">
        <div class="fiche-card-top">${badgeRow(fiche)}</div>
        <h3>${escapeHtml(fiche.question)}</h3>
        <p>${escapeHtml(excerpt)}</p>
        <p>${escapeHtml(fiche.sousCategorie)} · ~${fiche.tempsReponse} min</p>
      </button>
    `;
  }

  function renderPagination(page, totalPages) {
    if (totalPages <= 1) return "";
    let html = "";
    for (let i = 1; i <= totalPages; i += 1) {
      if (totalPages > 12 && Math.abs(i - page) > 2 && i !== 1 && i !== totalPages) {
        if (i === 2 || i === totalPages - 1) html += `<span class="page-btn" aria-hidden="true">…</span>`;
        continue;
      }
      html += `<button type="button" class="page-btn${i === page ? " is-active" : ""}" data-page="${i}" aria-label="Page ${i}" ${i === page ? 'aria-current="page"' : ""}>${i}</button>`;
    }
    return html;
  }

  function renderCategoriesGrid(counts) {
    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0], "fr"))
      .map(
        ([name, count]) => `
        <button type="button" class="category-card" data-categorie="${escapeHtml(name)}">
          <h3>${escapeHtml(name)}</h3>
          <p>${count} fiche${count > 1 ? "s" : ""}</p>
        </button>`
      )
      .join("");
  }

  function list(items, empty = "Non renseigné") {
    if (!items || !items.length) return `<p>${empty}</p>`;
    return `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
  }

  function tags(items) {
    if (!items || !items.length) return "";
    return `<div class="tag-list">${items.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>`;
  }

  function ressources(items) {
    if (!items || !items.length) return "<p>Aucune ressource.</p>";
    return `<ul class="ressources">${items
      .map((r) => `<li><a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.titre)}</a></li>`)
      .join("")}</ul>`;
  }

  function renderDetail(fiche, isFavorite) {
    return `
      <header>
        <div class="fiche-card-top">${badgeRow(fiche)}</div>
        <h1 id="detail-title">${escapeHtml(fiche.question)}</h1>
        <div class="detail-meta">
          <span>Domaine : ${escapeHtml(fiche.sousCategorie)}</span>
          <span>Temps moyen : ${fiche.tempsReponse} min</span>
          <span>ID : ${escapeHtml(fiche.id)}</span>
        </div>
        <div class="detail-actions">
          <button type="button" class="btn btn-secondary" id="toggle-favorite" data-id="${escapeHtml(fiche.id)}">
            ${isFavorite ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
          </button>
        </div>
      </header>

      <section class="section-block">
        <h2>Pourquoi cette question est posée</h2>
        <p>${escapeHtml(fiche.pourquoi)}</p>
      </section>

      <section class="section-block">
        <h2>Ce que le recruteur cherche à évaluer</h2>
        <p>${escapeHtml(fiche.evaluation)}</p>
      </section>

      <section class="section-block">
        <h2>Réponse idéale</h2>
        <p>${escapeHtml(fiche.reponse)}</p>
      </section>

      <section class="section-block">
        <h2>Explication complète</h2>
        <p>${escapeHtml(fiche.explication)}</p>
      </section>

      <section class="section-block">
        <h2>Exemple concret</h2>
        <p>${escapeHtml(fiche.exemple)}</p>
      </section>

      ${
        fiche.code
          ? `<section class="section-block"><h2>Exemple de code</h2><pre class="code-block"><code>${escapeHtml(fiche.code)}</code></pre></section>`
          : ""
      }

      <section class="section-block">
        <h2>Erreurs fréquentes</h2>
        ${list(fiche.erreurs)}
      </section>

      <section class="section-block">
        <h2>Conseils du recruteur</h2>
        <p>${escapeHtml(fiche.conseils)}</p>
      </section>

      <section class="section-block">
        <h2>Bonnes pratiques</h2>
        ${list(fiche.bonnesPratiques)}
      </section>

      <section class="section-block">
        <h2>Variantes possibles de la question</h2>
        ${list(fiche.variantes)}
      </section>

      <section class="section-block">
        <h2>Mots-clés importants</h2>
        ${tags(fiche.motsCles)}
      </section>

      <section class="section-block">
        <h2>Technologies associées</h2>
        ${tags(fiche.technologies)}
      </section>

      <section class="section-block">
        <h2>Liens avec d’autres notions</h2>
        ${list(fiche.liensNotions)}
      </section>

      <section class="section-block">
        <h2>Compétences mobilisées</h2>
        ${tags(fiche.competences)}
      </section>

      <section class="section-block">
        <h2>Ressources officielles et de référence</h2>
        ${ressources(fiche.ressources)}
      </section>
    `;
  }

  function renderSimMeta(fiche) {
    return badgeRow(fiche) + ` <span class="badge badge-diff">~${fiche.tempsReponse} min</span>`;
  }

  function renderSimAnswer(fiche) {
    return `
      <section class="section-block">
        <h2>Réponse idéale</h2>
        <p>${escapeHtml(fiche.reponse)}</p>
      </section>
      <section class="section-block">
        <h2>Points clés à verbaliser</h2>
        <p>${escapeHtml(fiche.explication.slice(0, 500))}${fiche.explication.length > 500 ? "…" : ""}</p>
      </section>
      <section class="section-block">
        <h2>Erreurs à éviter</h2>
        ${list(fiche.erreurs)}
      </section>
      <p><button type="button" class="btn btn-ghost" data-open-detail="${escapeHtml(fiche.id)}">Voir la fiche complète</button></p>
    `;
  }

  function fillSelect(select, values, placeholder) {
    const current = select.value;
    select.innerHTML = `<option value="">${placeholder}</option>` +
      values.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
    if (values.includes(current)) select.value = current;
  }

  return {
    renderHomeStats,
    renderCategoryChips,
    renderFicheCard,
    renderPagination,
    renderCategoriesGrid,
    renderDetail,
    renderSimMeta,
    renderSimAnswer,
    fillSelect,
    difficultyLabel,
  };
})();
