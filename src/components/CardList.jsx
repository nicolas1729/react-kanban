import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  useContext,
  Fragment,
} from 'react';
import { setID } from '@svar-ui/lib-dom';
import CardWrapper from './CardWrapper.jsx';
import {
  KanbanApiContext,
  DndContext,
  ScrollContainerContext,
} from '../context.js';
import { dblclick } from '../directives/dblclick.js';
import './CardList.css';

const scope = 'wx-aadmJ6TR';

function CardList(props) {
  const {
    column,
    readonly = false,
    cardContent,
    cardShape,
    contentVisible,
    virtualizeCards,
    estimatedCardHeight,
    cardOverscan,
    fixedColumnWidth,
    cardCss,
  } = props;

  function getCardExtraCss(card) {
    return cardCss ? (cardCss(card, column) ?? '') : '';
  }

  const store = useContext(KanbanApiContext);
  const dnd = useContext(DndContext);
  const getScrollContainer = useContext(ScrollContainerContext);

  const columnAccessor = useMemo(
    () => store.getState().columnAccessor,
    [store],
  );

  const containerRef = useRef(null);
  const [range, setRange] = useState({
    start: 0,
    end: -1,
    top: 0,
    bottom: 0,
    total: 0,
  });
  const [cardGap, setCardGap] = useState(8);
  const frameRef = useRef(0);
  const previousVirtualizeCardsRef = useRef(false);

  const heightCacheRef = useRef(new Map());
  const measuredNodesRef = useRef(new Map());
  const cardObserverRef = useRef(undefined);

  // Keep mutable refs for values used in long-lived callbacks
  const columnRef = useRef(column);
  const contentVisibleRef = useRef(contentVisible);
  const virtualizeCardsRef = useRef(virtualizeCards);
  const estimatedCardHeightRef = useRef(estimatedCardHeight);
  const cardOverscanRef = useRef(cardOverscan);
  const cardGapRef = useRef(cardGap);
  const getScrollContainerRef = useRef(getScrollContainer);
  const fixedColumnWidthRef = useRef(fixedColumnWidth);

  useEffect(() => {
    columnRef.current = column;
  }, [column]);
  useEffect(() => {
    contentVisibleRef.current = contentVisible;
  }, [contentVisible]);
  useEffect(() => {
    virtualizeCardsRef.current = virtualizeCards;
  }, [virtualizeCards]);
  useEffect(() => {
    estimatedCardHeightRef.current = estimatedCardHeight;
  }, [estimatedCardHeight]);
  useEffect(() => {
    cardOverscanRef.current = cardOverscan;
  }, [cardOverscan]);
  useEffect(() => {
    cardGapRef.current = cardGap;
  }, [cardGap]);
  useEffect(() => {
    getScrollContainerRef.current = getScrollContainer;
  }, [getScrollContainer]);
  useEffect(() => {
    fixedColumnWidthRef.current = fixedColumnWidth;
  }, [fixedColumnWidth]);

  const isDropColumn = useMemo(
    () => dnd?.active && dnd.target?.column === column.id,
    [dnd?.active, dnd?.target?.column, column.id],
  );
  const renderStart = useMemo(
    () => (virtualizeCards ? range.start : 0),
    [virtualizeCards, range.start],
  );
  const renderEnd = useMemo(
    () => (virtualizeCards ? range.end : column.cards.length - 1),
    [virtualizeCards, range.end, column.cards.length],
  );
  const renderedCards = useMemo(
    () =>
      contentVisible
        ? column.cards.slice(renderStart, Math.max(renderStart, renderEnd + 1))
        : [],
    [contentVisible, column.cards, renderStart, renderEnd],
  );
  const hiddenHeight = useMemo(
    () => range.total || estimateTotalHeight(column.cards.length),
    [range.total, column.cards.length, estimatedCardHeight, cardGap],
  );
  const topSpacerHeight = useMemo(
    () => (range.start > 0 ? Math.max(0, range.top - cardGap) : 0),
    [range.start, range.top, cardGap],
  );
  const bottomSpacerHeight = useMemo(
    () => (range.bottom > 0 ? Math.max(0, range.bottom - cardGap) : 0),
    [range.bottom, cardGap],
  );
  const afterRenderedBeforeId = useMemo(
    () =>
      contentVisible &&
      virtualizeCards &&
      renderEnd >= 0 &&
      renderEnd < column.cards.length - 1
        ? column.cards[renderEnd + 1]?.id
        : undefined,
    [contentVisible, virtualizeCards, renderEnd, column.cards],
  );
  const trailingPlaceholder = useMemo(
    () =>
      isDropColumn &&
      (dnd.target?.beforeId == null ||
        dnd.target?.beforeId === afterRenderedBeforeId),
    [isDropColumn, dnd?.target?.beforeId, afterRenderedBeforeId],
  );

  function estimateTotalHeight(count) {
    if (!count) return 0;
    const height = Math.max(1, estimatedCardHeight || 1);
    return count * height + Math.max(0, count - 1) * cardGap;
  }

  const readGap = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const styles = getComputedStyle(container);
    const configuredGap = styles.getPropertyValue('--wx-card-gap').trim();
    const raw = configuredGap || styles.rowGap || styles.gap;
    const next = Number.parseFloat(raw);
    const val = Number.isFinite(next) ? next : 8;
    setCardGap(val);
    cardGapRef.current = val;
  }, []);

  const recalculate = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    readGap();

    const col = columnRef.current;
    const cVisible = contentVisibleRef.current;
    const vCards = virtualizeCardsRef.current;
    const estHeight = estimatedCardHeightRef.current;
    const cOverscan = cardOverscanRef.current;
    const gap = cardGapRef.current;
    const heightCache = heightCacheRef.current;

    function estTotalHeight(count) {
      if (!count) return 0;
      const h = Math.max(1, estHeight || 1);
      return count * h + Math.max(0, count - 1) * gap;
    }

    if (!cVisible || !vCards) {
      setRange({
        start: 0,
        end: cVisible ? col.cards.length - 1 : -1,
        top: 0,
        bottom: 0,
        total: estTotalHeight(col.cards.length),
      });
      return;
    }

    const count = col.cards.length;
    if (!count) {
      setRange({ start: 0, end: -1, top: 0, bottom: 0, total: 0 });
      return;
    }

    function getCardHeight(card) {
      return card.id != null
        ? (heightCache.get(card.id) ?? Math.max(1, estHeight || 1))
        : Math.max(1, estHeight || 1);
    }

    // buildOffsets
    const offsets = [0];
    let total = 0;
    for (let i = 0; i < col.cards.length; i++) {
      total += getCardHeight(col.cards[i]);
      if (i < col.cards.length - 1) total += gap;
      offsets.push(total);
    }

    function upperBound(values, value) {
      let low = 0;
      let high = values.length;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (values[mid] <= value) low = mid + 1;
        else high = mid;
      }
      return low;
    }

    const gsc = getScrollContainerRef.current;
    const boardScroll = gsc?.() ?? null;
    let viewportTop = 0;
    let viewportBottom = 0;

    if (boardScroll) {
      const boardRect = boardScroll.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      viewportTop = Math.max(0, boardRect.top - containerRect.top);
      viewportBottom = Math.min(total, boardRect.bottom - containerRect.top);
    } else {
      viewportTop = container.scrollTop;
      viewportBottom = viewportTop + container.clientHeight;
    }

    const safeOverscan = Math.max(0, Math.floor(cOverscan || 0));
    let start = Math.max(0, upperBound(offsets, viewportTop) - 1);
    let end = Math.max(start, upperBound(offsets, viewportBottom) - 1);

    start = Math.max(0, start - safeOverscan);
    end = Math.min(count - 1, end + safeOverscan);

    setRange({
      start,
      end,
      top: offsets[start],
      bottom: Math.max(0, total - offsets[end + 1]),
      total,
    });
  }, [readGap]);

  const scheduleRecalculate = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      recalculate();
    });
  }, [recalculate]);

  const scheduleRecalculateRef = useRef(scheduleRecalculate);
  useEffect(() => {
    scheduleRecalculateRef.current = scheduleRecalculate;
  }, [scheduleRecalculate]);

  function pruneHeightCache() {
    const heightCache = heightCacheRef.current;
    const ids = new Set(column.cards.map((card) => card.id));
    for (const id of heightCache.keys()) {
      if (!ids.has(id)) heightCache.delete(id);
    }
    while (heightCache.size > 10000) {
      const first = heightCache.keys().next().value;
      if (first === undefined) break;
      heightCache.delete(first);
    }
  }

  function ensureCardObserver() {
    if (cardObserverRef.current || typeof ResizeObserver === 'undefined')
      return;

    cardObserverRef.current = new ResizeObserver((entries) => {
      const heightCache = heightCacheRef.current;
      const measuredNodes = measuredNodesRef.current;
      let changed = false;
      for (const entry of entries) {
        const id = measuredNodes.get(entry.target);
        if (id == null) continue;

        const height = Math.ceil(entry.target.offsetHeight);
        if (height > 0 && heightCache.get(id) !== height) {
          heightCache.delete(id);
          heightCache.set(id, height);
          changed = true;
        }
      }

      if (changed) scheduleRecalculateRef.current();
    });
  }

  const measureCardRef = useCallback((node, card) => {
    if (!node) return;
    if (card.id != null) {
      ensureCardObserver();
      measuredNodesRef.current.set(node, card.id);
      cardObserverRef.current?.observe(node);
    }

    return () => {
      cardObserverRef.current?.unobserve(node);
      measuredNodesRef.current.delete(node);
    };
  }, []);

  // Effect: handle virtualization toggle + prune + schedule recalculate
  useEffect(() => {
    if (virtualizeCards && !previousVirtualizeCardsRef.current) {
      heightCacheRef.current.clear();
    }
    previousVirtualizeCardsRef.current = virtualizeCards;

    pruneHeightCache();
    scheduleRecalculate();
  }, [
    column.cards,
    contentVisible,
    virtualizeCards,
    estimatedCardHeight,
    cardOverscan,
    scheduleRecalculate,
  ]);

  // Effect: scroll listeners for virtualization
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !contentVisible || !virtualizeCards) return;

    const scrollElement = getScrollContainer?.() ?? container;
    const onScroll = () => scheduleRecalculate();

    scrollElement.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    scheduleRecalculate();

    return () => {
      scrollElement.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [
    contentVisible,
    virtualizeCards,
    getScrollContainer,
    scheduleRecalculate,
  ]);

  // Effect: ResizeObserver for container width changes
  useEffect(() => {
    const container = containerRef.current;
    if (
      !container ||
      !contentVisible ||
      !virtualizeCards ||
      fixedColumnWidth ||
      typeof ResizeObserver === 'undefined'
    ) {
      return;
    }

    let width = container.clientWidth;
    const observer = new ResizeObserver(() => {
      const next = containerRef.current?.clientWidth ?? 0;
      if (next && next !== width) {
        width = next;
        heightCacheRef.current.clear();
        scheduleRecalculate();
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [contentVisible, virtualizeCards, fixedColumnWidth, scheduleRecalculate]);

  // Effect: cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
      cardObserverRef.current?.disconnect();
    };
  }, []);

  // Effect: dblclick directive
  const dblclickCleanupRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    dblclickCleanupRef.current?.destroy?.();
    const cleanup = dblclick(container, {
      store,
      column: column.id,
      columnAccessor,
      readonly,
    });
    dblclickCleanupRef.current = cleanup;

    return () => {
      cleanup?.destroy?.();
      dblclickCleanupRef.current = null;
    };
  }, [store, column.id, columnAccessor, readonly]);

  function renderCardRow(cardItem, useVirtualMeasure) {
    const extraCss = getCardExtraCss(cardItem);
    const isDragging = dnd?.active && dnd.cardId === cardItem.id;
    const rowClassName = [
      'wx-card-row',
      cardItem.css ?? '',
      extraCss,
      isDragging ? 'wx-dragging' : '',
      scope,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <MeasuredCardRow
        key={cardItem.id}
        cardItem={cardItem}
        className={rowClassName}
        measureCardRef={useVirtualMeasure ? measureCardRef : undefined}
      >
        <CardWrapper
          card={cardItem}
          cardContent={cardContent}
          cardShape={cardShape}
          extraCss={extraCss}
        />
      </MeasuredCardRow>
    );
  }

  function renderDropPlaceholder(cardItem) {
    if (isDropColumn && dnd.target?.beforeId === cardItem.id) {
      return (
        <div
          key={`drop-${cardItem.id}`}
          className={`wx-drop-placeholder ${scope}`}
          style={{ height: `${dnd.height}px` }}
        ></div>
      );
    }
    return null;
  }

  return (
    <div
      className={`wx-column-cards ${scope}`}
      data-kanban-column-cards={setID(column.id)}
      data-kanban-render-start={renderStart}
      data-kanban-render-end={renderEnd}
      data-kanban-card-count={column.cards.length}
      data-kanban-after-rendered-before-id={
        afterRenderedBeforeId == null ? undefined : setID(afterRenderedBeforeId)
      }
      ref={containerRef}
    >
      {contentVisible ? (
        virtualizeCards ? (
          <>
            {topSpacerHeight > 0 && (
              <div
                className={`wx-virtual-spacer ${scope}`}
                style={{ height: `${topSpacerHeight}px` }}
              ></div>
            )}
            {renderedCards.map((cardItem) => (
              <Fragment key={cardItem.id}>
                {renderDropPlaceholder(cardItem)}
                {renderCardRow(cardItem, true)}
              </Fragment>
            ))}
            {trailingPlaceholder && (
              <div
                className={`wx-drop-placeholder ${scope}`}
                style={{ height: `${dnd.height}px` }}
              ></div>
            )}
            {bottomSpacerHeight > 0 && (
              <div
                className={`wx-virtual-spacer ${scope}`}
                style={{ height: `${bottomSpacerHeight}px` }}
              ></div>
            )}
          </>
        ) : (
          <>
            {column.cards.map((cardItem) => (
              <Fragment key={cardItem.id}>
                {renderDropPlaceholder(cardItem)}
                {renderCardRow(cardItem, false)}
              </Fragment>
            ))}
            {trailingPlaceholder && (
              <div
                className={`wx-drop-placeholder ${scope}`}
                style={{ height: `${dnd.height}px` }}
              ></div>
            )}
          </>
        )
      ) : hiddenHeight > 0 ? (
        <div
          className={`wx-virtual-spacer ${scope}`}
          style={{ height: `${hiddenHeight}px` }}
        ></div>
      ) : null}
    </div>
  );
}

function MeasuredCardRow({ cardItem, className, measureCardRef, children }) {
  const nodeRef = useRef(null);
  const cleanupRef = useRef(null);

  const refCallback = useCallback(
    (node) => {
      // Cleanup previous
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      nodeRef.current = node;
      if (node && measureCardRef) {
        cleanupRef.current = measureCardRef(node, cardItem);
      }
    },
    [measureCardRef, cardItem],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={measureCardRef ? refCallback : undefined}
      className={className}
      data-kanban-card-id={cardItem.id == null ? undefined : setID(cardItem.id)}
    >
      {children}
    </div>
  );
}

export default CardList;
