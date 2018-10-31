const $ = document.querySelector.bind(document);

function closest(list : number[], number : number) : number {
    return list.sort((a, b) => Math.abs(number - a) - Math.abs(number - b))[0];
}

export { $, closest };