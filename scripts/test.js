"use strict";

class DrawStarInfo
{
    constructor(ra, dec, flux, color)
    {
        this.ra = ra;
        this.dec = dec;
        this.flux = flux;
        this.color = color;
    }
}
class vec4
{
	constructor(_x,_y,_z,_w)
	{
		this.x = ValidateValue(_x) ? _x : 0.0;
		this.y = ValidateValue(_y) ? _y : 0.0;
		this.z = ValidateValue(_z) ? _z : 0.0;
		this.w = ValidateValue(_w) ? _w : 0.0;
	}
}
class vec3
{
	constructor(_x,_y,_z)
	{
		this.x = ValidateValue(_x) ? _x : 0.0;
		this.y = ValidateValue(_y) ? _y : 0.0;
		this.z = ValidateValue(_z) ? _z : 0.0;
	}
}
class vec2
{
	constructor(_x,_y)
	{
		this.x = ValidateValue(_x) ? _x : 0.0;
		this.y = ValidateValue(_y) ? _y : 0.0;
	}
}
function clamp(v,min,max)
{
	return Math.max(Math.min(v,max),min);
}

let av_position = new Array();

let	uvf_PointSize = 0.0;
let	uvv_PositionScaling = new vec2(1.0,1.0);
let	uvf_Pxy = 1.0;
let	uvf_mPy = 0.0;
let	uvf_mPz = 0.0;

let	vv_color = new vec4(1.0,1.0,1.0,1.0);
let	vf_flux = 0.0;

let gl_Position = new vec4();
let gl_PointSize = 1.0;


///////////////////////////////////////////////////////
// vertex shader
///////////////////////////////////////////////////////

function testVtxShader(i)
{
	const rx = radians(av_position[i].x * 15.0);
	const ry = radians(av_position[i].y);
	const cosAlpha = Math.cos(rx);
	const sinAlpha = Math.sin(rx);
	const cosDec = Math.cos(ry);
	const sinDec = Math.sin(ry);
	const ax = cosAlpha * cosDec;
	const ay = sinAlpha * cosDec;
	const az = sinDec;

	gl_Position.x = (uvf_mPz * ax +  uvf_Pxy * az) * uvv_PositionScaling.x;
	gl_Position.y = (uvf_mPy * ax -  uvf_Pxy * ay) * uvv_PositionScaling.y;
	gl_Position.z = 0.0;
	gl_Position.w = 1.0;
	gl_PointSize = uvf_PointSize;
	// Convert from clipspace to colorspace.
	// Clipspace goes -1.0 to +1.0
	// Colorspace goes from 0.0 to 1.0
	vv_color = new vec4(1.0,1.0,1.0,1.0);
	vf_flux = av_position.z;
}

///////////////////////////////////////////////////////
// fragment shader
////////////////////////////////////////////////////////

let	uff_BesselMax = 3.2;
let	uff_Normalization = 1.0;

function FRGbessel1(x)
{
	const hx = 0.5 * x;
	const hx2 = hx * hx;
	let z = hx;
	let r = hx;
	let f = 1.0;
	let m;
	for (m = 1; m < 60; m++)//@@TODO may need to increase m max for large x; haven't tested limits yet
	{	
		z *= hx2;
		let fm = float(m);
		f *= -1.0 * (fm * (fm + 1.0));
		r += z / f;
	}
	return r;
}
let gl_PointCoord = new vec2();
let gl_FragColor = new vec4();
function testVtxShader()
{
	const px = (gl_PointCoord.x - 0.5) * 2.0 * uff_BesselMax;
	const py = (gl_PointCoord.y - 0.5) * 2.0 * uff_BesselMax;
	const r = Math.sqrt(px * px + py * py);
	let f = 1.0;
	if (r > 0.0)
	{
		let br = bessel1(r);
		f = 4.0 * br * br / (r * r);
	}    
	//		float F = clamp(f * v_flux * u_FluxScaling * u_BesselNormalization, 0.0,1.0);
	let F = clamp(f * vf_flux * uff_Normalization, 0.0,1.0);
	gl_FragColor.x = vv_color.x * F;
	gl_FragColor.y = vv_color.y * F;
	gl_FragColor.z = vv_color.z * F;
	gl_FragColor.w = 1.0;
}
	

