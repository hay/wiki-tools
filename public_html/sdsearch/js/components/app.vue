<template>
    <div class="app__content">
        <div class="search">
            <menu class="search__actions">
                <wm-button
                    v-on:click="addKeyword('haswbstatement:P180')"
                    icon="image">Add depicts</wm-button>

                <wm-button
                    v-on:click="addKeyword('')"
                    icon="text">Add text</wm-button>

                <wm-button
                    v-on:click="addKeyword('deepcat')"
                    icon="category">Add category</wm-button>

                <wm-button
                    v-on:click="addKeyword('haswbstatement')"
                    icon="tag">Add claim</wm-button>
            </menu>

            <div class="search__keywords">
                <search-keyword
                    v-for="(keyword, index) in keywords"
                    v-bind:key="keyword.id"
                    v-on:remove="removeItem(keyword.id)"
                    v-model="keywords[index].keyword"></search-keyword>
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
    import Vue from 'vue';
    import ResultsGrid from './results-grid.vue';
    import SearchExamples from './search-examples.vue';
    import SearchKeyword from './search-keyword.vue';
    import { parseHash, searchCommons } from '../api.js';

    export default {
        components : { ResultsGrid, SearchExamples, SearchKeyword },

        computed : {
            queryString() {
                return this.keywords.map(k => k.keyword).join(' ');
            }
        },

        data() {
            return {
                keywords : [],

                loading : false,

                offset : 0,

                refIndex : 0,

                results : null
            }
        },

        methods : {
            addKeyword(keyword) {
                this.refIndex += 1;

                this.keywords.push({
                    id : this.refIndex,
                    keyword : keyword
                });
            },

            parseHash() {
                const { keywords, offset } = parseHash(window.location.hash.slice(1));

                this.keywords = [];
                this.offset = offset;

                if (!keywords.length) {
                    // Default keywords, don't search
                    this.addKeyword('haswbstatement:P180');
                } else {
                    keywords.forEach(k => this.addKeyword(k));
                }

                // Also search when we have something to show pretty stuff
                // on screen
                this.search();
            },

            removeItem(idToRemove) {
                this.keywords = this.keywords.filter(k => k.id !== idToRemove);
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
            window.addEventListener('hashchange', async () => {
                this.parseHash();
            });

            this.parseHash();
        }
    }
</script>