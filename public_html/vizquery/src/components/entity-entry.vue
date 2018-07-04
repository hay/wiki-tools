<template>
    <div class="entity-entry">
        <p class="entity-entry__label"
           v-bind:has-value="!!value"
           v-on:click="goSearch"
           v-show="!searching">

            <template v-if="value">
                {{entity.label}}
                <sup v-if="entity.id">{{entity.id}}</sup>
            </template>

            <template v-if="!value">
                click to set {{type}}
            </template>
        </p>

        <div class="input-group" v-show="searching">
            <input class="entity-entry__search form-control"
                   type="search"
                   v-on:keyup.esc="searching = false"
                   v-on:keyup.enter="setString"
                   v-bind:placeholder="type"
                   v-model="search" />

            <div class="input-group-btn">
                <button class="btn btn-default"
                        v-on:click="searching = false">&times;</button>
            </div>
        </div>


        <ul class="entity-entry__suggestions" v-show="loading">
            <li>Loading...</li>
        </ul>

        <ul class="entity-entry__suggestions" v-show="suggestions.length && searching">
            <li v-for="suggestion in suggestions"
                v-on:click="setSuggestion(suggestion)">
                {{suggestion.id}} - {{suggestion.label}}<br>
                <small>{{suggestion.description}}</small>
            </li>
        </ul>
    </div>
</template>

<script>
import { search, searchAndGet } from "../api";
import {
    MIN_INPUT_LENGTH,
    LANGUAGE,
    WIKIDATA_PROPERTY,
    WIKIDATA_ITEM,
    ENTITIY_REGEX,
    ENTITY_URI,
    VARIABLE_REGEX,
    STRING_REGEX
} from "../conf";
import Vue from "vue";

export default {
    data() {
        return {
            suggestions : [],
            loading : false,
            search : null,
            entity : {},
            searching : false
        };
    },

    created() {
        if (this.value && !this.isEntity(this.value)) {
            this.entity = {
                label : this.value
            };
        } else if (this.value) {
            searchAndGet(this.type, this.value).then((item) => this.entity = item);
        }
    },

    mounted() {
        if (this.focused) {
            this.goSearch();
        }
    },

    methods : {
        goSearch : function() {
            this.searching = true;

            Vue.nextTick(() => {
                this.$el.querySelector('input').focus();

                if (this.isEntity(this.value)) {
                    this.setSearch(this.entity.label);
                } else {
                    this.search = this.value;
                }
            });
        },

        isEntity : function(val) {
            return val && (ENTITIY_REGEX.test(val) || val.indexOf(ENTITY_URI) === 0);
        },

        resetSearch : function() {
            this.suggestions = [];
            this.searching = false;
            this.search = null;
        },

        setString: function() {
            // Check if this is a valid string
            if (
                VARIABLE_REGEX.test(this.search) ||
                STRING_REGEX.test(this.search)
            ) {
                this.$emit('input', this.search);
                this.entity = { label : this.search };
                this.resetSearch();
            }
        },

        setSearch : function(q) {
            if (!q || q.length < this.minlength) {
                return;
            }

            this.loading = true;

            search(this.type, q).then((results) => {
                this.loading = false;
                this.suggestions = results;
            });
        },

        setSuggestion : function(suggestion) {
            this.entity = suggestion;
            this.$emit('input', suggestion.concepturi);
            this.resetSearch();
        }
    },

    watch : {
        search(q) {
            this.setSearch(q);
        }
    },

    props : {
        focused : {
            type : Boolean,
            default : false
        },

        minlength : Number,

        type : {
            validator : (type) => ['item', 'property'].includes(type)
        },

        value : {
            validator : (val) => typeof val === 'string' || val === null
        }
    }
};
</script>

<style scoped>
.entity-entry {
    max-width: 250px;
}

.entity-entry .input-group {
    position: relative;
    top: 11px; /* fix later */
}

.entity-entry__label {
    cursor: pointer;
    border-bottom: 1px solid #337ab7;
    color: #337ab7;
}

.entity-entry__label[has-value] {
    color: black;
}

.entity-entry__label sup {
    color: #666;
}

.entity-entry__suggestions {
    border: 1px solid #eee;
    padding: 0;
    position: relative;
    top: 10px;
}

.entity-entry__suggestions li {
    padding: 5px 10px;
    list-style: none;
    cursor: pointer;
}

.entity-entry__suggestions li:nth-child(odd) {
    background: #eee;
}

.entity-entry__suggestions li:hover {
    background: #337ab7;
    color: white;
}
</style>