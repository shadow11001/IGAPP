
// Explicit Initialization for Globals
//
//
//
//
//
//
//

document.addEventListener('DOMContentLoaded', () => {
    // Attempt Init on ported classes since they are globally appended for now
    try { if (typeof SQLITE_STORAGE !== 'undefined') window.SQLITE_STORAGE.init(); } catch (e) {}
    try { if (typeof HISTORY_SYSTEM !== 'undefined') window.HISTORY_SYSTEM.init(); } catch (e) {}
    try { if (typeof DEAD_AIR_TRACKER !== 'undefined') window.DEAD_AIR_TRACKER.init(); } catch (e) {}
    try { if (typeof WAR_ROOM_SYSTEM !== 'undefined') window.WAR_ROOM_SYSTEM.init(); } catch (e) {}
    try { if (typeof EMS_MAPPING !== 'undefined') window.EMS_MAPPING.init(); } catch (e) {}
    try { if (typeof TAG_SYSTEM !== 'undefined') window.TAG_SYSTEM.init(); } catch (e) {}

    // Initialize Theme
    try {
        const isDark = localStorage.getItem("theme") === "dark";
        document.body.classList.toggle("dark-mode", isDark);
        if (typeof updateThemeIcon === 'function') window.updateThemeIcon(isDark);
    } catch(e) {}
});

// Since we separated them into script files, we need to bind the inline HTML onclick events to window
window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById(tabId);
    if (target) target.style.display = 'block';
    
    const btn = document.querySelector(`.tab-btn[onclick*="${tabId}"]`);
    if (btn) btn.classList.add('active');
};
