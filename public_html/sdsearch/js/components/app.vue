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
            <!--

            <div class="search__claim"
                 v-for="(claim, claimIndex) in query">
                <div class="search__prop">
                    <entity-entry
                        classPrefix="search__prop-"
                        type="property"
                        v-model="claim.prop"></entity-entry>
                </div>

                <div class="search__items">
                    <template v-for="(item, itemIndex) in claim.items">
                        <div class="search__item">
                            <entity-entry
                                classPrefix="search__item-"
                                type="item"
                                v-bind:key="itemIndex"
                                v-model="claim.items[itemIndex]"></entity-entry>

                            <button class="search__del-item"
                                    @click="removeItem(claimIndex, itemIndex)">
                                <span>˗</span>
                            </button>
                        </div>
                    </template>

                    <div class="search__add-item"
                         @click="addItem(claimIndex)">
                        <span>+</span>
                    </div>
                </div>
            </div>

            -->

            <menu class="search__actions">
                <button class="search__button"
                        @click="search">
                    <span class="search__icon">🔍</span>
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
                const query = new Query(this.query);
                this.results = await query.search();
                this.loading = false;
            }
        }
    }
</script>