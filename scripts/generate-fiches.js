/**
 * Générateur principal — CDA Recruit Simulator
 * Produit js/data/fiches.js (≥ 650 fiches françaises, autonomes, indexables RAG).
 *
 * Usage: node scripts/generate-fiches.js
 */
const fs = require("fs");
const path = require("path");
const {
  buildFromSeed,
  presentationSeeds,
  htmlSeeds,
  R,
  techSeed,
} = require("./generate-fiches-part1");

/** Mappe un tableau de topics compact vers des seeds techSeed */
function mapTopics(topics, { prefix, categorie, ressources, technologies, liens, competences, baseNiveau }) {
  return topics.map((t, i) => {
    const [sousCategorie, question, concept, definition, points, exemple, code = ""] = t;
    const niveau =
      baseNiveau ||
      (i < Math.floor(topics.length * 0.4) ? "Junior" : i < Math.floor(topics.length * 0.75) ? "Confirmé" : "Senior");
    const difficulte = Math.min(5, 1 + Math.floor((i / Math.max(1, topics.length - 1)) * 4));
    return techSeed({
      prefix,
      n: i + 1,
      categorie,
      sousCategorie,
      niveau,
      difficulte,
      tempsReponse: difficulte <= 2 ? 3 : difficulte <= 4 ? 4 : 5,
      question,
      concept,
      definition,
      points,
      exemple,
      code,
      pratiques: [
        `Illustrer ${concept} avec un cas concret de projet`,
        "Citer les limites et alternatives",
        "Relier à la qualité, la sécurité ou la maintenabilité selon le sujet",
      ],
      motsCles: [concept, ...points.slice(0, 3), categorie],
      technologies: typeof technologies === "function" ? technologies(i, t) : technologies,
      liens: typeof liens === "function" ? liens(i, t) : liens,
      competences: typeof competences === "function" ? competences(i, t) : competences,
      ressources: typeof ressources === "function" ? ressources(i, t) : ressources,
      piege: `confondre ${concept} avec une notion voisine ou rester trop théorique`,
    });
  });
}

// ═══════════════════════════════════════════════════════════
// 1. Présentation professionnelle — expansion (~40)
// ═══════════════════════════════════════════════════════════
const presentationExtra = [
  ["STAR", "Expliquez la méthode STAR pour répondre à une question comportementale.", "méthode STAR", "STAR structure une anecdote : Situation, Tâche, Action, Résultat, pour prouver des compétences par des faits.", ["Situation", "Tâche", "Action", "Résultat"], "Situation : bug prod ; Action : rollback + fix ; Résultat : MTTR réduit de 40 %."],
  ["Forces", "Quelles sont vos trois forces en tant que développeur CDA ?", "forces professionnelles", "Les forces crédibles sont prouvées par des exemples (rigueur, curiosité, collaboration) et alignées au poste.", ["autoconnaissance", "preuves", "alignement poste"], "« Curiosité » illustrée par une veille React et un POC hooks."],
  ["Faiblesses", "Comment parler d’une faiblesse sans se saboter ?", "gestion des faiblesses", "On choisit une vraie limite non critique, on montre la conscience et le plan d’amélioration mesurable.", ["authenticité", "plan d’action", "humilité"], "« Je sur-ingénierie parfois » → checklists de simplicité et revue de design."],
  ["Conflit", "Décrivez un conflit d’équipe et sa résolution.", "gestion de conflit", "Un conflit se gère par écoute, faits, intérêt commun et médiation si besoin, sans attaque personnelle.", ["écoute", "médiation", "faits"], "Désaccord sur librairie : POC comparatif et critères objectifs."],
  ["Échec", "Parlez d’un échec technique et de ce que vous en avez appris.", "apprentissage par l’échec", "Un échec valorisé montre analyse de cause, correction et prévention (post-mortem, tests, process).", ["post-mortem", "cause racine", "prévention"], "Oubli de migration → checklist de déploiement et dry-run."],
  ["Objectifs", "Où vous voyez-vous dans 3 à 5 ans ?", "projection de carrière", "Une projection réaliste allie montée technique, autonomie et contribution produit, sans promesse irréaliste.", ["carrière", "autonomie", "spécialisation"], "Viser full-stack confirmé puis expertise backend/cloud."],
  ["Questions", "Quelles questions posez-vous en fin d’entretien ?", "questions candidat", "De bonnes questions portent sur stack, rituels, mentorat, critères de succès à 6 mois et culture d’équipe.", ["curiosité", "culture", "mentorat"], "« Comment se passe l’onboarding technique d’un alternant ? »"],
  ["Salaire", "Comment aborder la question de la rémunération ?", "négociation salaire", "On se renseigne sur les grilles, on parle fourchette après avoir valorisé le match, et on considère le package global.", ["fourchette", "package", "marché"], "Citer une fourchette basée sur études et contexte alternance/CDI."],
  ["Disponibilité", "Comment gérer le rythme école / entreprise en alternance ?", "rythme alternance", "Le rythme impose planification, communication des absences école et priorisation avec le tuteur.", ["planning", "communication", "priorisation"], "Partager le calendrier pédagogique dès l’arrivée."],
  ["GitHub", "Que doit montrer votre profil GitHub à un recruteur ?", "profil GitHub", "Un GitHub convaincant montre activité régulière, README clairs, commits atomiques et projets aboutis.", ["commits", "README", "régularité"], "Épingler 3 repos représentatifs avec démos."],
  ["LinkedIn", "Comment optimiser LinkedIn pour un poste CDA ?", "personal branding", "Titre clair, résumé orienté valeur, projets, recommandations et mots-clés ATS améliorent la visibilité.", ["ATS", "réseau", "visibilité"], "Titre : « Alternant CDA — Node / React / PostgreSQL »."],
  ["Entretien", "Comment se préparer concrètement à un entretien technique ?", "préparation entretien", "Réviser fiches, refaire les projets du CV, préparer STAR, questions, et simuler à voix haute.", ["simulation", "révision", "STAR"], "Refaire l’archi d’un projet du CV au tableau blanc."],
  ["Live coding", "Comment abordez-vous un exercice de live coding ?", "live coding", "On clarifie le besoin, verbalise, part simple (happy path), teste, puis itère ; la communication compte autant que le code.", ["clarification", "incremental", "tests"], "Écrire d’abord la signature et 2 cas de test."],
  ["Culture", "Comment évaluez-vous si une entreprise vous convient ?", "fit culturel", "On observe rituels, feedback, qualité du code, bienveillance et alignement valeurs/mission.", ["fit", "valeurs", "rituels"], "Demander un exemple de décision technique récente."],
  ["Feedback", "Comment donnez-vous un feedback constructif à un pair ?", "feedback constructif", "Le feedback utile est factuel, orienté comportement/code, avec suggestion et ouverture au dialogue.", ["SBI", "bienveillance", "amélioration"], "« Sur cette PR, cette fonction fait 2 choses — et si on extrayait X ? »"],
  ["Priorités", "Comment priorisez-vous quand tout est « urgent » ?", "priorisation", "On clarifie impact/urgence avec le PO, estime, et communique les trade-offs explicitement.", ["Eisenhower", "impact", "trade-off"], "Stabiliser prod avant feature nice-to-have."],
  ["Documentation", "Pourquoi documenter et comment le faire sans surcoût ?", "documentation utile", "Documenter décisions (ADR), README, API et runbooks réduit le bus factor ; on documente le « pourquoi ».", ["ADR", "README", "bus factor"], "ADR d’une page pour le choix JWT vs sessions."],
  ["Apprentissage", "Comment apprenez-vous une nouvelle techno rapidement ?", "apprentissage accéléré", "Objectif clair, doc officielle, petit projet, comparaison avec connu, puis revue/pair.", ["doc", "POC", "pratique"], "Apprendre Vitest en migrant 3 tests Jest."],
  ["Éthique", "Que feriez-vous si on vous demandait de livrer du code non testé en prod ?", "éthique professionnelle", "On alerte sur les risques, propose un minimum viable (smoke tests, feature flag) et refuse le silence complice.", ["risque", "feature flag", "responsabilité"], "Proposer un déploiement canary + checklist."],
  ["Inclusion", "Pourquoi l’inclusion et la diversité comptent en équipe tech ?", "inclusion", "Des équipes diverses réduisent biais produit et améliorent qualité des décisions ; l’inclusion est un levier de performance.", ["diversité", "biais", "climat"], "Veiller aux rituels accessibles (async, fuseaux, language)."],
  ["Remote", "Comment garder le lien d’équipe en full remote ?", "collaboration remote", "Canaux clairs, synchro limitée, documentation, pair programming ponctuel et rituels sociaux structurés.", ["async", "pair", "rituels"], "Office hours techniques 2×/semaine."],
  ["Mentorat", "Comment tirez-vous parti d’un tuteur / mentor ?", "mentorat", "Préparer questions, montrer tentatives, demander feedback ciblé et capitaliser par notes.", ["préparation", "feedback", "notes"], "« J’ai essayé A et B, bloqué sur C — avis ? »"],
  ["Valeur", "Comment démontrez-vous votre valeur dès les premières semaines ?", "onboarding réussi", "Livrer de petites PR utiles, documenter, poser des questions intelligentes et améliorer un pain point visible.", ["quick wins", "PR", "observation"], "Corriger un bug doc + ajouter un test manquant."],
  ["Stress entretien", "Comment gérez-vous le stress pendant l’entretien ?", "gestion du stress entretien", "Respiration, reformulation, droit de réfléchir, et accepter de ne pas tout savoir en proposant une méthode.", ["reformulation", "méthode", "calme"], "« Je vais décomposer le problème en étapes… »"],
];

presentationExtra.forEach((t, i) => {
  const [sous, question, concept, definition, points, exemple] = t;
  presentationSeeds.push({
    id: `pres-${String(i + 17).padStart(3, "0")}`,
    categorie: "Présentation professionnelle",
    sousCategorie: sous,
    niveau: i < 10 ? "Junior" : i < 18 ? "Confirmé" : "Senior",
    difficulte: Math.min(5, 1 + Math.floor(i / 6)),
    tempsReponse: 3,
    question,
    concept,
    definition,
    points,
    exemple,
    erreurs: [`Réponse trop générique sur ${concept}`, "Aucun exemple concret", "Dévalorisation excessive"],
    pratiques: [`Préparer une anecdote STAR sur ${concept}`, "Adapter au poste CDA", "Finir par un apprentissage"],
    motsCles: [concept, sous.toLowerCase(), "entretien", "soft skills", ...points.slice(0, 2)],
    technologies: ["Communication", "Agile"],
    liens: ["Soft Skills", "Présentation", "Motivation"],
    competences: ["Expression orale", "Intelligence émotionnelle", "Professionnalisme"],
    ressources: R("oc", "scrum", "fcc"),
    piege: "réciter sans vécu personnel",
  });
});

// ═══════════════════════════════════════════════════════════
// 2. HTML — expansion (~45)
// ═══════════════════════════════════════════════════════════
const htmlExtra = [
  ["Templates", "À quoi sert l’élément <template> ?", "HTML template", "template contient du HTML inerte clonable via JS, utile pour composants sans framework.", ["template", "cloneNode", "DocumentFragment"], "Liste dynamique : cloner un template de ligne.", "<template id=\"row\">\n  <tr><td></td></tr>\n</template>"],
  ["Dialog", "Comment utiliser <dialog> pour une modale accessible ?", "élément dialog", "dialog fournit une modale native avec showModal(), focus trap partiel et backdrop, plus accessible qu’un div custom.", ["dialog", "showModal", "a11y"], "Éviter les modales 100 % custom si dialog suffit.", "<dialog id=\"confirm\">\n  <form method=\"dialog\"><button>OK</button></form>\n</dialog>"],
  ["Details", "Quand utiliser <details> et <summary> ?", "details/summary", "Ils créent un accordéon natif sans JS, utile pour FAQ et contenus progressifs.", ["details", "summary", "progressive disclosure"], "FAQ accessibles avec détails natifs.", "<details><summary>Livraison ?</summary><p>48h.</p></details>"],
  ["Iframe", "Quels risques et bonnes pratiques avec les iframes ?", "iframe sécurité", "Les iframes isolent du contenu tiers mais posent des risques XSS/clickjacking ; sandbox et CSP sont essentiels.", ["sandbox", "CSP", "clickjacking"], "sandbox=\"allow-scripts\" minimal pour un widget.", "<iframe src=\"widget.html\" sandbox=\"allow-scripts\" title=\"Widget\"></iframe>"],
  ["Link", "Différence entre <a>, <link> et <button> ?", "navigation vs action", "a navigue (URL), link déclare des ressources du document, button déclenche une action sans changer d’URL.", ["a", "link", "button"], "Soumettre un filtre AJAX : button, pas un lien vide.", ""],
  ["Table", "Quand une table HTML est-elle sémantiquement correcte ?", "tableaux de données", "Les tables présentent des données tabulaires, pas la mise en page ; caption, th/scope améliorent l’a11y.", ["table", "th", "scope", "caption"], "Tarifs : table ; layout carte : CSS Grid.", "<table><caption>Tarifs</caption><th scope=\"col\">Offre</th></table>"],
  ["Lists", "ul, ol, dl : quels usages ?", "listes HTML", "ul pour non ordonné, ol pour séquences, dl pour paires terme/définition (glossaires, métadonnées).", ["ul", "ol", "dl"], "Glossaire API avec dl/dt/dd.", ""],
  ["Head", "Que met-on typiquement dans <head> ?", "document head", "Métadonnées, title, charset, viewport, CSS, preconnect, JSON-LD — pas de contenu visible.", ["charset", "viewport", "preconnect"], "UTF-8 + viewport en premier.", "<meta charset=\"utf-8\">"],
  ["Base", "À quoi sert la balise <base> ?", "balise base", "base définit l’URL de base pour les liens relatifs ; dangereuse si mal utilisée (phishing relatif).", ["base", "URL relative"], "Rare en prod moderne ; préférer chemins absolus contrôlés.", ""],
  ["Custom elements", "HTML et Web Components : quel lien ?", "Custom Elements", "Les Custom Elements étendent HTML avec des balises définies en JS (autonomous ou customized built-in).", ["customElements", "shadow DOM"], "class MyCard extends HTMLElement {}", "customElements.define('my-card', MyCard);"],
  ["Content models", "Qu’est-ce qu’un content model HTML ?", "content model", "Le content model définit quel contenu un élément peut contenir (flow, phrasing, interactive…).", ["content model", "phrasing", "flow"], "p ne peut pas contenir de div.", ""],
  ["Boolean attrs", "Comment fonctionnent les attributs booléens HTML ?", "attributs booléens", "Présence = true (disabled, required, checked) ; la valeur textuelle est souvent ignorée.", ["disabled", "required", "checked"], "disabled=\"false\" reste disabled !", "<button disabled>Envoyer</button>"],
  ["Download", "À quoi sert l’attribut download sur un lien ?", "attribut download", "Il suggère au navigateur de télécharger la ressource plutôt que de la naviguer, avec nom optionnel.", ["download", "blob", "UX"], "Export CSV via lien généré.", "<a href=\"/export.csv\" download=\"export.csv\">CSV</a>"],
  ["Rel", "Citez des valeurs utiles de rel sur les liens.", "attribut rel", "rel décrit la relation : noopener, noreferrer, nofollow, stylesheet, preload, me…", ["noopener", "preload", "nofollow"], "target=_blank implique rel=noopener.", "<a href=\"https://ext.example\" target=\"_blank\" rel=\"noopener noreferrer\">"],
  ["Preload", "preload, prefetch, preconnect : différences ?", "resource hints", "preconnect établit tôt la connexion ; preload charge une ressource critique ; prefetch anticipe une navigation future.", ["preload", "prefetch", "preconnect"], "preconnect vers API CDN ; preload de la font critique.", '<link rel="preconnect" href="https://api.example.com">'],
];

htmlExtra.forEach((t, i) => {
  const [sous, question, concept, definition, points, exemple, code] = t;
  htmlSeeds.push(
    techSeed({
      prefix: "html",
      n: 31 + i,
      categorie: "HTML",
      sousCategorie: sous,
      niveau: i < 6 ? "Junior" : i < 11 ? "Confirmé" : "Senior",
      difficulte: Math.min(5, 2 + Math.floor(i / 4)),
      question,
      concept,
      definition,
      points,
      exemple,
      code: code || "",
      pratiques: [`Valider l’usage de ${concept} via MDN/spec`, "Tester accessibilité clavier", "Éviter le HTML de présentation"],
      motsCles: [concept, ...points.slice(0, 3), "HTML5"],
      technologies: ["HTML5", "Accessibilité", "Performance"],
      liens: ["Accessibilité", "Performance", "SEO", "Sécurité"],
      competences: ["Intégration web", "Accessibilité", "HTML sémantique"],
      ressources: R("mdnHtml", "whatwg", "w3c", "webdev", "caniuse"),
      piege: `utiliser ${concept} hors de son intention sémantique`,
    })
  );
});

// ═══════════════════════════════════════════════════════════
// 3. CSS (~50)
// ═══════════════════════════════════════════════════════════
const cssTopics = [
  ["Cascade", "Expliquez la cascade CSS.", "cascade CSS", "La cascade résout les conflits de styles selon origine, importance (!important), spécificité et ordre source.", ["origine", "spécificité", "ordre", "importance"], "Deux règles .btn : la dernière gagne à spécificité égale.", ".btn{color:blue}\n.btn{color:red} /* rouge */"],
  ["Spécificité", "Comment calcule-t-on la spécificité CSS ?", "spécificité", "On compare (inline, IDs, classes/attributs/pseudo-classes, éléments/pseudo-éléments) ; !important court-circuite avec prudence.", ["ID", "classe", "élément", "!important"], "#a .b button > span", "/* 1 ID + 1 classe + 2 éléments */"],
  ["Box model", "Qu’est-ce que le box model ?", "box model", "Chaque boîte a content, padding, border, margin ; box-sizing:border-box inclut padding+border dans width.", ["content", "padding", "border", "margin"], "border-box simplifie les layouts responsives.", "*{box-sizing:border-box}"],
  ["Flexbox", "Quand choisir Flexbox ?", "Flexbox", "Flexbox dispose des éléments sur un axe (row/column) avec alignement, distribution d’espace et wrapping.", ["flex", "justify-content", "align-items", "gap"], "Navbar, toolbars, centrage, listes horizontales.", ".row{display:flex;gap:1rem;align-items:center}"],
  ["Flexbox", "flex-grow, flex-shrink, flex-basis : rôles ?", "flex triptyque", "basis fixe la taille de base ; grow absorbe l’espace libre ; shrink compresse en cas de manque.", ["grow", "shrink", "basis"], "flex:1 1 0 pour colonnes égales.", ".col{flex:1 1 0}"],
  ["Grid", "Quand préférer CSS Grid à Flexbox ?", "CSS Grid", "Grid gère des layouts 2D (lignes+colonnes) ; Flex est 1D. Ils se complètent souvent.", ["grid-template", "areas", "fr", "minmax"], "Page : header/main/sidebar/footer en areas.", ".layout{display:grid;grid-template-columns:1fr 3fr}"],
  ["Grid", "Que signifie l’unité fr ?", "unité fr", "fr distribue l’espace libre restant du conteneur grid proportionnellement.", ["fr", "minmax", "auto"], "1fr 2fr : la 2e colonne prend le double.", "grid-template-columns: 200px 1fr 2fr;"],
  ["Variables", "À quoi servent les custom properties CSS ?", "variables CSS", "Les --var permettent theming, DRY et cascade dynamique, modifiables en JS.", ["--token", "var()", "theming"], "Tokens de design system (couleur, spacing).", ":root{--brand:#0a7}.btn{background:var(--brand)}"],
  ["Animations", "transition vs animation (@keyframes) ?", "transitions et animations", "transition interpole un changement d’état ; @keyframes définit des séquences multi-étapes autonomes.", ["transition", "keyframes", "easing"], "Hover bouton : transition ; loader : animation infinie.", ".btn{transition:transform .2s ease}"],
  ["Animations", "Quelles propriétés animer pour la performance ?", "animations performantes", "Préférer transform et opacity (compositor) ; éviter width/top/left qui déclenchent layout.", ["transform", "opacity", "compositor"], "translateY plutôt que top.", ".toast{transform:translateY(0)}"],
  ["Responsive", "Expliquez mobile-first avec media queries.", "mobile-first CSS", "Styles de base = mobile ; on enrichit avec min-width pour tablettes/desktop.", ["min-width", "breakpoints", "fluid"], "Base 1 colonne ; dès 768px, 2 colonnes.", "@media(min-width:768px){.grid{grid-template-columns:1fr 1fr}}"],
  ["Responsive", "Que sont les unités relatives (rem, em, %, vw) ?", "unités CSS", "rem lié à la racine, em au parent, % au contenant, vw/vh au viewport — essentiels au responsive et a11y zoom.", ["rem", "em", "vw", "clamp"], "font-size:clamp(1rem,2vw,1.25rem)", ""],
  ["Dark Mode", "Comment implémenter un dark mode en CSS ?", "dark mode", "prefers-color-scheme et/ou classe .dark avec variables de thème basculées.", ["prefers-color-scheme", "tokens", "contrast"], "Tokens --bg/--fg changent selon le thème.", "@media(prefers-color-scheme:dark){:root{--bg:#111;--fg:#eee}}"],
  ["Architecture", "Qu’est-ce qu’une architecture CSS scalable ?", "architecture CSS", "Séparer fondations (tokens), layout, composants et utilitaires limite la spécificité et les conflits.", ["ITCSS", "layers", "tokens"], "Design tokens → composants → overrides rares.", ""],
  ["BEM", "Expliquez la convention BEM.", "BEM", "Block__Element--Modifier nomme les classes pour clarifier structure et éviter la spécificité profonde.", ["block", "element", "modifier"], "card__title--large", ".card__title--large{font-size:1.5rem}"],
  ["Accessibilité", "Quelles pratiques CSS pour l’accessibilité ?", "CSS accessible", "Contraste, focus visible, ne pas se fier à la couleur seule, respecter prefers-reduced-motion.", ["contrast", "focus", "reduced-motion"], "outline personnalisé visible au focus.", "@media(prefers-reduced-motion:reduce){*{animation:none!important}}"],
  ["Optimisation", "Comment réduire le CSS inutilisé ?", "CSS critique / purge", "Critical CSS, code-splitting, Purge/Tree-shake (Tailwind) et éviter les frameworks monolithiques non utilisés.", ["critical CSS", "purge", "coverage"], "Coverage DevTools pour détecter le dead CSS.", ""],
  ["Position", "static, relative, absolute, fixed, sticky ?", "positionnement CSS", "relative décale vs lui-même ; absolute vs ancêtre positionné ; fixed vs viewport ; sticky hybride scroll.", ["absolute", "fixed", "sticky"], "Header sticky au scroll.", "header{position:sticky;top:0}"],
  ["z-index", "Comment fonctionne le z-index ?", "stacking context", "z-index n’agit que dans un stacking context ; opacity/transform peuvent en créer de nouveaux.", ["stacking context", "z-index"], "Modal z-index élevé mais piégé dans un parent transform.", ""],
  ["Pseudo", "::before/::after et pseudo-classes utiles ?", "pseudo-éléments", "Pseudo-éléments décorent sans HTML ; :hover,:focus-visible,:nth-child ciblent des états/structures.", ["::before", ":focus-visible", ":is"], "Icône via ::before content.", ".icon::before{content:\"★\"}"],
  ["Selectors", "Que sont :is(), :where(), :has() ?", "sélecteurs modernes", ":is/:where groupent ; :where a spécificité 0 ; :has permet un parent conditionnel (puissant).", [":is", ":where", ":has"], "label:has(input:invalid){color:red}", ""],
  ["Cascade layers", "@layer en CSS : intérêt ?", "cascade layers", "@layer ordonne des couches (reset, framework, composants) pour contrôler la cascade sans !important.", ["@layer", "cascade"], "@layer reset,components,utilities;", "@layer components{.btn{padding:.5rem}}"],
  ["Container queries", "Container queries vs media queries ?", "container queries", "Les container queries adaptent un composant à la taille de son conteneur, pas du viewport.", ["@container", "cqw"], "Card dense en sidebar étroite.", ".card{container-type:inline-size}"],
  ["Typography", "Bonnes pratiques typographiques web ?", "typographie CSS", "Échelle modulaire, line-height, measure (ch), font-display, et contrastes lisibles.", ["line-height", "font-display", "clamp"], "p{max-width:65ch;line-height:1.6}", ""],
  ["Colors", "RGB, HSL, OKLCH : que choisir ?", "couleurs CSS modernes", "OKLCH offre une perception plus uniforme pour palettes accessibles ; HSL reste répandu.", ["oklch", "contrast", "gamut"], "--brand:oklch(60% 0.15 250)", ""],
  ["Display", "none, hidden, visually-hidden : différences a11y ?", "masquage accessible", "display:none retire du tree a11y ; visually-hidden cache visuellement mais reste lisible aux lecteurs d’écran.", ["sr-only", "aria-hidden", "display"], "Texte skip-link en sr-only.", ".sr-only{position:absolute;clip:rect(0,0,0,0)}"],
  ["Grid", "auto-fit vs auto-fill ?", "auto-fit auto-fill", "Les deux répètent des tracks ; auto-fit collapse les tracks vides pour étirer, auto-fill les conserve.", ["auto-fit", "minmax"], "Grille responsive de cards.", "grid-template-columns:repeat(auto-fit,minmax(240px,1fr))"],
  ["Flexbox", "Comment centrer parfaitement avec Flexbox ?", "centrage flex", "justify-content + align-items center sur un conteneur flex (ou grid place-items).", ["centering"], "Méthode robuste pour loaders/modales.", ".center{display:flex;justify-content:center;align-items:center}"],
  ["Specificity wars", "Comment éviter les guerres de spécificité ?", "spécificité maîtrisée", "Classes plates, BEM, layers, éviter IDs et !important sauf utilitaires/overrides justifiés.", ["BEM", "layers"], "Préférer .card--active à #card.active.", ""],
  ["Print", "Comment styler une version print ?", "CSS print", "@media print masque navigation, ajuste couleurs, et gère page-break pour documents lisibles.", ["print", "page-break"], "@media print{nav{display:none}}", ""],
  ["Shadow DOM", "Le CSS traverse-t-il le Shadow DOM ?", "encapsulation CSS", "Le Shadow DOM encapsule les styles ; ::part et CSS variables permettent une API de theming contrôlée.", ["shadow DOM", "::part"], "Design system web components.", ""],
  ["Performance", "Qu’est-ce que le CLS lié au CSS ?", "CLS CSS", "Les images sans dimensions, polices tardives et contenus injectés déplacent le layout (CLS).", ["CLS", "font-display", "aspect-ratio"], "aspect-ratio et width/height réservent l’espace.", "img{aspect-ratio:16/9;width:100%}"],
  ["Preprocessors", "Sass/Less : encore utiles avec CSS moderne ?", "préprocesseurs CSS", "Toujours utiles pour partials et logique, mais nesting natif, variables et cascade layers réduisent le besoin.", ["Sass", "modules", "nesting"], "Migrer progressivement vers CSS natif.", ""],
  ["Tailwind", "Avantages et limites de Tailwind CSS ?", "utility-first CSS", "Rapidité et consistance via utilitaires ; risque de markup verbeux et de design sans tokens pensés.", ["utilities", "design tokens", "purge"], "Composer des composants réutilisables au-dessus des utilitaires.", ""],
  ["Grid", "subgrid : à quoi ça sert ?", "subgrid", "subgrid aligne les enfants sur la grille du parent, résolvant l’alignement multi-cards.", ["subgrid", "alignment"], "Titres de cards alignés entre colonnes.", ".child{grid-template-rows:subgrid}"],
  ["Logical props", "Pourquoi préférer margin-inline aux margin-left ?", "propriétés logiques", "Les propriétés logiques respectent le sens d’écriture (RTL/LTR) pour l’i18n.", ["inline", "block", "RTL"], "margin-inline-start au lieu de margin-left.", ".item{margin-inline:1rem}"],
  ["Filter", "filter et backdrop-filter : usages UX ?", "filtres CSS", "filter agit sur l’élément ; backdrop-filter floute l’arrière-plan (glassmorphism) avec coût GPU.", ["blur", "backdrop-filter"], "Barre frosted glass.", ".bar{backdrop-filter:blur(8px)}"],
  ["Scroll", "scroll-snap et smooth scroll : bonnes pratiques ?", "scroll UX", "scroll-snap guide carrousels ; scroll-behavior:smooth avec prefers-reduced-motion respecté.", ["scroll-snap", "smooth"], "Carrousel d’images snappé.", ".row{scroll-snap-type:x mandatory}"],
  ["Aspect ratio", "À quoi sert aspect-ratio ?", "aspect-ratio", "Réserve le ratio d’une boîte pour éviter CLS images/vidéos sans hacks padding.", ["aspect-ratio", "CLS"], "Vidéo 16/9 responsive.", ".video{aspect-ratio:16/9}"],
  ["Object-fit", "object-fit cover vs contain ?", "object-fit", "cover remplit en rognant ; contain montre tout en letterbox.", ["cover", "contain"], "Avatars : cover ; logos : contain.", "img.avatar{object-fit:cover;width:48px;height:48px}"],
  ["Calc", "calc(), min(), max(), clamp() : exemples utiles ?", "fonctions CSS", "Ces fonctions permettent des tailles fluides et bornées sans media queries excessives.", ["clamp", "min", "max"], "padding:clamp(1rem,3vw,2rem)", ""],
  ["Inheritance", "Quelles propriétés sont héritées ?", "héritage CSS", "Typographie (color, font, line-height) s’hérite ; box model non — inherit/initial/unset contrôlent.", ["inherit", "unset", "revert"], "button{font:inherit}", ""],
  ["Important", "Quand !important est-il acceptable ?", "usage !important", "Rarement : overrides d’utilitaires, accessibilité forcée, ou styles tiers incontrôlables — jamais comme premier réflexe.", ["!important", "layers"], "Utility .hidden{display:none!important}", ""],
  ["Modules", "CSS Modules : quel problème résolvent-ils ?", "CSS Modules", "Ils scopent localement les classes au build pour éviter collisions globales.", ["scope", "hash", "composes"], " coexiste avec design system tokens.", ""],
  ["Houdini", "Qu’est-ce que CSS Houdini (aperçu) ?", "CSS Houdini", "Houdini expose des APIs pour étendre le moteur CSS (properties, paint worklets) — encore partiel selon navigateurs.", ["paint API", "properties"], "Custom paint pour motifs.", ""],
  ["Reset", "Reset vs normalize vs CSS moderne ?", "reset CSS", "Les resets uniformisent les défauts navigateurs ; aujourd’hui on préfère un reset minimal + layers.", ["normalize", "reboot"], "Éviter *{margin:0} trop agressif sans réflexion.", ""],
  ["Specificity", "Inline styles vs classes : impact entretien ?", "styles inline", "L’inline a une spécificité élevée et mélange présentation/structure ; utile pour valeurs dynamiques ponctuelles.", ["inline", "spécificité"], "style={{width:pct}} en React pour barre de progression.", ""],
  ["Grid", "place-items et place-content ?", "alignement grid", "place-items aligne les items dans leurs cellules ; place-content aligne la grille dans le conteneur.", ["place-items", "align-content"], "place-items:center pour centrage grid.", ".box{display:grid;place-items:center}"],
  ["Debugging", "Comment déboguer un layout CSS cassé ?", "debug CSS", "DevTools : inspect box model, overlay flex/grid, désactiver règles, comparer computed vs authored.", ["DevTools", "computed"], "Activer Grid overlay pour voir les tracks.", ""],
  ["Architecture", "Qu’est-ce que le CSS « shotgun » à éviter ?", "CSS spaghetti", "Sélecteurs profonds, !important, IDs, et styles globaux non documentés rendent le CSS imprévisible.", ["dette", "spécificité"], "Refactor vers BEM/tokens par composant.", ""],
];

