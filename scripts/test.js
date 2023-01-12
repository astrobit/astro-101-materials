"use strict";

let vertexShader = null;
let fragmentShader = null;

getFile("scripts/star.vert").then(function (result) {
                                                            vertexShader = result;
                                                        },
                                                        function (error) {
                                                            console.log("Error loading vertex shader: " + error);
                                                        }
                                                    );

getFile("scripts/star.frag").then(function (result) {
                                                            fragmentShader = result;
                                                        },
                                                        function (error) {
                                                            console.log("Error loading fragment shader: " + error);
                                                        }
                                                    );


let shadersReady = false;
let shaderProgram = null;
function waitOnShaders()
{
    if (vertexShader == null || fragmentShader == null) {
        window.setTimeout(waitOnShaders, 1000.0 / 30.0);
    }
    else
    {
        shadersReady = true;
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
function main()
{
    if (shadersReady)
    {
        // Get A WebGL context
        /** @type {HTMLCanvasElement} */
        var canvas = document.getElementById("canvas");
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight - 60;

        var gl = canvas.getContext("webgl");
        if (gl)
        {
            if (shaderProgram == null)
            {
                shaderProgram = createProgramFromScripts(gl, vertexShader, fragmentShader);
            }
            // Tell it to use our program (pair of shaders)
            gl.useProgram(shaderProgram);

            // look up where the vertex data needs to go.
            let positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
            let fluxAttributeLocation = gl.getAttribLocation(shaderProgram, "a_flux");

            // lookup uniforms
            let centralPosition = gl.getUniformLocation(shaderProgram, "u_CentralPosition");
            let invPixelScale = gl.getUniformLocation(shaderProgram, "u_InvPixelScale");
            let imageSize = gl.getUniformLocation(shaderProgram, "u_ImageSize");
            let seeingDisk = gl.getUniformLocation(shaderProgram, "u_SeeingDiskSize");
            let diffractionDisk = gl.getUniformLocation(shaderProgram, "u_DiffractionLimit");

            gl.uniform2fv(centralPosition, [1, 1]);
            gl.uniform2fv(imageSize, [canvas.width, canvas.height]);
            gl.uniform1f(invPixelScale, 10.0); // 10 pix/"
            gl.uniform1f(seeingDisk, 10.0);
            gl.uniform1f(diffractionDisk, 0.2);



            // Tell WebGL how to convert from clip space to pixels
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            // Clear the canvas.
            gl.clear(gl.COLOR_BUFFER_BIT);


            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR);

            // Create a buffer.
            var positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    1.0 + 0.2 / 3600.0, 1.0, 600000.0,
                    1.0 - 0.2 / 3600.0, 1.0, 300000.0,
                    1.0, 1.0 + 10.0 / 3600.0, 100000.0]),
                gl.STATIC_DRAW);

            // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
            var size = 3;          // 3 components per iteration
            var type = gl.FLOAT;   // the data is 32bit floats
            var normalize = false; // don't normalize the data
            var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            var offset = 0;        // start at the beginning of the buffer
            gl.vertexAttribPointer(
                positionAttributeLocation, size, type, normalize, stride, offset);

            // Turn on the attribute
            gl.enableVertexAttribArray(positionAttributeLocation);

            // Draw the geometry.
            var primitiveType = gl.POINTS;
            var offset = 0;
            var count = 3;
            gl.drawArrays(primitiveType, offset, count);
        }
    }
}
