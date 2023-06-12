/////////////////////////////////////////////////////////////////
//
// 
// 2-dimensional linear fitting using least squares
//
//
/////////////////////////////////////////////////////////////////
//
// Requires: none
//
// CHANGE LOG
// 
// 2023-Jun-12
// Additions
// - initial creation

const LLS =
{
	_type: "LLSinstance",
/////////////////////////////////////////////////////////////////////////
//
//  function generateInstance
//
// generates an instance of an LLS container and performs the  analysis.
// inputs: vecX (Array) - an array containing the x-values
//			vecY(Array) - an array containing the y-values
// output: (object) - an instance containing the results of the analysis
//                        use the LLS functions to access the data in the instance
//
/////////////////////////////////////////////////////////////////////////
	generateInstance: function(vecX, vecY)
	{
		let ret = null;
		if (vecX.length == vecY.length && vecX.length > 1)
		{
			ret = {};
			ret._type = "LLS";
			Object.defineProperty(ret, "_type", {writable: false});

			let sY = 0;
			let sY2 = 0;
			let sX = 0;
			let sX2 = 0;
			let sXY = 0;
			let sOy = 0;
			let invN = 1.0 / vecX.length;
			for (let idxLcl = 0; idxLcl < vecX.length; idxLcl++)
			{
				sY += vecY[idxLcl];
				sY2 += vecY[idxLcl] * vecY[idxLcl];
				sX += vecX[idxLcl];
				sX2 += vecX[idxLcl] * vecX[idxLcl];
				sXY += vecX[idxLcl] * vecY[idxLcl];
			}
			ret._count = vecX.length;
			const invDelta = 1.0 / (vecX.length * sX2 - sX * sX);
			ret._m = (vecX.length * sXY - sX * sY) * invDelta;
			ret._b = (sX2 * sY - sX * sXY) * invDelta;
			const sigmaSq = (sY2 + ret._count * ret._b * ret._b + ret._m * ret._m * sX2 - 2 * ret._b * sY - 2 * ret._m * sXY + 2 * ret._m * ret._b * sX) / (ret._count  - 1);
			ret._sigma = Math.sqrt(sigmaSq);
			let sOmEoE = 0;
			for (let idxLcl = 0; idxLcl < vecX.length; idxLcl++)
			{
				let E = ret._m * vecX[idxLcl] + ret._b;
				let d = vecY[idxLcl] - E;
				sOmEoE += d * d / (E * E);
			}
			ret._chiSq = sOmEoE;
			if (vecX.length > 2)
			{
				for (idxLcl = 0; idxLcl < vecX.length; idxLcl++)
				{
					const err = vecY[idxLcl] - ret._b - ret._m * vecX[idxLcl];
					sOy += err * err;
				}
				ret._oy = Math.sqrt(sOy / (vecX.length - 2.0));
				ret._ob = Math.sqrt(sX2 * invDelta) * ret._oy;
				ret._om = Math.sqrt(vecX.length * invDelta) * ret._oy;
				ret._chiSqDOF = ret._chiSq / (vecX.length - 2);
			}
			else
			{
				ret._oy = 0;
				ret._ob = 0;
				ret._om = 0;
				ret._chiSqDOF = 0;
			}
		}
		else if(vecX.length != vecY.length)
			console.log('LLS constructed with vectors of differing lengths');
//		else
//			console.log('LLS cannot be run with 0 or 1 data points');
		Object.seal(ret);
		return ret;
	},
/////////////////////////////////////////////////////////////////////////
//
//  function count
//
// returns the number of data points used in the analysis
// inputs: instance (object) - an LLS instance genreated using generateInstance
// output: (number) - the number of data points used in the analysis
//
/////////////////////////////////////////////////////////////////////////
	count: function(instance) {return instance._count;},
/////////////////////////////////////////////////////////////////////////
//
//  function slope
//
// returns the slope found in the analysis
// inputs: instance (object) - an LLS instance genreated using generateInstance
// output: (number) - the slope found in the analysis
//
/////////////////////////////////////////////////////////////////////////
	slope: function(instance) {return instance._m;},
/////////////////////////////////////////////////////////////////////////
//
//  function intercept
//
// returns the intercept found in the analysis
// inputs: instance (object) - an LLS instance genreated using generateInstance
// output: (number) - the intercept found in the analysis
//
/////////////////////////////////////////////////////////////////////////
	intercept: function(instance) {return instance._b;},
/////////////////////////////////////////////////////////////////////////
//
//  function slope_uncertainty
//
// returns the uncertainty of the slope found in the analysis
// inputs: instance (object) - an LLS instance genreated using generateInstance
// output: (number) - the uncertainty of the slope found in the analysis
//
/////////////////////////////////////////////////////////////////////////
	slope_uncertainty: function (instance) {return instance._om;},
/////////////////////////////////////////////////////////////////////////
//
//  function intercept_uncertainty
//
// returns the uncertainty of the intercept found in the analysis
// inputs: instance (object) - an LLS instance genreated using generateInstance
// output: (number) - the uncertainty of the intercept found in the analysis
//
/////////////////////////////////////////////////////////////////////////
	intercept_uncertainty: function (instance) {return instance._ob;},
/////////////////////////////////////////////////////////////////////////
//
//  function chi_squared
//
// returns the Pearson chi-squared from the analysis
// inputs: instance (object) - an LLS instance genreated using generateInstance
// output: (number) - the Pearson chi-squared from the analysis
//
/////////////////////////////////////////////////////////////////////////
	chi_squared: function(instance) {return instance._chiSq;},
/////////////////////////////////////////////////////////////////////////
//
//  function y
//
// returns the y value for a given x based on the analysis
// inputs: instance (object) - an LLS instance genreated using generateInstance
//         x (number) - the value of x at which to evaluate the line
// output: (number) - the y value at x based on the analysis
//
/////////////////////////////////////////////////////////////////////////
	y: function(instance,x)
	{
		return instance._m * x + instance._b;
	},
/////////////////////////////////////////////////////////////////////////
//
//  function oy
//
// returns the uncertainty in the y value for a given x based on the analysis
// inputs: instance (object) - an LLS instance genreated using generateInstance
//         x (number) - the value of x at which to evaluate the line
// output: (number) - the uncertainty in the y value at x based on the analysis
//
/////////////////////////////////////////////////////////////////////////
	oy: function (instance,x)
	{
		return Math.sqrt(instance._ob * instance._ob + instance._om * instance._om * x * x);
	},
	
}
Object.freeze(LLS); // freeze the LLS factory to prevent changes

