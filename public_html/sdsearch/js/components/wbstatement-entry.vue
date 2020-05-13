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
    import { makeHasbwstatement, parseHaswbstatement } from '../api.js';

    function entityToString(entity) {
        if (!entity) {
            return null;
        } else if (typeof entity === 'str') {
            return entity;
        } else {
            return entity.id;
        }
    }

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

                console.log('hoi', input);

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
