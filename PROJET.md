# Refuge — brief projet

> À lire intégralement avant toute modification.
> Ce document est le contexte à fournir à un agent (Claude Code ou autre) qui travaille sur ce
> projet. Il décrit l'intention, pas seulement le code.

---

## 1. Ce qu'est le projet

Une application personnelle de gestion émotionnelle pour iPhone. L'image directrice donnée par
la propriétaire du projet : **« une thérapeute de poche »**. Un endroit où aller quand ça ne va
pas, et un endroit où travailler sur soi quand ça va.

Ce n'est pas un produit destiné au marché. C'est un outil construit pour une personne, partagé
éventuellement avec deux ou trois proches. Toute décision qui améliore la « scalabilité » au
détriment de l'usage quotidien d'une seule personne est une mauvaise décision ici.

**Le cours de Haanel (`index.html`) est un module parmi six.** C'est le premier livré parce
qu'il était le plus structuré, pas parce qu'il est le plus important.

## 2. Les six modules

| # | Module | État | Description |
|---|---|---|---|
| 1 | **La Clé** — cours de Haanel | ✅ livré | 24 semaines verrouillées, minuteur, lecture commentée, voix, FR/JA |
| 2 | **Le refuge** — chat réconfortant | ⬜ non commencé | Disponible en permanence, sans exigence. On y va quand ça ne va pas. Sert aussi à nommer ce qu'on veut améliorer. |
| 3 | **Rituel du matin** | ⬜ non commencé | Auto-affirmation, positivité, manifestation. |
| 4 | **Pensées constructives** | ⬜ non commencé | Exercices de type thérapeutique : TCC, ACT, cohérence cardiaque. |
| 5 | **Couper une habitude** | ⬜ non commencé | Sortir d'un comportement subi. |
| 6 | **Gourmet** | ⬜ non commencé | Recettes selon l'envie du moment : healthy / gourmet / gras / sucré. |

### Le point de conception le plus important du projet

**Le module 1 et le module 2 obéissent à des logiques opposées, et il ne faut jamais les
contaminer l'une par l'autre.**

- **La Clé (module 1)** = discipline, exigence, verrous. On ne peut pas sauter une semaine. Le
  refus d'avancer fait partie de la méthode. L'app dit non.
- **Le refuge (module 2)** = l'inverse exact. Immédiatement disponible, aucune condition,
  aucune série à ne pas briser, aucune culpabilisation, aucun décompte. On y arrive à trois
  heures du matin sans avoir rien fait depuis six semaines, et il ne le fait jamais remarquer.

Si un jour le refuge se met à afficher une progression, un streak ou un rappel, c'est un bug de
conception, pas une fonctionnalité.

### Contraintes spécifiques déjà connues

- **Module 5 (habitudes)** : la propriétaire a un problème d'habitudes réel. Lien noté avec
  Haanel semaine 20 — forcer par la volonté échoue et renforce l'échec. Le module ne doit pas
  reposer sur « tenir bon ». Prévoir l'échec dans la conception, sans punition.
- **Module 3 (manifestation)** : inspiré de *Le Secret* de Rhonda Byrne. Ce livre est
  **sous droits (2006)**. On encode la méthode, jamais le texte. Aucune citation, aucune
  paraphrase serrée. Ne pas commencer ce module avant que la source ait été fournie.

## 3. Décisions techniques prises (ne pas rouvrir sans raison)

- **PWA, pas d'app native.** Pas de Mac, pas de Xcode, pas de compte développeur à 99 €/an, pas
  de validation Apple. Le natif sera reconsidéré si et seulement si l'usage quotidien est
  installé depuis plusieurs mois.
- **Tout est local.** Pas de serveur, pas de compte, pas de synchronisation, pas de télémétrie.
  Le contenu est intime ; il ne quitte pas l'appareil.
- **Zéro build.** Fichiers statiques servis tels quels. Pas de bundler, pas de framework, pas de
  `npm run build`. Une modification = un fichier édité = un `git push`.
- **Un module à la fois, validé avant le suivant.** Décision explicite, qui reproduit
  volontairement la logique de verrouillage de Haanel.
- **Domaine public uniquement pour les textes sources.** Haanel (mort en 1949) est libre. Les
  traductions récentes ne le sont pas — d'où la retraduction depuis l'anglais.

## 4. Direction artistique

Thème sombre encre. À conserver d'un module à l'autre — c'est ce qui en fera une app et non une
collection d'outils.

