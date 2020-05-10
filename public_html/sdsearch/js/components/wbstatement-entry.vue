<template>
    <div class="search-keyword__wbstatement-entry">
        <div class="search-keyword__value">
            <entity-entry
                class="entity"
                classPrefix="entity__"
                type="property"
                v-on:start-searching="expand(true)"
                v-on:stop-searching="expand(false)"
                v-model="prop"></entity-entry>
        </div>

        <div class="search-keyword__value">
            <entity-entry
                class="entity"
                classPrefix="entity__"
                type="item"
                v-on:start-searching="expand(true)"
                v-on:stop-searching="expand(false)"
                v-model="item"></entity-entry>
        </div>
    </div>
</template>

<script>
    import { EntityEntry } from 'wikidata-ux';

    export default {
        components : { EntityEntry },

        data() {
            const [ query, prop, item ] = this.value.match(/haswbstatement:(.+)=(.+)/);

            return {
                expanded : 0,
                item : item,
                prop : prop
            }
        },

        methods : {
            expand(expand) {
                this.expanded += expand ? 1 : -1;
                const event = this.expanded > 0 ? 'expand' : 'contract';
                this.$emit(event);
            },

            input() {
                if (this.prop.id && this.item.id) {
                    const input = `haswbstatement:${this.prop.id}=${this.item.id}`;
                    this.$emit('input', input);
                }
            }
        },

        props : ['value'],

        watch : {
            item() { this.input(); },
            prop() { this.input(); }
        }
    }
</script>
