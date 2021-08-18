<template>
    <div class="screen">
        <p class="screen__lead">
            When you press 'start' you are assigned random people born in {{birthYear}}.
            Check if your person is depicted in the given image.
        </p>

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
            async start() {
                try {
                    await this.$store.dispatch('start');
                } catch (e) {
                    // TODO: handle this more elegantly and show
                    // a message to the user
                    console.error(e);
                }
            }
        }
    }
</script>