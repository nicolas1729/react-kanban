import { useContext, useMemo, useRef, useEffect } from 'react';
import { context } from '@svar-ui/react-core';
import CardList from './CardList.jsx';
import { createColumnCard } from '../directives/dblclick.js';
import { KanbanApiContext } from '../context.js';
import './Column.css';

const scope = 'wx-aadf0UPJ';

function Column(props) {
  const {
    column,
    readonly = false,
    cardContent,
    cardShape,
    contentVisible,
    requestVisible,
    virtualizeCards,
    estimatedCardHeight,
    cardOverscan,
    fixedColumnWidth,
    registerColumn,
    cardCss,
    columnCss,
  } = props;

  const dynamicColumnCss = useMemo(
    () => (columnCss ? (columnCss(column.cards, column) ?? '') : ''),
    [columnCss, column],
  );

  const store = useContext(KanbanApiContext);
  const columnAccessor = useMemo(
    () => store.getState().columnAccessor,
    [store],
  );
  const locale = useContext(context.i18n);
  const _ = locale.getGroup('kanban');

  const root = useRef(null);

  const cardLimitVisible = useMemo(
    () => typeof column.cardLimit === 'number' || column.cardLimit === true,
    [column.cardLimit],
  );
  const cardLimitNumber = useMemo(
    () => (typeof column.cardLimit === 'number' ? column.cardLimit : null),
    [column.cardLimit],
  );
  const addCardVisible = useMemo(
    () => column.addCard !== false && !readonly,
    [column.addCard, readonly],
  );

  function toggleCollapsed() {
    store.exec('update-column', {
      id: column.id,
      column: { collapsed: !column.collapsed },
    });
  }

  function addCard() {
    if (!addCardVisible) return;

    const card = createColumnCard({}, columnAccessor, column.id);
    store.exec('add-card', { card, edit: true });
  }

  useEffect(() => {
    if (!registerColumn || !root.current) return;

    const id = column.id;
    registerColumn(id, root.current);

    return () => registerColumn(id, null);
  }, [registerColumn, column.id]);


  const sectionClassName = [
    'wx-column',
    column.css ?? '',
    dynamicColumnCss,
    column.collapsed ? 'wx-collapsed' : '',
    column.overLimit ? 'wx-over-limit' : '',
    scope,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={sectionClassName} ref={root}>
      {column.collapsed ? (
        <>
          <button
            type="button"
            className={`wx-expand ${scope}`}
            onClick={toggleCollapsed}
            aria-label={_('Expand column')}
          >
            <i className={`wx-icon wxi-angle-right ${scope}`}></i>
          </button>
          <div className={`wx-body ${scope}`}>
            <h3 className={`wx-title ${scope}`}>
              <span className={scope}>{column.label}</span>
              {cardLimitVisible && (
                <span
                  className={[
                    'wx-count',
                    column.overLimit ? 'wx-over' : '',
                    scope,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {column.cards.length}
                  {cardLimitNumber != null ? `/${cardLimitNumber}` : ''}
                </span>
              )}
            </h3>
          </div>
        </>
      ) : (
        <>
          <header className={`wx-column-header ${scope}`}>
            <button
              type="button"
              className={`wx-toggle ${scope}`}
              onClick={toggleCollapsed}
              aria-label={_('Collapse column')}
            >
              <i className={`wx-icon wxi-angle-left ${scope}`}></i>
            </button>
            <h3 className={`wx-title ${scope}`}>{column.label}</h3>
            {cardLimitVisible && (
              <span
                className={[
                  'wx-count',
                  column.overLimit ? 'wx-over' : '',
                  scope,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {column.cards.length}
                {cardLimitNumber != null ? `/${cardLimitNumber}` : ''}
              </span>
            )}
            {addCardVisible && (
              <button
                type="button"
                className={`wx-add ${scope}`}
                onClick={addCard}
                aria-label={`${_('Add card to')} ${column.label}`}
              >
                <i className={`wx-icon wxi-plus ${scope}`}></i>
              </button>
            )}
          </header>
          <CardList
            column={column}
            readonly={readonly}
            cardContent={cardContent}
            cardShape={cardShape}
            contentVisible={contentVisible}
            virtualizeCards={virtualizeCards}
            estimatedCardHeight={estimatedCardHeight}
            cardOverscan={cardOverscan}
            fixedColumnWidth={fixedColumnWidth}
            cardCss={cardCss}
          />
        </>
      )}
    </section>
  );
}

export default Column;
