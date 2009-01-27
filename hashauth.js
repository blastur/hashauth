var m_master = null;
var m_profile = null;
var m_manual = false;

/**
 * 	TODO: Make sure outputlength isn't > engine output
 *  TODO: Setup an array with available hash engines, to validate lengths etc
 *  TODO: MSIE support
 */

function setManualMode(enabled)
{
	m_manual = enabled;
	if (enabled)
		visibility('manual', 'block');		
	else
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
					alert("Failed to fetch profile. Reverting to manual mode! [" + req.statusText + "]");
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
	if (settings['hashengine'] != 'b64_sha1' && 
		settings['hashengine'] != 'hex_sha1') {
		alert("Unknown hashengine: " + settings['hashengine'] + ". Reverting to 'hex_sha1'");
	}

	var engine = (settings['hashengine'] == 'b64_sha1') ? b64_sha1 : hex_sha1;
	var input = m_master + ":" + resource + ":" + settings['salt'];
	var output = engine(input);

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

