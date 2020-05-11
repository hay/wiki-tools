<template>
    <button
        class="wm-button"
        v-bind:class="classes"
        v-on:click="click">
        <span
            v-if="icon"
            class="wm-button__icon icon"
            v-bind:data-icon="icon"></span>

        <span class="wm-button__content">
            <slot></slot>
        </span>
    </button>
</template>

<script>
    export default {
        computed : {
            classes() {
                return this.flair ? 'wm-button--flair' : '';
            }
        },

        methods : {
            click() {
                this.$emit('click');
            }
        },

        props : {
            flair : {
                type : String,
                required : false
            },

            icon : {
                type : String,
                required : false
            }
        }
    }
</script>