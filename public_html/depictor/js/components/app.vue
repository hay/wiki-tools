<template>
    <div class="screen__wrapper">
        <el-header></el-header>

        <screen-intro v-if="screen === 'intro'"></screen-intro>

        <screen-game v-if="screen === 'game'"></screen-game>

        <screen-challenge v-if="screen === 'challenge'"></screen-challenge>

        <screen-create-challenge v-if="screen === 'create-challenge'"></screen-create-challenge>

        <screen-message v-if="screen === 'loading'">
            <p class="screen__notice">{{$t('loading')}}</p>
        </screen-message>

        <screen-message
            v-if="screen === 'error'"
            v-bind:showReloadButton="true">
            <p class="screen__notice">{{errorMessage}}</p>

            <el-notice
                notice="common-errors"
                class="options__instruction"></el-notice>
        </screen-message>
    </div>
</template>

<script>
    import ElHeader from './el-header.vue';
    import ElNotice from './el-notice.vue';
    import ScreenChallenge from './screen-challenge.vue';
    import ScreenCreateChallenge from './screen-createchallenge.vue';
    import ScreenGame from './screen-game.vue';
    import ScreenIntro from './screen-intro.vue';
    import ScreenMessage from './screen-message.vue';

    export default {
        components : {
            ElHeader, ElNotice, ScreenChallenge, ScreenIntro,
            ScreenGame, ScreenMessage, ScreenCreateChallenge
        },

        computed : {
            errorMessage() {
                return this.$store.state.errorMessage;
            },

            screen() {
                return this.$store.getters.screenState;
            }
        }
    }
</script>
