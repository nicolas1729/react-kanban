import { useState } from 'react';
import { card, getData } from '../data.js';
import { Kanban, Editor, getEditorItems } from '../../src/index.js';

const { columns, cards } = getData();

function BasicInit() {
  const [api, setApi] = useState(null);

  const items = getEditorItems(card);

  return (
    <>
      <Kanban
        init={(obj) => setApi(obj)}
        cards={cards}
        columns={columns}
        card={card}
      />
      {api && <Editor api={api} items={items} />}
    </>
  );
}

export default BasicInit;
