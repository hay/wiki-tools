<?php
class GwtCook {
    private $xml, $file;
    private $error = false;

    function __construct($file, $transformer) {
        $this->file = (object) $file;
        $this->error = $this->file->error;

        if ($this->error) {
            return;
        }

        // Well, right now we only have one transformer but MANY WILL FOLLOW
        // IN THE FUTURE!
        if ($transformer !== "na-beeldbank") {
            $this->error = "Invalid transformer.";
        }

        if (!in_array($this->file->type, ["application/xml", "text/xml"])) {
            $this->error = "Your upload doesn't seem to be an XML file.";
            return;
        }

        $this->xml = simplexml_load_file($this->file->tmp_name);

        if (!$this->xml) {
            $this->error = "Your XML file is invalid.";
            return;
        }

        $transformer = new GwtCookNaBeeldbank($this->xml);

        if (!$transformer->transform()) {
            $this->error = "Could not transform your otherwise valid XML. Sorry...";
        }

        echo $transformer->getXml();
    }

    public function getError() {
        return $this->error;
    }

    public function hasError() {
        return (bool) $this->error;
    }
}