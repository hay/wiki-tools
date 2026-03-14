<template>
    <div class="screen__wrapper">
        <el-header></el-header>

        <screen-intro
            v-if="screenState === 'intro'"></screen-intro>

        <screen-game
            v-if="screenState === 'game'"></screen-game>

        <screen-challenge
            v-if="screenState === 'challenge'"></screen-challenge>

        <screen-create-challenge
            v-if="screenState === 'create-challenge'"
            :is-editable="false"></screen-create-challenge>

        <screen-create-challenge
            v-if="screenState === 'edit-challenge'"
            :is-editable="true"></screen-create-challenge>

        <screen-message v-if="screenState === 'loading'">
            <p class="screen__notice">{{ $t('loading') }}</p>
        </screen-message>

        <screen-message
            v-if="screenState === 'error'"
            :showReloadButton="true">
            <p class="screen__notice">{{errorMessage}}</p>

            <el-notice
                notice="common-errors"
                class="options__instruction"></el-notice>
        </screen-message>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { test } from '../test';
import { useDepictorStore } from '../store';

const { t: $t } = useI18n();
import ElHeader from './el-header.vue';
import ElNotice from './el-notice.vue';
import ScreenChallenge from './screen-challenge.vue';
import ScreenCreateChallenge from './screen-createchallenge.vue';
import ScreenGame from './screen-game.vue';
import ScreenIntro from './screen-intro.vue';
import ScreenMessage from './screen-message.vue';

const store = useDepictorStore();
const { errorMessage, screenState } = storeToRefs(store);

const parseSearch = () => {
    const url = new window.URL(window.location.href);

    if (
        url.searchParams.has('queryType') &&
        url.searchParams.has('queryValue')
    ) {
        store.runQuery({
            type: url.searchParams.get('queryType') ?? '',
            value: url.searchParams.get('queryValue') ?? '',
        });
    }

    if (url.searchParams.has('challenge')) {
        const id = url.searchParams.get('challenge') ?? '';
        const action = url.searchParams.get('action') ?? '';
        store.loadChallenge({ id, action });
    }

    if (url.searchParams.has('test')) {
        test();
    }
};

onMounted(() => {
    parseSearch();
});

watch(screenState, (newScreen) => {
    window.scrollTo(0, 0);

    const wrapper = document.getElementById('wrapper');
    if (wrapper) {
        if (newScreen === 'game') {
            wrapper.setAttribute('is-fullscreen', '');
        } else {
            wrapper.removeAttribute('is-fullscreen');
        }
    }
});
</script>
