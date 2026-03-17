<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useDepictorStore } from '../store';
import { encodeWikiTitle, loadImage } from '../util';

const COMMONS_FILE_PREFIX = 'https://commons.wikimedia.org/wiki/';
import { WikipediaApi } from '../mwapi/wikipedia';
import ElProgress from './el-progress.vue';

const store = useDepictorStore();
const {
    candidate,
    item,
    lockActions,
    category,
    candidates,
    remainingCandidates,
    remainingItems,
    items,
    isPossibleChallenge,
} = storeToRefs(store);
const { t: $t } = useI18n();

const showCandidateImage = ref(true);
const showItemImage = ref(true);
const summary = ref<string | false | null>(false);

const candidateImage = computed(
    () =>
        showCandidateImage.value && candidate.value
            ? candidate.value.thumb
            : undefined
);

const categoryUrl = computed(
    () =>
        'https://commons.wikimedia.org/wiki/Category:' +
        encodeWikiTitle(category.value ?? '')
);

const totalCandidates = computed(() => candidates.value.length);

const remainingCandidatesCount = computed(() => {
    const count =
        totalCandidates.value - remainingCandidates.value.length + 1;
    return count > totalCandidates.value ? totalCandidates.value : count;
});

const imageProcess = computed(() =>
    $t('image_process', {
        x: remainingCandidatesCount.value,
        y: totalCandidates.value,
        categoryUrl: categoryUrl.value,
    })
);

const itemImage = computed(
    () =>
        showItemImage.value && item.value
            ? (item.value as { thumb?: string }).thumb
            : undefined
);

const progress = computed(() => {
    const total = items.value.length;
    const remain = remainingItems.value.length;
    return { total, value: total - remain };
});

const candidateUrl = computed(
    () =>
        candidate.value
            ? `${COMMONS_FILE_PREFIX}${encodeWikiTitle(candidate.value.title)}`
            : ''
);

const itemRef = computed(() => {
    const i = item.value as {
        description?: string;
        url?: string;
        hasSitelink?: boolean;
        thumb?: string;
        label?: string;
        sitelinkTitle?: string;
    };
    return {
        description: i?.description,
        href: i?.url,
        hasSitelink: i?.hasSitelink,
        img: i?.thumb,
        label: i?.label,
        sitelinkTitle: i?.sitelinkTitle,
    };
});

const candidateDepicted = () => handleCandidate('depicted');

const candidateNotDepicted = () => handleCandidate('not-depicted');

const candidateSkipped = () => handleCandidate('user-skipped');

const createChallenge = () => { store.screen = 'create-challenge'; };

const getSummary = async (title: string) => {
    const api = new WikipediaApi(store.locale);
    const result = await api.getSummary(title);
    if (result.extract_html) {
        summary.value = result.extract_html;
    }
};

const handleCandidate = async (action: string) => {
    store.lockActions = true;
    showCandidateImage.value = false;
    await store.handleCandidate(action);
    await showAllImages();
    store.lockActions = false;
};

const handleKeydown = (e: KeyboardEvent) => {
    if (lockActions.value) {
        console.log('lockActions, ignore keypresses');
        return;
    }
    if (e.key === '1') {
        candidateDepicted();
    } else if (e.key === '2') {
        candidateSkipped();
    } else if (e.key === '3') {
        candidateNotDepicted();
    } else if (e.key === 's') {
        skipItem();
    }
};

const skipItem = async () => {
    store.lockActions = true;
    showCandidateImage.value = false;
    summary.value = false;
    showItemImage.value = false;
    store.setItemDone((item.value as { qid: string }).qid);
    await store.nextItem();
    await showAllImages();
    store.lockActions = false;
};

const showAllImages = async () => {
    if (candidate.value?.thumb) {
        await loadImage(candidate.value.thumb);
    }
    showCandidateImage.value = true;
    showItemImage.value = true;
};

onMounted(() => {
    document.body.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    document.body.removeEventListener('keydown', handleKeydown);
});

watch(item, () => {
    console.log('Item changed');
    summary.value = false;
});
</script>

<template>
    <div>
        <div class="screen" v-if="!candidate">
            <p class="screen__instruction">
               {{$t('fetching_candidates')}}
            </p>
        </div>

        <div class="screen screen--game"
             v-if="!!candidate && !!item">
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
                        <a v-bind:href="itemRef.href"
                           target="_blank">
                            {{itemRef.label}}
                        </a>
                    </p>

                    <p class="reference__description">
                        <em>
                            {{itemRef.description}}
                        </em>
                    </p>

                    <div v-if="summary"
                         class="reference__summary"
                         v-html="summary" />

                    <menu class="reference__buttons">
                        <wm-button
                            v-if="itemRef.hasSitelink && !summary"
                            flair="default,bare"
                            icon="info"
                            v-on:click="() => itemRef.sitelinkTitle && getSummary(itemRef.sitelinkTitle)">
                            {{ $t('get_summary') }}</wm-button>

                        <wm-button
                            v-on:click="skipItem"
                            icon="skip"
                            flair="default,bare">{{$t('skip_item')}}</wm-button>
                    </menu>
                </figcaption>
            </figure>

            <div class="screen__content">
                <p class="screen__instruction"
                   v-if="!showCandidateImage || !showItemImage">
                    {{$t('loading_images')}}
                </p>

                <p v-else
                   class="screen__instruction"
                   v-html="$t('is_depicted', { label : itemRef.label })"></p>

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

                <a :href="candidateUrl"
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
                    <a :href="candidateUrl"
                       target="_blank">
                       {{candidate.title}} ({{candidate.mid}})
                    </a>
                </small>

                <span>
                    {{$t("keyboard_shortcuts")}}: <kbd>1</kbd> → {{$t("depicted")}}; <kbd>2</kbd> → {{$t("skip")}}; <kbd>3</kbd> → {{$t("not_depicted")}}; <kbd>s</kbd> → {{$t("skip_item")}}.
                </span>

                <span v-show="!isPossibleChallenge">
                    {{$t('create_challenge_not_possible')}}
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