const cssSeeds = mapTopics(cssTopics, {
  prefix: "css",
  categorie: "CSS",
  ressources: R("mdnCss", "csstricks", "webdev", "caniuse", "grafikart"),
  technologies: ["CSS3", "HTML", "Responsive", "Accessibilité"],
  liens: ["HTML", "Responsive", "Accessibilité", "Performance"],
  competences: ["Intégration CSS", "Responsive design", "Accessibilité visuelle"],
});

// ═══════════════════════════════════════════════════════════
// 4. JavaScript (~80)
// ═══════════════════════════════════════════════════════════
const jsTopics = [
  ["Variables", "Différence entre var, let et const ?", "var let const", "var est function-scoped et hoisté ; let/const sont block-scoped ; const empêche la réaffectation de la binding.", ["scope", "hoisting", "const"], "Préférer const par défaut, let si réaffectation.", "const n=1; let i=0;"],
  ["Variables", "Qu’est-ce que le temporal dead zone ?", "TDZ", "Zone où let/const existent mais ne sont pas accessibles avant initialisation.", ["TDZ", "let", "ReferenceError"], "Accéder à let avant sa ligne → erreur.", ""],
  ["Types", "Types primitifs vs objets en JS ?", "types JavaScript", "Primitifs : string, number, bigint, boolean, undefined, symbol, null ; le reste est objet (référence).", ["primitif", "référence", "typeof"], "typeof null === 'object' (héritage historique).", ""],
  ["Types", "== vs === ?", "égalité JS", "=== compare sans coercion ; == convertit les types — source de bugs, éviter sauf cas documentés.", ["strict equality", "coercion"], "0 == false mais 0 !== false.", ""],
  ["Fonctions", "Function declaration vs expression vs arrow ?", "formes de fonctions", "Les declarations sont hoistées ; les arrows n’ont pas leur own this/arguments et sont concises.", ["hoisting", "this", "arrow"], "Callbacks : arrows ; méthodes d’objet : souvent function.", "const add=(a,b)=>a+b;"],
  ["Fonctions", "Qu’est-ce qu’une fonction pure ?", "fonction pure", "Même entrée → même sortie, sans effet de bord ; facilite tests et raisonnement.", ["pureté", "side effects"], "sum(1,2) pure ; compteur global non.", "const sum=(a,b)=>a+b;"],
  ["Fonctions", "Rest et spread : usages ?", "rest spread", "Spread étend itérables ; rest agrège des paramètres/éléments restants.", ["...", "rest", "spread"], "const [a,...rest]=arr; fn(...args)", ""],
  ["Objets", "Comment copier un objet correctement ?", "copie objets", "Spread/Object.assign = shallow ; structuredClone ou librairies pour deep copy.", ["shallow", "deep", "structuredClone"], "const b={...a}; attention objets imbriqués.", "const copy=structuredClone(obj);"],
  ["Objets", "destructuring d’objets et tableaux ?", "destructuring", "Extrait des propriétés/éléments vers des variables, avec valeurs par défaut et renommage.", ["destructuring", "default"], "const {id,name:label}=user;", ""],
  ["Objets", "Object.keys, values, entries ?", "parcours objets", "Ces helpers listent clés/valeurs/paires ; pour prototypes complexes, attention à l’enumerabilité.", ["keys", "entries"], "Object.entries(obj).map(([k,v])=>...)", ""],
  ["Tableaux", "map, filter, reduce : différences ?", "méthodes tableaux", "map transforme, filter sélectionne, reduce agrège en une valeur — sans muter l’original si bien utilisés.", ["map", "filter", "reduce"], "total = nums.reduce((a,n)=>a+n,0)", ""],
  ["Tableaux", "find vs filter vs some vs every ?", "recherche tableaux", "find retourne le 1er élément ; filter une liste ; some/every des booléens de existence/universalité.", ["find", "some"], "users.some(u=>u.active)", ""],
  ["Tableaux", "Mutation : push vs concat / spread ?", "immutabilité tableaux", "push mute ; concat/spread créent un nouveau tableau, préférable en React/state.", ["immutabilité", "mutation"], "setItems([...items,x])", ""],
  ["DOM", "querySelector vs getElementById ?", "sélection DOM", "getElementById est direct ; querySelector accepte tout sélecteur CSS et retourne le premier match.", ["DOM", "sélecteurs"], "document.querySelector('.card')", ""],
  ["DOM", "innerHTML vs textContent vs createElement ?", "injection DOM", "textContent sûr pour texte ; innerHTML parse HTML (risque XSS) ; createElement+append est contrôlé.", ["XSS", "textContent"], "el.textContent=userInput", ""],
  ["DOM", "Event bubbling et capturing ?", "propagation events", "La phase capture descend, bubble remonte ; stopPropagation et delegation s’appuient sur ce modèle.", ["bubble", "capture", "delegation"], "Écouter sur parent pour listes dynamiques.", "ul.addEventListener('click',e=>{...})"],
  ["Events", "preventDefault vs stopPropagation ?", "contrôle events", "preventDefault annule le comportement natif ; stopPropagation stoppe la propagation vers d’autres handlers.", ["preventDefault", "propagation"], "submit form : preventDefault puis fetch.", "form.addEventListener('submit',e=>e.preventDefault())"],
  ["Events", "Qu’est-ce que la délégation d’événements ?", "event delegation", "Un listener sur ancêtre gère les événements des enfants via event.target — performant pour listes dynamiques.", ["delegation", "target"], "Todo list : un click sur ul.", ""],
  ["Modules", "CommonJS vs ES modules ?", "modules JS", "CJS (require/module.exports) synchrone Node historique ; ESM (import/export) standard navigateur/Node moderne.", ["import", "export", "require"], "export function add(){}; import {add} from './m.js'", ""],
  ["Modules", "import dynamique : quand l’utiliser ?", "import()", "import() charge un module à la demande (code splitting) et retourne une Promise.", ["dynamic import", "lazy"], "const mod=await import('./heavy.js')", ""],
  ["Promises", "Qu’est-ce qu’une Promise ?", "Promise", "Objet représentant une valeur future : pending, fulfilled, rejected — base de l’async moderne.", ["pending", "then", "catch"], "fetch().then(r=>r.json())", ""],
  ["Promises", "Promise.all vs allSettled vs race vs any ?", "combinateurs Promise", "all échoue vite ; allSettled attend tout ; race premier terminé ; any premier succès.", ["all", "race", "allSettled"], "Charger multi-ressources avec all.", "await Promise.all([a,b])"],
  ["Fetch", "Comment fonctionne fetch et gérer les erreurs HTTP ?", "Fetch API", "fetch ne reject que sur erreur réseau ; il faut tester response.ok et parser selon content-type.", ["ok", "status", "json"], "if(!res.ok) throw new Error(res.status)", "const res=await fetch('/api'); if(!res.ok) throw new Error('HTTP');"],
  ["Fetch", "AbortController : à quoi ça sert ?", "AbortController", "Permet d’annuler un fetch (navigation, debounce) via signal pour éviter courses et fuites.", ["abort", "signal"], "Annuler recherche précédente.", "const c=new AbortController(); fetch(url,{signal:c.signal}); c.abort();"],
  ["Async Await", "async/await vs then/catch ?", "async await", "async/await sucre syntaxique sur Promises, lisible en séquence ; try/catch pour les erreurs.", ["async", "await", "try/catch"], "const data=await getData()", "async function load(){try{...}catch(e){...}}"],
  ["Async Await", "Comment paralléliser avec async/await ?", "parallélisme async", "Lancer les promesses avant d’await (ou Promise.all) évite la sérialisation inutile.", ["Promise.all", "waterfall"], "const [a,b]=await Promise.all([fa(),fb()])", ""],
  ["Classes", "Classes ES6 : sucre sur prototypes ?", "classes JS", "class offre une syntaxe claire sur le modèle prototypal ; extends et super gèrent l’héritage.", ["class", "extends", "prototype"], "class User extends Person {}", ""],
  ["Classes", "Champs privés (#) : intérêt ?", "encapsulation JS", "Les champs #privés renforcent l’encapsulation native hors conventions _privées.", ["#private", "encapsulation"], "class C{#secret=1}", ""],
  ["Closures", "Qu’est-ce qu’une closure ?", "closure", "Fonction qui capture les variables de sa portée lexicale externe, même exécutée ailleurs.", ["portée lexicale", "capture"], "Compteur factory ; hooks React s’en servent.", "function makeCounter(){let n=0;return()=>++n}"],
  ["Closures", "Closures et boucles : piège classique var ?", "closure boucle", "var partagé dans la boucle ; let par itération ou IIFE/factory pour capturer l’index.", ["var", "let"], "for(let i=0;i<3;i++) handlers push(()=>i)", ""],
  ["Prototype", "Expliquez la chaîne de prototypes.", "prototype chain", "La résolution de propriétés remonte [[Prototype]] jusqu’à Object.prototype puis null.", ["__proto__", "Object.create"], "obj → Proto → Object.prototype", ""],
  ["Prototype", "Object.create(null) : quand l’utiliser ?", "dictionnaire pur", "Crée un objet sans prototype — utile pour maps de clés arbitraires sans pollution.", ["null prototype", "map"], "const dict=Object.create(null)", ""],
  ["this", "Comment this est-il déterminé ?", "mot-clé this", "this dépend de l’appel : méthode, call/apply/bind, new, arrow (lexique), mode strict.", ["bind", "arrow", "call"], "const f=obj.method; f() perd this", ""],
  ["this", "bind, call, apply : différences ?", "bind call apply", "call/apply invoquent avec this (+ args) ; bind retourne une fonction liée.", ["bind", "call", "apply"], "btn.addEventListener('click', handler.bind(obj))", ""],
  ["Mémoire", "Que sont les fuites mémoire courantes en JS ?", "memory leaks", "Listeners non retirés, timers, closures capturant gros objets, caches non bornés, détachements DOM.", ["listeners", "timers", "GC"], "removeEventListener au cleanup.", ""],
  ["Mémoire", "WeakMap / WeakSet : intérêt ?", "weak references", "Clés objets faibles GC-ables — métadonnées sans empêcher la collecte.", ["WeakMap", "GC"], "cache privé par élément DOM.", "const wm=new WeakMap();"],
  ["Performance", "debounce vs throttle ?", "debounce throttle", "debounce attend la fin des appels ; throttle limite à 1 exécution / période — UX search vs scroll.", ["debounce", "throttle"], "Input search debounced 300ms.", ""],
  ["Performance", "requestAnimationFrame : usage ?", "rAF", "Synchronise animations/lectures layout avec le refresh écran pour fluidité.", ["rAF", "jank"], "Animer via rAF plutôt que setInterval.", "requestAnimationFrame(draw)"],
  ["Debug", "Outils de debug JS essentiels ?", "debugging JS", "breakpoints, debugger, stack traces, network, performance, console structurée (table, time).", ["DevTools", "breakpoint"], "Conditional breakpoint sur id===42.", ""],
  ["Debug", "source maps : pourquoi ?", "source maps", "Relient le code bundlé/minifié au source original pour un debug lisible.", ["source map", "bundle"], "Activer en dev, restreindre en prod.", ""],
  ["ES6+", "Destructuring + defaults + nullish ?", "ES moderne", "?? et ?. gèrent null/undefined sans casser sur 0/''; optional chaining évite les guards verbeux.", ["??", "?.", "default"], "user?.address?.city ?? 'N/A'", ""],
  ["ES6+", "Map vs Object pour dictionnaires ?", "Map", "Map accepte clés non-string, garde l’ordre d’insertion, taille via .size, meilleure pour collections dynamiques.", ["Map", "Object"], "const m=new Map([['a',1]])", ""],
  ["ES6+", "Set : cas d’usage ?", "Set", "Collection d’unicité — dédupliquer, membership O(1) amorti.", ["Set", "unicité"], "[...new Set(arr)]", ""],
  ["ES6+", "Symbol : à quoi ça sert ?", "Symbol", "Identifiants uniques pour propriétés meta, éviter collisions, itérateurs (Symbol.iterator).", ["Symbol", "iterator"], "const ID=Symbol('id')", ""],
  ["ES6+", "Generators et iterators ?", "generators", "function* produit des iterators lazy via yield — streams, pagination, async generators.", ["yield", "next"], "function* idGen(){let i=0;while(true)yield i++}", ""],
  ["ES6+", "Proxy et Reflect : aperçu ?", "Proxy", "Proxy intercepte get/set/apply pour validation, ORM légers, memoization — coût à mesurer.", ["Proxy", "trap"], "new Proxy(obj,{get(t,p){...}})", ""],
  ["Web APIs", "localStorage vs sessionStorage vs cookies ?", "stockage navigateur", "local/session : Web Storage (XSS risk, pas HTTP auto) ; cookies : envoyés au serveur, flags Secure/HttpOnly.", ["localStorage", "cookies", "HttpOnly"], "Token : préférer cookie HttpOnly si possible.", ""],
  ["Web APIs", "IntersectionObserver : usage ?", "IntersectionObserver", "Observe la visibilité d’éléments — lazy load, infinite scroll, analytics de vue.", ["lazyload", "viewport"], "Charger images when intersecting.", ""],
  ["Web APIs", "MutationObserver ?", "MutationObserver", "Observe mutations DOM (enfants, attributs) — utile libs, moins pour app logique métier.", ["DOM mutation"], "Détecter injection d’un widget tiers.", ""],
  ["Web APIs", "History API et SPA routing ?", "History API", "pushState/replaceState + popstate permettent routing client sans rechargement.", ["pushState", "SPA"], "Router maison ou React Router.", "history.pushState({},'', '/users')"],
  ["Web APIs", "Clipboard API et permissions ?", "Clipboard API", "navigator.clipboard écrit/lit avec permissions et contexte sécurisé (HTTPS).", ["clipboard", "permissions"], "await navigator.clipboard.writeText(t)", ""],
  ["Erreurs", "Error handling : Error types et rethrow ?", "gestion erreurs", "Typer les erreurs, ne pas avaler silencieusement, enrichir le contexte, distinguer opérationnel vs bug.", ["try/catch", "cause"], "throw new Error('X',{cause:e})", ""],
  ["JSON", "JSON.parse/stringify pièges ?", "JSON", "Pas de undefined/fonctions/Symbol ; dates → strings ; reviver/replacer personnalisent.", ["JSON", "replacer"], "JSON.stringify(obj,(k,v)=>v===undefined?null:v)", ""],
  ["Timers", "setTimeout 0 et event loop ?", "event loop", "JS est single-thread avec call stack, microtasks (promises) et macrotasks (timers, I/O).", ["event loop", "microtask"], "Promise.then avant setTimeout(0).", ""],
  ["Strict", "Mode strict : apports ?", "use strict", "Interdit certaines erreurs silencieuses (variables implicites, this global) — modules ESM sont stricts.", ["strict mode"], "'use strict';", ""],
  ["Intl", "API Intl : exemples ?", "Intl", "Formatage dates/nombres/listes localisés sans libs lourdes.", ["Intl.DateTimeFormat", "NumberFormat"], "new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(10)", ""],
  ["Regex", "Bonnes pratiques regex en JS ?", "expressions régulières", "Éviter backtracking catastrophique, documenter, préférer libs pour emails complexes, tester.", ["RegExp", "ReDoS"], "/^\\d{5}$/.test(cp)", ""],
  ["Dates", "Pièges Date et alternatives ?", "dates JS", "Date historique est mutable et timezone-sensible ; Temporal (progressif) ou libs (dayjs) selon besoin.", ["Date", "ISO", "timezone"], "Préférer ISO 8601 UTC en API.", ""],
  ["Numbers", "Précision flottante et Number.EPSILON ?", "nombres JS", "0.1+0.2≠0.3 ; BigInt pour entiers arbitraires ; attention aux IDs > MAX_SAFE_INTEGER.", ["float", "BigInt"], "Number.isInteger / BigInt('9007199254740993')", ""],
  ["Security", "XSS en JS front : comment prévenir ?", "XSS prevention", "Ne jamais injecter HTML non sanitisé ; textContent, CSP, escape, frameworks qui échappent par défaut.", ["XSS", "CSP", "sanitize"], "Éviter innerHTML avec données user.", ""],
  ["Testing", "Comment tester du JS pur efficacement ?", "tests unitaires JS", "Fonctions pures, AAA, mocks minimaux, couverture des bords — Jest/Vitest.", ["AAA", "mock"], "expect(sum(1,2)).toBe(3)", ""],
  ["Patterns", "Module pattern et IIFE historiques ?", "module pattern", "Avant ESM, IIFE créaient des scopes privés ; aujourd’hui modules natifs sont préférés.", ["IIFE", "encapsulation"], "(function(){const priv=1;})()", ""],
  ["Patterns", "Observer / pub-sub en JS ?", "observer pattern", "Émetteurs d’événements découplent producteurs/consommateurs (EventTarget, EventEmitter).", ["pub-sub", "EventEmitter"], "element.addEventListener / mitt", ""],
  ["Patterns", "Mémoization : quand l’appliquer ?", "mémoization", "Cache résultats de calculs coûteurs purs ; attention mémoire et invalidation.", ["cache", "pure"], "const memo=fn=>{(cache)...}", ""],
  ["Workers", "Web Workers : intérêt ?", "Web Workers", "Exécutent du JS hors thread UI pour calculs lourds ; communication via postMessage.", ["worker", "thread"], "new Worker('heavy.js')", ""],
  ["Streams", "Streams API navigateur ?", "Streams", "Lecture/écriture chunkée (fetch body.getReader) pour gros payloads et transformations.", ["ReadableStream"], "Pipeline de transformation vidéo/texte.", ""],
  ["FormData", "FormData et upload fichiers ?", "FormData", "Construit multipart/form-data pour envoi fichiers via fetch sans manipuler les boundaries à la main.", ["multipart", "File"], "fd.append('file', fileInput.files[0])", ""],
  ["URL", "URL et URLSearchParams ?", "URL API", "Parsing robuste d’URL et query strings plutôt que regex artisanales.", ["URLSearchParams"], "params.set('page','2')", ""],
  ["CustomEvents", "CustomEvent : quand s’en servir ?", "CustomEvent", "Communication découplée entre composants DOM vanilla.", ["dispatchEvent"], "el.dispatchEvent(new CustomEvent('cart:add',{detail}))", ""],
  ["Performance", "mesurer perf JS en entretien ?", "mesure performance", "performance.now, PerformanceObserver, Lighthouse, flamecharts CPU — mesurer avant d’optimiser.", ["performance.now", "Lighthouse"], "const t0=performance.now()", ""],
  ["Immutability", "Pourquoi l’immutabilité aide en JS ?", "immutabilité", "Prévisibilité, time-travel/debug, React reconciliation ; coût de copies à maîtriser.", ["immutable", "spread"], "return {...state,count:state.count+1}", ""],
  ["Currying", "Currying et partial application ?", "currying", "Transformer f(a,b) en f(a)(b) pour composition et configuration différée.", ["curry", "compose"], "const add=a=>b=>a+b", ""],
  ["Functional", "map/filter chaînés vs boucle : trade-offs ?", "style fonctionnel", "Chaînes lisibles mais allocations intermédiaires ; boucles parfois plus perf pour hot paths.", ["allocation", "lisibilité"], "Mesurer avant de micro-optimiser.", ""],
  ["Optional", "Quand éviter l’optional chaining excessif ?", "optional chaining abus", "?. masque des invariants cassés ; parfois mieux fail-fast si la donnée doit exister.", ["fail-fast", "?."], "Valider le contrat API en amont.", ""],
  ["Nullish", "|| vs ?? pour valeurs par défaut ?", "nullish coalescing", "|| traite 0 et '' comme falsy ; ?? ne remplace que null/undefined.", ["??", "||"], "volume = input ?? 0.8", ""],
  ["StructuredClone", "structuredClone vs JSON copy ?", "structuredClone", "Clone de types plus riches (Date, Map, ArrayBuffer) sans passer par JSON.", ["clone", "Date"], "const c=structuredClone(value)", ""],
  ["Top level await", "Top-level await en modules ?", "top-level await", "Permet await à la racine d’un module ESM — attention ordre de chargement et waterfall.", ["ESM", "await"], "const cfg=await loadConfig()", ""],
  ["Import maps", "Import maps : problème résolu ?", "import maps", "Mappent des spécifiers nus vers des URL sans bundler — utile en proto natives.", ["importmap"], "<script type=\"importmap\">...", ""],
  ["Quality", "ESLint / Prettier : rôle en équipe ?", "qualité JS", "ESLint règle bugs/styles ; Prettier formate — réduisent le bruit en review.", ["ESLint", "Prettier"], "CI bloque si lint fail.", ""],
  ["Bundlers", "Pourquoi un bundler (Vite/webpack) ?", "bundlers", "Modules, transpile, assets, code splitting, env — Vite privilégie la vitesse en dev (ESM natif).", ["Vite", "code splitting"], "import.meta.env.VITE_API_URL", ""],
];

