<script>
    export default {
        computed : {
            classes() {
                const classes = ['wm-button'];

                if (this.flair) {
                    classes.push(`wm-button--${this.flair}`);
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

        render(h) {
            const children = [];

            if (this.icon) {
                children.push(h(
                    'span',
                    {
                        class : 'wm-button__icon icon',
                        attrs : {
                            'data-icon' : this.icon
                        }
                    }
                ));
            }

            children.push(h(
                'span',
                {
                    class : 'wm-button__content'
                },
                this.$slots.default

            ));

            return h(
                this.type === 'anchor' ? 'a' : 'button',
                {
                    class : this.classes,
                    attrs : {
                        'is-disabled' : this.disabled
                    },
                    on : {
                        click : this.click
                    }
                },
                children
            );
        }
    }
</script>