const LLSdatasetContainer = {
	_type: "LLSdatasetContainer",
/////////////////////////////////////////////////////////////////////////
//
//  function generateInstance
//
// generates an instance of an LLSdatasetContainer
// inputs: none
// output: (object) - an instance containing the a container for data for LLS analysis
//                        use the LLSdatasetContainer functions to access the data in the instance
//
/////////////////////////////////////////////////////////////////////////
	generateInstance: function()
	{
		let ret ={_type: LLSdatasetContainer._type, _x: new Array(), _y: new Array()};
		Object.defineProperty(ret, "_type", {writable: false});
		switch (arguments.length)
		{
		case 1:
			if (LLSdatasetContainer.isInstance(arguments[0]))
			{
				for (let i in arguments[0]._x)
				{
					ret._x.push(arguments[0]._x[i]);
					ret._y.push(arguments[0]._y[i]);
				}
			}
			break;
		case 2:
			if (typeof arguments[0] == "object" && arguments[0] instanceof Array &&
				typeof arguments[1] == "object" && arguments[1] instanceof Array &&
				arguments[0].length == arguments[1].length)
			{
				for (let i in arguments[0]._x)
				{
					ret._x.push(arguments[0][i]);
					ret._y.push(arguments[1][i]);
				}
			}
			break;
		default:
			break;
		}
		Object.seal(ret);
		return ret;
	},
	
/////////////////////////////////////////////////////////////////////////
//
//  function isInstance
//
// tests to confirm that the input instance is in fact a LLSdatasetContainer instance 
// inputs: instance (object) - an instance to test
// output: (boolean) - true if the object is a LLSdatasetContainer instance
//
/////////////////////////////////////////////////////////////////////////
	isInstance: function(instance)
	{
		return (typeof instance == 'object' && "_type" in instance && instance._type == LLSdatasetContainer._type)	
	},
/////////////////////////////////////////////////////////////////////////
//
//  function add
//
// adds an x and y value to a LLSdatasetContainer instance
// inputs: instance (object) - an instance to add the values to
//         x (number) - the x value to add
//         y (number) - the y value to add
// output: none
//
/////////////////////////////////////////////////////////////////////////
	add: function(instance,x,y)
	{
		if (LLSdatasetContainer.isInstance(instance))
		{
			instance._x.push(x);
			instance._y.push(y);
		}
	},
/////////////////////////////////////////////////////////////////////////
//
//  function clear
//
// removes all data from a LLSdatasetContainer instance
// inputs: instance (object) - an instance to clear
// output: none
//
/////////////////////////////////////////////////////////////////////////
	clear: function (instance)
	{
		if (LLSdatasetContainer.isInstance(instance))
		{
			instance._x = new Array();
			instance._y = new Array();
		}
	},
/////////////////////////////////////////////////////////////////////////
//
//  function get
//
// returns an object containing an x-y pair at a given point in a
// LLSdatasetContainer instance
// inputs: instance (object) - the LLSdatasetContainer instance from which to 
//                              retreive the data
//         index (number) - the position within the data set to retreive the pair
// output: (object) - the data pair at the requested location, or null if the location or instance is invalid
//              keys:  x (number) - the x value
//                     y (number) - the y value
//
/////////////////////////////////////////////////////////////////////////
	get: function(instance,index)
	{
		return LLSdatasetContainer.isInstance(instance) && instance._x.length > index && index >= 0? {x: instance._x[index], y: instance._y[index]} : null;
	},
/////////////////////////////////////////////////////////////////////////
//
//  function count
//
// returns the number of x-y pairs in the instance
// inputs: instance (object) - an instance to clear
// output: (number) the number of x-y pairs in the instance, or 0 if not a valid
//                  instance
//
/////////////////////////////////////////////////////////////////////////
	count: function(instance)
	{
		return LLSdatasetContainer.isInstance(instance) ? instance._x.length : 0;
	},
/////////////////////////////////////////////////////////////////////////
//
//  function set
//
// updates an x-y data pair in an LLSdatasetContainer instance
// inputs: instance (object) - an instance to add the values to
//         index (number) - the index at which to modify the values
//         x (number) - the new x value
//         y (number) - the new y value
// output: none
//
/////////////////////////////////////////////////////////////////////////
	set: function(instance,index,x,y)
	{
		if (LLSdatasetContainer.isInstance(instance) && index >= 0 && index < instance._x.length)
		{
			instance._x[index] = x;
			instance._y[index] = y;
		}
	},
/////////////////////////////////////////////////////////////////////////
//
//  function performLLS
//
// returns the an LLS instance with results of a linear least squares analysis
//  of the data within the LLSdatasetContainer instance
// inputs: instance (object) - an instance to clear
// output: (object) an LLS instance with the results of the analysis
//
/////////////////////////////////////////////////////////////////////////
	performLLS: function(instance)
	{
		return (LLSdatasetContainer.isInstance(instance)) ? LLS.generateInstance(instance._x,instance._y): null;
	},
}
Object.freeze(LLSdatasetContainer); // freeze the LLS factory to prevent changes

