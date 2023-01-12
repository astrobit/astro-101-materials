// 3-vector containing the RA, dec, and flux
attribute vec3 a_position;

// 2-vector containing the RA and dec of the center of the field of view
uniform vec2 u_CentralPosition;
// conversion from arcseconds to pixels (pix/")
uniform float u_InvPixelScale;
// size of the view in pixels
uniform vec2 u_ImageSize;
// 1 sigma of seeing in arc-seconds
uniform float u_SeeingDiskSize;
// diffraction limit in arc-seconds
uniform float u_DiffractionLimit;

varying vec4 v_color;
varying float v_dl;
varying float v_flux;

void main() 
{
	float scale = 3600.0 * u_InvPixelScale;
	float scaleX = scale / (u_ImageSize.x * 0.5);
	float scaleY = scale / (u_ImageSize.y * 0.5);
	// Calculate on-screen position for the star
	gl_Position = vec4((a_position.x - u_CentralPosition.x) * scaleX,
						(a_position.y - u_CentralPosition.y) * scaleY,
						0.0,
						1.0);
	// determine the diffraction limit in clipping coordinates 
	v_dl = max(u_DiffractionLimit,u_SeeingDiskSize) * u_InvPixelScale / (u_ImageSize.x * 0.5);
	gl_PointSize = 64.0;
	// Convert from clipspace to colorspace.
	// Clipspace goes -1.0 to +1.0
	// Colorspace goes from 0.0 to 1.0
	v_color = gl_Position * 0.5 + 0.5;
	v_flux = a_position.z;
}