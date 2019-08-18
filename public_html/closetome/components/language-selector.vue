<template>
<div class="language-selector">
    <vue-simple-suggest
        v-model="language"
        :list="languages"
        :filter-by-query="true" />
</div>
</template>

<script>
import languages from 'iso-639-1/src/data.js';
import 'vue-simple-suggest/dist/styles.css'

console.log(languages);

export default {
    data : {
        language : null
    },

    methods : {
        input(e) {
            console.log(e.target.value);
            this.$emit('input', e.target.value);
        },

        languages() {
            return [1,2,3];
        }
    },

    props : {
        value : {
            type : String
        }
    }
}
</script>