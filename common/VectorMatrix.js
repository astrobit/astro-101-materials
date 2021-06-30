// JavaScript source code
class ThreeVector
{
	calcPolar()
	{
		if (typeof this._x == 'number' && typeof this._y == 'number' && typeof this._z == 'number')
		{
			this._r = Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);
			this._theta = Math.atan2(this._y,this._x);
			this._psi = Math.asin(this._z / this._r);
		}
	}
	calcRectangular()
	{
		if (typeof this._r == 'number' && typeof this._theta == 'number' && typeof this._psi == 'number')
		{
			this._x = this._r * Math.cos(this._theta) * Math.cos(this._psi);
			this._y = this._r * Math.sin(this._theta) * Math.cos(this._psi);
			this._z = this._r * Math.sin(this._psi);
		}
	}
	constructor(x,y,z)
	{
		if (x instanceof ThreeVector)
		{
			this.selfCopy(x);
		}
		else
		{
			this._x = 0;
			this._y = 0;
			this._z = 0;

			if (typeof x == 'number')
				this._x = x;
			if (typeof y == 'number')
				this._y = y;
			if (typeof z == 'number')
				this._z = z;
			this.calcPolar();
		}
	}
	add(vector)
	{
		return new ThreeVector(this._x + vector._x,this._y + vector._y, this._z + vector._z);
	}
	subtract(vector)
	{
		return new ThreeVector(this._x - vector._x,this._y - vector._y, this._z - vector._z);
	}
	dot(vector)
	{
		return this._x * vector._x + this._y * vector._y + this._z * vector._z;
	}
	cross(vector)
	{
		return new ThreeVector(this._y * vector._z - vector._y * this._z, this._z * vector._x - this._x * vector._z, this._x * vector._y - this._y * vector._x);
	}
	scale(scalar)
	{
		return new ThreeVector(this._x * scalar, this._y * scalar, this._z * scalar)
	}
	get magnitude()
	{
		return this._r;
	}
	get unit()
	{
		var ret = new ThreeVector();
		ret.selfCopy(this);
		ret.selfUnit();
		return ret;
	}

	get selfDot()
	{
		return this._r * this._r;
	}
	selfAdd(vector)
	{
		this.x += vector.x;
		this.y += vector.y;
		this.z += vector.z;
		this.calcPolar();
	}
	selfSubtract(vector)
	{
		this.x -= vector.x;
		this.y -= vector.y;
		this.z -= vector.z;
		this.calcPolar();
	}
	selfScale(scalar)
	{
		this._x *= scalar;
		this._y *= scalar;
		this._z *= scalar;
		this._r *= Math.abs(scalar);
		this.calcPolar();
	}
	selfUnit()
	{
		if (this._r != 0.0)
			this.selfScale(1.0 / this._r);
	}
	selfCopy(vector)
	{
		this._x = vector._x;
		this._y = vector._y;
		this._z = vector._z;
		this._r = vector._r;
		this._theta = vector._theta;
		this._psi = vector._psi;
	}

	copy()
	{
		var ret = new ThreeVector(this.x,this.y,this.z);
		ret.selfCopy(this);
		return ret;
	}
	set x(val)
	{
		this._x = val;
		this.calcPolar();
	}
	set y(val)
	{
		this._y = val;
		this.calcPolar();
	}
	set z(val)
	{
		this._z = val;
		this.calcPolar();
	}
	set r(val)
	{
		this._r = val;
		this.calcRectangular();
	}
	set theta(val)
	{
		this._theta = val;
		this.calcRectangular();
	}
	set psi(val)
	{
		this._psi = val;
		this.calcRectangular();
	}
	get x()
	{
		return this._x;
	}
	get y()
	{
		return this._y;
	}
	get z()
	{
		return this._z;
	}
	get r()
	{
		return this._r;
	}
	get radius()
	{
		return this._r;
	}
	get theta()
	{
		return this._theta;
	}
	get psi()
	{
		return this._psi;
	}

}


