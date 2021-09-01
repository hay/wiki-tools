<template>
    <div class="screen__message">
        <p>
            <slot></slot>
        </p>

        <button v-if="showReloadButton"
                class="button button--action button--center"
                v-on:click="reset">
            {{$t('reload_app')}}
        </button>
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