<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	// Load configuration as an array. Use the actual location of your configuration file
	$config = parse_ini_file('../../config/moon_proj_config.ini'); 


	$_SESSION['loggedin'] = FALSE;
	$_SESSION['name'] = $_POST['givenname'];
	$_SESSION['email'] = $_POST['email'];
	$_SESSION['username'] = $_POST['username'];
	$_SESSION['fistsize'] = $_POST['fistsize'];
	$_SESSION['generalerror'] = NULL;
	$_SESSION['usernameerror'] = NULL;
	$_SESSION['passworderror'] = NULL;
	$_SESSION['passwordcheckerror'] = NULL;
	$_SESSION['givennameerror'] = NULL;
	$_SESSION['fistsizeerror'] = NULL;
	$_SESSION['emailerror'] = NULL;
	$_noerrors = true;

	// Try and connect to the database, if a connection has not been established yet
	$con = mysqli_connect($config['servername'],$config['username'],$config['password'],$config['dbname']);
	if (mysqli_connect_errno()) {
		// If there is an error with the connection, stop the script and display the error.
		$_SESSION['generalerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">There was a problem with the connection. Please try again or contact an administrator.<br></font></p><br></div>";
		$_noerrors = false;
	}
	if ($_noerrors && $resultPermissions = $con->query('SELECT id FROM permissions WHERE name = "user"'))
	{
		if ($resultPermissions->num_rows > 0)
		{
			$row = $resultPermissions->fetch_assoc();
			$permissionsID = $row['id'];
		}
	}
	
	if ($_noerrors && (!isset($permissionsID) || empty($permissionsID)))
	{
		$_SESSION['generalerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">There was a problem retrieving user permissions. Please try again or contact an administrator.<br></font></p><br></div>";
		$_noerrors = false;
	}
	if ($_noerrors)
	{

		// Now we check if the data was submitted, isset() function will check if the data exists.
		if (!isset($_POST['username']) || empty($_POST['username'])) {
			// Could not get the data that should have been sent.
				$_SESSION['usernameerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">A user name is required.<br></font></p><br></div>";
				$_noerrors = false;
		}
		if (!isset($_POST['password']) || empty($_POST['password'])) {
			// Could not get the data that should have been sent.
				$_SESSION['passworderror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">A password is required.<br></font></p><br></div>";
				$_noerrors = false;
		}
		if (!isset($_POST['passwordcheck']) || empty($_POST['passwordcheck'])) {
			// Could not get the data that should have been sent.
				$_SESSION['passwordcheckerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">Please re-enter your password.<br></font></p><br></div>";
				$_noerrors = false;
		}
		else if ($_POST['password'] != $_POST['passwordcheck']) {
			// Could not get the data that should have been sent.
				$_SESSION['passwordcheckerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">Passwords do not match.<br></font></p><br></div>";
				$_noerrors = false;
		}
		if (!isset($_POST['givenname']) || empty($_POST['givenname'])) {
			// Could not get the data that should have been sent.
				$_SESSION['givennameerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">A given name is required.<br></font></p><br></div>";
				$_noerrors = false;
		}
		if (!isset($_POST['fistsize']) || empty($_POST['fistsize'])) {
			// Could not get the data that should have been sent.
				$_SESSION['fistsizeerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">A fist size is required.<br></font></p><br></div>";
				$_noerrors = false;
		}
		else
		{
			$fistsize = floatval($_POST['fistsize']);
			if ($fistsize < 3.0)
			{
				$_SESSION['fistsizeerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">Your fist size seems unusually small. Please check your entry and/or check your fist size again.<br></font></p><br></div>";
				$_noerrors = false;
			}
			else if ($fistsize > 6.0)
			{
				$_SESSION['fistsizeerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">Your fist size seems unusually large. Please check your entry and/or check your fist size again.<br></font></p><br></div>";
				$_noerrors = false;
			}
		}
	}
	// We need to check if the account with that username exists.
	if ($_noerrors && $stmt = $con->prepare('SELECT id FROM userdata WHERE username = ?')) {
		// Bind parameters (s = string, i = int, b = blob, etc), hash the password using the PHP password_hash function.
		$stmt->bind_param('s', $_POST['username']);
		$stmt->execute();
		$stmt->store_result();
		// Store the result so we can check if the account exists in the database.
		if ($stmt->num_rows > 0) {
			// Username already exists
			$_SESSION['usernameerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\"> Username " . $_POST['username'] . " already exists. Please choose another! <br></font></p><br></div>";
			$_noerrors = false;
		}
		$stmt->close();
	}
	if ($_noerrors && $stmt = $con->prepare('SELECT id FROM userdata WHERE email = ?')) {
		// Bind parameters (s = string, i = int, b = blob, etc), hash the password using the PHP password_hash function.
		$stmt->bind_param('s', $_POST['email']);
		$stmt->execute();
		$stmt->store_result();
		// Store the result so we can check if the account exists in the database.
		if ($stmt->num_rows > 0) {
			// email already exists
			$_SESSION['emailerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\"> This email already has an account associated with it. To reset your passord, select <a href=\"reset_password_request.php\">this</a> link.<br></font></p><br></div>";
			$_noerrors = false;
		}
		$stmt->close();
	}

	if (isset($_POST['researchconsent']))
		$researchConsent = 1;
	else
		$researchConsent = 0;
	if (isset($_POST['geoIPconsent']))
		$geoIPconsent = 1;
	else
		$geoIPconsent = 0;
	if (isset($_POST['deviceLocationConsent']))
		$deviceLocationConsent = 1;
	else
		$deviceLocationConsent = 0;
	
	if ($_noerrors)
	{
		$password = password_hash($_POST['password'], PASSWORD_DEFAULT);
		if (!isset($_POST['familyname') || empty($_POST['familyname'))
		{
			$stmt = $con->prepare('INSERT INTO userdata (username, email, emailVerified, password, givenname, fistsize, consentResearch, permissionsID, allowUseGeoIP, allowUseDevice, preferDefaultLocationOverClass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
			$stmt->bind_param('ssissdiiiii', $_POST['username'], $_POST['email'], 0, $password, $_POST['givenname'], $fistsize, $researchConsent, $permissionsID, $geoIPconsent, $deviceLocationConsent, 0);
			
			$stmt->execute();
		}
		else
		{
			$stmt = $con->prepare('INSERT INTO userdata (username, email, emailVerified, password, givenname, familyname, fistsize, consentResearch, permissionsID, allowUseGeoIP, allowUseDevice, preferDefaultLocationOverClass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
			$stmt->bind_param('ssisssdiiiii', $_POST['username'], $_POST['email'], 0, $password, $_POST['givenname'], $_POST['familyname'], $fistsize, $researchConsent, $permissionsID, $geoIPconsent, $deviceLocationConsent, 0);
			
		}
		$stmt->execute();
	}			

	if ($_noerrors)
	{
		if ($stmt = $con->prepare('SELECT id FROM userdata WHERE username = ?')) 
		{
			// Bind parameters (s = string, i = int, b = blob, etc), in our case the username is a string so we use "s"
			$stmt->bind_param('s', $_POST['username']);
			$stmt->execute();
			// Store the result so we can check if the account exists in the database.
			$stmt->store_result();
			if ($stmt->num_rows > 0)
			{
				$stmt->bind_result($id);
				$stmt->fetch();

				session_regenerate_id();
				$_SESSION['loggedin'] = TRUE;
				$_SESSION['id'] = $id;
				header('Location: home.php');
			}
			else
			{
				$_SESSION['generalerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">There was a problem adding the user. Please try again or contact an administrator.<br></font></p><br></div>";
				$_noerrors = false;
			}
			$stmt->close();
		}
	}
	$con->close();
}
?>


<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Register</title>
		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
		<link href="style.css" rel="stylesheet" type="text/css">
	</head>
	<body>
		<div class="register">
			<h1>Register</h1>
			<?php 
				echo $_SESSION['generalerror'];
			?>
			<form action="register.php" method="post" autocomplete="off">
				<label for="username">
					<i class="fas fa-user-tag"></i>
				</label>
				<input type="text" name="username" placeholder="Username" id="username" required><br>
				<?php 
					echo $_SESSION['usernameerror'];
				?>
				<label for="fname">
					<i class="fas fa-user"></i>
				</label>
				<input type="text" name="givenname" placeholder="Given Name" id="givenname" required><br>
				<?php 
					echo $_SESSION['givennameerror'];
				?>
				<label for="lname">
					<i class="fas fa-user"></i>
				</label>
				<input type="text" name="familyname" placeholder="Family Name" id="familyname"><br>
				<?php 
					echo $_SESSION['familynameerror'];
				?>
				<label for="password">
					<i class="fas fa-lock"></i>
				</label>
				<input type="password" name="password" placeholder="Password" id="password" required><br>
				<?php 
					echo $_SESSION['passworderror'];
				?>
				<label for="passwordcheck">
					<i class="fas fa-lock"></i>
				</label>
				<input type="password" name="passwordcheck" placeholder="Retype Password" id="passwordcheck" required><br>
				<?php 
					echo $_SESSION['passwordcheckerror'];
				?>
				<label for="fist size">
					<i class="fas fa-hand-rock"></i>
				</label>
				<input type="numeric" name="fistsize" placeholder="Size of your fist in degrees" id="fistsize" min="3" max="6" step="0.1"><br>
				<?php 
					echo $_SESSION['fistsizeerror'];
				?>
				<label for="email">
					<i class="fas at"></i>
				</label>
				<input type="text" name="email" placeholder="email" id="email" required><br>
				<?php 
					echo $_SESSION['emailerror'];
				?>
				<label for="researchconsent">
					<i class="fas flask"> Do you consent to use of your observational data for research purposes?
				</label>
				<input type="checkbox" name="researchconsent" id="researchconsent" value="researchconsent"><br>
				<label for="geoIPconsent">
					<i class="fas globe"> Do you wish to use your IP to determine your location?
				</label>
				<input type="checkbox" name="geoIPconsent" id="geoIPconsent" value="geoIPconsent"><br>
				<label for="deviceLocationConsent">
					<i class="fas satellite"> Do you wish to use your device location services (e.g. GPS) to determine your location?
				</label>
				<input type="checkbox" name="deviceLocationConsent" id="deviceLocationConsent" value="deviceLocationConsent"><br>
				<label for="regcode">
					<i class="fas fa-barcode"></i>
				</label>
				<input type="text" name="regcode" placeholder="Class Registration Code (optional)" id="regcode" required><br>
				<input type="submit" value="Register">
			</form>
		</div>
	</body>
</html>