class DrawStars
{
    constructor()
    {
		this.canvas = document.getElementById("canvas");
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight - 60;
		this.gl = this.canvas.getContext("webgl2",{antialias: false});
		const ext = this.gl.getExtension("EXT_color_buffer_float");
		this.program = null;
		this.starList = new Array();
		this.colorStars = false;
		this.saturationFlux = 65535.0;
		this.maxFlux = 0;
		this.resetStarList();
		this._centralPosition = [0.0, 0.0];
		this._pixelSize = 1.0;
		this._focalLength = 1.0;
		this._pixelScale = Math.atan(this._pixelSize / this._focalLength); 
		this._difractionDiskSize = 1.0;



    }
    
    _createShader(type, source)
    {
        let shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (!success)
        {
            console.log(this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            shader = null;
        }
        return shader;
    }

    prepareShaders(vertexShaderSource, fragmentShaderSource)
    {
        if (this.program == null)
        {
            this.program = this.gl.createProgram();
            if (ValidateString(vertexShaderSource))
            {
                this.vertex_shader = this._createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
                this.gl.attachShader(this.program, this.vertex_shader);
            }
            if (ValidateString(fragmentShaderSource))
            {
                this.fragment_shader = this._createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
                this.gl.attachShader(this.program, this.fragment_shader);
            }
            this.gl.linkProgram(this.program);
            var success = this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS);
            if (!success)
            {
                console.log(this.gl.getProgramInfoLog(this.program));
                this.gl.deleteProgram(this.program);
                this.program = null;
            }
        }
        if (this.program != null)
        {
            // Tell it to use our program (pair of shaders)
            this.gl.useProgram(this.program);

            // look up where the vertex data needs to go.
            this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "av_position");
//            this.fluxAttributeLocation = this.gl.getAttribLocation(this.program, "a_flux");
//            this.colorAttributeLocation = this.gl.getAttribLocation(this.program, "a_color");
			this.fluxesBufferLocation = this.gl.getAttribLocation(this.program, "af_flux");

			this.gl.activeTexture(this.gl.TEXTURE0);
			this._texture = this.gl.createTexture();
			this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
 
            // lookup uniforms
            this.uvv_PositionScaling = this.gl.getUniformLocation(this.program, "uvv_PositionScaling");
            this.uvf_Pxy = this.gl.getUniformLocation(this.program, "uvf_Pxy");
            this.uvf_mPy = this.gl.getUniformLocation(this.program, "uvf_mPy");
            this.uvf_mPz = this.gl.getUniformLocation(this.program, "uvf_mPz");
			this.uvv_SampleOffset = this.gl.getUniformLocation(this.program, "uvv_SampleOffset");
            this.uvf_PointSize = this.gl.getUniformLocation(this.program, "uvf_PointSize");
            
            this.uff_FluxScaling = this.gl.getUniformLocation(this.program,"uff_FluxScaling");
			this.ufs_Sampler = this.gl.getUniformLocation(this.program,"ufs_Sampler");
			this.uff_Sampling_Correction = this.gl.getUniformLocation(this.program,"uff_Sampling_Correction");
			
			

			this.gl.uniform1i(this.ufs_Sampler, 0);
			this.gl.uniform2fv(this.uvv_PositionScaling, new Float32Array([1.0, 1.0]));
			this.gl.uniform1f(this.uvf_Pxy, 1.0);
			this.gl.uniform1f(this.uvf_mPy, 0.0);
			this.gl.uniform1f(this.uvf_mPz, 0.0);
			this.gl.uniform1f(this.uvf_PointSize, 1.0);

//			this.gl.uniform1f(this.uff_BesselMax, 3.83);
//			this.gl.uniform1f(this.uff_normalization, 1.0)
			this.gl.uniform1f(this.uff_FluxScaling,1.0 / 65535.0);
			this.gl.uniform1f(this.uff_Sampling_Correction, 1.0);

    	// generate textures
    	
	    	let arrsize = this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS);
 

            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.ONE, this.gl.ONE);

            this.positionBuffer = this.gl.createBuffer();
            this.fluxBuffer = this.gl.createBuffer();
            this.colorBuffer = this.gl.createBuffer();
        }
    }

	centralPosition(ra, dec)
	{
		if (ValidateValue(ra) && ValidateValue(dec))
			this._centralPosition = [ra, dec];
		return this._centralPosition;
	}
    // set physical pixel size (in same units as focal length)
    set pixelSize(size)
    {
        this._pixelSize = size;
        this._pixelScale = Math.atan(this._pixelSize / this._focalLength); 
    }
    get seeingDisk()
    {
    	return this._seeingHWHM; 
    }
    set seeingDisk(seeingHWHM)
    {
    	this._seeingHWHM = seeingHWHM;
        this._seeingStDev = radians(seeingHWHM / Math.sqrt(2.0 * Math.log(2.0)) / 3600.0);
    }
    set focalLength(f) // resolution limit in arcsec
    {
        this._focalLength = f;
        this._pixelScale = Math.atan(this._pixelSize / this._focalLength); 
    }
    get focalLength()
    {
    	return this._focalLength;
    }
    set diffractionDiskSize(d) // in radians!
    {
    	this._difractionDiskSize = d;
    }
	get diffractionDiskSize()
	{
		return this._difractionDiskSize;
	}

    draw(exposure_length)
    {
        const iterPerSec = 32; // # of iterations per second; used to simulate seeing
        const sampling = 1.0 / iterPerSec; 
        const passes = Math.ceil(exposure_length / sampling);
        this._prepStarArrays();
//        const iterPerSec = 8; // # of iterations per second; used to simulate seeing

/*        if (this.colorStars)
        {
            size = 3;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, this.starColors, this.gl.STATIC_DRAW);
            this.gl.vertexAttribPointer(this.colorAttributeLocation, size, type, normalize, stride, offset);
        }
        */
        // Tell WebGL how to convert from clip space to pixels
        this.gl.useProgram(this.program);
        
        
		const rDec = radians(this._centralPosition[1]);
		const cosDec = Math.cos(rDec);
		const Pxy = cosDec;
		const mPy = -cosDec * Math.sin(radians(this._centralPosition[0] * 15.0));
		const mPz = -Math.sin(rDec);


        const scale = this._pixelSize / this._focalLength;
        const scaleX = scale * 2.0 / this.gl.canvas.width;
        const scaleY = scale * 2.0 / this.gl.canvas.height;
        this.gl.uniform2fv(this.uvv_PositionScaling, new Float32Array([scaleX, scaleY]));
        this.gl.uniform1f(this.uvf_Pxy, Pxy);
        this.gl.uniform1f(this.uvf_mPy, mPy);
        this.gl.uniform1f(this.uvf_mPz, mPz);
        this.gl.uniform1f(this.uvf_PointSize, this.pointSize);
//        this.gl.uniform1f(this.uff_Sampling_Correction,sampling);
        this.gl.uniform1f(this.uff_Sampling_Correction,1.0);
        
			this.gl.uniform1f(this.uff_FluxScaling,exposure_length / 65535.0);


        this.gl.uniform1f(this.uff_BesselMax, this.airyMax);
        this.gl.uniform1f(this.uff_Normalization, this.besselNormalization / this.saturationFlux * sampling); 

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the canvas.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        // Draw the geometry.
		this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.starCoords, this.gl.STATIC_DRAW);

		this.gl.enableVertexAttribArray(this.fluxesBufferLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.fluxBuffer);
        this.gl.vertexAttribPointer(this.fluxesBufferLocation, 1, this.gl.FLOAT, false, 0, 0);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.starFluxes, this.gl.STATIC_DRAW);

		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
