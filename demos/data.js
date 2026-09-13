export const users = {
  data: [
    { id: 1, label: 'Alice', img: './assets/avatar/909471384.webp' },
    { id: 2, label: 'Bob Damson', img: './assets/avatar/092352563.webp' },
    { id: 3, label: 'Carol Miller' },
  ],
};

export const card = {
  cover: true,
  priority: true,
  progress: true,
  description: true,
  deadline: true,
  tags: true,
  users,
  attachments: true,
  comments: true,
};

export function getData() {
  const columns = [
    { id: 'todo', label: 'À faire' },
    { id: 'doing', label: 'En cours', cardLimit: 2, addCard: false },
    { id: 'done', label: 'Terminé', addCard: false },
  ];

  const cards = [
    {
      id: 1,
      label: 'Rédiger la spécification kanban',
      description: 'Couvrir le modèle, l’état et le flux de données',
      column: 'done',
      cover: './assets/cover-njov.webp',
      priority: 2,
      progress: 1,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      tags: ['spec', 'docs'],
      users: [1],
      attachments: 2,
      comments: 3,
      tasks: 5,
    },
    {
      id: 2,
      label: 'Implémenter le store',
      description: 'Store de cartes + projection réactive',
      column: 'doing',
      priority: 3,
      progress: 0.6,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      tags: ['store'],
      users: [1, 2],
      comments: 4,
      tasks: 8,
    },
    {
      id: 3,
      label: 'Afficher le tableau',
      description:
        'Assembler le shell du widget et la mise en page des colonnes',
      column: 'doing',
      cover: './assets/cover-nkeo.webp',
      priority: 3,
      progress: 0.3,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      tags: ['ui'],
      users: [1, 2, 3],
      attachments: 1,
    },
    {
      id: 4,
      label: 'Connecter l’éditeur',
      description:
        'Relier le formulaire de l’éditeur à l’action de mise à jour de carte',
      column: 'todo',
      priority: 1,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      tags: ['editor'],
      attachments: 3,
      comments: 1,
      tasks: 2,
    },
  ];

  return { columns, cards };
}

const groupByStages = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'À faire' },
  { id: 'doing', label: 'En cours' },
  { id: 'review', label: 'Révision' },
  { id: 'done', label: 'Terminé' },
];

const groupByPriorities = [
  { id: 1, label: 'Faible', css: 'wx-card-priority-low' },
  { id: 2, label: 'Moyenne', css: 'wx-card-priority-medium' },
  { id: 3, label: 'Élevée', css: 'wx-card-priority-high' },
];

