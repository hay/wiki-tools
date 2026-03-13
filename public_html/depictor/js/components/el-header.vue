<template>
    <div class="el-header">
        <menu class="el-header__menu">
            <wm-button
                v-if="screen === 'game'"
                v-show="!showLangselect"
                v-bind:href="homeLink"
                type="anchor"
                flair="default,bare"
                icon="arrow-left">{{ $t('start') }}</wm-button>

            <el-language-selector
                ref="langSelectRef"
                v-on:blur-select="langSelect(false)"
                v-on:click-select="langSelect(true)"
                v-bind:languages="languages"
                v-bind:link="translateLink"
                v-model="locale"></el-language-selector>

            <wm-button
                v-if="isLoggedIn"
                v-show="!showLangselect"
                type="anchor"
                flair="default,bare"
                class="el-header__username"
                v-bind:href="userPage"
                target="_blank"
                icon="user">{{ userName }}</wm-button>

            <wm-button
                v-show="!showLangselect"
                icon="help"
                flair="default,bare"
                type="anchor"
                href="https://commons.wikimedia.org/wiki/Commons:Depictor">
                {{ $t('help') }}
            </wm-button>

            <wm-button
                v-if="isLoggedIn"
                v-show="!showLangselect"
                icon="logout"
                flair="default,bare"
                type="anchor"
                href="index.php?logout=1">{{ $t('log_out') }}</wm-button>
        </menu>

        <h1 class="app-title"
            v-show="screen === 'intro'">
            <a v-bind:href="rootUrl">{{ $t('app_title') }}</a>
        </h1>

        <p class="app-lead"
            v-show="screen === 'intro'">
            {{ $t('app_description') }}
        </p>

        <div class="screen"
             v-if="!isLoggedIn">
            <template v-if="isAccessTokenRequest">
                <p class="screen__lead">
                   {{ $t('logged_in_proceed') }}
                </p>

                <wm-button
                    href="index.php"
                    type="anchor"
                    flair="default,primary">{{ $t('proceed') }}</wm-button>
            </template>

            <template v-else-if="isLoggedOut">
                <p class="screen__lead">
                    {{ $t('please_log_in') }}
                </p>

                <wm-button
                   v-bind:href="authUrl"
                   type="anchor"
                   flair="default,primary">{{ $t('log_in') }}</wm-button>
            </template>

            <template v-else>
                <p class="screen__lead">
                    {{ $t('login_error_try_again') }}
                </p>

                <wm-button
                    flair="default,primary"
                    type="anchor"
                    href="index.php?logout=1">{{ $t('try_again') }}</wm-button>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useDepictorStore } from '../store';
import ElLanguageSelector from './el-language-selector.vue';

const store = useDepictorStore();
const {
    authUrl,
    homeLink,
    isAccessTokenRequest,
    isLoggedIn,
    isLoggedOut,
    locale: storeLocale,
    locales,
    rootUrl,
    screenState: screen,
    userPage,
    userName
} = storeToRefs(store);

const { t, locale: i18nLocale } = useI18n();

const langSelectRef = ref<InstanceType<typeof ElLanguageSelector> | null>(null);
const showLangselect = ref(false);

const locale = computed({
    get: () => storeLocale.value,
    set: (val: string) => store.setLocale(val)
});

const languages = computed(() => locales.value?.languages ?? []);
const translateLink = computed(() => ({
    link: 'https://tools.wmflabs.org/tooltranslate/#tool=59',
    label: t('translate_this_tool')
}));

const langSelect = (select: boolean) => {
    if (select) {
        langSelectRef.value?.showSelect();
    } else {
        langSelectRef.value?.hideSelect();
    }
    showLangselect.value = select;
};

watch(locale, (val) => (i18nLocale.value = val));
</script>
