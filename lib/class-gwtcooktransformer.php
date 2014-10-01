<?php
abstract class GwtCookTransformer {
    abstract public function transform();

    protected $xml;

    public function __construct($xml) {
        $this->xml = $xml;
    }

    protected function addChildren($item, array $nodes) {
        foreach ($nodes as $key => $value) {
            $node = $item->addChild($key, $value);
        }
    }

    protected function nsString($item, $id, $where = false) {
        $tags = $this->nsStringArray($item, $id);

        if (count($tags) === 1 || !$where) {
            return $tags[0];
        }

        $filtered = array_filter($tags, $where);

        return reset($filtered);
    }

    protected function nsStringArray($item, $id) {
        $tags = $item->xpath("$id");
        $tags = array_map("strval", $tags);
        return $tags;
    }

    public function getXml() {
        return $this->xml->asXml();
    }
}