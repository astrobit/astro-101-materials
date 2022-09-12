
class SkyMap
{
	project()
	{
		if (this._stars !== undefined && this._stars !== null && this._stars instanceof Array)
		{
			let projector;
			if (this.projectionTypeInternal == "Equirectangular")
				projector = new Equirectangular(this.centralRA,0.0)
			else if (this.projectionTypeInternal == "Mercator")
				projector = new Mercator(this.centralRA,0.0)
			else
				projector = new Mollweide(this.centralRA,0.0);
			this.starsProjection = new Array();
			let i;
			for (i = 0; i < this._stars.length; i++)
			{
				const rgb = UBVRItoRGB(this._stars[i].U,this._stars[i].B,this._stars[i].V,this._stars[i].R,this._stars[i].I,0,6)
				const rgbB_U = UBVRItoRGB(this._stars[i].U,null,null,null,null,0,6);
				const rgbB_B = UBVRItoRGB(null,this._stars[i].B,null,null,null,0,6);
				const rgbB_V = UBVRItoRGB(null,null,this._stars[i].V,null,null,0,6);
				const rgbB_R = UBVRItoRGB(null,null,null,this._stars[i].R,null,0,6);
				const rgbB_I = UBVRItoRGB(null,null,null,null,this._stars[i].I,0,6);
				var projection;
				switch (this.coordinatesInternal)
				{
				case "Equatorial":
				default:
					projection = projector.calculate(this._stars[i].dec,this._stars[i].ra);
					break;
				case "Ecliptic":
					projection = projector.calculate(this._stars[i].eclat,this._stars[i].eclong);
					break;
				case "Galactic":
					projection = projector.calculate(this._stars[i].gallat,this._stars[i].gallong);
					break;
				}
				this._stars[i].pidx = this.starsProjection.length;
				this.starsProjection.push({ x: projection.x, y: projection.y, style: rgb, styleU:rgbB_U, styleB:rgbB_B, styleV:rgbB_V, styleR:rgbB_R, styleI:rgbB_I, idx:i});
			}
		}
	}
	constructor(stars)
	{
//const projectionType = "Mollweide";
//const displayConstellations = true;
//const filter = "B"
		this.coordinatesInternal = "Equatorial";
		this.projectionType = "Mollweide";
		this.displayConstellationLevel = "major";
		this.filterInternal = "none";
		this.centralRA = 0.0;
		this.starsProjection = new Array();
		this._stars = stars;
		if (stars !== undefined && stars !== null)
			this.project();
		this.majorConstellationStyle = "#FFFFFF";
		this.zodiacConstellationStyle = "#FFFF00";
		this.minorConstellationStyle = "#7F7F7F";
		this.obscureConstellationStyle = "#3F3F3F";
	}
	set projectionType(type)
	{
		switch (type)
		{
		case "Mollweide":
		case "Equirectangular":
		case "Mercator":
			if (this.projectionTypeInternal != type)
			{
				this.projectionTypeInternal = type;
				this.project();
			}
			break;
		default:
			console.log("Invalid SkyMap projection " + type + ". Only Mollweide, Equirectangular, or Mercator are allowed.")
		}
	}
	get projectionType()
	{
		return this.projectionTypeInternal;
	}
	set filter(type)
	{
		switch (type)
		{
		case "none":
		case "U":
		case "B":
		case "V":
		case "R":
		case "I":
			this.filterInternal = type;
			break;
		default:
			console.log("Invalid SkyMap filter " + type + ". Only U, V, B, R, I, or none are allowed.")
		}
	}
	get filter()
	{
		return this.filterInternal;
	}
	set coordinates(type)
	{
		switch (type)
		{
		case "Equatorial":
		case "Galactic":
		case "Ecliptic":
			if (this.coordinatesInternal != type)
			{
				this.coordinatesInternal = type;
				this.project();
			}
			break;
		default:
			console.log("Invalid SkyMap coordinate system " + type + ". Only Equatorial, Galactic, or Ecliptic are allowed.")
		}
	}
	get coordinates()
	{
		return this.coordinatesInternal;
	}
	set displayConstellations(type)
	{
		switch (type)
		{
		case "none":
		case "zodiac":
		case "major":
		case "minor":
		case "all":
			this.displayConstellationLevel = type;
			break;
		default:
			console.log("Invalid SkyMap constellation display " + type + ". Only none, zodiac, major, minor, or all are allowed.")
		}
	}
	get displayConstellations()
	{
		return this.displayConstellationLevel;
	}
	
