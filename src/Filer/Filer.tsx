import React from 'react';
import { invoke } from '@tauri-apps/api/tauri'

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
  let headers: Array<number> = props.headers;
  let items: Array<FilerItem> = props.items;
  const cols = headers.map(value => {
    return (
      <th>
        {items[0].props[value].key}
      </th>
    );
  });
  cols.push(
    <th className='spacer' />
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

class Filer extends React.Component<{}, FilerState> {
  onloaded: boolean;

  constructor(props: any) {
    super(props);

    this.state = {
      headers: Array<number>(),
      items: Array<FilerItem>(),
    };

    this.onloaded = false;
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
