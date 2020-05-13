<template>
    <div class="app__content">
        <div class="search">
            <menu class="search__actions">
                <wm-button
                    v-on:click="addKeyword('haswbstatement:P180=null')"
                    icon="image">Add depicts</wm-button>

                <wm-button
                    v-on:click="addKeyword('')"
                    icon="text">Add text</wm-button>

                <wm-button
                    v-on:click="addKeyword('haswbstatement')"
                    icon="tag">Add claim</wm-button>
            </menu>

            <div class="search__keywords">
                <search-keyword
                    v-for="(keyword, index) in keywords"
                    v-bind:key="index"
                    v-on:remove="removeItem(index)"
                    v-model="keywords[index]"></search-keyword>
            </div>

            <menu class="search__actions">
                <wm-button
                    flair="action"
                    v-on:click="setSearch"
                    icon="search">Search</wm-button>
            </menu>
        </div>

        <p v-show="loading"
            class="loading">Loading...</p>

        <search-examples v-if="!results"></search-examples>

        <results-grid
            v-if="results"
            v-bind:results="results"
            v-bind:offset="offset"
            v-bind:queryString="queryString"></results-grid>
    </div>
</template>

<script>
    import ResultsGrid from './results-grid.vue';
    import SearchExamples from './search-examples.vue';
    import SearchKeyword from './search-keyword.vue';
    import { parseHash, searchCommons } from '../api.js';
    import CommonsApi from '../commons-api.js';

    const commonsApi = new CommonsApi();

    export default {
        components : { ResultsGrid, SearchExamples, SearchKeyword },

        computed : {
            queryString() {
                return this.keywords.join(' ');
            }
        },

        data() {
            return {
                keywords : [],

                loading : false,

                offset : 0,

                results : null
            }
        },

        methods : {
            addKeyword(keyword) {
                this.keywords.push(keyword);
            },

            parseHash() {
                const { keywords, offset } = parseHash(window.location.hash.slice(1));

                this.offset = offset;

                if (!keywords.length) {
                    // Default keywords, don't search
                    this.keywords = ['haswbstatement:P180=null'];
                } else {
                    this.keywords = keywords;
                    this.search();
                }
            },

            removeItem(indexToRemove) {
                this.keywords = this.keywords.filter((keyword, index) => {
                    return index !== indexToRemove;
                });
            },

            async search() {
                // Only search if we have anything to search for
                if (!this.queryString.length) {
                    return;
                }

                this.loading = true;
                this.results = false;
                this.results = await searchCommons(this.queryString, this.offset);
                this.loading = false;
            },

            setSearch() {
                window.location.hash = '#q=' + this.queryString;
            }
        },

        mounted() {
            window.addEventListener('hashchange', () => {
                this.parseHash();

                // FIXME: for some reason wbstatement-entry components don't
                // get filled with the correct prop/claim when having a hashchange,
                // but this does work if we reload the page. Obviously
                // this is a hack.
                window.location.reload();
            });

            this.parseHash();
        }
    }
</script>