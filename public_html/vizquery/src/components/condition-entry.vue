<template>
    <div class="condition-entry">
        <select v-model="item">
            <option
                v-for="(label, value) in options"
                v-bind:value="value">{{label}}</option>
        </select>
    </div>
</template>

<script>
import { CONDITION_OPTIONS } from '../conf.js';

export default {
    data() {
        return {
            item : this.value,
            options : CONDITION_OPTIONS
        };
    },

    watch : {
        item(value) {
            this.$emit('input', value);
        }
    },

    props : {
        value : String
    }
};
</script>