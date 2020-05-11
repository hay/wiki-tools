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

        <div class="results"
             v-if="results">
            <menu class="results__stats">
                <p>Found <strong>{{results.count}}</strong> items</p>
            </menu>

            <ul class="results__grid">
                <li v-for="result in results.items"
                    class="results__item">
                    <a v-bind:href="result.url"
                       class="results__link">
                        <img v-bind:src="result.thumb"
                             v-bind:alt="result.snippet"
                             class="results__image" />
                    </a>
                </li>
            </ul>

            <menu class="results__nav"
                  v-if="results.count > results.limit">
                <wm-button
                    v-bind:hidden="!(offset > 0)"
                    type="anchor"
                    icon="arrow-left"
                    v-bind:href="navLink(-1)">Previous page</wm-button>

                <wm-button
                    v-bind:hidden="!results.hasNext"
                    type="anchor"
                    icon="arrow-right"
                    v-bind:href="navLink(1)">Next page</wm-button>
            </menu>
        </div>
    </div>
</template>

<script>
    import SearchKeyword from './search-keyword.vue';
    import Query from '../query.js';
    const query = new Query();

    export default {
        components : { SearchKeyword },

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

                results : false
            }
        },

        methods : {
            addKeyword(keyword) {
                this.keywords.push(keyword);
            },

            navLink(delta) {
                const offset = this.offset + (this.results.limit * delta);
                return `#offset=${offset}&q=${this.queryString}`;
            },

            parseHash() {
                const parts = window.location.hash.slice(1).split('&');

                for (const part of parts) {
                    if (part.startsWith('q=')) {
                        const q = part.slice(2);
                        this.keywords = window.decodeURIComponent(q).split(' ');
                    }

                    if (part.startsWith('offset=')) {
                        this.offset = Number(part.replace('offset=', ''));
                    }
                }

                if (!this.keywords.length) {
                    // Default keywords, don't search
                    this.keywords = ['haswbstatement:P180=null'];
                    return;
                }

                this.search();
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
                this.results = await query.search(this.queryString, this.offset);
                this.loading = false;
            },

            setSearch() {
                window.location.hash = '#q=' + this.queryString;
            }
        },

        mounted() {
            window.addEventListener('hashchange', this.parseHash.bind(this));
            this.parseHash();
        }
    }
</script>