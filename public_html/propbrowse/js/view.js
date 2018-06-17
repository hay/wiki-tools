import Vue from 'vue';

export default function(properties) {
    return new Vue({
        el : "#content",

        data : {
            properties : properties,
            sortDirection : 1,
            view : 'compact',
            q : '',
            shownProperties : properties.length
        },

        watch : {
            q : function(q) {
                this.view = q.length < 3 ? 'compact' : 'detailed';

                if (q.length < 3) {
                    this.properties = this.properties.map(function(p) {
                        p.visible = true;
                        return p;
                    });

                    this.shownProperties = this.properties.length;
                } else {
                    this.shownProperties = 0;

                    this.properties = this.properties.map(function(p) {
                        var isVisible = p.index.indexOf(q.toLowerCase()) !== -1;

                        if (isVisible) {
                            this.shownProperties += 1;
                        }

                        p.visible = isVisible;

                        return p;
                    }, this );
                }
            }
        },
        methods : {
            sortBy : function(key) {
                this.properties = this.properties.sort(function(a, b) {
                    a = a[key];
                    b = b[key];

                    if (key === 'id') {
                        a = parseInt(a.replace('P', ''));
                        b = parseInt(b.replace('P', ''));
                    }

                    return a > b ? (1 * this.sortDirection) : -1 * this.sortDirection;
                }.bind(this));

                this.sortDirection = this.sortDirection * -1;
            }
        }
    });
};