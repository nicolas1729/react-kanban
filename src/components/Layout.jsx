import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useContext,
} from 'react';
import { delegateClick, hotkeys, locate, locateID } from '@svar-ui/lib-dom';
import { Popup } from '@svar-ui/react-core';
import { context } from '@svar-ui/react-core';

import Column from './Column.jsx';
import ContextMenu from './ContextMenu.jsx';
import DragGhost from './DragGhost.jsx';
import { useCardOverlay } from './useCardOverlay.js';
import { cardDrag } from '../directives/drag.js';
import {
  KanbanApiContext,
  DndContext,
  ScrollContainerContext,
} from '../context.js';
import './Layout.css';

const scope = 'wx-aac6Qo5t';

const str2style = (s) => {
  const obj = {};

  s.split(';').forEach((kv) => {
    const [k, v] = kv.split(':');
    if (k && v) obj[k.trim()] = v.trim();
  });
  return obj;
};

function Layout(props) {
  const {
    readonly = false,
    render,
    cardContent,
    cardShape,
    tooltip,
    cardPopup,
    cardCss,
    columnCss,
  } = props;

  const columnScroll = render?.columnScroll ?? true;
  const fixedColumnWidth = render?.fixedColumnWidth ?? true;
  const virtualizeCards = render?.virtualizeCards ?? false;
  const virtualizeColumns = render?.virtualizeColumns ?? false;
  const estimatedCardHeight = render?.estimatedCardHeight ?? 80;
  const cardOverscan = render?.cardOverscan ?? 5;
  const columnOverscan = render?.columnOverscan ?? 1;

  const store = useContext(KanbanApiContext);
  const brandmark = useMemo(() => store.getBrandmark(), [store]);

  const locale = useContext(context.i18n);
  const _ = locale.getGroup('kanban');

  const dnd = useContext(DndContext);

  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const boardRef = useRef(null);
  const cardMenuRef = useRef(null);

  const [visibleColumnIds, setVisibleColumnIds] = useState(() => new Set());
  const visibilityFrameRef = useRef(0);
  const columnElementsRef = useRef(new Map());

  // Subscribe to reactive viewData store
  const viewDataStore = useMemo(
    () => store.getReactiveState().viewData,
    [store],
  );
  const [viewData, setViewData] = useState(
    () => viewDataStore.get?.() ?? store.getState().viewData,
  );

  useEffect(() => {
    const unsub = viewDataStore.subscribe((v) => {
      setViewData(v);
    });
    return unsub;
  }, [viewDataStore]);

  // Provide scroll container context
  const getScrollContainer = useCallback(
    () => (columnScroll ? null : (scrollRef.current ?? null)),
    [columnScroll],
  );

  // ---- Column visibility (virtualization) ----

  function sameSet(a, b) {
    if (a.size !== b.size) return false;
    for (const value of a) {
      if (!b.has(value)) return false;
    }
    return true;
  }

  const visibleColumnIdsRef = useRef(visibleColumnIds);
  visibleColumnIdsRef.current = visibleColumnIds;

  const setVisibleColumnsStable = useCallback((next) => {
    if (!sameSet(visibleColumnIdsRef.current, next)) {
      setVisibleColumnIds(next);
    }
  }, []);

  const updateColumnVisibility = useCallback(() => {
    const scroll = scrollRef.current;
    if (!virtualizeColumns || !scroll) {
      setVisibleColumnsStable(new Set());
      return;
    }

    const columns = viewData.columns;
    if (!columns.length) {
      setVisibleColumnsStable(new Set());
      return;
    }

    const scrollRect = scroll.getBoundingClientRect();
    let first = -1;
    let last = -1;

    for (let i = 0; i < columns.length; i++) {
      const element = columnElementsRef.current.get(columns[i].id);
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      if (rect.right >= scrollRect.left && rect.left <= scrollRect.right) {
        if (first === -1) first = i;
        last = i;
      }
    }

    if (first === -1 || last === -1) {
      setVisibleColumnsStable(new Set());
      return;
    }

    const overscan = Math.max(0, Math.floor(columnOverscan || 0));
    first = Math.max(0, first - overscan);
    last = Math.min(columns.length - 1, last + overscan);

    const next = new Set();
    for (let i = first; i <= last; i++) {
      next.add(columns[i].id);
    }
    setVisibleColumnsStable(next);
  }, [
    virtualizeColumns,
    viewData.columns,
    columnOverscan,
    setVisibleColumnsStable,
  ]);

  const scheduleColumnVisibility = useCallback(() => {
    if (visibilityFrameRef.current) return;
    visibilityFrameRef.current = requestAnimationFrame(() => {
      visibilityFrameRef.current = 0;
      updateColumnVisibility();
    });
  }, [updateColumnVisibility]);

  const registerColumn = useCallback(
    (id, element) => {
      if (element) columnElementsRef.current.set(id, element);
      else columnElementsRef.current.delete(id);

      scheduleColumnVisibility();
    },
    [scheduleColumnVisibility],
  );

  function updateScrollHeightVar() {
    const scroll = scrollRef.current;
    if (!scroll) return;
    scroll.style.setProperty(
      '--wx-kanban-scroll-height',
      `${scroll.clientHeight}px`,
    );
  }

  const isColumnContentVisible = useCallback(
    (id) =>
      !virtualizeColumns ||
      visibleColumnIds.size === 0 ||
      visibleColumnIds.has(id),
    [virtualizeColumns, visibleColumnIds],
  );

  const isColumnRequestVisible = useCallback(
    (id) => !virtualizeColumns || visibleColumnIds.has(id),
    [virtualizeColumns, visibleColumnIds],
  );

  function getCard(id) {
    return store.getState().cards.getById(id);
  }

  const overlay = useCardOverlay(getCard, 'right-start');

  const popupExtra = useMemo(() => ({ trackScroll: true }), []);

  function selectCard(id) {
    if (!readonly && id != null) {
      store.exec('select-card', { id });
    }
  }

  function handleCardClick(id, ev) {
    if (readonly || dnd?.active) return;
    if (cardPopup && id != null) {
      const target = ev?.target;
      const el = target ? locate(target) : null;
      if (el) {
        overlay.handleCardPopup({ cardId: id, element: el });
        return;
      }
    }
    selectCard(id);
  }

  function handleCardKey(e) {
    if (readonly) return;

    e?.preventDefault();
    const active = document.activeElement;
    const id = active ? locateID(active) : null;
    if (cardPopup && id != null && active) {
      overlay.handleCardPopup({
        cardId: id,
        element: active,
      });
      return;
    }
    selectCard(id);
  }

  const cardMenuConfig = useMemo(
    () =>
      cardShape?.menu
        ? typeof cardShape.menu === 'object'
          ? cardShape.menu
          : {}
        : null,
    [cardShape?.menu],
  );

  function handleCardMenu(id, ev) {
    if (readonly || id == null || !cardMenuRef.current) return;
    ev.stopPropagation();
    cardMenuRef.current.show(ev, id);
  }

  // ---- Effects for scheduling column visibility ----
  useEffect(() => {
    scheduleColumnVisibility();
  }, [
    virtualizeColumns,
    columnOverscan,
    fixedColumnWidth,
    viewData.columns,
    scheduleColumnVisibility,
  ]);

  // ResizeObserver for column visibility
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll || !virtualizeColumns || typeof ResizeObserver === 'undefined')
      return;

    const observer = new ResizeObserver(() => scheduleColumnVisibility());
    observer.observe(scroll);

    return () => observer.disconnect();
  }, [virtualizeColumns, scheduleColumnVisibility]);

  // Scroll height CSS variable + ResizeObserver
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    updateScrollHeightVar();
    window.addEventListener('resize', updateScrollHeightVar);

    if (typeof ResizeObserver === 'undefined') {
      return () => window.removeEventListener('resize', updateScrollHeightVar);
    }

    const observer = new ResizeObserver(updateScrollHeightVar);
    observer.observe(scroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScrollHeightVar);
    };
  }, []);

  // Cleanup visibility frame on unmount
  useEffect(() => {
    return () => {
      if (visibilityFrameRef.current) {
        cancelAnimationFrame(visibilityFrameRef.current);
        visibilityFrameRef.current = 0;
      }
    };
  }, []);

  // ---- Svelte action: cardDrag ----
  const cardDragRef = useRef(null);

  useEffect(() => {
    if (!boardRef.current) return;
    cardDragRef.current = cardDrag(boardRef.current, {
      dnd,
      store,
      readonly,
    });
    return () => cardDragRef.current?.destroy?.();
  }, []);

  useEffect(() => {
    cardDragRef.current?.update?.({ dnd, store, readonly });
  }, [dnd, store, readonly]);

  // ---- Svelte action: delegateClick ----
  useEffect(() => {
    if (!boardRef.current) return;
    const cleanup = delegateClick(boardRef.current, {
      click: handleCardClick,
      menu: handleCardMenu,
    });
    return () => cleanup?.destroy?.();
  }, []);

  // ---- Svelte action: hotkeys ----
  useEffect(() => {
    if (!boardRef.current) return;
    const node = boardRef.current;
    const destroy = hotkeys.subscribe((keys) => {
      keys.configure(
        {
          enter: handleCardKey,
          space: handleCardKey,
        },
        node,
      );
    });
    return () => destroy?.();
  }, []);

  // ---- Build board className ----
  const boardClassName = [
    'wx-board',
    !columnScroll ? 'wx-scroll-board' : '',
    !fixedColumnWidth ? 'wx-layout-flex' : '',
    scope,
  ]
    .filter(Boolean)
    .join(' ');

  const TooltipCmp = tooltip;
  const CardPopupCmp = cardPopup;

  return (
    <ScrollContainerContext.Provider value={getScrollContainer}>
      <div
        className={`wx-kanban ${scope}`}
        role="region"
        aria-label={_('Kanban board')}
        ref={rootRef}
      >
        <div
          className={boardClassName}
          ref={boardRef}
          onMouseMove={tooltip ? overlay.handleTooltipMove : undefined}
          onMouseLeave={tooltip ? overlay.handleTooltipLeave : undefined}
        >
          <div
            className={`wx-scroll ${scope}`}
            ref={scrollRef}
            onScroll={scheduleColumnVisibility}
          >
            <div className={`wx-content ${scope}`}>
              {viewData.columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  readonly={readonly}
                  cardContent={cardContent}
                  cardShape={cardShape}
                  contentVisible={isColumnContentVisible(column.id)}
                  requestVisible={isColumnRequestVisible(column.id)}
                  virtualizeCards={virtualizeCards}
                  estimatedCardHeight={estimatedCardHeight}
                  cardOverscan={cardOverscan}
                  fixedColumnWidth={fixedColumnWidth}
                  registerColumn={registerColumn}
                  cardCss={cardCss}
                  columnCss={columnCss}
                />
              ))}
            </div>
          </div>
        </div>
        {brandmark && (
          <a
            className={scope}
            style={str2style(brandmark.style)}
            href={brandmark.link}
            target="_blank"
            rel="noreferrer"
          >
            {brandmark.text}
          </a>
        )}
        <DragGhost
          root={rootRef.current}
          cardContent={cardContent}
          cardShape={cardShape}
        />

        {cardMenuConfig && (
          <ContextMenu
            ref={cardMenuRef}
            options={cardMenuConfig.options}
            filter={cardMenuConfig.filter}
            onClick={cardMenuConfig.onclick}
          />
        )}

        {overlay.tooltipState && TooltipCmp && (
          <div
            className={`wx-tooltip ${scope}`}
            style={{
              position: 'fixed',
              left: `${overlay.mousePos.x + 12}px`,
              top: `${overlay.mousePos.y + 16}px`,
              zIndex: 10000,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            <TooltipCmp card={overlay.tooltipState.card} />
          </div>
        )}

        {overlay.cardPopupState && CardPopupCmp && (
          <Popup
            at={overlay.cardPopupState.at}
            parent={overlay.cardPopupState.element}
            onCancel={overlay.hideCardPopup}
            {...popupExtra}
          >
            <CardPopupCmp
              card={overlay.cardPopupState.card}
              close={overlay.hideCardPopup}
            />
          </Popup>
        )}
      </div>
    </ScrollContainerContext.Provider>
  );
}

export default Layout;
