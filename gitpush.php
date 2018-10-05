<?php

$payload = file_get_contents('php://input');
$signature = "sha1=".hash_hmac("sha1", $payload, $_SERVER["GITPUSH_SECRET"]);
if ($signature !== $_SERVER["HTTP_X_HUB_SIGNATURE"])
    exit();

$push = json_decode($_POST["payload"]);
var_dump($push);
if ($push->ref === "refs/heads/master")
    exec("flock update.lock -c \"./update.sh\" >update.log 2>&1 &");

?>
