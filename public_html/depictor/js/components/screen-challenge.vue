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
            {{$t('challenge_lead_intro')}}

            <blockquote class="screen__quote">
                {{challenge.short_description}}
            </blockquote>
        </p>

        <wm-button
            v-bind:href="startLink"
            type="anchor"
            flair="primary">{{$t("start")}}</wm-button>

        <wm-button
            v-if="isEditable"
            flair="bare"
            icon="edit"
            v-on:click="editChallenge">{{$t('edit_challenge')}}</wm-button>

        <p v-if="challenge.long_description"
           class="screen__subtitle">
            {{challenge.long_description}}
        </p>

        <p class="screen__subtitle"
           v-html="userLink"></p>

        <p class="screen__subtitle buffer-bottom-2">
            <em>
                <a href="https://commons.wikimedia.org/wiki/Commons:Depictor#Challenges">How do i create my own challenge?</a>
            </em>
        </p>

        <el-leaderboard
            v-bind:challenge="challenge.id"></el-leaderboard>
    </div>
</template>

<script>
    import { COMMONS_USER_PREFIX } from '../const.js';
    import ElLeaderboard from './el-leaderboard.vue';

    export default {
        components : { ElLeaderboard },

        computed : {
            challenge() {
                return this.$store.state.challenge;
            },

            isEditable() {
                return this.$store.getters.isEditableChallenge;
            },

            rootUrl() {
                return this.$store.state.rootUrl;
            },

            startLink() {
                const root = this.$store.state.rootUrl;
                return `${root}/?challenge=${this.challenge.id}&action=start`;
            },

            userLink() {
                return this.$t('challenge_userlink', {
                    link : `${COMMONS_USER_PREFIX}${this.challenge.user}`,
                    user : this.challenge.user
                });
            }
        },

        methods : {
            editChallenge() {
                this.$store.commit('screen', 'edit-challenge');
            }
        }
    }
</script>