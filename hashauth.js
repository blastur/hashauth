var m_master = null;
var m_profile = null;

function createAutoCompleteData(profile)
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
	var data = createAutoCompleteData(m_profile);

	if (data != false) {
		AutoComplete_Create('resource', data);
	}
	document.generate.resource.focus();
}

function fetchProfile(url)
{
	var req = new XMLHttpRequest();
	req.open("GET", url, true);
 
  	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200) {	
				initProfile(req.responseText);
			} else {
				alert("Failed to fetch profile (" + req.statusText + ")");
				logout();
			}
		}	
    }
	
	req.send(null);			
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
	fetchProfile(document.login.profile.value);
	
	document.login.master.value = '';
	document.generate.password.value = '';
	document.generate.resource.value = '';

	visibility('configuration', 'none');
	visibility('generator', 'block');	

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
	if (m_profile["resource"][resource] != undefined) {
		var profile = m_profile["resource"][resource];
		
		// Only inherit unspecificed settings
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
	var engine = (settings['hashengine'] == 'b64_sha1') ? b64_sha1 : hex_sha1;
	var input = m_master + ":" + resource + ":" + settings['salt'];
	var output = engine(input);
	output = output.substr(0, settings['outputlength']);
	
	return output;
}

function generateHash()
{	
	var resource = document.generate.resource.value;
	
	// Do we know anything 
	var settings = getProfileSettings(resource);
	if (!settings) {
		alert("Resource " + resource + " is unknown!");
		return false;
	}
		
	var hash = buildHash(resource, settings);
	document.generate.password.value = hash;
	document.generate.password.select();
	document.generate.password.focus();
	
	return false;
}

