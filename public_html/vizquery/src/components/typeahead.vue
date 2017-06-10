<template>
    <div class="typeahead">
        <!-- <datalist> is still not supported on Safari :( -->
        <input type="text"
               v-bind:value="value"
               v-bind:style="style"
               v-bind:placeholder="type"
               v-on:input="update($event.target.value)">

        <ul class="typeahead__suggestions" v-show="loading">
            <li>Loading...</li>
        </ul>

        <ul class="typeahead__suggestions" v-show="suggestions.length">
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
    template : "#tmpl-typeahead",

    data : function() {
        return {
            suggestions : [],
            loading : false,
            item : null
        };
    },

    created : function() {
        if (this.fromitemid) {
            get(this.fromitemid).then((item) => {
                this.item = parseItem(item.entities[this.fromitemid]);
                this.item = parseSearch(this.item);
                this.$emit('input', this.item.formLabel);
            });
        }
    },

    computed : {
        style : function() {
            var len = this.value ? this.value.length : MIN_INPUT_LENGTH;
            len = len > MIN_INPUT_LENGTH ? len : MIN_INPUT_LENGTH;
            return { width : `${len + 1}ch` };
        }
    },

    methods : {
        update : function(value) {
            this.$emit('input', value);

            if (value.length < this.minlength) {
                return;
            }

            this.loading = true;

            search(this.type, value).then((d) => {
                this.loading = false;
                this.suggestions = d.search.map(parseSearch);
            });
        },

        setSuggestion : function(suggestion) {
            this.suggestions = [];
            this.$emit('input', suggestion.formLabel);
            this.item = suggestion;
        }
    },

    watch : {
        item : function(item) {
            this.$emit('item', item);
        }
    },

    props : {
        value : String,
        minlength : Number,
        type : String,
        fromitemid : String
    }
};
</script>

<style scoped>
.typeahead input {
    padding: 0 5px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 15px;
    font-weight: bold;
    color: navy;
}

.typeahead__suggestions {
    border: 1px solid #eee;
    padding: 0;
}

.typeahead__suggestions li {
    padding: 5px 10px;
    list-style: none;
    cursor: pointer;
}

.typeahead__suggestions li:nth-child(odd) {
    background: #eee;
}

.typeahead__suggestions li:hover {
    background: #337ab7;
    color: white;
}
</style>