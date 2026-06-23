import { useState, useMemo } from 'react';
import { Kanban } from '../../src/index.js';
import { Layout, Cell } from '@svar-ui/react-layout';
import { Switch, Field } from '@svar-ui/react-core';
import { getGeneratedData } from '../data.js';

const { columns, cards } = getGeneratedData(30);

function LayoutDemo() {
  const [manyColumns, setManyColumns] = useState(false);
  const [manyCards, setManyCards] = useState(false);
  const [perColumnScroll, setPerColumnScroll] = useState(true);
  const [fixedColumnWidth, setFixedColumnWidth] = useState(false);

  const columnsList = useMemo(
    () => (manyColumns ? columns : columns.slice(0, 3)),
    [manyColumns],
  );
  const cardsList = useMemo(
    () => (manyCards ? cards : cards.slice(0, 5)),
    [manyCards],
  );

  const render = useMemo(
    () => ({
      columnScroll: perColumnScroll,
      fixedColumnWidth,
    }),
    [perColumnScroll, fixedColumnWidth],
  );

  return (
    <Layout>
      <div
        style={{
          padding: '10px 10px 0',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Field label="Fixed column width" position="left">
          <Switch
            value={fixedColumnWidth}
            onChange={({ value }) => setFixedColumnWidth(value)}
          />
        </Field>
        <Field label="More columns" position="left">
          <Switch
            value={manyColumns}
            onChange={({ value }) => setManyColumns(value)}
          />
        </Field>
        <Field label="More cards" position="left">
          <Switch
            value={manyCards}
            onChange={({ value }) => setManyCards(value)}
          />
        </Field>
        <Field label="Per column scroll" position="left">
          <Switch
            value={perColumnScroll}
            onChange={({ value }) => setPerColumnScroll(value)}
          />
        </Field>
      </div>
      <Cell>
        <Kanban cards={cardsList} columns={columnsList} render={render} />
      </Cell>
    </Layout>
  );
}

export default LayoutDemo;
