import Vue from "vue";
import { search } from "./api";

export default Vue.component('typeahead', {
    template : "#tmpl-typeahead",

    data : function() {
        return {
            suggestions : []
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