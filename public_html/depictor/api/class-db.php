<?php
    class Db {
        const MAX_LEADERBOARD_ROWS = 500;

        function __construct(array $opts) {
            ORM::configure([
                "connection_string" => $opts["connection_string"],
                "username" => $opts["username"],
                "password" => $opts["password"],
                "logging" => $opts["logging"]
            ]);

            if (DEBUG) {
                ORM::configure('logger', function($log_string) {
                    error_log($log_string);
                });
            }
        }

        public function addChallenge(array $args) {
            $item = ORM::for_table(TBL_DEPICTOR_CHALLENGES)->create();

            $item->set([
                "querytype" => $args["querytype"],
                "queryvalue" => $args["queryvalue"],
                "title" => $args["title"],
                "short_description" => $args["short_description"],
                "long_description" => $args["long_description"],
                "user" => $args["user"],
                "archived" => $args["archived"],
                "created" => date("c")
            ]);

            $item->save();

            return $item->id();
        }

        public function addFile(array $args) {
            $newItem = ORM::for_table(TBL_DEPICTOR_FILES)->create();

            // Check for challengId
            if (isset($args["challenge"]) && $args["challenge"] != "") {
                $challengeId = $args["challenge"];
            } else {
                $challengeId = null;
            }

            $newItem->set([
                "mid" => $args["mid"],
                "qid" => $args["qid"],
                "category" => $args["category"],
                "user" => $args["user"],
                "status" => $args["status"],
                "timestamp" => date("c"),
                "challenge" => $challengeId
            ]);

            $newItem->save();

            // If we're in a challenge, also update the last_edit of that
            // challenge for a nice sort order of the last updated
            // challenges
            if ($challengeId) {
                $challengeItem = ORM::for_table(TBL_DEPICTOR_CHALLENGES)->find_one($challengeId);
                $challengeItem->last_edit = date("c");
                $challengeItem->save();
            }
        }

        public function addItem(array $args) {
            $newItem = ORM::for_table(TBL_DEPICTOR_ITEMS)->create();

            $newItem->set([
                "qid" => $args["qid"],
                "status" => $args["status"],
                "timestamp" => date("c"),
                "user" => $args["user"]
            ]);

            $newItem->save();
        }


        public function editChallenge($id, array $args) {
            $item = ORM::for_table(TBL_DEPICTOR_CHALLENGES)->find_one($id);

            $item->set([
                "title" => $args["title"],
                "short_description" => $args["short_description"],
                "long_description" => $args["long_description"],
                "archived" => $args["archived"]
            ]);

            $item->save();

            return $id;
        }

        public function fileExists(string $mid):bool {
            $sql = "select exists(select * from "  . TBL_DEPICTOR_FILES . " where mid = :mid and status != 'user-skipped')";
            $exists = ORM::for_table(TBL_DEPICTOR_FILES)
                ->raw_query($sql, [ "mid" => $mid ])
                ->find_array();

            // FIXME
            $exists = array_values($exists[0])[0];

            return $exists == "1";
        }

        // Check if files 'exist' in the database, given two conditions
        // 1) The MID is in the 'files' table and has the status of 'depicted' or 'not-depicted'
        // 2) The MID is in the 'files' table and has the status of 'user-skipped' AND the given
        //    userName is the same as the user in the table
        public function filesExist(array $mids, string $userName):array {
            // First do a query for all files with the given MIDS
            $files = ORM::for_table(TBL_DEPICTOR_FILES)
                ->select(["mid", "status", "user"])
                ->where_in("mid", $mids)
                ->find_array();

            $exists = [];

            // Now loop over the results and add the MIDs to a new array
            foreach($files as $file) {
                $mid = $file["mid"];
                $status = $file["status"];

                if (in_array($status, ["depicted", "not-depicted"])) {
                    $exists[$mid] = true;
                } else if ($status == "user-skipped" && $file["user"] == $userName) {
                    $exists[$mid] = true;
                } else {
                    $exists[$mid] = false;
                }
            }

            // Any remaining MIDS not found in the database don't exist,
            // so add those was false
            foreach ($mids as $mid) {
                if (!array_key_exists($mid, $exists)) {
                    $exists[$mid] = false;
                }
            }

            return $exists;
        }

        public function getChallenge(int $id):array {
            $challenge = ORM::for_table(TBL_DEPICTOR_CHALLENGES)->find_one($id);

            if (!$challenge) {
                throw new Exception("No challenge found for that id");
            } else {
                return $challenge->as_array();
            }
        }

        public function getChallenges():array {
            // First get statement count per challenge
            $sql = "select challenge,count(*) as edits from " . TBL_DEPICTOR_FILES . " where challenge AND status = 'depicted' group by challenge";
            $countArr = ORM::for_table(TBL_DEPICTOR_FILES)->raw_query($sql)->find_array();

            // Do some mapping for easier lookup later
            $count = [];

            foreach ($countArr as $item) {
                $count[$item["challenge"]] = $item["edits"];
            }

            // Now get the actual challenges and combine with count
            $challenges = ORM::for_table(TBL_DEPICTOR_CHALLENGES)
                ->where_not_equal('archived', 1)
                ->order_by_desc('last_edit')
                ->find_array();

            return array_map(function($challenge) use ($count) {
                $challenge["edits"] = $count[$challenge["id"]] ?? 0;
                return $challenge;
            }, $challenges);
        }

        public function getLeaderboard():array {
            $sql = "select user,count(*) as edits from " . TBL_DEPICTOR_FILES . " where status = 'depicted' group by user order by edits desc limit " . self::MAX_LEADERBOARD_ROWS;

            return ORM::for_table(TBL_DEPICTOR_FILES)->raw_query($sql)->find_array();
        }

        public function getLeaderboardById(int $id):array {
            $sql = "select user,count(*) as edits from " . TBL_DEPICTOR_FILES . " where status = 'depicted' AND challenge = '$id' group by user order by edits desc limit " . self::MAX_LEADERBOARD_ROWS;

            return ORM::for_table(TBL_DEPICTOR_FILES)
                ->raw_query($sql)
                ->find_array();
        }

        public function getFilesByMid(string $mid):array {
            return ORM::for_table(TBL_DEPICTOR_FILES)
                ->where('mid', $mid)
                ->where_not_equal('status', 'user-skipped') // Skipped items can show up again
                ->find_array();
        }

        public function getItemsByQid(string $qid):array {
            return ORM::for_table(TBL_DEPICTOR_ITEMS)->where('qid', $qid)->find_array();
        }

        public function getTotalFiles() {
            return ORM::for_table(TBL_DEPICTOR_FILES)->where('status', 'depicted')->count();
        }

        public function getTotalFilesByChallenge(int $id) {
            return ORM::for_table(TBL_DEPICTOR_FILES)
                ->where('status', 'depicted')
                ->where('challenge', $id)
                ->count();
        }

        public function itemExists(string $qid):bool {
            $sql = "select exists(select * from "  . TBL_DEPICTOR_ITEMS . " where qid = :qid)";
            $exists = ORM::for_table(TBL_DEPICTOR_ITEMS)
                ->raw_query($sql, [ "qid" => $qid ])
                ->find_array();

            // FIXME
            $exists = array_values($exists[0])[0];

            return $exists == "1";
        }

        // Check if an array of qids exist in the items table
        public function itemsExist(array $qids):array {
            // First do a query for all files with the given qids
            $items = ORM::for_table(TBL_DEPICTOR_ITEMS)
                ->select("qid")
                ->where_in("qid", $qids)
                ->find_array();

            // Loop over those items and convert to an exists array,
            // because we know these qids exist (items have no state like files)
            $exists = [];

            foreach ($items as $item) {
                $qid = $item["qid"];
                $exists[$qid] = true;
            }

            // And loop over all qids, if the key doesn't exists we know
            // it's false
            foreach ($qids as $qid) {
                if (!array_key_exists($qid, $exists)) {
                    $exists[$qid] = false;
                }
            }

            return $exists;
        }
    }