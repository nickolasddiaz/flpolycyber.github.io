// usage
// <link rel="stylesheet" href="/components/slideshow/slideshow.css">
// <script type="module" src="/components/slideshow/slideshow.js"></script>
// 
// <slide-show duration="5000" items='[
//     {"title": "title1", "img": "/img/img.png"},
//     {"title": "title2", "img": "/img/img.png"},
//     {"title": "title3", "img": "/img/img.png"}]'>
// </slide-show>

class SlideShow extends HTMLElement {
    constructor() {
        super();
        this._slideIndex = 0;
        this.automove = true;
        this.slides = [];
        this.dots = [];
        this._autoTimer = null;
        this._duration = this.duration;
    }

    connectedCallback() {
        this.render();
        this.slides = this.querySelectorAll(".mySlides");
        this.dots = this.querySelectorAll(".slidedot");
        this.automove = true;
        this.slideIndex = 0;
        this.startAuto();
        this.showSlides();
    }

    get duration(){
        return JSON.parse(parseInt(this.getAttribute('duration')) || 5000);
    }

    get items() {
        try {
            return JSON.parse(this.getAttribute('items') || '[]');
        } catch (e) {
            console.error("Invalid JSON in items attribute", e);
            return [];
        }
    }

    set slideIndex(num){
        const total = this.dots.length;
        if (total === 0) {
            this._slideIndex = 0;
            return;
        }

        this._slideIndex = ((num % total) + total) % total;
        this.showSlides();
    }

    get slideIndex(){
        return this._slideIndex;
    }

    plusSlides(n) {
        this.automove = false;
        this.slideIndex = this._slideIndex + n;
    }
    
    currentSlide(n) {
        this.automove = false;
        this.slideIndex = n;
    }

    startAuto() {
        if (this._autoTimer) {
            clearInterval(this._autoTimer);
        }

        this._autoTimer = setInterval(() => {
            if (this.automove) {
                this.slideIndex = this._slideIndex + 1;
            }
        }, this._duration);
    }

    showSlides() {
        const slides = this.slides;
        const dots = this.dots;

        // Hide all slides
        slides.forEach(slide => slide.style.display = "none");

        for (let i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }

        // Show the active slide
        if (slides.length > 0) {
            slides[this.slideIndex].style.display = "block";
            dots[this.slideIndex].className += " active";
        }

    }

    printHex(num){
        return '0x' + num.toString(16).padStart(2, '0');
    }

    render() {
        const items = this.items;
        
        // Generate the slide HTML dynamically
        const slidesHTML = items.map((item, index) => `
            <div class="mySlides slidefade">
                <div class="slidenumbertext">${this.printHex(index)}</div>
                <div class="slidecenter slideimage-container">
                    <img class="slideslideimg" src="${item.img}" alt="${item.title}">
                </div>
            </div>
        `).join('');

        const dots = items.map((item, index) => `
            <span class="slidedot" data-slide="${index}"> ${item.title} </span>
        `).join('');

        this.innerHTML = `
        <div>            
            <div class="slidedots">
                ${dots}
            </div>
                
            <div class="slideimg-container">
                ${slidesHTML}
                <a id="slideprev">❮</a>
                <a id="slidenext">❯</a>
             </div>
        </div>
        `;

        this.querySelector('#slideprev').addEventListener('click', () => this.plusSlides(-1));
        this.querySelector('#slidenext').addEventListener('click', () => this.plusSlides(1));

        this.querySelectorAll('.slidedot').forEach((dot) => {
            dot.addEventListener('click', () => {
                const slide = Number(dot.dataset.slide);
                this.currentSlide(slide);
            });
        });
    }
}

customElements.define('slide-show', SlideShow);