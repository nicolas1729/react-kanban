import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useReducer,
  useState,
} from 'react';

import { writable } from '@svar-ui/lib-react';
import { EventBusRouter } from '@svar-ui/lib-state';
import { KanbanStore } from '@svar-ui/kanban-store';

import Layout from './Layout.jsx';
import ExportLayout from './ExportLayout.jsx';

import { KanbanApiContext, DndContext } from '../context.js';
import { DndState } from './useDrag.js';
import { getCardShape } from '../defaults.js';

// locales
import { en } from '@svar-ui/kanban-locales';
import { en as coreEn } from '@svar-ui/core-locales';
import { Locale } from '@svar-ui/react-core';

function toHandlerName(action) {
  return (
    'on' +
    action
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('')
  );
}

const Kanban = forwardRef(function Kanban(props, ref) {
  const {
    cards,
    columns,
    columnAccessor = 'column',
    filters = new Map(),
    sort = null,
    card = getCardShape(),
    readonly = false,
    render,
    dynamicData = false,
    history = false,
    cardContent,
    init,
    tooltip,
    cardPopup,
    cardCss,
    columnCss,
    ...restProps
  } = props;

  // force-render mechanism for DndState
  const [, forceRender] = useReducer((c) => c + 1, 0);

  // create store once
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = new KanbanStore(writable, { undo: history });
  }
  const store = storeRef.current;

  // create DndState once
  const dndRef = useRef(null);
  if (!dndRef.current) {
    dndRef.current = new DndState();
  }
  dndRef.current._notify = forceRender;
  const dnd = dndRef.current;

  // event bus router: route store events to on* handler props
  const routerRef = useRef(null);
  const restPropsRef = useRef(restProps);
  restPropsRef.current = restProps;

  if (!routerRef.current) {
    const lastInRoute = new EventBusRouter((action, data) => {
      const name = toHandlerName(action);
      const handler = restPropsRef.current[name];
      if (handler) {
        handler(data);
      }
    });
    store.in.setNext(lastInRoute);
    routerRef.current = lastInRoute;
  }

  // exposed API
  const api = useRef(null);
  if (!api.current) {
    api.current = {
      getState: store.getState.bind(store),
      getReactiveState: store.getReactive.bind(store),
      getStores: () => ({ data: store }),
      getCards: store.getCards.bind(store),
      exec: store.in.exec.bind(store.in),
      on: store.in.on.bind(store.in),
      detach: store.in.detach.bind(store.in),
      setNext: store.in.setNext.bind(store.in),
      intercept: store.in.intercept.bind(store.in),
    };
  }

  useImperativeHandle(ref, () => api.current);

  // context value for KanbanApiContext
  const ctxApiRef = useRef(null);
  if (!ctxApiRef.current) {
    ctxApiRef.current = {
      getReactiveState: store.getReactive.bind(store),
      getState: store.getState.bind(store),
      exec: store.in.exec.bind(store.in),
      getBrandmark: store.getBrandmark.bind(store),
    };
  }

  // initial store init (once)
  const initDoneRef = useRef(false);
  if (!initDoneRef.current) {
    store.init({
      cards,
      columns,
      columnAccessor,
      filters,
      sort,
      dynamicData,
      renderMode: '',
    });
    initDoneRef.current = true;
  }

  // call init callback once
  const initCalledRef = useRef(false);
  useEffect(() => {
    if (!initCalledRef.current) {
      initCalledRef.current = true;
      init?.(api.current);
    }
  }, []);
  // re-init when input data changes
  const firstEffectRef = useRef(true);
  useEffect(() => {
    if (firstEffectRef.current) {
      firstEffectRef.current = false;
      return;
    }
    store.init({ cards, columns, columnAccessor, filters, sort, dynamicData });
  }, [cards, columns, columnAccessor, filters, sort, dynamicData]);
  // sync export-data meta
  useEffect(() => {
    store.meta['export-data'] = { card, cardContent, cardCss, columnCss };
  }, [card, cardContent, cardCss, columnCss]);
  // subscribe to renderMode
  const [renderMode, setRenderMode] = useState('');
  useEffect(() => {
    const rmStore = store.getReactive().renderMode;
    if (!rmStore) return;
    const unsub = rmStore.subscribe((v) => setRenderMode(v));
    return unsub;
  }, []);
  return (
    <KanbanApiContext.Provider value={ctxApiRef.current}>
      <DndContext.Provider value={dnd}>
        <Locale words={{ ...coreEn, ...en }} optional={true}>
          <Layout
            cardShape={card}
            readonly={readonly}
            render={render}
            cardContent={cardContent}
            tooltip={tooltip}
            cardPopup={cardPopup}
            cardCss={cardCss}
            columnCss={columnCss}
          />
          {renderMode === 'export' && (
            <ExportLayout
              cardShape={card}
              cardContent={cardContent}
              cardCss={cardCss}
              columnCss={columnCss}
            />
          )}
        </Locale>
      </DndContext.Provider>
    </KanbanApiContext.Provider>
  );
});

export default Kanban;
