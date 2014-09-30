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

    private function getAuthor($item) {
        $tag = $this->nsString($item, "dc:creator");
        $parts = explode("/", $tag);
        $author = explode(",", $parts[0]);
        $author = array_map("trim", $author);
        $author = array_reverse($author);
        return implode(" ", $author);
    }

    private function getPhotoName($item) {
        $str = $item->xpath("//memorix:MEMORIX/field[@name='PhotoName']");
        return str_replace(".tjp", "", (string) $str[0]->value);
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

            $item->inventoryNumber = $inventoryNumber;
            $item->accessionNumber = $accessionNumber;
            $item->imageUrl = $this->getImageUrl($item);
            $item->description->addAttribute('lang', 'nl');
            $item->isodate = substr($this->nsString($item, "dc:date"), 0, 10);
            $item->subjects = implode(", ", $this->nsStringArray($item, "dc:subject"));
            $item->subjects->addAttribute('lang', 'nl');
            $item->author = $this->getAuthor($item);
            $item->photoName = $this->getPhotoName($item);
            $item->suggestedFileName = sprintf(
                "%s (%s).jpg",
                substr($item->title, 0, 150),
                $item->photoName
            );

            $item->sourceText = sprintf(
                "[%s Nationaal Archief / Anefo], accession number %s, file number %s",
                (string) $item->guid,
                $item->inventoryNumber,
                $item->accessionNumber
            );

            $item->combinedIdentifier = sprintf(
                "%s, inventory number %s",
                $inventoryNumber, $accessionNumber
            );
        }

        return true;
    }
}