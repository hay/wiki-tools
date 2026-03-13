<template>
    <div class="screen screen--challenge">
        <wm-button
            v-on:click="back"
            flair="default,bare"
            icon="arrow-left">
            {{ $t('back') }}
        </wm-button>

        <template v-if="mode === 'create'">
            <p>
                You are going to create a challenge based on your current query.
                A challenge is a way to work together with multiple people for a
                single goal.
                Please fill in all the missing details below and click 'create challenge'.
            </p>

            <p>
                Note that if you want to archive this challenge or edit description and title
                you can only do this yourself, when logged in using your Wikimedia account.
                It is not possible to change the query for a challenge afterwards.
            </p>

            <p>
                If you clicked here by accident, simply click 'back' above to go
                back to your current game.
            </p>
        </template>

        <template v-if="mode === 'edit'">
            <p>You can edit your challenge now.</p>
        </template>

        <div class="options">
            <p class="options__instruction">
                These options are pre-filled with your current query and
                can't be changed. To change these, create a new query by
                going to the front page of this tool and give other values.
            </p>

            <label>
                {{ $t('query_type') }}
            </label>

            <input type="text"
                   v-bind:value="query.type"
                   disabled />

            <label>
                {{ $t('query_value') }}
            </label>

            <input type="text"
                   v-bind:value="query.value"
                   disabled />

            <label>
                {{ $t('username') }}
            </label>

            <input type="text"
                   v-bind:value="userName"
                   disabled />

            <label>
                {{ $t('itemcount') }}
            </label>

            <input type="text"
                   v-bind:value="itemCount"
                   disabled />

            <p class="options__instruction">
                You can change these values.
            </p>

            <label for="opt-title">
                {{ $t('title') }}
            </label>

            <input type="text"
                   v-model="title" />

            <p class="options__input">
                {{ $t('challenge_title_length', { count: MIN_CHALLENGE_TITLE_LENGTH }) }}
            </p>

            <label for="opt-shortdescription">
                {{ $t('short_description') }}
            </label>

            <input type="text"
                   v-model="shortDescription"
                   min="20"
                   required
                   max="150" />

            <p class="options__input">
                {{ $t('challenge_shortdescription_length', { count: MIN_CHALLENGE_SHORTDESCRIPTION_LENGTH }) }}
            </p>

            <label for="opt-longdescription">
                {{ $t('long_description') }}
            </label>

            <textarea
                rows="4"
                v-model="longDescription"></textarea>

            <label for="opt-archive">
                {{ $t('archived') }}
            </label>

            <p class="options__input">
                <input type="checkbox"
                       v-model="archived" />

                {{ $t('archived_hint') }}
            </p>

            <wm-button
                v-if="mode === 'create'"
                class="options__input"
                icon="challenge"
                v-bind:disabled="loading || !hasNeededFields"
                v-on:click="create">{{ $t('create_challenge') }}</wm-button>

            <wm-button
                v-if="mode === 'edit'"
                class="options__input"
                icon="edit"
                v-bind:disabled="loading || !hasNeededFields"
                v-on:click="edit">{{ $t('edit_challenge') }}</wm-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useDepictorStore } from '../store';
import { MIN_CHALLENGE_TITLE_LENGTH, MIN_CHALLENGE_SHORTDESCRIPTION_LENGTH } from '../const';

const { isEditable } = defineProps<{
    isEditable?: boolean;
}>();

const store = useDepictorStore();
const { challenge, query: storeQuery, remainingItems, rootUrl, screen, userName: storeUserName } = storeToRefs(store);

const archived = ref(false);
const itemCount = ref(0);
const loading = ref(false);
const longDescription = ref('');
const shortDescription = ref('');
const title = ref('');
const query = ref<{ type?: string; value?: string }>({});
const userName = ref<string | null>(null);

const editableValues = computed(() => ({
    archived: archived.value,
    longDescription: longDescription.value,
    shortDescription: shortDescription.value,
    title: title.value
}));

const hasNeededFields = computed(() =>
    title.value.length >= MIN_CHALLENGE_TITLE_LENGTH &&
    shortDescription.value.length > MIN_CHALLENGE_SHORTDESCRIPTION_LENGTH
);

const mode = computed(() => (isEditable ? 'edit' : 'create'));

const back = () => {
    if (mode.value === 'create') {
        screen.value = 'game';
    } else {
        screen.value = 'challenge';
    }
};

const create = async () => {
    if (loading.value) return;
    const id = await store.createChallenge(editableValues.value);
    window.location.href = `${rootUrl.value}/?challenge=${id}`;
};

const edit = async () => {
    if (loading.value) return;
    const id = await store.editChallenge(editableValues.value);
    window.location.href = `${rootUrl.value}/?challenge=${id}`;
};

onMounted(() => {
    if (mode.value === 'edit') {
        const ch = challenge.value;
        if (ch) {
            query.value = { type: ch.querytype, value: ch.queryvalue };
            archived.value = ch.archived === '1';
            itemCount.value = ch.itemcount ? parseInt(ch.itemcount) : 0;
            longDescription.value = ch.long_description ?? '';
            shortDescription.value = ch.short_description ?? '';
            title.value = ch.title ?? '';
            userName.value = storeUserName.value ?? null;
        }
    } else {
        itemCount.value = remainingItems.value.length;
        query.value = { ...storeQuery.value };
        userName.value = storeUserName.value ?? null;
    }
});
</script>
