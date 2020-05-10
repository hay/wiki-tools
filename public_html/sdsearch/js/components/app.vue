<template>
    <div class="app">
        <div class="search">
            <div class="search__claim"
                 v-for="claim in query">
                <div class="search__prop">
                    <entity-entry
                        classPrefix="search__prop-"
                        type="property"
                        v-model="claim.prop"></entity-entry>
                </div>

                <div class="search__items">
                    <template v-for="(item, index) in claim.items">
                        <entity-entry
                            class="search__item"
                            classPrefix="search__item-"
                            type="item"
                            v-bind:key="index"
                            v-model="claim.items[index]"></entity-entry>
                    </template>
                </div>
            </div>

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
    import { EntityEntry } from 'wikidata-ux';
    import Query from '../query.js';

    export default {
        components : { EntityEntry },

        data() {
            return {
                query : [
                    {
                        prop : 'P180',
                        items : ['Q146']
                    }
                ],

                results : []
            }
        },

        methods : {
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