import BasicInit from './cases/BasicInit.jsx';
import Layout from './cases/Layout.jsx';
import Performance from './cases/Performance.jsx';
import SaveToBackend from './cases/SaveToBackend.jsx';
import Filter from './cases/Filter.jsx';
import GroupBy from './cases/GroupBy.jsx';
import Editor from './cases/Editor.jsx';
import CardMenu from './cases/CardMenu.jsx';
import Tooltip from './cases/Tooltip.jsx';
import CardPopup from './cases/CardPopup.jsx';
import Styling from './cases/Styling.jsx';
import Templates from './cases/Templates.jsx';
import Locales from './cases/Locales.jsx';
import Excel from './cases/Excel.jsx';
import Toolbar from './cases/Toolbar.jsx';
import WorkOrders from './cases/WorkOrders.jsx';

export const links = [
  {
    group: '',
    items: [
      ['/base/:skin', 'Kanban de base', BasicInit, { file: 'BasicInit' }],
    ],
  },
  {
    group: 'Cartes',
    items: [
      ['/templates/:skin', 'Gabarits', Templates, { file: 'Templates' }],
      ['/styling/:skin', 'Style', Styling, { file: 'Styling' }],
      [
        '/performance/:skin',
        'Performance',
        Performance,
        { file: 'Performance' },
      ],
      ['/layout/:skin', 'Mise en page', Layout, { file: 'Layout' }],
    ],
  },
  {
    group: 'Fonctionnalités',
    items: [
      ['/filter/:skin', 'Filtrer les cartes', Filter, { file: 'Filter' }],
      ['/group-by/:skin', 'Regrouper les cartes', GroupBy, { file: 'GroupBy' }],
    ],
  },
  {
    group: 'Configuration',
    items: [
      ['/tooltip/:skin', 'Infobulle', Tooltip, { file: 'Tooltip' }],
      [
        '/card-popup/:skin',
        'Aperçu de carte',
        CardPopup,
        { file: 'CardPopup' },
      ],
      ['/card-menu/:skin', 'Menu de carte', CardMenu, { file: 'CardMenu' }],
      ['/editor/:skin', 'Éditeur', Editor, { file: 'Editor' }],
      ['/toolbar/:skin', 'Barre d’outils', Toolbar, { file: 'Toolbar' }],
      ['/locales/:skin', 'Langues', Locales, { file: 'Locales' }],
    ],
  },
  {
    group: 'Intégration',
    items: [
      [
        '/save-to-backend/:skin',
        'Sauvegarde côté serveur',
        SaveToBackend,
        { file: 'SaveToBackend' },
      ],
      ['/excel/:skin', 'Import Excel', Excel, { file: 'Excel' }],
      [
        '/work-orders/:skin',
        'Ordres de travail',
        WorkOrders,
        { file: 'WorkOrders' },
      ],
    ],
  },
];
