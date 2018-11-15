"use strict";

var style: number = 1;
const styleType = { "narrow": 0, "full": 1 };
function setStyle(value: number): boolean {
    if (style != value) {
        style = value;
        return true;
    }
    return false;
}

var mode: number = 0;
const modeType = { "mouse": 0, "touch": 1, "keyboard": 2 };
function setMode(value: number) {
    mode = value;
    var f = document.body.classList.contains("key");
    switch (value) {
        case modeType.mouse:
        case modeType.touch:
            if (f) document.body.classList.remove("key");
            break;

        case modeType.keyboard:
            if (!f) document.body.classList.add("key");
            break;
    }
}
function setModeFromType(type: string) {
    setMode(type == "touch" ? modeType.touch : modeType.mouse);
}

function getFilteredItems(nodes: NodeList, nodeName: string): any[] {
    return [].filter.call(nodes, (n: HTMLElement) => n.nodeName == nodeName);
}

interface IDisposable {
    dispose(): void;
}

class EventDisposable implements IDisposable {
    _element: HTMLElement;
    _eventName: string;
    _func: any;

    constructor(element: HTMLElement, eventName: string, func: any) {
        this._element = element;
        this._eventName = eventName;
        this._func = func;
        element.addEventListener(eventName, func);
    }

    dispose(): void {
        this._element.removeEventListener(this._eventName, this._func);
    }
}

class DisposableCollection implements IDisposable {
    _collection: IDisposable[];

    constructor() {
        this._collection = [];
    }

    dispose(): void {
        this._collection.forEach(d => d.dispose());
        this._collection.length = 0;
    }

    push(disposable: IDisposable): void {
        this._collection.push(disposable);
    }
}

interface IKeyboardArrowListener {
    onuparrowdown(e: KeyboardEvent): boolean;
    ondownarrowdown(e: KeyboardEvent): boolean;
    onleftarrowdown(e: KeyboardEvent): boolean;
    onrightarrowdown(e: KeyboardEvent): boolean;
}

abstract class KeyboardArrowSupport implements IKeyboardArrowListener {
    _ev: EventDisposable;

    protected constructor(protected element: HTMLElement) {
        this._init();
    }

    _init = (): void => {
        this._ev = new EventDisposable(this.element, "keydown", this.onkeydown.bind(this));
    }

    clear(): void {
        this._ev.dispose();
    }

    onkeydown(e: KeyboardEvent): void {
        setMode(modeType.keyboard);

        var c = e.keyCode;
        var ret = false;
        switch (c) {
            case 37: ret = this.onleftarrowdown(e); break;
            case 38: ret = this.onuparrowdown(e); break;
            case 39: ret = this.onrightarrowdown(e); break;
            case 40: ret = this.ondownarrowdown(e); break;
        }
        if (ret) e.preventDefault();
    }

    abstract onuparrowdown(e: KeyboardEvent): boolean;
    abstract ondownarrowdown(e: KeyboardEvent): boolean;
    abstract onleftarrowdown(e: KeyboardEvent): boolean;
    abstract onrightarrowdown(e: KeyboardEvent): boolean;
}

class SecondLevelLiCodeBehind extends KeyboardArrowSupport {
    private _a: HTMLAnchorElement;

    private _disposables: DisposableCollection;

    constructor(private parent: SecondLevelUlCodeBehind, private li: HTMLLIElement) {
        super(li.getElementsByTagName("a")[0]);
        this._a = <HTMLAnchorElement>this.element;

        this._disposables = new DisposableCollection();
    }

    init = (): void => {
        this._disposables.dispose();
        this._disposables = new DisposableCollection();

        if (style == styleType.full) {
            this._disposables.push(new EventDisposable(this.li, "pointerover", this.onpointerover.bind(this)));
        }
    }

    focus(): void {
        this._a.focus();
    }

    onpointerover(e: PointerEvent): void {
        if (e.pointerType !== "touch") {
            setMode(modeType.mouse);
            this.parent.setSelectedItem(this);
        }
    }

    onuparrowdown(e: KeyboardEvent): boolean {
        this.parent.prev();
        return true;
    }

    ondownarrowdown(e: KeyboardEvent): boolean {
        this.parent.next();
        return true;
    }

    onleftarrowdown(e: KeyboardEvent): boolean {
        this.parent.parent.parent.prev();
        return true;
    }

    onrightarrowdown(e: KeyboardEvent): boolean {
        this.parent.parent.parent.next();
        return true;
    }
}

abstract class UlCodeBehindBase<TChild> {
    protected _items: Array<TChild>;
    protected _selectedItem: TChild;

    constructor(protected ul: HTMLUListElement) { }

    init(func: (li: HTMLLIElement) => TChild): void {
        this._selectedItem = null;

        var liItems = <HTMLLIElement[]>getFilteredItems(this.ul.childNodes, "LI");
        this._items = liItems.map(li => func(li));
    }

    getPrevItem(current: TChild): TChild {
        var newIndex = this._items.indexOf(current) - 1;
        if (newIndex >= 0 && newIndex < this._items.length) {
            return this._items[newIndex];
        }
        return null;
    }

