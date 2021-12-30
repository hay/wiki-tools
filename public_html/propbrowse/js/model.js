import { getJson } from 'donot';

function transformProp(prop) {
    if (prop.types) {
        prop.types = prop.types.join(', ');
    }

    if (prop.aliases) {
        prop.aliases = prop.aliases.join(' ');
    }

    prop.url = 'https://www.wikidata.org/wiki/Property:' + prop.id;

    prop.index = [prop.id, prop.label, prop.description].join(' ').toLowerCase();

    return prop;
}

export default class {
    constructor() {
        this.properties = null;
    }

    getDatatypes() {
        const values = this.properties.map(p => p.datatype);
        const props = [...new Set(values)];
        return props.sort();
    }

    getProperties() {
        return this.properties;
    }

    async load() {
        const data = await getJson("./props.json");
        this.properties = data.map(transformProp);
    }
}