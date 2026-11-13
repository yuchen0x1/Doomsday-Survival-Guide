use std::fs;
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;

/// Save through the system picker; never accept a writable filesystem path from the WebView.
#[tauri::command]
async fn save_text_file(
    app: tauri::AppHandle,
    content: String,
    filename: String,
) -> Result<bool, String> {
    if content.len() > 25 * 1024 * 1024 || filename.contains(['/', '\\']) {
        return Err("文件内容或名称无效".into());
    }
    let picked = app
        .dialog()
        .file()
        .set_file_name(&filename)
        .blocking_save_file();
    let Some(picked) = picked else {
        return Ok(false);
    };
    let path = picked
        .into_path()
        .map_err(|e| format!("解析保存路径失败: {e}"))?;
    fs::write(path, content).map_err(|e| format!("保存失败: {e}"))?;
    Ok(true)
}

/// 返回应用数据目录（供 SQLite / 本地备份文件存放），不存在则创建
#[tauri::command]
fn app_data_dir(app: tauri::AppHandle) -> Result<String, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("获取应用数据目录失败: {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| format!("创建数据目录失败: {e}"))?;
    Ok(dir.to_string_lossy().to_string())
}

/// 读取备份：弹出系统「打开文件」对话框，返回文件文本内容
#[tauri::command]
fn read_backup(app: tauri::AppHandle) -> Result<String, String> {
    let picked = app
        .dialog()
        .file()
        .add_filter("JSON 备份", &["json"])
        .blocking_pick_file();
    let fp = picked.ok_or_else(|| "未选择文件".to_string())?;
    let path = fp
        .into_path()
        .map_err(|e| format!("解析文件路径失败: {e}"))?;
    fs::read_to_string(path).map_err(|e| format!("读取备份失败: {e}"))
}

/// 托盘菜单：显示主窗口 / 紧急急救链接 / 退出
fn setup_tray(app: &mut tauri::App) -> tauri::Result<()> {
    use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};

    let show = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
    let first_aid = MenuItem::with_id(app, "first_aid", "紧急急救链接", true, None::<&str>)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &first_aid, &sep, &quit])?;

    // 菜单挂在 tauri.conf.json 创建的托盘（id = main-tray）上
    if let Some(tray) = app.tray_by_id("main-tray") {
        tray.set_menu(Some(menu))?;
        tray.set_tooltip(Some("APOCALYPSE SURVIVAL · 末日生存"))?;
    }

    app.on_menu_event(|app, event| match event.id().as_ref() {
        "show" => {
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
                let _ = win.unminimize();
                let _ = win.set_focus();
            }
        }
        "first_aid" => {
            // 前端为 BrowserRouter：直接推进路由并通知 React Router
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
                let _ = win.unminimize();
                let _ = win.set_focus();
                let _ = win.eval(
                    "window.history.pushState({}, '', '/first-aid');\
                     window.dispatchEvent(new PopStateEvent('popstate'));",
                );
            }
        }
        "quit" => app.exit(0),
        _ => {}
    });
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            app_data_dir,
            read_backup,
            save_text_file
        ])
        .setup(|app| {
            setup_tray(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
