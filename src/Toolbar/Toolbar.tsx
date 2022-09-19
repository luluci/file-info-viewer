import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri'
import { open } from '@tauri-apps/api/dialog'
import "./Toolbar.css";

function Toolbar(props: any) {
  const [tgtDir, setTgtDir] = useState("")

  function openDialog() {
    open({
      directory: true,
      multiple: false,
    }).then(files => {
      if (typeof(files) === "string") {
        setTgtDir(files);
      }
    });
  }

  return (
    <div className='Toolbar'>
      <button >Fav</button>
      <input
        id="folder"
        value={tgtDir}
        placeholder="Folder..." />
      <button onClick={openDialog}>Folder</button>
    </div>
  );
}

export default Toolbar;
