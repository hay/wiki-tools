<?php
class GwtCookNaBeeldbank extends GwtCookTransformer {
    private function getImageUrl($item) {
        $imageUrl = false;

        foreach ($item->xpath('ese:isShownBy') as $tag) {
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
        $str = $item->xpath("memorix:MEMORIX/field[@name='PhotoName']");
        return str_replace(".tjp", "", (string) $str[0]->value);
    }

    private function getSubjects($item) {
        $subjects = array_merge(
            $this->nsStringArray($item, "dc:subject"),
            $this->nsStringArray($item, "dc:coverage")
        );

        $subjects = array_unique($subjects);

        return "trefwoorden: " . implode(", ", $subjects);
    }

    public function transform() {
        foreach($this->xml->xpath("//item") as $item) {
            $isMap = $this->nsString($item, "dc:type") == "Kaart";

            if ($isMap) {
                $inventoryNumber = "4.VTH";
            } else {
                $inventoryNumber = $this->nsString($item, "dc:isPartOf", function($tag) {
                    return strpos($tag, "2.24") !== false;
                });
            }

            if ($isMap) {
                $accessionNumber = $this->nsString(
                    $item,
                    "memorix:MEMORIX/field[@name='Inventarisnummer']/value"
                );
            } else {
                $accessionNumber = $this->nsString($item, "dc:identifier", function($tag) {
                    $ok = preg_match("/^\d*-\d*$/m", $tag);
                    return $ok;
                });
            }

            if ($isMap) {
                $photoName = "NL-HaNA_4.VTH-$accessionNumber";
            } else {
                $photoName = $this->getPhotoName($item);
            }

            $suggestedFileName = sprintf(
                "%s (%s)",
                substr($item->title, 0, 150),
                $photoName
            );

            if ($isMap) {
                $provider = "Nationaal Archief";
            } else {
                $provider = "Nationaal Archief / Anefo";
            }

            $sourceText = sprintf(
                "[%s %s], accession number %s, file number %s",
                (string) $item->guid,
                $provider,
                $inventoryNumber,
                $accessionNumber
            );

            $combinedIdentifier = sprintf(
                "%s, inventory number %s / %s",
                $inventoryNumber, $accessionNumber, $photoName
            );

            $this->addChildren($item, array(
                "institution" => "Nationaal Archief",
                "inventoryNumber" => $inventoryNumber,
                "accessionNumber" => $accessionNumber,
                "imageUrl" => $this->getImageUrl($item),
                "isodata" => substr($this->nsString($item, "dc:date"), 0, 10),
                "author" => $this->getAuthor($item),
                "photoName" => $photoName,
                "suggestedFileName" => $suggestedFileName,
                "sourceText" => $sourceText,
                "combinedIdentifier" => $combinedIdentifier
            ));

            $subjects = $item->addChild("subjects", $this->getSubjects($item));
            $subjects->addAttribute('lang', 'nl');

            $item->description->addAttribute('lang', "nl");
        }

        return true;
    }
}