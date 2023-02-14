precision mediump float;

const float pi = radians(180.0);
uniform float u_AiryMax;
varying float v_flux;
uniform float u_BesselNormalization;
uniform float u_FluxScaling;
varying vec3 v_color;
uniform float u_Sampling;

//const int k_fct[13] = int[13](1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800, 479001600);//, 6227020800, 87178291200, 
//int factorial(int i)
//{
//	return (i > 1 && i < 13) ? k_fct[i] : 1;
//}
float bessel1(float x)
{
	float hx = 0.5 * x;
	return hx * (0.25 + hx * (-1.0 / 6.0 + hx * (1.0 / 48.0 + hx * (-1.0 / 720.0 + hx * (1.0 / 17280.0 + hx * (-1.0 / 604800.0 + hx * (1.0 / 29030400.0 + hx * (-1.0 / 1828915200.0))))))));
}

void main()
{
	float r = length((gl_PointCoord - 0.5) * 2.0) * u_AiryMax;
	float f = 1.0; //u_BesselNormalization * u_Sampling;
	if (r > 0.0)
	{
		float br = bessel1(r);
		f *= 1.0 / r; //4.0 * br * br / (r * r) * v_flux / u_FluxScaling; // );
	}
	gl_FragColor = vec4(min(v_color * f,1.0),1.0);
}