//		if (this.colorStars )
//			this.gl.enableVertexAttribArray(this.colorAttributeLocation);
		const numStars = this.starsCount;
        let i;
//		const arcsecToDeg = 1.0 / 3600.0;

//		for (i = 0; i < passes; i++)
//		{
//			const r = random_gaussian(0.0, this._seeingStDev);
//			const theta = Math.random() * 2.0 * Math.PI;
//			const dec_shift = r * Math.sin(theta);
//			const ra_shift = r * Math.cos(theta);

			this.gl.uniform2fv(this.uvv_SampleOffset, new Float32Array([0.0,0.0]));

			this.gl.drawArrays(this.gl.POINTS, 0, numStars);
//		}

    }
    resetStarList()
    {
    	this.maxFlux = 0;
        this.numStars = 0;
        this.starsCount = 0;
        this.starCoordsInternal = new Array();
        this.starFluxesInternal = new Array();
        this.starColorsInternal = new Array();
    }
    addStar(ra, dec, flux) // flux in total counts/sec
    {
        this.starCoordsInternal.push(ra);
        this.starCoordsInternal.push(dec);
        this.starFluxesInternal.push(flux);
        if (flux > this.maxFlux)
        	this.maxFlux = flux;
        this.starsCount++;
        //@@TODO: colors
        //this.starColorsInternal.push(color.r,color.g,color.b);
    }
    _prepStarArrays()
    {
        if (this.numStars != this.starsCount)
        {
            this.numStars = this.starsCount;
            this.starCoords = new Float32Array(this.starCoordsInternal);
            this.starFluxes = new Float32Array(this.starFluxesInternal);
            this.starColors = new Float32Array(this.starColorsInternal);
			const nflux = this.maxFlux / this.saturationFlux;
			let airy_size = 1;
			let cflux = nflux;
			let m;
			for (m = 1; m < 9 && cflux > 0.1; m++)
			{
				const r = bessel1_maxima(m);
				const br = bessel(1,r);
				const f = 4.0 * br * br / (r * r);
				
				cflux = f * nflux;
				airy_size = m;
			}
			this.airyMax = bessel1_maxima(airy_size);
			const size = this.airyMax / bessel1_minima(0) * this._difractionDiskSize / this._pixelScale; // extended size
			this.pointSize = Math.max(Math.min(Math.floor(Math.ceil(size * 2.0) * 0.5) * 2.0 + 1.0, 63.0), 3.0); // size in pixels
			this.airyMax = this.pointSize * bessel1_minima(0) * this._pixelScale / this._difractionDiskSize;
		    this.besselNormalization = airyDiscreteNormalization(Math.ceil(this.pointSize * 0.5), airy_size);
			
        }
    	const n = (this.pointSize - 1) * 0.5;
   		let dsize = this.pointSize * this.pointSize;
   		if (dsize < 1)
   			dsize = 1;
    	let data = new Uint8Array(dsize * 4); 
   		let dataf = new Array(dsize);
   		let idx;
   		for (idx = 0; idx < dsize; idx++)
   			dataf[idx] = 0.0;
   			
    	if (dsize > 1)
    	{
			let p;
			let sum = 0.0;
//			const b1min8 = bessel1_minima(8);
			const b1max8 = bessel1_maxima(8);
			let s;
			const invn = 1.0 / n;
			let v;
			let u;
			let pass;
			for (pass = 0; pass < 32; pass++)
			{
		        const r = random_gaussian(0.0, this._seeingStDev) / this._pixelScale;
		        const theta = Math.random() * 2.0 * Math.PI;
		        const dec_shift = r * Math.sin(theta);
		        const ra_shift = r * Math.cos(theta);
				idx = 0;
				for (v = -n; v <= n; v++)
				{
					for (u = -n; u <= n; u++)
					{
						const U = (u + ra_shift) * invn;
						const V = (v + dec_shift) * invn ;
						const R = Math.sqrt(U * U + V * V);
						let f = 1.0;
						if (R > 0)
						{
							let r = this.airyMax * R;
							if (r < b1max8)
							{
								const br = bessel(1,r);
								f = 4.0 * br * br / (r * r);
							}
							else
								f = 0.0;
						}
						dataf[idx] += f;
						idx++;
						sum += f;
					}
				}
			}
			const norm = 1.0 / sum;
			for (p = 0; p < dataf.length; p++)
			{
				const x = dataf[p] * norm * 255.0;
				dataf[p] *= norm;
				data[p * 4 + 0] = x;
				data[p * 4 + 1] = x;
				data[p * 4 + 2] = x;
				data[p * 4 + 3] = 255	;
			}
		}
		else
		{
			data[0] = 255;
			data[1] = 255;
			data[2] = 255;
			data[3] = 255;
		}
		this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
		this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.pointSize,this.pointSize,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,data);
