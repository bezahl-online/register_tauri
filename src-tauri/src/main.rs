#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// fn main() {
//   tauri::Builder::default()
//       .setup(|app| {
//           #[cfg(debug_assertions)] // only include this code on debug builds
//           {
//               let window = app.get_window("main").unwrap();

//               window.open_devtools();
//               window.close_devtools();
//           }
//           Ok(())
//       })
//       .run(tauri::generate_context!())
//       .expect("error while running tauri application");
// }