/**
 * Générateur de la base documentaire CDA Recruit Simulator
 * Produit js/data/fiches.js — contenu final, autonome, orienté RAG.
 *
 * Usage: node scripts/generate-fiches.js
 */
const fs = require("fs");
const path = require("path");

const RESSOURCES = {
  mdn: { titre: "MDN Web Docs", url: "https://developer.mozilla.org/fr/" },
  mdnHtml: { titre: "MDN — HTML", url: "https://developer.mozilla.org/fr/docs/Web/HTML" },
  mdnCss: { titre: "MDN — CSS", url: "https://developer.mozilla.org/fr/docs/Web/CSS" },
  mdnJs: { titre: "MDN — JavaScript", url: "https://developer.mozilla.org/fr/docs/Web/JavaScript" },
  mdnA11y: { titre: "MDN — Accessibilité", url: "https://developer.mozilla.org/fr/docs/Web/Accessibility" },
  mdnHttp: { titre: "MDN — HTTP", url: "https://developer.mozilla.org/fr/docs/Web/HTTP" },
  webdev: { titre: "web.dev", url: "https://web.dev/" },
  w3c: { titre: "W3C", url: "https://www.w3.org/" },
  whatwg: { titre: "WHATWG HTML Living Standard", url: "https://html.spec.whatwg.org/" },
  caniuse: { titre: "Can I Use", url: "https://caniuse.com/" },
  csstricks: { titre: "CSS-Tricks", url: "https://css-tricks.com/" },
  ecma: { titre: "ECMAScript Language Specification", url: "https://tc39.es/ecma262/" },
  node: { titre: "Node.js Documentation", url: "https://nodejs.org/docs/latest/api/" },
  express: { titre: "Express.js Guide", url: "https://expressjs.com/fr/" },
  react: { titre: "React Documentation", url: "https://react.dev/" },
  ts: { titre: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" },
  docker: { titre: "Docker Documentation", url: "https://docs.docker.com/" },
  owasp: { titre: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
  git: { titre: "Pro Git Book", url: "https://git-scm.com/book/fr/v2" },
  github: { titre: "GitHub Docs", url: "https://docs.github.com/fr" },
  gitlab: { titre: "GitLab Docs", url: "https://docs.gitlab.com/" },
  mslearn: { titre: "Microsoft Learn", url: "https://learn.microsoft.com/fr-fr/" },
  googlelearn: { titre: "Google for Developers", url: "https://developers.google.com/" },
  aws: { titre: "AWS Documentation", url: "https://docs.aws.amazon.com/" },
  azure: { titre: "Azure Documentation", url: "https://learn.microsoft.com/fr-fr/azure/" },
  gcp: { titre: "Google Cloud Docs", url: "https://cloud.google.com/docs" },
  cloudflare: { titre: "Cloudflare Docs", url: "https://developers.cloudflare.com/" },
  vercel: { titre: "Vercel Docs", url: "https://vercel.com/docs" },
  netlify: { titre: "Netlify Docs", url: "https://docs.netlify.com/" },
  roadmap: { titre: "roadmap.sh", url: "https://roadmap.sh/" },
  fcc: { titre: "freeCodeCamp", url: "https://www.freecodecamp.org/" },
  oc: { titre: "OpenClassrooms", url: "https://openclassrooms.com/" },
  grafikart: { titre: "Grafikart", url: "https://grafikart.fr/" },
  devdocs: { titre: "DevDocs", url: "https://devdocs.io/" },
  openapi: { titre: "OpenAPI Specification", url: "https://spec.openapis.org/oas/latest.html" },
  swagger: { titre: "Swagger / OpenAPI", url: "https://swagger.io/docs/" },
  json: { titre: "JSON.org", url: "https://www.json.org/json-fr.html" },
  sqlbolt: { titre: "SQLBolt", url: "https://sqlbolt.com/" },
  postgres: { titre: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/" },
  mysql: { titre: "MySQL Documentation", url: "https://dev.mysql.com/doc/" },
  sqlite: { titre: "SQLite Documentation", url: "https://www.sqlite.org/docs.html" },
  chrome: { titre: "Chrome Developers", url: "https://developer.chrome.com/" },
  mozillahacks: { titre: "Mozilla Hacks", url: "https://hacks.mozilla.org/" },
  openai: { titre: "OpenAI Documentation", url: "https://platform.openai.com/docs" },
  anthropic: { titre: "Anthropic Docs", url: "https://docs.anthropic.com/" },
  googleai: { titre: "Google AI / Gemini", url: "https://ai.google.dev/" },
  cursor: { titre: "Cursor Documentation", url: "https://docs.cursor.com/" },
  copilot: { titre: "GitHub Copilot Docs", url: "https://docs.github.com/fr/copilot" },
  jest: { titre: "Jest Documentation", url: "https://jestjs.io/" },
  playwright: { titre: "Playwright Documentation", url: "https://playwright.dev/" },
  vitest: { titre: "Vitest Documentation", url: "https://vitest.dev/" },
  rfc9110: { titre: "RFC 9110 — HTTP Semantics", url: "https://www.rfc-editor.org/rfc/rfc9110" },
  nginx: { titre: "Nginx Documentation", url: "https://nginx.org/en/docs/" },
  linuxman: { titre: "Linux man-pages", url: "https://man7.org/linux/man-pages/" },
  figma: { titre: "Figma Learn", url: "https://help.figma.com/" },
  scrum: { titre: "Scrum Guide", url: "https://scrumguides.org/scrum-guide.html" },
  langchain: { titre: "LangChain Docs", url: "https://js.langchain.com/" },
  ollama: { titre: "Ollama Documentation", url: "https://github.com/ollama/ollama" },
};

function R(...keys) {
  return keys.map((k) => RESSOURCES[k]).filter(Boolean);
}

function fiche(partial) {
  const id = partial.id;
  const base = {
    id,
    categorie: partial.categorie,
    sousCategorie: partial.sousCategorie,
    niveau: partial.niveau,
    difficulte: partial.difficulte,
    tempsReponse: partial.tempsReponse,
    question: partial.question,
    pourquoi: partial.pourquoi,
    evaluation: partial.evaluation,
    reponse: partial.reponse,
    explication: partial.explication,
    exemple: partial.exemple,
    code: partial.code || "",
    erreurs: partial.erreurs || [],
    conseils: partial.conseils,
    bonnesPratiques: partial.bonnesPratiques || [],
    variantes: partial.variantes || [],
    motsCles: partial.motsCles || [],
    technologies: partial.technologies || [],
    liensNotions: partial.liensNotions || [],
    competences: partial.competences || [],
    ressources: partial.ressources || [],
    tags: partial.tags || [],
  };
  return base;
}

/** Construit une fiche riche à partir d’un seed thématique */
function buildFromSeed(seed) {
  const {
    id,
    categorie,
    sousCategorie,
    niveau,
    difficulte,
    tempsReponse,
    question,
    concept,
    definition,
    points,
    exemple,
    code = "",
    erreurs,
    pratiques,
    variantes,
    motsCles,
    technologies,
    liens,
    competences,
    ressources,
    tags,
    piege,
    angleRecruteur,
  } = seed;

  const pointsList = (points || []).join(", ");
  const pointsDetail = (points || []).join(" ; ");

  const pourquoi =
    seed.pourquoi ||
    `En entretien ${categorie}, cette question sur « ${concept} » sépare le candidat qui a seulement lu un article de celui qui a déjà dû faire un choix technique sous contraintes. ${angleRecruteur || "Le jury observe aussi la clarté du discours et la capacité à prioriser l’essentiel."}`;

  const evaluation =
    seed.evaluation ||
    `Sont évalués : exactitude de la définition de ${concept}, maîtrise des leviers (${pointsList}), conscience des risques (${piege || "approximations et confusions classiques"}), et capacité à proposer un usage raisonnable en contexte CDA (projet, alternance, production).`;

  const reponse =
    seed.reponse ||
    `${definition} Les axes à verbaliser sont notamment : ${pointsList}. On ancre ensuite avec un cas réel : ${exemple}`;

  const explication =
    seed.explication ||
    `${definition} Pour ${concept}, retenez ce fil conducteur : ${pointsDetail}. ${piege ? `Piège classique : ${piege}.` : ""} En production, ce sujet touche aussi la collaboration (revue de code, documentation, tests) et les arbitrages (délai, dette technique, performance, sécurité, accessibilité selon le domaine). Une réponse senior compare au moins une alternative et justifie le choix retenu.`;

  return fiche({
    id,
    categorie,
    sousCategorie,
    niveau,
    difficulte,
    tempsReponse,
    question,
    pourquoi,
    evaluation,
    reponse,
    explication,
    exemple,
    code,
    erreurs: erreurs || [
      `Rester vague sur ${concept} sans mécanisme ni exemple`,
      `Oublier les points clés : ${points.slice(0, 2).join(" / ") || concept}`,
      piege ? `Tomber dans le piège : ${piege}` : "Ignorer les impacts en production ou en équipe",
    ],
    conseils:
      seed.conseils ||
      `Réponse type : 1) définir ${concept} en une phrase, 2) détailler ${points.slice(0, 2).join(" et ")}, 3) illustrer avec votre exemple, 4) citer une limite ou une alternative. Vocabulaire utile : ${motsCles.slice(0, 4).join(", ")}.`,
    bonnesPratiques: pratiques,
    variantes: variantes || [
      `Expliquez ${concept} comme à un Product Owner.`,
      `Quels indicateurs prouvent que ${concept} est bien mis en œuvre ?`,
      `Dans un projet CDA, comment introduiriez-vous ${concept} progressivement ?`,
    ],
    motsCles,
    technologies,
    liensNotions: liens,
    competences,
    ressources,
    tags: tags || [categorie.toLowerCase(), sousCategorie.toLowerCase(), ...motsCles.slice(0, 3)],
  });
}

// ═══════════════════════════════════════════════════════════
// SEEDS — Présentation professionnelle
// ═══════════════════════════════════════════════════════════
const presentationSeeds = [
  {
    id: "pres-001",
    categorie: "Présentation professionnelle",
    sousCategorie: "Présentation",
    niveau: "Junior",
    difficulte: 1,
    tempsReponse: 3,
    question: "Présentez-vous en deux minutes dans le cadre d’un entretien technique CDA.",
    concept: "elevator pitch technique",
    definition:
      "Un pitch d’entretien technique est une présentation structurée (parcours, compétences, projet phare, objectif) adaptée au poste et au niveau CDA.",
    points: [
      "accroche avec le métier visé",
      "parcours formation / alternance",
      "stack maîtrisée",
      "projet concret avec résultat",
      "motivation pour l’entreprise",
    ],
    exemple:
      "« Je suis en formation CDA, j’ai réalisé une API REST Node/Express avec authentification JWT et une interface React. Je cherche une alternance où je pourrai renforcer le backend et la qualité de code. »",
    erreurs: [
      "Réciter le CV chronologiquement sans fil directeur",
      "Parler trop longtemps (plus de 3 minutes)",
      "Ne pas mentionner de stack ni de projet",
      "Oublier le lien avec le poste",
    ],
    pratiques: [
      "Préparer 3 versions : 30 s, 1 min, 2 min",
      "Quantifier les résultats (temps, users, perf)",
      "Adapter le vocabulaire au type d’entreprise",
    ],
    motsCles: ["pitch", "présentation", "parcours", "soft skills", "CDA"],
    technologies: ["Communication"],
    liens: ["CV", "Portfolio", "Motivation", "Soft Skills"],
    competences: ["Expression orale", "Synthèse", "Adaptabilité"],
    ressources: R("oc", "fcc", "roadmap"),
    piege: "se perdre dans les détails personnels non professionnels",
    angleRecruteur: "Le recruteur teste la clarté, la confiance et la capacité à se vendre sans mentir.",
  },
  {
    id: "pres-002",
    categorie: "Présentation professionnelle",
    sousCategorie: "Parcours",
    niveau: "Junior",
    difficulte: 2,
    tempsReponse: 3,
    question: "Comment expliquer une reconversion ou un parcours non linéaire ?",
    concept: "narratif de reconversion",
    definition:
      "Un parcours non linéaire se valorise en mettant en avant les compétences transférables, la motivation réelle pour le développement et les preuves concrètes d’apprentissage.",
    points: [
      "assumer le parcours sans s’excuser",
      "compétences transférables",
      "preuves (projets, GitHub, certifications)",
      "apprentissage continu",
    ],
    exemple:
      "Un ancien commercial peut souligner l’écoute client, la gestion de priorité et montrer un portfolio GitHub actif avec des commits réguliers.",
    erreurs: ["Se justifier excessivement", "Cacher des trous sans explication", "Minimiser l’expérience passée"],
    pratiques: ["Relier chaque étape à une compétence utile en équipe tech", "Montrer une progression technique mesurable"],
    motsCles: ["reconversion", "parcours", "compétences transférables", "motivation"],
    technologies: ["GitHub", "Portfolio"],
    liens: ["Présentation", "Motivation", "Veille"],
    competences: ["Authenticité", "Résilience", "Apprentissage"],
    ressources: R("oc", "fcc", "github"),
    piege: "présenter la reconversion comme un échec plutôt qu’un choix construit",
  },
  {
    id: "pres-003",
    categorie: "Présentation professionnelle",
    sousCategorie: "Alternance",
    niveau: "Junior",
    difficulte: 2,
    tempsReponse: 3,
    question: "Que recherchez-vous concrètement dans une alternance CDA ?",
    concept: "attentes d’alternance",
    definition:
      "Une réponse crédible combine montée en compétences techniques, exposition à un vrai cycle de projet (Git, revue, déploiement) et accompagnement par un tuteur.",
    points: ["environnement réel", "stack moderne", "mentorat", "autonomie progressive", "évaluation des acquis"],
    exemple:
      "Souhaiter participer aux daily, aux PR, écrire des tests et déployer sur un environnement de staging.",
    erreurs: ["Répondre seulement « un salaire »", "Demander uniquement du front ou du back sans ouverture", "Aucune idée du rythme école/entreprise"],
    pratiques: ["Citer 2–3 objectifs d’apprentissage mesurables", "Montrer que vous connaissez le rythme d’alternance"],
    motsCles: ["alternance", "tutorat", "montée en compétences", "CDA"],
    technologies: ["Git", "CI/CD", "Agile"],
    liens: ["Motivation", "Organisation", "Méthodologie"],
    competences: ["Proactivité", "Humilité", "Curiosité"],
    ressources: R("oc", "roadmap", "github"),
  },
  {
    id: "pres-004",
    categorie: "Présentation professionnelle",
    sousCategorie: "Portfolio",
    niveau: "Junior",
    difficulte: 2,
    tempsReponse: 4,
    question: "Que doit contenir un portfolio de développeur CDA convaincant ?",
    concept: "portfolio développeur",
    definition:
      "Un portfolio efficace présente 3 à 5 projets soignés avec problème, stack, architecture, captures, lien GitHub/démo et apprentissages.",
    points: ["qualité > quantité", "README professionnel", "démo en ligne", "code lisible", "accessibilité et responsive"],
    exemple:
      "Un CRUD full-stack avec auth, validation, tests et déploiement Vercel/Render vaut mieux que dix tutoriels clonés sans explication.",
    code: `# Mon Projet API\n\n## Problème\nGérer des rendez-vous pour une PME.\n\n## Stack\nNode.js, Express, PostgreSQL, React\n\n## Fonctionnalités\n- Auth JWT\n- CRUD rendez-vous\n- Rôle admin/user`,
    erreurs: ["Projets sans README", "Repos sans explication", "Aucun lien vers le code source", "Design cassé sur mobile"],
    pratiques: ["Documenter les choix techniques", "Montrer les tests", "Indiquer votre contribution exacte en équipe"],
    motsCles: ["portfolio", "GitHub", "README", "démo", "projets"],
    technologies: ["GitHub", "HTML", "CSS", "JavaScript", "React", "Node.js"],
    liens: ["CV", "Présentation", "Git"],
    competences: ["Communication écrite", "Soin du détail", "Autonomie"],
    ressources: R("github", "fcc", "webdev", "roadmap"),
  },
  {
    id: "pres-005",
    categorie: "Présentation professionnelle",
    sousCategorie: "CV",
    niveau: "Junior",
    difficulte: 2,
    tempsReponse: 3,
    question: "Quelles sont les bonnes pratiques d’un CV développeur pour un poste CDA ?",
    concept: "CV technique",
    definition:
      "Un CV développeur est une page (deux max) claire : titre de poste, stack, expériences/projets chiffrés, formation, liens GitHub/LinkedIn.",
    points: ["mots-clés ATS", "projets avant jobs non tech si reconversion", "stack visible", "pas de photo obligatoire", "orthographe irréprochable"],
    exemple:
      "Section « Projets » avec puces du type : « API REST sécurisée JWT — 12 endpoints — tests Jest — déploiement Docker ».",
    erreurs: ["CV de 4 pages", "Liste de 40 technologies non maîtrisées", "Aucune URL GitHub", "Mise en page illisible"],
    pratiques: ["Adapter le CV à l’offre", "Mettre les compétences réellement utilisables en entretien", "Faire relire"],
    motsCles: ["CV", "ATS", "stack", "projets", "mots-clés"],
    technologies: ["Markdown", "GitHub", "LinkedIn"],
    liens: ["Portfolio", "Présentation", "Soft Skills"],
    competences: ["Synthèse", "Marketing de soi"],
    ressources: R("oc", "fcc", "github"),
  },
];

// More presentation seeds will be added via expandSoftSkills helper
const softSkillTopics = [
  ["Soft Skills", "Qu’entend-on par soft skills en équipe de développement ?", "soft skills", "Les soft skills sont les compétences comportementales (communication, écoute, feedback, gestion du conflit) indispensables au travail collaboratif en IT.", ["communication", "empathie", "feedback", "responsabilité"], "Expliquer un retard de sprint avec solutions plutôt qu’avec excuses."],
  ["Communication", "Comment expliquez-vous un sujet technique à un product owner non technique ?", "vulgarisation technique", "La vulgarisation consiste à traduire un concept technique en impact métier, sans jargon inutile, tout en restant exact.", ["analogies", "impact métier", "écoute", "questions ouvertes"], "Expliquer une dette technique comme un « crédit » qui coûte des intérêts (bugs, lenteur)."],
  ["Motivation", "Pourquoi voulez-vous devenir Concepteur Développeur d’Applications ?", "motivation CDA", "Une motivation crédible allie intérêt pour la résolution de problèmes, plaisir de construire des produits utiles et volonté d’apprendre en continu.", ["apprentissage", "produit", "résolution de problèmes"], "Citer un projet personnel qui a résolu un vrai besoin."],
  ["Organisation", "Comment organisez-vous votre travail sur une user story complexe ?", "organisation du travail", "L’organisation efficace découpe la story, clarifie les critères d’acceptation, priorise, estime, et communique les bloqueurs tôt.", ["découpage", "priorisation", "bloqueurs", "estimation"], "Découper « auth utilisateur » en modèle, endpoints, UI, tests, doc."],
  ["Veille", "Comment faites-vous votre veille technologique ?", "veille technologique", "La veille est une pratique régulière de suivi des évolutions (blogs, changelogs, conférences, newsletters) pour rester employable et éclairer les choix techniques.", ["RSS", "changelog", "communautés", "expérimentation"], "Lire le changelog React et tester une nouveauté sur un side project."],
  ["Méthodologie", "Quelle méthodologie de travail préférez-vous et pourquoi ?", "méthodologie de travail", "Il n’existe pas de méthodologie universelle : on choisit selon le contexte (Scrum, Kanban, approche hybride) en privilégiant la livraison de valeur et l’amélioration continue.", ["Agile", "Scrum", "Kanban", "amélioration continue"], "Kanban pour le support, Scrum pour un produit feature-driven."],
  ["Télétravail", "Quelles bonnes pratiques pour être efficace en télétravail développeur ?", "télétravail", "Le télétravail efficace repose sur des rituels asynchrones clairs, une communication proactive, un environnement adapté et une discipline de documentation.", ["async", "documentation", "visio", "fuseaux"], "Écrire le compte-rendu de décision dans la PR plutôt que seulement en call."],
  ["Gestion du stress", "Comment gérez-vous la pression d’une deadline ou d’un incident en production ?", "gestion du stress", "La gestion du stress en IT combine priorisation, communication transparente, timeboxing et séparation émotion / action technique.", ["priorisation", "incident", "communication", "post-mortem"], "Pendant un incident : stabiliser, communiquer, diagnostiquer, corriger, capitaliser."],
  ["Travail d’équipe", "Comment réagissez-vous à une critique en code review ?", "code review", "Une code review est un outil d’amélioration collective : on sépare l’ego du code, on demande des clarifications et on documente les décisions.", ["feedback", "PR", "humilité", "qualité"], "Répondre à un commentaire par une question ou une amélioration, jamais par une attaque."],
  ["Leadership", "Comment exerce-t-on un leadership technique sans être manager ?", "leadership technique", "Le leadership technique influence par l’exemple : qualité du code, mentorat, propositions d’architecture argumentées et facilitation des décisions.", ["mentorat", "exemple", "décision", "influence"], "Proposer un ADR (Architecture Decision Record) plutôt qu’imposer un choix."],
  ["Résolution de problème", "Décrivez votre méthode pour déboguer un problème inconnu.", "débogage méthodique", "Le débogage efficace isole le problème, reproduit, formule des hypothèses, teste une variable à la fois, et documente la cause racine.", ["reproductibilité", "hypothèses", "logs", "cause racine"], "Utiliser git bisect pour trouver le commit fautif."],
];

softSkillTopics.forEach((t, i) => {
  const [sous, question, concept, definition, points, exemple] = t;
  presentationSeeds.push({
    id: `pres-${String(i + 6).padStart(3, "0")}`,
    categorie: "Présentation professionnelle",
    sousCategorie: sous,
    niveau: i < 4 ? "Junior" : "Confirmé",
    difficulte: i < 5 ? 2 : 3,
    tempsReponse: 3,
    question,
    concept,
    definition,
    points,
    exemple,
    erreurs: [
      `Répondre de façon trop théorique sur ${concept}`,
      "Ne pas donner d’exemple personnel",
      "Ignorer la dimension équipe",
    ],
    pratiques: [
      `Préparer 1 anecdote STAR liée à ${concept}`,
      "Relier la réponse au contexte de l’entreprise",
      "Montrer l’apprentissage tiré de l’expérience",
    ],
    motsCles: [concept, sous.toLowerCase(), "entretien", "comportemental", ...points.slice(0, 2)],
    technologies: ["Agile", "Git", "Communication"],
    liens: ["Soft Skills", "Travail d’équipe", "Méthodologie"],
    competences: ["Soft skills", "Communication", "Esprit critique"],
    ressources: R("oc", "scrum", "github"),
    piege: "réciter un modèle sans vécu",
  });
});

// ═══════════════════════════════════════════════════════════
// Helper to create many technical seeds compactly
// ═══════════════════════════════════════════════════════════
function techSeed({
  prefix,
  n,
  categorie,
  sousCategorie,
  niveau,
  difficulte,
  tempsReponse = 4,
  question,
  concept,
  definition,
  points,
  exemple,
  code = "",
  erreurs,
  pratiques,
  motsCles,
  technologies,
  liens,
  competences,
  ressources,
  piege,
  variantes,
  conseils,
  pourquoi,
  evaluation,
  reponse,
  explication,
}) {
  return {
    id: `${prefix}-${String(n).padStart(3, "0")}`,
    categorie,
    sousCategorie,
    niveau,
    difficulte,
    tempsReponse,
    question,
    concept,
    definition,
    points,
    exemple,
    code,
    erreurs,
    pratiques,
    motsCles,
    technologies,
    liens,
    competences,
    ressources,
    piege,
    variantes,
    conseils,
    pourquoi,
    evaluation,
    reponse,
    explication,
  };
}

// HTML seeds
const htmlTopics = [
  ["HTML5", "Qu’est-ce que HTML5 et qu’a-t-il apporté par rapport à HTML4 ?", "HTML5", "HTML5 est la version majeure du langage de balisage du Web qui introduit des éléments sémantiques, des APIs natives (audio, vidéo, canvas, stockage) et une parsing plus robuste.", ["sémantique", "APIs natives", "compatibilité", "accessibilité"], "<header>, <nav>, <main>, <article>, <section>, <footer> remplacent des <div> génériques.", ""],
  ["Balises", "Quelle est la différence entre une balise block et une balise inline ?", "display block vs inline", "Une balise de type block occupe toute la largeur disponible et commence sur une nouvelle ligne ; une balise inline s’insère dans le flux textuel sans forcer de retour à la ligne.", ["block", "inline", "inline-block", "flux"], "<p>, <div>, <section> sont block ; <span>, <a>, <strong> sont inline.", ""],
  ["Balises", "À quoi sert la balise <meta> viewport ?", "viewport meta", "La balise meta viewport indique au navigateur mobile comment dimensionner la zone d’affichage, condition sine qua non du responsive design.", ["viewport", "responsive", "mobile", "scale"], "Sans viewport, les sites desktop apparaissent zoomés/minuscules sur mobile.", '<meta name="viewport" content="width=device-width, initial-scale=1">'],
  ["Accessibilité", "Pourquoi l’attribut alt est-il obligatoire sur les images informatives ?", "attribut alt", "L’attribut alt fournit une alternative textuelle pour les lecteurs d’écran, le SEO et les cas où l’image ne charge pas.", ["alt", "a11y", "WCAG", "SEO"], "alt=\"Diagramme du parcours utilisateur inscription\" plutôt que alt=\"image1\".", '<img src="parcours.svg" alt="Parcours utilisateur de l’inscription">'],
  ["Accessibilité", "Qu’est-ce que le focus clavier et pourquoi est-il critique ?", "focus clavier", "Le focus clavier indique l’élément interactif actuellement sélectionnable au clavier ; le masquer sans alternative exclut les utilisateurs non-souris.", ["focus", "tabindex", "outline", "a11y"], "Ne jamais faire outline: none sans style de focus visible personnalisé.", ""],
  ["SEO", "Comment le HTML sémantique influence-t-il le SEO ?", "HTML sémantique et SEO", "Les moteurs s’appuient sur la structure (titres hiérarchiques, landmarks, données structurées) pour comprendre le contenu et le classer.", ["h1-h6", "landmarks", "données structurées", "crawl"], "Un seul h1 clair, des h2 cohérents, et des balises article pour le contenu principal.", ""],
  ["ARIA", "Quand utiliser aria-label et quand préférer du texte visible ?", "ARIA label", "ARIA complète l’HTML quand la sémantique native ne suffit pas ; le texte visible reste préférable. aria-label sert quand le libellé n’est pas affiché.", ["ARIA", "label", "accessible name", "progressive enhancement"], "Bouton icône seule : aria-label=\"Fermer\" ; bouton avec texte : pas besoin d’aria-label.", '<button aria-label="Fermer le menu"><svg>...</svg></button>'],
  ["ARIA", "Que signifie le principe « No ARIA is better than bad ARIA » ?", "bon usage ARIA", "Un rôle ARIA incorrect est pire que l’HTML natif : il trompe les technologies d’assistance. Préférer les éléments natifs (button, a, input) avant ARIA.", ["ARIA", "éléments natifs", "a11y"], "Utiliser <button> plutôt que <div role=\"button\">.", ""],
  ["Formulaires", "Comment lier correctement un label à un champ de formulaire ?", "label for/id", "L’association label/contrôle via for/id (ou englobement) améliore l’accessibilité, l’UX (zone de clic) et la clarté.", ["label", "for", "id", "a11y"], "Cliquer sur « Email » focus l’input associé.", '<label for="email">Email</label>\n<input id="email" type="email" name="email" required>'],
  ["Formulaires", "Quelles validations HTML5 natives connaissez-vous ?", "validation HTML5", "HTML5 fournit required, type email/url/number, min/max, pattern, minlength/maxlength, contrôlés par le navigateur avant soumission.", ["required", "pattern", "constraint validation", "novalidate"], "pattern pour un code postal, type=email pour le format.", '<input type="tel" pattern="[0-9]{10}" required>'],
  ["Images", "Différence entre img, picture et srcset ?", "images responsives", "srcset/sizes adaptent la densité et largeur ; picture permet des art direction (sources différentes selon media queries).", ["srcset", "picture", "webp", "performance"], "Servir WebP avec fallback JPEG via <picture>.", '<picture>\n  <source type="image/webp" srcset="hero.webp">\n  <img src="hero.jpg" alt="Accueil produit">\n</picture>'],
  ["Images", "Qu’est-ce que le lazy loading d’images ?", "lazy loading", "Le lazy loading diffère le chargement des images hors viewport pour accélérer le LCP et économiser la bande passante.", ["loading=lazy", "LCP", "performance"], "loading=\"lazy\" sur les images below the fold ; pas sur le hero LCP.", '<img src="galerie.jpg" alt="Produit" loading="lazy" width="800" height="600">'],
  ["Vidéo", "Comment intégrer une vidéo accessible en HTML5 ?", "balise video", "La balise video avec controls, sous-titres track, et transcripts offre lecture native et accessibilité.", ["video", "track", "sous-titres", "controls"], "Fournir VTT pour les sourds/malentendants.", '<video controls>\n  <source src="demo.mp4" type="video/mp4">\n  <track kind="captions" src="demo.fr.vtt" srclang="fr" label="Français">\n</video>'],
  ["Audio", "Quelles précautions pour l’audio autoplay ?", "audio autoplay", "L’autoplay est souvent bloqué par les navigateurs ; il doit être justifié, idéalement muted, et jamais surprenant (accessibilité, UX).", ["autoplay", "muted", "politique navigateur"], "Musique de fond : laisser l’utilisateur démarrer.", ""],
  ["Canvas", "À quoi sert l’élément canvas ?", "canvas API", "Canvas fournit une surface de dessin bitmap 2D/WebGL pour graphiques, jeux, visualisations, manipulée via JavaScript.", ["canvas", "2d context", "WebGL", "accessibilité"], "Graphique dynamique ou signature manuscrite.", "const ctx = canvas.getContext('2d');\nctx.fillRect(10, 10, 100, 50);"],
  ["SVG", "Quels avantages du SVG par rapport au PNG pour les icônes ?", "SVG", "Le SVG est vectoriel, net à toute densité, souvent plus léger, stylable en CSS et accessible s’il est bien balisé.", ["vectoriel", "scalable", "inline SVG", "CSS"], "Remplacer un sprite PNG d’icônes par des SVG inline ou un sprite symbol.", ""],
  ["Microdata", "À quoi servent les données structurées (JSON-LD / microdata) ?", "données structurées", "Les données structurées décrivent le contenu (Article, FAQ, Product) pour les rich results des moteurs de recherche.", ["JSON-LD", "Schema.org", "SEO", "rich results"], "Ajouter un JSON-LD FAQPage sur une page d’aide.", '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage"}</script>'],
  ["Semantic HTML", "Pourquoi préférer <button> à <div onclick> ?", "éléments interactifs natifs", "Les éléments natifs fournissent clavier, focus, rôles et sémantique : un div cliquable exige de tout reconstruire à la main.", ["button", "a11y", "progressive enhancement"], "Tout contrôle d’action = button ; toute navigation = lien a href.", ""],
  ["Semantic HTML", "Quel est le rôle de <main>, <nav> et <aside> ?", "landmarks HTML", "Ces landmarks structurants aident la navigation assistive et clarifient l’architecture de la page pour humains et machines.", ["main", "nav", "aside", "landmarks"], "Un seul <main> par page ; nav pour menus principaux.", ""],
  ["Performance", "Comment le HTML impacte-t-il les Core Web Vitals ?", "HTML et performance", "L’ordre des ressources, les attributs async/defer, les dimensions d’images et le critical CSS influencent LCP, CLS et INP.", ["LCP", "CLS", "defer", "preload"], "Réserver width/height sur images pour éviter le CLS.", '<script src="app.js" defer></script>'],
  ["Responsive", "Qu’est-ce qu’une approche mobile-first en HTML/CSS ?", "mobile-first", "Mobile-first consiste à concevoir d’abord pour petit écran puis enrichir via min-width media queries, aligné sur les usages réels.", ["mobile-first", "media queries", "progressive enhancement"], "Base fluid ; grilles complexes à partir de 768px.", ""],
  ["Balises", "Différence entre <strong> et <b>, <em> et <i> ?", "sémantique vs présentation", "strong/em portent une sémantique (importance/emphase) ; b/i sont plutôt présentationnels sans signification forte.", ["strong", "em", "sémantique"], "Erreur critique dans un formulaire : <strong>Champs obligatoires</strong>.", ""],
  ["Formulaires", "À quoi sert l’attribut autocomplete ?", "autocomplete", "autocomplete aide le navigateur à préremplir correctement (name, email, current-password), améliorant UX et accessibilité.", ["autocomplete", "UX", "password managers"], "autocomplete=\"current-password\" sur le champ mot de passe de login.", '<input type="password" name="password" autocomplete="current-password">'],
  ["HTML5", "Qu’est-ce que le DOCTYPE HTML5 ?", "DOCTYPE", "Le DOCTYPE HTML5 (<!DOCTYPE html>) place le navigateur en mode standards et évite le quirks mode.", ["doctype", "standards mode", "quirks mode"], "Toujours en première ligne du document.", "<!DOCTYPE html>"],
  ["Accessibilité", "Comment structurer une page avec une hiérarchie de titres correcte ?", "hiérarchie de titres", "Les titres h1–h6 forment un plan de document logique, sans sauter de niveaux arbitrairement, crucial pour lecteurs d’écran et SEO.", ["h1", "outline", "a11y", "SEO"], "h1 titre de page → h2 sections → h3 sous-sections.", ""],
  ["SEO", "Quel rôle joue la balise <title> et la meta description ?", "title et meta description", "Le title apparaît dans l’onglet et les SERP ; la meta description influence le snippet. Elles doivent être uniques et intentionnelles.", ["title", "meta description", "SERP"], "Title : « CDA Recruit Simulator — préparation entretien » (longueur raisonnable).", '<title>Préparer son entretien CDA</title>\n<meta name="description" content="Fiches techniques et simulations d’entretien.">'],
  ["SVG", "SVG inline vs balise img : quels critères de choix ?", "intégration SVG", "Inline permet styling/animation/accessibilité fine ; img est plus simple pour cache et isolation, mais moins flexible stylistiquement.", ["inline SVG", "img", "cache", "CSS"], "Icône colorée au hover → inline ; illustration complexe statique → img/svg.", ""],
  ["Canvas", "Canvas est-il accessible ? Quelles alternatives ?", "accessibilité canvas", "Canvas est une bitmap opaque pour les AT ; il faut alternatives textuelles, fallback DOM, ou préférer SVG pour graphiques accessibles.", ["a11y", "fallback", "ARIA"], "Graphique de données : préférer SVG + texte, ou tableau de données associé.", ""],
  ["Performance", "async vs defer sur les scripts : différences ?", "async defer", "defer préserve l’ordre et exécute après le parse HTML ; async exécute dès que téléchargé, sans garantie d’ordre.", ["async", "defer", "parser", "performance"], "Scripts dépendants de l’ordre : defer ; scripts indépendants type analytics : async possible.", '<script src="vendor.js" defer></script>\n<script src="app.js" defer></script>'],
  ["Microdata", "JSON-LD vs microdata dans le HTML : que choisir ?", "JSON-LD", "JSON-LD (script application/ld+json) est recommandé par Google : découplé du DOM, plus maintenable que microdata éparpillé.", ["JSON-LD", "microdata", "Schema.org"], "La plupart des sites modernes préfèrent JSON-LD dans le <head>.", ""],
];

const htmlSeeds = htmlTopics.map((t, i) => {
  const [sous, question, concept, definition, points, exemple, code] = t;
  return techSeed({
    prefix: "html",
    n: i + 1,
    categorie: "HTML",
    sousCategorie: sous,
    niveau: i < 12 ? "Junior" : i < 22 ? "Confirmé" : "Senior",
    difficulte: Math.min(5, 1 + Math.floor(i / 7)),
    question,
    concept,
    definition,
    points,
    exemple,
    code,
    pratiques: [
      `Valider le HTML (W3C) quand on touche à ${concept}`,
      "Tester au clavier et avec un lecteur d’écran si concerné",
      "Documenter les choix d’accessibilité dans la PR",
    ],
    motsCles: [concept, ...points.slice(0, 3), "HTML5"],
    technologies: ["HTML5", "CSS", "Accessibilité", "SEO"].slice(0, 3 + (i % 2)),
    liens: ["Accessibilité", "SEO", "Performance", "Responsive"],
    competences: ["Intégration web", "Accessibilité", "SEO technique"],
    ressources: R("mdnHtml", "w3c", "whatwg", "webdev", "mdnA11y", "caniuse"),
    piege: `réduire ${concept} à une balise sans en comprendre l’intention`,
  });
});

// Continue generating other categories in the same file - I'll write a large continuation
module.exports = {
  buildFromSeed,
  presentationSeeds,
  htmlSeeds,
  R,
  techSeed,
  RESSOURCES,
  fiche,
};
