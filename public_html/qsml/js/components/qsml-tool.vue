<template>
    <div class="qsml-tool">
        <button v-on:click="convert">Convert</button>

        <textarea
            v-model="input"
            rows="50"></textarea>
    </div>
</template>

<script>
    import Parser from '../parser.js';

    export default {
        data() {
            return {
                input : ''
            }
        },

        methods : {
            convert() {
                const parser = new Parser(this.input);
                console.log(parser.getData());
            }
        }
    }
</script>
