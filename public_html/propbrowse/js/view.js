import Vue from 'vue';
import { ProgressBar } from 'uiv';
import { each, filter, fromPairs } from 'lodash';
import Model from './model.js';

export default function() {
    return new Vue({
        el : "#app",

        components : {
            ProgressBar
        },

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
            model : null,
            q : '',
            showDatatypes : false,
            shownProperties : null,
            sortDirection : 1,
            view : 'compact'
        },

        computed : {
            properties() {
                if (!this.allproperties) {
                    return [];
                }

                return this.allproperties.filter(p => this.shownDatatypes.includes(p.datatype));
            },

            shownDatatypes() {
                return Object.keys(this.datatypes).filter(d => this.datatypes[d]);
            }
        },

        watch : {
            q(q) {
                this.view = q.length < 3 ? 'compact' : 'detailed';

                if (q.length < 3) {
                    this.properties = this.properties.map(p => p.visible = true);
                    this.shownProperties = this.properties.length;
                    this.resetDatatypes();
                } else {
                    this.shownProperties = 0;

                    this.properties = this.properties.map((p) => {
                        var isVisible = p.index.indexOf(q.toLowerCase()) !== -1;

                        if (isVisible) {
                            this.shownProperties += 1;
                        }

                        p.visible = isVisible;

                        return p;
                    });
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

            sortBy(key) {
                this.properties = this.properties.sort((a, b) => {
                    a = a[key];
                    b = b[key];

                    if (key === 'id') {
                        a = parseInt(a.replace('P', ''));
                        b = parseInt(b.replace('P', ''));
                    }

                    return a > b ? (1 * this.sortDirection) : -1 * this.sortDirection;
                });

                this.sortDirection = this.sortDirection * -1;
            },

            toggleDatatypes() {
                this.showDatatypes = !this.showDatatypes;
            }
        }
    });
};