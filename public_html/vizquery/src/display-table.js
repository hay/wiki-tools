import Vue from "vue";

export default Vue.component('display-table', {
    template : "#tmpl-display-table",

    props : {
        data : Array
    }
});