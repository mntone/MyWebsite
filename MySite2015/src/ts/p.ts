"use strict";

var lasttarget: HTMLLIElement = null;
var focustarget: HTMLAnchorElement = null;
var isshown: boolean = false;

var mode: number = 0;
var modeType = { "mouse": 0, "touch": 1, "keyboard": 2 };
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


function show(li: HTMLLIElement, istouch: boolean) {
    if (isshown) return;

    li.classList.add("visible");
    if (istouch) li.classList.add("visible-touch");
    lasttarget = li;
    isshown = true;
}

function hide() {
    if (!isshown) return;

    lasttarget.classList.remove("visible", "visible-touch");
    lasttarget = null;
    isshown = false;
}

function getFilteredItems(nodes: NodeList, nodeName: string) {
    return [].filter.call(nodes, (n: HTMLElement) => n.nodeName == nodeName);
}

function indexOf(items: Array<HTMLLIElement>, current: HTMLLIElement): number {
    for (var i = 0; i != items.length; ++i) {
        var item = items[i];
        if (item == current) return i;
    }
    return -1;
}

function findPreviousSibling(ul: HTMLUListElement, current: HTMLLIElement): HTMLLIElement {
    var items = getFilteredItems(ul.childNodes, "LI");
    var index = indexOf(items, current);
    if (index == 0) return null;
    return items[index - 1];
}

function findNextSibling(ul: HTMLUListElement, current: HTMLLIElement): HTMLLIElement {
    var items = getFilteredItems(ul.childNodes, "LI");
    var index = indexOf(items, current);
    if (index >= items.length - 1) return null;
    return items[index + 1];
}

