<?php

/* default settings */
$default = array(
	"hashengine" => "b64_sha1",
	"outputlength" => 27,
	"salt" => 0
);

/* for each resource, override certain settings */
$vk = array();
$facebook = array();

/* construct the list of resources, mapping resource name to corresponding profile */
$resources = array(
	"viktklubb.se" => $vk,
	"facebook.com" => $facebook
);


/* finally, construct the profile object */
$profile = array(
	"default" => $default,
	"resource" => $resources
);

echo(json_encode($profile));

?>
