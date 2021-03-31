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

            <button
                v-show="queries.length"
                v-on:click="run"
                class="button">
                <span>▶️ Run queries</span>
            </button>
        </menu>

        <ul class="queries"
            v-bind:class="editMode ? 'queries--edit' : 'queries--view'">
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

                <p class="queries__name"
                    v-show="!editMode">
                    {{query.name}}
                </p>

                <textarea
                    placeholder="SPARQL query"
                    v-show="editMode"
                    v-model="query.query"></textarea>

                <div
                    v-show="!editMode"
                    class="queries__value">
                    <span
                        class="queries__bar"
                        v-bind:style="getStyle(query.value)"></span>
                    <strong>{{query.value}}</strong>
                </div>
            </li>
        </ul>

        <p class="dashboard__timestamp">
            Timestamp of this run: {{timestamp}}
        </p>
    </div>
</template>

<script>
    import axios from 'axios';
    import Vue from 'vue';

    export default {
        data() {
            return {
                editMode : false,
                largestValue : 1,
                queries : [],
                timestamp : null
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

            getStyle(val) {
                const width = Math.round((val / this.largestValue) * 100);
                return { width : `${width}%`};
            },

            loadState() {
                if (!window.location.hash) return;
                const hash = window.location.hash.slice(1);

                try {
                    const data = JSON.parse(window.atob(hash));

                    if (!data.queries || !data.timestamp) {
                        throw new Error('Invalid hash data');
                    }

                    this.queries = data.queries;
                    this.timestamp = data.timestamp;
                } catch (e) {
                    console.error('URL hash decoding error!');
                    return;
                }

                // Set largest value
                this.queries.forEach((q) => {
                    if (q.value > this.largestValue) {
                        this.largestValue = Number(q.value);
                    }
                });
            },

            removeQuery(index) {
                this.queries = this.queries.filter((q, qIndex) => qIndex !== index);
            },

            async run() {
                // Make sure the user knows we're busy
                this.queries.forEach(i => i.value = 'Loading...');
                await Vue.nextTick();

                for (const item of this.queries) {
                    let query = `
                        select (count(?item) as ?count) where {
                          ${item.query}
                        }
                    `.trim();

                    try {
                        const res = await axios.get('https://query.wikidata.org/sparql', {
                            params : { query }
                        });

                        const val = Number(res.data.results.bindings[0].count.value);
                        item.value = val;

                        if (val > this.largestValue) {
                            this.largestValue = val;
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }

                this.saveState();
            },

            saveState() {
                // This is pretty dirty, but oh well
                const state = {
                    queries : this.queries,
                    timestamp : new Date().toISOString()
                };

                window.location.hash = window.btoa(JSON.stringify(state));
            }
        },

        mounted() {
            window.addEventListener('hashchange', this.loadState.bind(this));
            this.loadState();
        }
    }
</script>
