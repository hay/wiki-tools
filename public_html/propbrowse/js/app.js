import { getProperties } from './model.js';
import view from './view.js';

async function main() {
    const properties = await getProperties();
    view(properties);
}

main();