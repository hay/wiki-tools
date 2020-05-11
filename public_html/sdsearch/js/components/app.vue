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

<!--             <menu class="results__nav">
                <a class="results__nav"
                   v-bind:href="results.prevLink">
                    <span
                        class="icon"
                        data-icon="arrow-left"></span>

                    <span></span>
            </menu> -->
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

                results : false
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
                this.results = false;
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