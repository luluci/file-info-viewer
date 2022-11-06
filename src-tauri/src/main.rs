#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{ Serialize, Deserialize };
use std::fs::{self, File};
use compress_tools::*;

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
    ext: String,
    archive_files: Vec<String>,
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
            ext: String::new(),
            archive_files: vec![],
        },
    ]
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

fn make_entry(item: fs::DirEntry, id: u32) -> Entry {
    let pathbuf = item.path();
    let entry = if pathbuf.is_dir() {
        EntryType::Dir
    } else {
        EntryType::File
    };
    let mut size = 0;
    // let name = match item.file_name().into_string() {
    //     Ok(n) => n,
    //     Err(_) => "Invalid Unicode Name".to_string(),
    // };
    let name = item.file_name().to_string_lossy().to_string();
    let path = item.path().to_string_lossy().to_string();
    let ext = match pathbuf.extension() {
        Some(ex) => {
            ex.to_string_lossy().to_string()
        },
        None => "".to_string(),
    };
    // metadata check
    if let Ok(metadata) = item.metadata() {
        size = metadata.len();
    } else {
        
    }
    // archive file check
    let archive_files = match ext.to_lowercase().as_str() {
        "zip" => {
            make_archive_list(&path)
        }
        _ => {
            vec![]
        }
    };

    Entry{
        id,
        entry,
        name,
        path,
        size,
        ext,
        archive_files,
    }
}

fn make_archive_list(path: &String) -> Vec<String> {
    match File::open(path) {
        Err(_) => {
            vec![]
        },
        Ok(file) => {
            match list_archive_files(file) {
                Err(_) => {
                    vec![]
                },
                Ok(list) => {
                    list
                }
            }
        },
    }
}
