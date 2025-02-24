import {A,E,O,Q} from '../AEOQ.mjs';
const tagName = 'diamond-grid';
Q('head').append(E('style', {id: tagName}, `
    ${tagName}:not(:defined) {
        opacity:0;
    }
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
            E('link', {rel: 'stylesheet', href: `https://aeoq.github.io/${tagName}/${tagName}.css`}),
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
        isNaN(new E(this).get('--side')) && new A({'--side': '20em'}).apply(this);
        isNaN(new E(this).get('--gap')) && new A({'--gap': '.5em'}).apply(this);
    }
    shape (ev) {
        ev.target.assignedElements().forEach(el => el.Q('shape') || el.prepend(...[0,0].map(_ => E('span', {classList: 'shape'}))));
    }
    rearrange(ev) {
        let children = ev?.target.assignedElements() ?? [...this.children];
        new A(this.#reset).apply(children);
        children = children.filter(child => !child.hidden);
        if (!children.length) return;

        let W = this.getBoundingClientRect().width,
            g = parseFloat(getComputedStyle(this).gap),
            w = children[0].getBoundingClientRect().width;
        let more = Math.floor((W + g) / (w + g)),
            less = Math.floor((2 * W - w + g) / 2 / (w + g));

        if (more === less)
            return children.forEach((child, i) => new A(this.#position[Math.ceil((i + 1) / more) % 2 === 0 ? 'right' : 'left']).apply(child));

        let n = 1, i;
        while (children[i = (more + less) * n - less]) {
            let j = 0;
            while (j <= more - 1 && children[i + j]) {
                new A(this.#position[j < more - 1 ? 'center' : 'next']).apply(children[i + j]);
                j++;
            }
            n++;
        }
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
