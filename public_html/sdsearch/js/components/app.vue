<template>
    <div class="app__content">
        <language-selector
            v-bind:languages="languages"
            v-bind:link="transateLink"
            v-model="locale"></language-selector>

        <app-header></app-header>

        <div class="search">
            <menu class="search__actions">
                <p class="search__actions-label">{{$t('search_using')}}</p>

                <wm-button
                    v-on:click="addKeyword('haswbstatement:P180')"
                    icon="image">{{$t('depicts')}}</wm-button>

                <wm-button
                    v-on:click="addKeyword('')"
                    icon="text">{{$t('text')}}</wm-button>

                <wm-button
                    v-on:click="addKeyword('deepcat')"
                    icon="category">{{$tc('categories', 2)}}</wm-button>

                <wm-button
                    v-on:click="addKeyword('haswbstatement')"
                    icon="tag">{{$t('claims')}}</wm-button>
            </menu>

            <div class="search__keywords">
                <search-keyword
                    v-for="(keyword, index) in keywords"
                    v-bind:key="keyword.id"
                    v-on:remove="removeItem(keyword.id)"
                    v-model="keywords[index].keyword"></search-keyword>
            </div>

            <pre v-if="debug">{{queryString}}</pre>

            <menu class="search__actions">
                <wm-button
                    flair="action"
                    v-on:click="setSearch"
                    icon="search">{{$t('search')}}</wm-button>
            </menu>
        </div>

        <p v-show="loading"
            class="loading">{{$t('loading')}}</p>

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
    import AppHeader from './app-header.vue';
    import LanguageSelector from './language-selector.vue';
    import ResultsGrid from './results-grid.vue';
    import SearchExamples from './search-examples.vue';
    import SearchKeyword from './search-keyword.vue';
    import { parseHash, searchCommons } from '../api.js';
    import locales from '../locales.json';
    import { getLocale } from '../util.js';

    export default {
        components : {
            AppHeader, LanguageSelector, ResultsGrid, SearchExamples, SearchKeyword
        },

        computed : {
            debug() {
                return window.location.search.includes('debug');
            },

            queryString() {
                return this.keywords.map(k => k.keyword).join(' ');
            }
        },

        data() {
            return {
                keywords : [],

                languages : locales.languages,

                locale : getLocale(),

                loading : false,

                offset : 0,

                refIndex : 0,

                results : null,

                transateLink : {
                    link : 'https://tools.wmflabs.org/tooltranslate/#tool=48',
                    label : this.$t('translate_this_tool')
                }
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
        },

        watch : {
            locale() {
                this.$i18n.locale = this.locale;
            }
        }
    }
</script>