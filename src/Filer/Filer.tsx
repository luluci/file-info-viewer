import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri'
import "./Filter.css";

// ファイラ列要素
export const PropKind = {
  Name: 0,
  Path: 1,
  Size: 2,
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
} as const;


export interface Entry {
  id: number;
  entry: PropKind;
  name: string;
  path: string;
  size: number;
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
    default:
      return "";
  };
}

function Body(props: { headerIndex: Array<PropKind>, items: Array<Entry> }) {
  console.log(props.items);
  const rows = props.items.map(entry => {
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

export const Filer = (props: { headers: Array<PropKind>, items: Array<Entry> }) => {
  // // 初回レンダリング時実行
  // useEffect(() => {
  //   const initHeader = async () => {
  //     const entries = await invoke<Array<Entry>>('init_filer', { path: props.tgtDir });
  //     setItems(entries);
  //   };
  //   initHeader();
  //   console.log('render Filter: initHeader');
  // }, []);
  // フィルター処理用hook
  const [filtered, setFiltered] = useState<number>(0);
  useEffect(() => {
    console.log('render Filter: initHeader');
  }, [filtered]);

  console.log('render Filter');
  let className = 'Filer';

  // フィルター適用
  let filteredItems: Array<Entry>;
  //
  filteredItems = props.items;

  // const getItems = async (path: string) => {
  //   const entries = await invoke<Array<Entry>>('read_dir', { path });
  //   rawItems.splice(0);
  //   rawItems.push(...entries);
  // }
  // getItems(props.tgtDir);

  return (
    <table className={className}>
      <Header headerIndex={props.headers} />
      <Body headerIndex={props.headers} items={filteredItems} />
    </table>
  );
}
