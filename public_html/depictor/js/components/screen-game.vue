<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useDepictorStore } from '../store';
import { encodeWikiTitle, loadImage } from '../util';
import { WikipediaApi } from '../mwapi/wikipedia';
import ElProgress from './el-progress.vue';

const store = useDepictorStore();
const {
    candidate,
    category,
    candidates,
    item: currentItem,
    isPossibleChallenge,
    items,
    lockActions,
    locale,
    remainingCandidates,
    remainingItems,
    screen
} = storeToRefs(store);
const { t } = useI18n();

const showCandidateImage = ref(true);
const showItemImage = ref(true);
const summary = ref<string | false>(false);

const candidateImage = computed(() =>
    showCandidateImage.value && candidate.value ? candidate.value.thumb : undefined
);

const categoryUrl = computed(() =>
    'https://commons.wikimedia.org/wiki/Category:' + encodeWikiTitle(category.value ?? '')
);

const totalCandidates = computed(() => candidates.value.length);

const remainingCandidatesDisplay = computed(() => {
    const count = totalCandidates.value - remainingCandidates.value.length + 1;
    return count > totalCandidates.value ? totalCandidates.value : count;
});

const imageProcess = computed(() =>
    t('image_process', {
        x: remainingCandidatesDisplay.value,
        y: totalCandidates.value,
        categoryUrl: categoryUrl.value
    })
);

const itemImage = computed(() =>
    showItemImage.value && currentItem.value ? (currentItem.value as { thumb?: string }).thumb : undefined
);

const progress = computed(() => ({
    total: items.value.length,
    value: items.value.length - remainingItems.value.length
}));

const refData = computed(() => {
    const i = currentItem.value as { description?: string; url?: string; hasSitelink?: boolean; thumb?: string; label?: string; sitelinkTitle?: string };
    return {
        description: i?.description,
        href: i?.url,
        hasSitelink: i?.hasSitelink,
        img: i?.thumb,
        label: i?.label,
        sitelinkTitle: i?.sitelinkTitle
    };
});

const candidateDepicted = () => handleCandidate('depicted');

const candidateNotDepicted = () => handleCandidate('not-depicted');

const candidateProminentlyDepicted = () => handleCandidate('prominently-depicted');

const candidateSkipped = () => handleCandidate('user-skipped');

const createChallenge = () => (screen.value = 'create-challenge');

const getSummary = async (title: string) => {
    const api = new WikipediaApi(locale.value);
    const result = await api.getSummary(title);
    if (result.extract_html) {
        summary.value = result.extract_html;
    }
};

const handleCandidate = async (action: string) => {
    store.setLockActions();
    showCandidateImage.value = false;
    await store.handleCandidate(action);
    await showAllImages();
    store.setUnlockActions();
};

const keydown = (e: KeyboardEvent) => {
    if (lockActions.value) {
        console.log('lockActions, ignore keypresses');
        return;
    }
    if (e.key === '1') candidateDepicted();
    else if (e.key === '2') candidateSkipped();
    else if (e.key === '3') candidateNotDepicted();
    else if (e.key === 's') skipItem();
};

const skipItem = async () => {
    store.setLockActions();
    showCandidateImage.value = false;
    summary.value = false;
    showItemImage.value = false;
    store.setItemDone((currentItem.value as { qid: string }).qid);
    await store.nextItem();
    await showAllImages();
    store.setUnlockActions();
};

const showAllImages = async () => {
    if (candidate.value?.thumb) {
        await loadImage(candidate.value.thumb);
    }
    showCandidateImage.value = true;
    showItemImage.value = true;
};

onMounted(() => window.addEventListener('keydown', keydown));

onUnmounted(() => window.removeEventListener('keydown', keydown));

watch(currentItem, () => {
    console.log('Item changed');
    summary.value = false;
});
</script>

<template>
    <div>
        <div class="screen" v-if="!candidate">
            <p class="screen__instruction">
               {{ $t('fetching_candidates') }}
            </p>
        </div>

        <div class="screen screen--game"
             v-if="!!candidate && !!currentItem">
            <figure class="reference"
                    v-show="showItemImage">
                <el-progress
                    class="reference__progress"
                    v-bind:value="progress.value"
                    v-bind:total="progress.total"></el-progress>

                <img v-bind:src="itemImage"
                     alt=""
                     class="reference__img image" />

                <figcaption class="reference__caption">
                    <p>
                        <a v-bind:href="refData.href"
                           target="_blank">
                            {{ refData.label }}
                        </a>
                    </p>

                    <p class="reference__description">
                        <em>
                            {{ refData.description }}
                        </em>
                    </p>

                    <div v-if="summary"
                         class="reference__summary"
                         v-html="typeof summary === 'string' ? summary : ''" />

                    <menu class="reference__buttons">
                        <wm-button
                            v-if="refData.hasSitelink && !summary"
                            flair="default,bare"
                            icon="info"
                            v-on:click="getSummary(refData.sitelinkTitle!)">
                            {{ $t('get_summary') }}</wm-button>

                        <wm-button
                            v-on:click="skipItem"
                            icon="skip"
                            flair="default,bare">{{ $t('skip_item') }}</wm-button>
                    </menu>
                </figcaption>
            </figure>

            <div class="screen__content">
                <p class="screen__instruction"
                   v-if="!showCandidateImage || !showItemImage">
                    {{ $t('loading_images') }}
                </p>

                <p v-else
                   class="screen__instruction"
                   v-html="$t('is_depicted', { label: refData.label })"></p>

                <menu class="screen__actions">
                    <wm-button v-on:click="candidateDepicted"
                               v-bind:disabled="lockActions"
                               icon="accept">{{ $t('yes') }}</wm-button>

                    <wm-button v-on:click="candidateSkipped"
                               v-bind:disabled="lockActions"
                               icon="skip">{{ $t('skip') }}</wm-button>

                    <wm-button v-on:click="candidateNotDepicted"
                               v-bind:disabled="lockActions"
                               icon="close">{{ $t('no') }}</wm-button>
                </menu>

                <a v-bind:href="candidate?.url ?? (candidate ? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(candidate.title)}` : undefined)"
                   class="screen__candidateimage"
                   target="_blank">
                    <img v-bind:src="candidateImage"
                         v-show="showCandidateImage"
                         alt=""
                         class="screen__fullimage" />
                </a>
            </div>

            <p class="screen__meta">
                <span v-html="imageProcess"></span>

                <small class="screen__small">
                    <a v-bind:href="candidate?.url ?? (candidate ? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(candidate.title)}` : undefined)"
                       target="_blank">
                       {{ candidate?.title }} ({{ candidate?.mid }})
                    </a>
                </small>

                <span>
                    {{ $t('keyboard_shortcuts') }}: <b>(1)</b> {{ $t('depicted') }}, <b>(2)</b> {{ $t('skip') }}, <b>(3)</b> {{ $t('not_depicted') }}, <b>(s)</b> {{ $t('skip_item') }}
                </span>

                <span v-show="!isPossibleChallenge">
                    {{ $t('create_challenge_not_possible') }}
                </span>
            </p>

            <wm-button
                class="screen__challenge"
                v-show="isPossibleChallenge"
                v-on:click="createChallenge"
                icon="challenge">{{ $t('create_challenge') }}</wm-button>
        </div>
    </div>
</template>
