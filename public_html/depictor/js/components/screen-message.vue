<template>
    <div class="screen__message">
        <slot></slot>

        <wm-button
            v-if="showReloadButton"
            type="anchor"
            v-bind:href="homeLink"
            flair="primary">{{ $t('reload_app') }}</wm-button>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useDepictorStore } from '../store';

const { showReloadButton } = defineProps<{
    showReloadButton?: boolean;
}>();

const { homeLink } = storeToRefs(useDepictorStore());
</script>
