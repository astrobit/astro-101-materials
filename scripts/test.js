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

class DrawStars
{
    constructor()
    {
        this.canvas = document.getElementById("canvas");
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight - 60;
        this.gl = this.canvas.getContext("webgl");
        this.program = null;
        this.starList = new Array();
        this._pixelScale = 0.1;
        this._difractionDiskSize = 0.1;
        this.airySize = 2;
        this.colorStars = false;
        this.maxFlux = 65535.0;
        this.resetStarList();
 
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
            this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
            this.fluxAttributeLocation = this.gl.getAttribLocation(this.program, "a_flux");
            this.colorAttributeLocation = this.gl.getAttribLocation(this.program, "a_color");


            // lookup uniforms
            this._centralPosition = this.gl.getUniformLocation(this.program, "u_CentralPosition");
            this._pointSize = this.gl.getUniformLocation(this.program, "u_PointSize");
            this._seeingShift = this.gl.getUniformLocation(this.program, "u_SeeingShift");
            this._scaling = this.gl.getUniformLocation(this.program, "u_Scaling");
            this._MaxFlux = this.gl.getUniformLocation(this.program, "u_FluxScaling");
            this._colorStars = this.gl.getUniformLocation(this.program, "u_UseColor");
            this._sampling = this.gl.getUniformLocation(this.program, "u_Sampling");
            this._AiryMax = this.gl.getUniformLocation(this.program, "u_AiryMax");
            this._BesselNormalization = this.gl.getUniformLocation(this.program, "u_BesselNormalization");

            this.gl.uniform2fv(this._centralPosition, [0, 0]);
            this.gl.uniform1f(this._pointSize, 64.0); // max size by default
            this.gl.uniform2fv(this._seeingShift, [0, 0]);
            this.gl.uniform2fv(this._scaling, [1.0, 1.0]);
            this.gl.uniform1f(this._MaxFlux, 65535.0);
            this.gl.uniform1i(this._colorStars, 0);

            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_COLOR, this.gl.DST_COLOR);

            this.positionBuffer = this.gl.createBuffer();
            this.fluxBuffer = this.gl.createBuffer();
            this.colorBuffer = this.gl.createBuffer();
        }
    }
    _setDrawingParameters()
    {
        let airyMax = this._airyMax;
        const size = this._difractionDiskSize * this._airyScale; // extended size in arc-sec
        const sizePix = Math.max(Math.min(Math.ceil(size / this._pixelScale * 2.0), 63.0), 1.0); // size in pixels
        if (sizePix % 2 == 0) // make sure that the airy size is odd so that the central pixel is at the center of the Airy disk
        {
            airyMax *= (sizePix * 0.5 + 1) / (sizePix * 0.5);
            sizePix++;
        }
        this.flux_normalization = airyDiscreteNormalization(sizePix * 0.5, this._airySize);

        this.gl.uniform1f(this._pointSize, sizePix);
        this.gl.uniform1f(this._AiryMax, airyMax);
        this.gl.uniform1f(this._BesselNormalization, this.flux_normalization);
   }

    get airySize()
    {
        return this._airySize;
    }
    set airySize(n) // set which airy minimum should be the drawing limit. default is 2
    {
        this._airySize = Math.min(Math.max(n,1),6); // bessel1_minima supports minima between 1 and 6
        this._airyMax = bessel1_minima(this._airySize - 1);
        this._airyScale = this._airyMax / bessel1_minima(0);
    }
    centralPosition(ra, dec)
    {
        this.centralPosition = [ra, dec];
    }
    // set scaling in terms of arc-sec per pixel
    set pixelScale(scale)
    {
        this._pixelScale = scale;
    }
    set seeingDisk(seeingHWHM)
    {
        this._seeingStDev = seeingHWHM / Math.sqrt(2.0 * Math.log(2.0));
    }
    set diffractionDisk(resolutionLimit) // resolution limit in arcsec
    {
        this._difractionDiskSize = resolutionLimit;
    }


    draw(exposure_length)
    {
        this._prepStarArrays();
        this._setDrawingParameters();
        const sampling = 1.0 / 8.0;
        const passes = Math.ceil(exposure_length / sampling);
        this.gl.uniform1f(this._sampling, sampling);

        this.gl.uniform2fv(this._centralPosition, new Float32Array(this.centralPosition));
        this.gl.uniform1f(this._MaxFlux, this.maxFlux);
        this.gl.uniform1i(this._colorStars, this.colorStars ? 1 : 0);


        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.starCoords, this.gl.STATIC_DRAW);


        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        let size = 2;          // 2 components per iteration
        const type = this.gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(this.positionAttributeLocation, size, type, normalize, stride, offset);
