#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{ Serialize, Deserialize };
use std::{fs, ffi::OsString};

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
            read_dir,
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

#[derive(Debug, Serialize, Deserialize)]
enum EntryType {
    File,
    Dir,
}

#[derive(Debug, Serialize, Deserialize)]
struct Entry {
    id: u32,
    entry: EntryType,
    name: String,
    path: String,
    size: u64,
}



#[tauri::command]
fn init_filer(path: String) -> Vec<Entry> {
    println!("invoked init_filer({})!", path);

    vec![
        Entry {
            id: 0,
            entry: EntryType::File,
            name: String::new(),
            path: String::new(),
            size: 1,
        },
    ]
}

fn make_entry(item: fs::DirEntry, id: u32) -> Entry {
    let path = item.path();
    let entry = if path.is_dir() {
        EntryType::Dir
    } else {
        EntryType::File
    };
    let size = if path.is_dir() {
        0
    } else {
        if let Ok(metadata) = item.metadata() {
            metadata.len()
        } else {
            0
        }
    };
    let name = match item.file_name().into_string() {
        Ok(n) => n,
        Err(_) => "Invalid Unicode Name".to_string(),
    };
    let path = match path.into_os_string().into_string() {
        Ok(n) => n,
        Err(_) => "Invalid Unicode Path".to_string(),
    };

    Entry{
        id,
        entry,
        name,
        path,
        size,
    }
}

#[tauri::command]
fn read_dir(path: String) -> Vec<Entry> {
    println!("invoked setTgtDir({})!", path);
    let mut id: u32 = 0;
    let mut result = Vec::<Entry>::new();

    match fs::read_dir(path) {
        Err(why) => {
            // 
            println!("! {:?}", why.kind())
        },
        Ok(paths) => for path in paths {
            match path {
                Err(why) => {

                },
                Ok(item) => {
                    // Entry作成
                    let entry = make_entry(item, id);
                    id += 1;
                    //
                    result.push(entry);
                },
            }
        },
    };

    result
}
