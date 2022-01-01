<template>
    <div class="qid-input">
        <p>
            Both single QIDs (Q146) and URLs (https://www.wikidata.org/wiki/Q146) will work.
            Once you click 'Create query' you will get a new tab with a prefilled SPARQL query.
        </p>

        <menu>
            <button
                v-bind:disabled="!input.length"
                v-on:click="create">Create query</button>
        </menu>

        <fieldset>
            <legend>Options</legend>

            <input type="checkbox"
                   id="add-label"
                   v-model="addLabel" />
            <label for="add-label">Add label</label>

            <input type="checkbox"
                   id="add-description"
                   v-model="addDescription" />
            <label for="add-description">Add description</label>

            <label for="language">Language for label & description</label>
            <input type="text"
                   v-model="language"
                   id="language" />

            <input type="checkbox"
                   id="skip-invalid"
                   v-model="skipInvalid" />
            <label for="skip-invalid">Skip invalid QIDs</label>
        </fieldset>

        <p v-if="error"
           class="error">{{error}}</p>

        <textarea
            v-model="input"
            placeholder="Paste your list of QIDs here"
            rows="50"></textarea>
    </div>
</template>

<script>
    import Parser from '../parser.js';

    export default {
        data() {
            return {
                addDescription : false,
                addLabel : true,
                error : false,
                input : '',
                language : '[AUTO_LANGUAGE]',
                parser: null,
                skipInvalid : true
            }
        },

        methods : {
            create() {
                this.error = false;
                this.parser = new Parser(this.input, {
                    addDescription : this.addDescription,
                    addLabel : this.addLabel,
                    language : this.language,
                    skipInvalid : this.skipInvalid
                });

                let url;

                try {
                    url = this.parser.getQueryUrl();
                } catch (e) {
                    this.error = e.message;
                    this.reset();
                    return;
                }

                window.open(url, '_blank').focus();

                // console.log(url);
            },

            reset() {
                this.parser = null;
            }
        }
    }
</script>