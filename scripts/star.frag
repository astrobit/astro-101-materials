precision mediump float;

varying vec4 v_color;
const float pi = radians(180.0);
varying float v_dl;
varying float v_flux;


void main()
{
	float r = length((gl_PointCoord - 0.5) * 2.0);
	float l = 1.0 / sqrt(2.0 * pi * v_dl) * exp(-r * r * 0.5 / (v_dl * v_dl));
	float f = min(v_flux / 65536.0,1.0);
	gl_FragColor = vec4(f * l,f * l,f * l,1.0);
}