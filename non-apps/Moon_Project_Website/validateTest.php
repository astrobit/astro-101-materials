<?php
require_once 'validateObservation.php';
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$test =  validateManualObservation(
    9.1,
    '2020-08-06',
    '23:18:00',
    'America/Chicago',
    -8.0,
    5,
    5,
    30.039798,
    -97.80513,
    true);
print ('result = ' . sprintf('%04x',$test) . PHP_EOL);
