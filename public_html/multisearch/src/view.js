import Vue from "vue";
import saveCsv from 'save-csv';
import { parseQuery } from './util.js';
import { query, resultsToTable } from './api.js'

export default function(selector) {
    return new Vue({
        el : selector,

        data : {
            error : false,
            project : null,
            results : [],
            titlesText : ''
        },

        computed : {
            resultsTable() {
                return resultsToTable(this.results, this.project);
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
            download() {
                saveCsv(this.resultsTable);
            },

            edit() {

            },

            query() {
                query({
                    project : this.project,
                    titles : this.titles
                }).then((results) => {
                    this.results = results;
                });
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