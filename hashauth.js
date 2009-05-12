/*
 * TODO:
 * 	- validate JSON.parse() return
 *  - verify MSIE / opera functionality
 *  - hide / show profile config appropriately
 *  - manual engine selection should be a dropdown list
 *  - generate the entire form in javascript? ^
 *  - (properly) implement ha_setStatus()
 *  - destroy autocomplete memory when profile is deattached
 *
 */
var ha_engines = {
	'b64_sha1': {
		"f": b64_sha1,
		"maxlength": 27
	},

	'hex_sha1': {
		"f": hex_sha1,
		"maxlength": 40
	},

	'dec_sha1': {
		"f": dec_sha1,
		"maxlength": 10 
	}
};

var ha_defaultEngine = 'b64_sha1';
var ha_hashForm;
var ha_manualMode;
var ha_profile;

function ac_onSetValue(id, text)
{
	ha_setManualMode(false);
}

function ac_createData(profile)
{
	if (profile['resource'] == undefined)
		return false;

	var resourceList = profile['resource'];
	var autoData = [resourceList.length];
	var idx = 0;
	for(var resource in resourceList) {
		autoData[idx] = resource;
		idx++;
	}	
	
	return autoData.sort();
}

function ha_setStatus(txtStatus)
{
	alert(txtStatus)
}

function ha_setManualMode(isManual)
{
	var manualDiv = document.getElementById('manual');
	if (isManual) {
		manualDiv.style.visibility = "visible";
	} else {
		manualDiv.style.visibility = "hidden";
	}

	ha_manualMode = isManual;
}

function ha_processProfile(json)
{
	ha_profile = JSON.parse(json);

	/* create and initialize AutoComplete (ac_*) stuff */
	var data = ac_createData(ha_profile);
	if (data != false) {
		AutoComplete_Create('resource', data, ac_onSetValue);
		ha_setManualMode(false);
	}
}

function ha_fetchProfile(url)
{
	try {
		var req = new XMLHttpRequest();
		req.open("GET", url, true);
	 
	  	req.onreadystatechange = function() {
			if (req.readyState == 4) {
				if (req.status == 200) {	
					ha_processProfile(req.responseText);
				} else {
					ha_setStatus("Failed to fetch profile, reverting to manual mode: " + req.statusText);
					ha_setManualMode(true);
				}
			}	
		}
	
		req.send(null);			
	} catch (e) {
		ha_setStatus("Failed to fetch profile, reverting to manual mode: " + e.message);
		ha_setManualMode(true);
	}
}

function ha_lookup(profile, resource)
{
	if (profile == null)
		return false;

	if (profile["resource"][resource] != undefined) {
		var settings = profile["resource"][resource];
		
		/* Inherit unspecificed settings from default settings */
		if (settings["hashengine"] == undefined)
			settings["hashengine"] = profile["default"]["hashengine"];

		if (settings["outputlength"] == undefined)
			settings["outputlength"] = profile["default"]["outputlength"];

		if (settings["salt"] == undefined)
			settings["salt"] = profile["default"]["salt"];

		return settings;
	} else
		return false;	
}

function __generateHash(resource, settings)
{
	if (ha_engines[settings['hashengine']] == undefined) {
		settings['hashengine'] = ha_defaultEngine;
		ha_setStatus("Unknown hash engine, reverting to " + ha_defaultEngine);
	}

	var engine = ha_engines[settings['hashengine']];
	var input = ha_hashForm.master.value + ":" + resource + ":" + settings['salt'];
	var output = engine.f(input);

	if (settings['outputlength'] > engine.maxlength) {
		ha_setStatus(settings['hashengine'] + ' only supports up to ' +
					 engine.maxlength + ' chars output. Truncating ' +
					 settings['outputlength'] + " to " + engine.maxlength);
		settings['outputlength'] = engine.maxlength;
	}

	output = output.substr(0, settings['outputlength']);
	
	return output;
}

function ha_reinit() {
	/* sane defaults */
	ha_profile = null;
	ha_setManualMode(true);

	ha_hashForm.master.value = '';
	ha_hashForm.resource.value = '';
	ha_hashForm.salt.value = '';
	ha_hashForm.outputlength.value = '';
	ha_hashForm.hashengine.value = '';
	ha_hashForm.password.value = '';
	ha_hashForm.profile.value = '';

	/* download profile, if present */
	var profileName = readCookie('ha_profile');
	if (profileName != null)
		ha_fetchProfile(profileName);

	ha_hashForm.master.focus();
}

/* exported symbols */
function ha_attachProfile(profileName)
{
	if (profileName != "") {
		createCookie('ha_profile', profileName, 30);
		ha_fetchProfile(profileName);
	} else {
		ha_setStatus("Invalid profilename");
	}
}

function ha_deattachProfile()
{
	eraseCookie('ha_profile');
	ha_reinit();
}

function ha_init(aForm)
{
	ha_hashForm = aForm;
	ha_reinit();
}

function ha_generateHash()
{	
	var resource = ha_hashForm.resource.value;
	var settings = ha_lookup(ha_profile, resource);

	if (!settings) {
		if (ha_manualMode) {
			settings = [];
			settings['resource'] = ha_hashForm.resource.value;
			settings['hashengine'] = ha_hashForm.hashengine.value;
			settings['salt'] = ha_hashForm.salt.value;
			settings['outputlength'] = ha_hashForm.outputlength.value;
		} else {
			ha_setStatus("You specified an unknown resource. Please fill out the missing information!");
			ha_setManualMode(true);
			return false;
		}		
	}
		
	var hash = __generateHash(resource, settings);
	ha_hashForm.password.value = hash;
	ha_hashForm.password.select();
	ha_hashForm.password.focus();
	
	return false;
}

