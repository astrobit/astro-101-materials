"use strict";

let drawer = newTelescopeRenderer(document.getElementById("canvas"));
let first = true;

let ra = 0.0;
let dec = 0.0;

function main()
{
    if (drawer.ready)
    {
		let diameter = 0.0508;//6.0; // mn
		let pixelSize = 24.0e-6; // m
		let focalLength = 0.8128 * 16.0;//6.0; //m
		let wavelength = 550.0e-9; // m

		let ra_central = ra;
		let dec_central = dec;
		drawer.imageResolution = 1024;
		drawer.centralPosition(ra_central, dec_central);
		drawer.seeingDisk = 2.0; //"
		drawer.pixelSize = pixelSize; // 24.6 micron/pix
		drawer.focalLength = focalLength; // 1m
		drawer.diffractionDiskSize = airyDiskSize(wavelength,diameter);// / Math.PI * wavelength / diameter;
		drawer.maxWidth = window.innerWidth;
		drawer.maxHeight = window.innerHeight;
 
		if (first)
		{
			drawer.addStar(ra_central + degrees(drawer._pixelScale) / 15.0 *  0, dec_central + degrees(drawer._pixelScale) * 0, 65535.0 * 1.0,new RGB(255,0,0));
	//		drawer.addStar(0.0 + degrees(drawer._pixelScale) / 15.0 * 30, 0.0 + degrees(drawer._pixelScale) * 30, 65535.0 * 0.25);
			drawer.addStar(ra_central + degrees(drawer._pixelScale) / 15.0 *  0, dec_central + degrees(drawer._pixelScale) * 30, 65535.0 * 2.0,new RGB(255,0,255));
			drawer.addStar(ra_central + degrees(drawer._pixelScale) / 15.0 * 30, dec_central + degrees(drawer._pixelScale) * 0, 65535.0 * 4.0,new RGB(0,0,255));
			drawer.colorizeStars = true;
			first = false;
		}
//		drawer.addStar(1.0 + degrees(drawer._pixelScale) * 15 * 5, 1.0, 65535.0 * 2.0);
//		drawer.addStar(1.0 - 0.2 / 3600.0, 1.0, 3000000.0);
//		drawer.addStar(1.0, 1.0 + 10.0 / 3600.0, 1000000.0);

		drawer.draw(10.0); // 100 s exposure
		ra += 0.01 / 15.0;
    }
       window.setTimeout(main, 1000.0);
}
main();
