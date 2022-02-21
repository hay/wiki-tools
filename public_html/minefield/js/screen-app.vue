<template>
    <div id="app">
        <h1>
            <a v-bind:href="rootUrl">
                {{title}}
            </a>
        </h1>

        <section v-show="!results">
            <p class="lead">
                {{description}}
            </p>
        </section>

        <div class="alert alert-danger" v-show="error">
            <p>Sorry, something went wrong. Here's an error message:</p>

            <p><code>{{error}}</code></p>
        </div>

        <div class="alert" v-show="loading">
            <p class="loading">Getting your results 😴...</p>
        </div>

        <form v-show="!results && !loading">
            <div class="cells cells-spaced">
                <p class="text-info">
                    Input your Commons file page titles separated by newlines.
                    <button
                        class="text-link"
                        v-show="!showPagepile"
                        v-on:click="displayPagepile($event)">
                        Or use a PagePile ID
                    </button>
                </p>
            </div>

            <div
                v-show="showPagepile"
                class="pagepile-input">
                <input
                    class="form-control"
                    placeholder="Enter PagePile ID"
                    v-model="pagepileInput" />

                <button
                    class="btn btn-primary"
                    v-bind:disabled="!pagepileInput"
                    v-on:click="setPagepile($event)">
                    Go
                </button>
            </div>

            <textarea
                class="form-control"
                v-model="titles"
                rows="50"></textarea>

            <button
                type="button"
                class="btn btn-primary buffer-top-2"
                v-bind:disabled="!titles.length"
                v-on:click="go">
                Go!
            </button>

            <button
                type="button"
                class="btn btn-link buffer-top-2"
                v-on:click="clear">
                Clear input
            </button>
        </form>

        <div v-show="results">
            <menu class="buffer-bottom-2">
                <button
                    type="button"
                    class="btn btn-primary"
                    v-on:click="download">
                    Download CSV
                </button>

                <button
                    type="button"
                    class="btn btn-default"
                    v-on:click="again">
                    Try again
                </button>
            </menu>

            <textarea
                class="form-control"
                v-model="csv"
                rows="50"></textarea>
        </div>
    </div>
</template>

<script>
    import { $ } from 'donot';
    import { chunk } from 'lodash';
    import Papa from 'papaparse';
    import saveCsv from 'save-csv';

    const MAX_TITLES_PER_CALL = 50;

    async function loadJson(url) {
        const req = await window.fetch(url);
        const json = await req.json();
        return json;
    }

    // Welcome in the special section of hell that is called URL encoding
    // https://www.mediawiki.org/wiki/Manual:PAGENAMEE_encoding#PAGENAME
    function encodePageTitle(title) {
        title = title.replace(/ /g, '_')
                     .replace(/&/g, '%26')
                     .replace(/"/g, '%22')
                     .replace(/'/g, '%27');

        return window.encodeURIComponent(title);
    }

    function getCommonsFilepage(str) {
        // URL's, note that we also take into account pasting from other
        // sites like Wikipedia
        str = str.replace(/https?:\/\/.+\/wiki\//, '');

        // This weird stuff is what we get from the WD query service
        // < https://phabricator.wikimedia.org/T238908#5684054 >
        str = str.replace('Special:FilePath/', 'File:');

        return str;
    }

    function getApiCall(pages) {
        pages = pages.map(window.decodeURIComponent).join('|');
        return `https://commons.wikimedia.org/w/api.php?action=query&origin=*&format=json&titles=${pages}`;
    }

    function getMetaProperty(key) {
        return $(`meta[property="${key}"]`).getAttribute('content');
    }

    function toCsv(data) {
        return Papa.unparse(data, {
            header : true,
            quotes : true
        });
    }

    // https://commons.wikimedia.org/w/api.php?action=query&titles=File:Albert%20Einstein%20Head.jpg|File:Cat.jpg&format=json
    async function getMidsForFilepages(filepages) {
        // First make sure we get the urls without the domain and stuff and encode
        filepages = filepages.map(getCommonsFilepage).map(encodePageTitle);

        // Now we need to chunk the filepages to the maximum allowed titles
        const chunks = chunk(filepages, MAX_TITLES_PER_CALL);

        // And create a final return array
        let results = [];

        for (let pages of chunks) {
            const url = getApiCall(pages);
            const data = await loadJson(url);

            console.log('Calling: ' + url);

            // Convert the results to an array with objects
            if (data.error) {
                throw Error(data.error.info);
            }

            for (let item of Object.values(data.query.pages)) {
                let mid = `M${item.pageid}`;

                let ret = {
                    mid : mid,
                    status : 'ok',
                    title : item.title,
                    url : `https://commons.wikimedia.org/wiki/Special:EntityData/${mid}`
                };

                if (!item.pageid) {
                    ret.status = 'error';
                    ret.mid = '-';
                    ret.url = '-';
                }

                results.push(ret);
            }
        }

        return results;
    }

    async function getPagesFromPagepile(id) {
        const url = `https://tools.wmflabs.org/pagepile/api.php?id=${id}&action=get_data&format=json&doit1`;
        const results = await loadJson(url);
        return results.pages;
    }

    export default {
        data() {
            return {
                csv : '',
                description : getMetaProperty("og:description"),
                error : false,
                loading : false,
                pagepileInput : null,
                results : '',
                rootUrl : getMetaProperty("og:url"),
                showPagepile : false,
                state : 'edit',
                title : getMetaProperty("og:title"),
                titles : []
            };
        },

        methods : {
            again() {
                this.results = '';
            },

            clear() {
                this.titles = [];
                this.error = false;
            },

            displayPagepile(e) {
                e.preventDefault();
                this.showPagepile = true;
            },

            download() {
                saveCsv(this.results);
            },

            go() {
                this.populate(this.titles.split('\n'));
            },

            parseHash() {
                const loc = window.location;

                if (!!loc.hash && String(loc).includes('pagepile=')) {
                    const hash = loc.hash.slice(1);
                    const id = hash.replace('pagepile=', '');
                    this.populateByPagepile(id);
                }
            },

            async populate(filepages) {
                this.loading = true;

                try {
                    this.results = await getMidsForFilepages(filepages);
                } catch (e) {
                    this.error = e.toString();
                    this.loading = false;
                    return;
                }

                this.csv = toCsv(this.results);
                this.loading = false;
            },

            async populateByPagepile(id) {
                const pages = await getPagesFromPagepile(id);
                this.populate(pages);
            },

            setPagepile(e) {
                e.preventDefault();
                this.populateByPagepile(this.pagepileInput);
            }
        },

        mounted() {
            window.addEventListener('hashchange', this.parseHash.bind(this));
            this.parseHash();
        }
    };
</script>