import { MediawikiApi } from 'wikidata-ux';

export default class CommonsApi extends MediawikiApi {
    constructor(opts = {}) {
        super('https://commons.wikimedia.org/w/api.php');
        this.thumbSize = opts.thumbSize || 300;
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