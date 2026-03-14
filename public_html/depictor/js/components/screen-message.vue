<template>
    <div class="screen__message">
        <slot></slot>

        <wm-button
            v-if="showReloadButton"
            type="anchor"
            v-bind:href="homeLink"
            flair="primary">{{$t('reload_app')}}</wm-button>
    </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useDepictorStore } from '../store';

const { t: $t } = useI18n();

const props = withDefaults(
    defineProps<{
        showReloadButton?: boolean;
    }>(),
    { showReloadButton: false }
);

const store = useDepictorStore();
const { homeLink } = storeToRefs(store);
</script>