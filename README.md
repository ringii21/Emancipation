# Refuge

Application web personnelle de gestion émotionnelle, installable sur iPhone (PWA).
Une « thérapeute de poche » : un endroit où aller quand ça ne va pas, et un endroit
où travailler sur soi quand ça va.

Ce n'est pas un produit. C'est un outil construit pour une personne. Le contexte, les
intentions et les décisions de conception sont dans [`PROJET.md`](PROJET.md) — à lire
avant toute modification.

## Les six modules

| # | Module | État |
|---|---|---|
| 1 | **La Clé** — les 24 semaines du cours de Haanel (1912) | ✅ livré |
| 2 | **Le refuge** — chat réconfortant, disponible sans condition | ⬜ à venir |
| 3 | **Rituel du matin** — auto-affirmation, manifestation | ⬜ à venir |
| 4 | **Pensées constructives** — TCC, ACT, cohérence cardiaque | ⬜ à venir |
| 5 | **Couper une habitude** | ⬜ à venir |
| 6 | **Gourmet** — recettes selon l'envie | ⬜ à venir |

Un module à la fois, validé avant le suivant. La Clé est livrée en premier parce qu'elle
était la plus structurée, pas parce qu'elle est la plus importante.

## Module 1 — La Clé

- **24 semaines** déverrouillées dans l'ordre : chaque semaine s'ouvre après 7 séances de
  la précédente. C'est la consigne de Haanel, pas une contrainte inventée.
- **Minuteur de séance** (15 / 20 / 30 min), écran maintenu allumé, vibration finale.
- **Lecture commentée** : chaque paragraphe suivi de son décodage en français
  d'aujourd'hui — honnête, pas révérencieux (ce qui est daté, faux ou dangereux est
  signalé). La Partie 1 est publiée ; les suivantes arrivent au rythme réel.
- **Voix** : enregistrement de sa propre lecture paragraphe par paragraphe, relecture
  ensuite ; synthèse vocale pour les consignes d'exercice.
- **Carnet** : une ligne après chaque séance, si on veut.
- **Français / 日本語** — bascule par un bouton, choix mémorisé, progression partagée.

## Principes techniques

- **PWA, pas de natif.** Fichiers statiques servis tels quels. **Zéro build** : pas de
  bundler, pas de framework, pas de dépendances. Une modification = un fichier édité =
  un `git push`.
- **Tout est local.** Aucun serveur, aucun compte, aucune synchronisation, aucune
  télémétrie. Le contenu est intime ; il ne quitte pas l'appareil.

| Donnée | Stockage | Perdue si… |
|---|---|---|
| Progression, carnet, langue | `localStorage` (clé `mk`) | données du site effacées |
| Enregistrements vocaux | IndexedDB (`lacle-voice`) | données du site effacées, app supprimée |

Les enregistrements représentent un vrai travail et **ne sont sauvegardés nulle part**.

## Structure du dépôt

```
index.html              coquille : structure des panneaux, chargement des scripts
styles.css              thème sombre encre, mise en page
fonts.css + fonts/      polices latines auto-hébergées (aucun appel à Google)
js/                     scripts classiques, chargés dans l'ordre, globaux nommés :
  i18n.js                 dictionnaires FR / JA
  storage.js              localStorage (mk) + IndexedDB (voix)
  voice.js                enregistrement, relecture, synthèse vocale
  reader.js               lecture commentée paragraphe par paragraphe
  session.js              minuteur de séance
  app.js                  amorçage, navigation, rendu
data/weeks.{fr,ja}.json contenu des 24 semaines
content/                lectures commentées, un JSON par partie et par langue
  index.json              parties réellement publiées (fait foi)
  part-NN.{fr,ja}.json    texte traduit + glose ; le § d'exercice porte "exo": true
sources/                textes sources (PDF de Haanel, 1912)
sw.js                   cache hors-ligne
manifest.webmanifest    nom, icônes, couleurs de l'app installée
icons/                  180 / 192 / 512 px + maskable
demo/index.html         maquette d'origine, figée — référence de comportement du module 1
```

`content/index.json` distingue « semaine verrouillée » de « lecture pas encore écrite ».
Un fichier peut exister dans `content/` sans y être listé : traduction préparée d'avance,
non publiée.

Le japonais n'utilise aucune police téléchargée : il s'appuie sur Hiragino Mincho,
présent sur tous les iPhone.

## Développement en local

Un serveur HTTP est nécessaire (les contenus sont chargés par `fetch`) :

```
python -m http.server 8321 --directory .
```

puis `http://localhost:8321`. Dans les DevTools, activer **Application → Service Workers →
Update on reload** pour ne pas servir l'ancienne version depuis le cache pendant le travail.

## Installer sur iPhone

1. Ouvrir l'adresse **dans Safari** (l'installation n'existe que dans Safari sur iOS).
2. Bouton **Partager**.
3. **Sur l'écran d'accueil**.

L'app apparaît comme n'importe quelle autre : icône, plein écran, hors ligne une fois
ouverte une première fois.

## Déploiement

Site statique, aucun build. Cible envisagée : GitHub Pages (Settings → Pages → branche
`main`, dossier racine) ou Netlify (commande de build vide, dossier de publication `.`).
Chaque `git push` redéploie. HTTPS obligatoire — le micro et le service worker ne
fonctionnent pas en HTTP ; les deux hébergeurs le fournissent.

> **À chaque déploiement, incrémenter `VERSION` dans `sw.js`.** Sinon le service worker
> sert l'ancienne version depuis le cache. (Aucun déploiement n'a encore eu lieu :
> `VERSION` reste à 1 jusqu'au premier.)

## Droits

Le texte de Haanel (1912) est dans le domaine public. **Les traductions française et
japonaise de ce dépôt sont faites depuis l'anglais original** — elles ne reprennent aucune
traduction publiée, qui serait une œuvre protégée séparément même quand l'original ne l'est
plus. Les commentaires sont du contenu original.

## Limites connues

- La lecture commentée n'existe pour l'instant que pour la **Partie 1** (la Partie 2 est
  traduite mais pas encore publiée). Les autres semaines n'ont que leur exercice.
- La traduction japonaise est une traduction de travail, non relue par un locuteur natif.
- Le micro exige iOS 14.3 ou plus récent en mode écran d'accueil.
- La synthèse vocale se coupe quand l'écran se verrouille (limite iOS).
- **Partie 22** : Haanel affirme que la pensée juste détruit la maladie. C'est faux et
  potentiellement dangereux ; l'avertissement dans l'app **doit être conservé**.
