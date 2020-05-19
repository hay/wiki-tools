import { MediawikiApi } from 'wikidata-ux';

export default class CommonsApi extends MediawikiApi {
    constructor(opts = {}) {
        super('https://commons.wikimedia.org/w/api.php');
        this.thumbSize = opts.thumbSize || 300;
    }

    async entityData(mid) {
        // Note that this endpoint is different than the regular API endpoint
        const endpoint = `https://commons.wikimedia.org/wiki/Special:EntityData/${mid}.json`;
        const req = await window.fetch(endpoint);
        const data = await req.json();
        return data;
    }

    async entityStatements(mid) {
        const entity = await this.entityData(mid);
        const data = {};
        const entities = [];

        // First collect all of the statements
        const stats = entity.entities[mid].statements;

        for (const prop in stats) {
            data[prop] = [];
            entities.push(prop);

            for (const stat of stats[prop]) {
                // Non-datavalues are not supported yet
                if (!stat.mainsnak.datavalue) {
                    continue;
                }

                const datavalue = stat.mainsnak.datavalue;

                if (datavalue.type === 'wikibase-entityid') {
                    const qid = datavalue.value.id;

                    data[prop].push({
                        type : datavalue.type,
                        value : qid
                    });

                    entities.push(qid);
                } else if (datavalue.type === 'time') {
                    data[prop].push({
                        type : datavalue.type,
                        value : datavalue.value.time
                    })
                } else if (datavalue.type === 'globecoordinate') {
                    data[prop].push({
                        type : datavalue.type,
                        value : `${datavalue.value.latitude},${datavalue.value.longitude}`
                    });
                } else {
                    data[prop].push({
                        type : 'unsupported',
                        value : null
                    });
                }
            }
        }

        // Get labels for all entities
        const labels = await this.getEntityLabels(entities);

        // And now, repopulate with the labels
        for (const prop in data) {
            const items = data[prop];

            data[prop] = {
                propLabel : labels[prop],
                items : items.map((item) => {
                    let label;

                    if (item.type === 'wikibase-entityid') {
                        label = labels[item.value];
                    } else {
                        label = item.value;
                    }

                    return {
                        label : label,
                        type : item.type,
                        value : item.value
                    };
                })
            };
        }

        return data;
    }

    async getEntityLabels(entities) {
        const opts = {
            action : 'wbgetentities',
            ids : entities.filter(e => !!e).join('|'),
            props : 'labels',
            languages : this.language
        };

        const results = await this.call(opts);
        const labels = {};

        for (const entity in results.entities) {
            const label = results.entities[entity].labels[this.language].value;
            labels[entity] = label;
        }

        return labels;
    }

    getThumb(title, size = null) {
        size = !!size ? size : this.thumbSize;
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${title}?width=${size}`;
    }

    async imageinfo(titles, opts = {}) {
        titles = typeof titles === 'string' ? [titles] : titles;

        opts = Object.assign({
            action : 'query',
            prop : 'imageinfo',
            titles : titles.join('|'),
            iiextmetadatalanguage : this.language
        }, opts);

        const results = await this.call(opts);

        return results;
    }

    async opensearch(query, opts = {}) {
        opts = Object.assign({
            action : 'opensearch',
            namespace : '*',
            limit : 10,
            search : query
        }, opts);

        const results = await this.call(opts);

        return {
            query : query,
            results : results[1].map((label, index) => {
                return {
                    label : label,
                    description : results[2][index],
                    url : results[3][index]
                }
            })
        };
    }

    async search(query, opts = {}) {
        opts = Object.assign({
            limit : 20,
            namespace : '*',
            thumbSize : this.thumbSize
        }, opts);

        const results = await this.call({
            action : 'query',
            list : 'search',
            srlimit : opts.limit,
            srnamespace : opts.namespace,
            sroffset : opts.sroffset,
            srsearch : query
        });

        const items = results.query.search.map((item) => {
            const title = item.title.replace("File:", "");
            item.filename = title;
            item.mid = `M${item.pageid}`;
            item.thumb = this.getThumb(title, opts.thumbSize);
            item.url = `https://commons.wikimedia.org/wiki/${item.title}`;
            return item;
        });

        const hasNext = !!results.continue;

        return {
            count : results.query.searchinfo.totalhits,
            hasNext : hasNext,
            items : items,
            limit : opts.limit,
            // Note how we substract the limit from the offset, the Mediawiki API
            // really makes no sense
            offset : hasNext ? results.continue.sroffset - opts.limit : 0
        }
    }
}