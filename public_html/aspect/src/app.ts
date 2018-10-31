import { $, closest } from './util.js';
import { getAspects, getThumbnailUrl } from './api.js';

const $qid = $("#qid");
const $img = $("#image");
const $output = $("#output");

$("#go").addEventListener('click', async (e) => {
    e.preventDefault();
    $img.removeAttribute('src');
    $output.innerHTML = '';

    const qid = $qid.value;
    const aspects = await getAspects(qid);
    const screenAspect = window.innerWidth / window.innerHeight;
    const aspectRatio = closest(Object.keys(aspects).map(Number), screenAspect);
    const imageName = aspects[aspectRatio];
    const imageUrl = getThumbnailUrl(imageName, window.innerWidth);
    console.log(aspectRatio, imageName, imageUrl);
    $img.src = imageUrl;
    $output.innerHTML = `aspect: ${aspectRatio} - ${imageName}`;
});