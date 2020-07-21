<?php

function jdtoDate($jdtime)
{
	$dateObsGreg = jdtogregorian($jdtime + 0.5); // the php built-in function assumes that JD starts at midnight instead of noon; the 0.5 corrects for this
	$tok = strtok($dateObsGreg, "/"); // the php date format is MM/DD/YYYY, need to extract each piece
	if ($tok !== false)
	{
			$dateMonth = $tok;
			$tok = strtok("/");
			$dateDay = $tok;
			$tok = strtok("/");
			$dateYear = $tok;
	}
	// we want 0 padded numbers for month and day
	if (intval($dateMonth) < 10)
		$dateMonthDisplay = '0' + strval($dateMonth);
	else
		$dateMonthDisplay = strval($dateMonth);
	if (intval($dateDay) < 10)
		$dateDayDisplay = '0' + strval($dateDay);
	else
		$dateDayDisplay = strval($dateDay);
		
	return $dateYear . '-' . $dateMonthDisplay . '-' . $dateDayDisplay;
}

function jdtoTime($jdtime)
{
	// convert time to hours. 		
	$timeObs = fmod($jdtime * 24.0 + 12.0,24.0);
	if ($timeObs < 0)
		$timeObs += 24.0;
	// get each individual piece
	$hourObs = floor($timeObs);
	$minObs = floor(fmod($timeObs,1.0) * 60.0);
	$secObs = floor(fmod($timeObs * 60.0,1.0) * 60.0);
	// zero padding for each piece
	if (intval($hourObs) < 10)
		$hourObsDisplay = '0' + strval($hourObs);
	else
		$hourObsDisplay = strval($hourObs);
	if (intval($minObs) < 10)
		$minObsDisplay = '0' + strval($minObs);
	else
		$minObsDisplay = strval($minObs);
	if (intval($secObs) < 10)
		$secObsDisplay = '0' + strval($secObs);
	else
		$secObsDisplay = strval($secObs);
	return $hourObsDisplay . ':' . $minObsDisplay . ':' . $secObsDisplay;
}

function jdtoDateTime($jdtime)
{
	return jdtoDate($jdtime) . ' ' . jdtoTime($jdtime);
}
?>
