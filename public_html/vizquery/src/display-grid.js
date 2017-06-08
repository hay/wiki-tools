import Vue from "vue";

export default Vue.component('display-grid', {
    template : "#tmpl-display-grid",

    props : {
        data : Array
    }
});