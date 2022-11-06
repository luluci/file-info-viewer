import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { Filer, Entry, PropKind } from './Filer/Filer';
import Toolbar from './Toolbar/Toolbar';

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [tgtDir, setTgtDir] = useState("");
  const [headers, setHeaders] = useState<Array<PropKind>>([PropKind.Name, PropKind.Ext, PropKind.Size, PropKind.ArchiveFiles, PropKind.Path]);
//  const [items, setItems] = useState<Array<Entry>>([]);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  function exeCommand() {
    invoke('sample_command')
  }

  function cbTgtDir(path: string) : void {

    // Toolbar更新
    invoke('read_dir', {path}).then(() => {
      console.log('select dir: ' + path);
      setTgtDir(path);
    })

    // // Filer更新
    // const cbTgtDirImpl = async (path: string) => {
    //   const entries = await invoke<Array<Entry>>('read_dir', { path });
    //   setItems(entries);
    // }
    // cbTgtDirImpl(path);
  }

  return (
    <div className="container">
      <div className="row">
        <Toolbar setTgtDir={cbTgtDir} />
      </div>
      <div className="row">
        <Filer headers={headers} uri={tgtDir} />
      </div>
    </div>
  );
  /*
  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <div className="row">
        <div>
          <input
            id="greet-input"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <button type="button" onClick={() => greet()}>
            Greet
          </button>
        </div>
      </div>
      <p>{greetMsg}</p>

      <p><button onClick={exeCommand}>Exec: sample_command</button></p>
      <div className="row">
        <Filer />
      </div>
    </div>
  );
  */
}

export default App;
