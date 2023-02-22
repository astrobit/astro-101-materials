attribute vec2 	av_position;
attribute float af_flux;

uniform float	uvf_PointSize;
uniform vec2	uvv_PositionScaling;
uniform float	uvf_mVxx;
uniform float	uvf_mVxy;
uniform float	uvf_mVxz;
uniform float	uvf_mVyx;
uniform float	uvf_mVyy;
uniform float	uvf_mVyz;

varying vec4	vv_color;
varying float	vf_flux;

void main()
{
	float rx = radians(av_position.x * 15.0);
	float ry = radians(av_position.y);
	float cosAlpha = cos(rx);
	float sinAlpha = sin(rx);
	float cosDec = cos(ry);
	float sinDec = sin(ry);
	float ax = cosAlpha * cosDec;
	float ay = sinAlpha * cosDec;
	float az = sinDec;

	gl_Position = vec4(vec2(uvf_mVxx * ax +  uvf_mVxy * ay + uvf_mVxz * az, uvf_mVyx * ax +  uvf_mVyy * ay +  uvf_mVyz * az) * uvv_PositionScaling, 0.0,1.0);
	gl_PointSize = uvf_PointSize;

	vv_color = vec4(1.0,1.0,1.0,1.0);
	vf_flux = af_flux;
}
