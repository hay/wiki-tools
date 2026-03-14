<template>
    <div class="dark-toggle"
         v-on:click="() => toggleDark()">
        <span class="icon"
              :data-icon="isDark ? 'sun' : 'moon'"></span>

        <span class="dark-toggle__link">
            {{ isDark ? $t('dark_mode_off') : $t('dark_mode_on') }}
        </span>
    </div>
</template>

<script lang="ts" setup>
import { useDark, useToggle } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();

const isDark = useDark(); 
const toggleDark = useToggle(isDark);
</script>

