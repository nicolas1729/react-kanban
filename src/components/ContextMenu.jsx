import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import { ContextMenu } from '@svar-ui/react-menu';
import { getID, locale } from '@svar-ui/lib-dom';
import { en as coreEn } from '@svar-ui/core-locales';
import { en } from '@svar-ui/kanban-locales';
import { context } from '@svar-ui/react-core';
import { getMenuOptions } from '@svar-ui/kanban-store';
import { KanbanApiContext } from '../context.js';
import './ContextMenu.css';

const scope = 'wx-aabVVMuD';

const KanbanContextMenu = forwardRef(function KanbanContextMenu(props, ref) {
  const {
    options = [],
    api = null,
    resolver = null,
    filter = null,
    at = 'point',
    children,
    onClick,
    css,
  } = props;

  const ctxApi = useContext(KanbanApiContext);

  let l = useContext(context.i18n);
  if (!l) {
    l = locale({ ...en, ...coreEn });
  }

  const _ = l.getGroup('kanban');

  const menuRef = useRef(null);
  const activeIdRef = useRef(null);

  useImperativeHandle(ref, () => ({
    show(ev, obj) {
      menuRef.current?.show(ev, obj);
    },
  }));

  function parseId(id) {
    if (typeof id === 'string' && id.startsWith(':')) {
      const element = document.createElement('div');
      element.setAttribute('data-id', id);
      return getID(element);
    }
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  }

  function getCardById(id) {
    const cardId = parseId(id);
    if (cardId == null) return undefined;
    if (api) return api.getCards().find((c) => c.id === cardId);
    return ctxApi?.getState().cards.getById(cardId);
  }

  function exec(action, payload) {
    (api ?? ctxApi)?.exec(action, payload);
  }

  function applyLocale(opts) {
    return opts.map((op) => {
      op = { ...op };
      if (op.text) op.text = _(op.text);
      if (op.subtext) op.subtext = _(op.subtext);
      if (op.data) op.data = applyLocale(op.data);
      return op;
    });
  }

  const cOptions = useMemo(() => {
    const base = options.length ? options : getMenuOptions();
    return applyLocale(base);
  }, [options, _]);

  const itemResolver = useCallback(
    (rawId, ev) => {
      if (rawId == null) return null;

      const card = getCardById(rawId);
      if (!card) return null;

      if (resolver) {
        const result = resolver(card, ev);
        if (!result) return null;
      }

      activeIdRef.current = card.id;
      return card;
    },
    [api, ctxApi, resolver],
  );

  const menuAction = useCallback(
    (ev) => {
      const action = ev?.action;
      if (!action) return;

      const id =
        typeof activeIdRef.current === 'object'
          ? activeIdRef.current.id
          : activeIdRef.current;

      if (action.id === 'edit-card') {
        exec('select-card', { id });
      } else if (action.id === 'duplicate-card') {
        exec('duplicate-card', { id });
      } else if (action.id === 'delete-card') {
        exec('delete-card', { id });
      }

      onClick?.(ev);
    },
    [api, ctxApi, onClick],
  );

  const filterMenu = useCallback(
    (item, card) => {
      return filter ? filter(item, card) : true;
    },
    [filter],
  );

  return (
    <>
      <ContextMenu
        ref={menuRef}
        filter={filterMenu}
        options={cOptions}
        dataKey="id"
        resolver={itemResolver}
        onClick={menuAction}
        css={css}
        at={at}
      />
      {children && (
        <span
          className={scope}
          onContextMenu={menuRef.current?.show}
          data-menu-ignore="true"
        >
          {children}
        </span>
      )}
    </>
  );
});

export default KanbanContextMenu;
