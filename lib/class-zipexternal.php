<?php
// From < http://stackoverflow.com/a/13930314/152809 >
class ZipExternal {
    private $zip, $tmpfile, $urls = array();

    function __construct() {
        $this->zip = new ZipArchive();
        $this->tmpfile = tempnam(".", "");
        $this->zip->open($this->tmpfile, ZipArchive::CREATE);
    }

    private function sendZip() {
        file_put_contents("aap.zip", readfile($this->tmpfile));
        // header('Content-disposition: attachment; filename=download.zip');
        // header('Content-type: application/zip');
        // readfile($this->tmpfile);
        //
    }

    public function addUrl($url, $filename) {
        $this->urls[] = array(
            "url" => $url,
            "filename" => $url
        );
    }

    public function create() {
        foreach ($this->urls as $data) {
            $file = file_get_contents($data['url']);
            $this->zip->addFromString($data['filename'], $file);
        }

        $this->zip->close();

        $this->sendZip();
    }
}