<?php
abstract class GwtCookTransformer {
    abstract public function transform();

    protected $xml;

    public function __construct($xml) {
        $this->xml = $xml;
    }

    // Obviously, it's much easier to just put everything in namespaces
    // and use the same tags without any description, because that makes
    // things much easier, right?
    protected function nsString($item, $id, $where = false) {
        $tags = $item->xpath("//$id");
        $tags = array_map("strval", $tags);

        if (count($tags) === 1 || !$where) {
            return $tags[0];
        }

        $filtered = array_filter($tags, $where);

        return reset($filtered);
    }

    public function getXml() {
        return $this->xml->asXml();
    }
}