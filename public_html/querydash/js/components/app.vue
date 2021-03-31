<template>
    <div class="dashboard">
        <menu class="dashboard__actions">
            <button
                v-on:click="addQuery"
                class="button">
                <span>➕ Add query</span>
            </button>

            <button
                v-show="!editMode && queries.length"
                v-on:click="editMode = true"
                class="button">
                <span>📝 Edit queries</span>
            </button>

            <button
                v-show="editMode"
                v-on:click="editMode = false"
                class="button">
                <span>💾 Done editing</span>
            </button>

            <button
                v-show="queries.length"
                v-on:click="saveState"
                class="button">
                <span>🔗 Save to URL</span>
            </button>
        </menu>

        <ul class="queries">
            <li v-for="(query, index) in queries"
                v-bind:key="index"
                class="queries__item">
                <button
                    v-show="editMode"
                    v-on:click="removeQuery(index)"
                    class="button">
                    <span>🗑 Delete</span>
                </button>

                <input
                    v-show="editMode"
                    placeholder="Query title"
                    v-model="query.name" />

                <p v-show="!editMode">
                    {{query.name}}
                </p>

                <textarea
                    placeholder="SPARQL query"
                    v-show="editMode"
                    v-model="query.query"></textarea>

                <div
                    v-show="!editMode"
                    class="queries__value">
                    {{query.value}}
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                editMode : false,
                queries : []
            };
        },

        methods : {
            addQuery() {
                this.queries.push({
                    isEdited : true,
                    name : null,
                    query : '',
                    value : null
                });

                this.editMode = true;
            },

            loadState() {
                if (!window.location.hash) return;
                const hash = window.location.hash.slice(1);
                let queries;

                try {
                    queries = JSON.parse(window.atob(hash));
                } catch (e) {
                    console.error('URL hash decoding error!');
                    return;
                }

                this.queries = queries;
            },

            removeQuery(index) {
                this.queries = this.queries.filter((q, qIndex) => qIndex !== index);
            },

            saveState() {
                // This is pretty dirty, but oh well
                const state = window.btoa(JSON.stringify(this.queries));
                window.location.hash = state;
            }
        },

        mounted() {
            window.addEventListener('hashchange', this.loadState.bind(this));
            this.loadState();
        }
    }
</script>
