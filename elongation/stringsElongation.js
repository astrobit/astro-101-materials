// JavaScript source code
const ElongationStringInternal =
{
	en: {
	titleState0: "Welcome to the Elongation Simulator tutorial!",
	line1State0: "This tutorial will guide you through the components and controls of the elongation simulator.",
	line2State0: "You can skip this tutorial at any time using the `Skip Tutorial' button at the bottom.",

	line1State1: "This is a map of the sky.",
	line2State1: "The yellow dot in the center is the Sun, and the gray line in the middle is the ecliptic.",
	line3State1: "The stars move relative to the Sun over the course of a year.",
	line4State1: "(It may take up to 10 minutes for the stars to load the first time you use this.)",
	line5State1: "A dot representing a planet is shown elsewhere on the map.",
	line6State1: "The distance of the planet from the Sun on this map is its elongation.",
	line7State1: "To the left (east) of the Sun, elongation is negative.",
	line8State1: "To the right (west) of the Sun, elongation is positive.",
	line9State1pt1: "The currently selected planet (",
	line9State1pt2: ") and its elongation are displayed below the map on the left.",
	line10State1: "Below the map to the right is the date for which you are viewing the sky.",

	line1State2: "These buttons control the speed of the simulator.",
	line2State2: "The " + String.fromCharCode(0x25b6) + " button will play or pause the simulator",
	line3State2: "The other buttons affect the speed.",

	line1State3: "These buttons select which planet you wish to view.",

	line1State4: "The area in the bottom right shows the view of the selected planet",
	line2State4: "as it would look in a telescope.",
	line3State4: "The phase number, apparent size, and apparent V magnitude are listed below the view.",
	line4State4: "The phase number is a value between 0 and 7.9 that relates the appearance to",
	line5State4: "phases of the Moon:",
	line6State4: "phase 0 = new",
	line7State4: "phase 1 = waxing crescent",
	line8State4: "phase 2 = first quarter",
	line9State4: "phase 3 = waxing gibbous",
	line10State4: "phase 4 = full",
	line11State4: "phase 5 = waning gibbous",
	line12State4: "phase 6 = third quarter",
	line13State4: "phase 7 = waning crescent",

	line1State5: "The area in the bottom left shows an overhead view of the Solar System.",
	line2State5: "The orbit of each planet is shown in gray,",
	line3State5: "and each planet is shown as a dot.",
	line4State5: "A yellow line is drawn between the Sun, Earth, and",
	line5State5: "the currently selected planet in order to demonstrate",
	line6State5: "the elongation angle.",
	line7State5: "You can use the + and - buttons to zoom in and out.",

	line1State6: "These buttons control which model the simulator uses.",
	line2State6: "The simple model uses circular orbits that all lie perfectly in the plane of the ecliptic.",
	line3State6: "The real model uses elliptical orbits that represent the actual paths of planets around the Sun.",
	line4State6: "If you are just getting started, we recommend using the simple model.",

	line1StateFinal: "Congratulations!",
	line2StateFinal: "You're done with the tutorial.",
	line3StateFinal: "You can replay this tutorial later using the `Replay Tutorial' button.",
	line4StateFinal: "You can use the 'Prev' button below to go back, or 'Next' to finish the tutorial.",

	lineContinueAbove: "To continue, select the 'Next' button above.",
	lineContinue: "To continue, select the 'Next' button below.",

	aboutLine1: "Elongation Simulator",
	aboutLine2: "Copyright 2020, 2021 Brian W. Mulligan, Ph.D.",
	aboutLine3: "Julian Date calculator based on Practical Astronomy with your Calculator, 3e, Peter Duffett-Smith.",
	aboutLine4: "Planetary ephemrides based on Simon, Francou, Fienga and Manche (2013) VSOP2013 model.",
	aboutLine5: "Star data aquired using SIMBAD databases.",
	aboutLine6: "For additional information or to request features or changes, contact bwmulligan@astronaos.com."
	}
}

var ElongationStrings = ElongationStringInternal[navigator.language];

if (ElongationStrings === undefined)
	ElongationStrings = ElongationStringInternal['en'];
