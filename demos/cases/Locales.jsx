import { useState, useEffect, useMemo } from 'react';
import { getData } from '../data.js';
import { Kanban, Editor } from '../../src/index.js';
import { Layout } from '@svar-ui/react-layout';
import { Segmented, Locale } from '@svar-ui/react-core';

import {
  en as enCore,
  cn as cnCore,
  de as deCore,
  es as esCore,
  fr as frCore,
  it as itCore,
  ja as jaCore,
  pt as ptCore,
  ru as ruCore,
} from '@svar-ui/core-locales';
import { en, cn, de, es, fr, it, jp, pt, ru } from '@svar-ui/kanban-locales';

const { columns, cards } = getData();

const dictionaries = {
  en: { kanban: en, core: enCore },
  cn: { kanban: cn, core: cnCore },
  de: { kanban: de, core: deCore },
  es: { kanban: es, core: esCore },
  fr: { kanban: fr, core: frCore },
  it: { kanban: it, core: itCore },
  jp: { kanban: jp, core: jaCore },
  pt: { kanban: pt, core: ptCore },
  ru: { kanban: ru, core: ruCore },
};

const columnLabels = {
  en: { todo: 'To Do', doing: 'In Progress', done: 'Done' },
  ru: { todo: 'К выполнению', doing: 'В работе', done: 'Готово' },
  de: { todo: 'Zu erledigen', doing: 'In Arbeit', done: 'Erledigt' },
  fr: { todo: 'À faire', doing: 'En cours', done: 'Terminé' },
  es: { todo: 'Por hacer', doing: 'En curso', done: 'Hecho' },
  it: { todo: 'Da fare', doing: 'In corso', done: 'Fatto' },
  pt: { todo: 'A fazer', doing: 'Em andamento', done: 'Concluído' },
  jp: { todo: '未着手', doing: '進行中', done: '完了' },
  cn: { todo: '待办', doing: '进行中', done: '已完成' },
};

const options = [
  { id: 'en', label: 'English' },
  { id: 'cn', label: 'Chinese' },
  { id: 'de', label: 'German' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'it', label: 'Italian' },
  { id: 'jp', label: 'Japanese' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'ru', label: 'Russian' },
];

function Locales() {
  const [api, setApi] = useState(null);
  const [locale, setLocale] = useState('en');

  const words = useMemo(
    () => ({
      ...dictionaries[locale].kanban,
      ...dictionaries[locale].core,
    }),
    [locale],
  );

  const localizedColumns = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        label: columnLabels[locale]?.[col.id] ?? col.label,
      })),
    [locale],
  );

  function setLocaleAndSelect(l) {
    setLocale(l);
    setTimeout(() => {
      api?.exec('select-card', { id: 1 });
    }, 1250);
  }

  useEffect(() => {
    setTimeout(() => {
      api?.exec('select-card', { id: 1 });
    }, 250);
  }, [api]);

  return (
    <Layout direction="column">
      <Segmented
        options={options}
        value={locale}
        onChange={(v) => setLocaleAndSelect(v.value)}
      />
      <div key={locale} style={{ display: 'contents' }}>
        <Locale words={words}>
          <Kanban
            init={(v) => setApi(v)}
            cards={cards}
            columns={localizedColumns}
            card={{ menu: true }}
          />
          {api && <Editor api={api} />}
        </Locale>
      </div>
    </Layout>
  );
}

export default Locales;
