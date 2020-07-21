<?php
session_start();


$config = parse_ini_file('../../config/moon_proj_config.ini'); 


// Try and connect to the database, if a connection has not been established yet
$con = mysqli_connect($config['servername'],$config['username'],$config['password'],$config['dbname']);
//$con = mysqli_connect('localhost','moonproject','7c3J0r*nO0M#0rD$s@P','moon_project');
//$con = mysqli_connect('localhost','root','yr3v0c$iDSST','moon_project');
//$con = mysqli_connect('localhost','root','colombia','moon_project');
if ( mysqli_connect_errno() ) {
	// If there is an error with the connection, stop the script and display the error.
	die ('Failed to connect to MySQL: ' . mysqli_connect_error());
}

// Now we check if the data from the login form was submitted, isset() will check if the data exists.
if ( !isset($_POST['username']) ) {
	// Could not get the data that should have been sent.
	die ('A username is required');
}

if ( !isset($_POST['password']) ) {
	// Could not get the data that should have been sent.
	die ('Please enter your password');
}

// Prepare our SQL, preparing the SQL statement will prevent SQL injection.
if ($stmt = $con->prepare('SELECT id, password, fname, lname, fistsize, timeZoneID, observesDST, latitude, longitude FROM userdata WHERE username = ?')) {
	// Bind parameters (s = string, i = int, b = blob, etc), in our case the username is a string so we use "s"
	$stmt->bind_param('s', $_POST['username']);
	$stmt->execute();
	// Store the result so we can check if the account exists in the database.
	$stmt->store_result();
}
if ($stmt->num_rows > 0) {
	$stmt->bind_result($id, $password, $fname, $lname, $fistsize, $timeZoneID, $observesDST, $latitude, $longitude);
	$stmt->fetch();
	// Account exists, now we verify the password.
	// Note: remember to use password_hash in your registration file to store the hashed passwords.
	if (password_verify($_POST['password'], $password)) {
		// Verification success! User has loggedin!
		// Create sessions so we know the user is logged in, they basically act like cookies but remember the data on the server.
		session_regenerate_id();
		$_SESSION['loggedin'] = TRUE;
		$_SESSION['name'] = $fname;
		$_SESSION['fullname'] = $fname.' '.$lname;
		$_SESSION['username'] = $_POST['username'];
		$_SESSION['fistsize'] = $fistsize;
		$_SESSION['fistsize'] = $fistsize;
		$_SESSION['timeZoneID'] = $timeZoneID;
		$_SESSION['latitude'] = $latitude;
		$_SESSION['longitude'] = $longitude;
		$_SESSION['observesDST'] = $observesDST;
		$_SESSION['id'] = $id;

		if ($stmt = $con->prepare('SELECT correction, commonReferences FROM timezones WHERE id = ?')) {
			$stmt->bind_param('s', $timeZoneID);
			$stmt->execute();
			// Store the result so we can check if the account exists in the database.
			$stmt->store_result();
			$stmt->bind_result($timeZone, $timeZoneName);
			$stmt->fetch();
			$_SESSION['timeZone'] = $timeZone;
			$_SESSION['timeZoneName'] = $timeZoneName;
		}
		header('Location: home.php');
	} else {
		echo 'Password does not match for user ' . $_POST['username'];
	}
} else {
	echo 'User' . $_POST['username'] . 'not found';
}
$stmt->close();
?>