export function getGroupByData() {
  const columnDefaults = { addCard: false };
  const columns = {
    stage: groupByStages.map((column) => ({ ...columnDefaults, ...column })),
    priority: groupByPriorities.map(({ id, label }) => ({
      ...columnDefaults,
      id,
      label,
    })),
    user: users.data.map(({ id, label }) => ({
      ...columnDefaults,
      id,
      label,
    })),
  };

  const cards = [
    {
      id: 1,
      label: 'Collecter les retours de lancement',
      description: 'Résumer les demandes récurrentes des comptes bêta',
      stage: 'backlog',
      priority: 2,
      progress: 0.1,
      user: 1,
      tags: ['research'],
      comments: 2,
    },
    {
      id: 2,
      label: 'Actualiser le tableau d’onboarding',
      description:
        'Mettre à jour les colonnes par défaut et les tâches de démarrage',
      stage: 'todo',
      priority: 1,
      progress: 0.2,
      user: 2,
      tags: ['content'],
      attachments: 1,
    },
    {
      id: 3,
      label: 'Concevoir la vue par couloir de priorité',
      description: 'Vérifier la densité des cartes et les libellés de colonnes',
      stage: 'doing',
      priority: 3,
      progress: 0.5,
      user: 3,
      tags: ['ui'],
      comments: 4,
    },
    {
      id: 4,
      label: 'Vérifier la propriété des comptes',
      description: 'Valider que chaque carte client a un seul propriétaire',
      stage: 'review',
      priority: 2,
      progress: 0.8,
      user: 1,
      tags: ['ops'],
    },
    {
      id: 5,
      label: 'Publier les exemples mis à jour',
      description: 'Publier la documentation après validation QA',
      stage: 'done',
      priority: 1,
      progress: 1,
      user: 2,
      tags: ['docs'],
      attachments: 3,
    },
    {
      id: 6,
      label: 'Préparer la revue avec les parties prenantes',
      description: 'Rassembler captures d’écran et questions ouvertes',
      stage: 'todo',
      priority: 3,
      progress: 0.35,
      user: 3,
      tags: ['review'],
      comments: 1,
    },
    {
      id: 7,
      label: 'Auditer la checklist de release',
      description: 'Confirmer propriétaires, échéances et notes de déploiement',
      stage: 'doing',
      priority: 2,
      progress: 0.65,
      user: 1,
      tags: ['release'],
      attachments: 2,
    },
    {
      id: 8,
      label: 'Clore les tickets de support obsolètes',
      description: 'Marquer les problèmes résolus et escalader les blocages',
      stage: 'review',
      priority: 1,
      progress: 0.9,
      user: 2,
      tags: ['support'],
      comments: 3,
    },
  ].map((card) => ({ ...card, users: [card.user] }));

  return { columns, cards, priorities: groupByPriorities };
}

export function getStyledData() {
  const columns = [
    { id: 'todo', label: 'À faire', css: 'col-todo' },
    { id: 'doing', label: 'En cours', css: 'col-doing', cardLimit: 3 },
    { id: 'done', label: 'Terminé', css: 'col-done' },
  ];

  const cards = [
    {
      id: 1,
      label: 'Rédiger la spécification kanban',
      column: 'done',
      priority: 2,
      progress: 1,
      users: [1],
    },
    {
      id: 2,
      label: 'Implémenter le store',
      column: 'doing',
      priority: 3,
      progress: 0.6,
    },
    {
      id: 3,
      label: 'Afficher le tableau',
      column: 'doing',
      priority: 3,
      progress: 0.3,
      users: [2],
    },
    {
      id: 4,
      label: 'Connecter l’éditeur',
      column: 'doing',
      priority: 1,
      progress: 0,
    },
    {
      id: 5,
      label: 'Revoir le style',
      column: 'done',
      priority: 2,
      progress: 1,
    },
    {
      id: 6,
      label: 'Peaufiner la documentation',
      column: 'todo',
      priority: 1,
      progress: 0,
    },
    {
      id: 7,
      label: 'Trier les retours',
      column: 'todo',
      priority: 2,
      progress: 0,
      css: 'card-pinned',
    },
  ];

  return { columns, cards };
}

const generatedColumns = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'À faire' },
  { id: 'doing', label: 'En cours' },
  { id: 'review', label: 'Révision' },
  { id: 'done', label: 'Terminé' },
];

export function getGeneratedData(cardsPerColumn = 25) {
  const columns = generatedColumns.map((column) => ({ ...column }));
  const cards = columns.flatMap((column, columnIndex) =>
    Array.from({ length: cardsPerColumn }, (_, cardIndex) => {
      const id = columnIndex * cardsPerColumn + cardIndex + 1;

      return {
        id,
        label: `Carte générée ${id}`,
        description: `Carte générée ${cardIndex + 1} dans ${column.label}`,
        column: column.id,
        priority: (cardIndex % 3) + 1,
        progress: ((cardIndex % 10) + 1) / 10,
        tags: [
          `group-${columnIndex + 1}`,
          `batch-${Math.floor(cardIndex / 25) + 1}`,
        ],
        users: [(cardIndex % 5) + 1],
      };
    }),
  );

  return { columns, cards };
}