//		this.gl.uniform1fv(this.ufvf_Airy,data);
//		this.gl.uniform1f(this.uff_Stride,this.pointSize);
//		this.gl.uniform1i(this.ufi_Stride,this.pointSize);
		
    }
}
let _vertexShader = document.getElementById("vertex-shader-2d").text;
let _fragmentShader = document.getElementById("fragment-shader-2d").text;


function bessel1(x)
{
	const hx = 0.5 * x;
	const hx2 = hx * hx;
	let z = hx;
	let r = hx;
	let f = 1;
	let m;
	let i = 1;
	for (m = 1; m < 60; m++)
	{	
		z *= hx2;
		f *= -1 * (m * (m + 1));
		r += z / f * i;
	}
	return r;
//    return hx * (0.25 + hx * (-1.0 / 6.0 + hx * (1.0 / 48.0 + hx * (-1.0 / 720.0 + hx * (1.0 / 17280.0 + hx * (-1.0 / 604800.0 + hx * (1.0 / 29030400.0 + hx * (-1.0 / 1828915200.0))))))));
}
/*
function besseltest()
{	let r;
	for (r = 0; r < 15; r += 0.05)
	{
		if (r > 0.0)
		{
			let br = bessel1(r);
		    let l = 4.0 * br * br / (r * r);
			console.log(r + " " + l);
		}
	}
}
besseltest();*/
/*function besselnormtest()
{
	let p = 1;
	for (p = 1; p < 32; p++)
	{
		console.log(p + " " + airyDiscreteNormalization(p,8,1));
	}
}
besselnormtest();

function besselftest(a,x,e)
{
	let m = 0;
	let ret = 0;
	let fdelta = 1;
	let epsilon = e;
	if (e === undefined || e == null)
	{
		epsilon = Number.EPSILON;
	}
	do
	{
		let sign = (m % 2) == 1 ? -1 : 1;
		let denom = factorial(m) * gamma(m + a + 1);
		let delta = Math.pow(x * 0.5,2 * m + a) / denom * sign;
		ret += delta;
		fdelta = Math.abs(delta / ret);
		m++;
	} while (fdelta > epsilon);
	console.log("btest:" + x + " " + m + " " + fdelta);
	return ret;
}
function besselCheck()
{
	let m = 0; 
	for (m = 0; m < 9; m++)
	{
		const r = bessel1_maxima(m);
		const br = bessel(1,r);
		const f = r == 0 ? 1.0 : 4.0 * br * br / (r * r);
		console.log("bmax: " + r + " " + m + " " + f);

		const br2 = bessel1(r);
		const f2 = r == 0 ? 1.0 : 4.0 * br2 * br2 / (r * r);
		console.log("bmax2: " + r + " " + m + " " + f2);
	}
}
besselCheck();*/
/*
function shaderTest()
{
	let m;
	const rflux = 6000000000.0;
	const nflux = rflux / 65535.0;
	let airy_size = 1;
	let cflux = nflux;
	for (m = 1; m < 9 && cflux > 0.1; m++)
	{
		const r = bessel1_maxima(m);
		const br = bessel1(r);
		const f = 4.0 * br * br / (r * r);
		
	    cflux = f * nflux;
		airy_size = m;
	}
	console.log("airy size = " + airy_size);
    const  u_AiryMax = bessel1_minima(airy_size);
    console.log("airy max = " + u_AiryMax);
    const centralSize = bessel1_minima(1);
    const pixScale = 0.1;
    const size = pixScale * u_AiryMax / bessel1_minima(0); // extended size in arc-sec
    const sizePix = Math.max(Math.min(Math.floor(Math.ceil(size / pixScale * 2.0) * 0.5) * 2.0 + 1.0, 63.0), 1.0); // size in pixels
    console.log("size = " + sizePix);
    const u_BesselNormalization = airyDiscreteNormalization(Math.ceil(sizePix * 0.5), airy_size);
    console.log("normalization = " + u_BesselNormalization);
    const sampling = 1.0;
	const u_normalization = u_BesselNormalization / 65535.0 * sampling;


    let focalLength = 11000; // 11 m
    let pixelSize = 24.6e-3; // 24.6 microns
    let FOV = degrees(pixelSize / focalLength) * 512;
    const uvv_CentralPosition = {x:0.0, y:0.0};
	const uvv_PositionScaling = {x:focalLength / pixelSize * 2.0 / canvas.width, y:focalLength / pixelSize * 2.0 / canvas.height}; 
	const rDec = radians(uvv_CentralPosition.y);
	const cosDec = Math.cos(rDec);
    const uvf_Pxy = cosDec;
    const uvf_mPy = -cosDec * Math.sin(radians(uvv_CentralPosition.x));
    const uvf_mPz = -Math.sin(rDec);
    
     
    let i;
    for (i = 0; i < sizePix; i++)
    {
        const x = (i + 0.5) / sizePix;
        const y = 0.5;
        const r = testShader(x, y, rflux);
        console.log(r);
    }
    
    let j;
    for (j = 0; j < 4; j++)
    {
    	let dec = j / 3 * FOV;
    	console.log("dec = " + dec);
		for (i = 0; i < 4; i++)
		{
			let ra = i / 3 * FOV / 15.0; //deg to hours
			let res = testVtxShader(ra,dec,0.0);
			console.log(res.x + " " + res.y);
		} 
	}
}
shaderTest();

*/
//getFile("scripts/star.vert").then(function (result) {
//                                                            _vertexShader = result;
//                                                        },
//                                                        function (error) {
 //                                                           console.log("Error loading vertex shader: " + error);
