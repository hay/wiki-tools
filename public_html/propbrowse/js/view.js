import Vue from 'vue';
import { each, filter, fromPairs } from 'lodash';
import Model from './model.js';

const MINIMUM_QUERY_LENGTH = 4;
const MAX_DETAILED_LIST_LENGTH = 250;

export default function() {
    return new Vue({
        el : "#app",

        mounted() {
            this.model = new Model();

            this.model.on('progress', (p) => {
                this.loadingProgress = Math.round(p);
            });

            this.model.on('ready', () => {
                const datatypes = this.model.getDatatypes();
                this.allproperties = this.model.getProperties();
                this.datatypes = fromPairs(datatypes.map((type) => [type, true]));
            });

            this.model.load();
        },

        data : {
            allproperties : null,
            datatypes : {},
            loadingProgress : 0,
            MAX_DETAILED_LIST_LENGTH,
            MINIMUM_QUERY_LENGTH,
            model : null,
            q : '',
            showDatatypes : false,
            shownProperties : null,
            sortDirection : 1,
            sortKey : 'label',
            view : 'compact'
        },

        computed : {
            properties() {
                if (!this.allproperties) {
                    return [];
                }

                const q = this.q.toLowerCase();

                // Only start filtering when q has a minimum amount of characters
                if (q.length < MINIMUM_QUERY_LENGTH) {
                    return this.allproperties;
                }

                let props = this.allproperties.filter((p) => {
                    return this.shownDatatypes.includes(p.datatype) &&
                           p.index.includes(q);
                });

                if (this.sortKey) {
                    props = this.sortBy(this.sortKey, props);
                }

                return props;
            },

            shownDatatypes() {
                return Object.keys(this.datatypes).filter(d => this.datatypes[d]);
            }
        },

        watch : {
            q(q) {
                this.view = q.length < MINIMUM_QUERY_LENGTH ? 'compact' : 'detailed';

                if (q.length < MINIMUM_QUERY_LENGTH) {
                    this.resetDatatypes();
                }
            }
        },

        methods : {
            resetDatatypes() {
                for (const key in this.datatypes) {
                    this.datatypes[key] = true;
                }
            },

            resetFilter() {
                this.q = '';
                this.resetDatatypes();
            },

            setSort(key) {
                this.sortKey = key;
                this.sortDirection = this.sortDirection * -1;
            },

            sortBy(key, properties) {
                return properties.sort((a, b) => {
                    a = a[key].toLowerCase();
                    b = b[key].toLowerCase();

                    if (key === 'id') {
                        a = parseInt(a.replace('P', ''));
                        b = parseInt(b.replace('P', ''));
                    }

                    return a > b ? (1 * this.sortDirection) : -1 * this.sortDirection;
                });
            },

            toggleDatatypes() {
                this.showDatatypes = !this.showDatatypes;
            }
        }
    });
};