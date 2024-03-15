#[tauri::command]
fn log_message(message: String) {
    use std::fs::OpenOptions;
    use std::io::Write;

    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open("app.log")
        .unwrap();

    writeln!(file, "{}", message).unwrap();
}


#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![log_message])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
