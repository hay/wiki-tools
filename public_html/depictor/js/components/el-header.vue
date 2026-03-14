<template>
    <div class="el-header">
        <menu class="el-header__menu">
            <wm-button
                v-if="screen === 'game'"
                v-show="!showLangselect"
                v-bind:href="homeLink"
                type="anchor"
                flair="default,bare"
                icon="arrow-left">{{$t('start')}}</wm-button>

            <el-language-selector
                ref="langSelectRef"
                v-on:blur-select="langSelectRef!.hideSelect()"
                v-on:click-select="langSelectRef!.showSelect()"
                v-bind:languages="languages"
                v-bind:link="transateLink"
                v-model="locale" />
            <el-dark-toggle  />

            <wm-button
                v-if="isLoggedIn"
                v-show="!showLangselect"
                type="anchor"
                flair="default,bare"
                class="el-header__username"
                v-bind:href="userPage"
                target="_blank"
                icon="user">{{userName}}</wm-button>

            <wm-button
                v-show="!showLangselect"
                icon="help"
                flair="default,bare"
                type="anchor"
                href="https://commons.wikimedia.org/wiki/Commons:Depictor">
                {{$t("help")}}
            </wm-button>

            <wm-button
                v-if="isLoggedIn"
                v-show="!showLangselect"
                icon="logout"
                flair="default,bare"
                type="anchor"
                href="index.php?logout=1">{{$t("log_out")}}</wm-button>
        </menu>

        <h1 class="app-title"
            v-show="screen === 'intro'">
            <a v-bind:href="rootUrl">{{ $t('app_title') }}</a>
        </h1>

        <p class="app-lead"
            v-show="screen === 'intro'">
            {{$t('app_description')}}
        </p>

        <div class="screen"
             v-if="!isLoggedIn">
            <template v-if="isAccessTokenRequest">
                <p class="screen__lead">
                   {{$t('logged_in_proceed')}}
                </p>

                <wm-button
                    href="index.php"
                    type="anchor"
                    flair="default,primary">{{$t('proceed')}}</wm-button>
            </template>

            <template v-else-if="isLoggedOut">
                <p class="screen__lead">
                    {{$t('please_log_in')}}
                </p>

                <wm-button
                   v-bind:href="authUrl"
                   type="anchor"
                   flair="default,primary">{{$t('log_in')}}</wm-button>
            </template>

            <template v-else>
                <!-- invalidAccessTokenRequest and anything else weird -->
                <p class="screen__lead">
                    {{$t('login_error_try_again')}}
                </p>

                <wm-button
                    flair="default,primary"
                    type="anchor"
                    href="index.php?logout=1">{{$t("try_again")}}</wm-button>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import ElDarkToggle from './el-dark-toggle.vue';
import ElLanguageSelector from './el-language-selector.vue';
import { storeToRefs } from 'pinia';
import { useDepictorStore } from '../store';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const store = useDepictorStore();
const { authUrl, rootUrl, homeLink, locales, userPage, userName, isAccessTokenRequest, isLoggedIn, isLoggedOut, screen } = storeToRefs(store);

const { t: $t, locale: i18nLocale } = useI18n();

const langSelectRef = ref<InstanceType<typeof ElLanguageSelector> >();

const locale = computed({
    get() {
        return store.locale;
    },
    set(locale) {
        store.setLocale(locale);
    }
});

const languages = computed(() => locales.value?.languages ?? []);

const showLangselect = ref(false);
const transateLink = ref({
    link : 'https://tools.wmflabs.org/tooltranslate/#tool=59',
    label : $t('translate_this_tool')
});
        
watch(locale, (newLocale) => {
    i18nLocale.value = newLocale;
});
</script>