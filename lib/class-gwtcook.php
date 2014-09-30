<?php
class GwtCook {
    private $xml, $file, $transformer;
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

        if (!in_array($this->file->type, array("application/xml", "text/xml"))) {
            $this->error = "Your upload doesn't seem to be an XML file.";
            return;
        }

        $this->xml = simplexml_load_file($this->file->tmp_name);

        if (!$this->xml) {
            $this->error = "Your XML file is invalid.";
            return;
        }

        $this->transformer = new GwtCookNaBeeldbank($this->xml);

        if (!$this->transformer->transform()) {
            $this->error = "Could not transform your otherwise valid XML. Sorry...";
        }

        return true;
    }

    public function getError() {
        return $this->error;
    }

    public function getFilename() {
        return str_replace(".xml", "-transformed.xml", $this->file->name);
    }

    public function getXml() {
        return $this->transformer->getXml();
    }

    public function hasError() {
        return (bool) $this->error;
    }
}