<template>
    <div class="search-keyword"
         v-bind:expanded="expanded > 0">
        <button class="search-keyword__button">
            <span class="icon"
                  v-bind:data-icon="keyword.icon"></span>
        </button>

        <div class="search-keyword__value"
             v-if="keyword.type === 'text'">
            <input type="text"
                   class="search-keyword__input"
                   v-on:input="input($event)"
                   v-bind:value="keyword.value" />
        </div>

        <template v-if="keyword.type === 'wbstatement'">
            <div class="search-keyword__value">
                <entity-entry
                    class="entity"
                    classPrefix="entity__"
                    type="property"
                    v-on:start-searching="expand(true)"
                    v-on:stop-searching="expand(false)"
                    v-model="keyword.prop"></entity-entry>
            </div>

            <div class="search-keyword__value">
                <entity-entry
                    class="entity"
                    classPrefix="entity__"
                    type="item"
                    v-on:start-searching="expand(true)"
                    v-on:stop-searching="expand(false)"
                    v-model="keyword.value"></entity-entry>
            </div>
        </template>

        <button class="search-keyword__button"
                v-on:click="remove">
            <span class="icon"
                  data-icon="remove"></span>
        </button>
    </div>
</template>

<script>
    import { EntityEntry } from 'wikidata-ux';

    function parseKeyword(keyword) {
        keyword = keyword.trim();

        if (keyword.startsWith('haswbstatement')) {
            const [ query, prop, value ] = keyword.match(/haswbstatement:(.+)=(.+)/);

            return {
                icon : 'tag',
                type : 'wbstatement',
                prop, value
            };
        } else {
            return {
                icon : 'text',
                type : 'text',
                value : keyword
            };
        }
    }

    export default {
        components : { EntityEntry },

        computed : {
            keyword() {
                return parseKeyword(this.value);
            }
        },

        data() {
            return {
                expanded : 0
            }
        },

        methods : {
            expand(expand) {
                this.expanded += expand ? 1 : -1;
            },

            input(e) {
                if (this.keyword.type === 'text') {
                    this.$emit('input', e.target.value);
                }
            },

            remove() {
                this.$emit('remove');
            }
        },

        props : {
            value : {
                type : String
            }
        }
    }
</script>