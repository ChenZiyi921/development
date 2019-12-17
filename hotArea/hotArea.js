HTMLElement.prototype.css = function (opts) {
    if (/Object/.test(Object.prototype.toString.call(opts))) {
        for (let key in opts) {
            opts[key] && (this.style[key] = opts[key].toString())
        }
    }
}

function mix(...mixins) {
    class Mix {
        constructor() {
            for (let mixin of mixins) {
                copyProperties(this, new mixin());
            }
        }
    }

    for (let mixin of mixins) {
        copyProperties(Mix, mixin);
        copyProperties(Mix.prototype, mixin.prototype);
    }

    return Mix;
}

function copyProperties(target, source) {
    for (let key of Reflect.ownKeys(source)) {
        if (key !== 'constructor'
            && key !== 'prototype'
            && key !== 'name'
        ) {
            let desc = Object.getOwnPropertyDescriptor(source, key);
            Object.defineProperty(target, key, desc);
        }
    }
}

class Main {
    constructor() {

    }
    extNumber(str) {
        return str.replace(/[^0-9]/ig, "") * 1
    }
    getStyle(obj, attr) {
        return obj.currentStyle ? obj.currentStyle[attr] : document.defaultView.getComputedStyle(obj, null)[attr]
    }
    GBCR(obj) {
        return obj.getBoundingClientRect()
    }
}

class HotArea extends Main {
    constructor() {
        super()
        this.body = document.body;
        this.img = document.querySelector('img');
        this.container = document.querySelector('.container');
        this.linkAddress = document.querySelector('#linkAddress');
        this.width = document.querySelector('#width');
        this.height = document.querySelector('#height');
        this.sx, this.sy;
        this.moveEvevtObj = null;
        this.config = [];
        this.linkIndex = 0;
        this.init()
        this.addArea()
    }
    init() {
        this.body.ondragstart = () => { return false }
    }
    addArea() {
        this.container.addEventListener('mousedown', (e) => {
            const target = (e = e || window.event).target || e.srcElement;
            this.target = target;
            this.sx = e.pageX;
            this.sy = e.pageY;
            this.containerAttr = {
                paddingLeft: this.extNumber(this.getStyle(this.container, 'padding-left')),
                marginLeft: this.extNumber(this.getStyle(this.container, 'margin-left')),
                paddingTop: this.extNumber(this.getStyle(this.container, 'padding-top')),
                marginTop: this.extNumber(this.getStyle(this.container, 'margin-top'))
            }
            const targetFocus = (el) => {
                let globalItem = document.querySelectorAll('.item');
                if (globalItem) {
                    globalItem.forEach((current, index) => {
                        current.classList.remove('active');
                        current.innerHTML = '';
                    })
                    el.classList.add('active');
                    el.innerHTML = `<div class="right_bottom"></div>`;
                    for (let i = 0; i < globalItem.length; i++) {
                        if (/active/.test(globalItem[i].classList)) {
                            this.linkIndex = i;
                            this.linkAddress.value = this.config[i].link;
                            this.width.value = this.config[i].style.width;
                            this.height.value = this.config[i].style.height;
                            break
                        }
                    }
                }
            }
            if (!/item|right_bottom/.test(target.classList)) {
                const item = document.createElement('a');
                let domProps = {
                    position: 'absolute',
                    left: `${((this.sx - this.containerAttr.paddingLeft - this.containerAttr.marginLeft) / this.container.offsetWidth * 100).toFixed(2)}%`,
                    top: `${((this.sy - this.containerAttr.paddingTop - this.containerAttr.marginTop) / this.container.offsetHeight * 100).toFixed(2)}%`,
                    width: '10px',
                    height: '10px',
                    boxSizing: 'border-box'
                }
                item.classList.add('item');
                item.css(Object.assign({ border: '1px solid #ccc' }, domProps));
                this.container.appendChild(item);
                this.config.push({
                    link: '',
                    style: domProps
                });
                targetFocus(item)
                this.start()
                this.end([document.querySelector('.right_bottom'), this.container, this.body])
            } else if (/item/.test(target.classList)) {
                targetFocus(target)
                this.start()
                this.end([document.querySelector('.right_bottom'), this.container, this.body])
            }
        })
    }
    start() {
        let controlItem = document.querySelectorAll('.right_bottom')
        if (controlItem) {
            controlItem.forEach((current, index) => {
                current.addEventListener('mousedown', () => {
                    this.moveEvevtObj = this.move.bind(this);
                    this.container.addEventListener('mousemove', this.moveEvevtObj)
                })
            })
        }
    }
    move(e) {
        let item = this.target.parentNode;
        let itemWidth = ((e.pageX - this.GBCR(item).left) / this.container.offsetWidth * 100).toFixed(2);
        let itemHeight = ((e.pageY - this.GBCR(item).top) / this.container.offsetHeight * 100).toFixed(2);
        if (!/item/.test(item.classList) || itemWidth > 100 || e.pageX > this.GBCR(this.container).right) return;
        if (itemHeight > 100 || e.pageY > this.GBCR(this.container).bottom) return;
        this.config[this.linkIndex].style.width = this.width.value = item.style.width = itemWidth + '%';
        this.config[this.linkIndex].style.height = this.height.value = item.style.height = itemHeight + '%';
    }
    end(arg) {
        arg.forEach((current, index) => {
            current.addEventListener('mouseup', (e) => {
                current.removeEventListener('mousemove', this.moveEvevtObj)
            })
        })
    }
}

class Setting extends HotArea {
    constructor() {
        super()
        this.setLink()
        this.deleteLink()
        this.saveConfig()
    }
    setLink() {
        const saveLink = document.querySelector('#saveLink');
        saveLink.addEventListener('click', () => {
            if (this.config != '') {
                this.config[this.linkIndex].link = this.linkAddress.value;
            }
        })
    }
    deleteLink() {
        const delLink = document.querySelector('#deleteLink');
        delLink.addEventListener('click', () => {
            if (this.config != '') {
                let globalItem = document.querySelectorAll('.item');
                document.querySelector('.container').removeChild(globalItem[this.linkIndex])
                this.config.splice(this.linkIndex, 1)
                this.linkAddress.value = '';
            }
        })
    }
    saveConfig() {
        const create = document.querySelector('#create');
        create.addEventListener('click', () => {
            console.log(this.config)
        })
    }
}

new Setting