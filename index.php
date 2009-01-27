<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
	<head>
		<title>Auth hash</title>		
		<script type="text/javascript" src="sha1.js"></script>
		<script type="text/javascript" src="hashauth.js"></script>
		<script type="text/javascript" src="json2.js"></script>
		<script type="text/javascript" src="AutoComplete.js"></script>

		<style type="text/css">
		<!--
			body {
				font-family: Arial; 
				font-size: 12px;				
			}

			#generator {
				display: none;
			}

			.entry {
				border-style: solid;
				border-width: 1px;
				margin: 5px;
				padding: 5px;
				width: 400px;
			}

			.autocomplete {
				font-family: Tahoma;
				font-size: 8pt;
				background-color: white;
				border: 1px solid black;
				position: absolute;
				cursor: default;
				overflow: auto;
				overflow-x: hidden;
			}

			.autocomplete_item {
				padding: 1px;
				padding-left: 5px;
				color: black;
				width: 100%;
			}

			.autocomplete_item_highlighted {
				padding: 1px;
				padding-left: 5px;
				color: white;
				background-color: #0A246A;
			}
			
		-->
		</style>
	</head>

	<body onload="document.login.master.focus()">
		<div id="configuration">
			<form name="login" method="post" action="#" onsubmit="return logon()">
            	<div class="entry">
					<label for="master">Master password</label>
					<input type="password" name="master" />
            	</div>

				<div class="entry">					
					<label for="profile">Profile</label>
					<input type="text" name="profile" value="http://b.duskwood.com/startup/pass2/personal.php" />
				</div>

            	<div class="entry">
					<input type="submit" value="Login" />
            	</div>
			</form>		
		</div>

        <div id="generator">
            <form name="generate" method="post" action="#" onsubmit="return generateHash()">
		        <div class="entry">
		            <label for="resource">Resource</label>
		            <input type="text" id="resource" name="resource" />
		        </div>

		        <div class="entry">
	                <input type="submit" value="Generate" />
	                <input type="text" name="password" />
	                <input type="button" value="Logout" onclick="return logout()" />
		        </div>
            </form>
        </div>
	</body>
</html>
