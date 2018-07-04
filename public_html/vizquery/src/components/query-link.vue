<template>
    <a v-bind:href="href">
        <slot></slot>
    </a>
</template>

<script>
    import { isEmpty } from 'lodash';

    export default {
        computed : {
            href() {
                return `#${encodeURIComponent(this.query)}`;
            }
        },

        props : {
            query : {
                type : String,
                required : true
            }
        }
    }
</script>