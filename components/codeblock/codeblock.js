// usage
// <script type="module" src="/components/codeblock/codeblock.js"></script>
// 
// <code-block language="python">
//     print("Hello World")
// </code-block>
// 
// uses the Shiki to convert code to HTML 
// supported languages: https://shiki.style/languages
// themes: https://shiki.style/themes

import { codeToHtml } from 'https://esm.sh/shiki@4.0.2';


class CodeBlock extends HTMLElement{
    constructor() {
        super();

    }

    async connectedCallback() {
        this.render();

    }

    get language(){
        return this.getAttribute('language');
    }

    get title(){
        return this.getAttribute('title') || '';
    }

    get code(){
        return this.textContent;
    }

    async render(){

        this.innerHTML = await codeToHtml(this.code, {
            lang: this.language,
            theme: 'night-owl'
        })

    }

}

customElements.define('code-block', CodeBlock);