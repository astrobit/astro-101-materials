
class SkyMap
{
	project()
	{
		var projector;
		if (this.projectionTypeInternal == "Equirectangular")
			projector = new Equirectangular(this.centralRA,0.0)
		else if (this.projectionTypeInternal == "Mercator")
			projector = new Mercator(this.centralRA,0.0)
		else
			projector = new Mollweide(this.centralRA,0.0);
		this.starsProjection = new Array();
		var i;
		for (i = 0; i < stars.length; i++)
		{
			var rgb = UBVRItoRGB(stars[i].U,stars[i].B,stars[i].V,stars[i].R,stars[i].I,0,6)
			var rgbB_U = UBVRItoRGB(stars[i].U,null,null,null,null,0,6);
			var rgbB_B = UBVRItoRGB(null,stars[i].B,null,null,null,0,6);
			var rgbB_V = UBVRItoRGB(null,null,stars[i].V,null,null,0,6);
			var rgbB_R = UBVRItoRGB(null,null,null,stars[i].R,null,0,6);
			var rgbB_I = UBVRItoRGB(null,null,null,null,stars[i].I,0,6);
			var projection;
			switch (this.coordinatesInternal)
			{
			case "Equatorial":
			default:
				projection = projector.calculate(stars[i].dec,stars[i].ra);
				break;
			case "Ecliptic":
				projection = projector.calculate(stars[i].eclat,stars[i].eclong);
				break;
			case "Galactic":
				projection = projector.calculate(stars[i].gallat,stars[i].gallong);
				break;
			}
			stars[i].pidx = this.starsProjection.length;
			this.starsProjection.push({ x: projection.x, y: projection.y, style: rgb.style, styleU:rgbB_U.style, styleB:rgbB_B.style, styleV:rgbB_V.style, styleR:rgbB_R.style, styleI:rgbB_I.style, idx:i});
		}
	}
	constructor(context,x,y,width,height)
	{
//var projectionType = "Mollweide";
//var displayConstellations = true;
//var filter = "B"
		this.xCenter = x;
		this.yCenter = y;
		this.width = width;
		this.height = height;
		this.context = context;
		this.coordinatesInternal = "Equatorial";
		this.projectionType = "Mollweide";
		this.displayConstellationLevel = "major";
		this.filterInternal = "none";
		this.centralRA = 0.0;
		this.starsProjection = new Array();
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
			this.projectionTypeInternal = type;
			this.project();
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
			this.coordinatesInternal = type;
			this.project();
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
	draw()
	{
		var mapWidth = this.width;
		var mapHeight = this.height;
		var mapCenterX = this.xCenter;
		var mapCenterY = this.yCenter;

	// draw a black square for the map area box
		this.context.fillStyle = "#000000";
		this.context.fillRect(mapCenterX - mapWidth / 2,mapCenterY - mapHeight / 2,mapWidth,mapHeight);

	// draw the ellipse for the map
		if (this.projectionTypeInternal == "Mollweide")
		{
			this.context.strokeStyle  = "#FFFFFF";
			drawEllipseByCenter(this.context,mapCenterX,mapCenterY,mapWidth,mapHeight);
		}
	// draw the equator on the map
		this.context.strokeStyle  = "#3F3F3F";
		this.context.beginPath();
		this.context.moveTo(mapCenterX - mapWidth * 0.5,mapCenterY );
		this.context.lineTo(mapCenterX + mapWidth * 0.5,mapCenterY);
		this.context.stroke();

	// draw the stars on the map
		var i;
		for (i = 0; i < this.starsProjection.length; i++)
		{
			if (this.filterInternal == "none")
				this.context.fillStyle  = this.starsProjection[i].style;
			else if (this.filterInternal == "U")
				this.context.fillStyle  = this.starsProjection[i].styleU;
			else if (this.filterInternal == "B")
				this.context.fillStyle  = this.starsProjection[i].styleB;
			else if (this.filterInternal == "V")
				this.context.fillStyle  = this.starsProjection[i].styleV;
			else if (this.filterInternal == "R")
				this.context.fillStyle  = this.starsProjection[i].styleR;
			else if (this.filterInternal == "I")
				this.context.fillStyle  = this.starsProjection[i].styleI;
			var rad = 2.0 - stars[this.starsProjection[i].idx].V / 6.0 * 1.0;
			if (rad < 1.0)
				rad = 1.0;
			if (rad > 3.0)
				rad = 3.0;
			this.context.beginPath();
			this.context.arc(mapCenterX - this.starsProjection[i].x * mapWidth * 0.5,mapCenterY - this.starsProjection[i].y * mapHeight * 0.5,rad,0,2.0*Math.PI,true);
			this.context.closePath();
			this.context.fill();
		}
	// draw the constallations on the map
		if (this.displayConstellationLevel != "none")
		{
			var constellationLevel = 0;
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
				var j;
				for (j = 0; j < constellationData[i].pathData.length; j++)
				{
					if ((constellationData[i].type == "zodiac" && constellationLevel <= 4) ||
						(constellationData[i].type == "major" && constellationLevel <= 3) ||
						(constellationData[i].type == "minor" && constellationLevel <= 2) ||
						(constellationData[i].type == "obscure" && constellationLevel <= 1))
					{
						if (constellationData[i].type == "zodiac")
							this.context.strokeStyle  = this.zodiacConstellationStyle;
						if (constellationData[i].type == "major")
							this.context.strokeStyle  = this.majorConstellationStyle;
						if (constellationData[i].type == "minor")
							this.context.strokeStyle  = this.minorConstellationStyle;
						if (constellationData[i].type == "obscure")
							this.context.strokeStyle  = this.obscureConstellationStyle;
						this.context.beginPath();
						var k;
						var datacount = 0;
						var xlast = null;
						for (k = 0; k < constellationData[i].pathData[j].length; k++)
						{
							var idx = constellationData[i].pathData[j][k]
							if (stars[idx].pidx !== null)
							{
								var pidx = stars[idx].pidx
								var x = mapCenterX - this.starsProjection[pidx].x * mapWidth * 0.5;
								var y = mapCenterY - this.starsProjection[pidx].y * mapHeight * 0.5;
								if (xlast != null && Math.abs(x - xlast) > mapWidth * 0.25) // span map edges
								{
									this.context.stroke();
									datacount = 0;
								}
								xlast = x;
								if (datacount == 0)
									this.context.moveTo(x,y);
								else
									this.context.lineTo(x,y);
								datacount++;
							}
						}
						this.context.stroke();
					}
				}
			}
		}
	}
}
