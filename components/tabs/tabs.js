// usage
// <link rel="stylesheet" href="/components/tabs/tabs.css">
// <script type="module" src="/components/tabs/tabs.js"></script>
// 
// <doc-tab title="your title" items='[
//     {"title": "title1", "doc": "/doc/img.png"},
//     {"title": "title2", "doc": "/doc/page.html"},
//     {"title": "title3", "doc": "/doc/doc.pdf"}]'>
// </doc-tab>
// 
// embeds the document in an iframe and inserts it in a tab

class DocTabs extends HTMLElement{
    constructor() {
        super();

    }

    connectedCallback() {
        this.render();

    }

    get items() {
        try {
            return JSON.parse(this.getAttribute('items') || '[]');
        } catch (e) {
            console.error("Invalid JSON in items attribute", e);
            return [];
        }
    }

    get title(){
        return this.getAttribute('title') || '';
    }

    showtab(num){
        if(num === this.prev_index)
            return;

        this.tabs[num].classList.add('active');
        this.iframes[num].classList.add('active');
        this.tabs[this.prev_index].classList.remove('active');
        this.iframes[this.prev_index].classList.remove('active');
        this.prev_index = num;
    }

    render(){
        const title = this.title;
        const items = this.items;


        const tabsHTML = items.map((item, index) => `
            <a href="javascript:void(0)" class="custom-tab-link">
                <div class="">${item.title}</div>
            </a>
        `).join('');

        const contentHTML = items.map((item, index) => `
            <iframe 
                class="tab-iframe" 
                src="${item.doc}" 
                title="${item.title}" 
                loading="lazy"
                allow="geolocation 'none'; camera 'none'; microphone 'none'">
            </iframe>
        `).join('');


        this.innerHTML = `
        <div class="main-container">
            <div class="parent-container">
                ${tabsHTML}
            </div>
            <div class="iframe-tabs-container">
                ${contentHTML}
            </div>
        </div>
        `

        this.tabs = this.querySelectorAll(".custom-tab-link");
        this.iframes = this.querySelectorAll(".tab-iframe");
        this.prev_index = 1;
        this.showtab(0);

        this.tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                this.showtab(index);
            });
        });
    }

}

customElements.define('doc-tab', DocTabs);