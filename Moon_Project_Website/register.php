<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	// Load configuration as an array. Use the actual location of your configuration file
	$config = parse_ini_file('../../config/moon_proj_config.ini'); 
	// Try and connect to the database, if a connection has not been established yet
	$con = mysqli_connect($config['servername'],$config['username'],$config['password'],$config['dbname']);
	if (mysqli_connect_errno()) {
		// If there is an error with the connection, stop the script and display the error.
		$_SESSION['usernameerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">There was a problem with the connection. Please try again or contact an administrator.<br></font></p><br></div>";
	}
	else
	{
		$_SESSION['loggedin'] = FALSE;
		$_SESSION['name'] = $_POST['fname'];
		$_SESSION['fname'] = $_POST['fname'];
		$_SESSION['lname'] = $_POST['lname'];
		$_SESSION['fullname'] = $_POST['fname'].' '.$_POST['lname'];
		$_SESSION['email'] = $_POST['email'];
		$_SESSION['username'] = $_POST['username'];
		$_SESSION['fistsize'] = $_POST['fistsize'];
		$_noerrors = true;

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
		if (!isset($_POST['fname']) || empty($_POST['fname'])) {
			// Could not get the data that should have been sent.
				$_SESSION['fnameerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">A first name is required.<br></font></p><br></div>";
				$_noerrors = false;
		}
		if (!isset($_POST['lname']) || empty($_POST['lname'])) {
			// Could not get the data that should have been sent.
				$_SESSION['lnameerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">A last name is required.<br></font></p><br></div>";
				$_noerrors = false;
		}
		// We need to check if the account with that username exists.
		if ($_noerrors)
		{
			if ($stmt = $con->prepare('SELECT id FROM userdata WHERE username = ?')) {
				// Bind parameters (s = string, i = int, b = blob, etc), hash the password using the PHP password_hash function.
				$stmt->bind_param('s', $_POST['username']);
				$stmt->execute();
				$stmt->store_result();
				// Store the result so we can check if the account exists in the database.
				if ($stmt->num_rows > 0) {
					// Username already exists
					$_SESSION['usernameerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\"> Username " . $_POST['username'] . " already exists. Please choose another! <br></font></p><br></div>";
			;
				} else {
						if ($stmt = $con->prepare('INSERT INTO userdata (username, password, fname, lname, fistsize, email, term) VALUES (?, ?, ?, ?, ?, ?, ?)')) {
				//		if ($stmt = $con->prepare('INSERT INTO userdata (username, password) VALUES (?, ?)')) {
							// We do not want to expose passwords in our database, so hash the password and use password_verify when a user logs in.
				//			echo 'Error state (prep) ' . $stmt->$error . '  ' . $stmt->$errno . "\n";
				//			print_r($stmt->error_list);
							$password = password_hash($_POST['password'], PASSWORD_DEFAULT);
							//echo 'ph ' . $_POST['username'] . ' ' . $password . ' ' . $_POST['fname'] . ' ' . $_POST['lname'] . ' ' . $_POST['fistsize'] .  ' ' . $config['term'] . '     ';
							echo 'bining param';
							if ($stmt->bind_param('sssssss', $_POST['username'], $password, $_POST['fname'], $_POST['lname'], $_POST['fistsize'], $_POST['email'], $_POST['regcode']) )
				//			if ($stmt->bind_param('ss', $_POST['username'], $password) )
							{
				//				echo 'Error state (bind) ' . $stmt->$error . '  ' . $stmt->$errno . "\n";
				//				print_r($stmt->error_list);
								echo ' execute insert ';
								if ($stmt->execute() )
								{
									echo 'perpare select';
									if ($stmt = $con->prepare('SELECT id FROM userdata WHERE username = ?')) {
										// Bind parameters (s = string, i = int, b = blob, etc), in our case the username is a string so we use "s"
										$stmt->bind_param('s', $_POST['username']);
										$stmt->execute();
										// Store the result so we can check if the account exists in the database.
										$stmt->store_result();
									}
									echo 'testing if new user exists';
									if ($stmt->num_rows > 0) {
										$stmt->bind_result($id);
										$stmt->fetch();

										session_regenerate_id();
										$_SESSION['loggedin'] = TRUE;
										$_SESSION['name'] = $_POST['fname'];
										$_SESSION['fullname'] = $_POST['fname'].' '.$_POST['lname'];
										$_SESSION['username'] = $_POST['username'];
										$_SESSION['fistsize'] = $_POST['fistsize'];
										$_SESSION['id'] = $id;
										$_SESSION['usernameerror'] = NULL;
										header('Location: home.php');
										exit;
									} else {
										echo 'There was a problem adding the user. ' . $stmt->$error . '  ' . $stmt->$errno . "\n";
										print_r($stmt->error_list);
									}
								}
								else
								{
										echo 'There was a problem inserting. ' . $stmt->$error . '  ' . $stmt->$errno . "\n";
										print_r($stmt->error_list);
								}							
							} else {
								echo 'There was a problem binding. ' . $stmt->$error;
							}
						} else {
							// Something is wrong with the sql statement, check to make sure accounts table exists with all 3 fields.
										echo 'There was a problem preparing. ' . $stmt->$error . '  ' . $stmt->$errno . "\n";
										print_r($stmt->error_list);
						}
					}
				}
			}
			$stmt->close();
		} else {
			// Something is wrong with the sql statement, check to make sure accounts table exists with all 3 fields.
			$_SESSION['usernameerror'] = "<div><br><label><i class=\"fas fa-exclamation-triangle\"></i></label><p> <font color=\"red\">There was a problem with the connection. Please try again or contact an administrator.<br></font></p><br></div>";
		}
		$con->close();
	} else {
		$_SESSION['usernameerror'] = "";
	}
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
				<input type="text" name="fname" placeholder="First Name" id="fname" required><br>
				<?php 
					echo $_SESSION['fnameerror'];
				?>
				<label for="lname">
					<i class="fas fa-user"></i>
				</label>
				<input type="text" name="lname" placeholder="Last Name" id="lname" required><br>
				<?php 
					echo $_SESSION['lnameerror'];
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
				<input type="text" name="email" placeholder="email" id="email" required><br>
				<?php 
					echo $_SESSION['emailerror'];
				?>
				<label for="researchconsent">
					<i class="fas flask"> Do you consent to use of your observational data for research purposes?
				</label>
				<input type="checkbox" name="researchconsent" id="researchconsent"><br>
				<label for="regcode">
					<i class="fas fa-barcode"></i>
				</label>
				<input type="text" name="regcode" placeholder="Class Registration Code (optional)" id="regcode" required><br>
				<?php 
					echo $_SESSION['regcodeerror'];
				?>
				<input type="submit" value="Register">
			</form>
		</div>
	</body>
</html>

