<template>
    <div class="qsml-tool">

        <menu>
            <button
                v-show="!output"
                v-on:click="convert">Convert</button>

            <button
                v-show="output"
                v-on:click="reset">Edit</button>

            <a v-if="url"
               class="button"
               target="_blank"
               v-bind:href="url">Send to QuickStatements</a>
        </menu>

        <textarea
            v-show="!output"
            v-model="input"
            placeholder="Paste your QSML here"
            rows="50"></textarea>

        <textarea
            v-show="output"
            rows="50">{{output}}</textarea>
    </div>
</template>

<script>
    import Parser from '../parser.js';

    export default {
        computed : {
            output() {
                return this.parser ? this.parser.getData() : null;
            },

            url() {
                return this.parser ? this.parser.getUrl() : null;
            }
        },

        data() {
            return {
                input : '',
                parser: null
            }
        },

        methods : {
            convert() {
                this.parser = new Parser(this.input);
            },

            reset() {
                this.parser = null;
            }
        }
    }
</script>
