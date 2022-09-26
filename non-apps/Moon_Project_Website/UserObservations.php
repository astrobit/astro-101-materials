<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of UserObservations
 *
 * @author astrobit
 */
require_once 'Observation.php';

class UserObservations
{
    public array $_observations;
    public function __construct(int $i_sanitizedUserID, PDO $i_pdo)
    {
        $_observations = [];
        if (isset($i_sanitizedUserID) && !empty($i_sanitizedUserID) && 
            $i_sanitizedUserID !== null &&
            isset($i_pdo) && !empty($i_pdo) && $i_pdo !== null)
        {
            try
            {
            $result = $i_pdo->query('SELECT id, obsDateZone, obsTimeZone, '
                . 'hourAngle, hourAngleUnitsID, phase, phaseDiagram, '
                . 'latitude, longitude, timezoneID, isDST, accepted '
                . 'FROM observationRawManual '
                . "WHERE observerID = $i_sanitizedUserID ");
            }
            catch (\Exception $e)
            {
                echo $e->getMessage() . ' ' . $e->getCode();

            }
            while ($row = $result->fetch())
            {
                array_push($_observations,new Observation($row));
            }
        }
    }
}
