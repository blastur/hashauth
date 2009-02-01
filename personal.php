<?php

/* default settings, (_really_) should specify all possible cfg keys */
$default = array(
	"hashengine" => "b64_sha1",
	"outputlength" => 27,
	"salt" => 0
);

/* for each resource, override specific settings */
$vk = array();
$facebook = array();
$chulak = array("outputlength" => 16, "hashengine" => "hex_sha1");

/* construct the list of resources, mapping resource name to corresponding profile */
$resources = array(
	"viktklubb.se" => $vk,
	"facebook.com" => $facebook,
	"admin@chulak" => $chulak,
);


/* finally, construct the profile object */
$profile = array(
	"default" => $default,
	"resource" => $resources
);

/* caches are annoying when updating profile frequently, but useful otherwise! */
header('Cache-Control: no-cache');
header('Pragma: no-cache');

echo(json_encode($profile));

?>
