<?php
    class Db {
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

        public function addFile(array $args) {
            $newItem = ORM::for_table(TBL_DEPICTOR_FILES)->create();

            $newItem->set([
                "mid" => $args["mid"],
                "qid" => $args["qid"],
                "category" => $args["category"],
                "user" => $args["user"],
                "status" => $args["status"],
                "timestamp" => date("c")
            ]);

            $newItem->save();
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

        public function fileExists(string $mid):bool {
            $sql = "select exists(select * from "  . TBL_DEPICTOR_FILES . " where mid = :mid and status != 'user-skipped')";
            $exists = ORM::for_table(TBL_DEPICTOR_FILES)
                ->raw_query($sql, [ "mid" => $mid ])
                ->find_array();

            // FIXME
            $exists = array_values($exists[0])[0];

            return $exists == "1";
        }

        // See itemsExist
        public function filesExist(array $mids):array {
            $all_files = ORM::for_table(TBL_DEPICTOR_FILES)
                ->select("mid")
                ->where("status", "user-skipped")
                ->find_array();

            $all_files = array_map(fn($item):string => $item["mid"], $all_files);

            $exists = [];

            foreach ($mids as $mid) {
                $exists[$mid] = in_array($mid, $all_files);
            }

            return $exists;
        }

        public function getLeaderboard():array {
            $sql = "select user,count(*) as edits from " . TBL_DEPICTOR_FILES . " where status = 'depicted' group by user order by edits desc limit 20";
            $stats = ORM::for_table(TBL_DEPICTOR_FILES)->raw_query($sql)->find_array();
            return $stats;
        }

        public function getTotalFiles() {
            return ORM::for_table(TBL_DEPICTOR_FILES)->count();
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

        public function itemExists(string $qid):bool {
            $sql = "select exists(select * from "  . TBL_DEPICTOR_ITEMS . " where qid = :qid)";
            $exists = ORM::for_table(TBL_DEPICTOR_ITEMS)
                ->raw_query($sql, [ "qid" => $qid ])
                ->find_array();

            // FIXME
            $exists = array_values($exists[0])[0];

            return $exists == "1";
        }

        // Note how this function is very different from itemExists, it's
        // up to 20 times faster to simply load all qids into memory and then
        // manually check which qids exists instead of doing 2000
        // SQL EXISTS statements...
        public function itemsExist(array $qids):array {
            $all_items = ORM::for_table(TBL_DEPICTOR_ITEMS)
                ->select("qid")
                ->find_array();

            $all_items = array_map(fn($item):string => $item["qid"], $all_items);

            $exists = [];

            foreach ($qids as $qid) {
                $exists[$qid] = in_array($qid, $all_items);
            }

            return $exists;
        }
    }