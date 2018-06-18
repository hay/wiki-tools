import request from 'superagent';

function transformProp(prop) {
    if (prop.types) {
        prop.types = prop.types.join(', ');
    }

    if (prop.aliases) {
        prop.aliases = prop.aliases.join(' ');
    }

    prop.url = 'https://www.wikidata.org/wiki/Property:' + prop.id;

    prop.visible = true;

    prop.index = [prop.id, prop.label, prop.description].join(' ').toLowerCase();

    return prop;
}

export default class {
    constructor() {
        this.properties = null;
        this.callbacks = {};
    }

    getProperties() {
        return this.properties;
    }

    async load() {
        request
            .get('./props.json')
            .on('progress', e => {
                this.callbacks['progress'](e.percent);
            })
            .then((res) => {
                const properties = JSON.parse(res.text).map(transformProp);
                this.properties = properties;
                this.callbacks['ready']();
            });
    }

    on(event, callback) {
        this.callbacks[event] = callback;
    }
}