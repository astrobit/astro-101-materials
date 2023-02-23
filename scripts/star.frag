precision mediump float;

varying vec4		vv_color; // star color
varying float		vf_flux; // star flux (counts / sec)
uniform float		uff_FluxScaling; // exposure times maximum value
uniform sampler2D	ufs_Sampler; // texture to use
void main()
{
	vec4 tex = clamp(texture2D(ufs_Sampler, gl_PointCoord) * vf_flux * uff_FluxScaling,0.0,1.0);
	gl_FragColor = vec4(vv_color.rgb * tex.xyz,1.0);
}
