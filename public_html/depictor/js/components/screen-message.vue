<template>
    <div class="screen__message">
        <slot></slot>

        <wm-button
            v-if="showReloadButton"
            type="anchor"
            v-bind:href="homeLink"
            flair="primary">{{$t('reload_app')}}</wm-button>
    </div>
</template>

<script>
    export default {
        computed: {
            homeLink() {
                return this.$store.getters.homeLink;
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