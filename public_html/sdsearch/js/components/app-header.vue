<template>
    <header class="header">
        <h1 class="app-title">
            <a  href="#">{{$t('structured_search')}}</a>
        </h1>

        <p class="app-lead"
           v-html="$t('tool_description')"></p>
    </header>
</template>