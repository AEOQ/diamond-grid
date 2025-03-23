import {A,E,O,Q} from '../AEOQ.mjs';
const tagName = 'diamond-grid';
Q('head').append(E('style', {id: tagName}, `
    ${tagName} .shape {
        width:50%; height:100%;

        &:nth-child(1) {
            float:left;    
            shape-outside:polygon(0% 0%,100% 0%,0% 50%,100% 100%,0% 100%);
        }
        &:nth-child(2) {
            float:right; 
            shape-outside:polygon(100% 0%,0% 0%,100% 50%,0% 100%,100% 100%);
        }
    }`
));
customElements.define(tagName, class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'}).append(
            E('link', {rel: 'stylesheet', href: `https://aeoq.github.io/${tagName}/style.css`}),
            E('slot', {onslotchange: (ev) => [this.shape(ev), this.rearrange(ev)]})
        );
        new ResizeObserver(([entry]) => {
            let newWidth = entry.borderBoxSize[0].inlineSize;
            newWidth != this.#oldWidth && this.rearrange();
            this.#oldWidth = newWidth;
        }).observe(this);
        new MutationObserver(() => this.rearrange()).observe(this, {attributeFilter: ['hidden'], subtree: true});
    }
    #oldWidth;
    connectedCallback() {
        let E_this = E(this);
        isNaN(E_this.get('--side')) && E_this.set({'--side': '20em'});
        isNaN(E_this.get('--gap')) && E_this.set({'--gap': '.5em'});
        setTimeout(() => this.hidden = false, 1000);
    }
    shape (ev) {
        ev.target.assignedElements().forEach(el => el.Q('shape') || el.prepend(...[0,0].map(_ => E('span', {classList: 'shape'}))));
    }
    rearrange(ev) {
        let items = ev?.target.assignedElements() ?? [...this.children];
        items.forEach(item => E(item).set(this.#reset));
        items = items.filter(item => !item.hidden);
        if (!items.length) return;

        this.style.opacity = 0;
        Promise.all(items.filter(item => item.tagName == 'IMG').map(img => new Promise(res => img.complete ? res() : img.onload = res)))
        .then(() => {
            this.style.opacity = 1;
            let W = this.getBoundingClientRect().width,
                g = parseFloat(getComputedStyle(this).gap),
                w = items[0].getBoundingClientRect().width;
            let more = Math.floor((W + g) / (w + g)),
                less = Math.floor((2 * W - w + g) / 2 / (w + g));
    
            if (more === less)
                return items.forEach((item, i) => E(item).set(this.#position[Math.ceil((i + 1) / more) % 2 === 0 ? 'right' : 'left']));
    
            let n = 1, i;
            while (items[i = (more + less) * n - less]) {
                let j = 0;
                while (j <= more - 1 && items[i + j]) {
                    E(items[i + j]).set(this.#position[j < more - 1 ? 'center' : 'next']);
                    j++;
                }
                n++;
            }
        });
    };
    #position = {
        left: {'--factor': -1},
        right: {'--factor': 1},
        center: {'--factor': 2},
        next: {style: {gridColumn: 1}}
    }
    #reset = {'--factor': null, style: {gridColumn: null}}
});
//nw+(n-1)g=W, n=(W+g)/(w+g)
//nw+(n-1)g=W-(w+g/2), n=(2W-w+g)/2(w+g)  
