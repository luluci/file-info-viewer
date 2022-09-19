import React from 'react';
import { invoke } from '@tauri-apps/api/tauri'
import "./Filter.css";

const PropKind = {
  Name: 0,
  Path: 1,
} as const;
//type PropKindT = typeof PropKind[keyof typeof PropKind];

interface ItemProp {
  id: number;
  key: string;
  value: string;
}

class FilerItem {
  public id: number;
  public props: Array<ItemProp>;

  constructor() {
    this.id = -1;
    this.props = Array<ItemProp>();
  }
}


function Header(props: any) {
  function changeFilter() {
    invoke('sample_command')
  }

  let headers: Array<number> = props.headers;
  let items: Array<FilerItem> = props.items;
  const cols = headers.map(value => {
    return (
      <th key={value.toString()}>
        <div>
          {items[0].props[value].key}
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

function Body(props: any) {
  let headers: Array<number> = props.headers;
  let items: Array<FilerItem> = props.items;
  const rows = items.map(value => {
    const cols = headers.map(idx => {
      return (
        <td>
          {value.props[idx].value}
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

  return (
    <tbody>
      {rows}
    </tbody>
  );
}


interface FilerState {
  headers: Array<number>;
  items: Array<FilerItem>;
}

class Filer extends React.Component<{ tgtDir:string }, FilerState> {
  onloaded: boolean;
  raw_headers: Array<number>;
  raw_items: Array<FilerItem>;

  constructor(props: { tgtDir: string }) {
    super(props);

    this.state = {
      headers: Array<number>(),
      items: Array<FilerItem>(),
    };

    this.onloaded = false;

    this.raw_headers = Array<number>();
    this.raw_items = Array<FilerItem>();
  }


  componentDidMount() {
    // Componentロード時実行
    // 何故か2回実行される
    if (!this.onloaded) {
      this.onloaded = true;
      invoke('init_filer', { path: "test" }).then((message) => {
        let param = message as Array<any>;
        this.setState({
          headers: param[0],
          items: param[1],
        });
        /*
        console.log(this.header);
        console.log(this.filelist);
        console.log(this.filelist[0].id);
        console.log(this.filelist[0].props);
        */
      });
    }
  }

  render() {
    console.log('render Filter');
    let className = 'Filer';

    return (
      <table className={className}>
        <Header headers={this.state.headers} items={this.state.items} />
        <Body headers={this.state.headers} items={this.state.items} />
      </table>
    );
  }
}

export default Filer;
