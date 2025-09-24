// src-tauri/src/main.rs
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Handle deep links
            #[cfg(target_os = "android")]
            {
                let handle = app.handle().clone();
                app.listen("android-intent", move |event| {
                    if let Some(payload) = event.payload() {
                        if let Ok(intent_data) = serde_json::from_str::<serde_json::Value>(payload) {
                            if let Some(url) = intent_data.get("url").and_then(|u| u.as_str()) {
                                if url.starts_with("com.fox5352.foxtrail_frontend://") {
                                    let _ = handle.emit("deep-link", url);
                                }
                            }
                        }
                    }
                });
            }
            
            #[cfg(target_os = "ios")]
            {
                let handle = app.handle().clone();
                app.listen("ios-url", move |event| {
                    if let Some(payload) = event.payload() {
                        if let Ok(url_data) = serde_json::from_str::<serde_json::Value>(payload) {
                            if let Some(url) = url_data.get("url").and_then(|u| u.as_str()) {
                                if url.starts_with("com.fox5352.foxtrail_frontend://") {
                                    let _ = handle.emit("deep-link", url);
                                }
                            }
                        }
                    }
                });
            }
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}