    getNextItem(current: TChild): TChild {
        var newIndex = this._items.indexOf(current) + 1;
        if (newIndex < this._items.length) {
            return this._items[newIndex];
        }
        return null;
    }
}

class SecondLevelUlCodeBehind extends UlCodeBehindBase<SecondLevelLiCodeBehind> {
    private _isshown: boolean;

    constructor(public parent: FirstLevelLiCodeBehind, ul: HTMLUListElement) {
        super(ul);
    }

    init(): void {
        super.init(li => new SecondLevelLiCodeBehind(this, li));
        if (style === styleType.narrow && this._isshown) {
            this.hide();
        }

        this._items.forEach(i => i.init());
    }

    show(): void {
        if (this._isshown) return;
        this._isshown = true;
        if (mode === modeType.touch) {
            this.ul.classList.add("visible", "visible-touch");
        } else {
            this.ul.classList.add("visible");
        }
    }

    hide(): void {
        if (!this._isshown) return;
        this.ul.classList.remove("visible", "visible-touch");
        this._isshown = false;
        this.setSelectedItem(null);
    }

    prev(): void {
        var item = this._selectedItem != null ? this.getPrevItem(this._selectedItem) : this._items[this._items.length - 1];
        if (item !== null) {
            this.setSelectedItem(item);
        } else if (style === styleType.full) {
            this.setSelectedItem(null);
            this.parent.focus();
        } else {
            var prevItem = this.parent.parent.getPrevItem(this.parent);
            if (prevItem !== null) {
                prevItem.getChild().prev();
            }
        }
    }

    next(): void {
        var item = this._selectedItem != null ? this.getNextItem(this._selectedItem) : this._items[0];
        if (item !== null) {
            this.setSelectedItem(item);
        } else if (style === styleType.full) {
            this.setSelectedItem(null);
            this.parent.focus();
        } else {
            var nextItem = this.parent.parent.getNextItem(this.parent);
            if (nextItem != null) {
                nextItem.getChild().next();
            }
        }
    }

    getSelectedItem(): SecondLevelLiCodeBehind {
        return this._selectedItem;
    }
    setSelectedItem(value: SecondLevelLiCodeBehind): boolean {
        if (this._selectedItem === value) return false;

        this._selectedItem = value;
        if (this._selectedItem != null) {
            this._selectedItem.focus();
        }
        return true;
    }
}

class FirstLevelLiCodeBehind extends KeyboardArrowSupport {
    private _a: HTMLAnchorElement;

    private _child: SecondLevelUlCodeBehind;
    private _disposables: DisposableCollection;

    private _isfocus: boolean;

    constructor(public parent: FirstLevelUlCodeBehind, private li: HTMLLIElement) {
        super(li.getElementsByTagName("a")[0]);
        this._a = <HTMLAnchorElement>this.element;

        var ul = li.getElementsByTagName("ul")[0];
        this._child = new SecondLevelUlCodeBehind(this, ul);

        this._disposables = new DisposableCollection();
    }

    init(): void {
        this._disposables.dispose();
        this._disposables = new DisposableCollection();

        if (style === styleType.full) {
            this._disposables.push(new EventDisposable(this.li, "pointerdown", this.onpointerdown.bind(this)));
            this._disposables.push(new EventDisposable(this.li, "pointerover", this.onpointerover.bind(this)));
            this._disposables.push(new EventDisposable(this.li, "pointerout", this.onpointerout.bind(this)));
            this._disposables.push(new EventDisposable(this._a, "focus", this.onfocus.bind(this)));
            this._disposables.push(new EventDisposable(this._a, "blur", this.onblur.bind(this)));
        }

        this._child.init();
    }

    focus(): void {
        this._a.focus();
    }

    onfocus(e: FocusEvent): void {
        this.parent.setSelectedItem(this);
    }

    onblur(e: FocusEvent): void {
        if (mode === modeType.keyboard) {
            if (!this._isfocus) {
                this.parent.setSelectedItem(null);
            } else {
                this._isfocus = false;
            }
        }
    }

    onpointerdown(e: PointerEvent): void {
        if (e.pointerType === "touch") {
            setMode(modeType.touch);
            this.parent.setSelectedItem(this);
        }
        e.cancelBubble = true;
    }

    onpointerover(e: PointerEvent): void {
        if (e.pointerType !== "touch") {
            setMode(modeType.mouse);
            this.parent.setSelectedItem(this);
        }
    }

    onpointerout(e: PointerEvent): void {
        if (e.pointerType !== "touch") {
            setMode(modeType.mouse);
            this.parent.setSelectedItem(null);
        }
    }

    onkeydown(e: KeyboardEvent): void {
        if (e.keyCode === 9) {
            if (!e.shiftKey) {
                this._isfocus = true;
            } else if (e.shiftKey && this.parent.getPrevItem(this) != null) {
                this._isfocus = true;
            }
        }
        else {
            super.onkeydown(e);
        }
    }

