attribute vec2 a_position;
attribute float a_flux;
attribute vec3 a_color;

uniform vec2 u_CentralPosition;
uniform float u_PointSize;
uniform vec2 u_SeeingShift;
uniform vec2 u_Scaling;
uniform bool u_UseColor;

varying vec3 v_color;
varying float v_flux;

void main()
{
      // Multiply the position by the matrix.
    gl_Position = vec4((a_position + u_SeeingShift - u_CentralPosition) * u_Scaling, 0.0, 1.0);
    gl_PointSize = u_PointSize;
    // Convert from clipspace to colorspace.
    // Clipspace goes -1.0 to +1.0
    // Colorspace goes from 0.0 to 1.0
    v_flux = a_flux;
    if (u_UseColor)
    {
        v_color = a_color;
    }
    else
        v_color = vec3(1.0,1.0,1.0);
}
