<template>
    <div class="language-selector">
        <span class="icon" data-icon="locale"></span>

        <select
            v-on:change="change($event.target.value)"
            class="language-selector__select">
            <option
                v-if="link"
                value="external-link">
                {{link.label}}
            </option>

            <option
                v-for="l in languages"
                v-bind:selected="l.code === lang"
                v-bind:value="l.code">
                {{l.label}}
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
                if (lang === 'external-link') {
                    window.location = this.link.link;
                } else {
                    this.$emit('input', lang);
                }
            }
        },

        props : {
            languages : {
                type : Array,
                required : true
            },

            link : {
                type : Object,
                required : false
            },

            value : {
                type : String,
                required : true
            }
        }
    }
</script>