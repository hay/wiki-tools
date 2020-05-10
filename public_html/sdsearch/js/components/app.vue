<template>
    <div class="app__content">
        <div class="search">
            <div class="search__keywords">
                <search-keyword></search-keyword>
                <search-keyword></search-keyword>
                <search-keyword></search-keyword>
            </div>
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

        data() {
            return {
                loading : false,

                query : [
                    {
                        prop : 'P180',
                        items : ['']
                    }
                ],

                results : []
            }
        },

        methods : {
            addItem(claimIndex) {
                this.query[claimIndex].items.push('');
            },

            removeItem(claimIndex, itemIndex) {
                const itemToRemove = this.query[claimIndex].items[itemIndex];
                console.log(claimIndex, itemToRemove);

                this.query[claimIndex].items = this.query[claimIndex].items.filter((item) => {
                    console.log(item.label, itemToRemove.label, item === itemToRemove);
                    return item !== itemToRemove;
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