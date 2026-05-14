// usage
// <script type="module" src="/components/popup/popup.js"></script>
// <pop-up title="My Title">
//     <button slot="button"> Button to open the popup</button>
//     <p>This is the main content</p>
// </pop-up>

class PopUp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        });
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="/CSS/main.css" />
        <link rel="stylesheet" href="/components/popup/popup.css">

        <span id="open-btn">
            <slot name="button">
                <button >Open Popups</button>
            </slot>
        </span>

        
        <dialog id="my-dialog">
            <div class="title">
                <h1>${this.title}</h1>
                <div class="img-container">
                    <img src="/assets/icons/close.svg" id="close-icon" alt="Close dialog">
                </div>
            </div>
            <hr class="line">
            <main id="main"><slot></slot></main>
        </dialog>
    `;
    }

    get title(){
        return this.getAttribute('title') || '';
    }

    connectedCallback() {
        const dialog = this.shadowRoot.querySelector('#my-dialog');
        const openBtn = this.shadowRoot.querySelector('#open-btn');
        const closeIcon = this.shadowRoot.querySelector('#close-icon');

        // Show the modal when the button is clicked
        openBtn.addEventListener('click', () => dialog.showModal());

        // Close the dialog when clicking outside the dialog content (on the backdrop)
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.close();
        });

        closeIcon.addEventListener('click', () => dialog.close());


        // Also allow closing with Escape
        dialog.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') dialog.close();
        });
    }
}

customElements.define('pop-up', PopUp);