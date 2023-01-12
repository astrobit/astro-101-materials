"use strict";

class Draw
{
    constructor()
    {
        this.canvas = document.getElementById("canvas");
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight - 60;
        this.gl = this.canvas.getContext("webgl");
        this.program = null;
    }
    prepareShaders(vertexShader, fragmentShader)
    {
        if (this.program == null)
        {
            this.program = createProgramFromScripts(this.gl, vertexShader, fragmentShader);
        }
        // Tell it to use our program (pair of shaders)
        this.gl.useProgram(this.program);

        // look up where the vertex data needs to go.
        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");

        // lookup uniforms
        this._centralPosition = this.gl.getUniformLocation(this.program, "u_CentralPosition");
        this._invPixelScale = this.gl.getUniformLocation(this.program, "u_InvPixelScale");
        this._imageSize = this.gl.getUniformLocation(this.program, "u_ImageSize");
        this._seeingDisk = this.gl.getUniformLocation(this.program, "u_SeeingDiskSize");
        this._diffractionDisk = this.gl.getUniformLocation(this.program, "u_DiffractionLimit");

        this.gl.uniform2fv(this._centralPosition, [0, 0]);
        this.gl.uniform2fv(this._imageSize, [this.canvas.width, this.canvas.height]);
        this.gl.uniform1f(this._invPixelScale, 10.0); // 10 pix/"
        this.gl.uniform1f(this._seeingDisk, 10.0);
        this.gl.uniform1f(this._diffractionDisk, 0.2);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_COLOR, this.gl.DST_COLOR);

        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    }

    centralPosition(ra, dec)
    {
        this.gl.uniform2fv(this._centralPosition, [ra, dec]);
    }
    // set scaling in terms of arc-sec per pixel
    set pixelScale(scale)
    {
        this.gl.uniform2fv(this._invPixelScale, 1.0 / scale);
    }
    set seeingDisk(seeingHWHM)
    {
        const stdev = seeingHWHM / Math.sqrt(2.0 * Math.log(2.0));
        this.gl.uniform2fv(this._seeingDisk, stdev);
    }
    set diffractionDisk(seeingHWHM)
    {
        const stdev = diffractionDisk * 2.0 / Math.sqrt(2.0 * Math.log(2.0)); // TODO: this is not accurate. this should be using a airy disk size
        this.gl.uniform2fv(this._diffractionDisk, stdev);
    }

    loadStars(starArray, n)
    {
        this._n = n;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, starArray, this.gl.STATIC_DRAW);
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size = 3;          // 3 components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(
            this.positionAttributeLocation, size, type, normalize, stride, offset);
    }
    draw()
    {
        // Draw the geometry.
        this.gl.drawArrays(this.gl.POINTS, 0, this._n);
    }
}
let _vertexShader = null;
let _fragmentShader = null;


getFile("scripts/star.vert").then(function (result) {
                                                            _vertexShader = result;
                                                        },
                                                        function (error) {
                                                            console.log("Error loading vertex shader: " + error);
                                                        }
                                                    );

getFile("scripts/star.frag").then(function (result) {
                                                            _fragmentShader = result;
                                                        },
                                                        function (error) {
                                                            console.log("Error loading fragment shader: " + error);
                                                        }
                                                    );


let shadersReady = false;
let shaderProgram = null;
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

function createShader(gl,type, source)
{
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success)
    {
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        shader = null;
    }
    return shader;
}

function createProgramFromScripts(gl, vertex_shader_source, fragment_shader_source)
{
    let program = gl.createProgram();
    if (ValidateString(vertex_shader_source))
    {
        let vertex_shader = createShader(gl, gl.VERTEX_SHADER, vertex_shader_source);
        gl.attachShader(program, vertex_shader);
    }
    if (ValidateString(fragment_shader_source))
    {
        let fragment_shader = createShader(gl, gl.FRAGMENT_SHADER, fragment_shader_source);
        gl.attachShader(program, fragment_shader);
    }
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success)
    {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        program = null;
    }
    return program;

}


let drawer = new Draw();

function main()
{
    if (shadersReady)
    {
        drawer.loadStars(new Float32Array([
            1.0 + 0.2 / 3600.0, 1.0, 600000.0,
            1.0 - 0.2 / 3600.0, 1.0, 300000.0,
            1.0, 1.0 + 10.0 / 3600.0, 100000.0]), 3);
        drawer.draw();

    }
}
