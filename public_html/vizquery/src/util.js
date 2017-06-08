export function $(selector) {
    return document.querySelector(selector);
}

export function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}