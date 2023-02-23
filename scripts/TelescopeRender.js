
class TelescopeRender
{
    constructor(canvas)
    {
		this.canvas = canvas;//document.getElementById("canvas");
		this.gl = this.canvas.getContext("webgl2",{antialias: false});
//		const ext = this.gl.getExtension("EXT_color_buffer_float");
		this.program = null;
		this.colorStars = false;
		this.saturationFlux = 65535.0;
		this.maxFlux = 0;
		this.resetStarList();
		this._centralPosition = [0.0, 0.0];
		this._pixelSize = 1.0;
		this._focalLength = 1.0;
		this._pixelScale = Math.atan(this._pixelSize / this._focalLength); 
		this._difractionDiskSize = 1.0;
		this._ready = false;
		this._maxWidth = 1024;
		this._maxHeight = 1024;
//		this._starStyle = 'Airy'; // options: Gaussian, Airy, Point



    }
	set maxWidth(w)
	{
		this._maxWidth = w;
	}
	get maxWidth()
	{
		return this._maxWidth;
	}
	set maxHeight(h)
	{
		this._maxHeight = h;
	}
	get maxHeight()
	{
		return this._maxHeight;
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
			this.fluxesBufferLocation = this.gl.getAttribLocation(this.program, "af_flux");
			this.colorBufferLocation = this.gl.getAttribLocation(this.program, "av_color");

			this.gl.activeTexture(this.gl.TEXTURE0);
			this._texture = this.gl.createTexture();
			this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
 
            // lookup uniforms
            this.uvv_PositionScaling = this.gl.getUniformLocation(this.program, "uvv_PositionScaling");
            this.uvf_mVxx = this.gl.getUniformLocation(this.program, "uvf_mVxx");
            this.uvf_mVxy = this.gl.getUniformLocation(this.program, "uvf_mVxy");
            this.uvf_mVxz = this.gl.getUniformLocation(this.program, "uvf_mVxz");
            this.uvf_mVyx = this.gl.getUniformLocation(this.program, "uvf_mVyx");
            this.uvf_mVyy = this.gl.getUniformLocation(this.program, "uvf_mVyy");
            this.uvf_mVyz = this.gl.getUniformLocation(this.program, "uvf_mVyz");
            this.uvf_PointSize = this.gl.getUniformLocation(this.program, "uvf_PointSize");
            this.uvb_EnableColor = this.gl.getUniformLocation(this.program, "uvb_EnableColor");
            
            this.uff_FluxScaling = this.gl.getUniformLocation(this.program,"uff_FluxScaling");
			this.ufs_Sampler = this.gl.getUniformLocation(this.program,"ufs_Sampler");
			
			

			this.gl.uniform2fv(this.uvv_PositionScaling, new Float32Array([1.0, 1.0]));
			this.gl.uniform1f(this.uvf_mVxx, 0.0);
			this.gl.uniform1f(this.uvf_mVxy, 1.0);
			this.gl.uniform1f(this.uvf_mVxz, 0.0);
			this.gl.uniform1f(this.uvf_mVyx, 0.0);
			this.gl.uniform1f(this.uvf_mVyy, 0.0);
			this.gl.uniform1f(this.uvf_mVyz, 1.0);
			this.gl.uniform1f(this.uvf_PointSize, 1.0);

			this.gl.uniform1f(this.uff_FluxScaling,1.0 / 65535.0);
			this.gl.uniform1i(this.ufs_Sampler, 0);
			this.gl.uniform1i(this.uvb_EnableColor,0);

    	// generate textures
    	
	    	let arrsize = this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS);

            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.ONE, this.gl.ONE);

            this.positionBuffer = this.gl.createBuffer();
            this.fluxBuffer = this.gl.createBuffer();
            this.colorBuffer = this.gl.createBuffer();
            
            this._ready = true;
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
	set imageResolution(res)
	{
		this.CCDres = res;
	}
	get imageResolution()
	{
		return this.CCDres;
	}
	set colorizeStars(flag)
	{
		this.colorEnable = flag;
	}
	get coloriszeStars()
	{
		return this.colorEnable;
	}
	get ready()
	{
		return this._ready;
	}

    draw(exposure_length)
    {
        this._prepStarArrays();
        // Tell WebGL how to convert from clip space to pixels
        this.gl.useProgram(this.program);
        
        
		const rAlpha = radians(this._centralPosition[0] * 15.0);
		const rDec = radians(this._centralPosition[1]);
		const cosDec = Math.cos(rDec);
		const sinDec = Math.sin(rDec);
		const cosAlpha = Math.cos(rAlpha);
		const sinAlpha = Math.sin(rAlpha);
//		const mVxx = -sinDec;
//		const mVxy = cosDec;
//		const mVxz = 0.0;
//		const mVyx = -cosAlpha*sinDec;
//		const mVyy = -sinAlpha*sinDec;
//		const mVyz = cosDec;

		const mVxx = -sinAlpha;
		const mVxy = cosAlpha;
		const mVxz = 0.0;
		const mVyx = -cosAlpha * sinDec;
		const mVyy = -sinAlpha * sinDec;
		const mVyz = cosDec;

		this.canvas.width = Math.min(this._maxWidth,this.CCDres)
		this.canvas.height = Math.min(this._maxHeight,this.CCDres);
		const imWidth = Math.min(this.gl.canvas.width, this.CCDres);
		const imHeight = Math.min(this.gl.canvas.height, this.CCDres);
//		const halfRes = this.CCDres >> 1;

		const scale = this._focalLength / this._pixelSize;
		const scaleX = scale * 2.0 / this.gl.canvas.width;
		const scaleY = scale * 2.0 / this.gl.canvas.height;
		this.gl.uniform2fv(this.uvv_PositionScaling, new Float32Array([scaleX, scaleY]));
		this.gl.uniform1f(this.uvf_mVxx, mVxx);
		this.gl.uniform1f(this.uvf_mVxy, mVxy);
		this.gl.uniform1f(this.uvf_mVxz, mVxz);
		this.gl.uniform1f(this.uvf_mVyx, mVyx);
		this.gl.uniform1f(this.uvf_mVyy, mVyy);
		this.gl.uniform1f(this.uvf_mVyz, mVyz);
		this.gl.uniform1f(this.uvf_PointSize, this.pointSize);
        
		this.gl.uniform1f(this.uff_FluxScaling,exposure_length / 65535.0);

		this.gl.uniform1i(this.uvb_EnableColor,this.colorEnable);
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

		if (this.colorEnable)
		{
			this.gl.enableVertexAttribArray(this.colorBufferLocation);
		    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
		    this.gl.vertexAttribPointer(this.colorBufferLocation, 3, this.gl.FLOAT, false, 0, 0);
		    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.starColors, this.gl.STATIC_DRAW);
		}
		
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
//		if (this.colorStars )
//			this.gl.enableVertexAttribArray(this.colorAttributeLocation);
		const numStars = this.starsCount;
        let i;

		this.gl.drawArrays(this.gl.POINTS, 0, numStars);
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
    addStar(ra, dec, flux,colorRGB) // flux in total counts/sec
    {
        this.starCoordsInternal.push(ra);
        this.starCoordsInternal.push(dec);
        this.starFluxesInternal.push(flux);
        if (flux > this.maxFlux)
        	this.maxFlux = flux;
        if (typeof colorRGB != 'undefined' && colorRGB !== null && colorRGB instanceof RGB)
        {
        	const inv255 = 1.0 / 255.0;
		    this.starColorsInternal.push(colorRGB.r * inv255);
		    this.starColorsInternal.push(colorRGB.g * inv255);
		    this.starColorsInternal.push(colorRGB.b * inv255);
		}
		else
        {
		    this.starColorsInternal.push(1.0);
		    this.starColorsInternal.push(1.0);
		    this.starColorsInternal.push(1.0);
		}
        this.starsCount++;
    }
    _prepStarArrays()
    {
        if (this.numStars != this.starsCount)
        {
            this.numStars = this.starsCount;
            this.starCoords = new Float32Array(this.starCoordsInternal);
            this.starFluxes = new Float32Array(this.starFluxesInternal);
            this.starColors = new Float32Array(this.starColorsInternal);
			const nflux = Math.max(this.maxFlux / this.saturationFlux,1.0);
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
			this.airyMaxDesired = bessel1_maxima(airy_size);
			const size = this.airyMaxDesired / bessel1_minima(0) * this._difractionDiskSize / this._pixelScale; // extended size
			this.pointSize = Math.max(Math.min(Math.floor(Math.ceil(size * 2.0) * 0.5) * 2.0 + 1.0, 63.0), 3.0); // size in pixels
			this.airyMax = this.pointSize * bessel1_minima(0) * this._pixelScale / this._difractionDiskSize;
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
			const b1min8 = bessel1_minima(8);
			let s;
			const invn = 1.0 / n;
			let v;
			let u;
			let pass;
			const maxpass = (this._seeingStDev > 0.0) ? 32 : 1; 
			for (pass = 0; pass < maxpass; pass++)
			{
			    const r = (this._seeingStDev > 0.0) ? random_gaussian(0.0, this._seeingStDev) / this._pixelScale : 0.0;
			    const theta = (this._seeingStDev > 0.0> 0.0) ? Math.random() * 2.0 * Math.PI : 0.0;
			    const dec_shift = (this._seeingStDev > 0.0) ? r * Math.sin(theta) : 0.0;
			    const ra_shift = (this._seeingStDev > 0.0) ? r * Math.cos(theta) : 0.0;
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
							if (r < b1min8) // if r is too large, don't calculate the bessel funcgtion; just assume it is 0.
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
    }
}


function newTelescopeRenderer(canvas)
{

	let drawer = new TelescopeRender(canvas);

	let _vertexShader = document.getElementById("vertex-shader-2d").text;
	let _fragmentShader = document.getElementById("fragment-shader-2d").text;



	function waitOnShaders()
	{
		if (_vertexShader == null || _fragmentShader == null)
		{
		    window.setTimeout(waitOnShaders, 1000.0 / 30.0);
		}
		else
		{
		    drawer.prepareShaders(_vertexShader, _fragmentShader)
		}
	}

	function getShaders()
	{
		let _dataPromiseVtx = getFile("shaders/telescope.vert");
		if (typeof _dataPromiseVtx != 'undefined' && _dataPromiseVtx !== null)
			_dataPromiseVtx.then(function(value){_vertexShader = value},function(error){console.log("Vertex shader request failed with error " + error)});
		
		let _dataPromiseFrag = getFile("shaders/star.frag");
		if (typeof _dataPromiseFrag != 'undefined' && _dataPromiseFrag !== null)
			_dataPromiseFrag.then(function(value){_fragmentShader = value},function(error){console.log("Fragment shader request failed with error " + error)});
		window.setTimeout(waitOnShaders, 100.0);
	}

	if (typeof _vertexShader == 'undefined' || _vertexShader == null)
		getShaders();
	else
		waitOnShaders();
		
	return drawer;
}