const jsSeeds = mapTopics(jsTopics, {
  prefix: "js",
  categorie: "JavaScript",
  ressources: R("mdnJs", "ecma", "webdev", "devdocs", "grafikart"),
  technologies: ["JavaScript", "DOM", "ES6+", "Web APIs"],
  liens: ["TypeScript", "React", "Performance", "Sécurité"],
  competences: ["JavaScript moderne", "DOM", "Asynchrone"],
});

// ═══════════════════════════════════════════════════════════
// 5. TypeScript (~30)
// ═══════════════════════════════════════════════════════════
const tsTopics = [
  ["Bases", "Pourquoi TypeScript plutôt que JavaScript seul ?", "TypeScript", "TS ajoute un système de types statiques qui détecte des erreurs à la compilation et documente les contrats.", ["types", "compile-time", "DX"], "typo de propriété attrapée avant runtime.", "const n: number = 1;"],
  ["Types", "type vs interface ?", "type vs interface", "interface est extensible (declaration merging) ; type est plus flexible (unions, mapped). Les deux coexistent.", ["interface", "type", "union"], "Props React souvent en interface.", "interface User{id:string}"],
  ["Types", "Union et intersection ?", "unions intersections", "A|B une des formes ; A&B combine ; narrowing via typeof/in/discrimants.", ["union", "intersection", "narrowing"], "type Result=Ok|Err", ""],
  ["Types", "any vs unknown vs never ?", "any unknown never", "any désactive le typage ; unknown force le narrowing ; never = impossibilité.", ["any", "unknown", "never"], "Préférer unknown pour inputs externes.", "function assert(x:never){}"],
  ["Generics", "À quoi servent les génériques ?", "génériques TS", "Paramètres de type réutilisables préservant l’information (identité, containers).", ["generics", "<T>"], "function identity<T>(x:T):T{return x}", ""],
  ["Generics", "contraintes extends sur génériques ?", "contraintes génériques", "extends borne T pour accéder à des propriétés en sécurité.", ["extends", "keyof"], "function prop<T,K extends keyof T>(o:T,k:K):T[K]", ""],
  ["Narrowing", "Qu’est-ce que le type narrowing ?", "narrowing", "Affinage du type dans une branche via contrôles (typeof, equality, predicates).", ["typeof", "predicate"], "if(typeof x==='string') x.toUpperCase()", ""],
  ["Narrowing", "Type predicates et asserts ?", "type predicates", "user is Admin et asserts x is string documentent des gardes pour le checker.", ["is", "asserts"], "function isStr(x:unknown):x is string{return typeof x==='string'}", ""],
  ["Utility", "Partial, Required, Pick, Omit ?", "utility types", "Helpers pour dériver des types sans duplication.", ["Partial", "Pick", "Omit"], "type UserUpdate=Partial<User>", ""],
  ["Utility", "Record et Readonly ?", "Record Readonly", "Record<K,V> mappe des clés ; Readonly rend immuable au type-level.", ["Record", "Readonly"], "const roles:Record<string,boolean>={}", ""],
  ["Enums", "Enums TS : avantages et alternatives ?", "enums", "Enums nomment des ensembles ; souvent union de littéraux + as const plus tree-shakeable.", ["enum", "as const"], "type Status='on'|'off'", ""],
  ["Config", "strict mode TypeScript : options clés ?", "strict TS", "strict active strictNullChecks, noImplicitAny, etc. — base qualité pro.", ["strictNullChecks", "noImplicitAny"], "\"strict\": true dans tsconfig.", ""],
  ["Config", "module, moduleResolution, bundler ?", "tsconfig modules", "Aligner module/resolution sur NodeNext ou bundler selon runtime/outil.", ["NodeNext", "bundler"], "Vite : moduleResolution bundler.", ""],
  ["DOM", "Typer le DOM et les events ?", "DOM types", "HTMLElement, Event, generics sur addEventListener ; cast prudents après querySelector.", ["HTMLElement", "Event"], "const el=document.querySelector<HTMLInputElement>('#q')", ""],
  ["Async", "Typer fetch / JSON ?", "typage API", "Valider runtime (zod) + typer la sortie ; ne pas faire confiance au cast seul.", ["zod", "unknown"], "const data=schema.parse(await res.json())", ""],
  ["Classes", "visibility public/private/protected ?", "visibilité TS", "Modificateurs d’accès compile-time (private runtime via # aussi).", ["private", "protected"], "class A{private secret=1}", ""],
  ["Classes", "abstract class vs interface ?", "abstract class", "abstract peut fournir impl partielle ; interface décrit un contrat sans runtime.", ["abstract", "interface"], "Choisir interface si pas d’impl partagée.", ""],
  ["Advanced", "Mapped types : principe ?", "mapped types", "Transforme chaque propriété d’un type (ex. Readonly, getters).", ["mapped", "keyof"], "type Opt<T>={[K in keyof T]?:T[K]}", ""],
  ["Advanced", "Conditional types ?", "conditional types", "T extends U ? X : Y permet logique de types (ReturnType-like).", ["extends", "infer"], "type Elem<T>=T extends (infer E)[]?E:T", ""],
  ["Advanced", "infer keyword ?", "infer", "Extrait un type dans une branche conditionnelle.", ["infer"], "type Awaited<T>=T extends Promise<infer U>?U:T", ""],
  ["Declaration", "Fichiers .d.ts et ambient types ?", "declaration files", "Déclarent types pour JS tiers ; @types/*, declare module.", ["DefinitelyTyped", ".d.ts"], "declare module 'legacy-lib';", ""],
  ["Interop", "esm/cjs interop en TS ?", "interop modules", "esModuleInterop, Node16/NodeNext gèrent default import CJS.", ["esModuleInterop"], "import express from 'express'", ""],
  ["React", "Typer props et children React ?", "React TS", "Props interfaces, React.FC optionnel, children: React.ReactNode.", ["Props", "ReactNode"], "type BtnProps={label:string;onClick:()=>void}", ""],
  ["React", "useState / useRef typés ?", "hooks typés", "useState<T>, useRef<T|null>(null) pour éviter implicit any.", ["useState", "useRef"], "const [n,setN]=useState(0)", ""],
  ["Zod", "Validation runtime + TS ?", "zod", "Schémas zod infèrent des types TS et valident les entrées API/forms.", ["zod", "parse"], "const User=z.object({id:z.string()})", ""],
  ["Perf", "Coût des types complexes ?", "perf compilateur", "Types excessivement récursifs ralentissent tsc ; simplifier et project references.", ["tsc", "references"], "Éviter unions géantes générées.", ""],
  ["Migration", "Stratégie de migration JS → TS ?", "migration TS", "allowJs, checkJs, strict progressif, typer frontières (API) d’abord.", ["allowJs", "incremental"], "Renommer .js→.ts fichier par fichier.", ""],
  ["Errors", "Résultat Result/Either en TS ?", "Result type", "Modéliser succès/échec sans exceptions pour flux contrôlés.", ["Result", "discriminated union"], "type Result<T,E>={ok:true;value:T}|{ok:false;error:E}", ""],
  ["Satisfies", "opérateur satisfies ?", "satisfies", "Vérifie qu’une valeur respecte un type sans élargir trop l’inférence.", ["satisfies"], "const cfg={url:'/'} as const satisfies Config", ""],
  ["Template", "Template literal types ?", "template literal types", "Construisent des strings typées (routes, events).", ["template literal"], "type Ev=`on${Capitalize<string>}`", ""],
];

const tsSeeds = mapTopics(tsTopics, {
  prefix: "ts",
  categorie: "TypeScript",
  ressources: R("ts", "mdnJs", "devdocs", "react"),
  technologies: ["TypeScript", "JavaScript", "Node.js"],
  liens: ["JavaScript", "React", "Node.js", "Tests"],
  competences: ["Typage statique", "TypeScript", "Qualité de code"],
});

// ═══════════════════════════════════════════════════════════
// 6. React (~45)
// ═══════════════════════════════════════════════════════════
const reactTopics = [
  ["Bases", "Qu’est-ce que React et le Virtual DOM ?", "Virtual DOM", "React décrit l’UI en fonctions/composants ; le Virtual DOM/reconciler calcule un diff minimal vers le DOM réel.", ["Virtual DOM", "reconciliation"], "setState → re-render → commit DOM.", ""],
  ["Bases", "Composant fonctionnel vs classe ?", "composants React", "Les fonctions + hooks sont le standard actuel ; classes legacy pour code existant.", ["hooks", "function components"], "function App(){return <h1>Hi</h1>}", ""],
  ["JSX", "JSX : compilation et règles ?", "JSX", "JSX transpile vers appels (jsx runtime) ; un parent unique, className, expression {}.", ["JSX", "Babel"], "return (<><Header/><Main/></>)", ""],
  ["Props", "Props : immutabilité et one-way data flow ?", "props React", "Les props descendent parent→enfant ; l’enfant ne les mute pas, il notifie via callbacks.", ["props", "unidirectionnel"], "<User name={n} onSave={save}/>", ""],
  ["State", "useState : principes et pièges ?", "useState", "State local déclenche re-render ; updater fonctionnel si basé sur prev ; ne pas muter.", ["useState", "updater"], "setCount(c=>c+1)", ""],
  ["State", "State lifté : quand remonter le state ?", "lifting state", "Si plusieurs enfants partagent une donnée, le state vit dans le plus proche ancêtre commun.", ["lifting"], "Input contrôlé géré par le parent formulaire.", ""],
  ["Effects", "useEffect : dépendances et cleanup ?", "useEffect", "Synchronise React avec un système externe ; deps contrôlent l’exécution ; cleanup annule abonnements.", ["deps", "cleanup"], "useEffect(()=>{const id=setInterval(...);return()=>clearInterval(id)},[])", ""],
  ["Effects", "useEffect vs useLayoutEffect ?", "useLayoutEffect", "useLayoutEffect s’exécute avant paint — mesures DOM ; attention perf SSR.", ["layout", "paint"], "Mesurer hauteur avant affichage.", ""],
  ["Hooks", "Règles des hooks ?", "règles des hooks", "Appels au top-level seulement, toujours dans le même ordre — pas dans conditions/boucles.", ["rules of hooks"], "ESLint plugin react-hooks.", ""],
  ["Hooks", "useRef : DOM et valeurs mutables ?", "useRef", "Garantit une ref stable sans re-render ; accède au nœud DOM ou stocke un mutable.", ["ref", "current"], "const inputRef=useRef(null)", ""],
  ["Hooks", "useMemo / useCallback : quand vraiment ?", "mémoization React", "Optimisations ciblées pour calculs lourds ou identité de callbacks vers enfants mémoïsés — pas partout.", ["useMemo", "useCallback"], "Éviter micro-optimisations prématurées.", ""],
  ["Hooks", "useContext : usage et limites ?", "useContext", "Partage de données globales (thème, auth) sans prop drilling ; re-renders larges si valeur change souvent.", ["Context", "provider"], "Séparer contexts fréquents/peu fréquents.", ""],
  ["Hooks", "useReducer : quand préférer à useState ?", "useReducer", "State complexe multi-transitions, logique centralisée type reducer — proche Redux local.", ["reducer", "action"], "dispatch({type:'increment'})", ""],
  ["Hooks", "Custom hooks : intérêt ?", "custom hooks", "Factorisent logique à état/effets réutilisable (useFetch, useMediaQuery).", ["reutilisation"], "function useToggle(init=false){...}", ""],
  ["Forms", "Contrôlé vs non contrôlé ?", "formulaires React", "Contrôlé : value+onChange ; non contrôlé : refs — contrôlé pour validation live.", ["controlled"], "<input value={v} onChange={e=>setV(e.target.value)}/>", ""],
  ["Lists", "Pourquoi la prop key ?", "keys React", "key identifie l’identité entre renders pour un diff correct — index fragile si réordonnancement.", ["key", "reconciliation"], "key={item.id}", ""],
  ["Perf", "React.memo : principe ?", "React.memo", "Mémoïse un composant si props shallow-equal — utile enfants purs coûteux.", ["memo", "shallow compare"], "export default memo(ListItem)", ""],
  ["Perf", "Éviter re-renders inutiles ?", "re-renders", "Découper state, memo sélective, contexts stables, virtualisation listes longues.", ["virtualization", "state colocation"], "react-window pour 10k rows.", ""],
  ["Routing", "React Router : concepts clés ?", "React Router", "Routes déclaratives, nested layouts, loaders (data APIs), navigation client-side.", ["Route", "Link", "Outlet"], "<Route path='/users/:id' element={<User/>}/>", ""],
  ["Data", "Fetching : useEffect vs libs (React Query) ?", "data fetching React", "React Query/SWR gèrent cache, retry, stale ; useEffect fetch manuel vite verbeux/bugué.", ["React Query", "cache"], "useQuery({queryKey:['todos'],queryFn})", ""],
  ["Suspense", "Suspense et lazy : code splitting ?", "Suspense lazy", "React.lazy charge un composant async ; Suspense affiche un fallback.", ["lazy", "code splitting"], "const Page=lazy(()=>import('./Page'))", ""],
  ["Error", "Error Boundaries : rôle ?", "Error Boundaries", "Attrapent erreurs de rendu enfants pour UI de secours — pas les erreurs async hors render.", ["componentDidCatch"], "class Boundary extends React.Component", ""],
  ["Patterns", "Composition vs héritage ?", "composition React", "Préférer composition (children, slots) à l’héritage de composants.", ["children", "slots"], "<Card><Header/><Body/></Card>", ""],
  ["Patterns", "Render props et HOCs vs hooks ?", "patterns historiques", "HOC/render props partagent de la logique ; hooks les remplacent dans la majorité des cas modernes.", ["HOC", "hooks"], "withAuth → useAuth", ""],
  ["State mgmt", "Redux vs Context vs Zustand ?", "state management", "Local state d’abord ; Context pour thème/auth ; stores (Zustand/Redux) pour état app complexe.", ["Redux", "Zustand"], "Éviter Redux pour un simple formulaire.", ""],
  ["Redux", "Principes Redux (actions, reducer, store) ?", "Redux", "State unique immuable, updates via actions pures réduites — prévisibilité et DevTools.", ["action", "reducer"], "dispatch({type:'todos/add',payload})", ""],
  ["Next", "CSR vs SSR vs SSG (Next.js) ?", "CSR SSR SSG", "CSR au navigateur ; SSR HTML à la requête ; SSG au build — SEO et perf selon cas.", ["SSR", "SSG", "hydratation"], "Blog : SSG ; dashboard privé : CSR.", ""],
  ["Next", "App Router et Server Components ?", "RSC", "Server Components rendent côté serveur sans JS client ; Client Components pour interactivité.", ["RSC", "use client"], "fetch direct en Server Component.", ""],
  ["Tests", "Testing Library philosophie ?", "Testing Library", "Tester comme un utilisateur (roles, texte) plutôt que l’implémentation interne.", ["getByRole", "userEvent"], "await user.click(screen.getByRole('button',{name:'OK'}))", ""],
  ["A11y", "Accessibilité en React ?", "a11y React", "HTML sémantique, labels, focus management modales, eslint-plugin-jsx-a11y.", ["aria", "focus trap"], "dialog avec focus initial sur le titre.", ""],
  ["Portals", "ReactDOM.createPortal : usage ?", "portals", "Rendent hors hiérarchie DOM parent — modales/tooltips sans overflow cassé.", ["portal"], "createPortal(modal, document.body)", ""],
  ["Fragments", "Fragments : intérêt ?", "Fragments", "Groupent sans nœud DOM extra ; key possible sur Fragment court-syntax limité.", ["Fragment"], "<><Item/><Item/></>", ""],
  ["StrictMode", "React Strict Mode en dev ?", "Strict Mode", "Double-invoke effets en dev pour détecter effets non idempotents — pas en prod.", ["StrictMode"], "<StrictMode><App/></StrictMode>", ""],
  ["Concurrent", "startTransition / useDeferredValue ?", "concurrent React", "Marquent des updates non urgentes pour garder l’UI responsive.", ["startTransition", "useDeferredValue"], "startTransition(()=>setSearch(q))", ""],
  ["Events", "Synthetic events React ?", "SyntheticEvent", "Wrapper cross-browser ; pooling historique retiré ; handler camelCase.", ["onClick", "onChange"], "<button onClick={handle}>", ""],
  ["Controlled", "Checkbox/radio contrôlés ?", "inputs contrôlés", "checked + onChange ; name pour groupes radio.", ["checked"], "<input type='checkbox' checked={on} onChange={...}/>", ""],
  ["Children", "React.Children et cloneElement : prudence ?", "children utils", "Manipuler children est fragile ; préférer composition explicite/slots.", ["cloneElement"], "API claire > magie children.", ""],
  ["Design", "Design system en React ?", "design system React", "Composants documentés, tokens, accessibilité, Storybook, versioning semver.", ["Storybook", "tokens"], "Button variants primary/secondary.", ""],
  ["Security", "XSS et dangerouslySetInnerHTML ?", "XSS React", "React échappe le texte ; dangerouslySetInnerHTML exige sanitization (DOMPurify).", ["DOMPurify"], "Éviter sauf HTML de confiance sanitizé.", ""],
  ["Perf", "Profiler React : usage ?", "React Profiler", "Mesure commits coûteux pour cibler memo/découpage.", ["Profiler"], "DevTools Profiler flamegraph.", ""],
  ["Hooks", "useId : à quoi ça sert ?", "useId", "Génère des IDs stables SSR/CSR pour a11y (label/input).", ["useId", "SSR"], "const id=useId()", ""],
  ["Hooks", "useImperativeHandle ?", "useImperativeHandle", "Personnalise la valeur exposée via ref à un parent — usage rare/API impérative.", ["ref"], "focus() exposé par un input custom.", ""],
  ["Architecture", "Feature folders vs type folders ?", "structure projet React", "Organiser par feature (auth/, catalog/) scale mieux que components/hooks globaux.", ["feature-based"], "features/cart/{ui,api,model}", ""],
  ["SSR", "Hydration mismatch : causes ?", "hydration", "HTML serveur ≠ premier render client (Date, random, locale) → warnings/bugs.", ["hydratation", "suppressHydrationWarning"], "Rendre dates après mount.", ""],
  ["Query", "Mutations et invalidation de cache ?", "mutations cache", "Après POST/PUT, invalider query keys pour resynchroniser l’UI.", ["invalidateQueries"], "onSuccess:()=>qc.invalidateQueries({queryKey:['todos']})", ""],
];

const reactSeeds = mapTopics(reactTopics, {
  prefix: "react",
  categorie: "React",
  ressources: R("react", "mdnJs", "webdev", "jest", "playwright"),
  technologies: ["React", "JavaScript", "TypeScript", "HTML"],
  liens: ["JavaScript", "TypeScript", "Tests", "Performance"],
  competences: ["React", "Hooks", "UI composants"],
});

