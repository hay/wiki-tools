<template>
    <div class="el-progress">
        <div class="el-progress__bar"
             v-bind:style="style"></div>

        <div class="el-progress__values">
            <span class="el-progress__value">{{percentLabel}}</span>
            <span class="el-progress__value">{{value}} / {{total}}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    total: number;
    value: number;
}>();

const { t: $t } = useI18n();

const percent = computed(() =>
    Math.ceil((props.value / props.total) * 100)
);

const percentLabel = computed(() =>
    $t('pct_complete', { pct: percent.value })
);

const style = computed(() => ({
    width: percent.value + '%',
}));
</script>