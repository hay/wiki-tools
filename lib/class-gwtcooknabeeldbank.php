<?php
class GwtCookNaBeeldbank extends GwtCookTransformer {
    private function getImageUrl($item) {
        $imageUrl = false;

        foreach ($item->xpath('//ese:isShownBy') as $tag) {
            $url = (string) $tag;

            if (strpos($url, "thumb/1280x1280") !== false) {
                $imageUrl = $url;
            }
        }

        return $imageUrl;
    }

    public function transform() {
        foreach($this->xml->channel->item as $item) {
            $inventoryNumber = $this->nsString($item, "dc:isPartOf", function($tag) {
                return strpos($tag, "2.24") !== false;
            });

            $accessionNumber = $this->nsString($item, "dc:identifier", function($tag) {
                $ok = preg_match("/^\d*-\d*$/m", $tag);
                return $ok;
            });

            $this->inventoryNumber = $inventoryNumber;
            $this->accessionNumber = $accessionNumber;
            $item->imageUrl = $this->getImageUrl($item);
            $item->description->addAttribute('lang', 'nl');
            $item->isodate = substr($this->nsString($item, "dc:date"), 0, 10);

            $item->combinedIdentifier = sprintf(
                "%s, inventory number %s",
                $inventoryNumber, $accessionNumber
            );
        }

        return true;
    }
}