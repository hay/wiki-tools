<template>
    <div class="screen">
        <wm-button
            type="anchor"
            v-bind:href="rootUrl"
            flair="default,bare"
            icon="arrow-left">
            {{ $t('app_title') }}
        </wm-button>

        <h1 class="app-title">
            {{ challenge?.title }}
        </h1>

        <p class="app-lead">
            {{ $t('challenge_lead_intro') }}

            <blockquote class="screen__quote">
                {{ challenge?.short_description }}
            </blockquote>
        </p>

        <wm-button
            v-bind:href="startLink"
            type="anchor"
            flair="default,primary">{{ $t('start') }}</wm-button>

        <wm-button
            v-if="isEditable"
            flair="default,bare"
            icon="edit"
            v-on:click="editChallenge">{{ $t('edit_challenge') }}</wm-button>

        <p v-if="challenge?.long_description"
           class="screen__subtitle">
            {{ challenge.long_description }}
        </p>

        <p class="screen__subtitle"
           v-html="userLink"></p>

        <p class="screen__subtitle buffer-bottom-2">
            <em>
                <a href="https://commons.wikimedia.org/wiki/Commons:Depictor#Challenges">How do i create my own challenge?</a>
            </em>
        </p>

        <el-leaderboard
            v-bind:challenge="challenge?.id"></el-leaderboard>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useDepictorStore } from '../store';
import { COMMONS_USER_PREFIX } from '../const';
import ElLeaderboard from './el-leaderboard.vue';

const { challenge, isEditableChallenge: isEditable, rootUrl, screen } = storeToRefs(useDepictorStore());
const { t } = useI18n();

const startLink = computed(() =>
    challenge.value
        ? `${rootUrl.value}/?challenge=${challenge.value.id}&action=start`
        : ''
);
const userLink = computed(() =>
    challenge.value
        ? t('challenge_userlink', {
            link: `${COMMONS_USER_PREFIX}${challenge.value.user}`,
            user: challenge.value.user
        })
        : ''
);

const editChallenge = () => (screen.value = 'edit-challenge');
</script>
