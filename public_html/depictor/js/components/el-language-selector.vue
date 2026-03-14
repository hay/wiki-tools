<template>
    <div class="language-selector"
              v-on:click="clickSelect">
        <span class="icon"
              data-icon="locale"></span>

        <span class="language-selector__link"
              v-show="!isShowSelect">
            {{$t('language')}}
        </span>

        <select
            v-show="isShowSelect"
            v-on:change="onChange"
            class="language-selector__select">
            <option
                v-if="link"
                value="external-link">
                {{link.label}}
            </option>

            <option
                v-for="l in languages"
                v-bind:selected="l.code === lang"
                v-bind:value="l.code">
                {{l.label}}
            </option>
        </select>

        <span class="icon language-selector__close"
              v-show="isShowSelect"
              v-on:click.stop="blurSelect"
              data-icon="close"></span>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();

interface Language {
    code: string;
    label: string;
}

interface LinkInfo {
    link: string;
    label: string;
}

const {languages, link, modelValue: lang} = defineProps<{
    languages: Language[];
    link?: LinkInfo;
    modelValue: string;
}>();

const emit = defineEmits<{
    'blur-select': [];
    'click-select': [];
    'update:modelValue': [value: string];
}>();

const isShowSelect = ref(false);

const blurSelect = () => emit('blur-select');

const onChange = (e: Event) => {
    const newLang = (e.target as HTMLSelectElement).value;
    if (newLang === 'external-link' && link) {
        window.location.href = link.link;
    } else {
        emit('update:modelValue', newLang);
    }
    isShowSelect.value = false;
};

const clickSelect = () => emit('click-select');

const hideSelect = () => { isShowSelect.value = false; };

const showSelect = () => { isShowSelect.value = true; };

defineExpose({
    hideSelect,
    showSelect,
});
</script>