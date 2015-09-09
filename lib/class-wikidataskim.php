<?php
use \Httpful\Request as Request;

class WikidataSkim {
    const LINKSHERE = "https://www.wikidata.org/w/api.php?action=query&prop=linkshere&titles=%s&lhnamespace=0&lhshow=!redirect&format=json&lhlimit=500";
    const ENTITIES = "https://www.wikidata.org/w/api.php?action=wbgetentities&ids=%s&languages=%s&format=json&languagefallback=1";
    const ENTITIES_SHORT = "&props=labels|descriptions|claims";
    const DEFAULT_LANG = "en";
    const CLAIM_REGEX = "/CLAIM\[(\d+):(\d+)]/i";
    const ITEMS_PER_PAGE = 50;

    private $extended = false;
    private $lang = self::DEFAULT_LANG;
    private $withimages = false;
    private $usewdq = false;

    function __construct($opts) {
        foreach ($opts as $key => $value) {
            $this->$key = $value;
        }
    }

    private function getEntities($ids) {
        $results = [];

        $start = $this->page * self::ITEMS_PER_PAGE;

        $url = sprintf(
            self::ENTITIES,
            implode("|", array_slice($ids, $start, self::ITEMS_PER_PAGE)),
            $this->lang
        );

        if (!$this->extended) $url .= self::ENTITIES_SHORT;

        $res = Request::get($url)->send();

        foreach ($res->body->entities as $key => $value) {
            $results[$key] = $value;
        }

        return $results;
    }

    private function getMatches($ids, $prop, $isid) {
        $items = $this->getEntities($ids);
        $results = [];

        foreach ($items as $id => $entity) {
            if (!isset($entity->claims->{'P18'})) {
                if ($this->withimages) continue;
                $image = false;
            } else {
                $image = reset($entity->claims->P18)->mainsnak->datavalue->value;
            }

            foreach ($entity->claims as $claimprop => $claim) {
                $claim = $claim[0];

                if ($claimprop != $prop) continue;
                if ($claim->mainsnak->datatype !== 'wikibase-item') continue;

                $claimentity = "Q" . $claim->mainsnak->datavalue->value->{'numeric-id'};

                if ($claimentity != $isid) continue;

                if ($this->extended) {
                    $results[$id] = $entity;
                } else {
                    $results[$id] = [
                        "label" => isset($entity->labels) ? $entity->labels->{$this->lang}->value : '',
                        "description" => isset($entity->descriptions) ? $entity->descriptions->{$this->lang}->value : '',
                        "id" => $entity->id,
                        "image" => $image
                    ];
                }

                break;
            }
        }

        return $results;
    }

    private function getLinksHere($q) {
        $url = sprintf(self::LINKSHERE, $q);
        $res = Request::get($url)->send();

        $query = $res->body->query;

        if (isset($query->pages->{-1})) {
            return false;
        }

        $linkshere = reset($query->pages)->linkshere;

        return array_map(function($item) {
            return $item->title;
        }, $linkshere);
    }

    private function hasNext($results) {
        $nextitem = ($this->page + 1) * self::ITEMS_PER_PAGE;
        return $nextitem < count($results);
    }

    private function hasPrev($results) {
        return $this->page > 0;
    }

    public function query($q) {
        preg_match_all(self::CLAIM_REGEX, $q, $matches);

        if (count($matches[0]) < 1) {
            return [
                'error' => 400
            ];
        }

        $prop = $matches[1][0];
        $isid = $matches[2][0];

        if ($this->usewdq) {
            $url = sprintf("http://wdq.wmflabs.org/api?q=CLAIM[%s:%s]", $prop, $isid);
            $res = Request::get($url)->send();
            $results = array_map(function($item) {
                return "Q$item";
            }, $res->body->items);
        } else {
            if ($isid[0] !== "Q") $isid = "Q$isid";
            $results = $this->getLinksHere($isid);
        }

        if (!$results) {
            return [
                'error' => 404
            ];
        }

        if ($prop[0] !== "P") $prop = "P$prop";
        if ($isid[0] !== "Q") $isid = "Q$isid";

        return [
            "hasnext" => $this->hasNext($results),
            "hasprev" => $this->hasPrev($results),
            "items" => $this->getMatches($results, $prop, $isid)
        ];
    }
}