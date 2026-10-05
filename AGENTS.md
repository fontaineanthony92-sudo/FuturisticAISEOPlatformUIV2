# NexusSEO — consignes de développement

## Description du produit

NexusSEO est une plateforme SaaS de création et de gestion de contenus SEO. Elle doit permettre de rechercher des opportunités SEO, de générer des articles avec une IA, de les éditer et améliorer, de les enrichir avec des images, de les stocker, puis de les publier sur WordPress. Elle doit aussi afficher des données SEO de Google Search Console et des données de trafic de Google Analytics.

## Workflow principal

**Recherche SEO → Génération → Édition → Enrichissement → Révision → Publication**

Préserver ce parcours et avancer fonctionnalité par fonctionnalité.

## Stack technique

### État actuel du dépôt

- Frontend React avec TypeScript (fichiers `.tsx`), construit avec Vite.
- Styles CSS, Tailwind CSS 4 et composants UI issus de l’export Figma Make (notamment des composants de style shadcn/ui).
- L’interface est une maquette exportée depuis Figma Make. L’application est principalement regroupée dans `src/app/App.tsx`, avec l’enrichissement visuel dans `src/app/components/VisualEnrichment.tsx`.
- Le dépôt actuel ne contient pas de backend, de configuration TypeScript (`tsconfig`) ni d’intégration de services. Certaines vues et données sont simulées pour la maquette.
- Les commandes disponibles dans `package.json` sont `npm run dev` et `npm run build`.

### Cible pour le développement

- Conserver React / Vite / TypeScript pour le frontend.
- Utiliser Node.js / TypeScript pour le backend à mettre en place.
- Garder le code simple, organisé et lisible pour un non-développeur. Séparer progressivement les responsabilités au fil des fonctionnalités, sans refonte générale inutile.

## Règles de développement

- Implémenter une fonctionnalité à la fois et conserver le parcours existant.
- Préserver au maximum le frontend et les composants déjà présents.
- **Ne jamais modifier le design, la mise en page, les couleurs, la typographie ou les interactions visuelles sans demande explicite.** Les changements visuels strictement nécessaires à une fonctionnalité doivent rester minimaux.
- Ne pas remplacer la stack React / Vite / TypeScript.
- Ne pas intégrer Semrush : son coût est trop élevé pour le projet à ce stade.
- Distinguer clairement les données de démonstration des données réelles provenant des futures intégrations.
- Ajouter ou modifier uniquement les fichiers nécessaires à la fonctionnalité en cours.

## Règles de sécurité

- Toutes les clés API, tous les secrets, jetons d’accès et identifiants sensibles doivent rester côté serveur.
- Ne jamais placer de secret dans le frontend, le dépôt, le code livré au navigateur ou une variable `VITE_*` (les variables Vite sont exposées au client).
- Le frontend appelle le backend ; le backend valide les entrées et effectue les appels aux services tiers.
- Charger les secrets depuis la configuration serveur de l’environnement et ne pas les journaliser.
- Protéger les données et jetons des utilisateurs, en particulier lors de la connexion à des services tiers.

## Intégrations prévues

- Supabase
- OpenAI
- WordPress REST API
- Google Search Console
- Google Analytics

Ces intégrations sont prévues ; elles ne sont pas encore présentes dans le dépôt actuel. Ne pas ajouter Semrush.
