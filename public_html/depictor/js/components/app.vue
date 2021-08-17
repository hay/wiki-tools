<template>
    <div class="screen__wrapper">
        <screen-intro v-if="screen === 'intro'"></screen-intro>
        <screen-game v-if="screen === 'game'"></screen-game>
    </div>
</template>

<script>
    import ScreenGame from './screen-game.vue';
    import ScreenIntro from './screen-intro.vue';

    export default {
        components : { ScreenIntro, ScreenGame },

        computed : {
            screen() {
                return this.$store.state.screen;
            }
        }
    }
</script>