/*        size = 1;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.fluxBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.starFluxes, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.fluxAttributeLocation, size, type, normalize, stride, offset);
        if (this.colorStars)
        {
            size = 3;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, this.starColors, this.gl.STATIC_DRAW);
            this.gl.vertexAttribPointer(this.colorAttributeLocation, size, type, normalize, stride, offset);
        }
        */
        // Tell WebGL how to convert from clip space to pixels
        this.gl.useProgram(this.program);

        const scale = 3600.0 / this._pixelScale;
        const scaleX = scale / (this.gl.canvas.width * 0.5);
        const scaleY = scale / (this.gl.canvas.height * 0.5);
        this.gl.uniform2fv(this._scaling, new Float32Array([scaleX, scaleY]));

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the canvas.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        // Draw the geometry.
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        //this.gl.enableVertexAttribArray(this.fluxAttributeLocation);
        if (this.colorStars )
            this.gl.enableVertexAttribArray(this.colorAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        const numStars = this.starsCount;
        let i;
        const arcsecToDeg = 1.0 / 3600.0;

        for (i = 0; i < passes; i++)
        {
            const r = random_gaussian(0.0, this._seeingStDev);
            const theta = Math.random() * Math.PI;
            const dec_shift = r * Math.sin(theta);
            const ra_shift = r * Math.cos(theta);

            this.gl.uniform2fv(this._seeingShift, new Float32Array([ra_shift * arcsecToDeg, dec_shift * arcsecToDeg]));

            this.gl.drawArrays(this.gl.POINTS, 0, numStars);
        }

    }
    resetStarList()
    {
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
        }
    }
}
let _vertexShader = document.getElementById("vertex-shader-2d").text;
let _fragmentShader = document.getElementById("fragment-shader-2d").text;

function bessel1(x)
{
	const hx = 0.5 * x;
    return hx * (0.25 + hx * (-1.0 / 6.0 + hx * (1.0 / 48.0 + hx * (-1.0 / 720.0 + hx * (1.0 / 17280.0 + hx * (-1.0 / 604800.0 + hx * (1.0 / 29030400.0 + hx * (-1.0 / 1828915200.0))))))));
}
function shaderTest()
{
    const airy_size = 3;
    let u_AiryMax = bessel1_minima(airy_size);
    const centralSize = bessel1_minima(1);
    const size = 0.1 * u_AiryMax / bessel1_minima(1); // extended size in arc-sec
    const sizePix = Math.max(Math.min(Math.ceil(size / 0.1 * 2.0), 64.0), 1.0); // size in pixels
    const u_BesselNormalization = airyDiscreteNormalization(sizePix * 0.5, airy_size);
    const u_Sampling = 1.0;


    function testShader(x, y, flux)
    {
        let X = (x - 0.5) * 2.0;
        let Y = (y - 0.5) * 2.0;
        let r = Math.sqrt(X * X + Y * Y) * u_AiryMax;
        let f = u_BesselNormalization * u_Sampling;
        if (r > 0.0)
        {
            let br = bessel1(r);
            let l = 4.0 * br * br / (r * r) * flux / 65535.0;
            f *= l;
        }
        return Math.min(f, 1.0);

    }
    let i;
    for (i = 0; i < sizePix; i++)
    {
        const x = (i + 0.5) / sizePix;
        const y = 0.5;
        const r = testShader(x, y, 6000000.0);
        console.log(r);
    }
}
shaderTest();


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
        drawer.centralPosition(1.0, 1.0);
        drawer.seeingDisk = 2.0;
        drawer.pixelScale = 0.1; // 0.1"/pix
        drawer.diffractionDisk = 206265.0 * bessel1_minima(1) / Math.PI * 550.0e-9 / 0.05;
        drawer.addStar(1.0 + 0.2 / 3600.0, 1.0, 6000000.0);
        drawer.addStar(1.0 - 0.2 / 3600.0, 1.0, 3000000.0);
        drawer.addStar(1.0, 1.0 + 10.0 / 3600.0, 1000000.0);
        
        drawer.draw(100.0);

    }
}