function init() {
    var body = document.body;
    body.addEventListener("keydown", (e: KeyboardEvent) => {
        setMode(modeType.keyboard);
    });
    body.addEventListener("pointerdown", (e: PointerEvent) => {
        if (e.pointerType == "touch" && mode != modeType.touch) {
            setMode(modeType.touch);
        }
        else if (mode != modeType.mouse) {
            setMode(modeType.mouse);
        }
        hide();
    });

    var ul = <HTMLUListElement>document.getElementById("nav-list");
    var btn = <HTMLUListElement>document.getElementById("menu-button");
    btn.addEventListener("pointerdown", (e: PointerEvent) => {
        if (ul.classList.contains("visible")) {
            ul.classList.remove("visible", "visible-touch");
        }
        else {
            if (e.pointerType == "touch") {
                ul.classList.add("visible", "visible-touch");
            }
            else {
                ul.classList.add("visible");
            }
        }
    });

    var items = getFilteredItems(ul.childNodes, "LI");
    for (var i = 0; i != items.length; ++i) {
        var li = <HTMLLIElement>items[i];
        li.addEventListener("pointerdown", (e: PointerEvent) => {
            if (e.pointerType == "touch") {
                setMode(modeType.touch);
                show(<HTMLLIElement>e.currentTarget, true);
            }
            e.cancelBubble = true;
        });
        li.addEventListener("pointerover", (e: PointerEvent) => {
            if (e.pointerType != "touch") {
                setMode(modeType.mouse);
                var target = <HTMLLIElement>e.currentTarget;
                show(target, false);

                var anchor = <HTMLAnchorElement>target.getElementsByTagName("a")[0];
                anchor.focus();
            }
        });
        li.addEventListener("pointerout", (e: PointerEvent) => {
            if (e.pointerType != "touch") {
                setMode(modeType.mouse);
                hide();
            }
        });

        var a = li.getElementsByTagName("a")[0];
        a.addEventListener("focus", (e: FocusEvent) => {
            if (mode == modeType.keyboard) {
                show(<HTMLLIElement>(<HTMLElement>e.currentTarget).parentElement, false);
            }
        });
        a.addEventListener("blur", (e: FocusEvent) => {
            if (mode == modeType.keyboard && focustarget != e.currentTarget) {
                hide();
            }
        });
        a.addEventListener("keydown", (e: KeyboardEvent) => {
            setMode(modeType.keyboard);

            var anchor = <HTMLAnchorElement>e.currentTarget;
            var target = <HTMLLIElement>anchor.parentElement;
            var parent = <HTMLUListElement>target.parentElement;
            if (e.keyCode == 38) {
                var secondLevelItems = target.getElementsByTagName("ul")[0].getElementsByTagName("li");
                var lastItem = secondLevelItems[secondLevelItems.length - 1].getElementsByTagName("a")[0];
                focustarget = anchor;
                lastItem.focus();
                e.preventDefault();
            }
            else if (e.keyCode == 40) {
                var secondLevelItems = target.getElementsByTagName("ul")[0].getElementsByTagName("li");
                var firstItem = secondLevelItems[0].getElementsByTagName("a")[0];
                focustarget = anchor;
                firstItem.focus();
                e.preventDefault();
            }
            else if (e.keyCode == 37) {
                var prevItem = findPreviousSibling(parent, target);
                if (prevItem != null) {
                    var prevItemAnchor = prevItem.getElementsByTagName("a")[0];
                    focustarget = prevItemAnchor;
                    prevItemAnchor.focus();
                    e.preventDefault();
                }
            }
            else if (e.keyCode == 39) {
                var nextItem = findNextSibling(parent, target);
                if (nextItem != null) {
                    var nextItemAnchor = nextItem.getElementsByTagName("a")[0];
                    focustarget = nextItemAnchor;
                    nextItemAnchor.focus();
                    e.preventDefault();
                }
            }
        });

        var ul2 = li.getElementsByTagName("ul")[0];
        var items2 = getFilteredItems(ul2.childNodes, "LI")
        for (var j = 0; j != items2.length; ++j) {
            var li2 = <HTMLLIElement>items2[j];
            var a2 = li2.getElementsByTagName("a")[0];
            a2.addEventListener("blur", (e: FocusEvent) => {
                if (focustarget != <HTMLAnchorElement>((<HTMLElement>e.currentTarget).parentElement.parentElement.parentElement.getElementsByTagName("a")[0])) {
                    hide();
                }
            });
            a2.addEventListener("keydown", (e: KeyboardEvent) => {
                setMode(modeType.keyboard);

                var target = <HTMLLIElement>(<HTMLElement>e.currentTarget).parentElement;
                var parent = <HTMLUListElement>target.parentElement;
                if (e.keyCode == 38) {
                    var prevItem = findPreviousSibling(parent, target);
                    if (prevItem != null) {
                        prevItem.getElementsByTagName("a")[0].focus();
                    }
                    else {
                        var first = parent.parentElement.getElementsByTagName("a")[0];
                        first.focus();
                    }
                    e.preventDefault();
                }
                else if (e.keyCode == 40) {
                    var nextItem = findNextSibling(parent, target);
                    if (nextItem != null) {
                        nextItem.getElementsByTagName("a")[0].focus();
                    }
                    else {
                        var first = parent.parentElement.getElementsByTagName("a")[0];
                        first.focus();
                    }
                    e.preventDefault();
                }
                else {
                    var firstLevelItem = <HTMLLIElement>parent.parentElement;
                    var firstLevelItems = <HTMLUListElement>firstLevelItem.parentElement;
                    if (e.keyCode == 37) {
                        var prevItem = findPreviousSibling(firstLevelItems, firstLevelItem);
                        if (prevItem != null) {
                            var prevItemAnchor = prevItem.getElementsByTagName("a")[0];
                            focustarget = prevItemAnchor;
                            prevItemAnchor.focus();
                            e.preventDefault();
                        }
                    }
                    else if (e.keyCode == 39) {
                        var nextItem = findNextSibling(firstLevelItems, firstLevelItem);
                        if (nextItem != null) {
                            var nextItemAnchor = nextItem.getElementsByTagName("a")[0];
                            focustarget = nextItemAnchor;
                            nextItemAnchor.focus();
                            e.preventDefault();
                        }
                    }
                }
            });
        }
    }
}
window.onload = function ()
{ if (typeof document.msCSSOMElementFloatMetrics !== "undefined") { document.msCSSOMElementFloatMetrics = !0; } init(); }