<template>
    <div class="language-selector">
        <span class="icon" data-icon="locale"></span>

        <select
            v-show="!showCustomLanguage"
            v-on:change="change($event.target.value)"
            class="language-selector__select">
            <option
                v-if="link"
                value="external-link">
                {{link.label}}
            </option>

            <option value="custom-language">
                Custom language
            </option>

            <option
                v-for="l in languages"
                v-bind:selected="l.code === lang"
                v-bind:value="l.code">
                {{l.label}}
            </option>
        </select>

        <input
            v-show="showCustomLanguage"
            class="language-selector__input"
            v-on:change="change(customLanguage)"
            maxlength="12"
            placeholder="ISO code"
            v-model="customLanguage" />

        <button
            class="language-selector__close"
            aria-label="Set language"
            v-show="showCustomLanguage"
            v-on:click="showCustomLanguage = false">
            <span class="icon" data-icon="cross"></span>
        </button>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                customLanguage : '',
                lang : this.value,
                showCustomLanguage : false
            }
        },

        methods : {
            change(lang) {
                if (lang === 'custom-language') {
                    this.showCustomLanguage = true;
                } else if (lang === 'external-link') {
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