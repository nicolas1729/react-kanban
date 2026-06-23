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


export const links = [
  {
    group: '',
    items: [['/base/:skin', 'Basic Kanban', BasicInit, { file: 'BasicInit' }]],
  },
  {
    group: 'Cards',
    items: [
      ['/templates/:skin', 'Templates', Templates, { file: 'Templates' }],
      ['/styling/:skin', 'Styling', Styling, { file: 'Styling' }],
      [
        '/performance/:skin',
        'Performance',
        Performance,
        { file: 'Performance' },
      ],
      ['/layout/:skin', 'Layout', Layout, { file: 'Layout' }],
    ],
  },
  {
    group: 'Features',
    items: [
      ['/filter/:skin', 'Filter Cards', Filter, { file: 'Filter' }],
      ['/group-by/:skin', 'Group Cards', GroupBy, { file: 'GroupBy' }],
    ],
  },
  {
    group: 'Configuration',
    items: [
      ['/tooltip/:skin', 'Tooltip', Tooltip, { file: 'Tooltip' }],
      ['/card-popup/:skin', 'Card Preview', CardPopup, { file: 'CardPopup' }],
      ['/card-menu/:skin', 'Card Menu', CardMenu, { file: 'CardMenu' }],
      ['/editor/:skin', 'Editor', Editor, { file: 'Editor' }],
      ['/toolbar/:skin', 'Toolbar', Toolbar, { file: 'Toolbar' }],
      ['/locales/:skin', 'Locales', Locales, { file: 'Locales' }],
    ],
  },
  {
    group: 'Integration',
    items: [
      [
        '/save-to-backend/:skin',
        'Save to Backend',
        SaveToBackend,
        { file: 'SaveToBackend' },
      ],
      ['/excel/:skin', 'Excel Import', Excel, { file: 'Excel' }],
    ],
  },
];
