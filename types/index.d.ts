import type {
  FC,
  ReactNode,
  ComponentProps,
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react';
import { Editor as BaseEditor } from '@svar-ui/react-editor';

export { registerEditorItem } from '@svar-ui/react-editor';

/*
 * Store types — bubbled up from the source of @svar-ui/kanban-store
 * (the package ships no .d.ts, so the public surface is inlined here).
 */

export type CardID = string | number;
export type ColumnID = string | number;

export type KanbanCard = {
  id: CardID;
  [key: string]: any;
};

export type ColumnConfig = {
  id: ColumnID;
  label: string;
  css?: string;
  metadata?: Record<string, any>;
  cardLimit?: number | boolean;
  addCard?: boolean;
  collapsed?: boolean;
};

export type ColumnDataStatus = 'unknown' | 'loading' | 'loaded';

export type ColumnView = {
  id: ColumnID;
  label: string;
  css?: string;
  metadata?: Record<string, any>;
  cardLimit?: number | boolean;
  addCard: boolean;
  collapsed: boolean;
  overLimit: boolean;
  dataStatus: ColumnDataStatus;
  cards: KanbanCard[];
};

export type ColumnAccessor =
  | string
  | {
      get: (card: KanbanCard) => ColumnID;
      set: (card: KanbanCard, value: ColumnID) => KanbanCard;
    };

export type SortCriterion =
  | ((a: KanbanCard, b: KanbanCard) => number)
  | { field: string; dir?: 'asc' | 'desc' }
  | null;

export type FilterPredicate = (card: KanbanCard) => boolean;

export type ToolbarButtonConfig = {
  add?: boolean;
  undo?: boolean;
  sort?: boolean;
};

export type ExportHelpers = {
  post: (url: string, data: Record<string, string>) => void;
  serialize: (value: any) => string;
};

export type ExportConfig = {
  url?:
    | string
    | ((
        data: ExportConfig,
        records: KanbanCard[],
        helpers: ExportHelpers,
      ) => void);
  format?: string;
  fileName?: string;
  skin?: string;
  paper?: {
    fitSize?: boolean;
    size?: string | { width: number; height: number };
    landscape?: boolean;
    styles?: string | string[];
    margins?: { top?: number; bottom?: number; left?: number; right?: number };
    header?: string;
    footer?: string;
    scale?: number;
  };
  excel?: {
    sheetNames?: string[];
    dateFormat?: string;
    indent?: 'native' | 'spaces';
  };
  data?: Record<string, any>;
};

export interface StoreActions {
  ['add-card']: {
    card: Partial<KanbanCard>;
    edit?: boolean;
    id?: CardID;
    after?: CardID;
  };
  ['update-card']: { id: CardID; card: Partial<KanbanCard> };
  ['move-card']: { id: CardID; column?: ColumnID; before?: CardID | null };
  ['update-column']: { id: ColumnID; column: Partial<ColumnConfig> };
  ['duplicate-card']: {
    id: CardID;
    card?: Partial<KanbanCard>;
    edit?: boolean;
  };
  ['delete-card']: { id: CardID };
  ['select-card']: { id: CardID | null };
  ['filter-cards']: { filter?: FilterPredicate | null; tag?: string };
  ['sort-cards']: { sort?: SortCriterion };
  ['request-data']: { id: ColumnID };
  ['provide-data']: { id?: ColumnID; cards: KanbanCard[] };
  ['export-data']: ExportConfig;
  ['undo']: Record<string, never>;
  ['redo']: Record<string, never>;
}

/*
 * Widget types — bubbled up from the widget source (types.ts).
 */

type ShapeConfig<T> = boolean | T;

export type CardShapeItem = {
  id: CardID;
  label: string;
  css?: string;
};

export type CardShapeUserItem = CardShapeItem & {
  img?: string;
};

export type CardPriorityShape = {
  data?: CardShapeItem[];
};

export type CardTagsShape = {
  max?: number;
  data?: CardShapeItem[];
};

export type CardUsersShape = {
  max?: number;
  size?: 'sm' | 'md';
  data?: CardShapeUserItem[];
};

export type CardDeadlineShape = {
  format?: string;
};

export type CardMenuShape = {
  options?: any[];
  filter?: (item: any, card: KanbanCard) => boolean;
  // config field read by the widget as `.onclick`, not a React event prop
  onclick?: (e: any) => void;
};

export type CardShape = {
  cover?: boolean;
  priority?: ShapeConfig<CardPriorityShape>;
  progress?: ShapeConfig<{ showLabel?: boolean }>;
  deadline?: ShapeConfig<CardDeadlineShape>;
  users?: ShapeConfig<CardUsersShape>;
  tags?: ShapeConfig<CardTagsShape>;
  attachments?: boolean;
  comments?: boolean;
  description?: boolean;
  menu?: ShapeConfig<CardMenuShape>;
};

export type EditorShape = {
  description?: boolean;
  priority?: ShapeConfig<CardPriorityShape>;
  progress?: ShapeConfig<{ showLabel?: boolean }>;
  deadline?: ShapeConfig<CardDeadlineShape>;
  tags?: ShapeConfig<CardTagsShape>;
  users?: ShapeConfig<CardUsersShape>;
};

export type RenderConfig = {
  columnScroll?: boolean;
  fixedColumnWidth?: boolean;
  virtualizeCards?: boolean;
  virtualizeColumns?: boolean;
  estimatedCardHeight?: number;
  cardOverscan?: number;
  columnOverscan?: number;
};

export type CardCssFn = (card: KanbanCard, column: ColumnView) => string;
export type ColumnCssFn = (cards: KanbanCard[], column: ColumnView) => string;

export type KanbanInstanceApi = {
  getState: () => any;
  getReactiveState: () => any;
  getStores: () => { data: any };
  getCards: () => KanbanCard[];
  exec: <A extends keyof StoreActions>(
    action: A,
    data: StoreActions[A],
  ) => Promise<any>;
  on: <A extends keyof StoreActions>(
    action: A,
    handler: (data: StoreActions[A]) => void,
  ) => void;
  intercept: <A extends keyof StoreActions>(
    action: A,
    handler: (data: StoreActions[A]) => void | boolean | Promise<boolean>,
  ) => void;
  detach: (tag: number | string | symbol) => void;
  setNext: (handler: any) => any;
};

/*
 * Component events — store actions surface as camelCased `on*` props.
 *   add-card -> onAddCard, update-card -> onUpdateCard, sort-cards -> onSortCards, ...
 */
type PascalJoin<S extends string> = S extends `${infer Head}-${infer Tail}`
  ? `${Capitalize<Head>}${PascalJoin<Tail>}`
  : Capitalize<S>;

type EventName<K extends string> = `on${PascalJoin<K>}`;

export type KanbanActions<TActions extends Record<string, any>> = {
  [K in keyof TActions as EventName<K & string>]?: (ev: TActions[K]) => void;
} & {
  [key: `on${string}`]: (ev?: any) => void;
};

/*
 * Components.
 */

export interface KanbanProps {
  cards: KanbanCard[];
  columns: ColumnConfig[];
  columnAccessor?: ColumnAccessor;
  filters?: Map<string, FilterPredicate>;
  sort?: SortCriterion;
  card?: CardShape;
  readonly?: boolean;
  render?: RenderConfig;
  dynamicData?: boolean;
  history?: boolean;
  cardContent?: FC<{ card: KanbanCard; cardShape: CardShape }>;
  init?: (api: KanbanInstanceApi) => void;
  tooltip?: any;
  cardPopup?: any;
  cardCss?: CardCssFn;
  columnCss?: ColumnCssFn;
}

export declare const Kanban: ForwardRefExoticComponent<
  KanbanProps & KanbanActions<StoreActions> & RefAttributes<KanbanInstanceApi>
>;

export declare const Editor: FC<
  Omit<ComponentProps<typeof BaseEditor>, 'values'> & {
    api: KanbanInstanceApi;
  }
>;

export declare const ContextMenu: ForwardRefExoticComponent<
  {
    options?: any[];
    api?: KanbanInstanceApi | null;
    resolver?: ((card: KanbanCard, ev: MouseEvent) => any) | null;
    filter?: ((item: any, card: KanbanCard) => boolean) | null;
    at?: string;
    children?: ReactNode;
    onClick?: (e: any) => void;
    css?: string;
  } & RefAttributes<{ show: (ev: any, obj?: any) => void }>
>;

export declare const Toolbar: FC<{
  api?: KanbanInstanceApi | null;
  items?: any[];
  add?: boolean;
  undo?: boolean;
  sort?: boolean;
}>;

export declare const Willow: FC<{
  fonts?: boolean;
  children?: ReactNode;
}>;

export declare const WillowDark: FC<{
  fonts?: boolean;
  children?: ReactNode;
}>;

export declare const version: string;

/*
 * Defaults and helpers.
 */

export declare function getCardShape(): CardShape;
export declare function getEditorItems(shape?: EditorShape | CardShape): any[];
export declare function getPriorityOptions(): {
  id: number;
  label: string;
  css: string;
}[];
export declare function getMenuOptions(): any[];
export declare function getToolbarItems(config?: ToolbarButtonConfig): any[];

/* RestDataProvider — bubbled up from @svar-ui/kanban-provider (ships no .d.ts) */
export declare class RestDataProvider {
  constructor(url: string, options?: any);
}