	set stars(value)
	{
		if (this._stars != value)
		{
			this._stars = value;
			this.project();
		}
		
	}
	
	draw(context,xCenter,yCenter,width,height)
	{
		context.save();
		
	// draw a black square for the map area box
		context.fillStyle = "#000000";
		context.fillRect(xCenter - width / 2,yCenter - height / 2,width,height);

	// draw the ellipse for the map
		if (this.projectionTypeInternal == "Mollweide")
		{
			context.strokeStyle  = "#FFFFFF";
			drawEllipseByCenter(context,xCenter,yCenter,width,height);
		}
	// draw the equator on the map
		context.strokeStyle  = "#3F3F3F";
		context.beginPath();
		context.moveTo(xCenter - width * 0.5,yCenter );
		context.lineTo(xCenter + width * 0.5,yCenter);
		context.stroke();
		if (this._stars !== undefined && this._stars !== null && this._stars.length > 0)
		{
			const mapImage = new ImgData(context, xCenter - width * 0.5, yCenter - height * 0.5, width, height);
		// draw the stars on the map
			var i;
			for (i = 0; i < this.starsProjection.length; i++)
			{
				let color;
				if (this.filterInternal == "none")
					color = this.starsProjection[i].style;
				else if (this.filterInternal == "U")
					color = this.starsProjection[i].styleU;
				else if (this.filterInternal == "B")
					color = this.starsProjection[i].styleB;
				else if (this.filterInternal == "V")
					color = this.starsProjection[i].styleV;
				else if (this.filterInternal == "R")
					color = this.starsProjection[i].styleR;
				else if (this.filterInternal == "I")
					color = this.starsProjection[i].styleI;
				const size = Math.max(1,3.0 - this._stars[this.starsProjection[i].idx].V / 6.0);
				drawStar(mapImage, (-this.starsProjection[i].x + 1.0) * width * 0.5, (-this.starsProjection[i].y + 1.0) * height * 0.5, size, color);
	/*			if (rad < 1.0)
					rad = 1.0;
				if (rad > 3.0)
					rad = 3.0;
				context.beginPath();
				context.arc(xCenter - this.starsProjection[i].x * width * 0.5,yCenter - this.starsProjection[i].y * height * 0.5,rad,0,2.0*Math.PI,true);
				context.closePath();
				context.fill();*/
			}
			mapImage.draw();
		// draw the constallations on the map
			if (this.displayConstellationLevel != "none")
			{
				let constellationLevel = 0;
				if (this.displayConstellationLevel == "zodiac")
					constellationLevel = 4;
				if (this.displayConstellationLevel == "major")
					constellationLevel = 3;
				if (this.displayConstellationLevel == "minor")
					constellationLevel = 2;
				if (this.displayConstellationLevel == "all")
					constellationLevel = 1;

				for (i = 0; i < constellationData.length; i++)
				{
					let j;
					for (j = 0; j < constellationData[i].pathData.length; j++)
					{
						if ((constellationData[i].type == "zodiac" && constellationLevel <= 4) ||
							(constellationData[i].type == "major" && constellationLevel <= 3) ||
							(constellationData[i].type == "minor" && constellationLevel <= 2) ||
							(constellationData[i].type == "obscure" && constellationLevel <= 1))
						{
							if (constellationData[i].type == "zodiac")
								context.strokeStyle  = this.zodiacConstellationStyle;
							if (constellationData[i].type == "major")
								context.strokeStyle  = this.majorConstellationStyle;
							if (constellationData[i].type == "minor")
								context.strokeStyle  = this.minorConstellationStyle;
							if (constellationData[i].type == "obscure")
								context.strokeStyle  = this.obscureConstellationStyle;
							context.beginPath();
							let k;
							let datacount = 0;
							let xlast = null;
							for (k = 0; k < constellationData[i].pathData[j].length; k++)
							{
								const idx = constellationData[i].pathData[j][k]
								if (this._stars[idx].pidx !== null)
								{
									const pidx = this._stars[idx].pidx
									const x = xCenter - this.starsProjection[pidx].x * width * 0.5;
									const y = yCenter - this.starsProjection[pidx].y * height * 0.5;
									if (xlast != null && Math.abs(x - xlast) > width * 0.25) // span map edges
									{
										context.stroke();
										datacount = 0;
									}
									xlast = x;
									if (datacount == 0)
										context.moveTo(x,y);
									else
										context.lineTo(x,y);
									datacount++;
								}
							}
							context.stroke();
						}
					}
				}
			}
		}
		context.restore();
	}
}