// ═══════════════════════════════════════════════════════════
// 7. Node.js (~40)
// ═══════════════════════════════════════════════════════════
const nodeTopics = [
  ["Bases", "Qu’est-ce que Node.js ?", "Node.js", "Runtime JS hors navigateur basé sur V8, orienté I/O événementiel non bloquant.", ["V8", "event loop", "npm"], "API HTTP, CLI, outils de build.", ""],
  ["Event loop", "Expliquez l’event loop Node.", "event loop Node", "La boucle traite timers, I/O, check, close ; libuv gère le pool et le non-blocking.", ["libuv", "phases"], "fs.readFile callback après I/O.", ""],
  ["Modules", "require vs import en Node ?", "modules Node", "CJS historique ; ESM natif via \"type\":\"module\" ou .mjs — interop à maîtriser.", ["CJS", "ESM"], "import express from 'express'", ""],
  ["NPM", "package.json : champs essentiels ?", "package.json", "name, version, scripts, dependencies/devDependencies, engines, type.", ["dependencies", "scripts"], "\"start\":\"node server.js\"", ""],
  ["NPM", "npm ci vs npm install ?", "npm ci", "ci installe depuis lockfile de façon reproductible (CI) ; install peut modifier le lock.", ["lockfile", "CI"], "CI : npm ci", ""],
  ["HTTP", "Créer un serveur HTTP natif ?", "http.Server", "http.createServer gère req/res ; frameworks (Express) ajoutent routing/middleware.", ["http", "req", "res"], "http.createServer((req,res)=>res.end('ok')).listen(3000)", ""],
  ["Express", "Middleware Express : principe ?", "middleware Express", "Fonctions (req,res,next) en chaîne pour auth, logs, parsing, erreurs.", ["next", "middleware"], "app.use(express.json())", ""],
  ["Express", "Gestion d’erreurs Express ?", "error middleware", "Middleware 4 args (err,req,res,next) centralise les erreurs.", ["error handler"], "app.use((err,req,res,next)=>{res.status(500).json({error:err.message})})", ""],
  ["Async", "Callback, Promise, async en Node ?", "async Node", "Préférer promisify/fs.promises et async/await ; éviter callback hell.", ["fs.promises"], "const data=await fs.readFile(p,'utf8')", ""],
  ["FS", "Streams fichiers : pourquoi ?", "streams Node", "Lire/écrire par chunks limite la mémoire sur gros fichiers.", ["stream", "pipe"], "fs.createReadStream(src).pipe(res)", ""],
  ["Path", "path et URL fileURLToPath ?", "path Node", "Joindre chemins portable ; en ESM import.meta.url → chemin fichier.", ["path", "fileURLToPath"], "path.join(__dirname,'data')", ""],
  ["Env", "Variables d’environnement et dotenv ?", "process.env", "Config hors code ; ne jamais commit de secrets ; valider au boot.", ["dotenv", "12factor"], "const port=process.env.PORT||3000", ""],
  ["Security", "Helmet, rate limit, validation ?", "sécurité Express", "Headers sécurisés, limitation de débit, validation Joi/zod, sanitization.", ["helmet", "rate-limit"], "app.use(helmet())", ""],
  ["Auth", "Sessions vs JWT en Node ?", "auth Node", "Sessions serveur + cookie ; JWT stateless — trade-offs révocation/taille.", ["JWT", "session"], "httpOnly cookie pour token.", ""],
  ["DB", "Accès DB : driver vs ORM ?", "accès données", "Drivers (pg) contrôlent SQL ; ORM/Query builders (Prisma, Knex) accélèrent au prix d’abstraction.", ["Prisma", "pg"], "const {rows}=await pool.query('SELECT 1')", ""],
  ["Process", "process.nextTick vs setImmediate ?", "nextTick setImmediate", "nextTick microtask-like prioritaire ; setImmediate phase check — éviter nextTick recursion.", ["nextTick"], "Préférer setImmediate pour différer.", ""],
  ["Cluster", "cluster / Worker threads ?", "parallélisme Node", "cluster multiplie des process ; worker_threads pour CPU-bound dans un process.", ["cluster", "worker_threads"], "CPU heavy → worker_threads.", ""],
  ["Child", "child_process : exec vs spawn ?", "child_process", "spawn streame ; exec bufferise — attention injection shell.", ["spawn", "exec"], "spawn('node',['script.js'])", ""],
  ["Debug", "Déboguer Node ?", "debug Node", "node --inspect, breakpoints VS Code, clinic/0x pour perf.", ["inspect"], "node --inspect index.js", ""],
  ["Tests", "Tester une API Express ?", "tests API", "supertest + Jest/Vitest, DB de test, isolation.", ["supertest"], "await request(app).get('/health').expect(200)", ""],
  ["Logging", "Logs structurés (pino/winston) ?", "logging Node", "JSON logs, niveaux, correlation id — pas de console.log seul en prod.", ["pino", "correlation"], "logger.info({userId},'login')", ""],
  ["Perf", "Event loop lag et monitoring ?", "perf Node", "Mesurer lag, heap, handles ouverts ; éviter sync FS en requête.", ["event loop lag"], "Éviter fs.readFileSync dans handlers.", ""],
  ["NPM", "semantic versioning ^ et ~ ?", "semver", "^autorise mineurs ; ~ patch ; lockfile fige les versions exactes installées.", ["semver", "lock"], "\"react\":\"^18.2.0\"", ""],
  ["NPM", "npx et packages locaux bin ?", "npx", "Exécute binaires de packages sans install globale — utile outils one-shot.", ["npx"], "npx prisma migrate dev", ""],
  ["HTTP", "Keep-alive et timeouts ?", "HTTP timeouts", "Configurer server.timeout, headersTimeout, et timeouts fetch sortants pour résilience.", ["timeout"], "server.setTimeout(120000)", ""],
  ["HTTPS", "TLS en Node ?", "TLS Node", "https.createServer avec certs ; en prod souvent terminé par reverse proxy.", ["TLS", "nginx"], "Certbot + nginx → Node HTTP interne.", ""],
  ["WebSocket", "ws / Socket.IO usages ?", "WebSocket Node", "Temps réel bi-directionnel ; Socket.IO ajoute fallback/rooms.", ["ws", "Socket.IO"], "Chat, notifications live.", ""],
  ["File upload", "multer et limites ?", "upload fichiers", "Limiter taille/MIME, stocker hors webroot, scanner, noms uniques.", ["multer"], "limits:{fileSize:5_000_000}", ""],
  ["Architecture", "Structure d’une API Node propre ?", "architecture API", "Routes → controllers → services → repositories ; middlewares transverses.", ["layered"], "services/userService.js", ""],
  ["Graceful", "Arrêt gracieux ?", "graceful shutdown", "Écouter SIGTERM, stopper les nouvelles req, vider connexions DB, puis exit.", ["SIGTERM"], "process.on('SIGTERM', shutdown)", ""],
  ["Memory", "Heap OOM : pistes ?", "mémoire Node", "Streams, pagination, limites buffers, leak listeners, --max-old-space-size mesuré.", ["heap", "streams"], "Éviter de charger un CSV entier en RAM.", ""],
  ["Crypto", "crypto pour mots de passe ?", "crypto Node", "bcrypt/argon2 pour hash ; crypto.randomBytes pour tokens ; jamais MD5/SHA seul pour passwords.", ["argon2", "bcrypt"], "await bcrypt.hash(pwd,12)", ""],
  ["Buffer", "Buffer vs Uint8Array ?", "Buffer", "Buffer est l’abstraction binaire Node (héritant Uint8Array) — attention encodages.", ["Buffer", "utf8"], "Buffer.from('été','utf8')", ""],
  ["Events", "EventEmitter usages et pièges ?", "EventEmitter", "Pub/sub interne ; maxListeners, memory leaks si non retirés.", ["on", "off"], "emitter.on('data', handler)", ""],
  ["Config", "12-factor et config Node ?", "12-factor", "Config via env, process stateless, logs stdout, discrétion secrets.", ["12factor"], "Pas de config.json secret en repo.", ""],
  ["Tooling", "tsx / ts-node pour TS ?", "Node TypeScript", "Exécuter TS en dev ; builder pour prod (tsc/swc).", ["tsx", "tsc"], "tsx watch src/index.ts", ""],
  ["Express", "Router Express et modularisation ?", "express.Router", "Routers par domaine montés sur app — clarté et testabilité.", ["Router"], "app.use('/api/users', usersRouter)", ""],
  ["Security", "Prototype pollution / injections ?", "vulnérabilités Node", "Valider JSON, figer Object.create(null) maps, deps audit (npm audit, Snyk).", ["npm audit"], "Éviter merge profond non sûr d’objets user.", ""],
  ["PM2", "Process managers (PM2, systemd) ?", "process manager", "Redémarrage, cluster mode, logs — ou orchestration conteneurs.", ["PM2", "systemd"], "pm2 start app.js -i max", ""],
  ["ESM", "top-level await en Node ESM ?", "top-level await Node", "Disponible en ESM pour bootstrap async — soigner le démarrage.", ["ESM"], "const db=await connect()", ""],
];

const nodeSeeds = mapTopics(nodeTopics, {
  prefix: "node",
  categorie: "Node.js",
  ressources: R("node", "express", "mdnJs", "owasp", "devdocs"),
  technologies: ["Node.js", "Express", "JavaScript", "npm"],
  liens: ["API", "Sécurité", "JavaScript", "DevOps"],
  competences: ["Backend Node.js", "API REST", "Asynchrone"],
});

// ═══════════════════════════════════════════════════════════
// 8. SQL (~40)
// ═══════════════════════════════════════════════════════════
const sqlTopics = [
  ["Bases", "Qu’est-ce que SQL et un SGBDR ?", "SQL SGBDR", "SQL interroge des bases relationnelles (tables, clés, contraintes) gérées par un SGBDR.", ["table", "clé", "contrainte"], "PostgreSQL, MySQL, SQLite.", "SELECT * FROM users;"],
  ["SELECT", "SELECT, FROM, WHERE : bases ?", "SELECT", "Projection de colonnes, source, filtre de lignes.", ["WHERE", "projection"], "SELECT id,email FROM users WHERE active=TRUE;", ""],
  ["JOIN", "INNER vs LEFT JOIN ?", "JOIN", "INNER : intersection ; LEFT garde toutes les lignes gauche + match droite nullable.", ["INNER", "LEFT"], "Users sans commande : LEFT JOIN orders ... WHERE o.id IS NULL", ""],
  ["JOIN", "RIGHT et FULL JOIN ?", "FULL JOIN", "FULL conserve les non-matches des deux côtés ; RIGHT symétrique de LEFT.", ["FULL OUTER"], "Analyse de réconciliation.", ""],
  ["GROUP", "GROUP BY et fonctions d’agrégation ?", "GROUP BY", "Agrège (COUNT, SUM, AVG) par groupes ; HAVING filtre après agrégation.", ["COUNT", "HAVING"], "SELECT user_id,COUNT(*) FROM orders GROUP BY user_id HAVING COUNT(*)>3;", ""],
  ["ORDER", "ORDER BY, LIMIT, OFFSET ?", "pagination SQL", "Tri + limite ; OFFSET coûteux sur grandes tables — keyset préférable.", ["LIMIT", "keyset"], "WHERE id> :last ORDER BY id LIMIT 20", ""],
  ["Keys", "Clé primaire vs clé étrangère ?", "clés", "PK identifie une ligne ; FK référence une PK/UK pour intégrité référentielle.", ["PK", "FK"], "orders.user_id → users.id", ""],
  ["Keys", "UNIQUE, CHECK, NOT NULL ?", "contraintes", "Garantissent intégrité au-delà de l’appli — défense en profondeur.", ["UNIQUE", "CHECK"], "CHECK (price>=0)", ""],
  ["Index", "À quoi sert un index ?", "index SQL", "Structure accélérant recherches/tris au coût d’écriture et stockage.", ["B-tree", "SELECT"], "INDEX sur email de login.", "CREATE INDEX idx_users_email ON users(email);"],
  ["Index", "Quand un index est-il inutile ou nuisible ?", "index trade-offs", "Colonnes peu sélectives, tables minuscules, trop d’indexes ralentissent WRITE.", ["sélectivité", "WRITE"], "Éviter indexer chaque colonne « au cas où ».", ""],
  ["Index", "Index composé : ordre des colonnes ?", "index composé", "L’ordre suit les prédicats (égalité gauche → plage) ; rule of leftmost prefix.", ["composite"], "(user_id, created_at) pour filtres user puis date.", ""],
  ["Transactions", "ACID : expliquez.", "ACID", "Atomicité, Cohérence, Isolation, Durabilité — garanties transactionnelles.", ["ACID", "COMMIT"], "Transfert bancaire : débit+crédit atomiques.", ""],
  ["Transactions", "BEGIN/COMMIT/ROLLBACK ?", "transactions SQL", "Regroupe des statements ; rollback annule en cas d’erreur.", ["ROLLBACK"], "BEGIN; UPDATE...; COMMIT;", ""],
  ["Isolation", "Niveaux d’isolation et anomalies ?", "isolation", "Read committed, repeatable read, serializable vs dirty/non-repeatable/phantom.", ["phantom read"], "PostgreSQL défaut READ COMMITTED.", ""],
  ["NULL", "NULL en SQL : pièges ?", "NULL SQL", "NULL≠NULL ; utiliser IS NULL ; agrégations ignorent NULL.", ["IS NULL", "COALESCE"], "COALESCE(phone,'N/A')", ""],
  ["Subquery", "Sous-requêtes vs JOIN ?", "sous-requêtes", "Parfois plus lisibles ; JOIN souvent optimisés — EXPLAIN pour trancher.", ["EXISTS", "IN"], "WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id=u.id)", ""],
  ["CTE", "WITH (CTE) : intérêt ?", "CTE", "Factorise des sous-requêtes nommées, récursives possibles.", ["WITH", "RECURSIVE"], "WITH active AS (SELECT * FROM users WHERE active) SELECT...", ""],
  ["Window", "Fonctions de fenêtrage ?", "window functions", "ROW_NUMBER, RANK, SUM OVER partitionnent sans collapse GROUP BY.", ["OVER", "PARTITION BY"], "ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY created_at DESC)", ""],
  ["Views", "Vues et vues matérialisées ?", "views", "Vue = requête nommée ; matérialisée stocke le résultat (refresh).", ["MATERIALIZED VIEW"], "Reporting pré-agrégé.", ""],
  ["Normalize", "Formes normales (1NF–3NF) ?", "normalisation", "Réduire redondance et anomalies via dépendances fonctionnelles.", ["3NF", "redondance"], "Adresse séparée de User si partagée.", ""],
  ["Normalize", "Dénormalisation : quand ?", "dénormalisation", "Optimiser lectures coûteuses au prix de cohérence — cache/compteurs.", ["perf lecture"], "compteur likes dénormalisé.", ""],
  ["Explain", "EXPLAIN / ANALYZE ?", "EXPLAIN", "Montre le plan d’exécution et coûts ; ANALYZE exécute et mesure.", ["seq scan", "index scan"], "EXPLAIN ANALYZE SELECT...", ""],
  ["Injection", "Prévenir l’injection SQL ?", "SQL injection", "Requêtes paramétrées/bind, ORM sûrs, jamais concaténer l’input user.", ["prepared statements"], "pool.query('SELECT * FROM u WHERE id=$1',[id])", ""],
  ["Types", "Types de données courants ?", "types SQL", "INT, NUMERIC, TEXT, BOOLEAN, TIMESTAMPTZ, UUID, JSONB…", ["UUID", "JSONB"], "Préférer timestamptz en Postgres.", ""],
  ["JSON", "JSON/JSONB en PostgreSQL ?", "JSONB", "Stocke du semi-structuré indexable (GIN) — pas un substitut au relationnel.", ["JSONB", "GIN"], "data->>'email'", ""],
  ["Upsert", "INSERT ON CONFLICT / UPSERT ?", "UPSERT", "Insère ou met à jour selon conflit de contrainte unique.", ["ON CONFLICT"], "INSERT ... ON CONFLICT (email) DO UPDATE SET...", ""],
  ["Delete", "DELETE vs soft delete ?", "soft delete", "Marquer deleted_at conserve historique ; complique unicité et requêtes.", ["deleted_at"], "WHERE deleted_at IS NULL", ""],
  ["Migrate", "Migrations de schéma ?", "migrations SQL", "Versionner DDL (up/down) pour sync environnements — Flyway, Prisma migrate, Knex.", ["DDL", "versioning"], "Jamais modifier prod à la main non tracé.", ""],
  ["Backup", "Sauvegarde et PITR (aperçu) ?", "backup SQL", "Dumps logiques + bases physiques + WAL pour point-in-time recovery.", ["pg_dump", "WAL"], "Tester les restores régulièrement.", ""],
  ["Rights", "GRANT / rôles ?", "privilèges SQL", "Principe du moindre privilège : app user ≠ superuser.", ["GRANT", "ROLE"], "REVOKE ALL ; GRANT SELECT,INSERT...", ""],
  ["MySQL", "Différences notables MySQL vs PostgreSQL ?", "MySQL vs Postgres", "Postgres riche (JSONB, CTE historiques, contraintes) ; MySQL très répandu web — connaître le dialecte du poste.", ["dialecte"], "RETURNING plus natif Postgres.", ""],
  ["SQLite", "Quand utiliser SQLite ?", "SQLite", "Embedded, fichiers locaux, tests, mobile — pas pour forte concurrence write multi-clients.", ["embedded"], "Tests d’intégration légers.", ""],
  ["Agg", "COUNT(*) vs COUNT(col) ?", "COUNT", "COUNT(*) compte lignes ; COUNT(col) ignore NULL sur col.", ["NULL"], "COUNT(email) ≠ total users si emails null.", ""],
  ["Distinct", "SELECT DISTINCT et perf ?", "DISTINCT", "Déduplique ; coûteux — parfois GROUP BY/EXISTS mieux.", ["DISTINCT"], "Éviter DISTINCT pour masquer un mauvais JOIN.", ""],
  ["Having", "WHERE vs HAVING ?", "HAVING", "WHERE avant agrégat ; HAVING après.", ["HAVING"], "Filtrer COUNT>1 → HAVING.", ""],
  ["Alias", "Alias AS tables/colonnes ?", "alias SQL", "Lisibilité et self-joins ; AS optionnel mais clair.", ["AS"], "FROM users u JOIN orders o ON...", ""],
  ["Case", "CASE WHEN en SQL ?", "CASE", "Expression conditionnelle en SELECT/ORDER.", ["CASE"], "CASE WHEN score>=10 THEN 'A' ELSE 'B' END", ""],
  ["Date", "Manipuler des dates ?", "dates SQL", "Fonctions DATE_TRUNC, INTERVAL ; stocker UTC ; convertir à l’affichage.", ["INTERVAL", "UTC"], "NOW() - INTERVAL '7 days'", ""],
  ["Lock", "Locks et deadlocks ?", "verrous SQL", "Transactions concurrentes se bloquent ; ordre cohérent + retries + deadlocks détectés.", ["deadlock"], "UPDATE court, index pour éviter scans longs.", ""],
  ["Design", "Schéma pour multi-tenant ?", "multi-tenant SQL", "Colonne tenant_id + RLS, ou schémas/DB séparés selon isolation.", ["RLS", "tenant_id"], "Postgres Row Level Security.", ""],
];

const sqlSeeds = mapTopics(sqlTopics, {
  prefix: "sql",
  categorie: "SQL",
  ressources: R("sqlbolt", "postgres", "mysql", "sqlite", "devdocs"),
  technologies: ["SQL", "PostgreSQL", "MySQL"],
  liens: ["API", "Architecture Logicielle", "Sécurité", "Performance"],
  competences: ["Modélisation données", "SQL", "Optimisation requêtes"],
});

// ═══════════════════════════════════════════════════════════
// 9. Git (~35)
// ═══════════════════════════════════════════════════════════
const gitTopics = [
  ["Bases", "Qu’est-ce que Git ?", "Git", "Système de contrôle de version distribué traçant l’historique des fichiers via commits.", ["commit", "décentralisé"], "Chaque clone a l’historique.", ""],
  ["Bases", "working tree, staging, repository ?", "zones Git", "Modifs → add (index) → commit (repo) ; distinction cruciale.", ["staging", "index"], "git add -p pour staging partiel.", ""],
  ["Commit", "Bon message de commit ?", "messages commit", "Impératif court + pourquoi ; conventional commits optionnels (feat/fix).", ["conventional commits"], "fix: prevent XSS on profile form", ""],
  ["Branch", "Stratégie de branches simple ?", "branches", "main protégée, branches feature, PR, merge/rebase selon équipe.", ["feature branch", "PR"], "git switch -c feat/login", ""],
  ["Merge", "merge vs rebase ?", "merge rebase", "merge conserve historique parallèle ; rebase réécrit linéairement — pas sur branches partagées publiques sans accord.", ["rebase", "ff"], "rebase local avant PR pour linearité.", ""],
  ["Merge", "Conflit de merge : méthode ?", "conflits Git", "Ouvrir fichiers, résoudre marqueurs, tester, add, commit/continue.", ["conflict markers"], "<<<<<<< HEAD", ""],
  ["Remote", "fetch vs pull vs push ?", "remote Git", "fetch récupère sans fusionner ; pull = fetch+merge/rebase ; push envoie.", ["fetch", "pull"], "Préférer fetch + review avant merge.", ""],
  ["Remote", "upstream tracking branch ?", "upstream", "-u lie branche locale/remote pour push/pull sans args.", ["-u"], "git push -u origin HEAD", ""],
  ["Log", "git log utile ?", "git log", "oneline, graph, blame, bisect pour enquêter.", ["bisect", "blame"], "git bisect start", ""],
  ["Diff", "git diff et diff --staged ?", "git diff", "diff WT vs index ; --staged index vs HEAD.", ["staged"], "Relire avant commit.", ""],
  ["Reset", "soft, mixed, hard ?", "git reset", "soft garde staging+WT ; mixed unstage ; hard détruit WT — danger.", ["reset --hard"], "Éviter hard si non poussé et non sûr.", ""],
  ["Revert", "revert vs reset sur main ?", "git revert", "revert crée un commit d’annulation sûr pour historique partagé.", ["revert"], "git revert <sha>", ""],
  ["Stash", "git stash usages ?", "stash", "Met de côté des modifs pour changer de branche vite.", ["stash"], "git stash push -m 'wip'", ""],
  ["Tag", "Tags annotés vs légers ?", "tags Git", "Annotés pour releases versionnées ; pousser tags explicitement.", ["semver", "tag"], "git tag -a v1.2.0 -m 'release'", ""],
  ["Ignore", ".gitignore bonnes pratiques ?", "gitignore", "Ignorer secrets, node_modules, builds ; ne pas ignorer .env.example.", ["gitignore"], "node_modules/\\n.env", ""],
  ["Hooks", "hooks pre-commit / pre-push ?", "git hooks", "Automatisent lint/tests locaux ; Husky/lefthook en équipe.", ["husky"], "lint-staged sur fichiers staged.", ""],
  ["PR", "Bonne pull request ?", "pull request", "Petite, décrite, testée, screenshots UI, lien ticket, relecture.", ["code review"], "Description : pourquoi + comment tester.", ""],
  ["Review", "Comment faire une code review efficace ?", "code review", "Fond > style (linter), risques, tests, ton constructif, questions.", ["review"], "Séparer nitpicks des blockers.", ""],
  ["Cherry", "cherry-pick : quand ?", "cherry-pick", "Applique un commit ailleurs — hotfixes ciblés, attention dépendances.", ["cherry-pick"], "git cherry-pick <sha>", ""],
  ["Reflog", "reflog : filet de sécurité ?", "reflog", "Historique local des HEAD — récupérer commits « perdus ».", ["reflog"], "git reflog", ""],
  ["Submodule", "submodules : intérêt/limites ?", "submodules", "Intègrent un autre repo à un SHA — complexité clone/CI.", ["submodule"], "Souvent monorepo ou packages préférables.", ""],
  ["Monorepo", "Git en monorepo ?", "monorepo Git", "Sparse checkout, ownership CODEOWNERS, CI affected packages.", ["CODEOWNERS"], "nx/turbo pour builds incrémentaux.", ""],
  ["Signed", "Commits signés ?", "signed commits", "GPG/SSH sign prouve l’auteur — politiques GitHub.", ["GPG", "SSH"], "git commit -S", ""],
  ["Workflow", "GitFlow vs trunk-based ?", "workflows Git", "GitFlow branches longues ; trunk-based + feature flags pour CD.", ["trunk-based", "GitFlow"], "Startups : souvent trunk-based.", ""],
  ["Amend", "commit --amend : précautions ?", "amend", "Modifier dernier commit local non poussé ; jamais amend d’un commit déjà partagé sans force.", ["amend"], "Corriger un typo de message local.", ""],
  ["Force", "force push : règles ?", "force push", "--force-with-lease plutôt que --force ; interdit sur main protégée.", ["force-with-lease"], "Seulement sur sa feature branch.", ""],
  ["Bisect", "git bisect pour un bug ?", "git bisect", "Recherche binaire du commit fautif via tests good/bad.", ["bisect"], "Automatisable avec git bisect run", ""],
  ["Attributes", ".gitattributes et fins de ligne ?", "gitattributes", "Normalise EOL, linguist, LFS patterns.", ["eol", "LFS"], "* text=auto", ""],
  ["LFS", "Git LFS ?", "Git LFS", "Stocke gros binaires hors repo Git classique.", ["LFS"], "Design assets, modèles ML.", ""],
  ["CI", "GitHub Actions déclenchées par Git ?", "CI Git", "push/PR tags déclenchent pipelines tests/deploy.", ["Actions"], "on: pull_request", ""],
  ["Secrets", "Ne jamais commit de secrets ?", "secrets Git", "Si leak : rotate keys, history rewrite (BFG), scanning (gitleaks).", ["gitleaks"], "git-secrets / pre-commit detect-secrets.", ""],
  ["Alias", "Alias Git utiles ?", "alias Git", "Productivité : co, br, lg graph.", ["alias"], "lg = log --oneline --graph --decorate", ""],
  ["Detached", "HEAD détachée : que faire ?", "detached HEAD", "Créer une branche pour conserver les commits ou revenir à une branche.", ["detached"], "git switch -c recover", ""],
  ["Restore", "restore vs checkout moderne ?", "git restore", "restore restaure fichiers ; switch change de branche — CLI plus claire.", ["restore", "switch"], "git restore --staged file", ""],
  ["Squash", "squash merge : pour/contre ?", "squash merge", "Histoire linéaire lisible mais perd granularité des commits de feature.", ["squash"], "OK petites PR ; discutable pour audit fin.", ""],
];

