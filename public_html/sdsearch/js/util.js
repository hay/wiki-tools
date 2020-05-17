export function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = function() {
            resolve();
        }

        img.src = src;
    });
}