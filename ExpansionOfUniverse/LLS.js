// linear least squares fitting

class LLS
{
	constructor(vecX, vecY)
	{
		if (vecX.length == vecY.length && vecX.length > 1)
		{
			var sY = 0;
			var sX = 0;
			var sX2 = 0;
			var sXY = 0;
			var sOy = 0;
			var invN = 1.0 / vecX.length;
			var idxLcl;
			for (idxLcl = 0; idxLcl < vecX.length; idxLcl++)
			{
				sY += vecY[idxLcl];
				sX += vecX[idxLcl];
				sX2 += vecX[idxLcl] * vecX[idxLcl];
				sXY += vecX[idxLcl] * vecY[idxLcl];
			}
			var invDelta = 1.0 / (vecX.length * sX2 - sX * sX);
			this._m = (vecX.length * sXY - sX * sY) * invDelta;
			this._b = (sX2 * sY - sX * sXY) * invDelta;
			if (vecX.length > 2)
			{
				for (idxLcl = 0; idxLcl < vecX.length; idxLcl++)
				{
					var err = vecY[idxLcl] - this._b - this._m * vecX[idxLcl];
					sOy += err * err;
				}
				this._oy = Math.sqrt(sOy / (vecX.length - 2.0));
				this._ob = Math.sqrt(sX2 * invDelta) * this._oy;
				this._om = Math.sqrt(vecX.length * invDelta) * this._oy;
			}
			else
			{
				this._oy = 0;
				this._ob = 0;
				this._om = 0;
			}
		}
		else
			console.log('LLS constructed with vectors of differing lengths');
	}
	get slope() {return this._m;}
	get intercept() {return this._b;}
	get slope_uncertainty() {return this._om;}
	get intercept_uncertainty() {return this._ob;}

	y(x)
	{
		return this._m * x + this._b;
	}
	oy(x)
	{
		return Math.sqrt(this._ob * this._ob + this._om * this._om * x * x);
	}
}
