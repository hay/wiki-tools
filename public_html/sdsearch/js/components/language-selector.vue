<template>
    <div class="language-selector">
        <span class="icon" data-icon="locale"></span>

        <select
            v-on:change="change($event.target.value)"
            class="language-selector__select">
            <option
                v-for="lang in languages"
                v-bind:selected="lang.code === lang"
                v-bind:value="lang.code">
                {{lang.label}}
            </option>
        </select>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                lang : this.value
            }
        },

        methods : {
            change(lang) {
                this.$emit('input', lang);
            }
        },

        props : {
            languages : {
                type : Array,
                required : true
            },

            value : {
                type : String,
                required : true
            }
        }
    }
</script>