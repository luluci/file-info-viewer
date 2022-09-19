#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{ Serialize, Deserialize };


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            sample_command,
            init_filer,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}




#[tauri::command]
fn sample_command() {
    println!("invoked sample_comamnd!");
}

enum PropKind {
    Name,
    Path,
}

#[derive(Debug, Serialize, Deserialize)]
struct ItemProp {
    id: u32,
    key: String,
    value: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct FilerItem {
    id: u32,
    //path: String,
    // ディレクトリ/ファイルが持つ情報を配列で記憶
    props: Vec<ItemProp>,
}

#[tauri::command]
fn init_filer(path: String) -> (Vec<u32>, Vec<FilerItem>) {
    println!("invoked init_filer({})!", path);

    let items = vec![
        FilerItem{
        id: 0,
        props: vec![
            ItemProp{ id:PropKind::Name as u32, key:"name".to_string(), value:"file1".to_string() },
            ItemProp{ id:PropKind::Path as u32, key:"path".to_string(), value:"file1.path".to_string() },
        ]
        },
        FilerItem{
        id: 1,
        props: vec![
            ItemProp{ id:PropKind::Name as u32, key:"name".to_string(), value:"file2".to_string() },
            ItemProp{ id:PropKind::Path as u32, key:"path".to_string(), value:"file2.path".to_string() },
        ]
        },
    ];

    let cols: Vec<u32> = vec![
        0,1
    ];

    (cols, items)
}

