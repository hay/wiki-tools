<template>
    <div class="screen">
        <p class="screen__lead">When you press 'start' you are assigned a random person born in
        {{birthYear}}. Answer if the image is depicting that person.</p>

        <button
            class="button button--start"
            v-bind:disabled="loading"
            v-on:click="start">{{startLabel}}</button>
    </div>
</template>

<script>
    export default {
        computed : {
            birthYear() {
                return this.$store.state.birthYear;
            },

            loading() {
                return this.$store.state.loading;
            },

            startLabel() {
                return this.loading ? 'Loading...' : 'Start';
            }
        },

        methods : {
            start() {
                this.$store.dispatch('start');
            }
        }
    }
</script>