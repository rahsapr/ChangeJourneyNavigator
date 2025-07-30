/* --- GLOBAL STYLES & THEME --- */
:root {
    --font-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --bg-sidebar: #191d23;
    --bg-main: #22272e;
    --bg-header: #2d333b;
    --bg-element: #2d333b;
    --border-color: #444c56;
    --text-primary: #cdd9e5;
    --text-secondary: #768390;
    --accent-blue: #58a6ff;
    --status-done: #3fb950;
    --status-progress: #bb86fc;
    --status-todo: #768390;
    --danger-red: #f85149;
}

body {
    font-family: var(--font-main);
    background-color: var(--bg-main);
    color: var(--text-primary);
    margin: 0;
    overflow: hidden;
    font-size: 14px;
}

/* --- LAYOUT --- */
#monarchApp { display: flex; height: 100vh; }
.sidebar { width: 55px; background-color: var(--bg-sidebar); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; padding: 15px 0; flex-shrink: 0; }
.main-content { flex-grow: 1; display: flex; flex-direction: column; }
.main-header { padding: 10px 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.view-container { flex-grow: 1; overflow: hidden; position: relative; }
.view { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; visibility: hidden; transition: opacity 0.2s, visibility 0.2s; }
.view.active { opacity: 1; visibility: visible; }

/* --- SIDEBAR --- */
.sidebar-logo { font-size: 1.6rem; color: var(--accent-blue); margin-bottom: 25px; }
.sidebar-nav { list-style: none; padding: 0; margin: 0; text-align: center; }
.nav-item { font-size: 1.4rem; color: var(--text-secondary); padding: 12px 0; cursor: pointer; transition: color 0.2s; }
.nav-item:hover, .nav-item.active { color: var(--accent-blue); }
.sidebar-footer { margin-top: auto; }
.sidebar-footer label { cursor: pointer; color: var(--text-secondary); font-size: 1.4rem; }
#csvUploader { display: none; }

/* --- HEADER & CONTROLS --- */
.main-header h1 { margin: 0; font-size: 1.1rem; font-weight: 600; }
.control-btn { background-color: var(--bg-element); border: 1px solid var(--border-color); color: var(--text-primary); padding: 6px 12px; border-radius: 6px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; }
.control-btn:hover { background-color: #3e444d; }
.control-btn.primary { background-color: #33925b; border-color: #33925b; }
.control-btn.primary:hover { background-color: #3fb950; }
.header-controls { display: flex; gap: 10px; }
.control-btn i { margin-right: 6px; }

/* --- LIST VIEW & TABLE --- */
.list-view-container { height: 100%; overflow-y: auto; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px 15px; font-size: 12px; color: var(--text-secondary); text-transform: uppercase; border-bottom: 1px solid var(--border-color); }
td { padding: 12px 15px; border-bottom: 1px solid var(--border-color); }
tr:hover { background-color: #2a2f37; }
.status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.status-badge.done { background-color: rgba(63, 185, 80, 0.15); color: var(--status-done); }
.status-badge.in-progress { background-color: rgba(187, 134, 252, 0.15); color: var(--status-progress); }
.status-badge.to-do { background-color: rgba(118, 131, 144, 0.15); color: var(--status-todo); }
.action-buttons button { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 14px; padding: 5px; }
.action-buttons button:hover { color: var(--accent-blue); }
.placeholder-text { display: flex; justify-content: center; align-items: center; height: 100%; color: var(--text-secondary); }

/* --- MODAL --- */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-overlay.hidden { display: none; }
.modal-content { background-color: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; width: 100%; max-width: 600px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
.modal-content form { padding: 25px; }
.modal-content h2 { margin: 0 0 20px 0; font-size: 1.2rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
.form-group { display: flex; flex-direction: column; }
.form-group label { margin-bottom: 5px; font-size: 12px; color: var(--text-secondary); }
.form-group input, .form-group select { background-color: var(--bg-sidebar); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px; border-radius: 6px; }
.modal-actions { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 20px; margin-top: 10px; }
.modal-actions button { background-color: var(--bg-element); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; }
.modal-actions button.primary { background-color: #33925b; border-color: #33925b; }
.modal-actions button.primary:hover { background-color: #3fb950; }
.modal-actions button.btn-danger { color: var(--danger-red); }
.modal-actions button.btn-danger:hover { background-color: rgba(248, 81, 73, 0.1); }
.modal-actions div { display: flex; gap: 10px; }
