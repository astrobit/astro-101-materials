"use strict"
/////////////////////////////////////////////////////////////////
//
// 
// Linear algebra routines for 3-d space
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


/////////////////////////////////////////////////////////////////////////
//
//  class Coordinates
//
// Coordinates is a class used to access the coordinates within Vector instance
//
/////////////////////////////////////////////////////////////////////////

class Coordinates
{
	#instance;
	#type;
/////////////////////////////////////////////////////////////////////////
//
//  function #updatePolar (private member)
//
// this function updates the polar coordinates of an instance
// inputs: none
// outputs: none (modified internal data within the Vector instance)
//
/////////////////////////////////////////////////////////////////////////
	#updatePolar()
	{
		if (this.#instance._update > this.#instance._lastUpdate)
		{
			this.#instance._dataPolar[0] = LinAlg.magnitude(this.#instance);
			this.#instance._dataPolar[1] = Math.atan2(this.#instance._data[1],this.#instance._data[0]);
			this.#instance._dataPolar[2] = Math.asin(this.#instance._data[2] / this.#instance._dataPolar[0]);
			this.#instance._lastUpdate = Date.now();
		}
	}
/////////////////////////////////////////////////////////////////////////
//
//  function #updateRectilinear (private member)
//
// this function updates the rectilinear coordinates of an instance
// inputs: none
// outputs: none (modified internal data within the Vector instance)
//
/////////////////////////////////////////////////////////////////////////
	#updateRectilinear()
	{
		if (this.#instance._update > this.#instance._lastUpdate)
		{
			this.#instance._data[0] = this.#instance._dataPolar[0] * Math.cos(this.#instance._dataPolar[1]) * Math.cos(this.#instance._dataPolar[2]);
			this.#instance._data[1] = this.#instance._dataPolar[0] * Math.sin(this.#instance._dataPolar[1]) * Math.cos(this.#instance._dataPolar[2]);
			this.#instance._data[2] = this.#instance._dataPolar[0] * Math.sin(this.#instance._dataPolar[2]);
			this.#instance._update = Date.now();
			this.#instance._lastUpdate = Date.now();
		}
	}
/////////////////////////////////////////////////////////////////////////
//
//  constructor
//
// this function creates a Coordinates instance
// inputs: instance (object) - a Vector instance
// outputs: none
//
/////////////////////////////////////////////////////////////////////////
	constructor(instance)
	{
		this.#type = "Coordinates";
//		Object.defineProperty(this, "#type", {writable: false});
		this.#instance = instance;
//		Object.defineProperty(this, "#instance", {writable: false});
		this.#updatePolar();
	}
/////////////////////////////////////////////////////////////////////////
//
//  get theta
//
// returns the spherical coordinate theta in the range [0,2π)
// inputs: none
// outputs: the spherical coordinate theta
//
/////////////////////////////////////////////////////////////////////////
	get theta()
	{
		this.#updatePolar();
		return this.#instance._dataPolar[1];
	}
/////////////////////////////////////////////////////////////////////////
//
//  get r
//
// returns the spherical coordinate r, equal to the magnitude of the vector
// inputs: none
// outputs: the magniutde of the vector
//
/////////////////////////////////////////////////////////////////////////
	get r()
	{
		this.#updatePolar();
		return this.#instance._dataPolar[0];
	}
/////////////////////////////////////////////////////////////////////////
//
//  get radius
//
// returns the spherical coordinate r, equal to the magnitude of the vector
// inputs: none
// outputs: the magniutde of the vector
//
/////////////////////////////////////////////////////////////////////////
	get radius()
	{
		return this.r;
	}
/////////////////////////////////////////////////////////////////////////
//
//  get phi
//
// returns the spherical coordinate phi in the range [-π,π)
// inputs: none
// outputs: the angle phi
//
/////////////////////////////////////////////////////////////////////////
	get phi()
	{
		this.#updatePolar();
		return this.#instance._dataPolar[2];
	}
/////////////////////////////////////////////////////////////////////////
//
//  set theta
//
// sets the spherical coordinate theta in the range [0,2π)
// inputs: (number) the new theta value
// outputs: the new spherical coordinate theta
//
/////////////////////////////////////////////////////////////////////////
	set theta(value)
	{
		this.#updatePolar();
		this.#instance._dataPolar[1] = value;
		this.#updateRectilinear();
		return this.#instance._dataPolar[1];
	}
/////////////////////////////////////////////////////////////////////////
//
//  set r
//
// sets the spherical coordinate r in the range [0,2π)
// inputs: (number) the new r value
// outputs: the new spherical coordinate r
//
/////////////////////////////////////////////////////////////////////////
	set r(value)
	{
		this.#updatePolar();
		this.#instance._dataPolar[0] = value;
		this.#updateRectilinear();
		return this.#instance._dataPolar[0];
	}
/////////////////////////////////////////////////////////////////////////
//
//  set radius
//
// sets the spherical coordinate r in the range [0,2π)
// inputs: (number) the new r value
// outputs: the new spherical coordinate r
//
/////////////////////////////////////////////////////////////////////////
	set radius(value)
	{
		return this.r = value;
	}
/////////////////////////////////////////////////////////////////////////
//
//  set phi
//
// sets the spherical coordinate phi in the range [-π,π)
// inputs: (number) the new phi value
// outputs: the new spherical coordinate phi
//
/////////////////////////////////////////////////////////////////////////
	set phi(value)
	{
		this.#updatePolar();
		this.#instance._dataPolar[2] = value;
		this.#updateRectilinear();
		return this.#instance._dataPolar[2];
	}
/////////////////////////////////////////////////////////////////////////
//
//  get x
//
// returns the rectilinear coordinate x
// inputs: none
// outputs: the x value of the Vector
//
/////////////////////////////////////////////////////////////////////////
	get x()
	{
		return this.#instance._data[0];
	}
/////////////////////////////////////////////////////////////////////////
//
//  set x
//
// sets the rectlinear coordinate x
// inputs: (number) the new x value
// outputs: the new rectilinear coordinate x
//
/////////////////////////////////////////////////////////////////////////
	set x(value)
	{
		this.#instance._data[0] = value;
		this.#instance._update = Date.now();
		return this.#instance._data[0];
	}
/////////////////////////////////////////////////////////////////////////
//
//  get y
//
// returns the rectilinear coordinate y
// inputs: none
// outputs: the y value of the Vector
//
/////////////////////////////////////////////////////////////////////////
	get y()
	{
		return this.#instance._data[1];
	}
/////////////////////////////////////////////////////////////////////////
//
//  set y
//
// sets the rectlinear coordinate y
// inputs: (number) the new y value
// outputs: the new rectilinear coordinate y
//
/////////////////////////////////////////////////////////////////////////
	set y(value)
	{
		this.#instance._data[1] = value;
		this.#instance._update = Date.now();
		return this.#instance._data[1];
	}
/////////////////////////////////////////////////////////////////////////
//
//  get z
//
// returns the rectilinear coordinate z
// inputs: none
// outputs: the z value of the Vector
//
/////////////////////////////////////////////////////////////////////////
	get z()
	{
		return this.#instance._data[2];
	}
/////////////////////////////////////////////////////////////////////////
//
//  set z
//
// sets the rectlinear coordinate z
// inputs: (number) the new z value
// outputs: the new rectilinear coordinate z
//
/////////////////////////////////////////////////////////////////////////
	set z(value)
	{
		this.#instance._data[2] = value;
		this.#instance._update = Date.now();
		return this.#instance._data[2];
	}
/////////////////////////////////////////////////////////////////////////
//
//  get instance
//
// returns the instance of the Vector
// inputs: none
// outputs: (object)  - the Vector instance that this coordinate is tied to
//
/////////////////////////////////////////////////////////////////////////
	get instance()
	{
		return this.#instance;
	}
}

const LinAlg = {
/////////////////////////////////////////////////////////////////////////
//
//  realizeCoordinates
//
// returns the instance of the Coordinates class for the specified Vector instance
// inputs: instance (object) - a Vector instance
// outputs: (object)  - an instance of the Coordinates class for the Vector instance
//
/////////////////////////////////////////////////////////////////////////
realizeCoordinates: function(instance)
{
	let ret = null;
	if (LinAlg.isVector(instance))
	{
		ret = new Coordinates(instance);
	}
	Object.seal(ret);
	return ret;
},
/////////////////////////////////////////////////////////////////////////
//
//  generateVector
//
// returns the instance of a Vector 
// inputs: the inputs may be one of the following:
//     {
//         (Vector instance) - an instance of a vector to copy
//		}
//      {
//          (number) - the x value to assign to the new vector instance
//          (number) - the y value to assign to the new vector instance; if not specified, then y will be 0
//          (number) - the z value to assign to the new vector instance; if not specified, then z will be 0
//      }
//      { 
//           (Array) - an array of length 1 or more; the values will be assigned to x, y, and z; if there are less than three entries in the array, z and y will be assigned 0
//      }
//      {
//           (Object) with keys "_x", "_y", "_z" or "x", "y", and "z"
//                    the values will be assigned to x, y, and z, respectively, or 0 if a key doesn't exist
//      }
//      {
//			none - the vector will be initialize or 0,0,0
//      }
// outputs: (object)  - an instance of the Vector
//
/////////////////////////////////////////////////////////////////////////
generateVector: function()
{
	let ret = {};
	ret.__type = "VectorAbstract";
	Object.defineProperty(ret, "__type", {writable: false});
	ret._data = new Array(3);
//		Object.defineProperty(this, "__type", {value: "VectorAbstract", writable: false});
	if (arguments.length == 1)
	{
		if (arguments[0] instanceof Object)
		{
			if (arguments[0] instanceof Array)
			{
				ret._data[0] = (arguments[0].length > 0) ? arguments[0][0] : 0;
				ret._data[1] = (arguments[0].length > 1) ? arguments[0][1] : 0;
				ret._data[2] = (arguments[0].length > 2) ? arguments[0][2] : 0;
			}
			else if (("__type" in arguments[0] && arguments[0].__type == "VectorAbstract") ||
					("_data" in arguments[0] && arguments[0]._data instanceof Array))
			{
				ret._data[0] = arguments[0]._data[0];
				ret._data[1] = arguments[0]._data[1];
				ret._data[2] = arguments[0]._data[2];
			}
			else
			{
				ret._data[0] = ("_x" in arguments[0] && typeof arguments[0]._x  == "number") ? arguments[0]._x : ("x" in arguments[0] && typeof arguments[0].x  == "number") ? arguments[0].x : 0;
				ret._data[1] = ("_y" in arguments[0] && typeof arguments[0]._y  == "number") ? arguments[0]._y : ("y" in arguments[0] && typeof arguments[0].y  == "number") ? arguments[0].y : 0;
				ret._data[2] = ("_z" in arguments[0] && typeof arguments[0]._z  == "number") ? arguments[0]._z : ("z" in arguments[0] && typeof arguments[0].z  == "number") ? arguments[0].z : 0;
			}
		}
		else
		{
			ret._data[0] = (arguments[0]  == "number") ? arguments[0] : 0;
			ret._data[1] = 0;
			ret._data[2] = 0;
		}
	}
	else
	{
		ret._data[0] = (arguments.length > 0 && typeof arguments[0]  == "number") ? arguments[0] : 0;
		ret._data[1] = (arguments.length > 1 && typeof arguments[1]  == "number") ? arguments[1] : 0;
		ret._data[2] = (arguments.length > 2 && typeof arguments[2]  == "number") ? arguments[2] : 0;
	}
	ret._dataPolar = new Array(3);
	ret._update = Date.now();
	ret._lastUpdate = ret._update - 1;
	Object.seal(ret);
	return ret;
},
/////////////////////////////////////////////////////////////////////////
//
//  generateMatrix
//
// returns the instance of a 3x3 matrix 
// inputs: the inputs may be one of the following:
//     {
//         (Matrix instance) - an instance of a matrix to copy
//		}
//      {
//          (number) - the value to assign to [0,0]
//          (number) - the value to assign in [0,1] (column 0, row 1)
//          (number) - the value to assign in [0,2]
//          (number) - the value to assign to [1,0] (column 1, row 0)
//          (number) - the value to assign in [1,1] 
//          (number) - the value to assign in [1,2]
//          (number) - the value to assign to [2,0]
//          (number) - the value to assign in [2,1] 
//          (number) - the value to assign in [2,2]
//      }
//      { 
//           (Array) - an array of length 9; the values will be assigned in columns, then rows
//      }
//      {
//           (Vector instance) - the first column to assign to the matrix
//           (Vector instance) - the second column to assign to the matrix
//           (Vector instance) - the third column to assign to the matrix
//      }
//      {
//			none - the matrix will be initialize as the identity matrix
//      }
// outputs: (object)  - an instance of the matrix
//
/////////////////////////////////////////////////////////////////////////
generateMatrix: function()
{
	let ret = {};
	ret.__type = "MatrixAbstract"
	Object.defineProperty(ret, "__type", {writable: false});
	ret._data = new Array(3);
	let loadSuccess = false;
	if (arguments.length == 1)
	{
		if (arguments[0] instanceof Array && arguments[0].length == 9 &&
			typeof arguments[0][0] == "number" && typeof arguments[0][1]  == "number" && typeof arguments[0][2]  == "number" &&
			typeof arguments[0][3]  == "number" && typeof arguments[0][4]  == "number" && typeof arguments[0][5]  == "number" &&
			typeof arguments[0][6]  == "number" && typeof arguments[0][7]  == "number" && typeof arguments[0][8]  == "number")
		{
			ret._data[0] = LinAlg.generateVector(arguments[0][0],arguments[0][1],arguments[0][2]);
			ret._data[1] = LinAlg.generateVector(arguments[0][3],arguments[0][4],arguments[0][5]);
			ret._data[2] = LinAlg.generateVector(arguments[0][6],arguments[0][7],arguments[0][8]);
			loadSuccess = true;
		}
		else if (arguments[0] instanceof Object &&
			(("__type" in arguments[0] && arguments[0].__type == "MatrixAbstract") ||
				("data" in arguments[0] && arguments[0].data instanceof Array && arguments[0].length == 3)) &&
			("__type" in arguments[0]._data[0] && arguments[0]._data[0].__type == "VectorAbstract") &&
			("__type" in arguments[0]._data[1] && arguments[0]._data[1].__type == "VectorAbstract") &&
			("__type" in arguments[0]._data[2] && arguments[0]._data[2].__type == "VectorAbstract"))
		{
			ret._data[0] = LinAlg.generateVector(arguments[0]._data[0]);
			ret._data[1] = LinAlg.generateVector(arguments[0]._data[1]);
			ret._data[2] = LinAlg.generateVector(arguments[0]._data[2]);
			loadSuccess = true;
		}
	}
	else if (arguments.length == 3)
	{
		if (((arguments[0] instanceof Array && arguments[0].length == 3) || (arguments[0] instanceof Object && "__type" in arguments[0] && arguments[0].__type == "VectorAbstract")) &&
			((arguments[1] instanceof Array && arguments[1].length == 3) || (arguments[1] instanceof Object && "__type" in arguments[1] && arguments[1].__type == "VectorAbstract")) &&
			((arguments[2] instanceof Array && arguments[2].length == 3) || (arguments[2] instanceof Object && "__type" in arguments[2] && arguments[2].__type == "VectorAbstract")))
		{
			ret._data[0] = LinAlg.generateVector(arguments[0]);
			ret._data[1] = LinAlg.generateVector(arguments[1]);
			ret._data[2] = LinAlg.generateVector(arguments[2]);
			loadSuccess = true;
		}
	}
	else if (arguments.length == 9)
	{
		if (typeof arguments[0] == "number" && typeof arguments[1]  == "number" && typeof arguments[2]  == "number" &&
			typeof arguments[3]  == "number" && typeof arguments[4]  == "number" && typeof arguments[5]  == "number" &&
			typeof arguments[6]  == "number" && typeof arguments[7]  == "number" && typeof arguments[8]  == "number")
		{
			ret._data[0] = LinAlg.generateVector(arguments[0],arguments[1],arguments[2]);
			ret._data[1] = LinAlg.generateVector(arguments[3],arguments[4],arguments[5]);
			ret._data[2] = LinAlg.generateVector(arguments[6],arguments[7],arguments[8]);
			loadSuccess = true;
		}
	}
	if (!loadSuccess)
	{
		ret._data[0] = LinAlg.generateVector(1,0,0);
		ret._data[1] = LinAlg.generateVector(0,1,0);
		ret._data[2] = LinAlg.generateVector(0,0,1);
	}
	ret._update = Date.now();
	Object.seal(ret);
	return ret;
},
TaitBryan: "Tait-Bryan",
Euler: "Euler",
/////////////////////////////////////////////////////////////////////////
//
//  generateRotationMatrix
//
// returns the instance of a 3x3 matrix with rotation 
// inputs: the inputs may be one of the following:
//      {
//            (Vector instance) - a vector specifying the rotation axis
//            (number) - the angle around which to rotate (in radians) about the rotation axis
//      }
//      {
//            (number) - the angle around which to rotate (in radians) about the rotation axis
//            (Vector instance) - a vector specifying the rotation axis
//      }
//      {
//            (string) - rotation convention, either LinAlg.TaitBryan or LinAlg.Euler
//            (number) - the first angle (alpha) in the specified convention
//            (number) - the second angle (beta) in the specified convention
//            (number) - the third angle (gamma) in the specified convention
//      }
// output: a Matrix instance containing the requested rotation
//
/////////////////////////////////////////////////////////////////////////

generateRotationMatrix: function()
{
	let ret;
	if (arguments.length == 2 &&
		((LinAlg.isVector(arguments[0]) && typeof arguments[1] == "number") ||
		(LinAlg.isVector(arguments[1]) && typeof arguments[0] == "number")))
	{
		const arg1number = typeof arguments[1] == "number";
		const cosTheta = Math.cos(arg1number ? arguments[1] : arguments[0]);
		const sinTheta = Math.sin(arg1number ? arguments[1] : arguments[0]);
		const oneMinusCosTheta = 1.0 - cosTheta;
		const ux = arg1number ? arguments[0]._data[0] : arguments[1]._data[0];
		const uy = arg1number ? arguments[0]._data[1] : arguments[1]._data[1];
		const uz = arg1number ? arguments[0]._data[2] : arguments[1]._data[2];
		//TODO: untested
		ret = LinAlg.generateMatrix(
			cosTheta + ux * ux * oneMinusCosTheta,
			ux * uy * oneMinusCosTheta + uz * sinTheta,
			ux * uz * oneMinusCosTheta - uy * sinTheta,
			
			ux * uy * oneMinusCosTheta - uz * sinTheta,
			cosTheta + uy * uy * oneMinusCosTheta,
			uy * uz * oneMinusCosTheta + ux * sinTheta,
			
			ux * uz * oneMinusCosTheta + uy * sinTheta,
			uy * uz * oneMinusCosTheta - ux * sinTheta,
			cosTheta + uz * uz * oneMinusCosTheta
		);
	}
	else if (arguments.length == 4 &&
		(arguments[0] == LinAlg.TaitBryan || arguments[0] == LinAlg.Euler) &&
		typeof arguments[1] == "number" && 
		typeof arguments[2] == "number" && 
		typeof arguments[3] == "number")
	{
		const alpha = (arguments[0] == LinAlg.TaitBryan) ? arguments[0] : arguments[2];
		const beta = arguments[1];
		const gamma = (arguments[0] == LinAlg.TaitBryan) ? arguments[2] : arguments[0];
		
		const cosAlpha = Math.cos(alpha);
		const cosBeta = Math.cos(beta);
		const cosGamma = Math.cos(gamma);
		const sinAlpha = Math.sin(alpha);
		const sinBeta = Math.sin(beta);
		const sinGamma = Math.sin(gamma);
		
		//TODO: untested
		ret = LinAlg.generateMatrix(
			cosAlpha * cosBeta,
			sinAlpha * cosBeta,
			-sinBeta,
			
			cosAlpha * sinBeta * sinGamma - sinAlpha * cosGamma,
			sinAlpha * sinBeta * sinGamma + cosAlpha * cosGamma,
			cosBeta * sinGamma,
			
			cosAlpha * sinBeta * cosGamma + sinAlpha * sinGamma,
			sinAlpha * sinBeta * cosGamma - cosAlpha * sinGamma,
			cosBeta * cosGamma
		);		 
	}
	else
	{
		console.error("LinAlg.generateRotationMatrix called with incorrect arguments. Must be either (vector instance, angle), (angle, vector instance), or (type (LinAlg.Euler or LinAlg.TaitBryan), alpha, beta, gamma)");
	}
	return ret;
},
/////////////////////////////////////////////////////////////////////////
//
//  isVector
//
// tests if an instance is a Vector instance
// inputs: (object) an insteance to test
// output: true if the instance is a vector
//
/////////////////////////////////////////////////////////////////////////
isVector: function (instance) {return typeof instance =="object" && "__type" in instance && instance.__type == "VectorAbstract";},
/////////////////////////////////////////////////////////////////////////
//
//  isMatrix
//
// tests if an instance is a Matrix instance
// inputs: (object) an insteance to test
// output: true if the instance is a matrix
//
/////////////////////////////////////////////////////////////////////////
isMatrix: function (instance) {return typeof instance =="object" && "__type" in instance && instance.__type == "MatrixAbstract";},
/////////////////////////////////////////////////////////////////////////
//
//  dot
//
// performs an inner product on two vector, a matrix and vector, or two matrices
// inputs: the inputs may be one of the following:
//     {
//        (Vector instance) - the first vector
//        (Vector instance) - the second vector
//      ouptut: (number) the dot product of the two vectors
//     }
//     {
//        (Matrix instance) - a transformation matrix
//        (Vector instance) - a vector
//      ouptut: (Vector instance) the vector transformed by the matrix
//     }
//     {
//        (Matrix instance) - a transformation matrix
//        (Matrix instance) - a second matrix
//      ouptut: (Matrix instance) the result of matrix multiplication of the two matrices
//     }
//
/////////////////////////////////////////////////////////////////////////
dot: function(a,b)
{
	let ret = null;
	if (LinAlg.isVector(a) && LinAlg.isVector(b))
	{
		ret = a._data[0] * b._data[0] + a._data[1] * b._data[1] + a._data[2] * b._data[2];
	}
	else if (LinAlg	.isMatrix(a) && LinAlg.isVector(b))
	{
		ret = LinAlg.generateVector(a._data[0]._data[0] * b._data[0] + a._data[1]._data[0] * b._data[1] + a._data[2]._data[0] * b._data[2],
									a._data[0]._data[1] * b._data[0] + a._data[1]._data[1] * b._data[1] + a._data[2]._data[1] * b._data[2],
									a._data[0]._data[2] * b._data[0] + a._data[1]._data[2] * b._data[1] + a._data[2]._data[2] * b._data[2]);
	}
	else if (LinAlg.isMatrix(a) && LinAlg.isMatrix(b))
	{
		ret = LinAlg.generateVector(a._data[0]._data[0] * b._data[0]._data[0] + a._data[1]._data[0] * b._data[0]._data[1] + a._data[2]._data[0] * b._data[0]._data[2],
									a._data[0]._data[1] * b._data[0]._data[1] + a._data[1]._data[1] * b._data[0]._data[1] + a._data[2]._data[1] * b._data[0]._data[2],
									a._data[0]._data[2] * b._data[0]._data[2] + a._data[1]._data[2] * b._data[0]._data[1] + a._data[2]._data[2] * b._data[0]._data[2],
									a._data[0]._data[0] * b._data[1]._data[0] + a._data[1]._data[0] * b._data[1]._data[1] + a._data[2]._data[0] * b._data[1]._data[2],
									a._data[0]._data[1] * b._data[1]._data[1] + a._data[1]._data[1] * b._data[1]._data[1] + a._data[2]._data[1] * b._data[1]._data[2],
									a._data[0]._data[2] * b._data[1]._data[2] + a._data[1]._data[2] * b._data[1]._data[1] + a._data[2]._data[2] * b._data[1]._data[2],
									a._data[0]._data[0] * b._data[2]._data[0] + a._data[1]._data[0] * b._data[2]._data[1] + a._data[2]._data[0] * b._data[2]._data[2],
									a._data[0]._data[1] * b._data[2]._data[1] + a._data[1]._data[1] * b._data[2]._data[1] + a._data[2]._data[1] * b._data[2]._data[2],
									a._data[0]._data[2] * b._data[2]._data[2] + a._data[1]._data[2] * b._data[2]._data[1] + a._data[2]._data[2] * b._data[2]._data[2]);
	}
	return ret;
},
/////////////////////////////////////////////////////////////////////////
//
//  cross
//
// performs an outer product (cross product) on two vectors
// inputs: 
//        (Vector instance) - the first vector
//        (Vector instance) - the second vector
//  ouptut: (Vector instance) the cross product of the two vectors
//
/////////////////////////////////////////////////////////////////////////
cross: function(a,b)
{
	let ret = null;
	if (LinAlg.isVector(a) && LinAlg.isVector(b))
	{
		ret = LinAlg.generateVector(a._data[1] * b._data[2] - a._data[2] * b._data[1],
									a._data[2] * b._data[0] - a._data[0] * b._data[2],
									a._data[0] * b._data[1] - a._data[1] * b._data[0]);
	}
	return ret;
},
/////////////////////////////////////////////////////////////////////////
//
//  transpose
//
// transposes a matrix
// inputs: (Matrix instance) - the matrix to transpose
//  ouptut: none
//
/////////////////////////////////////////////////////////////////////////
transpose: function (instance)
{
	if (LinAlg.isMatrix(instance))
	{
		let swap = instance._data[1]._data[0];
		instance._data[1]._data[0] = instance._data[0]._data[1];
		instance._data[0]._data[1] = swap;
		
		swap = instance._data[2]._data[0];
		instance._data[2]._data[0] = instance._data[0]._data[2];
		instance._data[0]._data[2] = swap;

		swap = instance._data[2]._data[1];
		instance._data[2]._data[1] = instance._data[1]._data[2];
		instance._data[1]._data[2] = swap;

		instance._data[0]._update = Date.now();
		instance._data[1]._update = Date.now();
		instance._data[2]._update = Date.now();
	}
},
/////////////////////////////////////////////////////////////////////////
//
//  add
//
// adds two vectors or matrices
// inputs: the inputs may be one of the following:
//     {
//        (Vector instance) - the first vector
//        (Vector instance) - the second vector
//      ouptut: (Vector instance) the sum of the vectors
//     }
//     {
//        (Matrix instance) - a first matrix
//        (Matrix instance) - a second matrix
//      ouptut: (Matrix instance) the sum of the matrices
//     }
// output: none (the results are stored in the first vector or matrix)
//
/////////////////////////////////////////////////////////////////////////
add: function(a,b)
{
	if (LinAlg.isVector(a) && LinAlg.isVector(b))
	{
		a._data[0] += b._data[0];
		a._data[1] += b._data[1];
		a._data[2] += b._data[1];
		a._update = Date.now();
	}
	else if (LinAng.isMatrix(a) && LinAlg.isMatrix(b))
	{
		a._data[0]._data[0] += b._data[0]._data[0];
		a._data[0]._data[1] += b._data[0]._data[1];
		a._data[0]._data[2] += b._data[0]._data[1];
		a._data[1]._data[0] += b._data[1]._data[0];
		a._data[1]._data[1] += b._data[1]._data[1];
		a._data[1]._data[2] += b._data[1]._data[1];
		a._data[2]._data[0] += b._data[2]._data[0];
		a._data[2]._data[1] += b._data[2]._data[1];
		a._data[2]._data[2] += b._data[2]._data[1];
		a._data[0]._update = Date.now();
		a._data[1]._update = Date.now();
		a._data[2]._update = Date.now();
	}
},
/////////////////////////////////////////////////////////////////////////
//
//  subtract
//
// subtract two vectors or matrices (a - b)
// inputs: the inputs may be one of the following:
//     {
//        (Vector instance) [a] - the first vector
//        (Vector instance) [b] - the second vector
//     }
//     {
//        (Matrix instance) [a] - a first matrix
//        (Matrix instance) [b] - a second matrix
//     }
// output: none (the results are stored in the first vector or matrix)
//
/////////////////////////////////////////////////////////////////////////
subtract: function(a,b)
{
	if (LinAlg.isVector(a) && LinAlg.isVector(b))
	{
		a._data[0] -= b._data[0];
		a._data[1] -= b._data[1];
		a._data[2] -= b._data[1];
		a._update = Date.now();
	}
	else if (LinAng.isMatrix(a) && LinAlg.isMatrix(b))
	{
		a._data[0]._data[0] -= b._data[0]._data[0];
		a._data[0]._data[1] -= b._data[0]._data[1];
		a._data[0]._data[2] -= b._data[0]._data[1];
		a._data[1]._data[0] -= b._data[1]._data[0];
		a._data[1]._data[1] -= b._data[1]._data[1];
		a._data[1]._data[2] -= b._data[1]._data[1];
		a._data[2]._data[0] -= b._data[2]._data[0];
		a._data[2]._data[1] -= b._data[2]._data[1];
		a._data[2]._data[2] -= b._data[2]._data[1];
		a._data[0]._update = Date.now();
		a._data[1]._update = Date.now();
		a._data[2]._update = Date.now();
	}
},
/////////////////////////////////////////////////////////////////////////
//
//  scale
//
// scale a vector or matrix by a scalar factor
// inputs: (Vector or Matrix instance) the instance to scale
//         (number) the scalar by which to scale the vector or matrix
// output: none
//
/////////////////////////////////////////////////////////////////////////
scale: function(instance, scalar)
{
	if (LinAlg.isVector(instance))
	{
		instance._data[0] *= scalar;
		instance._data[1] *= scalar;
		instance._data[2] *= scalar;
		instance._update = Date.now();
	}
	else if (LinAng.isMatrix(instance))
	{
		instance._data[0]._data[0] *= scalar;
		instance._data[0]._data[1] *= scalar;
		instance._data[0]._data[2] *= scalar;
		instance._data[1]._data[0] *= scalar;
		instance._data[1]._data[1] *= scalar;
		instance._data[1]._data[2] *= scalar;
		instance._data[2]._data[0] *= scalar;
		instance._data[2]._data[1] *= scalar;
		instance._data[2]._data[2] *= scalar;
		instance._data[0]._update = Date.now();
		instance._data[1]._update = Date.now();
		instance._data[2]._update = Date.now();
	}
},
/////////////////////////////////////////////////////////////////////////
//
//  unit
//
// scale a vector by the inverse of its magnitude, making a unit vector
// inputs: (Vector instance) the instance to scale
// output: none
//
/////////////////////////////////////////////////////////////////////////
unit: function(instance)
{
	if (LinAlg.isVector(instance))
	{
		LinAlg.scale(instance,1.0 / LinAlg.magnitude(instance));
	}
},
/////////////////////////////////////////////////////////////////////////
//
//  addGenerate
//
// equivalent to add, but returns a new instance of a vector or matrix
// inputs: (see add)
// output: (Vector instance) or (Matrix instance)
//
/////////////////////////////////////////////////////////////////////////
addGenerate: function(a,b)
{
	let ret = null;
	if (LinAlg.isVector(a) && LinAlg.isVector(b))
	{
		ret = LinAlg.generateVector(a);
		LinAlg.add(ret,b);
	}
	else if (LinAlg.isMatrix(a) && LinAlg.isMatrix(b))
	{
		ret = LinAlg.generateMatrix(a);
		LinAlg.add(ret,scalar);
	}
	return ret;
},
/////////////////////////////////////////////////////////////////////////
//
//  subtractGenerate
//
// equivalent to subtract, but returns a new instance of a vector or matrix
// inputs: (see subtract)
// output: (Vector instance) or (Matrix instance)
//
/////////////////////////////////////////////////////////////////////////
subtractGenerate: function(a,b)
{
	let ret = null;
	if (LinAlg.isVector(a) && LinAlg.isVector(b))
	{
		ret = LinAlg.generateVector(a);
		LinAlg.subtract(ret,b);
	}
	else if (LinAlg.isMatrix(a) && LinAlg.isMatrix(b))
	{
		ret = LinAlg.generateMatrix(a);
		LinAlg.subtract(ret,scalar);
	}
	return ret;
},
/////////////////////////////////////////////////////////////////////////
//
//  scaleGenerate
//
// equivalent to scale, but returns a new instance of a vector or matrix
// inputs: (see scale)
// output: (Vector instance) or (Matrix instance)
//
/////////////////////////////////////////////////////////////////////////
scaleGenerate: function(instance,scalar)
{
	let ret = null;
	if (LinAlg.isVector(instance))
	{
		ret = LinAlg.generateVector(instance);
		LinAlg.scale(ret,scalar);
	}
	else if (LinAlg.isMatrix(instance))
	{
		ret = LinAlg.generateMatrix(instance);
		LinAlg.scale(ret,scalar);
	}
	return ret;
},
/////////////////////////////////////////////////////////////////////////
//
//  unitGenerate
//
// equivalent to unit, but returns a new instance of a vector
// inputs: (see unit)
// output: (Vector instance)
//
/////////////////////////////////////////////////////////////////////////
unitGenerate: function(instance)
{
	let ret = null;
	if (LinAlg.isVector(instance))
	{
		ret = LinAlg.generateVector(instance);
		LinAlg.scale(ret,1.0 / LinAlg.magnitude(instance));
	}
	return ret;
},
/////////////////////////////////////////////////////////////////////////
//
//  magnitude
//
// returns the magnitude of a vector
// inputs: (Vector instance) - the vector for which the magnitude is desired
// output: (number) - the magnitude of the vector
//
/////////////////////////////////////////////////////////////////////////
magnitude: function(instance)
{
	let ret;
	if (LinAlg.isVector(instance))
	{
		ret = Math.sqrt(instance._data[0] * instance._data[0] + instance._data[1] * instance._data[1] + instance._data[2] * instance._data[2]);
	}
	return ret;
},
/////////////////////////////////////////////////////////////////////////
//
//  determinant
//
// returns the determinant of a matrix
// inputs: (Matrix instance) - the matrix for which the determinant is desired
// output: (number) - the determinant of the matrix
//
/////////////////////////////////////////////////////////////////////////
determinant: function(instance)
{
	let ret;
	if (LinAlg.isMatrix(instance))
	{
		ret = (instance._data[1]._data[1] * instance._data[2]._data[2] - instance._data[2]._data[1] * instance._data[1]._data[2]) * instance._data[0]._data[0] -
			(instance._data[0]._data[1] * instance._data[2]._data[2] - instance._data[2]._data[1] * instance._data[0]._data[2]) * instance._data[1]._data[0] +
			(instance._data[0]._data[1] * instance._data[1]._data[2] - instance._data[1]._data[1] * instance._data[0]._data[2]) * instance._data[2]._data[0];
	}
	return ret;
},
/////////////////////////////////////////////////////////////////////////
//
//  getColumn
//
// returns a column vector from a matrix
// inputs: (Matrix instance) - the matrix for which the column is desired
//         (number) the column in the range [0,2]
// output: (Vector instance) - the column of the matrix, or undefined if the column or instance if invalid
//
/////////////////////////////////////////////////////////////////////////
getColumn: function(instance, column)
{
	let ret;
	if (LinAlg.isMatrix(instance) && typeof column == "number" && column >= 0 && column <= 2)
	{
		ret = instance._data[column];
	}
	return ret;
},
/////////////////////////////////////////////////////////////////////////
//
//  getRow
//
// returns  a row vector from a matrix
// inputs: (Matrix instance) - the matrix for which the row is desired
//         (number) the row in the range [0,2]
// output: (Vector instance) - the row of the matrix, or undefined if the row or instance if invalid
//
/////////////////////////////////////////////////////////////////////////
getRow: function(instance, row)
{
	let ret;
	if (LinAlg.isMatrix(instance) && typeof row == "number" && row >= 0 && row <= 2)
	{
		ret = LinAlg.generateVector(instance._data[0]._data[row],instance._data[1]._data[row],instance._data[2]._data[row]);
	}
	return ret;
},
/////////////////////////////////////////////////////////////////////////
//
//  setColumn
//
// sets a column vector from a matrix
// inputs: (Matrix instance) - the matrix for which the change is desired
//         (number) the column in the range [0,2]
//         (Vector instance) - the vector to assign to the column
// output: none
//
/////////////////////////////////////////////////////////////////////////
setColumn: function(instanceMatrix, column, instanceVector)
{
	if (LinAlg.isMatrix(instanceMatrix) && typeof column == "number" && column >= 0 && column <= 2 && LinAlg.isVector(instanceVector))
	{
		instanceMatrix._data[column] = LinAlg.generateVector(instanceVector);
		instance._data[column]._update = Date.now();
	}
},
/////////////////////////////////////////////////////////////////////////
//
//  setRow
//
// sets a row vector from a matrix
// inputs: (Matrix instance) - the matrix for which the change is desired
//         (number) the row in the range [0,2]
//         (Vector instance) - the vector to assign to the row
// output: none
//
/////////////////////////////////////////////////////////////////////////
setRow: function(instanceMatrix, row, instanceVector)
{
	if (LinAlg.isMatrix(instanceMatrix) && typeof row == "number" && row >= 0 && row <= 2 && LinAlg.isVector(instanceVector))
	{
		instanceMatrix._data[0]._data[row] = instanceVector._data[0];
		instanceMatrix._data[1]._data[row] = instanceVector._data[1];
		instanceMatrix._data[2]._data[row] = instanceVector._data[2];
		instanceMatrix._data[0]._update = Date.now();
		instanceMatrix._data[1]._update = Date.now();
		instanceMatrix._data[2]._update = Date.now();
	}
},
/////////////////////////////////////////////////////////////////////////
//
//  getEntry
//
// gets an entry in a matrix
// inputs: (Matrix instance) - the matrix for which the change is desired
//         (number) the row in the range [0,2]
//         (number) the column in the range [0,2]
// output: (number) - the value of the specified row and column in the matrix
//
/////////////////////////////////////////////////////////////////////////
getEntry: function(instance, row, column)
{
	let ret;
	if (LinAlg.isMatrix(instance) && typeof row == "number" && row >= 0 && row <= 2 && typeof column == "number" && column >= 0 && column <= 2)
	{
		ret = instance._data[column]._data[row];
	}
	return ret;
	
},
/////////////////////////////////////////////////////////////////////////
//
//  setEntry
//
// sets an entry in a matrix
// inputs: (Matrix instance) - the matrix for which the change is desired
//         (number) the row in the range [0,2]
//         (number) the column in the range [0,2]
//         (number) - the value to assign to the specified row and column
// output: none
//
/////////////////////////////////////////////////////////////////////////
setEntry: function(instance, row, column, value)
{
	if (LinAlg.isMatrix(instance) && typeof row == "number" && row >= 0 && row <= 2 && typeof column == "number" && column >= 0 && column <= 2 && typeof value == "number")
	{
		instance._data[column]._data[row] = value;
		instance._data[column]._update = Date.now();
	}
},
/////////////////////////////////////////////////////////////////////////
//
//  generateRandomVector
//
// generates a Vector instance within a cube of the specied size. the 
// x,y,z components of the vector will each be between [0,size)
// inputs: (number) - the desired cube size
// output: (Vector instance) the generated vector
//
/////////////////////////////////////////////////////////////////////////
generateRandomVector: function (cubeSize)
{
	return LinAlg.generateVector((Math.random() - 0.5) * cubeSize,
								(Math.random() - 0.5) * cubeSize,
								(Math.random() - 0.5) * cubeSize);
},
/////////////////////////////////////////////////////////////////////////
//
//  generateRandomUnitVector
//
// generates a Vector instance that is a unit vector
// inputs: none
// output: (Vector instance) the generated vector
//
/////////////////////////////////////////////////////////////////////////
generateRandomUnitVector: function ()
{
	const theta = Math.random() * 2.0 * Math.PI;
	const phi = (Math.random() - 0.5) * Math.PI;
	const cosPhi = Math.cos(phi);
	const x = Math.cos(theta) * cosPhi;
	const y = Math.sin(theta) * cosPhi;
	const z = Math.sin(phi);
	 
	return LinAlg.generateVector(x,y,z);
},

};

/////////////////////////////////////////////////////////////////////////
//
//  unitX
//
// the unit vector in the x direction
//
/////////////////////////////////////////////////////////////////////////
LinAlg.unitX = LinAlg.generateVector(1,0,0);
/////////////////////////////////////////////////////////////////////////
//
//  unitY
//
// the unit vector in the y direction
//
/////////////////////////////////////////////////////////////////////////
LinAlg.unitY = LinAlg.generateVector(0,1,0);
/////////////////////////////////////////////////////////////////////////
//
//  unitZ
//
// the unit vector in the z direction
//
/////////////////////////////////////////////////////////////////////////
LinAlg.unitZ = LinAlg.generateVector(0,0,1);
/////////////////////////////////////////////////////////////////////////
//
//  identityMatrix
//
// a Matrix nistance containing the identiy matrix 
//
/////////////////////////////////////////////////////////////////////////
LinAlg.identityMatrix = LinAlg.generateMatrix(LinAlg.unitX,LinAlg.unitY,LinAlg.unitZ);
// freeze the unit vectors, identity matrix, and LinAlg objecgt
Object.freeze(LinAlg.unitX)
Object.freeze(LinAlg.unitX._data)
Object.freeze(LinAlg.unitY)
Object.freeze(LinAlg.unitY._data)
Object.freeze(LinAlg.unitZ)
Object.freeze(LinAlg.unitZ._data)
Object.freeze(LinAlg.identityMatrix)
Object.freeze(LinAlg.identityMatrix._data)
Object.freeze(LinAlg.identityMatrix._data[0]._data)
Object.freeze(LinAlg.identityMatrix._data[1]._data)
Object.freeze(LinAlg.identityMatrix._data[2]._data)
Object.freeze(LinAlg);
