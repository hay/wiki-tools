<template>
    <div class="challenges">
        <h2 class="screen__title">
            {{$t('challenge_overview')}}
        </h2>

        <p class="screen__subtitle">
            {{$t('challenge_subtitle')}}
        </p>

        <p class="screen__subtitle buffer-bottom-2">
            <em>
                <a href="https://commons.wikimedia.org/wiki/Commons:Depictor#Challenges">How do i create my own challenge?</a>
            </em>
        </p>

        <ul class="challenges__list">
            <li v-for="(challenge, index) in challenges"
                v-show="index < maxItems || showAll">
                <a v-bind:href="challenge.link"
                   class="challenges__item">
                    <h3 class="challenges__title">
                        <span>{{challenge.title}}</span>

                        <span class="challenges__itemcount"
                              v-if="challenge.edits > 0">
                            {{ $t('editcount', { count : challenge.edits }) }}
                        </span>
                    </h3>

                    <p class="challenges__description">
                        {{challenge.short_description}}
                    </p>
                </a>
            </li>
        </ul>

        <wm-button
            v-show="!showAll && challenges.length > maxItems"
            class="leaderboard__button"
            icon="eye"
            flair="bare"
            v-on:click="showAll = true">
            {{$t('show_all_challenges', { count : challenges.length })}}</wm-button>
    </div>
</template>

<script>
    import { MAX_CHALLENGE_OVERVIEW_COUNT } from '../const.js';

    export default {
        data() {
            return {
                challenges : [],
                maxItems : MAX_CHALLENGE_OVERVIEW_COUNT,
                showAll : false
            }
        },

        async mounted() {
            const state = this.$store.state;
            const challenges = await state.api.getChallenges();

            this.challenges = challenges.map((challenge) => {
                challenge.link = `${state.rootUrl}/?challenge=${challenge.id}`;
                return challenge;
            });
        }
    }
</script>