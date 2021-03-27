<?php

/**
 * Description of ClassInfo
 *
 * @author Brian W. Mulligan
 */
class ClassInfo
{
    public int $_ID;
    public string $_description;
    public int $_role;
    public string $_start;
    public string $_end;
    public bool $_isOwner;

    public function __construct(int $i_id = null, string $i_description = null, int $i_role = null, string $i_startDate = null, string $i_endDate = null, bool $i_isOwner = null)
    {
        if (isset($i_id) && !empty($i_id) && $i_id !== null)
        {
            $this->_ID = $i_id;
        }
        if (isset($i_description) && !empty($i_description) && $i_description !== null)
        {
            $this->_description = $i_description;
        }
        if (isset($i_role) && !empty($i_role) && $i_role !== null)
        {
            $this->_role= $i_role;
        }
        if (isset($i_startDate) && !empty($i_startDate) && $i_startDate !== null)
        {
            $this->_start = $i_startDate;
        }
        if (isset($i_endDate) && !empty($i_endDate) && $i_endDate !== null)
        {
            $this->_end = $i_endDate;
        }
        if (isset($i_isOwner) && !empty($i_isOwner) && $i_isOwner !== null)
        {
            $this->_isOwner = $i_isOwner;
        }
    }
}
