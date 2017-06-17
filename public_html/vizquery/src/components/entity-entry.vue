<template>
    <div class="entity-entry">
        <p class="entity-entry__label"
           v-bind:has-value="!!value"
           v-on:click="goSearch"
           v-show="!searching">

            <template v-if="value">
                {{label}}
                <sup>{{value}}</sup>
            </template>

            <template v-if="!value">
                click to set {{type}}
            </template>
        </p>

        <div class="input-group" v-show="searching">
            <input class="entity-entry__search form-control"
                   type="search"
                   v-on:keyup.esc="searching = false"
                   v-bind:placeholder="type"
                   v-model="search" />

            <span class="input-group-btn">
                <button class="btn btn-default"
                        v-on:click="searching = false">&times;</button>
            </span>
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
import { MIN_INPUT_LENGTH, LANGUAGE } from "../conf";
import Vue from "vue";

export default {
    data : function() {
        return {
            suggestions : [],
            loading : false,
            search : null,
            label : null,
            searching : false
        };
    },

    created : function() {
        if (this.value) {
            searchAndGet(this.type, this.value).then((item) => {
                this.label = item.label;
            })
        }
    },

    methods : {
        goSearch : function() {
            this.searching = true;

            Vue.nextTick(() => {
                this.$el.querySelector('input').focus();
                this.setSearch(this.search);
            });
        },

        setSearch : function(q) {
            if (!q || q.length < this.minlength) {
                return;
            }

            this.loading = true;

            search(this.type, q).then((d) => {
                this.loading = false;
                this.suggestions = d.search;
            });
        },

        setSuggestion : function(suggestion) {
            this.suggestions = [];
            this.label = suggestion.label;
            this.$emit('input', suggestion.id);
            this.searching = false;
        }
    },

    watch : {
        search : function(q) {
            this.setSearch(q);
        }
    },

    props : {
        type : String,
        minlength : Number,
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