import { useState, useEffect } from 'react';
import { Kanban, Editor, RestDataProvider } from '../../src/index.js';
import { getData } from '../data.js';

const server = 'https://kanban-backend.svar.dev';
const provider = new RestDataProvider(server);

const { columns } = getData();

function SaveToBackend() {
  const [api, setApi] = useState(null);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    provider.getData().then((data) => {
      setCards(data);
    });
  }, []);

  function init(api) {
    setApi(api);
    api.setNext(provider);
    api.intercept('add-card', (ev) => {
      ev.card.priority = 1;
    });
  }

  return (
    <>
      <Kanban init={init} cards={cards} columns={columns} />
      {api && <Editor api={api} />}
    </>
  );
}

export default SaveToBackend;
