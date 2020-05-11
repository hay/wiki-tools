<template>
    <div class="app__content">
        <div class="search">
            <menu class="search__actions">
                <button
                    class="search__add-keyword"
                    v-on:click="addKeyword('haswbstatement:P180=null')">
                    <span class="icon" data-icon="image"></span>
                    <span>Add depicts</span>
                </button>

                <button
                    class="search__add-keyword"
                    v-on:click="addKeyword('haswbstatement')">
                    <span class="icon" data-icon="tag"></span>
                    <span>Add claim</span>
                </button>

                <button
                    class="search__add-keyword"
                    v-on:click="addKeyword('')">
                    <span class="icon" data-icon="text"></span>
                    <span>Add text</span>
                </button>
            </menu>

            <div class="search__keywords">
                <search-keyword
                    v-for="(keyword, index) in keywords"
                    v-bind:key="index"
                    v-on:remove="removeItem(index)"
                    v-model="keywords[index]"></search-keyword>
            </div>

            <menu class="search__actions">
                <button class="search__button"
                        v-on:click="setSearch">
                    <span
                        class="icon"
                        data-icon="search"></span>

                    <span>Search</span>
                </button>
            </menu>
        </div>

        <p v-show="loading"
            class="loading">Loading...</p>

        <ul v-if="results.length"
            class="results">
            <li v-for="result in results"
                class="results__item">
                <a v-bind:href="result.url"
                   class="results__link">
                    <img v-bind:src="result.thumb"
                         v-bind:alt="result.snippet"
                         class="results__image" />
                </a>
            </li>
        </ul>
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

                results : []
            }
        },

        methods : {
            addKeyword(keyword) {
                this.keywords.push(keyword);
            },

            parseHash() {
                const parts = String(window.location).match(/#q=(.+)/);

                if (parts) {
                    this.keywords = window.decodeURIComponent(parts[1]).split(' ');
                } else {
                    // Default keywords
                    this.keywords = ['haswbstatement:P180=null'];
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
                this.results = [];
                this.results = await query.search(this.queryString);
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