class ThreeMatrix
{
	constructor(Ax,Ay,Az,Bx,By,Bz,Cx,Cy,Cz)
	{
		this.data = new Array(3);
		this.data[0] = new ThreeVector(Ax,Ay,Az);
		this.data[1] = new ThreeVector(Bx,By,Bz);
		this.data[2] = new ThreeVector(Cx,Cy,Cz);
		if (Ax instanceof ThreeMatrix) // allow 
		{
			this.selfCopy(Ax);
		}
		else if (Ax instanceof ThreeVector && Ay instanceof ThreeVector && Az instanceof ThreeVector)
		{
			//this.data[0] = new ThreeVector(Ax); //this is already done by the constructor for the data[0] ThreeVector
			this.data[1] = new ThreeVector(Ay);
			this.data[2] = new ThreeVector(Az);
		}
	}
	loadIdentity()
	{
		this.data[0].x = 1;
		this.data[0].y = 0;
		this.data[0].z = 0;
		this.data[1].x = 0;
		this.data[1].y = 1;
		this.data[1].z = 0;
		this.data[2].x = 0;
		this.data[2].y = 0;
		this.data[2].z = 1;
	}
	getRowVector(row)
	{
		var ret = undefined;
		switch (row)
		{
		case 0:
			ret = new ThreeVector(this.data[0].x,this.data[1].x,this.data[2].x);
			break;
		case 1:
			ret = new ThreeVector(this.data[0].y,this.data[1].y,this.data[2].y);
			break;
		case 2:
			ret = new ThreeVector(this.data[0].z,this.data[1].z,this.data[2].z);
			break;
		default:
			break;
		}
		return ret;
	}
	setRowVector(row,vector)
	{
		var ret = undefined;
		switch (row)
		{
		case 0:
			this.data[0].x = vector.x;
			this.data[1].x = vector.y;
			this.data[2].x = vector.z;
			break;
		case 1:
			this.data[0].y = vector.x;
			this.data[1].y = vector.y;
			this.data[2].y = vector.z;
			break;
		case 2:
			this.data[0].z = vector.x;
			this.data[1].z = vector.y;
			this.data[2].z = vector.z;
			break;
		default:
			break;
		}
		return ret;
	}
	getColumnVector(col)
	{
		if (col >= 0 && col <= 2)
			return new ThreeVector(this.data[col]);
		else
			return undefined;
	}
	setColumnVector(col,vector)
	{
		if (col >= 0 && col <= 2)
			this.data[col].selfCopy(vector);
	}
	dot(rho)
	{
		if (rho instanceof ThreeVector)
		{
			var rowVectX = this.getRowVector(0);
			var rowVectY = this.getRowVector(1);
			var rowVectZ = this.getRowVector(2);
			return new ThreeVector(rowVectX.dot(rho),
									rowVectY.dot(rho),
									rowVectZ.dot(rho));

		}
		else if (rho instanceof ThreeMatrix)
		{
			var ret = new ThreeMatrix(this);
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
		var ret = new ThreeMatrix(this);
		ret.selfScale(scalar);
	}
	selfScale(scalar)
	{
		this.data[0].selfScale(scalar);
		this.data[1].selfScale(scalar);
		this.data[2].selfScale(scalar);
	}
	selfDot(matrix)
	{
		var rowVectX = this.getRowVector(0);
		var rowVectY = this.getRowVector(1);
		var rowVectZ = this.getRowVector(2);

		this.data[0].x = rowVectX.dot(matrix.data[0]),
		this.data[0].y = rowVectY.dot(matrix.data[0]),
		this.data[0].z = rowVectZ.dot(matrix.data[0]),

		this.data[1].x = rowVectX.dot(matrix.data[1]),
		this.data[1].y = rowVectY.dot(matrix.data[1]),
		this.data[1].z = rowVectZ.dot(matrix.data[1]),

		this.data[2].x = rowVectX.dot(matrix.data[2]),
		this.data[2].y = rowVectY.dot(matrix.data[2]),
		this.data[2].z = rowVectZ.dot(matrix.data[2])
	}
	selfCopy(matrix)
	{
		this.data[0].selfCopy(matrix.data[0]);
		this.data[1].selfCopy(matrix.data[1]);
		this.data[2].selfCopy(matrix.data[2]);
	}
	copy()
	{
		return new ThreeMatrix(this.data[0],this.data[1],this.data[2]);
	}
	transpose()
	{
		var m = new ThreeMatrix(this);
		m.selfTranspose();
		return m;
	}
	selfTranspose()
	{
		var rowVectX = this.getRowVector(0);
		var rowVectY = this.getRowVector(1);
		var rowVectZ = this.getRowVector(2);
		this.setColumnVector(0,rowVectX);
		this.setColumnVector(1,rowVectY);
		this.setColumnVector(2,rowVectZ);
	}

	loadBasis(vectX,vectY,vectZ)
	{
		var basisX;
		var basisY;
		var basisZ;
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
identityMatrix: new ThreeMatrix(this.unitX,this.unitY,this.unitZ)
}
