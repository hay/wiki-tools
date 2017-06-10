<template>
    <div class="item-entry">
        <p class="item-entry__label"
           v-bind:has-value="!!value.id"
           v-on:click="goSearch"
           v-show="!searching">
            <template v-if="value.id">
                {{value.label}}
                <sup>{{value.id}}</sup>
            </template>

            <template v-if="!value.id">
                click to set property
            </template>
        </p>

        <input class="item-entry__search"
               type="search"
               v-show="searching"
               v-bind:placeholder="type"
               v-model="search" />

        <ul class="item-entry__suggestions" v-show="loading">
            <li>Loading...</li>
        </ul>

        <ul class="item-entry__suggestions" v-show="suggestions.length">
            <li v-for="suggestion in suggestions"
                v-on:click="setSuggestion(suggestion)">
                {{suggestion.id}} - {{suggestion.label}}<br>
                <small>{{suggestion.description}}</small>
            </li>
        </ul>
    </div>
</template>

<script>
import { search, get } from "../api";
import { MIN_INPUT_LENGTH, LANGUAGE } from "../conf";
import Vue from "vue";

function parseItem(item) {
    item.label = item.labels[LANGUAGE].value;
    item.description = item.descriptions[LANGUAGE].value;
    return item;
}

function parseSearch(item) {
    item.formLabel = `${item.label} - (${item.id})`;
    return item;
}

export default {
    data : function() {
        return {
            suggestions : [],
            loading : false,
            search : null,
            searching : false
        };
    },

    /*
    created : function() {
        if (this.fromitemid) {
            get(this.fromitemid).then((item) => {
                this.item = parseItem(item.entities[this.fromitemid]);
                this.item = parseSearch(this.item);
                this.$emit('input', this.item.formLabel);
            });
        }
    },
    */

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
                this.suggestions = d.search.map(parseSearch);
            });
        },

        setSuggestion : function(suggestion) {
            this.suggestions = [];
            this.$emit('input', suggestion);
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
        value : Object
    }
};
</script>

<style scoped>
.item-entry__label {
    cursor: pointer;
    border-bottom: 1px solid #337ab7;
    color: #337ab7;
}

.item-entry__label[has-value] {
    color: black;
}

.item-entry__label sup {
    color: #666;
}

.item-entry__suggestions {
    border: 1px solid #eee;
    padding: 0;
}

.item-entry__suggestions li {
    padding: 5px 10px;
    list-style: none;
    cursor: pointer;
}

.item-entry__suggestions li:nth-child(odd) {
    background: #eee;
}

.item-entry__suggestions li:hover {
    background: #337ab7;
    color: white;
}
</style>