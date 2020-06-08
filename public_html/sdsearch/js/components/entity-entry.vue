<template>
    <div :class="cls('wrapper')"
         :data-entity-type="type">
        <p :class="cls('label')"
           v-bind:has-value="!!value"
           v-on:click="goSearch"
           v-show="!searching">

            <template v-if="value">
                {{entity.label}}
                <sup v-if="entity.id"
                     :class="cls('label-id')">{{entity.id}}</sup>
            </template>

            <template v-if="!value">
                click to set {{type}}
            </template>
        </p>

        <div :class="cls('input')" v-show="searching">
            <input :class="cls('search')"
                   ref="search"
                   type="text"
                   v-on:keyup.esc="searching = false"
                   v-bind:placeholder="type"
                   v-model="search" />

            <button :class="cls('button')"
                    v-on:click="searching = false">&times;</button>
        </div>

        <ul :class="cls('suggestions')" v-show="loading">
            <li>Loading...</li>
        </ul>

        <ul :class="cls('suggestions')"
            v-show="suggestions.length && searching">
            <li v-for="suggestion in suggestions"
                v-on:click="setSuggestion(suggestion)">
                {{suggestion.id}} - {{suggestion.label}}<br>
                <small>{{suggestion.description}}</small>
            </li>
        </ul>
    </div>
</template>

<script>
import Vue from "vue";
import WikidataApi from '../mwapi/wikidata.js';

const TYPES = ['form','item','lexeme','property','sense'];

export default {
    computed : {
        api() {
            return new WikidataApi(this.lang);
        }
    },

    async created() {
        // If we have a value already, get that from the api
        if (this.value) {
            this.entity = await this.api.get(this.type, this.value);
            this.$emit('input', this.entity);
        }
    },

    data() {
        return {
            entity : {},
            loading : false,
            search : null,
            searching : false,
            suggestions : []
        };
    },

    methods : {
        cls(name) {
            return this.classPrefix + name;
        },

        async goSearch() {
            this.searching = true;

            await Vue.nextTick();
            this.$refs.search.focus();

            if (this.entity && this.entity.concepturi) {
                this.setSearch(this.entity.concepturi);
            }
        },

        resetSearch() {
            this.suggestions = [];
            this.searching = false;
            this.search = null;
        },

        async setSearch(q) {
            if (!q || q.length < this.minlength) {
                return;
            }

            this.loading = true;
            this.suggestions = await this.api.search(this.type, q);
            this.loading = false;
        },

        setSuggestion(suggestion) {
            this.entity = suggestion;
            this.$emit('input', suggestion);
            this.resetSearch();
        }
    },

    mounted() {
        if (this.focused) {
            this.goSearch();
        }
    },

    props : {
        'class-prefix' : {
            type : String,
            default : ''
        },

        focused : {
            type : Boolean,
            default : false
        },

        lang : {
            default : 'en',
            type : String
        },

        minlength : Number,

        type : {
            default : 'item',
            validator : (type) => TYPES.includes(type)
        },

        value : {
            // Value can be either a string (in which case it's going into search),
            // or a complete object
        }
    },

    watch : {
        search(q) {
            this.setSearch(q);
        },

        searching(searching) {
            if (searching) {
                this.$emit('start-searching');
            } else {
                this.$emit('stop-searching');
            }
        }
    }
};
</script>