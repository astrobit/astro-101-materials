//Schechter luminosity function for galaxies
//

const GalaxyLuminosityFunction = {
	generateInstance: function (Lstar, alpha, Lmin, Lmax)
	{
		let ret = new Object();
		ret.__type = "Luminosity Function";
		ret._Lstar = Lstar;
		ret._alpha = alpha;
		ret._Lmin = Lmin;
		ret._Lmax = Lmax;

		ret._C = 1.0 / (Math.pow(Lmin,alpha) * Math.exp(-Lmin) - Math.pow(Lmax,alpha) * Math.exp(-Lmax));
		ret._A = Math.pow(Lmin,alpha) * Math.exp(-Lmin);
		return ret;
	},
	LF: function(instance,x)
	{
		return (instance._A - Math.pow(x,instance._alpha) * Math.exp(-x)) * instance._C;
	},
	dLF: function (instance,x)
	{
		return -(instance._alpha  * Math.pow(x,instance._alpha - 1) - Math.pow(x,instance._alpha)) * Math.exp(-x) * instance._C;
	},
	random: function(instance)
	{
		let v = Math.random();
		let x = 1.0;
		let f = GalaxyLuminosityFunction.LF(instance,x);
		let n = 0;
		while (Math.abs(f - v) > 0.0001 && n < 100)
		{
			dx = (f - v) / GalaxyLuminosityFunction.dLF(instance,x);
			if (dx > x)
				x *= 0.9;
			else if (-dx > x)
				x *= 1.1;
			else
				x -= (f - v) / GalaxyLuminosityFunction.dLF(instance,x);
			f = GalaxyLuminosityFunction.LF(instance,x);
			n++;
		}
		return x * instance._Lstar;
	}

};
Object.freeze(GalaxyLuminosityFunction);