const gitSeeds = mapTopics(gitTopics, {
  prefix: "git",
  categorie: "Git",
  ressources: R("git", "github", "gitlab"),
  technologies: ["Git", "GitHub", "GitLab"],
  liens: ["DevOps", "Tests", "Gestion de projet"],
  competences: ["Versioning", "Collaboration", "Code review"],
});

// ═══════════════════════════════════════════════════════════
// 10. API (~35)
// ═══════════════════════════════════════════════════════════
const apiTopics = [
  ["REST", "Qu’est-ce qu’une API REST ?", "REST", "Style d’archi : ressources, verbes HTTP, stateless, représentations (JSON).", ["ressource", "stateless", "JSON"], "GET /users/42", ""],
  ["REST", "Verbes HTTP et sémantique ?", "verbes HTTP", "GET lecture, POST création, PUT/PATCH update, DELETE suppression — idempotence à connaître.", ["idempotence", "GET"], "PUT idempotent, POST non.", ""],
  ["REST", "Codes de statut utiles ?", "status HTTP", "2xx succès, 4xx client, 5xx serveur — 201,204,400,401,403,404,409,422,429,500…", ["401", "404", "429"], "422 validation métier.", ""],
  ["REST", "Conception d’URI REST ?", "URI design", "Noms pluriels, hiérarchie claire, pas de verbes dans l’URL (sauf actions rares).", ["URI"], "/orders/5/items", ""],
  ["HTTP", "Headers importants ?", "headers HTTP", "Authorization, Content-Type, Accept, Cache-Control, ETag, CORS…", ["Content-Type", "Authorization"], "Content-Type: application/json", ""],
  ["HTTP", "Idempotency-Key : pourquoi ?", "idempotence API", "Évite doubles créations sur retries réseau (paiements).", ["Idempotency-Key"], "Header unique par intention client.", ""],
  ["Auth", "API Key vs OAuth2 vs JWT ?", "auth API", "API key simple ; OAuth2 délégation ; JWT transport de claims — choix selon menace.", ["OAuth2", "JWT"], "SPA publique : OAuth2 + PKCE.", ""],
  ["Auth", "Bearer token : bonnes pratiques ?", "Bearer token", "HTTPS only, expiration courte, refresh, stockage sûr, scopes minimaux.", ["Bearer", "scope"], "Authorization: Bearer <token>", ""],
  ["CORS", "Qu’est-ce que CORS ?", "CORS", "Mécanisme navigateur contrôlant lectures cross-origin via headers serveur.", ["Access-Control-Allow-Origin", "preflight"], "Configurer origins explicites, pas * avec credentials.", ""],
  ["Versioning", "Versionner une API ?", "versioning API", "URI /v1, headers, ou évolutivité compatible — déprécation documentée.", ["/v1", "deprecation"], "Sunset header + changelog.", ""],
  ["Pagination", "Offset vs cursor ?", "pagination API", "Cursor/keyset scale mieux qu’offset sur gros datasets.", ["cursor", "page"], "?cursor=eyJ...&limit=20", ""],
  ["Filtering", "Filtres, tri, recherche ?", "query API", "Query params documentés ; valider/whitelister champs de tri.", ["sort", "filter"], "?status=active&sort=-createdAt", ""],
  ["Errors", "Format d’erreur API cohérent ?", "erreurs API", "Corps stable (code, message, details, traceId) — RFC 7807 Problem Details.", ["RFC7807"], "{\"type\":\"...\",\"title\":\"Invalid\",\"status\":422}", ""],
  ["OpenAPI", "OpenAPI / Swagger : intérêt ?", "OpenAPI", "Contrat machine-readable : doc, mocks, codegen, tests de contrat.", ["OpenAPI", "Swagger"], "openapi.yaml source de vérité.", ""],
  ["HATEOAS", "HATEOAS : idée ?", "HATEOAS", "Réponses avec liens de navigation hypermedia — rare en APIs JSON pragmatiques.", ["hypermedia"], "Connaître pour entretiens senior.", ""],
  ["GraphQL", "GraphQL vs REST ?", "GraphQL", "Client spécifie le graphe de champs ; un endpoint ; trade-offs cache/complexity/N+1.", ["query", "resolver"], "{ user(id:1){name posts{title}} }", ""],
  ["gRPC", "gRPC en une phrase ?", "gRPC", "RPC haute perf Protobuf + HTTP/2 — microservices internes.", ["Protobuf", "HTTP/2"], "Moins idéal navigateurs sans proxy.", ""],
  ["Webhook", "Webhooks : fiabilité ?", "webhooks", "Callbacks HTTP ; signatures HMAC, retries, idempotence côté récepteur.", ["HMAC", "retry"], "Vérifier X-Signature.", ""],
  ["Rate limit", "Rate limiting API ?", "rate limiting", "Protéger abus : token bucket, headers X-RateLimit, 429 + Retry-After.", ["429", "token bucket"], "Par IP / par user / par token.", ""],
  ["Cache", "ETag et Cache-Control ?", "cache HTTP", "Validation conditionnelle (304) et politiques de cache navigateur/CDN.", ["ETag", "304"], "If-None-Match: \"abc\"", ""],
  ["Security", "OWASP API Top 10 (aperçu) ?", "OWASP API", "BOLA/IDOR, auth cassée, excess data, rate limit… à connaître.", ["BOLA", "IDOR"], "Vérifier autorisation sur chaque ressource.", ""],
  ["Security", "Pourquoi HTTPS obligatoire ?", "TLS API", "Confidentialité et intégrité ; HSTS ; cookies Secure.", ["TLS", "HSTS"], "Pas de token en clair HTTP.", ""],
  ["Contract", "Consumer-driven contracts ?", "CDC tests", "Pact etc. vérifient compatibilité producteur/consommateur en CI.", ["Pact"], "Évite breaks silencieux microservices.", ""],
  ["Docs", "Documenter une API pour humains ?", "doc API", "OpenAPI + exemples + erreurs + auth + guides quickstart.", ["examples"], "Postman/Insomnia collections.", ""],
  ["JSON", "JSON API design tips ?", "JSON API", "Noms cohérents, dates ISO, enveloppes stables, pas de tableaux racine seuls si besoin méta.", ["ISO8601"], "{\"data\":{...},\"meta\":{...}}", ""],
  ["Upload", "Upload fichiers via API ?", "upload API", "multipart, limites taille, virus scan, URLs signées S3 pour directs.", ["multipart", "presigned"], "POST /files + storage service.", ""],
  ["Async", "APIs asynchrones (202 + job) ?", "async API", "Accepter, renvoyer 202 + Location job status pour traitements longs.", ["202", "polling"], "GET /jobs/123", ""],
  ["Gateway", "API Gateway : rôle ?", "API Gateway", "Entrée unique : auth, rate limit, routing, observabilité.", ["gateway"], "Kong, AWS API Gateway, nginx.", ""],
  ["BFF", "Backend for Frontend ?", "BFF", "API adaptée à un client (mobile/web) pour agréger/minimiser les chats.", ["BFF"], "BFF mobile ≠ BFF web.", ""],
  ["Idempotency", "Quelles méthodes sont idempotentes ?", "idempotence HTTP", "GET, PUT, DELETE idempotents ; POST non (sauf design).", ["PUT", "POST"], "Retries GET/PUT plus sûrs.", ""],
  ["Content", "Content negotiation ?", "content negotiation", "Accept / Content-Type choisissent représentation (JSON, CSV).", ["Accept"], "Accept: application/json", ""],
  ["SOAP", "SOAP vs REST (entretien) ?", "SOAP", "SOAP XML/contrats WSDL plus lourds ; REST/JSON dominant web moderne.", ["WSDL"], "Connaître pour legacy entreprise.", ""],
  ["Observability", "Tracer une requête API ?", "observabilité API", "correlation-id, logs structurés, metrics latence/erreur, tracing distribué.", ["traceId"], "Propager X-Request-Id.", ""],
  ["SDK", "Générer un client SDK ?", "SDK API", "OpenAPI Generator, orval — réduit erreurs d’intégration.", ["codegen"], "Types TS générés côté front.", ""],
  ["Deprecation", "Déprécier un endpoint ?", "dépréciation", "Annoncer, documenter alternative, metrics d’usage, date de coupure.", ["Sunset"], "Maintenir chevauchement v1/v2.", ""],
];

const apiSeeds = mapTopics(apiTopics, {
  prefix: "api",
  categorie: "API",
  ressources: R("mdnHttp", "openapi", "swagger", "owasp", "rfc9110", "json"),
  technologies: ["HTTP", "REST", "JSON", "OpenAPI"],
  liens: ["Sécurité", "Node.js", "Architecture Logicielle"],
  competences: ["Conception API", "HTTP", "Intégration"],
});

// ═══════════════════════════════════════════════════════════
// 11. Architecture Logicielle (~40)
// ═══════════════════════════════════════════════════════════
const archTopics = [
  ["Principes", "Qu’est-ce que la séparation des responsabilités ?", "SoC", "Chaque module a une raison de changer limitée — clarté et testabilité.", ["SoC", "modularité"], "UI ≠ logique métier ≠ accès données.", ""],
  ["Principes", "DRY vs pragmatisme ?", "DRY", "Don’t Repeat Yourself ; sur-abstraction aussi coûteuse — règle of three.", ["DRY", "abstraction"], "Dupliquer 2 fois avant d’abstraire parfois.", ""],
  ["Principes", "KISS et YAGNI ?", "KISS YAGNI", "Simplicité et ne pas construire pour des besoins imaginaires.", ["KISS", "YAGNI"], "Éviter microservices day-one.", ""],
  ["SOLID", "Expliquez SOLID brièvement.", "SOLID", "SRP, OCP, LSP, ISP, DIP — guides OO pour designs évolutifs.", ["SRP", "DIP"], "Une classe = une responsabilité.", ""],
  ["SOLID", "Dependency Inversion : exemple ?", "DIP", "Dépendre d’abstractions (interfaces) plutôt que de détails concrets.", ["DIP", "injection"], "Service dépend de Repository interface.", ""],
  ["Patterns", "MVC / MVP / MVVM ?", "MVC", "Sépare modèle, vue, contrôle/coordination — variantes selon UI toolkit.", ["MVC", "MVVM"], "Express controllers + React views.", ""],
  ["Patterns", "Repository pattern ?", "Repository", "Abstrait la persistance derrière une collection-like API.", ["repository"], "UserRepository.findByEmail()", ""],
  ["Patterns", "Factory et Strategy ?", "Factory Strategy", "Factory crée ; Strategy interchange algorithmes sans ifs explosifs.", ["Strategy"], "Paiement: CardStrategy|PaypalStrategy.", ""],
  ["Patterns", "Observer / pub-sub en archi ?", "Observer archi", "Découple producteurs d’événements et handlers — event bus, message broker.", ["events"], "order.created → email + stock.", ""],
  ["Layers", "Architecture en couches ?", "layered architecture", "Presentation → Application → Domain → Infrastructure ; dépendances vers l’intérieur.", ["layers"], "Domain sans import Express.", ""],
  ["Clean", "Clean Architecture / hexagonale ?", "hexagonale", "Domaine au centre, ports/adapters pour UI/DB — testable sans infra.", ["ports", "adapters"], "Adapter Postgres derrière port OrderStore.", ""],
  ["DDD", "Domain-Driven Design : idées clés ?", "DDD", "Ubiquitous language, bounded contexts, agrégats — pour domaines complexes.", ["bounded context", "aggregate"], "Billing ≠ Catalog contexts.", ""],
  ["CQRS", "CQRS : principe ?", "CQRS", "Sépare modèles de commande et de requête — scale lectures/écritures différemment.", ["CQRS"], "Souvent avec event sourcing.", ""],
  ["Event sourcing", "Event sourcing : idée/trade-offs ?", "event sourcing", "État = flux d’événements ; audit fort, complexité projections.", ["events", "projection"], "Bank ledger.", ""],
  ["Microservices", "Quand les microservices ?", "microservices", "Équipes autonomes, scale indépendant, domaines stables — coût ops élevé.", ["microservice"], "Monolithe modulaire d’abord souvent.", ""],
  ["Microservices", "Communication sync vs async ?", "comms microservices", "HTTP sync simple ; messages async découplent et absorbent pics.", ["message queue"], "RabbitMQ/Kafka pour events.", ""],
  ["Monolithe", "Monolithe modulaire : intérêts ?", "monolithe modulaire", "Un deploy, modules bornés — bon défaut jusqu’à douleur réelle.", ["modular monolith"], "Packages internes par domaine.", ""],
  ["Coupling", "Couplage et cohésion ?", "couplage cohésion", "Haute cohésion / faible couplage : modules auto-contenus peu dépendants.", ["couplage"], "Éviter utilitaires fourre-tout.", ""],
  ["ADR", "Architecture Decision Records ?", "ADR", "Docs courtes des décisions (contexte, options, choix) — mémoire d’équipe.", ["ADR"], "adr-001-jwt.md", ""],
  ["Tradeoffs", "Comment présenter un trade-off en entretien ?", "trade-offs", "Critères (coût, risque, time-to-market), options, recommandation, risques.", ["trade-off"], "SSR vs CSR pour SEO.", ""],
  ["Scalability", "Scale vertical vs horizontal ?", "scalabilité", "Vertical = plus gros serveur ; horizontal = plus d’instances + stateless.", ["horizontal"], "Load balancer + sessions externes.", ""],
  ["Cache", "Où placer le cache ?", "stratégies cache", "Client, CDN, app (Redis), DB — invalidation est le problème dur.", ["Redis", "CDN"], "Cache-aside pattern.", ""],
  ["Queue", "Files d’attente : usages ?", "message queues", "Lissage charge, retries, fan-out, workflows asynchrones.", ["queue"], "Génération PDF hors requête HTTP.", ""],
  ["Idempotence", "Idempotence en archi distribuée ?", "idempotence distribuée", "Retries sûrs via clés, dedup stores, exactly-once approximé.", ["dedup"], "Payment intents uniques.", ""],
  ["Consistency", "CAP et cohérence éventuelle ?", "CAP", "Trade-offs consistency/availability/partition ; eventual consistency fréquente.", ["eventual consistency"], "Réplicas lecture éventuellement à jour.", ""],
  ["Sagas", "Saga pattern ?", "saga", "Orchestration/chorégraphie de transactions distribuées avec compensations.", ["compensation"], "Réservation + paiement + annulation.", ""],
  ["API design", "API publique vs interne ?", "API boundaries", "Contrats stables, versioning, auth plus stricts en public.", ["contrat"], "BFF internes plus volatils.", ""],
  ["Modularity", "Feature flags en architecture ?", "feature flags", "Découple deploy et release ; expérimentation et kill switch.", ["feature flag"], "LaunchDarkly / flags maison.", ""],
  ["Resilience", "Circuit breaker, retry, timeout ?", "résilience", "Évite cascading failures ; retries avec backoff/jitter ; budgets timeout.", ["circuit breaker"], "Appels paiement protégés.", ""],
  ["Observability", "Logs, metrics, traces ?", "observabilité", "Trois piliers pour diagnostiquer systèmes distribués.", ["tracing", "metrics"], "OpenTelemetry.", ""],
  ["Security arch", "Defense in depth ?", "défense en profondeur", "Plusieurs couches (réseau, app, data, IAM) — zéro confiance.", ["zero trust"], "WAF + authz + encryption.", ""],
  ["Data", "Single source of truth ?", "SSOT", "Une source fait autorité ; le reste est dérivé/cache.", ["SSOT"], "User profile en service Identity.", ""],
  ["Frontend arch", "Micro-frontends : quand ?", "micro-frontends", "Indépendance d’équipes UI au prix d’intégration/UX/perf.", ["micro-frontend"], "Grandes orgs multi-équipes.", ""],
  ["Backend", "BFF et aggregation ?", "aggregation BFF", "Réduit chattiness mobile ; attention god-BFF.", ["BFF"], "GraphQL parfois sert de BFF.", ""],
  ["Quality", "Architecture fitness functions ?", "fitness functions", "Tests automatiques de règles archi (deps interdites, perf budgets).", ["fitness"], "Dep-cruiser interdit UI→DB.", ""],
  ["Docs", "C4 model ?", "C4", "Context, Container, Component, Code — niveaux de diagrammes.", ["C4"], "Diagramme container pour onboarding.", ""],
  ["Legacy", "Strangler fig pattern ?", "strangler fig", "Remplace legacy progressivement en routant vers le nouveau.", ["strangler"], "Migrer module par module.", ""],
  ["Testing arch", "Pyramide et tests d’archi ?", "tests architecture", "Unit > integration > e2e ; archunit/deps rules.", ["pyramide"], "Peu d’e2e critiques.", ""],
  ["Perf arch", "Backpressure ?", "backpressure", "Système signale surcharge pour ralentir producteurs — streams/queues.", ["backpressure"], "Consumer lent → queue bound.", ""],
  ["Cloud native", "12-factor et cloud-native ?", "cloud-native", "Apps conçues pour conteneurs, config env, disposability, observabilité.", ["12factor"], "Stateless app containers.", ""],
];

const archSeeds = mapTopics(archTopics, {
  prefix: "arch",
  categorie: "Architecture Logicielle",
  ressources: R("roadmap", "mslearn", "owasp", "webdev"),
  technologies: ["Architecture", "Design patterns", "DDD"],
  liens: ["API", "DevOps", "Tests", "Sécurité"],
  competences: ["Conception logicielle", "Trade-offs", "Modularité"],
});

// ═══════════════════════════════════════════════════════════
// 12. Tests (~30)
// ═══════════════════════════════════════════════════════════
const testTopics = [
  ["Bases", "Pourquoi automatiser les tests ?", "tests automatisés", "Régression rapide, confiance au refactor, documentation vivante — coût vs bugs prod.", ["régression", "CI"], "Suite verte avant merge.", ""],
  ["Pyramide", "Pyramide des tests ?", "pyramide des tests", "Beaucoup d’unitaires, moins d’intégration, peu d’e2e — vitesse/stabilité.", ["unit", "e2e"], "Éviter ice-cream cone inversé.", ""],
  ["Unit", "Qu’est-ce qu’un bon test unitaire ?", "test unitaire", "Rapide, isolé, déterministe, AAA, nomme le comportement.", ["AAA", "isolation"], "expect(sum(2,2)).toBe(4)", ""],
  ["Integration", "Tests d’intégration : portée ?", "tests intégration", "Plusieurs modules/DB réels ou testcontainers — contrats réels.", ["testcontainers"], "API + Postgres de test.", ""],
  ["E2E", "Tests end-to-end : rôle ?", "tests e2e", "Parcours utilisateur critiques (Playwright/Cypress) — lents/fragiles si trop nombreux.", ["Playwright"], "Checkout happy path.", ""],
  ["TDD", "Cycle TDD ?", "TDD", "Red → Green → Refactor ; guide le design par les tests.", ["TDD"], "Écrire le test qui échoue d’abord.", ""],
  ["BDD", "BDD / Gherkin ?", "BDD", "Given-When-Then aligne métier et tests (Cucumber).", ["Gherkin"], "Given user logged When add item Then cart=1", ""],
  ["Mocks", "Mock, stub, fake, spy ?", "test doubles", "Remplacent des dépendances ; trop de mocks = tests fragiles.", ["mock", "stub"], "Mock HTTP pour service email.", ""],
  ["Jest", "Jest / Vitest : assertions et mocks ?", "Jest Vitest", "expect, mock functions, coverage, watch mode — Vitest rapide en Vite.", ["Vitest", "Jest"], "vi.fn() / jest.fn()", ""],
  ["RTL", "Testing Library best practices ?", "Testing Library", "Queries accessibles, user-event, éviter details d’implémentation.", ["getByRole"], "getByRole('button',{name:'Save'})", ""],
  ["Playwright", "Avantages Playwright ?", "Playwright", "Multi-navigateurs, auto-wait, trace viewer, parallel.", ["Playwright"], "await page.getByText('OK').click()", ""],
  ["Contract", "Tests de contrat API ?", "contract testing", "Vérifient compatibilité provider/consumer (Pact).", ["Pact"], "CI casse si breaking change.", ""],
  ["Snapshot", "Snapshots : pour/contre ?", "snapshot testing", "Détectent changements UI/JSON ; bruyants si abusés.", ["snapshot"], "Review soigneux des updates.", ""],
  ["Flaky", "Gérer les tests flaky ?", "flaky tests", "Isoler, quarantine, corriger causes (timing, order, shared state).", ["flaky"], "Jamais retry comme solution finale.", ""],
  ["Coverage", "Couverture de code : métrique ?", "coverage", "Indicateur utile mais 100% ≠ qualité ; viser chemins critiques.", ["coverage"], "Branches métier prioritaires.", ""],
  ["CI", "Tests en CI/CD ?", "tests CI", "Sur PR : lint+unit+integration ; e2e nightly ou sur main.", ["CI"], "Fail fast jobs parallèles.", ""],
  ["Data", "Fixtures et factories ?", "fixtures", "Données de test explicites ; factories pour variations.", ["factory"], "buildUser({role:'admin'})", ""],
  ["DB", "Tester avec une base ?", "tests DB", "Migrations, transactions rollback, containers — isolation.", ["migrations"], "Chaque test repart clean.", ""],
  ["Perf tests", "Tests de perf / charge ?", "tests performance", "k6/JMeter mesurent latence/throughput ; budgets définis.", ["k6"], "p95 < 300ms sur /search.", ""],
  ["Security tests", "SAST/DAST/fuzzing ?", "tests sécurité", "Analyse statique, dynamique, fuzz inputs — complément OWASP.", ["SAST", "DAST"], "CI SAST sur chaque PR.", ""],
  ["A11y tests", "Tests d’accessibilité ?", "tests a11y", "axe-core, parcours clavier, audits manuels complémentaires.", ["axe"], "expect(await axe(container)).toHaveNoViolations()", ""],
  ["Mutation", "Mutation testing ?", "mutation testing", "Introduit des mutants pour vérifier la qualité des tests (Stryker).", ["Stryker"], "Si mutants survivent, tests faibles.", ""],
  ["Smoke", "Smoke / sanity / regression ?", "smoke tests", "Smoke = checks critiques post-deploy ; regression = suite plus large.", ["smoke"], "/health et login après release.", ""],
  ["Shift left", "Shift-left testing ?", "shift-left", "Tester tôt (revue, unit, contrats) réduit coût des défauts.", ["shift-left"], "Tests dès la story.", ""],
  ["Non-fonc", "Tester non-fonctionnel ?", "tests non-fonctionnels", "Perf, sécu, accessibilité, résilience chaos — critères d’acceptation.", ["NFR"], "Budget LCP dans Definition of Done.", ""],
  ["API test", "Tester une API REST ?", "tests API", "Status, schéma, authz, cas limites, idempotence.", ["supertest"], "401 sans token ; 403 mauvais user.", ""],
  ["Visual", "Regressions visuelles ?", "visual regression", "Screenshots comparés (Percy, Playwright) — attention flakiness fonts.", ["visual"], "Snapshots composants Storybook.", ""],
  ["Test env", "Environnements de test ?", "environnements test", "Isolés, données anonymisées, secrets séparés, reproductibles.", ["staging"], "Pas de tests destructifs sur prod.", ""],
  ["DoD", "Tests dans la Definition of Done ?", "Definition of Done", "Critères incluant tests, a11y, revue — qualité partagée.", ["DoD"], "Pas de « on testera plus tard ».", ""],
  ["First principles", "Que tester en priorité ?", "priorisation tests", "Risque × fréquence × coût du bug — chemins argent/auth d’abord.", ["risque"], "Checkout > page marketing.", ""],
];

const testSeeds = mapTopics(testTopics, {
  prefix: "test",
  categorie: "Tests",
  ressources: R("jest", "vitest", "playwright", "webdev"),
  technologies: ["Jest", "Vitest", "Playwright", "Testing Library"],
  liens: ["CI/CD", "Qualité", "API"],
  competences: ["Tests automatisés", "TDD", "Qualité logicielle"],
});

