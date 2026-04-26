import leaders from '../store/leaders.js';

const element = document.getElementById('leaders');

function attachHoverOnlyAnimatedWebp(item, imgElement, animatedSrc) {
    let stillSrc = null;
    let replayToggle = 0;
    const replaySources = [`${animatedSrc}?play=0`, `${animatedSrc}?play=1`];

    const sourceImage = new Image();
    sourceImage.decoding = 'sync';

    sourceImage.addEventListener('load', () => {
        const canvas = document.createElement('canvas');
        canvas.width = sourceImage.naturalWidth;
        canvas.height = sourceImage.naturalHeight;

        const context = canvas.getContext('2d');
        if (!context) {
            imgElement.src = animatedSrc;
            return;
        }

        context.drawImage(sourceImage, 0, 0);
        stillSrc = canvas.toDataURL('image/png');
        imgElement.src = stillSrc;
    });

    sourceImage.addEventListener('error', () => {
        imgElement.src = animatedSrc;
    });

    sourceImage.src = animatedSrc;

    const playAnimation = () => {
        replayToggle = replayToggle === 0 ? 1 : 0;
        imgElement.src = replaySources[replayToggle];
    };

    const pauseAnimation = () => {
        if (stillSrc) {
            imgElement.src = stillSrc;
        }
    };

    item.addEventListener('mouseenter', playAnimation);
    item.addEventListener('focus', playAnimation);
    item.addEventListener('mouseleave', pauseAnimation);
    item.addEventListener('blur', pauseAnimation);
    imgElement.setAttribute('loading', 'lazy');
}

for (const leader of leaders) {
    const position = leader["position"];
    const name = leader["name"];
    const color = leader["color"];
    const pic = leader["pic"];

    if (name === undefined) continue;

    const item = document.createElement("div");
    item.style.color = color;

    const posEle = document.createElement("h3");
    const picEle = document.createElement("img");
    const nameEle = document.createElement("h5");

    posEle.innerText = position;
    posEle.className = 'leaderEle';

    picEle.className = 'leader_pic';
    attachHoverOnlyAnimatedWebp(item, picEle, pic);

    nameEle.innerText = name;
    nameEle.className = 'leaderEle';

    item.className = 'leader_item';
    item.appendChild(posEle);
    item.appendChild(picEle);
    item.appendChild(nameEle);

    element.appendChild(item);
}

const box = document.getElementById('leaders');

const minShot = 1000;
const maxShot = 3000;
const poolSize = 5;

const packetAnimationOptions = {
    duration: 1000,
    fill: 'none', // discards the animation
    easing: 'linear',
};

const packetAnimations = {
    leftToRight: [{ left: '0%',   opacity: 1 }, { left: '100%', opacity: 1 }],
    rightToLeft: [{ left: '100%', opacity: 1 }, { left: '0%',   opacity: 1 }],
    topToBottom: [{ top:  '0%',   opacity: 1 }, { top:  '100%', opacity: 1 }],
    bottomToTop: [{ top:  '100%', opacity: 1 }, { top:  '0%',   opacity: 1 }],
};


let pageVisible = !document.hidden;
document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
});

// IntersectionObserver pauses when the box is off-screen
let boxVisible = false;
const boxObserver = new IntersectionObserver(
    ([entry]) => {
        boxVisible = entry.isIntersecting;
    }, {
        threshold: 0
    }
);
boxObserver.observe(box);

const bounceKeyframes = [
    { transform: 'scale(1)' },
    { transform: 'scale(0.8)' },
    { transform: 'scale(1)' }
];

const bounceOptions = {
    duration: 300,
    easing: 'ease-out'
};

class Router {

    constructor(id, edge1, animation1, edge2, animation2) {
        const el = document.getElementById(id);
        if (!el) {
            console.error(`${id} not found`);
            return;
        }

        this.el = el;
        this.edge1 = edge1;
        this.animation1 = animation1;
        this.edge2 = edge2;
        this.animation2 = animation2;

        // Object pools
        this.pool1 = this.#buildPool(edge1, animation1);
        this.pool2 = this.#buildPool(edge2, animation2);
        this.poolIndex1 = 0;
        this.poolIndex2 = 0;

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.fire();
        });

        this.#scheduleNext();
    }

    #buildPool(edge, keyframes) {
        return Array.from({
            length: poolSize
        }, () => {
            const span = document.createElement('span');
            span.className = 'packet';
            // Pin to edge; opacity driven by keyframes so no residual style needed
            span.style[edge] = 'calc(-1 * var(--border_size))';
            span.style.opacity = '0';
            // DO NOT append to DOM yet — added/removed per animation
            return {
                element: span,
                keyframes,
                animation: null
            };
        });
    }

    #firePool(pool, indexKey) {
        const i = this[indexKey];
        this[indexKey] = (i + 1) % poolSize;
        const packet = pool[i];


        if (packet.animation && packet.animation.playState !== 'finished') {
            packet.animation.cancel();
            packet.element.remove();
        }

        // Insert into DOM only for the duration of the animation
        box.appendChild(packet.element);

        packet.animation = packet.element.animate(packet.keyframes, packetAnimationOptions);

        // Remove from DOM the moment the animation ends — keeps idle pool
        // elements out of the render tree entirely.
        packet.animation.addEventListener('finish', () => {
            packet.element.remove();
            packet.animation = null;
        }, {
            once: true
        });

        this.#bounce_router();
    }

    fire() {
        if (Math.random() >= 0.5) {
            this.#firePool(this.pool1, 'poolIndex1');
        } else {
            this.#firePool(this.pool2, 'poolIndex2');
        }
    }

    #bounce_router() {
        this.el.animate(bounceKeyframes, bounceOptions);
    }


    #scheduleNext() {
        const delay = Math.floor(Math.random() * (maxShot - minShot + 1)) + minShot;

        setTimeout(() => {
            // Only do work when the page and section are actually visible
            if (pageVisible && boxVisible) {
                this.fire();
            }
            this.#scheduleNext();
        }, delay);
    }
}

const topleft = new Router('top-left', 'top', packetAnimations.leftToRight, 'left', packetAnimations.topToBottom);
const topright = new Router('top-right', 'top', packetAnimations.rightToLeft, 'right', packetAnimations.topToBottom);
const bottomleft = new Router('bottom-left', 'bottom', packetAnimations.leftToRight, 'left', packetAnimations.bottomToTop);
const bottomright = new Router('bottom-right', 'bottom', packetAnimations.rightToLeft, 'right', packetAnimations.bottomToTop);