import { useState, useEffect, useMemo, useContext } from 'react';
import { Toolbar } from '@svar-ui/react-toolbar';
import { locale } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/kanban-locales';
import { en as coreEn } from '@svar-ui/core-locales';
import { getToolbarItems } from '@svar-ui/kanban-store';
import { context } from '@svar-ui/react-core';
import './Toolbar.css';

const scope = 'wx-aacuJX0A';

const sortOptions = {
  'sort-label-asc': { field: 'label', dir: 'asc' },
  'sort-label-desc': { field: 'label', dir: 'desc' },
  'sort-priority-asc': { field: 'priority', dir: 'asc' },
  'sort-priority-desc': { field: 'priority', dir: 'desc' },
};

const emptyHistory = { undo: 0, redo: 0 };
const historyActions = ['undo', 'redo'];

function ToolbarComponent(props) {
  const {
    api = null,
    items = [],
    undo = false,
    sort = false,
    add = true,
  } = props;

  let l = useContext(context.i18n);
  if (!l) {
    l = locale({ ...en, ...coreEn });
  }
  const _ = l.getGroup('kanban');

  const historyStore = api ? api.getReactiveState().history : null;
  const [history, setHistory] = useState(historyStore?.get?.() ?? emptyHistory);

  useEffect(() => {
    if (!historyStore) return;
    const unsub = historyStore.subscribe((v) => {
      setHistory(v);
    });
    return unsub;
  }, [historyStore]);

  function defaultHandler(id) {
    if (!api) return;
    if (id === 'add-card') {
      api.exec('add-card', { card: {}, edit: true });
    } else if (id === 'undo' || id === 'redo') {
      api.exec(id, {});
    } else if (id === 'sort-clear') {
      api.exec('sort-cards', { sort: null });
    } else if (id in sortOptions) {
      api.exec('sort-cards', { sort: sortOptions[id] });
    }
  }

  function prepareItem(item) {
    const next = { ...item };
    const id = typeof next.id === 'string' ? next.id : '';

    if (next.items) {
      next.items = next.items.map(prepareItem);
    }
    if (next.text) next.text = _(next.text);
    if (next.menuText) next.menuText = _(next.menuText);
    if (next.title) next.title = _(next.title);
    if (historyActions.includes(id)) {
      next.disabled = id === 'undo' ? !history?.undo : !history?.redo;
    }

    if (!next.handler && id) {
      next.handler = () => defaultHandler(id);
    }
    return next;
  }

  const finalItems = useMemo(() => {
    const buttons = items.length ? items : getToolbarItems({ undo, sort, add });
    return buttons.map(prepareItem);
  }, [items, undo, sort, add, history, _]);

  return (
    <div className={`wx-root ${scope}`}>
      <Toolbar items={finalItems} />
    </div>
  );
}

export default ToolbarComponent;
