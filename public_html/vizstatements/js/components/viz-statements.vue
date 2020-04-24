<template>
    <div class="wrapper">
        <div
            v-for="entry in entries"
            class="entry">
            <entity-entry
                type="property"
                v-model="entry.property"></entity-entry>

            <entity-entry
                type="item"
                v-model="entry.item"></entity-entry>
        </div>
    </div>
</template>

<script>
    import { EntityEntry } from 'wikidata-ux';

    export default {
        components : { EntityEntry },

        data() {
            return {
                entries : [
                    {
                        item : null,
                        property : 'P31'
                    }
                ]
            };
        }
    }
</script>

<style scoped>
    .entry {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 1rem;
    }
</style>