<template>
    <div>
        <template v-if="notice === 'common-errors'">
            <p>Images are shown in this app if:</p>

            <ul>
                <li>The categories are linked to a Wikidata item using property <a href="https://www.wikidata.org/wiki/Property:P373">P373</a>.</li>
                <li>That Wikidata item has an <a href="https://www.wikidata.org/wiki/Property:P18">image</a>.</li>
                <li>The Wikidata item's 'instance of' is not 'category' itself.</li>
            </ul>
        </template>
    </div>
</template>

<script>
    export default {
        props : {
            notice : {
                type : String,
                required : true,
                validator: (val) => {
                    return ['common-errors'].includes(val);
                }
            }
        }
    }
</script>
