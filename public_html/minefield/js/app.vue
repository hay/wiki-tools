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

            <button
                class="btn btn-link"
                v-on:click="clear">
                Reset
            </button>
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
                class="pagepile-input flex-group buffer-bottom-1">
                <input
                    class="form-control flex-group__fill"
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
            <menu class="buffer-bottom-1">
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

            <div class="flex-group buffer-bottom-1">
                <strong>CSV Delimiter:</strong>

                <label class="radio-inline"
                       v-for="(val, label) in delimiters">
                    <input type="radio"
                           v-model="delimiter"
                           v-bind:value="val" />

                    {{label}} (<code>{{val}}</code>)
                </label>
            </div>

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
                delimiter : ',',
                delimiters : {
                    'comma'     : ',',
                    'tab'       : '\t',
                    'semicolon' : ';',
                    'pipe'      : '|',
                    'colon'     : ':'
                },
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
                downloadCsv(this.results, this.delimiter);
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
                let pages;

                try {
                    pages = await getPagesFromPagepile(id);
                } catch (e) {
                    console.error(e);
                    this.error = 'Could not get data for this Pagepile';
                    return;
                }

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