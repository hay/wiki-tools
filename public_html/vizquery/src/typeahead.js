import Vue from "vue";
import { search } from "./api";
import { MIN_INPUT_LENGTH } from "./conf";

export default Vue.component('typeahead', {
    template : "#tmpl-typeahead",

    data : function() {
        return {
            suggestions : [],
        }
    },

    computed : {
        style : function() {
            var len = this.value ? (this.value.length + 1) : MIN_INPUT_LENGTH;
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

            search(this.type, value).then((d) => this.suggestions = d.search);
        },

        setSuggestion : function(suggestion) {
            this.suggestions = [];
            this.$emit('input', suggestion.id);
        }
    },

    props : {
        value : String,
        minlength : Number,
        type : String
    }
});