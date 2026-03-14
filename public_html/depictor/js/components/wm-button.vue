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

const props = withDefaults(
    defineProps<{
        disabled?: boolean;
        flair?: string;
        icon?: string;
        type?: string;
    }>(),
    {
        disabled: false,
        flair: 'default',
    }
);

const emit = defineEmits<{
    click: [];
}>();

const classes = computed(() => {
    const classList = ['wm-button'];

    if (props.flair) {
        props.flair.split(',').forEach((flair) => {
            classList.push(`wm-button--${flair}`);
        });
    }

    return classList;
});

const click = () => {
    if (props.disabled) {
        console.log('Button disabled');
        return;
    }
    emit('click');
};
</script>