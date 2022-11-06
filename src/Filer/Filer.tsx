import React, { useState, useEffect, Suspense } from 'react';
import { invoke } from '@tauri-apps/api/tauri'
import "./Filter.css";
import { Loadable } from "../Lib/Loadable";

// ファイラ列要素
export const PropKind = {
  Name: 0,
  Path: 1,
  Size: 2,
  Ext: 3,
  ArchiveFiles: 4,
} as const;
export type PropKind = typeof PropKind[keyof typeof PropKind];
// ファイラ列要素名称
// type PropKindMapType = { [Member in keyof typeof PropKind]: string };
// const PropKindMap: PropKindMapType = {
//   Name: 'name',
//   Path: 'path',
//   Size: 'size',
// } as const;
export type PropKindMap = { [Member in PropKind]: string };
export const PropKindMap: PropKindMap = {
  0: 'Name',
  1: 'Path',
  2: 'Size',
  3: 'Extension',
  4: 'ArchiveFiles',
} as const;


export interface Entry {
  id: number;
  entry: PropKind;
  name: string;
  path: string;
  size: number;
  ext: string;
  archive_files: string[];
}


function Header(props: { headerIndex: Array<PropKind> }) {
  function changeFilter() {
    invoke('sample_command')
  }

  const cols = props.headerIndex.map(value => {
    return (
      <th key={value.toString()}>
        <div>
          {PropKindMap[value]}
        </div>
        <div>
          <input
            id={value.toString()}
            onChange={changeFilter}
            placeholder="Filter..." />
        </div>
      </th>
    );
  });
  cols.push(
    <th className='spacer' key="-1" />
  );
  //console.log(cols);

  return (
    <thead>
      <tr>
        {cols}
      </tr>
    </thead>
  );
}

const getEntryProp = (entry: Entry, idx: PropKind): string => {
  switch (idx) {
    case PropKind.Name:
      return entry.name;
    case PropKind.Path:
      return entry.path;
    case PropKind.Size:
      return entry.size.toString();
    case PropKind.Ext:
      return entry.ext;
    case PropKind.ArchiveFiles:
      if (entry.archive_files.length > 0) {
        return entry.archive_files[0];
      } else {
        return "";
      }
    default:
      return "";
  };
}

function Body(props: { headerIndex: Array<PropKind>, items: ItemsLoader, uri: string }) {
  console.log(props.items);
  const value = props.items.get(props.uri);
  const rows = value.map(entry => {
    const cols = props.headerIndex.map(idx => {
      return (
        <td>
          {getEntryProp(entry, idx)}
        </td>
      );
    });
    cols.push(
      <td className='spacer' />
    );
    return (
      <tr>
        {cols}
      </tr>
    );
  });

  if (rows.length == 0) {
    rows.push(
      <tr>
        <td>No Dirs/Files.</td>
        <td></td>
        <td></td>
        <td className='spacer' />
      </tr>
    );
  }

  return (
    <tbody>
      {rows}
    </tbody>
  );
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchItems(path: string) {
  //await sleep(5000);
  return await invoke<Array<Entry>>('read_dir', { path });
}

class ItemsLoader {
  #key: string;
  #data: Loadable<Entry[]>;

  constructor(key: string) {
    this.#key = key;
    this.#data = new Loadable(fetchItems(key));
  }
  get(key: string): Entry[] {
    if (this.#key != key) {
      this.#key = key;
      this.#data = new Loadable(fetchItems(key));
    }

    return this.#data.getOrThrow();
  }
}

export const Filer = (props: { headers: Array<PropKind>, uri: string }) => {
  const [items] = useState(() => new ItemsLoader(props.uri));
  // フィルター処理用hook
  const [filtered, setFiltered] = useState<number>(0);
  useEffect(() => {
    console.log('render Filter: initHeader');
  }, [filtered]);

  console.log('render Filter: path=' + props.uri);
  let className = 'Filer';

  // // フィルター適用
  // let filteredItems: Array<Entry>;
  // //
  // filteredItems = props.items;

  return (
    <table className={className}>
      <Header headerIndex={props.headers} />
      <Suspense fallback={<tbody><tr><td>Loading...</td></tr></tbody>}>
        <Body headerIndex={props.headers} items={items} uri={props.uri} />
      </Suspense>
    </table>
  );
}
