<template>
    <div class="category-entry">
        <button v-on:click="test">hoi</button>
        <vue-simple-suggest
            ref="input"
            v-model="category"
            display-attribute="cleanLabel"
            value-attribute="label"
            v-on:show-list="$emit('expand')"
            v-on:hide-list="$emit('contract')"
            v-on:select="input"
            v-bind:styles="styles"
            v-bind:max-suggestions="5"
            v-bind:destyled="true"
            v-bind:list="getSuggestions"></vue-simple-suggest>
    </div>
</template>

<script>
    import VueSimpleSuggest from 'vue-simple-suggest/dist/es7'
    import { commonsSuggest } from '../api.js';

    export default {
        components : { VueSimpleSuggest },

        data() {
            return {
                category : this.value.split(':')[1],

                styles : {
                    vueSimpleSuggest: "category-entry__input",
                    inputWrapper: "",
                    defaultInput : "category-entry__search",
                    suggestions: "category-entry__suggestions",
                    suggestItem: "category-entry__suggestion"
                }
            }
        },

        methods : {
            async getSuggestions(query) {
                const results = await commonsSuggest(`Category:${query}`);

                const suggestions = results.results.map((r) => {
                    r.cleanLabel = r.label.replace('Category:', '');
                    return r;
                });

                return suggestions;
            },

            input() {
                // this.$refs.input.blur();
                this.$emit('input', 'deepcat:' + this.category);
            },

            test() {
                this.$refs.input.showList();
            }
        },

        props : {
            value : {
                type : String
            }
        }
    }
</script>