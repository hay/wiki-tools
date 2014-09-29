<?php
class GwtCookNaBeeldbank {
    private $xml;

    function __construct($xml) {
        $this->xml = $xml;
    }

    public function transform() {
        foreach($this->xml->channel->item as $item) {
            $item->aap = "aap";
        }

        return true;
    }

    public function getXml() {
        return $this->xml->asXml();
    }
}