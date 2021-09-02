<template>
    <div class="screen__message">
        <slot></slot>

        <wm-button
            v-if="showReloadButton"
            flair="primary"
            v-on:click="reset">{{$t('reload_app')}}</wm-button>
    </div>
</template>

<script>
    export default {
        methods : {
            reset() {
                this.$store.dispatch('reset');
            }
        },

        props : {
            showReloadButton : {
                type : Boolean,
                default : false
            }
        }
    }
</script>