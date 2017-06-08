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

            wdapi.search(this.type, this.input).then(function(data) {
                this.suggestions = data.search.map(function(d) {
                    return {
                        id : d.id,
                        label : d.label
                    };
                });
            }.bind(this));
        },

        setSuggestion : function(suggestion) {
            this.input = suggestion.id;
            this.suggestions = [];
        }
    },

    props : {
        value : String,
        minlength : Number,
        type : String
    }
});