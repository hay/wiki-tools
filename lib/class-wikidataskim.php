<?php
use \Httpful\Request as Request;

class WikidataSkim {
    const LINKSHERE = "http://www.wikidata.org/w/api.php?action=query&prop=linkshere&titles=%s&lhnamespace=0&lhshow=!redirect&format=json&lhlimit=500";
    const ENTITIES = "http://www.wikidata.org/w/api.php?action=wbgetentities&ids=%s&languages=%s&format=json";
    const ENTITIES_SHORT = "&props=labels|descriptions|claims";
    const DEFAULT_LANG = "en";
    const CLAIM_REGEX = "/CLAIM\[(\d+):(\d+)]/i";

    function __construct() {

    }

    private function getMatches($ids, $lang, $prop, $isid, $extended = true, $withimages = false) {
        $ids = array_slice($ids, 0, 50);

        $url = sprintf(self::ENTITIES, implode("|", $ids), $lang);

        if (!$extended) {
            $url .= self::ENTITIES_SHORT;
        }

        $res = Request::get($url)->send();
        $results = array();

        foreach ($res->body->entities as $id => $entity) {
            if (!isset($entity->claims->{'P18'})) {
                if ($withimages) continue;
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

                if ($extended) {
                    $results[$id] = $entity;
                } else {
                    $results[$id] = array(
                        "label" => isset($entity->labels) ? $entity->labels->$lang->value : '',
                        "description" => isset($entity->descriptions) ? $entity->descriptions->$lang->value : '',
                        "id" => $entity->id,
                        "image" => $image
                    );
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

    public function query($q, $extended = false, $lang = self::DEFAULT_LANG, $withimages = false) {
        preg_match_all(self::CLAIM_REGEX, $q, $matches);

        if (count($matches[0]) < 1) {
            return array(
                'error' => 400
            );
        }

        $prop = $matches[1][0];
        $isid = $matches[2][0];

        if ($prop[0] !== "P") $prop = "P$prop";
        if ($isid[0] !== "Q") $isid = "Q$isid";

        $results = $this->getLinksHere($isid);

        if (!$results) {
            return array(
                'error' => 404
            );
        }

        return $this->getMatches($results, $lang, $prop, $isid, $extended, $withimages);
    }
}