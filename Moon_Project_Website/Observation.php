<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Observation
 *
 * @author astrobit
 */
class Observation
{
    public int $_id;
    public DateTime $_obsZoneDateTime;
    public float $_hourAngle;
    public int $_hourAngleUnitsID;
    public float $_phase;
    public int $_phaseDiagram;
    public float $_latitude;
    public float $_longitude;
    public int $_timezoneID;
    public bool $_isDST;
    public bool $_accepted;
    public function __construct(array $i_data = null)
    {
        if (isset($i_data) && !empty($i_data) && $i_data !== null)
        {
            $this->_id = $i_data['id'];
            $this->_obsZoneDateTime = new DateTime($i_data['obsDateZone'] 
                . ' ' . $i_data['obsTimeZone']);
            $this->_hourAngle = $i_data['hourAngle'];
            $this->_hourAngleUnitsID = $i_data['hourAngleUnitsID'];
            $this->_phase = $i_data['phase'];
            $this->_phaseDiagram = $i_data['phaseDiagram'];
            $this->_latitude = $i_data['latitude'];
            $this->_longitude = $i_data['longitude'];
            $this->_timezoneID = $i_data['timezoneID'];
            $this->_isDST = $i_data['isDST'] == 1;
            $this->_accepted = $i_data['accepted'] == 1;
        }
    }
}