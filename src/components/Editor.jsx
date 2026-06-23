import { useState, useEffect, useMemo, useContext } from 'react';
import { Editor as EditorBase, registerEditorItem } from '@svar-ui/react-editor';
import { DatePicker, MultiCombo, RichSelect, Slider } from '@svar-ui/react-core';
import { locale } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/kanban-locales';
import { en as coreEn } from '@svar-ui/core-locales';
import { getEditorItems } from '../defaults.js';
import { context } from '@svar-ui/react-core';
import './Editor.css';

registerEditorItem('richselect', RichSelect);
registerEditorItem('multicombo', MultiCombo);
registerEditorItem('datepicker', DatePicker);
registerEditorItem('slider', Slider);

function Editor(props) {
  const {
    api,
    items = getEditorItems(),
    placement = 'sidebar',
    layout = 'default',
    focus = true,
    css = '',
    topBar,
    autoSave = true,
    onChange,
    onSave,
    onAction,
    ...editorProps
  } = props;

  let l = useContext(context.i18n);
  if (!l) {
    l = locale({ ...en, ...coreEn });
  }
  const _ = l.getGroup('kanban');

  const { editorData: editorDataStore } = api.getReactiveState();
  const [editorData, setEditorData] = useState(editorDataStore.get?.() ?? null);

  useEffect(() => {
    const unsub = editorDataStore.subscribe((v) => {
      setEditorData(v);
    });
    return unsub;
  }, [editorDataStore]);

  function translate(value) {
    return typeof value === 'string' ? _(value) : value;
  }

  function applyLocale(list) {
    return list.map((item) => {
      const next = { ...item };
      next.label = translate(next.label);
      if (Array.isArray(next.options)) {
        next.options = next.options.map((opt) => ({
          ...opt,
          label: translate(opt.label),
        }));
      }
      return next;
    });
  }

  const cItems = useMemo(() => applyLocale(items), [items, _]);

  const defaultTopBar = {
    items: [
      { comp: 'icon', icon: 'wxi-close', id: 'close' },
      { comp: 'spacer' },
      {
        comp: 'button',
        id: 'delete',
        text: _('Delete'),
        type: 'primary danger',
        onClick: handleDelete,
      },
    ],
  };
  const editorTopBar = useMemo(
    () => (topBar === undefined ? defaultTopBar : topBar),
    [topBar, _],
  );
  const editorCss = useMemo(
    () => ['wx-editor-kanban', css].filter(Boolean).join(' '),
    [css],
  );

  function handleSave(ev) {
    onSave?.(ev);
    const data = editorData;
    if (!data) return;
    api.exec('update-card', { id: data.id, card: { ...ev.values } });
  }

  function handleChange(ev) {
    onChange?.(ev);
  }

  function handleDelete() {
    const data = editorData;
    if (!data) return;
    api.exec('delete-card', { id: data.id });
    api.exec('select-card', { id: null });
  }

  function handleAction(ev) {
    onAction?.(ev);
    const { item } = ev;
    if (item.id === 'close' && !!item.comp) {
      api.exec('select-card', { id: null });
    }
  }

  if (!editorData) return null;

  return (
    <EditorBase
      {...editorProps}
      focus={focus}
      items={cItems}
      topBar={editorTopBar}
      autoSave={autoSave}
      onChange={handleChange}
      onAction={handleAction}
      onSave={handleSave}
      placement={placement}
      layout={layout}
      values={editorData}
      css={editorCss}
    />
  );
}

export default Editor;
