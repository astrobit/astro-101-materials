// JavaScript source code
const ColorSkyStringInternal =
{
	en: {
	titleState0: "Welcome to the the Sky in Color!",
	line1State0: "This tutorial will guide you through the components and controls.",
	line2State0: "You can skip this tutorial at any time using the `Skip Tutorial' button at the bottom.",

	line1State1: "This is a map of the sky.",
	line2State1: "It shows most stars that are visible to the naked eye.",
	line3State1: "It may take up to 10 minutes for the stars to load the first time you use this.",
	line4State1: "You may wish to wait for the stars to appear before continuing the tutorial.",

	line1State2: "These buttons control which filter you are using to view the sky.",
	line2State2: "`No Filter' shows the sky approximately as it appears to your eyes or a camera without a filter ",
	line3State2: "The other filters represent Ultraviolet, Blue, Visible (Green), Red, and Infrared.",

	line1State3: "When a filter is selected, stars are shown in shades of gray instead of the selected color.",
	line2State3: "This represents how the stars would appear when imaged using an astronomical camera (CCD).",

	line1State4: "These buttons select which constellations are displayed.",
	line2State4: "These are shown to help orient you.",
	line3State4: "Constellations of the zodiac are shown in yellow, the others are shown in white or gray.",

	line1State5: "These buttons determine which coordinate system is used for the map.",
	line2State5: "The equatorial system uses the Earth's equator and poles to describe locations of stars.",
	line3State5: "The ecliptic system uses the path that the Sun takes over the course of the year as a reference for describing locations of stars.",
	line4State5: "The galactic system uses the middle of the Milky Way as the reference.",
	line5State5: "Let's take a look at each of these.",

	line1State6: "When the equatorial system is selected, the dark gray line in the middle of the map represents the projection of Earth's equator.",
	line2State6: "The top and bottom of the map are the north and south poles, respectively.",

	line1State7: "When the ecliptic system is selected, the dark gray line in the middle",
	line2State7: "of the map represents the path of the Sun over the year (the ecliptic).",
	line3State7: "The top and bottom of the map are the north and south ecliptic poles, respectively.",

	line1State8: "When the galactic system is selected, the dark gray line in the middle of the map represents",
	line2State8: "the plane (middle of the disk) of the Milky Way galaxy as seen from Earth.",
	line3State8: "The top and bottom of the map are the north and south galactic poles, respectively.",

	line1StateFinal: "Congratulations!",
	line2StateFinal: "You're done with the tutorial.",
	line3StateFinal: "You can replay this tutorial later using the `Tutorial' button.",
	line4StateFinal: "You can use the 'Prev' button below to go back, or 'Next' to finish the tutorial.",

	lineContinueAbove: "To continue, select the 'Next' button above.",
	lineContinue: "To continue, select the 'Next' button below.",

	aboutLine1: "The Sky in Color",
	aboutLine2: "Copyright 2020, 2021 Brian W. Mulligan, Ph.D.",
	aboutLine3: "Star data aquired using SIMBAD databases.",
	aboutLine4: "Constellations based on IAU maps (https://www.iau.org/public/themes/constellations/)",
	aboutLine5: "For additional information or to request features or changes, contact bwmulligan@astronaos.com.",

	throwawayLine: ""
	}
}

var ColorSkyStrings = ColorSkyStringInternal[navigator.language];

if (ColorSkyStrings === undefined)
	ColorSkyStrings = ColorSkyStringInternal['en'];

