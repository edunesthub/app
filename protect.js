/* Disable right-click context menu to prevent access to "View Source" or "Inspect" */
document.addEventListener('contextmenu', e => e.preventDefault());

/* Disable double-click to prevent potential interactions like text selection or zooming */
document.addEventListener('dblclick', e => e.preventDefault());

/* Disable text selection to prevent copying code or content */
document.addEventListener('selectstart', e => e.preventDefault());

/* Disable common DevTools shortcuts: Ctrl+Shift+I (Inspect), Ctrl+U (View Source), F12 */
document.addEventListener('keydown', e => {
    if ((e.ctrlKey && (e.key === 'I' || e.key === 'i' || e.key === 'U' || e.key === 'u')) || e.key === 'F12') {
        e.preventDefault();
    }
});

/* Redirect if page is accessed via view-source: protocol */
if (window.location.protocol === 'view-source:') window.location.href = 'about:blank';




<script defer src="protect.js"></script>