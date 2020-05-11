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
            const matches = this.value.match(/haswbstatement:(.+)=(.+)/);

            // HACK FIXME
            if (!!matches && matches[2] === 'null') {
                matches[2] = null;
            }

            return {
                expanded : 0,
                item : !!matches ? matches[2] : null,
                prop : !!matches ? matches[1] : null
            }
        },

        methods : {
            expand(expand) {
                this.expanded += expand ? 1 : -1;
                const event = this.expanded > 0 ? 'expand' : 'contract';
                this.$emit(event);
            },

            input() {
                if (this.prop && this.item && this.prop.id && this.item.id) {
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