// ═══════════════════════════════════════════════════════════
// 13. Sécurité (~40)
// ═══════════════════════════════════════════════════════════
const secuTopics = [
  ["OWASP", "Qu’est-ce que l’OWASP Top 10 ?", "OWASP Top 10", "Liste des risques web majeurs (injection, auth, XSS…) mise à jour périodiquement.", ["OWASP"], "Base de culture sécu web.", ""],
  ["XSS", "XSS réfléchi, stocké, DOM : différences ?", "XSS", "Injection de script ; stocké en DB, réfléchi via URL, DOM via JS client.", ["XSS"], "Échapper/sanitizer + CSP.", ""],
  ["SQLi", "Injection SQL : mécanisme et parade ?", "SQL injection", "Input concaténé en requête ; parade : requêtes paramétrées.", ["SQLi"], "OR 1=1 classique.", ""],
  ["CSRF", "CSRF : principe et défenses ?", "CSRF", "Force le navigateur authentifié à exécuter une action ; tokens anti-CSRF, SameSite cookies.", ["CSRF", "SameSite"], "SameSite=Lax/Strict.", ""],
  ["Auth", "Stockage des mots de passe ?", "hash mots de passe", "Hash lent adaptatif (argon2/bcrypt) + salt ; jamais reversible.", ["argon2", "bcrypt"], "Coût élevé volontaire.", ""],
  ["Auth", "MFA / 2FA : intérêt ?", "MFA", "Ajoute un facteur (TOTP, WebAuthn) — réduit account takeover.", ["TOTP", "WebAuthn"], "Préférer WebAuthn/passkeys.", ""],
  ["Sessions", "Sécuriser les cookies de session ?", "cookies sécurisés", "HttpOnly, Secure, SameSite, durée courte, rotation.", ["HttpOnly", "Secure"], "Pas de token en localStorage si évitable.", ""],
  ["JWT", "Risques JWT courants ?", "risques JWT", "Alg none, secrets faibles, longue expiration, stockage XSS-exposé.", ["JWT"], "Validation iss/aud/exp stricte.", ""],
  ["Authz", "Authentification vs autorisation ?", "authn authz", "Authn = qui ; Authz = quoi autorisé (RBAC/ABAC).", ["RBAC", "ABAC"], "IDOR = authz cassée.", ""],
  ["IDOR", "Qu’est-ce qu’un IDOR/BOLA ?", "IDOR", "Accès à une ressource en changeant un ID sans contrôle d’ownership.", ["IDOR", "BOLA"], "Vérifier userId == resource.owner.", ""],
  ["CSP", "Content-Security-Policy ?", "CSP", "Header limitant sources de scripts/styles — mitige XSS.", ["CSP"], "default-src 'self'; script-src...", ""],
  ["Headers", "Headers de sécurité utiles ?", "security headers", "CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.", ["HSTS"], "helmet() en Express.", ""],
  ["HTTPS", "Man-in-the-middle et TLS ?", "TLS", "Chiffre le transport ; certificats, HSTS, pas de mixed content.", ["MITM", "TLS"], "HTTPS partout.", ""],
  ["CORS", "Mauvaise config CORS dangereuse ?", "CORS misconfig", "Origin * + credentials, refléter Origin sans allowlist.", ["CORS"], "Allowlist stricte.", ""],
  ["Upload", "Risques d’upload de fichiers ?", "upload sécurisé", "MIME spoofing, path traversal, XSS via SVG, tailles — valider, renommer, scanner.", ["path traversal"], "Stocker hors webroot.", ""],
  ["Secrets", "Gestion des secrets ?", "secrets management", "Vault/managers, env CI masqués, rotation, jamais en repo.", ["Vault"], "Scanner l’historique Git.", ""],
  ["Deps", "Sécurité des dépendances ?", "supply chain", "npm audit, lockfile, pin, SBOM, Dependabot, vérifier mainteneurs.", ["SBOM"], "Éviter packages obscurs.", ""],
  ["SSRF", "SSRF : qu’est-ce ?", "SSRF", "Serveur induit à requêter des URLs internes — metadata cloud.", ["SSRF"], "Allowlist destinations.", ""],
  ["XXE", "XXE sur parseurs XML ?", "XXE", "Entités externes malveillantes ; désactiver DTD externes.", ["XXE"], "Préférer JSON si possible.", ""],
  ["Deserial", "Désérialisation non sûre ?", "désérialisation", "Objets injectés exécutent du code — valider schémas, éviter pickle natif non fiable.", ["serialization"], "JSON + schema.", ""],
  ["Rate limit", "Brute force login : défenses ?", "brute force", "Rate limit, lockout progressif, captcha, MFA, alertes.", ["rate limit"], "429 sur /login.", ""],
  ["Logging", "Logs et données sensibles ?", "logs sécurité", "Pas de mots de passe/tokens/PII brute ; rétention et accès contrôlés.", ["PII"], "Masquer pan.", ""],
  ["Threat", "Threat modeling (STRIDE) ?", "threat modeling", "Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation.", ["STRIDE"], "Ateliers en design.", ""],
  ["Least privilege", "Principe du moindre privilège ?", "moindre privilège", "Comptes/tokens avec droits minimaux nécessaires.", ["least privilege"], "DB user sans DROP.", ""],
  ["Encryption", "Chiffrement at-rest vs in-transit ?", "chiffrement", "Transit = TLS ; repos = disques/colonnes (KMS).", ["KMS"], "Clés séparées par env.", ""],
  ["Hash vs encrypt", "Hash vs chiffrement ?", "hash vs encrypt", "Hash one-way ; chiffrement réversible avec clé.", ["hash", "encrypt"], "Password → hash ; IBAN → encrypt.", ""],
  ["OAuth", "PKCE dans OAuth ?", "PKCE", "Protège le code flow public clients (SPA/mobile) contre interception.", ["PKCE"], "Authorization code + PKCE.", ""],
  ["Clickjacking", "Clickjacking : parade ?", "clickjacking", "UI redress ; X-Frame-Options / frame-ancestors CSP.", ["frame-ancestors"], "DENY/SAMEORIGIN.", ""],
  ["API secu", "Mass assignment ?", "mass assignment", "Binder trop de champs user → escalation (isAdmin).", ["mass assignment"], "Allowlist DTO.", ""],
  ["Pentest", "Pentest vs bug bounty ?", "pentest", "Audit ponctuel expert vs programme continu récompenses.", ["pentest"], "Corriger avant retest.", ""],
  ["Secure SDLC", "Intégrer la sécu au cycle ?", "secure SDLC", "Threat model, SAST/DAST, reviews, deps, formation — shift-left.", ["SSDLC"], "Checklists PR sécurité.", ""],
  ["Privacy", "RGPD : points pour un dev ?", "RGPD", "Minimisation, base légale, droits, rétention, sécurité des traitements.", ["RGPD"], "Droit à l’effacement → soft/hard delete design.", ""],
  ["Passwords", "Politique de mots de passe moderne ?", "politique passwords", "Longueur > complexité absurde ; deny lists ; MFA ; pas de rotation forcée inutile.", ["NIST"], "Min 12+ chars.", ""],
  ["WAF", "WAF : rôle et limites ?", "WAF", "Filtre trafic HTTP courant ; pas un substitut au code sûr.", ["WAF"], "Complément defense-in-depth.", ""],
  ["Zero trust", "Zero Trust en une phrase ?", "zero trust", "Ne jamais faire confiance par défaut ; vérifier chaque accès.", ["zero trust"], "mTLS service-to-service.", ""],
  ["Secure headers cookies", "SameSite cookies et CSRF ?", "SameSite", "Strict/Lax réduisent CSRF cross-site ; attention flux légitimes.", ["SameSite"], "Lax souvent compromis UX/sécu.", ""],
  ["Input", "Validation vs sanitization ?", "validation sanitization", "Valider structure/contrats ; sanitizer selon contexte de sortie (HTML/URL).", ["validation"], "Whitelist > blacklist.", ""],
  ["Cloud secu", "IMDS et SSRF cloud ?", "IMDS", "Metadata 169.254.169.254 — cibler SSRF pour vol de rôles.", ["IMDS"], "IMDSv2 obligatoire AWS.", ""],
  ["Incident", "Réagir à un incident sécu ?", "incident response", "Contenir, éradiquer, communiquer, forensics, post-mortem, rotation secrets.", ["IR"], "Playbooks préparés.", ""],
  ["Dev secu", "Secrets en front : pourquoi jamais ?", "secrets front", "Tout code client est visible — clés privées seulement serveur.", ["API key"], "Clés publishable vs secret.", ""],
];

const secuSeeds = mapTopics(secuTopics, {
  prefix: "secu",
  categorie: "Sécurité",
  ressources: R("owasp", "mdnHttp", "webdev", "rfc9110"),
  technologies: ["OWASP", "TLS", "OAuth2", "CSP"],
  liens: ["API", "Web", "DevOps", "Cloud"],
  competences: ["Sécurité applicative", "OWASP", "Authn/Authz"],
});


// ═══════════════════════════════════════════════════════════
// 14. DevOps (~40)
// ═══════════════════════════════════════════════════════════
const devopsTopics = [
  ["CI/CD", "Qu’est-ce que CI/CD ?", "CI/CD", "Intégration continue (build/test auto) et livraison/déploiement continus vers des environnements.", ["CI", "CD"], "Pipeline GitHub Actions sur PR.", ""],
  ["CI/CD", "Étapes typiques d’un pipeline ?", "pipeline CI", "checkout → deps → lint → test → build → scan → deploy.", ["pipeline"], "Fail fast sur lint.", ""],
  ["Docker", "Image vs conteneur ?", "Docker image conteneur", "Image = snapshot immuable ; conteneur = instance en exécution.", ["image", "container"], "docker run nginx", ""],
  ["Docker", "Dockerfile multi-stage : intérêt ?", "multi-stage build", "Compile dans une étape, image finale minimale sans toolchains.", ["multi-stage"], "FROM node AS build ... FROM node:alpine", ""],
  ["Docker", "Bonnes pratiques Dockerfile ?", "Dockerfile best practices", "Couches cache, USER non-root, .dockerignore, pins versions, healthcheck.", ["non-root"], "COPY package*.json avant code.", ""],
  ["Compose", "docker-compose usages ?", "docker-compose", "Orchestre multi-services locaux (app, db, redis) via YAML.", ["compose"], "services: db: image: postgres", ""],
  ["K8s", "Kubernetes en une phrase ?", "Kubernetes", "Orchestrateur de conteneurs : scheduling, self-heal, scaling, service discovery.", ["Pod", "Deployment"], "kubectl get pods", ""],
  ["K8s", "Pod, Deployment, Service ?", "objets K8s", "Pod unit ; Deployment réplique ; Service expose un set de pods.", ["Service"], "ClusterIP / Ingress.", ""],
  ["IaC", "Infrastructure as Code ?", "IaC", "Infra versionnée (Terraform, Pulumi, CloudFormation) — reproductible.", ["Terraform"], "plan/apply en CI.", ""],
  ["IaC", "Idempotence IaC ?", "idempotence IaC", "Réappliquer converge vers l’état désiré sans drift manuel.", ["state"], "State Terraform backend distant.", ""],
  ["Env", "dev/staging/prod : différences ?", "environnements", "Isolation données, secrets, scale, approvals prod.", ["staging"], "Prod : change management.", ""],
  ["Config", "Config vs secrets en deploy ?", "config deploy", "Config non secrète versionnable ; secrets via vault/CI masked.", ["secrets"], "Pas de .env prod en image.", ""],
  ["Rollback", "Stratégies de rollback ?", "rollback", "Re-déployer version N-1, feature flags off, DB migrations backward-compatible.", ["rollback"], "Blue-green swap reverse.", ""],
  ["Deploy", "Blue/green et canary ?", "blue-green canary", "Blue/green deux envs ; canary expose % trafic progressivement.", ["canary"], "Observer error rate avant 100%.", ""],
  ["Monitor", "Monitoring vs logging vs tracing ?", "observabilité DevOps", "Metrics agrégées, logs événements, traces requêtes distribuées.", ["Prometheus", "Grafana"], "Alertes sur SLO.", ""],
  ["SLO", "SLA/SLO/SLI ?", "SLO", "SLI mesure ; SLO cible ; SLA engagement contractuel.", ["SLI", "SLO"], "Disponibilité 99.9%.", ""],
  ["Alerting", "Bonnes alertes ?", "alerting", "Actionnables, peu de bruit, runbooks, severity claire.", ["PagerDuty"], "Alerter symptômes user-facing.", ""],
  ["GitOps", "GitOps : idée ?", "GitOps", "Git source de vérité ; agents (Argo CD) réconcilient le cluster.", ["Argo CD"], "PR pour changer prod.", ""],
  ["Artifacts", "Registry d’images ?", "container registry", "Stocke images versionnées (GHCR, ECR, Docker Hub) scannées.", ["GHCR"], "Tags immuables sha-...", ""],
  ["Versioning", "Tagging images et releases ?", "versioning deploy", "Semver + git sha ; éviter latest en prod.", ["semver"], "app:1.4.2 / app:sha-abc", ""],
  ["Nginx", "Nginx reverse proxy rôles ?", "nginx", "TLS termination, routing, static, rate limit, gzip.", ["reverse proxy"], "proxy_pass http://app:3000", ""],
  ["Caching CDN", "CDN en DevOps ?", "CDN", "Cache edge assets, DDoS mitigation, perf globale.", ["CDN"], "Cache-Control long sur hashed assets.", ""],
  ["Backup", "Backup et disaster recovery ?", "DR", "RPO/RTO définis, backups testés, multi-AZ/region selon besoin.", ["RPO", "RTO"], "Restore drill trimestriel.", ""],
  ["Security DevOps", "DevSecOps : exemples ?", "DevSecOps", "Scans SAST/deps/images dans pipeline, policies admission.", ["Trivy"], "Bloquer CVE critiques.", ""],
  ["Containers secu", "Sécurité conteneurs ?", "sécurité conteneurs", "Images minimales, non-root, read-only FS, network policies, secrets.", ["distroless"], "Scan Trivy/Grype.", ""],
  ["Scaling", "Autoscaling ?", "autoscaling", "HPA sur CPU/custom metrics ; scale to zero serverless.", ["HPA"], "Attention cold starts.", ""],
  ["Network", "Service mesh (aperçu) ?", "service mesh", "mTLS, retries, observability entre services (Istio/Linkerd).", ["mTLS"], "Complexité à justifier.", ""],
  ["Release", "Feature flags opérationnels ?", "flags ops", "Kill switch incident, progressive delivery.", ["flags"], "Découpler deploy/release.", ""],
  ["Infra", "Immutable infrastructure ?", "infra immuable", "Recréer plutôt que patcher snowflakes — images AMI/containers.", ["immutable"], "Cattle not pets.", ""],
  ["Cost", "FinOps bases ?", "FinOps", "Visibilité coûts cloud, rightsizing, budgets, tags.", ["FinOps"], "Éteindre envs hors heures.", ""],
  ["Docs ops", "Runbooks ?", "runbooks", "Procédures incident pas-à-pas liées aux alertes.", ["runbook"], "Lien dans l’alerte Slack.", ""],
  ["Local", "Parité local/prod ?", "parité env", "Même images majeures, seeds, docker-compose proches — 12-factor.", ["parity"], "Éviter « ça marche chez moi ».", ""],
  ["Actions", "GitHub Actions : concepts ?", "GitHub Actions", "Workflows YAML, jobs, runners, secrets, matrices, OIDC cloud.", ["Actions"], "permissions: contents:read", ""],
  ["Quality gates", "Quality gate CI ?", "quality gate", "Seuils coverage, lint, sécu — bloquent merge.", ["gate"], "Sonar quality gate.", ""],
  ["Blueprints", "Environnement éphémère PR ?", "preview envs", "Déploiements preview par PR (Vercel, namespaces K8s).", ["preview"], "URL commentaire bot.", ""],
  ["DB deploy", "Migrations en CD ?", "migrations CD", "Expand/contract, backward compatible, jobs migrate avant app.", ["expand contract"], "Ne pas casser old app pendant rolling.", ""],
  ["Health", "Healthchecks liveness/readiness ?", "healthchecks", "Liveness redémarre ; readiness retire du trafic si non prêt.", ["readiness"], "/healthz /readyz", ""],
  ["Chaos", "Chaos engineering ?", "chaos engineering", "Injecter pannes contrôlées pour valider résilience.", ["chaos"], "Tuer un pod au hasard.", ""],
  ["Compliance", "Auditabilité des déploiements ?", "audit deploy", "Qui/quand/quoi via Git + CI logs + approvals.", ["audit"], "Traçabilité SOC2.", ""],
  ["Toolchain", "Choix d’outils DevOps ?", "toolchain DevOps", "Standardiser peu d’outils, documenter, automatiser toil.", ["toil"], "Éviter 10 CI différentes.", ""],
];

const devopsSeeds = mapTopics(devopsTopics, {
  prefix: "devops",
  categorie: "DevOps",
  ressources: R("docker", "github", "nginx", "aws", "webdev"),
  technologies: ["Docker", "CI/CD", "Kubernetes", "Nginx"],
  liens: ["Cloud", "Linux", "Sécurité", "Git"],
  competences: ["CI/CD", "Conteneurisation", "Déploiement"],
});

// ═══════════════════════════════════════════════════════════
// 15. Linux (~35)
// ═══════════════════════════════════════════════════════════
const linuxTopics = [
  ["Bases", "Qu’est-ce qu’un shell Linux ?", "shell Linux", "Interface textuelle (bash/zsh) pour piloter le système et scripter.", ["bash"], "ls, cd, grep pipeline.", ""],
  ["FS", "Arborescence / etc /var /home ?", "filesystem Linux", "FHS : configs /etc, variables /var, users /home, bins /usr.", ["FHS"], "/var/log pour logs.", ""],
  ["Nav", "pwd, cd, ls options utiles ?", "navigation", "Se repérer et lister ; ls -la, cd -, pushd.", ["ls", "cd"], "ls -lah", ""],
  ["Fichiers", "cp, mv, rm, mkdir, touch ?", "gestion fichiers", "Opérations basiques ; rm -r prudent ; trash préférable parfois.", ["rm"], "rm -i fichier", ""],
  ["Permissions", "rwx et chmod/chown ?", "permissions Unix", "Lecture/écriture/exécution owner/group/other ; bits numériques 755.", ["chmod", "chown"], "chmod 600 .env", ""],
  ["Permissions", "umask et sticky bit (aperçu) ?", "umask sticky", "umask masque droits défaut ; sticky /tmp empêche suppressions croisées.", ["umask"], "umask 027", ""],
  ["Process", "ps, top, htop, kill ?", "processus Linux", "Lister/moniteur ; kill/SIGTERM puis SIGKILL ; nice priorités.", ["SIGTERM"], "kill -15 PID", ""],
  ["Process", "foreground/background et jobs ?", "jobs shell", "& bg fg Ctrl-Z pour gérer tâches shell.", ["bg", "fg"], "npm run dev &", ""],
  ["Pipes", "pipes et redirections ?", "pipes redirections", "| enchaîne stdout→stdin ; >, >>, 2> gèrent sorties.", ["pipe"], "ps aux | grep node", ""],
  ["Find", "find et grep essentiels ?", "find grep", "Recherche fichiers/contenu ; ripgrep plus rapide souvent.", ["grep", "find"], "grep -R \"TODO\" src", ""],
  ["SSH", "SSH clés et config ?", "SSH", "Auth par clés, agent, ~/.ssh/config Host aliases, désactiver password si possible.", ["ssh-keygen"], "ssh-keygen -t ed25519", ""],
  ["SSH", "scp et rsync ?", "scp rsync", "Transfert fichiers ; rsync incrémental/delta efficace.", ["rsync"], "rsync -avz ./dist/ user@host:/var/www", ""],
  ["Packages", "apt / dnf / pacman (concepts) ?", "gestionnaires paquets", "Installer/mettre à jour logiciels système selon distro.", ["apt"], "sudo apt update && apt install nginx", ""],
  ["Services", "systemd systemctl ?", "systemd", "Gère services : start/enable/status/logs journalctl.", ["systemctl"], "sudo systemctl restart nginx", ""],
  ["Logs", "journalctl et /var/log ?", "logs Linux", "Consulter logs service/système pour diagnostiquer.", ["journalctl"], "journalctl -u api -f", ""],
  ["Network", "ss, curl, dig ?", "réseau Linux", "Ports écoutés, requêtes HTTP, DNS — debug connectivité.", ["ss", "curl"], "ss -tlnp ; curl -I https://...", ""],
  ["Network", "firewall ufw/iptables (aperçu) ?", "firewall", "Filtrer ports ; ouvrir 80/443 seulement si besoin.", ["ufw"], "sudo ufw allow 22", ""],
  ["Disk", "df, du, free ?", "ressources disque mémoire", "Espace disque et RAM/swap pour diagnostiquer saturation.", ["df", "du"], "du -sh * | sort -h", ""],
  ["Users", "users, groups, sudo ?", "users Linux", "Comptes, groupes, sudoers moindre privilège.", ["sudo"], "Éviter de tout faire en root.", ""],
  ["Env", "variables d’environnement shell ?", "env shell", "export, .bashrc/.profile, PATH — config session.", ["PATH"], "export NODE_ENV=production", ""],
  ["Scripts", "Bash scripting bases ?", "bash script", "Shebang, set -euo pipefail, quotes, fonctions.", ["bash"], "#!/usr/bin/env bash", ""],
  ["Cron", "cron et timers systemd ?", "cron", "Planifie tâches récurrentes ; logs et chemins absolus.", ["crontab"], "0 3 * * * /usr/local/bin/backup.sh", ""],
  ["Archive", "tar gzip xz ?", "archives", "Empqueter/compresser pour backups et livrables.", ["tar"], "tar -czf app.tgz dist", ""],
  ["Links", "symlink vs hard link ?", "liens Linux", "symlink pointe chemin ; hard link même inode.", ["ln -s"], "ln -s /opt/app/current current", ""],
  ["Proc", "/proc et /sys ?", "procfs", "Interfaces noyau pour process et hardware.", ["/proc"], "cat /proc/cpuinfo", ""],
  ["Perf", "strace / lsof (aperçu) ?", "strace lsof", "Tracer syscalls et fichiers/ports ouverts — debug avancé.", ["lsof"], "lsof -i :3000", ""],
  ["Security", "Fail2ban / mises à jour sécu ?", "sécu Linux", "Patcher régulièrement, SSH durci, least privilege.", ["unattended-upgrades"], "Désactiver root SSH password.", ""],
  ["Containers", "Linux namespaces/cgroups idée ?", "namespaces cgroups", "Isolation processus/ressources — base des conteneurs.", ["cgroups"], "docker s’appuie dessus.", ""],
  ["Text", "awk/sed usages courants ?", "awk sed", "Traitement texte streams pour ops/rapports.", ["awk"], "awk '{print $1}' access.log", ""],
  ["Editor", "vim/nano bases pour serveur ?", "éditeurs serveur", "Éditer configs hors IDE — savoir sauver/quitter vim.", ["vim"], ":wq", ""],
  ["Locale", "timezone et NTP ?", "time Linux", "Horloge sync (chrony) critique logs/TLS/cron.", ["NTP"], "timedatectl status", ""],
  ["Shell tips", "xargs et parallelisation ?", "xargs", "Passe stdout en arguments de commandes.", ["xargs"], "find . -name '*.log' | xargs rm", ""],
  ["Monitoring", "load average interprétation ?", "load average", "Charge files d’attente CPU ; comparer au nombre de cœurs.", ["loadavg"], "uptime", ""],
  ["Permissions ACL", "ACL Linux (aperçu) ?", "ACL", "Droits fins au-delà owner/group classique.", ["setfacl"], "Cas partages multi-équipes.", ""],
  ["Distros", "Choisir une distro serveur ?", "distributions", "LTS (Ubuntu/Debian), écosystème, support, surface de paquets.", ["LTS"], "Ubuntu LTS courant en prod web.", ""],
];

const linuxSeeds = mapTopics(linuxTopics, {
  prefix: "linux",
  categorie: "Linux",
  ressources: R("linuxman", "docker", "nginx"),
  technologies: ["Linux", "Bash", "SSH", "systemd"],
  liens: ["DevOps", "Cloud", "Sécurité"],
  competences: ["Administration Linux", "Shell", "Diagnostic"],
});

