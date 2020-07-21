<?php
// We need to use sessions, so you should always start sessions using the below code.
session_start();
// If the user is not logged in redirect to the login page...
if (!isset($_SESSION['loggedin'])) {
	header('Location: index.html');
	exit();
}
else
{
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
if ($stmt = $con->prepare('SELECT date, timeUT, fists, phase, phaseimage  FROM observationsManual WHERE observerID = ?')) {
	// Bind parameters (s = string, i = int, b = blob, etc), in our case the username is a string so we use "s"
	$stmt->bind_param('s', $_SESSION['id']);
	$stmt->execute();
	// Store the result so we can check if the account exists in the database.
	$stmt->store_result();
	if ($stmt->num_rows > 0) {
		$stmt->bind_result($dateObs, $timeObs, $fistsObs, $phaseObs, $phaseImageObs);
		$stmt->fetch();
	}
}

?>


<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Home Page</title>
		<link href="style.css" rel="stylesheet" type="text/css">
		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/css/select2.css" />
	</head>
	<body class="loggedin">
		<nav class="navtop">
			<div>
				<h1>Moon Observing Project</h1>
				<a href="home.php"><i class="fas fa-home"></i>Home</a>
				<a href="profile.php"><i class="fas fa-user-circle"></i>Profile</a>
				<a href="logout.php"><i class="fas fa-sign-out-alt"></i>Logout</a>
			</div>
		</nav>
		<div class="content">
			<h2>Home Page</h2>
			<p>Welcome back, <?=$_SESSION['name']?>!</p>
			<div>
				<?php 
					echo $_SESSION['duedates'];
				?>
				<?php 
					echo $_SESSION['statistics'];
				?>
				<form action="newobservation.php" method="post" autocomplete="off">
					<p> Enter a new observation: </p><br>
					<input type="date" name="date" placeholder="MM/DD/YYYY" id="date" required>
					<input type="time" name="time" placeholder="HH:MM" id="time" required>
					<input type="number" step="0.25" name="fists" placeholder="Fists" id="fists" required>
					<select name="direction" id="direction">
						<option value="notspecified">Select Direction</option>
						<option value="left">Left / East</option>
						<option value="right">Right / West</option>
					</select>
					<input type="number" name="phase" step="0.25" placeholder="Phase Number (0 - 7.75)" id="phase" required>
					<select name="phaseimage" id="phaseimage" style="width=50px;height=50px">
						<option value="notspecified">Select Phase</option>
						<option value="new"  data-img_src="images/moonNew.png"></option>
						<option value="waxingcrescent"  data-img_src="images/moonWxC.png" alt="Waxing Crescent"></option>
						<option value="firstquarter"  data-img_src="images/moonFQ.png" alt="First Quarter"></option>
						<option value="waxinggibbous"  data-img_src="images/moonWxG.png" alt="Waxing Gibbous"></option>
						<option value="full"  data-img_src="images/moonFull.png" alt="Full Moon"></option>
						<option value="waninggibbous"  data-img_src="images/moonWnG.png" alt="Waning Gibbous"></option>
						<option value="thirdquarter"  data-img_src="images/moonTQ.png" alt="Third Quarter"></option>
						<option value="waningcrescent"  data-img_src="images/moonWnC.png" alt="Waning Crescent"></option>
					</select>
					<input type="submit" value="Submit"/>
				</form>
			</div>
			<div>
			<form action="downloadObservations.php" method="post" austocomplete="off" style="text-align:center;">
				<input type="submit" value="Download Observations as .csv file"/>
			</form>
			<?php 
				echo $_SESSION['observations'];
			?>
			</div>
		</div>
		<?php 
			echo $_SESSION['observation_errors'];
		?>
			
		<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/js/select2.js"></script>
		<script type="text/javascript">
			function custom_template(obj){
				    var data = $(obj.element).data();
				    var text = $(obj.element).text();
				    if(data && data['img_src']){
				        img_src = data['img_src'];
				        template = $("<div><img src=\"" + img_src + "\" style=\"width:100%;\"/><p style=\"font-weight: 700;font-size:14pt;text-align:center;\">" + text + "</p></div>");
				        return template;
				    }
				}
			function hideDiv(whichDiv) {
			    document.getElementById(whichDiv).style.visibility='hidden';
			}
			var options = {
				'templateSelection': custom_template,
				'templateResult': custom_template,
			}
			$('#phaseimage').select2(options);
			$('.select2-container--default .select2-selection--single').css({'height': '100px'});

		</script>
	</body>
</html>