//                                                        }
//                                                    );
//
//getFile("scripts/star.frag").then(function (result) {
//                                                            _fragmentShader = result;
//                                                        },
//                                                        function (error) {
//                                                            console.log("Error loading fragment shader: " + error);
//                                                        }
//                                                    );




let shadersReady = false;
let drawer = new DrawStars();
function waitOnShaders()
{
    if (_vertexShader == null || _fragmentShader == null)
    {
        window.setTimeout(waitOnShaders, 1000.0 / 30.0);
    }
    else
    {
        shadersReady = true;
        drawer.prepareShaders(_vertexShader, _fragmentShader)
       main();
    }
}
waitOnShaders();

function main()
{
    if (shadersReady)
    {
    	let diameter = 0.0508;//6.0; // mn
    	let pixelSize = 24.0e-6; // m
    	let focalLength = 0.8128 * 16.0;//6.0; //m
    	let wavelength = 550.0e-9; // m
    	
        drawer.centralPosition(1.0, 1.0);
        drawer.seeingDisk = 2.0; //"
        drawer.pixelSize = pixelSize; // 24.6 micron/pix
        drawer.focalLength = focalLength; // 1m
        drawer.diffractionDiskSize = airyDiskSize(wavelength,diameter);// / Math.PI * wavelength / diameter;
      drawer.addStar(1.0, 1.0, 65535.0 * 1.0);
      
 //         drawer.addStar(1.0 + degrees(drawer._pixelScale) * 15, 1.0, 65535.0 * 128.0);
  //      drawer.addStar(1.0 - 0.2 / 3600.0, 1.0, 3000000.0);
  //      drawer.addStar(1.0, 1.0 + 10.0 / 3600.0, 1000000.0);
        
        drawer.draw(100.0); // 100 s exposure

    }
}