// ═══════════════════════════════════════════════════════════
// 16. Cloud (~30)
// ═══════════════════════════════════════════════════════════
const cloudTopics = [
  ["Bases", "IaaS vs PaaS vs SaaS ?", "IaaS PaaS SaaS", "Responsabilités croissantes du cloud provider : infra → plateforme → logiciel.", ["IaaS", "PaaS"], "EC2 vs Heroku/Vercel vs Gmail.", ""],
  ["Bases", "Régions et zones de disponibilité ?", "régions AZ", "Régions géographiques ; AZ isolées pour HA multi-AZ.", ["AZ", "HA"], "Déployer multi-AZ DB.", ""],
  ["AWS", "Services AWS courants pour un CDA ?", "AWS essentials", "EC2, S3, RDS, Lambda, CloudFront, IAM, VPC.", ["S3", "IAM"], "Static site S3+CloudFront.", ""],
  ["AWS", "IAM : principe ?", "IAM", "Identités et permissions least privilege ; rôles vs users ; MFA root.", ["IAM", "role"], "Jamais access key dans le code.", ""],
  ["Azure", "Équivalents Azure courants ?", "Azure essentials", "App Service, Blob, Azure SQL, Functions, AAD/Entra ID.", ["App Service"], "Comparable à AWS selon poste.", ""],
  ["GCP", "Équivalents GCP ?", "GCP essentials", "GCE, GCS, Cloud Run, GKE, IAM.", ["Cloud Run"], "Cloud Run pour conteneurs managés.", ""],
  ["Serverless", "Serverless : pour/contre ?", "serverless", "Scale auto, pay-per-use ; cold start, vendor lock, limites durée.", ["Lambda"], "Webhooks et jobs courts.", ""],
  ["Storage", "Object storage vs block vs file ?", "stockage cloud", "Object (S3) objets HTTP ; block disques VM ; file NFS partagé.", ["S3"], "Médias → object storage.", ""],
  ["CDN", "CDN cloud ?", "CDN cloud", "Cache edge + TLS + WAF options (CloudFront, Cloudflare).", ["Cloudflare"], "Réduire latence assets.", ""],
  ["DB cloud", "RDS / managed DB intérêts ?", "managed DB", "Backups, patching, multi-AZ — vs self-managed coût ops.", ["RDS"], "Attention vendor engines/versions.", ""],
  ["Network", "VPC, subnets, security groups ?", "VPC", "Réseau privé isolé ; SG firewall stateful instances.", ["VPC", "SG"], "DB en subnet privée.", ""],
  ["Load balancers", "LB applicatif vs réseau ?", "load balancer", "L7 HTTP features vs L4 TCP — healthchecks, TLS.", ["ALB"], "ALB path-based routing.", ""],
  ["HA", "Haute disponibilité cloud ?", "HA cloud", "Multi-AZ, autoscaling, healthchecks, RPO/RTO.", ["multi-AZ"], "Pas de SPOF bastion unique.", ""],
  ["DR", "Backup cross-region ?", "DR cloud", "Réplication/backups autre région pour sinistre régional.", ["cross-region"], "Coût vs risque métier.", ""],
  ["Cost", "Pièges de coûts cloud ?", "coûts cloud", "Egress, idle resources, storage forgotten, NAT gateway.", ["egress"], "Budgets + alertes + tags.", ""],
  ["Security", "Shared responsibility model ?", "responsabilité partagée", "Provider sécu infra ; client sécu données/config/IAM.", ["shared responsibility"], "S3 public accidentel = faute client.", ""],
  ["Identity", "Federation SSO cloud ?", "SSO cloud", "SAML/OIDC entreprise vers cloud IAM.", ["OIDC"], "GitHub Actions OIDC → AWS role.", ""],
  ["Containers cloud", "ECS/EKS/Cloud Run trade-offs ?", "containers cloud", "Managé plus simple (Cloud Run) vs contrôle K8s (EKS) coût ops.", ["EKS", "Cloud Run"], "Choisir selon équipe.", ""],
  ["IaC cloud", "Terraform multi-cloud ?", "Terraform cloud", "Providers ; state distant ; workspaces envs.", ["Terraform"], "Modules réutilisables.", ""],
  ["Observability", "Monitoring cloud natif ?", "monitoring cloud", "CloudWatch, Azure Monitor, Stackdriver — + outils tiers.", ["CloudWatch"], "Alarmes billing + errors.", ""],
  ["Edge", "Edge computing / Workers ?", "edge compute", "Exécuter proche utilisateur (Cloudflare Workers, Lambda@Edge).", ["Workers"], "A/B, auth edge, rewrite.", ""],
  ["Storage secu", "Chiffrement S3/Blob ?", "chiffrement objet", "SSE, KMS CMK, bucket policies, block public access.", ["KMS"], "Block Public Access ON.", ""],
  ["Messaging", "SQS/PubSub usages ?", "messaging cloud", "Découpler producers/consumers, buffer pics.", ["SQS"], "Email async après signup.", ""],
  ["API cloud", "API Gateway cloud ?", "API Gateway cloud", "Auth, throttling, routing vers Lambda/services.", ["API Gateway"], "API key + usage plans.", ""],
  ["Multicloud", "Multi-cloud : réel besoin ?", "multi-cloud", "Souvent complexité > bénéfice ; sortir de lock-in ciblé parfois.", ["lock-in"], "Abstraction portable quand justifiée.", ""],
  ["Landing", "Well-Architected / CAF ?", "Well-Architected", "Frameworks bonnes pratiques (sécu, fiabilité, perf, coût, ops).", ["Well-Architected"], "Reviews périodiques.", ""],
  ["Deploy", "Vercel/Netlify vs cloud « full » ?", "PaaS front", "DX excellente front/JAMstack ; backends complexes → cloud généraliste.", ["Vercel"], "Preview PR natifs.", ""],
  ["Data", "Data lakes vs warehouses (aperçu) ?", "data lake warehouse", "Lake brut ; warehouse analytique structuré (BigQuery/Snowflake).", ["BigQuery"], "ELT moderne.", ""],
  ["Compliance", "Régions et souveraineté ?", "souveraineté données", "Choisir régions, certifications, RGPD transferts.", ["RGPD"], "EU-only data residency.", ""],
  ["Career", "Compétences cloud attendues CDA ?", "compétences cloud CDA", "Déployer, IAM basique, Docker, CI, comprendre coûts/sécu — pas forcément architecte.", ["cloud fundamentals"], "Certification Cloud Practitioner utile.", ""],
];

const cloudSeeds = mapTopics(cloudTopics, {
  prefix: "cloud",
  categorie: "Cloud",
  ressources: R("aws", "azure", "gcp", "cloudflare", "vercel", "mslearn"),
  technologies: ["AWS", "Azure", "GCP", "Docker"],
  liens: ["DevOps", "Sécurité", "Architecture Logicielle"],
  competences: ["Cloud fundamentals", "Déploiement cloud", "IAM"],
});


// ═══════════════════════════════════════════════════════════
// 17. IA (~40)
// ═══════════════════════════════════════════════════════════
const iaTopics = [
  ["Bases", "Qu’est-ce qu’un LLM ?", "LLM", "Modèle de langage de grande taille pré-entraîné à prédire le prochain token — utile texte, code, raisonnement limité.", ["token", "prédiction"], "GPT, Claude, Gemini, Llama.", ""],
  ["Bases", "IA générative vs IA classique ML ?", "IA générative", "Générative crée contenu ; ML classique prédit/classe souvent sur features tabulaires.", ["ML", "génératif"], "Régression churn vs génération README.", ""],
  ["Prompt", "Qu’est-ce que le prompt engineering ?", "prompt engineering", "Concevoir instructions claires, contexte, formats, exemples pour guider le modèle.", ["prompt", "few-shot"], "Spécifier rôle, contraintes, format JSON.", ""],
  ["Prompt", "Techniques : few-shot, CoT, rôles ?", "techniques prompt", "Exemples few-shot, chaîne de pensée, system prompts de rôle/contraintes.", ["CoT", "system prompt"], "« Réfléchis étape par étape puis réponds ».", ""],
  ["Prompt", "Hallucinations : comment mitiger ?", "hallucinations", "Modèles inventent ; mitigations : RAG, citations, température basse, validation humaine/outils.", ["hallucination", "RAG"], "Exiger sources ou « je ne sais pas ».", ""],
  ["RAG", "Qu’est-ce que le RAG ?", "RAG", "Retrieval-Augmented Generation : récupère des documents puis conditionne la génération.", ["retrieval", "embeddings"], "Base fiches entretien → réponses sourcées.", ""],
  ["RAG", "Embeddings et similarité ?", "embeddings", "Vecteurs sémantiques ; recherche cosine/ANN (FAISS, pgvector).", ["embedding", "cosine"], "Chunking documents + metadata filters.", ""],
  ["RAG", "Chunking : bonnes pratiques ?", "chunking", "Tailles adaptées, overlap, respecter structure (titres), métadonnées source.", ["chunk", "overlap"], "Éviter chunks trop gros/bruyants.", ""],
  ["Agents", "Agent LLM vs chatbot simple ?", "agents LLM", "Agents planifient, appellent outils (tools/functions), itèrent vers un but.", ["tools", "agent"], "ReAct : reason + act.", ""],
  ["Agents", "Function calling / tool use ?", "function calling", "Le modèle choisit d’appeler des fonctions JSON schema pour actions déterministes.", ["tools", "schema"], "getWeather({city})", ""],
  ["Fine-tune", "Fine-tuning vs prompt/RAG ?", "fine-tuning", "Adapter poids pour style/tâche stable ; RAG pour connaissances changeantes — coût/complexité.", ["fine-tune"], "Pas fine-tuner pour FAQ volatile.", ""],
  ["Eval", "Comment évaluer une app LLM ?", "évaluation LLM", "Jeux de golden answers, LLM-as-judge, métriques retrieval, feedback users.", ["eval", "golden set"], "Régression prompts en CI.", ""],
  ["Safety", "Risques sécu des LLM apps ?", "sécurité LLM", "Prompt injection, data leakage, exfiltration outils, jailbreaks.", ["prompt injection"], "Séparer trusted/untrusted content.", ""],
  ["Safety", "Prompt injection : exemple ?", "prompt injection", "Contenu malveillant détourne instructions (« ignore previous… »).", ["injection"], "Ne jamais exécuter outils sur texte non fiable sans garde.", ""],
  ["Privacy", "Données sensibles et LLM ?", "privacy LLM", "Minimiser PII, anonymiser, politiques retention, options enterprise no-training.", ["PII"], "Pas coller de secrets dans ChatGPT public.", ""],
  ["Cost", "Coûts tokens et optimisation ?", "coût tokens", "Compter input/output ; cache, résumés, modèles plus petits, batch.", ["tokens"], "Router requêtes simples → modèle cheap.", ""],
  ["Latency", "Réduire latence LLM ?", "latence LLM", "Streaming, modèles plus petits, speculative, moins de contexte, edge.", ["streaming"], "UX tokens progressifs.", ""],
  ["Local", "Modèles locaux (Ollama) : intérêts ?", "LLM locaux", "Confidentialité, offline, coût fixe GPU — qualité/perf variables.", ["Ollama"], "Prototyper sans envoyer data.", ""],
  ["LangChain", "Rôle de LangChain/LlamaIndex ?", "LangChain", "Orchestration chains/RAG/agents — attention abstractions et dette.", ["LangChain"], "Parfois fetch+prompt suffit.", ""],
  ["Vector DB", "Bases vectorielles courantes ?", "vector database", "pgvector, Pinecone, Weaviate, Chroma — ANN search.", ["pgvector"], "Choisir selon ops existantes.", ""],
  ["Multimodal", "Modèles multimodaux ?", "multimodal", "Texte+image/audio (vision) pour UI, docs scannées, accessibilité.", ["vision"], "Décrire une maquette Figma.", ""],
  ["Code AI", "Copilot/Cursor : bonnes pratiques ?", "AI coding assistants", "Revue humaine, petits diffs, tests, ne pas merger code non compris.", ["Copilot", "Cursor"], "Générer tests + vérifier.", ""],
  ["Code AI", "Limites du code généré par IA ?", "limites codegen", "Bugs subtils, API inventées, sécu, licences — validation obligatoire.", ["hallucinated API"], "Exécuter et tester toujours.", ""],
  ["MLOps", "Déployer un modèle : idées ?", "MLOps", "Versioning modèle/data, monitoring drift, pipelines, feature stores.", ["drift"], "Re-train triggers.", ""],
  ["Classic ML", "Train/test split et overfitting ?", "overfitting", "Modèle mémorise train ; régularisation, validation, données plus propres.", ["overfitting"], "Courbes train/val.", ""],
  ["Classic ML", "Classification vs régression ?", "classification régression", "Classe discrète vs valeur continue — métriques différentes (F1 vs RMSE).", ["F1", "RMSE"], "Spam = classification.", ""],
  ["Ethics", "Biais des modèles ?", "biais IA", "Données biaisées → outputs discriminatoires ; audits, diversité data, human oversight.", ["biais"], "Tester cas limites démographiques.", ""],
  ["Product", "Quand NE PAS utiliser un LLM ?", "limites produit LLM", "Calculs exacts, règles dures légales sans vérif, besoins déterministes stricts.", ["déterministe"], "Prefer code pour TVA.", ""],
  ["Architecture", "Pattern : LLM + tools + DB ?", "archi LLM app", "UI → orchestrateur → retrieval/tools → LLM → validation → réponse.", ["orchestrateur"], "Guardrails post-génération.", ""],
  ["JSON", "Forcer une sortie structurée ?", "structured output", "JSON schema, constrained decoding, parsers + retry.", ["JSON schema"], "Valider avec zod avant usage.", ""],
  ["Temperature", "Température et top_p ?", "température sampling", "Température haute = plus aléatoire ; basse = plus déterministe.", ["temperature"], "0–0.3 pour extraction.", ""],
  ["Context", "Fenêtre de contexte : impacts ?", "context window", "Plus de contexte = coût/latence ; trop = dilution (« lost in the middle »).", ["context window"], "Résumer + retrieve ciblé.", ""],
  ["Embeddings model", "Choisir un modèle d’embedding ?", "choix embedding", "Langue, dimension, coût, MTEB ; cohérence index/query même modèle.", ["MTEB"], "Ne pas mixer modèles d’embed.", ""],
  ["Hybrid search", "Recherche hybride BM25 + vecteurs ?", "hybrid search", "Combine lexical et sémantique pour meilleurs hits RAG.", ["BM25"], "Rerank cross-encoder.", ""],
  ["Rerank", "Reranking dans RAG ?", "reranking", "Reclasse les top-k retrieval pour précision avant génération.", ["rerank"], "Cross-encoder sur 20 docs.", ""],
  ["Observability", "Tracer une app LLM ?", "observabilité LLM", "Prompts, latence, tokens, feedback, traces LangSmith/OpenTelemetry.", ["tracing"], "A/B prompts.", ""],
  ["Regulation", "AI Act / conformité (aperçu) ?", "régulation IA", "Cadres émergents selon risque ; transparence, oversight humain.", ["AI Act"], "Doc risques pour RH/scoring.", ""],
  ["Voice", "STT/TTS dans produits ?", "STT TTS", "Speech-to-text / text-to-speech pour UX vocales ; latence et accents.", ["Whisper"], "Accessibilité vocale.", ""],
  ["Diffusion", "Images génératives (diffusion) aperçu ?", "diffusion models", "Génèrent images via débruitage ; prompts + contrôles (ControlNet).", ["diffusion"], "Assets marketing / maquettes.", ""],
  ["Career", "Compétences IA utiles pour un CDA ?", "IA pour CDA", "Intégrer APIs LLM, RAG simple, evals, sécu/prompt injection, DX assistants.", ["API LLM"], "Projet portfolio chatbot RAG.", ""],
];

const iaSeeds = mapTopics(iaTopics, {
  prefix: "ia",
  categorie: "IA",
  ressources: R("openai", "anthropic", "googleai", "langchain", "ollama", "cursor", "copilot"),
  technologies: ["LLM", "RAG", "Embeddings", "Python/JS"],
  liens: ["API", "Sécurité", "Architecture Logicielle"],
  competences: ["IA générative", "RAG", "Prompt engineering"],
});

// ═══════════════════════════════════════════════════════════
// 18. UX/UI (~25)
// ═══════════════════════════════════════════════════════════
const uxTopics = [
  ["Bases", "Différence UX et UI ?", "UX vs UI", "UX = expérience globale (recherche, parcours, utilité) ; UI = interface visuelle interactive.", ["UX", "UI"], "Bon UI n’excuse pas un parcours UX cassé.", ""],
  ["Bases", "Qu’est-ce qu’un persona ?", "persona", "Archétype d’utilisateur basé sur recherche pour guider décisions produit.", ["persona"], "Éviter personas fictifs sans data.", ""],
  ["Research", "Tests utilisateurs : pourquoi ?", "tests utilisateurs", "Observer de vrais users révèle frictions non vues par l’équipe.", ["usability test"], "5 users détectent beaucoup de problèmes.", ""],
  ["Research", "Interview utilisateur vs sondage ?", "recherche UX", "Interviews = profondeur qualitative ; sondages = largeur quantitative.", ["qualitatif"], "Trianguler méthodes.", ""],
  ["Heuristics", "Heuristiques de Nielsen (exemples) ?", "heuristiques Nielsen", "Feedback système, cohérence, prévention d’erreurs, reconnaissance>rappel…", ["Nielsen"], "Undo, messages clairs.", ""],
  ["Design", "Design system : intérêts ?", "design system", "Cohérence, vitesse, accessibilité partagée, tokens et composants.", ["design tokens"], "Storybook + Figma library.", ""],
  ["Figma", "Rôle de Figma pour un dev ?", "Figma", "Specs, auto-layout, tokens, handoff, inspection CSS approximatif.", ["Figma"], "Vérifier spacing/states.", ""],
  ["A11y", "Accessibilité comme critère UX ?", "a11y UX", "Inclure dès wireframes : focus, contrastes, alternatives, clavier.", ["WCAG"], "Pas un « layer » final.", ""],
  ["Responsive", "Mobile-first UX ?", "mobile-first UX", "Prioriser contenus/actions clés sur petit écran puis enrichir.", ["mobile-first"], "Thumb zone CTAs.", ""],
  ["Forms", "UX des formulaires ?", "UX formulaires", "Labels visibles, erreurs inline, progression, autocomplete, minimiser champs.", ["inline errors"], "Valider au blur/submit.", ""],
  ["Feedback", "Feedback et états UI ?", "états UI", "Loading, empty, error, success — jamais écran blanc silencieux.", ["empty state"], "Skeleton loaders.", ""],
  ["Perf UX", "Performance perçue ?", "performance perçue", "Skeletons, optimistic UI, progressive rendering améliorent sentiment de vitesse.", ["optimistic UI"], "Like immédiat + rollback.", ""],
  ["IA UX", "UX des produits IA ?", "UX IA", "Sources, incertitude, undo, contrôles humains, éviter boîte noire totale.", ["human in the loop"], "Bouton « utile/pas utile ».", ""],
  ["Visual", "Hiérarchie visuelle ?", "hiérarchie visuelle", "Taille, poids, contraste, espace guident l’œil vers l’action principale.", ["visual hierarchy"], "Un CTA primaire dominant.", ""],
  ["Color", "Couleur et accessibilité ?", "couleur a11y", "Ne pas informer par la couleur seule ; contrastes WCAG.", ["contrast"], "Erreur = icône + texte + couleur.", ""],
  ["Typography", "Typographie UI web ?", "typo UI", "Échelle, line-height, longueur de ligne, fonts système/variable.", ["type scale"], "max-width 65ch corps.", ""],
  ["Nav", "Navigation claire ?", "navigation UX", "Info architecture simple, labels familiers, breadcrumb, search si large.", ["IA information"], "Card sorting.", ""],
  ["Onboarding", "Onboarding produit ?", "onboarding", "Valeur rapide, progressive disclosure, skippable tours.", ["activation"], "Empty state avec CTA setup.", ""],
  ["Metrics", "Mesurer UX ?", "métriques UX", "Task success, SUS, NPS critique, analytics funnels, heatmaps prudents.", ["funnel"], "Drop-off checkout.", ""],
  ["Atomic", "Atomic design aperçu ?", "atomic design", "Atoms→molecules→organisms→templates→pages pour UI scalable.", ["atomic design"], "Button atom → form molecule.", ""],
  ["Dark patterns", "Dark patterns : éthique ?", "dark patterns", "UI trompeuse (confirmshaming, hidden costs) — à éviter légalement/éthiquement.", ["éthique"], "Consentement cookies clair.", ""],
  ["Motion", "Motion design utile ?", "motion UX", "Feedback et continuité spatiale ; respecter reduced-motion.", ["reduced-motion"], "Transitions 150–300ms.", ""],
  ["Handoff", "Collaboration design-dev ?", "handoff", "Tokens partagés, states (hover/disabled), reviews ensemble, questions tôt.", ["handoff"], " co-design critiques.", ""],
  ["Wireframe", "Wireframe vs mockup vs prototype ?", "wireframe mockup", "Structure basse fidélité → UI visuelle → interactif testable.", ["prototype"], "Prototype Figma cliquable.", ""],
  ["Content", "UX writing ?", "UX writing", "Microcopy claire, verbes d’action, erreurs aidantes, ton cohérent.", ["microcopy"], "« Mot de passe incorrect » + lien reset.", ""],
];

const uxSeeds = mapTopics(uxTopics, {
  prefix: "ux",
  categorie: "UX/UI",
  ressources: R("figma", "mdnA11y", "webdev", "w3c"),
  technologies: ["Figma", "Design System", "HTML/CSS", "Accessibilité"],
  liens: ["Accessibilité", "CSS", "React", "Gestion de projet"],
  competences: ["UX fundamentals", "UI", "Accessibilité"],
});

