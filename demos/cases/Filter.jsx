import { useState, useContext } from 'react';
import { getData } from '../data.js';
import { Kanban } from '../../src/index.js';
import { Segmented } from '@svar-ui/react-core';
import { Layout, Cell } from '@svar-ui/react-layout';
import {
  Willow,
  WillowDark,
  FilterQuery,
  FilterBar,
  FilterBuilder,
  createFilter,
  getQueryString,
} from '@svar-ui/react-filter';
import { context } from '@svar-ui/react-core';

import './Filter.css';

const { columns, cards } = getData();

const fields = [
  {
    id: 'label',
    label: 'Label',
    type: 'text',
  },
  {
    id: 'description',
    label: 'Description',
    type: 'text',
  },
  {
    id: 'priority',
    label: 'Priority',
    type: 'number',
  },
  {
    id: 'column',
    label: 'Column',
    type: 'text',
  },
];

const url =
  'https://kanban-backend.svar.dev/text-to-json';

function Filter() {
  const helpers = useContext(context.helpers);

  let apiRef = null;
  const [mode, setMode] = useState('plain');
  const [textValue, setTextValue] = useState('');

  function onInit(obj) {
    apiRef = obj;
  }

  async function text2filter(text, fields) {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ text, fields }),
    });
    const json = await response.json();
    if (!response.ok) {
      helpers.showNotice({
        text: json.error || 'Request failed',
        type: 'danger',
      });
      return null;
    }
    return json;
  }

  async function applyQueryFilter({
    value,
    error,
    text,
    startProgress,
    endProgress,
  }) {
    if (text) {
      error = null;
      try {
        startProgress();
        value = await text2filter(text, fields);
        setTextValue(value ? getQueryString(value).query : '');
      } catch (e) {
        error = e;
      } finally {
        endProgress();
      }
    }

    if (error) {
      helpers.showNotice({
        text: error.message,
        type: 'danger',
      });

      if (error.code !== 'NO_DATA') return;
    }

    apiRef.exec('filter-cards', { filter: createFilter(value, {}, fields) });
  }

  function applyFilter({ value }) {
    apiRef.exec('filter-cards', { filter: createFilter(value) });
  }

  return (
    <>
      <Willow />
      <WillowDark />

      <Layout preset="space">
        <Segmented
          value={mode}
          onChange={({ value }) => setMode(value)}
          options={[
            { id: 'plain', label: 'Plain' },
            { id: 'query', label: 'Query' },
            { id: 'builder', label: 'Builder' },
          ]}
        />
        {mode === 'plain' && (
          <FilterBar debounce={0} fields={[fields[0]]} onChange={applyFilter} />
        )}
        {mode === 'query' && (
          <FilterQuery
            value={textValue}
            fields={fields}
            onChange={applyQueryFilter}
            placeholder="type your query as plain text"
          />
        )}
        {mode === 'builder' && (
          <FilterBuilder fields={fields} type={'line'} onChange={applyFilter} />
        )}

        <Cell>
          <Kanban cards={cards} columns={columns} init={onInit} />
        </Cell>
      </Layout>
    </>
  );
}

export default Filter;