    onuparrowdown(e: KeyboardEvent): boolean {
        this._isfocus = true;
        this._child.prev();
        return true;
    }

    ondownarrowdown(e: KeyboardEvent): boolean {
        this._isfocus = true;
        this._child.next();
        return true;
    }

    onleftarrowdown(e: KeyboardEvent): boolean {
        if (style == styleType.full) {
            this.parent.prev();
            return true;
        }
        return false;
    }

    onrightarrowdown(e: KeyboardEvent): boolean {
        if (style === styleType.full) {
            this.parent.next();
            return true;
        }
        return false;
    }

    getChild(): SecondLevelUlCodeBehind {
        return this._child;
    }
}

class FirstLevelUlCodeBehind extends UlCodeBehindBase<FirstLevelLiCodeBehind> {
    private _isshown: boolean;

    constructor(ul: HTMLUListElement) {
        super(ul);
    }

    init(): void {
        super.init(li => new FirstLevelLiCodeBehind(this, li));
        this._isshown = false;
        if (style === styleType.full && this._isshown) {
            this.hide();
        }

        this._items.forEach(i => i.init());
    }

    toggle(): void {
        if (!this._isshown) {
            this.show();
        } else {
            this.hide();
        }
    }

    show(): void {
        this._isshown = true;
        if (mode === modeType.touch) {
            this.ul.classList.add("visible", "visible-touch");
        } else {
            this.ul.classList.add("visible");
        }
    }

    hide(): void {
        this.ul.classList.remove("visible", "visible-touch");
        this._isshown = false;
    }

    prev(): void {
        if (style === styleType.narrow) throw new Error();
        if (this._selectedItem !== null) {
            var item = this.getPrevItem(this._selectedItem);
            if (item !== null) {
                item.focus();
            }
        }
    }

    next(): void {
        if (style === styleType.narrow) throw new Error();
        if (this._selectedItem !== null) {
            var item = this.getNextItem(this._selectedItem);
            if (item !== null) {
                item.focus();
            }
        }
    }

    getSelectedItem(): FirstLevelLiCodeBehind {
        if (style === styleType.narrow) throw new Error();
        return this._selectedItem;
    }
    setSelectedItem(value: FirstLevelLiCodeBehind): boolean {
        if (style === styleType.narrow) throw new Error();
        if (this._selectedItem === value) return false;

        if (this._selectedItem !== null) {
            this._selectedItem.getChild().hide();
        }
        this._selectedItem = value;
        if (this._selectedItem !== null) {
            if (mode === modeType.mouse) {
                this._selectedItem.focus();
            }
            this._selectedItem.getChild().show();
        }
        return true;
    }
}

class PageCodeBehind {
    _body: HTMLBodyElement;
    _menuButton: HTMLDivElement;

    _child: FirstLevelUlCodeBehind;
    _disposables: DisposableCollection;

    constructor(body: HTMLBodyElement) {
        window.addEventListener("resize", (e: UIEvent) => {
            if (this.initStyle()) {
                this.init();
            }
        });

        this._body = body;
        body.addEventListener("keydown", (e: KeyboardEvent) => {
            setMode(modeType.keyboard);
        });
        body.addEventListener("pointerdown", (e: PointerEvent) => {
            if (e.pointerType === "touch" && mode !== modeType.touch) {
                setMode(modeType.touch);
            }
            else if (mode !== modeType.mouse) {
                setMode(modeType.mouse);
            }

            if (style === styleType.full) {
                this._child.setSelectedItem(null);
            }
        });

        var ul = <HTMLUListElement>document.getElementById("nav-list");
        this._child = new FirstLevelUlCodeBehind(ul);
        this._menuButton = <HTMLDivElement>document.getElementById("menu-button");

        this._disposables = new DisposableCollection();

        this.initStyle();
        this.init();
    }

    init(): void {
        this._disposables.dispose();
        this._disposables = new DisposableCollection();

        if (style === styleType.narrow) {
            this._disposables.push(new EventDisposable(this._menuButton, "pointerdown", this.onmenubuttonpointerdown.bind(this)));
            this._disposables.push(new EventDisposable(this._menuButton, "keydown", this.onmenubuttonkeydown.bind(this)));
        }

        this._child.init();
    }

    private initStyle(): boolean {
        if (this._body.clientWidth >= 720) {
            return setStyle(styleType.full);
        } else {
            return setStyle(styleType.narrow);
        }
    }

    onmenubuttonpointerdown(e: PointerEvent): void {
        setModeFromType(e.pointerType);
        this._child.toggle();
    }

    onmenubuttonkeydown(e: KeyboardEvent): void {
        setMode(modeType.keyboard);
        if (e.keyCode === 13) {
            this._child.toggle();
        }
    }
}

var codeBehind: PageCodeBehind;
window.onload = function () {
    var anyDocument = <any>document;
    if (typeof anyDocument.msCSSOMElementFloatMetrics !== "undefined") {
        anyDocument.msCSSOMElementFloatMetrics = !0;
    }
    codeBehind = new PageCodeBehind(<HTMLBodyElement>document.body);
}