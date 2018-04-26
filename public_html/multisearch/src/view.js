import Vue from "vue";
import saveCsv from 'save-csv';
import { isEmpty } from 'lodash';
import { parseQuery } from './util.js';
import { query, resultsToCsv, resultsToTable } from './api.js'

export default function(selector) {
    return new Vue({
        el : selector,

        data : {
            csvRaw : null,
            error : false,
            project : null,
            results : [],
            titlesText : ''
        },

        directives : {
            copy(el) {
                el.addEventListener('click', (e) => {
                    el.focus();
                    el.select();
                    document.execCommand('copy');
                });
            }
        },

        computed : {
            resultsTable() {
                return resultsToTable(this.results, this.project);
            },

            state() {
                if (this.csvRaw) {
                    return 'copy';
                } else if (!!this.results.length) {
                    return 'results';
                } else {
                    return 'edit';
                }
            },

            titles() {
                const text = this.titlesText.trim();

                if (!!text.length) {
                    return text.split('\n').map(s => s.trim()).filter(s => !!s);
                } else {
                    return [];
                }
            }
        },

        methods : {
            closeCopy() {
                this.csvRaw = null;
            },

            copy() {
                this.csvRaw = resultsToCsv(this.resultsTable);
            },

            download() {
                saveCsv(this.resultsTable);
            },

            edit() {
                this.results = [];
            },

            isEmpty,

            query() {
                query({
                    project : this.project,
                    titles : this.titles
                }).then((results) => {
                    this.results = results;
                }).catch(err => this.error = err);
            },

            search() {
                window.location.search = `?project=${this.project}&titles=${this.titlesText}`;
            }
        },

        mounted() {
            const q = parseQuery(window.location.search);

            if ('project' in q && 'titles' in q) {
                this.project = q.project;
                this.titlesText = q.titles;
                this.query();
            }
        }
    });
};