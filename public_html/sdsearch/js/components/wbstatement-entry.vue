<template>
    <div class="search-keyword__wbstatement-entry">
        <div class="search-keyword__value">
            <entity-entry
                class="entity"
                classPrefix="entity__"
                type="property"
                v-bind:lang="$i18n.locale"
                v-on:start-searching="expand(true)"
                v-on:stop-searching="expand(false)"
                v-model="prop"></entity-entry>
        </div>

        <div class="search-keyword__value">
            <entity-entry
                class="entity"
                classPrefix="entity__"
                type="item"
                v-bind:lang="$i18n.locale"
                v-on:start-searching="expand(true)"
                v-on:stop-searching="expand(false)"
                v-model="item"></entity-entry>
        </div>
    </div>
</template>

<script>
    import EntityEntry from './entity-entry.vue';
    import { entityToString, makeHasbwstatement, parseHaswbstatement } from '../api.js';

    export default {
        components : { EntityEntry },

        data() {
            const entity = parseHaswbstatement(this.value);

            return {
                expanded : 0,
                item : entity.item,
                prop : entity.prop
            }
        },

        methods : {
            expand(expand) {
                this.expanded += expand ? 1 : -1;
                const event = this.expanded > 0 ? 'expand' : 'contract';
                this.$emit(event);
            },

            input() {
                // We do some magic here, item and prop can either be a string
                // 'P180', or a complete object, depending on where we are
                // However, we always want to give back a haswbstatement to
                // the parent
                const input = makeHasbwstatement({
                    item : entityToString(this.item),
                    prop : entityToString(this.prop)
                });

                this.$emit('input', input);
            }
        },

        props : ['value'],

        watch : {
            item() { this.input(); },
            prop() { this.input(); }
        }
    }
</script>
