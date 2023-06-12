// 2-dimensional linear fitting using least squares

class LLS
{
	constructor(vecX, vecY)
	{
		if (vecX.length == vecY.length && vecX.length > 1)
		{
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
			this._count = vecX.length;
			const invDelta = 1.0 / (vecX.length * sX2 - sX * sX);
			this._m = (vecX.length * sXY - sX * sY) * invDelta;
			this._b = (sX2 * sY - sX * sXY) * invDelta;
			const sigmaSq = (sY2 + this._count * this._b * this._b + this._m * this._m * sX2 - 2 * this._b * sY - 2 * this._m * sXY + 2 * this._m * this._b * sX) / (this._count  - 1);
			this._sigma = Math.sqrt(sigmaSq);
			let sOmEoE = 0;
			for (let idxLcl = 0; idxLcl < vecX.length; idxLcl++)
			{
				let E = this._m * vecX[idxLcl] + this._b;
				let d = vecY[idxLcl] - E;
				sOmEoE += d * d / (E * E);
			}
			this._chiSq = sOmEoE;
			if (vecX.length > 2)
			{
				for (let idxLcl = 0; idxLcl < vecX.length; idxLcl++)
				{
					const err = vecY[idxLcl] - this._b - this._m * vecX[idxLcl];
					sOy += err * err;
				}
				this._oy = Math.sqrt(sOy / (vecX.length - 2.0));
				this._ob = Math.sqrt(sX2 * invDelta) * this._oy;
				this._om = Math.sqrt(vecX.length * invDelta) * this._oy;
				this._chiSqDOF = this._chiSq / (vecX.length - 2);
			}
			else
			{
				this._oy = 0;
				this._ob = 0;
				this._om = 0;
				this._chiSqDOF = 0;
			}
		}
		else if(vecX.length != vecY.length)
			console.log('LLS constructed with vectors of differing lengths');
		else
			console.log('LLS cannot be run with 0 or 1 data points');
	}
	get count() {return this._count;}
	get slope() {return this._m;}
	get intercept() {return this._b;}
	get slope_uncertainty() {return this._om;}
	get intercept_uncertainty() {return this._ob;}
	get chi_squared() {return this._chiSq;}
	y(x)
	{
		return this._m * x + this._b;
	}
	oy(x)
	{
		return Math.sqrt(this._ob * this._ob + this._om * this._om * x * x);
	}
}

class LLScontainer
{
	clear()
	{
		this._x = new Array();
		this._y = new Array();
	}
	constructor()
	{
		this.clear();
	}
	add(x,y)
	{
		this._x.push(x);
		this._y.push(y);
	}
	get LLS()
	{
		return new LLS(this._x,this._y);
	}
}

