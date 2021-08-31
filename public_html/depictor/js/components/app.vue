<template>
    <div class="screen__wrapper">
        <el-header></el-header>

        <screen-intro v-if="screen === 'intro' && !isLoading"></screen-intro>
        <screen-game v-if="screen === 'game' && !isLoading"></screen-game>

        <div v-if="screen === 'message'"
             class="screen__message">
            <p>{{ message }}</p>

            <button v-if="errorMessage"
                    class="button button--action button--center"
                    v-on:click="reset">
                Reload app
            </button>
        </div>
    </div>
</template>

<script>
    import ElHeader from './el-header.vue';
    import ScreenGame from './screen-game.vue';
    import ScreenIntro from './screen-intro.vue';

    export default {
        components : { ElHeader, ScreenIntro, ScreenGame },

        computed : {
            errorMessage() {
                return this.$store.state.errorMessage;
            },

            isLoading() {
                return this.$store.state.loading;
            },

            message() {
                return this.errorMessage ? this.errorMessage : 'Loading...';
            },

            screen() {
                if (!this.isLoading && !this.errorMessage) {
                    return this.$store.state.screen;
                } else {
                    return 'message';
                }
            }
        },

        methods : {
            reset() {
                this.$store.dispatch('reset');
            }
        }
    }
</script>
