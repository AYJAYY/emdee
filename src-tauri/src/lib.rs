use std::fs;
use std::path::Path;
use std::sync::Mutex;

/// Holds the file path passed as a CLI argument (e.g. double-clicked .md file)
struct InitialFile(Mutex<Option<String>>);

/// Read a text file and return its contents
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {e}"))
}

/// Return the file path passed at launch (double-click / CLI). Called once by the frontend on startup.
#[tauri::command]
fn get_initial_file(state: tauri::State<'_, InitialFile>) -> Option<String> {
    state.0.lock().ok()?.clone()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Fix white screen on Linux: disable WebKit GPU compositing and DMA-buf renderer
    #[cfg(target_os = "linux")]
    {
        std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    // Capture file path from CLI args — set when user double-clicks a .md file
    let initial_file = std::env::args()
        .nth(1)
        .filter(|p| Path::new(p).is_file());

    tauri::Builder::default()
        .manage(InitialFile(Mutex::new(initial_file)))
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![read_file, get_initial_file])
        .run(tauri::generate_context!())
        .expect("error while running EmDee");
}
