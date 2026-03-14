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
                              v-if="(challenge.edits ?? 0) > 0">
                            {{ $t('editcount', { count : challenge.edits ?? 0 }) }}
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
            flair="default,bare"
            v-on:click="showAll = true">
            {{ $t('show_all_challenges', { count : challenges.length }) }}</wm-button>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { MAX_CHALLENGE_OVERVIEW_COUNT } from '../const';
import { useDepictorStore } from '../store';

const { t: $t } = useI18n();

interface Challenge {
    id: string;
    title?: string;
    short_description?: string;
    edits?: number;
    link?: string;
}

const store = useDepictorStore();

const challenges = ref<Challenge[]>([]);
const maxItems = MAX_CHALLENGE_OVERVIEW_COUNT;
const showAll = ref(false);

onMounted(async () => {
    const data = await store.api.getChallenges();
    challenges.value = data.map((challenge: Challenge) => ({
        ...challenge,
        link: `${store.rootUrl}/?challenge=${challenge.id}`,
    }));
});
</script>