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

export async function getProperties() {
    const req = await fetch('./props.json');
    let properties = await req.json();
    return properties.map(transformProp);
}