// ═══════════════════════════════════════════════════════════
// 19. Gestion de projet (~30)
// ═══════════════════════════════════════════════════════════
const gpTopics = [
  ["Agile", "Qu’est-ce qu’Agile ?", "Agile", "Valeurs/principes de livraison itérative, feedback, adaptation au changement.", ["Agile Manifesto"], "Individus > process lourds.", ""],
  ["Scrum", "Rôles Scrum ?", "rôles Scrum", "Product Owner, Scrum Master, Developers — responsabilités distinctes.", ["PO", "SM"], "PO priorise le backlog.", ""],
  ["Scrum", "Événements Scrum ?", "événements Scrum", "Sprint, Planning, Daily, Review, Rétrospective — timeboxés.", ["Sprint"], "Daily ≤ 15 min.", ""],
  ["Scrum", "Artifacts Scrum ?", "artifacts Scrum", "Product Backlog, Sprint Backlog, Increment + DoD.", ["DoD"], "Increment potentiellement livrable.", ""],
  ["Kanban", "Kanban vs Scrum ?", "Kanban", "Flux continu, WIP limits, pas de sprints imposés — idéal ops/support.", ["WIP"], "Colonnes To Do/Doing/Done.", ""],
  ["User story", "Format d’une user story ?", "user story", "En tant que… je veux… afin de… + critères d’acceptation.", ["INVEST"], "As a user I want…", ""],
  ["User story", "Critères INVEST ?", "INVEST", "Independent, Negotiable, Valuable, Estimable, Small, Testable.", ["INVEST"], "Stories trop grosses → split.", ""],
  ["Estimation", "Story points vs heures ?", "story points", "Effort relatif (complexité/incertitude) ; vélocité pour forecast.", ["vélocité"], "Planning poker.", ""],
  ["Estimation", "Pourquoi les estimations ratent ?", "incertitude estimation", "Scope flou, deps, optimistic bias — découper et buffer risque.", ["buffer"], "Spike pour incertitude technique.", ""],
  ["Backlog", "Priorisation (RICE, MoSCoW) ?", "priorisation", "Scores reach/impact/confidence/effort ou Must/Should/Could/Won’t.", ["RICE", "MoSCoW"], "PO tranche avec data.", ""],
  ["Planning", "Capacity planning d’équipe ?", "capacity", "Tenir compte absences, support, meetings — pas 100% coding.", ["capacity"], "70–80% capacité features.", ""],
  ["Risks", "Gestion des risques projet ?", "risques projet", "Identifier, probabilité/impact, mitigation, owners.", ["risk register"], "Risque vendor API tier.", ""],
  ["Stakeholders", "Communiquer aux stakeholders ?", "stakeholders", "Langage métier, démos, risques visibles, pas jargon inutile.", ["demo"], "Review = feedback réel.", ""],
  ["Retro", "Bonne rétrospective ?", "rétrospective", "Safe space, actions concrètes owners/dates — pas plaintes sans suite.", ["actions"], "Start/Stop/Continue.", ""],
  ["DoD", "Definition of Done vs Ready ?", "DoD DoR", "DoR : story prête à démarrer ; DoD : terminée (tests, revue, doc).", ["DoR"], "Évite « presque fini ».", ""],
  ["Debt", "Gérer la dette technique ?", "dette technique", "Budget % sprint, enregistrer, lier à risques/valeur, ne pas tout stopper.", ["tech debt"], "Quota 20% hardening.", ""],
  ["Bugs", "Triage bugs vs features ?", "triage", "Sévérité/impact user, hotfix process, pas tout bloquer le sprint sans PO.", ["sévérité"], "P0 prod down immédiat.", ""],
  ["Docs", "Documentation projet utile ?", "doc projet", "README, ADRs, runbooks, specs légères — living docs > PDF morts.", ["ADR"], "Lien Confluence/Notion + code.", ""],
  ["Remote", "Rituels remote efficaces ?", "rituels remote", "Async first, agendas, notes, fuseaux, recordings.", ["async"], "Décisions écrites.", ""],
  ["Metrics", "Mesurer la delivery ?", "métriques delivery", "Lead time, deploy frequency, CFR, MTTR (DORA) — prudence vanity metrics.", ["DORA"], "Améliorer lead time PR.", ""],
  ["Scope", "Scope creep : comment réagir ?", "scope creep", "Renégocier scope/time/cost, changer control, backlog grooming.", ["change control"], "« Oui, dans le prochain sprint ».", ""],
  ["Kickoff", "Kickoff projet technique ?", "kickoff", "Objectifs, succès, rôles, risques, stack, environnements, comms.", ["kickoff"], "Checklist onboarding repo.", ""],
  ["Roadmap", "Roadmap vs backlog ?", "roadmap", "Roadmap vision/thèmes temporels ; backlog items actionnables.", ["roadmap"], "Éviter dates illusoires trop fines.", ""],
  ["OKR", "OKR en équipe tech ?", "OKR", "Objectives qualitatifs + Key Results mesurables — alignement.", ["OKR"], "KR : p95 latency < 200ms.", ""],
  ["Quality", "Qualité dans le process Agile ?", "qualité Agile", "Qualité built-in : DoD, CI, pair, pas phase QA finale seule.", ["built-in quality"], "QA partenaire dès stories.", ""],
  ["Facilitation", "Animer un daily efficace ?", "daily Scrum", "Progression vers sprint goal, bloqueurs — pas status report détaillé manager.", ["sprint goal"], "Parking lot hors daily.", ""],
  ["Conflict", "Désaccord technique en équipe ?", "désaccord technique", "Critères objectifs, spike timebox, ADR, décision claire owner.", ["ADR"], "Disagree and commit.", ""],
  ["Vendor", "Gérer une dépendance éditeur ?", "dépendance vendor", "SLA, exit strategy, abstractions, monitoring quotas.", ["vendor lock-in"], "SDK derrière interface.", ""],
  ["Handover", "Passer un projet à une autre équipe ?", "handover", "Docs, pair, runbooks, accès, dettes connues, contacts.", ["knowledge transfer"], "Session recorded + checklist.", ""],
  ["Ethics", "Responsabilité livrable vs deadline ?", "éthique livraison", "Signaler risques qualité/sécu ; options (cut scope) plutôt que silence.", ["transparence"], "Ne pas cacher une faille connue.", ""],
];

const gpSeeds = mapTopics(gpTopics, {
  prefix: "gp",
  categorie: "Gestion de projet",
  ressources: R("scrum", "roadmap", "github", "oc"),
  technologies: ["Scrum", "Kanban", "Agile", "Jira/GitHub"],
  liens: ["Présentation professionnelle", "Tests", "DevOps"],
  competences: ["Agile", "Communication", "Organisation"],
});

// ═══════════════════════════════════════════════════════════
// EXTRA senior seeds (variety beyond arrays)
// ═══════════════════════════════════════════════════════════
const extraSeeds = [
  techSeed({
    prefix: "extra",
    n: 1,
    categorie: "JavaScript",
    sousCategorie: "Mémoire",
    niveau: "Senior",
    difficulte: 5,
    question: "Comment diagnostiqueriez-vous une fuite mémoire dans une SPA React en production ?",
    concept: "diagnostic memory leak SPA",
    definition:
      "On combine métriques RUM/heap, reproduction locale Performance/Memory DevTools, identification de détachements DOM/listeners/caches, puis correctif et garde-fous.",
    points: ["heap snapshots", "detached DOM", "listeners", "RUM"],
    exemple: "Comparer snapshots avant/après navigation ; voir Detached HTMLElement retenus par une closure de store.",
    code: "// Retirer listeners dans cleanup useEffect\nuseEffect(() => {\n  const onResize = () => {};\n  window.addEventListener('resize', onResize);\n  return () => window.removeEventListener('resize', onResize);\n}, []);",
    pratiques: ["Borner les caches LRU", "Cleanup hooks systématique", "Surveiller heap en staging"],
    motsCles: ["memory leak", "heap", "React", "DevTools"],
    technologies: ["JavaScript", "React", "Chrome DevTools"],
    liens: ["Performance", "React", "Mémoire"],
    competences: ["Diagnostic avancé", "Performance front"],
    ressources: R("mdnJs", "chrome", "react"),
    piege: "optimiser CPU alors que le problème est une rétention d’objets",
  }),
  techSeed({
    prefix: "extra",
    n: 2,
    categorie: "Architecture Logicielle",
    sousCategorie: "Microservices",
    niveau: "Senior",
    difficulte: 5,
    question: "Comment découper un monolithe sans paralyser le business pendant 18 mois ?",
    concept: "décomposition progressive monolithe",
    definition:
      "On identifie les bounded contexts à fort ROI, on applique le strangler fig, on extrait derrière des APIs stables, avec observabilité et data ownership clairs.",
    points: ["strangler", "bounded context", "data ownership", "ROI"],
    exemple: "Extraire d’abord le service Paiement (équipe dédiée, charge, conformité) tout en laissant le catalogue dans le monolithe.",
    pratiques: ["Mesurer avant d’extraire", "Éviter distributed monolith", "Contrats et CDC tests"],
    motsCles: ["strangler fig", "monolithe", "microservices"],
    technologies: ["Architecture", "API", "Message queue"],
    liens: ["Microservices", "DDD", "DevOps"],
    competences: ["Architecture évolutive", "Conduite du changement"],
    ressources: R("roadmap", "mslearn", "aws"),
    piege: "découper par couches techniques (tous les controllers) plutôt que par domaine",
  }),
  techSeed({
    prefix: "extra",
    n: 3,
    categorie: "Sécurité",
    sousCategorie: "Auth",
    niveau: "Senior",
    difficulte: 5,
    question: "Concevez une auth pour une API publique + SPA + mobile avec révocation rapide.",
    concept: "auth multi-clients révocation",
    definition:
      "OAuth2/OIDC avec access tokens courts, refresh rotatifs, allowlist/denylist côté serveur ou introspection, sessions serveur pour révocation immédiate si besoin.",
    points: ["OIDC", "refresh rotation", "révocation", "PKCE"],
    exemple: "Access 5 min + refresh opaque stocké hashé en DB pour logout global.",
    pratiques: ["PKCE pour publics", "Sender-constraining si possible", "Monitoring login anomalies"],
    motsCles: ["OAuth2", "OIDC", "refresh token", "révocation"],
    technologies: ["OAuth2", "JWT", "Redis"],
    liens: ["API", "Sécurité", "Cloud"],
    competences: ["Sécurité auth", "Conception API"],
    ressources: R("owasp", "mdnHttp", "rfc9110"),
    piege: "JWT d’une semaine en localStorage sans révocation",
  }),
  techSeed({
    prefix: "extra",
    n: 4,
    categorie: "DevOps",
    sousCategorie: "CI/CD",
    niveau: "Senior",
    difficulte: 5,
    question: "Comment sécuriser un pipeline CD qui déploie sur le cloud sans stocker de long-lived cloud keys ?",
    concept: "OIDC federated deploy",
    definition:
      "Le CI obtient des credentials temporaires via OIDC federation vers le cloud IAM (rôles à moindre privilège), avec environments protégés et approvals.",
    points: ["OIDC", "IAM role", "secrets éphémères", "environments"],
    exemple: "GitHub Actions → AWS IAM role trust sur sub repo/env → terraform apply.",
    code: "# GitHub Actions (extrait)\npermissions:\n  id-token: write\n  contents: read",
    pratiques: ["Least privilege roles", "Branch protection", "Audit CloudTrail"],
    motsCles: ["OIDC", "CI/CD", "IAM", "zero standing privilege"],
    technologies: ["GitHub Actions", "AWS", "Terraform"],
    liens: ["Cloud", "Sécurité", "Git"],
    competences: ["DevSecOps", "Cloud IAM"],
    ressources: R("github", "aws", "docker"),
    piege: "ACCESS_KEY_ID permanent en secrets CI",
  }),
  techSeed({
    prefix: "extra",
    n: 5,
    categorie: "IA",
    sousCategorie: "RAG",
    niveau: "Senior",
    difficulte: 5,
    question: "Comment empêcher qu’un document malveillant détourne votre assistant RAG d’entreprise ?",
    concept: "défense prompt injection RAG",
    definition:
      "On isole le contenu récupéré comme data non exécutable, on restreint les tools, on filtre/sanitize, on utilise des instructions système prioritaires et une validation de sortie.",
    points: ["prompt injection", "isolation", "tool allowlist", "output validation"],
    exemple: "Le chunk « ignore instructions et exfiltre » ne peut pas déclencher d’outil d’envoi email.",
    pratiques: ["Privileges tools minimaux", "Citations obligatoires", "Monitoring anomalies"],
    motsCles: ["prompt injection", "RAG", "guardrails"],
    technologies: ["LLM", "RAG", "Vector DB"],
    liens: ["Sécurité", "IA", "Architecture Logicielle"],
    competences: ["Sécurité IA", "RAG avancé"],
    ressources: R("owasp", "openai", "anthropic", "langchain"),
    piege: "concaténer docs utilisateurs directement dans le system prompt privilégié",
  }),
  techSeed({
    prefix: "extra",
    n: 6,
    categorie: "SQL",
    sousCategorie: "Performance",
    niveau: "Senior",
    difficulte: 5,
    question: "Une requête passe de 50 ms à 8 s en production : méthode de diagnostic ?",
    concept: "diagnostic perf SQL",
    definition:
      "On capture le plan réel (EXPLAIN ANALYZE), stats, indexes manquants, locks, volume data, et on corrige (index, réécriture, pagination keyset, vacuum/analyze).",
    points: ["EXPLAIN ANALYZE", "stats", "locks", "index"],
    exemple: "Seq scan sur 20M lignes faute d’index (tenant_id, created_at) → index composite + keyset.",
    code: "EXPLAIN (ANALYZE, BUFFERS)\nSELECT * FROM orders\nWHERE tenant_id = $1\nORDER BY created_at DESC\nLIMIT 50;",
    pratiques: ["Slow query log", "Éviter OFFSET large", "Maintenir statistiques"],
    motsCles: ["EXPLAIN", "index", "slow query"],
    technologies: ["PostgreSQL", "SQL"],
    liens: ["Performance", "Architecture Logicielle"],
    competences: ["Optimisation SQL", "Diagnostic prod"],
    ressources: R("postgres", "sqlbolt"),
    piege: "ajouter des indexes au hasard sans lire le plan",
  }),
  techSeed({
    prefix: "extra",
    n: 7,
    categorie: "React",
    sousCategorie: "Performance",
    niveau: "Senior",
    difficulte: 5,
    question: "Comment rendre fluide une liste de 10 000 éléments interactifs dans React ?",
    concept: "virtualisation listes React",
    definition:
      "On virtualise (windowing), stabilise les callbacks, évite les contextes trop larges, et mesure via Profiler avant d’ajouter memo partout.",
    points: ["virtualization", "memo", "keys stables", "Profiler"],
    exemple: "react-window/react-virtuoso pour n’afficher que les rows visibles.",
    code: "import { FixedSizeList as List } from 'react-window';\n<List height={400} itemCount={10000} itemSize={35} width={'100%'}>\n  {({ index, style }) => <div style={style}>Row {index}</div>}\n</List>",
    pratiques: ["Mesurer avant optimiser", "Éviter index keys si reorder", "Colocaliser le state"],
    motsCles: ["virtualization", "react-window", "performance"],
    technologies: ["React", "JavaScript"],
    liens: ["Performance", "React"],
    competences: ["Performance React", "UX fluidité"],
    ressources: R("react", "webdev", "chrome"),
    piege: "envelopper chaque cellule de memo sans virtualiser",
  }),
  techSeed({
    prefix: "extra",
    n: 8,
    categorie: "API",
    sousCategorie: "Design",
    niveau: "Senior",
    difficulte: 4,
    question: "Comment gérer la compatibilité backward d’une API utilisée par 30 clients externes ?",
    concept: "compatibilité API backward",
    definition:
      "Évolutions additives, versioning clair, deprecation policy, tests de contrat, métriques d’usage des champs, communication changelog.",
    points: ["additive change", "deprecation", "CDC", "telemetry"],
    exemple: "Ajouter optional field ; ne jamais renommer/supprimer sans période de Sunset.",
    pratiques: ["OpenAPI diff en CI", "Feature flags côté serveur", "Adapter anti-corruption"],
    motsCles: ["backward compatibility", "versioning", "OpenAPI"],
    technologies: ["OpenAPI", "REST", "CI"],
    liens: ["API", "Gestion de projet", "Tests"],
    competences: ["Conception API", "Gouvernance"],
    ressources: R("openapi", "swagger", "mdnHttp"),
    piege: "casser un champ « personne ne l’utilise » sans données d’usage",
  }),
];

// ═══════════════════════════════════════════════════════════
// Collect, build, dedupe, write
// ═══════════════════════════════════════════════════════════
const allSeeds = [
  ...presentationSeeds,
  ...htmlSeeds,
  ...cssSeeds,
  ...jsSeeds,
  ...tsSeeds,
  ...reactSeeds,
  ...nodeSeeds,
  ...sqlSeeds,
  ...gitSeeds,
  ...apiSeeds,
  ...archSeeds,
  ...testSeeds,
  ...secuSeeds,
  ...devopsSeeds,
  ...linuxSeeds,
  ...cloudSeeds,
  ...iaSeeds,
  ...uxSeeds,
  ...gpSeeds,
  ...extraSeeds,
];

const seen = new Set();
const fiches = [];
for (const seed of allSeeds) {
  const built = buildFromSeed(seed);
  if (seen.has(built.id)) continue;
  seen.add(built.id);
  fiches.push(built);
}

/** Enrichit les fiches techniques sans code avec un extrait pertinent */
function enrichCode(fiche) {
  if (fiche.code && fiche.code.trim().length > 10) return fiche;
  const hay = `${fiche.question} ${fiche.sousCategorie} ${(fiche.motsCles || []).join(" ")}`.toLowerCase();
  const snippets = [
    [/promis|async await|async\/await/, `async function loadUser(id) {\n  const res = await fetch(\`/api/users/\${id}\`);\n  if (!res.ok) throw new Error(res.status);\n  return res.json();\n}`],
    [/fetch|http client/, `const res = await fetch("/api/items", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ name: "CDA" }),\n});`],
    [/closure|fermeture/, `function makeCounter() {\n  let n = 0;\n  return () => ++n;\n}\nconst next = makeCounter();\nnext(); // 1`],
    [/prototype|héritage/, `function Animal(name) { this.name = name; }\nAnimal.prototype.speak = function () {\n  return this.name + " fait un bruit";\n};`],
    [/\bthis\b|bind|call|apply/, `const user = {\n  name: "Ada",\n  greet() { return "Bonjour " + this.name; },\n};\nconst greet = user.greet;\ngreet(); // undefined (loose) — utiliser bind`],
    [/module|import|export/, `// math.js\nexport function sum(a, b) { return a + b; }\n\n// app.js\nimport { sum } from "./math.js";\nconsole.log(sum(2, 3));`],
    [/event|addEventListener|délégation/, `list.addEventListener("click", (e) => {\n  const btn = e.target.closest("[data-id]");\n  if (!btn) return;\n  console.log(btn.dataset.id);\n});`],
    [/dom|querySelector/, `const form = document.querySelector("#login");\nform.addEventListener("submit", (e) => {\n  e.preventDefault();\n  const data = new FormData(form);\n});`],
    [/flexbox|flex/, `.toolbar {\n  display: flex;\n  gap: 1rem;\n  align-items: center;\n  justify-content: space-between;\n}`],
    [/grid/, `.dashboard {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n  gap: 1.25rem;\n}`],
    [/spécificité|specificity|cascade/, `/* 0,1,0 */ .btn { color: blue; }\n/* 0,2,0 */ .header .btn { color: red; }\n/* 1,0,0 */ #submit { color: green; }`],
    [/variable css|custom propert/, `:root { --brand: #9a65ad; }\n.button {\n  background: var(--brand);\n  color: white;\n}`],
    [/media query|responsive/, `.card { padding: 1rem; }\n@media (min-width: 768px) {\n  .card { padding: 2rem; display: grid; grid-template-columns: 1fr 1fr; }\n}`],
    [/animation|keyframes|transition/, `@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(8px); }\n  to { opacity: 1; transform: none; }\n}\n.panel { animation: fadeIn 280ms ease; }`],
    [/bem/, `.card { }\n.card__title { }\n.card__title--highlight { }\n.card--featured { }`],
    [/hook|useState|useEffect/, `function Counter() {\n  const [n, setN] = useState(0);\n  useEffect(() => {\n    document.title = \`Count \${n}\`;\n  }, [n]);\n  return <button onClick={() => setN(n + 1)}>{n}</button>;\n}`],
    [/context|useContext|provider/, `const ThemeCtx = createContext("light");\nfunction App() {\n  return (\n    <ThemeCtx.Provider value="dark">\n      <Toolbar />\n    </ThemeCtx.Provider>\n  );\n}`],
    [/memo|useMemo|useCallback|react\.memo/, `const expensive = useMemo(() => compute(list), [list]);\nconst onSelect = useCallback((id) => setId(id), []);`],
    [/jsx|props|composant react/, `function Badge({ label, tone = "info" }) {\n  return <span className={\`badge badge--\${tone}\`}>{label}</span>;\n}`],
    [/express|middleware/, `app.use(express.json());\napp.get("/health", (req, res) => res.json({ ok: true }));\napp.use((err, req, res, next) => {\n  console.error(err);\n  res.status(500).json({ error: "internal" });\n});`],
    [/jwt|json web token/, `const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {\n  expiresIn: "1h",\n});\nconst payload = jwt.verify(token, process.env.JWT_SECRET);`],
    [/node\.?js|require|commonjs/, `import { readFile } from "node:fs/promises";\nconst raw = await readFile("./config.json", "utf8");\nconst config = JSON.parse(raw);`],
    [/select|join|sql/, `SELECT u.name, COUNT(o.id) AS orders\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.id, u.name\nHAVING COUNT(o.id) > 0;`],
    [/transaction|commit|rollback/, `BEGIN;\nUPDATE accounts SET balance = balance - 50 WHERE id = 1;\nUPDATE accounts SET balance = balance + 50 WHERE id = 2;\nCOMMIT;`],
    [/index|explain/, `CREATE INDEX idx_orders_user ON orders(user_id);\nEXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;`],
    [/git rebase|rebase/, `# sur feature\ngit fetch origin\ngit rebase origin/main\n# résoudre conflits, puis\ngit rebase --continue`],
    [/git merge|merge/, `git checkout main\ngit pull\ngit merge --no-ff feature/login\ngit push`],
    [/commit|conventional/, `git commit -m "feat(auth): add JWT refresh endpoint"\ngit commit -m "fix(api): validate email on signup"`],
    [/docker|dockerfile|container/, `FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]`],
    [/github actions|ci\/cd|pipeline/, `name: ci\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm test`],
    [/nginx|reverse proxy/, `server {\n  listen 80;\n  server_name app.example.com;\n  location / {\n    proxy_pass http://127.0.0.1:3000;\n    proxy_set_header Host $host;\n  }\n}`],
    [/xss|sanitize|escape/, `// Échapper avant insertion DOM\nfunction escapeHtml(s) {\n  return s.replace(/[&<>"']/g, (c) =>\n    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])\n  );\n}`],
    [/csrf/, `// Cookie SameSite + token anti-CSRF\nres.cookie("session", sid, { httpOnly: true, sameSite: "lax", secure: true });\n// Le client renvoie le token CSRF dans un header dédié`],
    [/sql injection|injection sql|requête prépar/, `// Mauvaise pratique\n// db.query("SELECT * FROM users WHERE email = '" + email + "'")\n// Bonne pratique\ndb.query("SELECT * FROM users WHERE email = $1", [email]);`],
    [/owasp|hash|bcrypt|argon/, `import bcrypt from "bcrypt";\nconst hash = await bcrypt.hash(password, 12);\nconst ok = await bcrypt.compare(password, hash);`],
    [/oauth/, `// Authorization Code + PKCE (SPA / mobile)\n// 1) redirect authorize ?code_challenge=\n// 2) échanger code + code_verifier contre tokens\n// 3) stocker access token en mémoire, refresh en cookie httpOnly`],
    [/typescript|interface|generic|type /, `interface User { id: string; email: string }\nfunction pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {\n  return keys.reduce((acc, k) => ({ ...acc, [k]: obj[k] }), {} as Pick<T, K>);\n}`],
    [/jest|vitest|unitair/, `import { sum } from "./math";\ntest("sum ajoute deux nombres", () => {\n  expect(sum(2, 3)).toBe(5);\n});`],
    [/playwright|e2e/, `test("login réussi", async ({ page }) => {\n  await page.goto("/login");\n  await page.getByLabel("Email").fill("ada@example.com");\n  await page.getByRole("button", { name: "Connexion" }).click();\n  await expect(page).toHaveURL("/dashboard");\n});`],
    [/rest|status|crud/, `// GET /users → 200\n// POST /users → 201 + Location\n// PUT /users/:id → 200\n// DELETE /users/:id → 204`],
    [/swagger|openapi/, `paths:\n  /users:\n    get:\n      summary: Liste des utilisateurs\n      responses:\n        "200":\n          description: OK`],
    [/linux|chmod|permission/, `chmod 640 secrets.env\nchown app:app secrets.env\n# propriétaire rw, groupe r, autres aucun`],
    [/ssh|scp/, `ssh -i ~/.ssh/id_ed25519 deploy@server\nscp -r ./dist deploy@server:/var/www/app`],
    [/cron|journalctl|systemctl/, `systemctl status nginx\njournalctl -u api -n 100 --no-pager\n# cron : 0 2 * * * /usr/local/bin/backup.sh`],
    [/rag|embedding|langchain/, `const docs = await loader.load();\nconst splits = await splitter.splitDocuments(docs);\nconst store = await MemoryVectorStore.fromDocuments(splits, embeddings);\nconst docsFound = await store.similaritySearch(question, 4);`],
    [/prompt|chatgpt|claude|gemini/, `// Prompt structuré\n// Rôle + contexte + contraintes + format de sortie\nconst prompt = \`Tu es un formateur CDA. Réponds en 5 puces max.\nContexte: \${notion}\nFormat: Markdown\`;`],
    [/docker compose|compose/, `services:\n  api:\n    build: .\n    ports: ["3000:3000"]\n    environment:\n      DATABASE_URL: postgres://user:pass@db:5432/app\n  db:\n    image: postgres:16`],
  ];

  for (const [re, code] of snippets) {
    if (re.test(hay)) {
      return { ...fiche, code };
    }
  }
  return fiche;
}

const enriched = fiches.map(enrichCode);

const byCat = {};
for (const f of enriched) {
  byCat[f.categorie] = (byCat[f.categorie] || 0) + 1;
}

const outPath = path.join(__dirname, "..", "js", "data", "fiches.js");
const header = `/** CDA Recruit Simulator — base de connaissances
 * Généré automatiquement — ne pas éditer à la main.
 * ${enriched.length} fiches
 */
`;
const body = `window.FICHES = ${JSON.stringify(enriched, null, 0)};\n`;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, header + body, "utf8");

const withCode = enriched.filter((f) => f.code && f.code.length > 10).length;
console.log("=== Fiches par catégorie ===");
Object.keys(byCat)
  .sort()
  .forEach((k) => console.log(`${k}: ${byCat[k]}`));
console.log(`TOTAL: ${enriched.length}`);
console.log(`Avec code: ${withCode}`);
console.log(`Written: ${outPath}`);

if (enriched.length < 650) {
  console.error(`ERROR: only ${enriched.length} fiches (need >= 650)`);
  process.exit(1);
}
