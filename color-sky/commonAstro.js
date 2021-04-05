
var commonAstroLogRegister = 0;

function UBVRItoRGB(U,B,V,R,I,brightMag,dimMag)
{
	var brightMagInternal = brightMag;
	if (typeof brightMag === undefined || brightMag === null)
	{
		brightMagInternal = 0.0;
		if (!(commonAstroLogRegister & 0x01))
		{
			console.log("using mag 0.0 as bright")
			commonAstroLogRegister = commonAstroLogRegister  | 0x01;
		}
	}
	var dimMagInternal = dimMag;
	if (typeof dimMag === undefined || dimMag === null)
	{
		dimMagInternal = 6.0;
		if (!(commonAstroLogRegister & 0x02))
		{
			console.log("using mag 6.0 as dim")
			commonAstroLogRegister = commonAstroLogRegister  | 0x02;
		}
	}

	var colorIndex = null;
	if (B !== null && V !== null)
	{
		colorIndex = B - V;
		colorBlue = 0.0;
		colorRed = 1.35;
		colorYel = 0.65;
	}
	else if (V !== null && R !== null)
	{
		colorIndex = V - R;
		colorBlue = 0.0;
		colorRed = 1.20;
		colorYel = 0.55;
	}
	else if (U !== null && B !== null)
	{
		colorIndex = U - B;
		colorBlue = 0.0;
		colorRed = 1.10;
		colorYel = 0.15;
	}
	else if (R !== null && I !== null)
	{
		colorIndex = R - I;
		colorBlue = 0.0;
		colorRed = 0.8;
		colorYel = 0.35;
	}

	var cB = 255;
	var cG = 255;
	var cR = 255;
	if (colorIndex !== null)		
	{
		cB = 255;
		cG = 255;
		cR = 255;

		if (colorIndex < colorBlue)
		{
			cR = 127;
			cG = 127;
		}
		else if (colorIndex > colorRed)
		{
			cR = 255;
			cG = 0;
			cB = 0;
		}
		else if (colorIndex < colorYel)
		{
			var Bdel = Math.round(colorIndex / colorYel * 128.0) + 127;
			cR = Bdel;
			cG = Bdel;
			cB = 255;
		}
		else
		{
			var Bdel = Math.round((colorRed - colorIndex) / (colorRed - colorYel) * 255.0);
			cR = 255;
			cG = Bdel;
			cB = Bdel;
		}
	}
	var brightBasis = null;
	if (V !== null)
		brightBasis = V;
	else if (R !== null)
		brightBasis = R;
	else if (B !== null)
		brightBasis = B;
	else if (U !== null)
		brightBasis = U;
	else if (I !== null)
		brightBasis = I;
	else
		brightBasis = dimMagInternal;

	var bright = 0;
	if (brightBasis != null)
	{
		bright = 1.0 - (brightBasis - brightMagInternal) / (dimMagInternal - brightMagInternal);//Math.pow(10.0,-brightBasis/5*1.2);
		if (bright > 1.0)
			bright = 1.0;
		if (bright < 0.0)
			bright = 0.0;
		cR *= bright;
		cG *= bright;
		cB *= bright;
	}
	return {r:Math.round(cR), g:Math.round(cG), b:Math.round(cB), bright:bright};
}
