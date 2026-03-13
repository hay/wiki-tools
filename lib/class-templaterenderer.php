<?php
use Twig\Loader\FilesystemLoader;
use Twig\Environment;
use Twig\Extension\DebugExtension;

class TemplateRenderer {
    private $renderer;

    function __construct() {
        $loader = new FilesystemLoader(PATH . "../templates");

        $this->renderer = new Environment($loader, [
            "cache" => PATH . "../cache",
            "debug" => DEBUG
        ]);

        $this->renderer->addGlobal('root', ROOT);
        $this->renderer->addExtension(new DebugExtension());
    }

    public function render($template, $data = []) {
        return $this->renderer->render("$template.html", $data);
    }
}