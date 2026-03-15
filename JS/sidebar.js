const sidebar_SVG = document.getElementById('sidebarSVG');
const toggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

function HamburgerAddEventListener() {
    const svgDoc = sidebar_SVG.contentDocument; 
    
    const svgRoot = svgDoc.documentElement;

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        toggle.classList.toggle('active');
        
        svgRoot.classList.toggle('active');
    });
};

// Firefox Issue where the javascript fires off before the SVG loads
if (sidebar_SVG.contentDocument && sidebar_SVG.contentDocument.readyState === 'complete') {
    // already loaded
    HamburgerAddEventListener();
} else {
    // wait until it loads
    sidebar_SVG.addEventListener('load', HamburgerAddEventListener);
}