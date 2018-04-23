import Vue from "vue";
import { parseQuery } from './util.js';
import { query } from './api.js'

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
            titles() {
                return this.titlesText.split('\n').map(s => s.trim());
            }
        },

        methods : {
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
            this.project = q.project;
            this.titlesText = q.titles;
            this.query();
        }
    });
};