<template>
    <div class="language-selector">
        <span class="icon"
              v-on:click="clickSelect"
              data-icon="locale"></span>

        <span class="language-selector__link"
              v-show="!isShowSelect"
              v-on:click="clickSelect">
            {{ $t('language') }}
        </span>

        <select
            v-show="isShowSelect"
            v-on:change="change(($event.target as HTMLSelectElement).value)"
            class="language-selector__select">
            <option
                v-if="link"
                value="external-link">
                {{ link.label }}
            </option>

            <option
                v-for="l in languages"
                v-bind:selected="l.code === lang"
                v-bind:value="l.code">
                {{ l.label }}
            </option>
        </select>

        <span class="icon language-selector__close"
              v-show="isShowSelect"
              v-on:click="blurSelect"
              data-icon="close"></span>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const { languages, link, modelValue } = defineProps<{
    languages: Array<{ code: string; label: string }>;
    link?: { link: string; label: string };
    modelValue: string;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
    'blur-select': [];
    'click-select': [];
}>();

const isShowSelect = ref(false);
const lang = ref(modelValue);

watch(() => modelValue, (val) => (lang.value = val));

const blurSelect = () => emit('blur-select');

const change = (newLang: string) => {
    if (newLang === 'external-link' && link) {
        window.location.href = link.link;
    } else {
        emit('update:modelValue', newLang);
    }
    isShowSelect.value = false;
};

const clickSelect = () => emit('click-select');

const showSelect = () => (isShowSelect.value = true);

const hideSelect = () => (isShowSelect.value = false);

defineExpose({
    showSelect,
    hideSelect
});
</script>
