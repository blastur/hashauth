var m_master = null;
var m_profile = null;
var m_manual = false;

var hashEngines = {
	"b64_sha1": {
		"f": b64_sha1,
		"maxlength": 27
	},

 	"hex_sha1": {
		"f": hex_sha1,
		"maxlength": 40
	},

	"dec_sha1": {
		"f": dec_sha1,
		"maxlength": 10 
	}
};

var fallbackEngine = 'b64_sha1';

/**
 *  TODO: Get rid of awkward HTML dependency
 *  TODO: MSIE support
 */

function setManualMode(enable)
{
	m_manual = enable;
	if (enable) {
		/* load up the defaults, if we have any ... */
		if (m_profile != null && m_profile['default'] != undefined) {
			document.generate.salt.value = m_profile['default']['salt'];
			document.generate.outputlength.value = m_profile['default']['outputlength'];
			document.generate.hashengine.value = m_profile['default']['hashengine'];
		}
				
		document.generate.salt.focus();
		visibility('manual', 'block');		
	} else
		visibility('manual', 'none');
}

function ac_onSetValue(id, text)
{
	setManualMode(false);
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

function initProfile(json)
{
	m_profile = JSON.parse(json);
	var data = ac_createData(m_profile);

	if (data != false) {
		AutoComplete_Create('resource', data, ac_onSetValue);
	}
	document.generate.resource.focus();
}

function fetchProfile(url)
{
	try {
		var req = new XMLHttpRequest();
		req.open("GET", url, true);
	 
	  	req.onreadystatechange = function() {
			if (req.readyState == 4) {
				if (req.status == 200) {	
					initProfile(req.responseText);
				} else {
					alert("Failed to fetch profile, reverting to manual mode: " + req.statusText);
					setManualMode(true);
				}
			}	
		}
	
		req.send(null);			
	} catch (e) {
		alert("Failed to fetch profile, reverting to manual mode: " + e.message);
		setManualMode(true);
	}
}

function visibility(id, value) {
	if (document.getElementById) 
		document.getElementById(id).style.display = value;	
	else {
		if (document.layers) 
			document.id.display = value;		
		else
			document.all.id.style.display = value;		
	}
}


function logon()
{
	m_master = document.login.master.value;	
	if (document.login.profile.value != '') {
		setManualMode(false);
		fetchProfile(document.login.profile.value);
	} else {
		setManualMode(true);
	}
	
	document.login.master.value = '';
	document.generate.password.value = '';
	document.generate.resource.value = '';
	
	visibility('configuration', 'none');
	visibility('generator', 'block');	

	document.generate.resource.focus();

	return false;	
}

function logout()
{
	m_master = '';
	
	document.generate.password.value = '';
	document.generate.resource.value = '';
	visibility('generator', 'none');
	visibility('configuration', 'block');	

	return false;
}

function getProfileSettings(resource)
{
	if (m_profile == null)
		return false;

	if (m_profile["resource"][resource] != undefined) {
		var profile = m_profile["resource"][resource];
		
		/* Only inherit unspecificed settings */
		if (profile["hashengine"] == undefined)
			profile["hashengine"] = m_profile["default"]["hashengine"];

		if (profile["outputlength"] == undefined)
			profile["outputlength"] = m_profile["default"]["outputlength"];

		if (profile["salt"] == undefined)
			profile["salt"] = m_profile["default"]["salt"];

		return profile;
	} else
		return false;	
}

function buildHash(resource, settings)
{
	if (hashEngines[settings['hashengine']] == undefined) {
		settings['hashengine'] = fallbackEngine;
		alert("Unknown hash engine, reverting to " + fallbackEngine);
	}

	var engine = hashEngines[settings['hashengine']];
	var input = m_master + ":" + resource + ":" + settings['salt'];
	var output = engine.f(input);

	if (settings['outputlength'] > engine.maxlength) {
		alert(settings['hashengine'] + ' only supports up to ' + 
			  engine.maxlength + ' chars output. Truncating ' + 
			  settings['outputlength'] + " to " + engine.maxlength);
		settings['outputlength'] = engine.maxlength;
	}

	output = output.substr(0, settings['outputlength']);
	
	return output;
}

function generateHash()
{	
	var resource = document.generate.resource.value;
	
	var settings = getProfileSettings(resource);
	if (!settings) {
		if (m_manual) {
			settings = [];
			settings['resource'] = document.generate.resource.value; 
			settings['hashengine'] = document.generate.hashengine.value; 
			settings['salt'] = document.generate.salt.value; 
			settings['outputlength'] = document.generate.outputlength.value; 			
		} else {
			setManualMode(true);
			return false;
		}		
	}
		
	var hash = buildHash(resource, settings);
	document.generate.password.value = hash;
	document.generate.password.select();
	document.generate.password.focus();
	
	return false;
}

