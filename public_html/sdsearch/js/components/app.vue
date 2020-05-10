<template>
    <div class="app__content">
        <div class="search">
            <div class="search__keywords">
                <search-keyword
                    v-for="(keyword, index) in keywords"
                    v-bind:key="index"
                    v-on:remove="removeItem(index)"
                    v-model="keywords[index]"></search-keyword>

                <button
                    class="search__add-keyword"
                    v-on:click="addKeyword">
                    <span class="icon" data-icon="add"></span>
                </button>
            </div>

            <pre style="font-size:20px;">{{queryString}}</pre>

            <menu class="search__actions">
                <button class="search__button"
                        v-on:click="search">
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
                keywords : ['haswbstatement:P180=Q146', 'kitten'],

                loading : false,

                results : []
            }
        },

        methods : {
            addKeyword() {
                this.keywords.push('');
            },

            removeItem(indexToRemove) {
                this.keywords = this.keywords.filter((keyword, index) => {
                    return index !== indexToRemove;
                });
            },

            async search() {
                this.loading = true;
                this.results = [];
                this.results = await query.search(this.queryString);
                this.loading = false;
            }
        }
    }
</script>