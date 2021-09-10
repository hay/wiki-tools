<template>
    <div class="screen">
        <wm-button
            type="anchor"
            v-bind:href="rootUrl"
            flair="bare"
            icon="arrow-left">
            {{$t('app_title')}}
        </wm-button>

        <h1 class="app-title">
            {{challenge.title}}
        </h1>

        <p class="app-lead">
            {{challenge.short_description}}
        </p>

        <wm-button
            v-on:click="start"
            flair="primary">{{$t("start")}}</wm-button>

        <el-leaderboard></el-leaderboard>
    </div>
</template>

<script>
    import ElLeaderboard from './el-leaderboard.vue';

    export default {
        components : { ElLeaderboard },

        computed : {
            challenge() {
                return this.$store.state.challenge;
            },

            rootUrl() {
                return this.$store.state.rootUrl;
            }
        },

        data() {
            return {
            };
        },

        methods : {
            async start() {
                this.$store.commit('hash', this.opts);
            }
        }
    }
</script>