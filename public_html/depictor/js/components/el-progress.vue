<template>
    <div class="el-progress">
        <div class="el-progress__bar"
             v-bind:style="style"></div>

        <div class="el-progress__values">
            <span class="el-progress__value">{{percentLabel}}</span>
            <span class="el-progress__value">{{value}} / {{total}}</span>
        </div>
    </div>
</template>

<script>
    export default {
        computed : {
            percent() {
                return Math.ceil((this.value / this.total) * 100);
            },

            percentLabel() {
                return this.$t('pct_complete', { pct : this.percent });
            },

            style() {
                return {
                    width : this.percent + '%'
                }
            }
        },

        props : {
            total : {
                required : true,
                type : Number
            },

            value : {
                type : Number,
                required : true
            }
        }
    }
</script>