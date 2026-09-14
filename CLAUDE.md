# CLAUDE.md

Contexte pour Claude Code sur ce dépôt.

## Nature du projet

Ce dépôt est la librairie de composants **`@svar-ui/react-kanban`** (open-source, `src/`, démos dans
`demos/`). Elle sert de brique UI à l'application cible : un **frontend React consommant un BFF Spring
Boot** pour construire des tableaux **Kanban et Scrum façon JIRA** (colonnes, cartes, ordres de travail
liés, à terme sprints/epics).

Ne pas confondre les deux couches :

- `src/` : composants génériques du kanban (`Kanban`, `Editor`, `Column`, `CardList`, thèmes, etc.),
  publiés sur npm, sans connaissance du BFF.
- L'application consommatrice (à construire / en cours de construction) : branche `Kanban` sur les
  données réelles du BFF via `RestDataProvider` (ou un provider custom) + logique métier JIRA-like.

## Le BFF

- Titre : **Work Order BFF API** (Spring Boot).
- Base URL locale : `http://localhost:8080`
- Swagger UI : `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON : `http://localhost:8080/v3/api-docs`
- Rôle : expose les **colonnes** et **cartes** persistées pour le `RestDataProvider` du frontend, plus la
  gestion des **ordres de travail** ("Work Orders") liés aux cartes du kanban — c'est l'équivalent des
  issues/tâches détaillées façon JIRA, rattachées à une carte du board.

### Endpoints

**Columns** (`/api/columns`)

- `GET /api/columns` — liste les colonnes dans l'ordre d'affichage → `BoardColumnResponse[]`
- `POST /api/columns` — crée une colonne (`BoardColumnRequest { label }`) → `BoardColumnResponse`

**Cards** (`/api/cards`)

- `GET /api/cards` — liste les cartes → `CardResponse[]`
- `POST /api/cards` — crée une carte (`CardRequest`) → `CardResponse`
- `PUT /api/cards/{id}` — met à jour une carte (`CardRequest`) → `CardResponse`
- `DELETE /api/cards/{id}` — supprime une carte
- `PUT /api/cards/{id}/move` — déplace une carte (`MoveCardRequest { column, before }`) → `CardResponse`
- `POST /api/cards/{id}/duplicate` — duplique une carte (`CardRequest`) → `CardResponse`

**Work Orders** (`/api/work-orders`)

- `GET /api/work-orders?arg0={kanbanCardId}` — liste, filtrable par id de carte kanban → `WorkOrderResponse[]`
- `GET /api/work-orders/{id}` — récupère par id → `WorkOrderResponse`
- `POST /api/work-orders` — crée (`WorkOrderRequest`) → `WorkOrderResponse`
- `PUT /api/work-orders/{id}` — met à jour (`WorkOrderRequest`) → `WorkOrderResponse`
- `DELETE /api/work-orders/{id}` — supprime
- `PATCH /api/work-orders/{id}/link` — lie un ordre de travail à une carte (`LinkCardRequest { kanbanCardId }`) → `WorkOrderResponse`

### Schémas principaux

```
BoardColumnResponse { id: string, label: string, position: int }
BoardColumnRequest  { label: string (required) }

CardRequest/Response {
  label: string (required), description?: string, column: string (= id de colonne),
  priority?: int, progress?: double, deadline?: date-time,
  createdAt/updatedAt (Response only)
}

WorkOrderRequest/Response {
  title: string (required), description?: string,
  status: enum [BACKLOG, IN_PROGRESS, DONE],
  priority?: int, assignee?: string, dueDate?: date,
  kanbanCardId?: int64 (lien vers la carte kanban),
  createdAt/updatedAt (Response only)
}

MoveCardRequest  { column?: string, before?: int64 (id de la carte devant laquelle insérer) }
LinkCardRequest  { kanbanCardId: int64 }
```

## Intégration frontend ↔ BFF

Le composant expose `RestDataProvider` (`@svar-ui/kanban-provider`, voir
`demos/cases/WorkOrders.jsx` pour le pattern d'usage). Il ne couvre **que les cartes** :
`getData()` (GET), `add-card` (POST), `update-card` (PUT), `move-card` (PUT `/move`), `delete-card`
(DELETE), `duplicate-card` (POST `/duplicate`) — chemins relatifs à l'URL de base passée au provider.

Points d'attention pour brancher le BFF :

- Instancier `RestDataProvider` avec la base `http://localhost:8080/api` (le provider construit
  `${base}/cards`, `${base}/cards/{id}`, etc. — cohérent avec les routes `/api/cards*` du BFF).
- **Colonnes et Work Orders ne sont pas gérés par `RestDataProvider`** : il faut soit étendre ce
  provider, soit charger `/api/columns` séparément au montage et gérer les Work Orders via des appels
  dédiés (le lien se fait via `kanbanCardId` / `PATCH .../link`), potentiellement avec
  `api.intercept(...)` côté `Kanban` pour synchroniser.
- Les ids de colonnes du BFF sont des `string` générées côté serveur (pas les ids fixes `'todo'`,
  `'doing'`, `'done'` utilisés dans les démos locales) — ne pas coder en dur les ids de colonnes côté
  frontend, toujours les récupérer via `GET /api/columns`.

## Écart avec l'ambition "Scrum façon JIRA"

Le BFF actuel ne couvre que Colonnes/Cartes/Work Orders (statut simple BACKLOG/IN_PROGRESS/DONE,
priorité, assigné, échéance). Il n'y a **pas encore** de notion de sprint, epic, story points ou backlog
produit séparé du board — à considérer comme des extensions futures du BFF, pas des fonctionnalités
disponibles aujourd'hui. Ne pas supposer leur existence côté frontend sans vérifier le swagger.

## Commandes utiles (librairie)

- `npm run dev` — lance Vite (démos) avec le kanban
- `npm run build` — build la librairie (`dist/`)
- `npm run lint` — ESLint (`no-unused-vars`, règles React/hooks ; `exhaustive-deps` désactivé
  volontairement, cf. `eslint.config.js`)
- `npm run prettier` — formatte `src/` et `demos/`
