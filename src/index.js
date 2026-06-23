import pkg from '../package.json';
const version = pkg.version;

import Kanban from './components/Kanban.jsx';
import Editor from './components/Editor.jsx';
import ContextMenu from './components/ContextMenu.jsx';
import Toolbar from './components/Toolbar.jsx';
import Willow from './themes/Willow.jsx';
import WillowDark from './themes/WillowDark.jsx';

export { Kanban, Editor, ContextMenu, Toolbar, Willow, WillowDark, version };

export { RestDataProvider } from '@svar-ui/kanban-provider';

export {
  getCardShape,
  getEditorItems,
  getPriorityOptions,
} from './defaults.js';

export { getMenuOptions, getToolbarItems } from '@svar-ui/kanban-store';

export { registerEditorItem } from '@svar-ui/react-editor';
