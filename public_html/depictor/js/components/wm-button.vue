<script>
    import { h } from 'vue';

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
        },

        render() {
            const children = [];

            if (this.icon) {
                children.push(h(
                    'span',
                    {
                        class : 'wm-button__icon icon',
                        'data-icon' : this.icon
                    }
                ));
            }

            children.push(h(
                'span',
                {
                    class : 'wm-button__content'
                },
                this.$slots.default ? this.$slots.default() : []
            ));

            return h(
                this.type === 'anchor' ? 'a' : 'button',
                {
                    class : this.classes,
                    'is-disabled' : this.disabled,
                    onClick : this.click
                },
                children
            );
        }
    }
</script>