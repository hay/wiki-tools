<template>
  <component
    :is="tag"
    :class="classes"
    :href="tag === 'a' ? href : undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    :is-disabled="disabled"
    v-bind="$attrs"
    @click="click"
  >
    <span v-if="icon" class="wm-button__icon icon" :data-icon="icon"></span>
    <span class="wm-button__content">
      <slot></slot>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { type, flair = "default", href, icon, disabled = false } = defineProps<{
  flair?: string;
  href?: string;
  icon?: string;
  type?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "click", event?: Event): void;
}>();

const tag = computed(() => (type === "anchor" ? "a" : "button"));

const classes = computed(() => {
  const list: string[] = ["wm-button"];
  if (flair) {
    flair.split(",").forEach((f) => {
      list.push(`wm-button--${f.trim()}`);
    });
  }
  return list;
});

const click = (e: Event) => {
  if (disabled) {
    console.log("Button disabled");
    return;
  }
  emit("click");
};
</script>
