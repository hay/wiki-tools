Vue.component('typeahead', {
    template : "#tmpl-typeahead",

    data : function() {
        return {
            suggestions : [],
            input : this.value
        }
    },

    methods : {
        keydown : function() {
            if (this.input.length < this.minlength) {
                return;
            }

            this.source.query(this.input).then(function(data) {
                this.suggestions = data;
            }.bind(this));
        },

        setSuggestion : function(suggestion) {
            this.input = suggestion.id;
            this.suggestions = [];
        }
    },

    props : {
        value : String,
        source : Object,
        minlength : Number
    }
});