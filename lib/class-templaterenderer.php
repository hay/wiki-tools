<?php
class TemplateRenderer {
    private $renderer;

    function __construct() {
        $loader = new Twig_Loader_Filesystem(PATH . "../templates");

        $this->renderer = new Twig_Environment($loader, [
            "cache" => PATH . "../cache",
            "debug" => DEBUG
        ]);

        $this->renderer->addGlobal('root', ROOT);

        if (DEBUG)  {
            $this->renderer->addExtension(new Twig_Extension_Debug());
        }
    }

    public function render($template, $data = []) {
        return $this->renderer->render("$template.html", $data);
    }
}