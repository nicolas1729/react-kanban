import { useContext, useEffect, useRef } from 'react';
import { KanbanApiContext } from '../context.js';

function ExportLayout(props) {
  const { cardCss, columnCss, cardContent, cardShape } = props;
  const CardContent = cardContent;

  const store = useContext(KanbanApiContext);
  const root = useRef(null);

  useEffect(() => {
    const viewData = store.getState().viewData;
    const out = {};

    if (CardContent) {
      const c = {};
      root.current.querySelectorAll('.wx-ex-cell').forEach((element) => {
        c[element.dataset.id] = element.innerHTML;
      });
      out.cardContent = c;
    }

    const cs = {};
    if (cardCss) {
      viewData.columns.forEach((column) => {
        column.cards.forEach((card) => {
          cs[card.id.toString()] = cardCss(card, column);
        });
      });
      out.cardCss = cs;
    }

    const cls = {};
    if (columnCss) {
      viewData.columns.forEach((column) => {
        cls[column.id.toString()] = columnCss(column.cards, column);
      });
      out.columnCss = cls;
    }

    store.exec('export-data', { format: 'inner', data: out });
  });

  const viewData = store.getState().viewData;

  return (
    <div style={{ visibility: 'hidden', position: 'absolute' }} ref={root}>
      {CardContent &&
        viewData.columns.map((column) =>
          column.cards.map((card) => (
            <div className="wx-ex-cell" data-id={card.id} key={card.id}>
              <CardContent card={card} cardShape={cardShape} />
            </div>
          )),
        )}
    </div>
  );
}

export default ExportLayout;
