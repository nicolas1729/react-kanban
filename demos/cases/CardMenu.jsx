import { useState, useContext } from 'react';
import { card, getData } from '../data.js';
import {
  Kanban,
  ContextMenu,
  Editor,
  getMenuOptions,
} from '../../src/index.js';
import { context } from '@svar-ui/react-core';

const { columns, cards } = getData();

const options = [
  ...getMenuOptions(),
  { id: 'my-action', text: 'My action', icon: 'wxi-empty' },
];

function CardMenu() {
  const helpers = useContext(context.helpers);
  const [api, setApi] = useState(null);

  function onClick({ action }) {
    if (action.id === 'my-action') {
      helpers.showNotice({ text: '`My action` clicked', type: 'success' });
    }
  }

  return (
    <>
      <ContextMenu api={api} options={options} onClick={onClick}>
        <Kanban
          init={(obj) => setApi(obj)}
          cards={cards}
          columns={columns}
          card={{ ...card, menu: { options, onClick } }}
        />
      </ContextMenu>
      {api && <Editor api={api} />}
    </>
  );
}

export default CardMenu;