```
--ink   #0E141A   fond
--ink2  #161F28   cartes
--ink3  #1E2A35   éléments inactifs
--line  #2A3742   bordures
--paper #E6E4DC   texte
--muted #7E8B97   texte secondaire
--brass #D2B071   accent principal (or laiton)
--sage  #83A38C   accent secondaire (avertissements, notes)
```

Polices : **Fraunces** (titres), **Spectral** (corps de texte long), **DM Sans** (interface).
En japonais, bascule automatique sur Hiragino Mincho avec un interlignage plus généreux.

Registre : sobre, adulte, sans emoji décoratif, sans exclamation, sans encouragement automatique.
L'app ne félicite pas. Elle constate.

## 5. Ton des contenus écrits — le point le plus facile à rater

Les commentaires qui accompagnent le texte de Haanel sont **honnêtes, pas révérencieux**. C'est
le calibrage validé, et il doit être reproduit à l'identique pour les parties restantes :

- Signaler explicitement les paragraphes qui ne font que répéter le précédent
  (« reformulation du 8 », « passe vite »). Ne pas faire semblant que tout est profond.
- Signaler ce qui est **faux** : la physiologie de 1912, le plexus solaire siège du subconscient,
  la biologie fantaisiste du §34.
- Signaler ce qui est **dangereux**, avec un garde-fou explicite. Cas critique : **semaine 22**,
  où Haanel affirme que la pensée juste détruit toute maladie. L'avertissement
  (« ne remplace pas un médecin par une méditation ») est non négociable et ne doit jamais être
  retiré, y compris si un futur module reprend ce contenu.
- Insister sur les rares paragraphes réellement porteurs plutôt que de tout traiter à plat.

Autrement dit : le projet respecte la méthode sans être crédule. Un module de bien-être qui
ment sur la santé est un module raté.

## 6. Public et langues

Utilisatrice principale francophone. Interface et contenus disponibles en **français** et en
**japonais**, bascule par un bouton, choix mémorisé, progression partagée entre les deux.

Tout nouveau module doit être bilingue dès sa conception : les chaînes d'interface passent par
les dictionnaires `FRUI` / `JA.ui`, jamais en dur dans le HTML.

Réserve : la traduction japonaise est une traduction de travail, non relue par un locuteur natif.

## 7. Comment travailler sur ce dépôt

1. **Lire le code avant d'écrire.** Tout est dans `index.html` : structure, styles, données,
   logique. C'est volontairement monolithique.
2. **Ne pas réécrire l'existant pour le « moderniser ».** Pas de migration vers React, pas de
   découpage en modules ES, pas d'ajout de dépendances. La contrainte est assumée.
3. **Ne jamais utiliser `localStorage` pour du binaire.** Les données audio vont dans IndexedDB
   (`lacle-voice`). Le reste tient dans `localStorage` sous la clé `mk`.
4. **Vérifier avant de livrer.** Contrôle syntaxique du JavaScript, puis rendu réel dans un DOM
   (jsdom suffit) dans les deux langues. Ne pas livrer un fichier jamais exécuté.
5. **Incrémenter `VERSION` dans `sw.js`** à chaque déploiement, sinon les utilisatrices reçoivent
   l'ancienne version depuis le cache.
6. **Tester sur un vrai iPhone** pour tout ce qui touche au micro, à la synthèse vocale ou au
   maintien de l'écran. Le comportement de Safari en mode écran d'accueil diffère de Safari
   classique.

## 8. Reste à faire, par ordre

1. **Parties 2 à 24** du lecteur commenté — au rythme de la progression réelle, pas d'avance.
   Extraire l'exercice de chaque partie (dernier paragraphe avant « Questions d'étude »),
   traduire depuis l'anglais de 1912, commenter au ton décrit en §5.
2. **Indicateur de contenu disponible** : rien ne distingue actuellement « semaine verrouillée »
   de « lecture pas encore écrite ». À corriger.
3. **Module 2, le refuge** — le plus attendu, et le plus délicat. Relire §2 avant de commencer.
4. Modules 3 à 6.

## 9. Ce qu'il ne faut pas faire

- Ajouter des notifications, des séries, des badges ou toute mécanique de culpabilisation.
- Envoyer quoi que ce soit sur un serveur.
- Traiter le refuge comme un module de discipline.
- Adoucir les avertissements de santé.
- Réintroduire du texte issu d'une traduction publiée sous droits.
- Livrer du code non exécuté.
