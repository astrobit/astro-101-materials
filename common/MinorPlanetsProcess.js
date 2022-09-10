// from small body database at https://ssd.jpl.nasa.gov/tools/sbdb_query.html
// field descriptions:
// spkid: unique identifier
// full name: official name
// name: IAU identifier
// H: absolute magnitude
// H_sigma: uncertainty in absolute magnitude
// diameter: diameter in km if known
// diameter_sigma: uncertainty in diameter
// albedo: geometric albedo
// rot_per : rotation period (hours)
// BV: B - V color index
// UB: U - B color index
// IR: I - R color index
// epoch: epoch for orbital solution
// equinox: equinox of data
// e: orbital eccentricity
// a: semi-major axis (au)
// i: orbital inclination (deg., relative to ecliptic)
// om: longitude of ascending node (deg.)
// sigma_om: uncertainty in long. of ascending node
// w: argument of perihelion (deg.)
// sigma_w: uncertainty in agrumnet of perihelion (deg).
// ma: mean anomaly (deg.)
// sigma_ma: uncertainty in mean anomialy (deg.)
// per_y: period (years)
// sigma_per: uncertainty in period (days)

var g_mpi;
var g_mpiRadians = Math.PI / 180.0;
for (g_mpi = 0; g_mpi < minorPlanetsTrojans.length; g_mpi++)
{
	const curr = minorPlanetsTrojans[g_mpi];
	minorPlanetsTrojans[g_mpi].orbitalParameters = new OrbitalParameters(curr.epoch, curr.a,curr.per_y,curr.e,curr.ma * g_mpiRadians,curr.om * g_mpiRadians,curr.w * g_mpiRadians,curr.i * g_mpiRadians);
}
	
	
	
	
	
