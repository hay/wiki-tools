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
    import {
        downloadCsv,
        getMetaProperty,
        getMidsForFilepages,
        getPagesFromPagepile,
        toCsv
    } from './api.js';

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
                downloadCsv(this.results);
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