<template>
    <div class="language-selector">
        <span class="icon"
              v-on:click="clickSelect"
              data-icon="locale"></span>

        <span class="language-selector__link"
              v-show="!isShowSelect"
              v-on:click="clickSelect">
            {{$t('language')}}
        </span>

        <select
            v-show="isShowSelect"
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

        <span class="icon language-selector__close"
              v-show="isShowSelect"
              v-on:click="blurSelect"
              data-icon="close"></span>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                isShowSelect : false,
                lang : this.value,
                showCustomLanguage : false,
            }
        },

        methods : {
            blurSelect() {
                this.$emit('blur-select');
            },

            change(lang) {
                if (lang === 'external-link') {
                    window.location = this.link.link;
                } else {
                    this.$emit('input', lang);
                }

                this.isShowSelect = false;
            },

            clickSelect() {
                this.$emit('click-select');
            },

            hideSelect() {
                this.isShowSelect = false;
            },

            showSelect() {
                this.isShowSelect = true;
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