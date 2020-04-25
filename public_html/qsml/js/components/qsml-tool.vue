<template>
    <div class="qsml-tool">
        <button
            v-show="!output"
            v-on:click="convert">Convert</button>

        <button
            v-show="output"
            v-on:click="reset">Reset</button>

        <textarea
            v-show="!output"
            v-model="input"
            rows="50"></textarea>

        <textarea
            v-show="output"
            rows="50">{{output}}</textarea>
    </div>
</template>

<script>
    import Parser from '../parser.js';

    export default {
        data() {
            return {
                input : '',
                output : null
            }
        },

        methods : {
            convert() {
                const parser = new Parser(this.input);
                this.output = parser.getData();
            },

            reset() {
                this.output = null;
            }
        }
    }
</script>
