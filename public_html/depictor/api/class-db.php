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
    }