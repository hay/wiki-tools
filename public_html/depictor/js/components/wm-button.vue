<template>
    <component
        :is="type === 'anchor' ? 'a' : 'button'"
        :class="classes"
        :is-disabled="disabled"
        @click="click"
    >
        <span v-if="icon" class="wm-button__icon icon" :data-icon="icon"></span>
        <span class="wm-button__content">
            <slot></slot>
        </span>
    </component>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const { disabled = false, flair = 'default', icon, type } = defineProps<{
    disabled?: boolean;
    flair?: string;
    icon?: string;
    type?: string;
}>();

const emit = defineEmits<{
    click: [];
}>();

const classes = computed(() => {
    const classList = ['wm-button'];

    if (flair) {
        classList
            .push(...flair
                .split(',')
                .map((f) => `wm-button--${f}`)
            );
    }

    return classList;
});

const click = () => {
    if (disabled) {
        console.log('Button disabled');
        return;
    }
    emit('click');
};
</script>