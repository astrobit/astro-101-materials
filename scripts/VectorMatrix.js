

class ThreeVector
{
	#r;
	#theta;
	#psi;
	#x;
	#y;
	#z;
	#calcPolar()
	{
		if (typeof this.#x == 'number' && typeof this.#y == 'number' && typeof this.#z == 'number')
		{
			this.#r = Math.sqrt(this.#x * this.#x + this.#y * this.#y + this.#z * this.#z);
			this.#theta = Math.atan2(this.#y,this.#x);
			if (this.#r == 0.0)
				this.#psi = 0.0;
			else
				this.#psi = Math.asin(this.#z / this.#r);
		}
	}
	#calcRectangular()
	{
		if (typeof this.#r == 'number' && typeof this.#theta == 'number' && typeof this.#psi == 'number')
		{
			this.#x = this.#r * Math.cos(this.#theta) * Math.cos(this.#psi);
			this.#y = this.#r * Math.sin(this.#theta) * Math.cos(this.#psi);
			this.#z = this.#r * Math.sin(this.#psi);
		}
	}
	selfCopy(vector)
	{
		if (arguments.length >= 1 && arguments[0] instanceof Object)
		{
			if ("__type" in arguments[0] && arguments[0].__type == "Vector")
			{
				this.#x = arguments[0].#x;
				this.#y = arguments[0].#y;
				this.#z = arguments[0].#z;
			}
			else
			{
				this.#x = ("#x" in arguments[0] && typeof arguments[0].#x  == "number") ? arguments[0].#x : 0;
				this.#y = ("#y" in arguments[0] && typeof arguments[0].#y  == "number") ? arguments[0].#y : 0;
				this.#z = ("#z" in arguments[0] && typeof arguments[0].#z  == "number") ? arguments[0].#z : 0;
			}
			this.#calcPolar();
		}
	}
	
	constructor()
	{
		this.__type = "Vector";
//		Object.defineProperty(this, "__type", {value: "Vector", writable: false});
		if (arguments.length == 1)
		{
			if (arguments[0] instanceof Object)
			{
				if (arguments[0] instanceof Array)
				{
					this.#x = (arguments[0].length > 0) ? arguments[0][0] : 0;
					this.#y = (arguments[0].length > 1) ? arguments[0][1] : 0;
					this.#z = (arguments[0].length > 2) ? arguments[0][2] : 0;
				}
				else if ("__type" in arguments[0] && arguments[0].__type == "Vector")
				{
					this.#x = arguments[0].#x;
					this.#y = arguments[0].#y;
					this.#z = arguments[0].#z;
				}
				else
				{
					this.#x = ("#x" in arguments[0] && typeof arguments[0].#x  == "number") ? arguments[0].#x : 0;
					this.#y = ("#y" in arguments[0] && typeof arguments[0].#y  == "number") ? arguments[0].#y : 0;
					this.#z = ("#z" in arguments[0] && typeof arguments[0].#z  == "number") ? arguments[0].#z : 0;
				}
			}
			else
			{
				this.#x = (arguments[0]  == "number") ? arguments[0] : 0;
				this.#y = 0;
				this.#z = 0;
			}
		}
		else
		{
			this.#x = (arguments.length > 0 && typeof arguments[0]  == "number") ? arguments[0] : 0;
			this.#y = (arguments.length > 1 && typeof arguments[1]  == "number") ? arguments[1] : 0;
			this.#z = (arguments.length > 2 && typeof arguments[2]  == "number") ? arguments[2] : 0;
		}
		this.#calcPolar();
	}
	add(vector)
	{
		return new ThreeVector(this.#x + vector.#x,this.#y + vector.#y, this.#z + vector.#z);
	}
	subtract(vector)
	{
		return new ThreeVector(this.#x - vector.#x,this.#y - vector.#y, this.#z - vector.#z);
	}
	dot(vector)
	{
		return this.#x * vector.#x + this.#y * vector.#y + this.#z * vector.#z;
	}
	cross(vector)
	{
		return new ThreeVector(this.#y * vector.#z - vector.#y * this.#z, this.#z * vector.#x - this.#x * vector.#z, this.#x * vector.#y - this.#y * vector.#x);
	}
	scale(scalar)
	{
		let ret = new ThreeVector(this);
		ret.selfScale(scalar);
		return ret;
	}
	get magnitude()
	{
		return this.#r;
	}
	get unit()
	{
		let ret = new ThreeVector(this);
		ret.selfScale(1.0 / ret.#r);
		return ret;
	}

	selfDot()
	{
		return this.#r * this.#r;
	}
	selfAdd(vector)
	{
		this.#x += vector.#x;
		this.#y += vector.#y;
		this.#z += vector.#z;
		this.#calcPolar();
	}
	selfSubtract(vector)
	{
		this.#x -= vector.#x;
		this.#y -= vector.#y;
		this.#z -= vector.#z;
		this.#calcPolar();
	}
	selfScale(scalar)
	{
		this.#x *= scalar;
		this.#y *= scalar;
		this.#z *= scalar;
		this.#r *= Math.abs(scalar);
		//this.calcPolar();
	}
	selfUnit()
	{
		this.selfScale(1.0 / this.#r);
	}

	copy()
	{
		return new ThreeVector(this);
	}
	updateXYZ(x,y,z)
	{
		this.#x = x;
		this.#y = y;
		this.#z = z;
		this.#calcPolar();
	}
	updatePolar(r,theta,psi)
	{
		this.#r = r;
		this.#theta = theta;
		this.#psi = psi;
		this.#calcRectangular();
	}
	set x(val)
	{
		this.#x = val;
		this.#calcPolar();
	}
	set y(val)
	{
		this.#y = val;
		this.#calcPolar();
	}
	set z(val)
	{
		this.#z = val;
		this.#calcPolar();
	}
	set r(val)
	{
		this.#r = val;
		this.#calcRectangular();
	}
	set theta(val)
	{
		this.#theta = val;
		this.#calcRectangular();
	}
	set psi(val)
	{
		this.#psi = val;
		this.#calcRectangular();
	}
	get x()
	{
		return this.#x;
	}
	get y()
	{
		return this.#y;
	}
	get z()
	{
		return this.#z;
	}
	get r()
	{
		return this.#r;
	}
	get radius()
	{
		return this.#r;
	}
	get theta()
	{
		return this.#theta;
	}
	get psi()
	{
		return this.#psi;
	}
}

class ThreeMatrix
{
	#data;
	loadIdentity()
	{
		this.#data[0].x = 1;
		this.#data[0].y = 0;
		this.#data[0].z = 0;
		this.#data[1].x = 0;
		this.#data[1].y = 1;
		this.#data[1].z = 0;
		this.#data[2].x = 0;
		this.#data[2].y = 0;
		this.#data[2].z = 1;
	}
	constructor()
	{
		this.__type = "Matrix";
//		Object.defineProperty(this, "__type", {value: "Matrix", writable: false});
		this.#data = new Array(3);
		let loadSuccess = false;
		if (arguments.length == 1)
		{
			if (arguments[0] instanceof Array && arguments[0].length == 9 &&
				typeof arguments[0][0] == "number" && typeof arguments[0][1]  == "number" && typeof arguments[0][2]  == "number" &&
				typeof arguments[0][3]  == "number" && typeof arguments[0][4]  == "number" && typeof arguments[0][5]  == "number" &&
				typeof arguments[0][6]  == "number" && typeof arguments[0][7]  == "number" && typeof arguments[0][8]  == "number")
			{
				this.#data[0] = new ThreeVector(arguments[0][0],arguments[0][1],arguments[0][2]);
				this.#data[1] = new ThreeVector(arguments[0][3],arguments[0][4],arguments[0][5]);
				this.#data[2] = new ThreeVector(arguments[0][6],arguments[0][7],arguments[0][8]);
				loadSuccess = true;
			}
			else if (arguments[0] instanceof Object &&
				(("__type" in arguments[0] && arguments[0].__type == "Matrix") ||
					("data" in arguments[0] && arguments[0].#data instanceof Array && arguments[0].length == 3)) &&
				("__type" in arguments[0].#data[0] && arguments[0].#data[0].__type == "Vector") &&
				("__type" in arguments[0].#data[1] && arguments[0].#data[1].__type == "Vector") &&
				("__type" in arguments[0].#data[2] && arguments[0].#data[2].__type == "Vector"))
			{
				this.#data[0] = new ThreeVector(arguments[0].data[0]);
				this.#data[1] = new ThreeVector(arguments[0].data[1]);
				this.#data[2] = new ThreeVector(arguments[0].data[2]);
				loadSuccess = true;
			}
		}
		else if (arguments.length == 3)
		{
			if (((arguments[0] instanceof Array && arguments[0].length == 3) || (arguments[0] instanceof Object && "__type" in arguments[0] && arguments[0].__type == "Vector")) &&
				((arguments[1] instanceof Array && arguments[1].length == 3) || (arguments[1] instanceof Object && "__type" in arguments[1] && arguments[1].__type == "Vector")) &&
				((arguments[2] instanceof Array && arguments[2].length == 3) || (arguments[2] instanceof Object && "__type" in arguments[2] && arguments[2].__type == "Vector")))
			{
				this.#data[0] = new ThreeVector(arguments[0]);
				this.#data[1] = new ThreeVector(arguments[1]);
				this.#data[2] = new ThreeVector(arguments[2]);
				loadSuccess = true;
			}
		}
		else if (arguments.length == 9)
		{
			if (typeof arguments[0] == "number" && typeof arguments[1]  == "number" && typeof arguments[2]  == "number" &&
				typeof arguments[3]  == "number" && typeof arguments[4]  == "number" && typeof arguments[5]  == "number" &&
				typeof arguments[6]  == "number" && typeof arguments[7]  == "number" && typeof arguments[8]  == "number")
			{
				this.#data[0] = new ThreeVector(arguments[0],arguments[1],arguments[2]);
				this.#data[1] = new ThreeVector(arguments[3],arguments[4],arguments[5]);
				this.#data[2] = new ThreeVector(arguments[6],arguments[7],arguments[8]);
				loadSuccess = true;
			}
		}
		if (!loadSuccess)
		{
			this.#data[0] = new ThreeVector(1,0,0);
			this.#data[1] = new ThreeVector(0,1,0);
			this.#data[2] = new ThreeVector(0,0,1);
		}
	}
	getRowVector(row)
	{
		let ret = undefined;
		switch (row)
		{
		case 0:
			ret = new ThreeVector(this.#data[0].x,this.#data[1].x,this.#data[2].x);
			break;
		case 1:
			ret = new ThreeVector(this.#data[0].y,this.#data[1].y,this.#data[2].y);
			break;
		case 2:
			ret = new ThreeVector(this.#data[0].z,this.#data[1].z,this.#data[2].z);
			break;
		default:
			break;
		}
		return ret;
	}
	setRowVector(row,vector)
	{
		let ret = undefined;
		switch (row)
		{
		case 0:
			this.#data[0].x = vector.x;
			this.#data[1].x = vector.y;
			this.#data[2].x = vector.z;
			break;
		case 1:
			this.#data[0].y = vector.x;
			this.#data[1].y = vector.y;
			this.#data[2].y = vector.z;
			break;
		case 2:
			this.#data[0].z = vector.x;
			this.#data[1].z = vector.y;
			this.#data[2].z = vector.z;
			break;
		default:
			break;
		}
		return ret;
	}
	getColumnVector(col)
	{
		if (col >= 0 && col <= 2)
			return new ThreeVector(this.#data[col]);
		else
			return undefined;
	}
	setColumnVector(col,vector)
	{
		if (col >= 0 && col <= 2)
			this.#data[col].selfCopy(vector);
	}
	dot(rho)
	{
		if (rho instanceof ThreeVector)
		{
//			const rowVectX = this.getRowVector(0);
//			const rowVectY = this.getRowVector(1);
//			const rowVectZ = this.getRowVector(2);
			return new ThreeVector(this.#data[0].x * rho.x + this.#data[1].x * rho.y + this.#data[2].x * rho.z,
									this.#data[0].y * rho.x + this.#data[1].y * rho.y + this.#data[2].y * rho.z,
									this.#data[0].z * rho.x + this.#data[1].z * rho.y + this.#data[2].z * rho.z);
//									rowVectX.dot(rho),
//									rowVectY.dot(rho),
//									rowVectZ.dot(rho));

		}
		else if (rho instanceof ThreeMatrix)
		{
			let ret = new ThreeMatrix(this);
			ret.selfDot(rho);
			return ret;
		}
		else if (typeof rho == "number")
		{
			return this.scale(rho);
		}
		else
			return undefined;

	}
	scale(scalar)
	{
		let ret = new ThreeMatrix(this);
		ret.selfScale(scalar);
	}
	selfScale(scalar)
	{
		this.#data[0].selfScale(scalar);
		this.#data[1].selfScale(scalar);
		this.#data[2].selfScale(scalar);
	}
	selfDot(matrix)
	{
//		const rowVectX = this.getRowVector(0);
//		const rowVectY = this.getRowVector(1);
//		const rowVectZ = this.getRowVector(2);

		this.#data[0].updateXYZ(this._data[0].x * matrix.data[0].x,this._data[1].x * matrix.data[0].y,this._data[2].x * matrix.data[0].z);
		this.#data[1].updateXYZ(this._data[0].y * matrix.data[1].x,this._data[1].y * matrix.data[1].y,this._data[2].y * matrix.data[1].z);
		this.#data[2].updateXYZ(this._data[0].z * matrix.data[2].x,this._data[1].z * matrix.data[2].y,this._data[2].z * matrix.data[2].z);
		
//		this.#data[0].updateXYZ(rowVectX.dot(matrix.data[0]),rowVectY.dot(matrix.data[0]),rowVectZ.dot(matrix.data[0]));
//		this.#data[1].updateXYZ(rowVectX.dot(matrix.data[1]),rowVectY.dot(matrix.data[1]),rowVectZ.dot(matrix.data[1]));
//		this.#data[2].updateXYZ(rowVectX.dot(matrix.data[2]),rowVectY.dot(matrix.data[2]),rowVectZ.dot(matrix.data[2]));
	}
	selfCopy(matrix)
	{
		this.#data[0].selfCopy(matrix.data[0]);
		this.#data[1].selfCopy(matrix.data[1]);
		this.#data[2].selfCopy(matrix.data[2]);
	}
	copy()
	{
		return new ThreeMatrix(this);
	}
	transpose()
	{
		let m = new ThreeMatrix(this);
		m.selfTranspose();
		return m;
	}
	selfTranspose()
	{
		const colVectA = new ThreeVector(this.#data[0]);
		const colVectB = new ThreeVector(this.#data[1]);
		const colVectC = new ThreeVector(this.#data[2]);
		
		this.#data[0].updateXYZ(colVectA.x,colVectB.x,colVectC.x);
		this.#data[1].updateXYZ(colVectA.y,colVectB.y,colVectC.y);
		this.#data[2].updateXYZ(colVectA.z,colVectB.z,colVectC.z);
	}

	loadBasis(vectX,vectY,vectZ)
	{
		let basisX;
		let basisY;
		let basisZ;
		if ((vectX instanceof ThreeVector && vectY instanceof ThreeVector && (typeof vectZ == 'undefined' || vectZ === null)) || (vectX instanceof ThreeVector && vectY instanceof ThreeVector && vecZ instanceof ThreeVector))
		{
			basisX = vectX.unit;
			basisZ = basisX.cross(vectY);
			basisZ.selfUnit();
			basisY = basisZ.cross(basisX);
			basisY.selfUnit();
		}
		else if (vectX instanceof ThreeVector && vectZ instanceof ThreeVector && (typeof vectY == 'undefined' || vectY === null))
		{
			basisX = vectX.unit;
			basisY = basisX.cross(vectZ);
			basisY.selfUnit();
			basisZ = basisX.cross(basisY);
			basisZ.selfUnit();
		}
		else if (vectY instanceof ThreeVector && vectZ instanceof ThreeVector && (typeof vectX == 'undefined' || vectX === null))
		{
			basisY = vectY.unit;
			basisX = basisY.cross(vectZ);
			basisX.selfUnit();
			basisZ = basisX.cross(basisY);
			basisZ.selfUnit();
		}
		if (typeof basisX != 'undefined')
		{
			this.setColumnVector(0,basisX);
			this.setColumnVector(1,basisY);
			this.setColumnVector(2,basisZ);
		}
	}
}


const LinAlg = {
unitX: new ThreeVector(1,0,0),
unitY: new ThreeVector(0,1,0),
unitZ: new ThreeVector(0,0,1),
identityMatrix: new ThreeMatrix(this.unitX,this.unitY,this.unitZ),
isVector: function (a) { return a instanceof Vector || (a instanceof Object && "__type" in a && a.__type == "Vector");},
isMatrix: function (a) { return a instanceof Vector || (a instanceof Object && "__type" in a && a.__type == "Matrix");},
generateRandomVector: function (cubeSize)
{
	return new ThreeVector((Math.random() - 0.5) * cubeSize,
								(Math.random() - 0.5) * cubeSize,
								(Math.random() - 0.5) * cubeSize);
},
generateRandomUnitVector: function ()
{
	const theta = Math.random() * 2.0 * Math.PI;
	const phi = (Math.random() - 0.5) * Math.PI;
	const cosPhi = Math.cos(phi);
	const x = Math.cos(theta) * cosPhi;
	const y = Math.sin(theta) * cosPhi;
	const z = Math.sin(phi);
	 
	return new ThreeVector(x,y,z);
},
}
