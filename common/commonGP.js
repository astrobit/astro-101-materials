
function binarySearch(sortedArray,findValue,key)
{
	var imin = 0;
	var imax = sortedArray.length - 1;
	var ret = null;
	if (sortedArray.length > 0)
	{
		var i;
		var found = false;
		do
		{
			i = Math.floor((imax + imin) / 2);
//			console.log(i + " " + imin + " " + imax)
			var	testVal;
			if (typeof key === 'undefined' || key === null)
				testVal = sortedArray[i];
			else
				testVal = sortedArray[i][key];
			if (findValue < testVal)
			{
				if (imin != i)
					imax = i;
				else
					imax = i - 1;
//				console.log("<")
			}
			else if (findValue > testVal)
			{
				if (imin != i)
					imin = i;
				else
					imin = i + 1;
//				console.log(">")
			}
			else
				found = true;
		}
		while (imin < imax && !found);
		if (found)
		{
			ret = i;
		}
	}
	return ret;
}
