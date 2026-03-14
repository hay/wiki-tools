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

<script>
    export default {
        emits: ['click'],

        computed : {
            classes() {
                const classes = ['wm-button'];

                if (this.flair) {
                    this.flair.split(',').forEach((flair) => {
                        classes.push(`wm-button--${flair}`);
                    });
                }

                return classes;
            }
        },

        methods : {
            click() {
                if (this.disabled) {
                    console.log('Button disabled');
                    return;
                }

                this.$emit('click');
            }
        },

        props : {
            disabled : {
                default : false,
                type : Boolean,
                required : false
            },

            flair : {
                default : 'default',
                type : String,
                required : false
            },

            icon : {
                type : String,
                required : false
            },

            type : {
                type : String
            }
        }
    }
</script>