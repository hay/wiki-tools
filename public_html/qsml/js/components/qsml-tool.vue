<template>
    <div class="qsml-tool">
        <qsml-help></qsml-help>

        <menu>
            <button
                v-show="!output"
                v-bind:disabled="!input.length"
                v-on:click="convert">Convert</button>

            <button
                v-show="output"
                v-on:click="reset">Edit</button>

            <a v-if="url"
               class="button"
               target="_blank"
               v-bind:href="url">Send to QuickStatements</a>
        </menu>

        <p v-if="error"
           class="error">{{error}}</p>

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
    import QsmlHelp from './qsml-help.vue';
    import Parser from '../parser.js';

    export default {
        components : { QsmlHelp },

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
                error : false,
                input : '',
                parser: null
            }
        },

        methods : {
            convert() {
                this.error = false;
                this.parser = new Parser(this.input);

                try {
                    this.parser.parse();
                } catch (e) {
                    this.error = `Parser error at line ${this.parser.line}: ${e.message}`;
                    this.reset();
                }
            },

            reset() {
                this.parser = null;
            }
        }
    }
</script>
