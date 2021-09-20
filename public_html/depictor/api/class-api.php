<?php
    class Api {
        const RE_ITEMID = "/[M|Q]\d+$/";
        private Oauth $oauth;
        private Db $db;
        private bool $isDebug = false;

        function __construct(Oauth $oauth, Db $db) {
            $this->oauth = $oauth;
            $this->db = $db;
        }

        public function process(array $args):array {
            $this->assertOauth();
            $action = $args["action"] ?? false;

            if ($action == "add-file") {
                return $this->addFile($args);
            } else if ($action == "file-exists") {
                $has = $this->hasFile($args["mid"]);
                return ["status" => $has];
            } else if ($action == "files-exists") {
                return $this->hasFiles($args["mids"] ?? []);
            } else if ($action == "item-exists") {
                $has = $this->hasItem($args["qid"]);
                return ["status" => $has];
            } else if ($action == "item-done") {
                $args["status"] = "done";
                return $this->addItem($args);
            } else if ($action == "items-done") {
                return $this->hasItems($args["qids"] ?? []);
            } else if ($action == "leaderboard") {
                return $this->leaderboard($args["id"] ?? null);
            } else if ($action == "challenge") {
                return $this->getChallenge($args["id"] ?? null);
            } else if ($action == "challenges") {
                return $this->getChallenges();
            } else if ($action == "create-challenge") {
                return $this->addChallenge($args);
            } else if ($action == "edit-challenge") {
                return $this->editChallenge($args["id"], $args);
            } else {
                throw new Exception("Invalid action");
            }
        }

        public function setDebug(bool $bool) {
            $this->isDebug = $bool;
        }

        private function addChallenge(array $args) {
            // Make sure we always enter the authenticated user
            if (!$this->isDebug) {
                $args["user"] = $this->oauth->getIdentity();
            }

            $id = $this->db->addChallenge($args);

            return ["id" => $id];
        }

        private function editChallenge($id, array $args) {
            $id = $this->db->editChallenge($id, $args);
            return ["id" => $id];
        }

        private function addDepicts(string $mid, string $qid) {
            $token = $this->oauth->requestCsrfToken();

            $this->oauth->requestPost([
                "action" => "wbcreateclaim",
                "format" => 'json',
                "entity" => $mid,
                "property" => "P180", // For now we only support depicts
                "snaktype" => "value",
                "value" => json_encode([
                    "entity-type" => "item",
                    "numeric-id" => str_replace("Q", "", $qid)
                ]),
                "token" => $token,
                "summary" => "Setting a depicts statement using Depictor"
            ]);

            // TODO: maybe get the result and do some error checking
        }

        private function addFile(array $args) {
            $this->assertItemid($args["mid"]);
            $this->assertItemid($args["qid"]);
            $this->assertIncludes($args["status"], [
                'depicted','not-depicted','user-skipped', 'prominently-depicted'
            ]);
            $this->assertChallengeId($args["challenge"]);

            // First check if maybe this pair of mid/qid is already in the db
            if ($this->hasFile($args["mid"])) {
                throw new Exception("Item already in database");
            }

            // If in debug mode, we simply skip this step so we can test everything else
            if (!$this->isDebug && $args["status"] == "depicted") {
                $this->addDepicts($args["mid"], $args["qid"]);
            }

            $this->db->addFile($args);

            return ["ok" => "Added"];
        }

        private function addItem(array $args) {
            $this->assertItemid($args["qid"]);

            // Check if qid is already in the db
            if ($this->hasItem($args["qid"])) {
                throw new Exception("Item already in database");
            }

            $this->db->addItem($args);

            return ["ok" => "Added"];
        }

        private function assertChallengeId($challenge):void {
            if (!$challenge) {
                return;
            }

            if (!ctype_digit($challenge)) {
                throw new Exception("Challenge ID is not a number");
            }

            $challenge = $this->getChallenge($challenge);
        }

        private function assertOauth():void {
            if ($this->oauth->userState != OAuth::STATE_LOGGED_IN) {
                throw new Exception("User not authorized");
            }
        }

        private function assertIncludes(string $string, array $includes):void {
            if (!in_array($string, $includes)) {
                throw new Exception("Invalid string, should be one of: " . implode(", ",$includes));
            }
        }

        private function assertItemid(string $itemid):void {
            if (!preg_match(self::RE_ITEMID, $itemid)) {
                throw new Exception("Invalid item or file id");
            }
        }

        private function getChallenge($id):array {
            if (!ctype_digit($id)) {
                throw new Exception("Challenge ID is not a number");
            }

            return $this->db->getChallenge((int) $id);
        }

        private function getChallenges():array {
            return $this->db->getChallenges();
        }

        private function hasFile(string $mid):bool {
            $this->assertItemid($mid);
            return $this->db->fileExists($mid);
        }

        private function hasFiles(array $mids):array {
            foreach ($mids as $mid) {
                $this->assertItemid($mid);
            }

            return $this->db->filesExist($mids);
        }

        private function hasItem(string $qid):bool {
            $this->assertItemid($qid);
            return $this->db->itemExists($qid);
        }

        private function hasItems(array $qids):array {
            foreach ($qids as $qid) {
                $this->assertItemid($qid);
            }

            return $this->db->itemsExist($qids);
        }

        private function leaderboard($id = null):array {
            if ($id && ctype_digit($id)) {
                $id = (int) $id;

                return [
                    "stats" => $this->db->getLeaderboardById($id),
                    "total" => $this->db->getTotalFilesByChallenge($id)
                ];
            } else {
                return [
                    "stats" => $this->db->getLeaderboard($id),
                    "total" => $this->db->getTotalFiles()
                ];
            }
        }
    }