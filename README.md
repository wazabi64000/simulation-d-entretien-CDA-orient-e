# CDA Recruit Simulator

Encyclopédie francophone de préparation aux entretiens techniques pour **Concepteurs Développeurs d’Applications (CDA)**.

**Démo :** https://wazabi64000.github.io/simulation-d-entretien-CDA-orient-e/

## Stack

- HTML5
- CSS3
- JavaScript ES6
- Aucun framework, aucune librairie, aucun CDN, aucun backend

## Fonctionnalités

- **758 fiches** d’entretien (notions, réponses attendues, erreurs fréquentes, conseils recruteur, ressources)
- Recherche **plein texte**
- Filtres : catégorie, difficulté, niveau, technologie, mot-clé
- Mode **simulation** d’entretien (question aléatoire)
- **Favoris** (stockage local)
- Mode clair / sombre
- Contenu structuré pour indexation **RAG**

## Domaines couverts

Présentation professionnelle, HTML, CSS, JavaScript, TypeScript, React, Node.js, SQL, Git, API, Architecture logicielle, Tests, Sécurité, DevOps, Linux, Cloud, IA, UX/UI, Gestion de projet.

## Lancer en local

Ouvrir `index.html` dans un navigateur, ou servir le dossier :

```bash
python3 -m http.server 8080
```

Puis ouvrir http://localhost:8080

## Structure

```
index.html
css/styles.css
js/app.js
js/search.js
js/ui.js
js/data/fiches.js
scripts/generate-fiches.js
scripts/generate-fiches-part1.js
```

## Régénérer la base de connaissances

```bash
node scripts/generate-fiches.js
```

## Palette

Tons violet et vert : `#9A65AD` · `#F0C7FF` · `#E5AAFA` · `#91AD53` · `#E1FAAA`
