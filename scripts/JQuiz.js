let tab = document.getElementById("grid");
let title = document.getElementById("title");
let question = document.getElementById("question");
let questionholder = document.getElementById("questionholder");
let categories = new Array();
let selections = new Array();
let mode = true; // true = normal mode / false = flashcard
let qmode = true; // true = show question / false = show answer
let level = 0; //0 = 1st round, 1 = 2nd round, 2 = 3rd round
let timerlength = 30; // seconds
let currquestion = null;

let set = {
	title: "ASTR 1403 Exam 1 Review",
	categories: ["Coordinates", "Time", "Angles in Astronomy", "Light", "More Light", "Potpurri"],
	questions: 
	[
		[
			[
				{q:"Basically just pointing - the coordinate system that works best when someone is right next to you",a:"altitude and azimuth",complete:false},
				{q:"The angle of the an object with respect to the meridian",a:"Hour Angle",complete:false},
				{q:"The best coordinate system for someone across the country",a:"Right ascension & declination",complete:false},
				{q:"An angle northward from the equator",a:"Declination",complete:false},
				{q:"The best coordinate system for describing the position of a planet",a:"Ecliptic",complete:false}
			],
			[
				{q:"The time between two vernal equinoxes",a:"Year",complete:false},
				{q:"23 hours and 56 minutes ",a:"Sidereal Day",complete:false},
				{q:"The Islamic calendar is this form - following only the Moon",a:"Lunar Calendar",complete:false},
				{q:"The time it takes the Earth to rotate with respect to the stars",a:"Sidereal Day",complete:false},
				{q:"This calendar is the one presently in use through most of the world, started in 1582",a:"Gregorian Calendar",complete:false}
			],
			[
				{q:"1/60 of a degree ",a:"Arc-minute",complete:false},
				{q:"The angular position shift caused by a shift in perspective (parallax)",a:"Parallax",complete:false},
				{q:"1/60 of a arc-minute.",a:"Arc-second",complete:false},
				{q:"The distance between the Earth and the Sun.",a:"Astronomical Unit",complete:false},
				{q:"The distance of an object with a parallax of 1\"",a:"Parsec",complete:false}
			],
			[
				{q:"The technical term for apparent brightness", q: "Flux",complete:false},
				{q:"The technical term for intrinsic brightness",a:"Luminosity",complete:false},
				{q:"This can be measured by a telescope and camera.",a:"Flux",complete:false},
				{q:"This quantity can be found if both distance and flux are known.",a:"Luminosity",complete:false},
				{q:"In general, flux is luminosity divided by this.",a:"Area",complete:false}
			],
			[
				{q:"Used to describe how bright a star appears to the eye", q: "Apparent Magnitude",complete:false},
				{q:"B - V, for example.",a:"Color Index",complete:false},
				{q:"Used to describe the intrinsic brightness of a star ",a:"Absolute Magnitude",complete:false},
				{q:"This filter is equivalent to green",a:"V",complete:false},
				{q:"A star with a B - V of 0 will appear to be this color",a:"Blue-white",complete:false}
			],
			[
				{q:"The distance to the nearest star if the Sun shrank down to the size of a marble", q: "60 mi (Temple, TX)",complete:false},
				{q:"The zero reference for declination",a:"The equator",complete:false},
				{q:"Solar Time",a:"Time measured with respect to the Sun",complete:false},
				{q:"An I filter is used for this type of light",a:"Infrared",complete:false},
				{q:"North",a:"The zero reference for azimuth",complete:false}
			]
		]
	]
}
		
function onAnswer()
{
	if (currquestion !== null)
	{
		if (qmode == false)
		{
			tab.removeAttribute("hidden");
			questionholder.setAttribute("hidden","true");
		}
		else
		{
			question.innerHTML = currquestion.a;
			qmode = false;
			if (mode)
				window.setTimeout(onAnswer, timerlength * 1000);
				
		}
	}
}

function onSelect()
{
	const category = Number(this.id.charAt(0)) - 1;
	const row = Number(this.id.charAt(1)) - 1;
	
	let qset = set.questions[level];
	currquestion = qset[category][row];
	if (!mode || !currquestion.complete)
	{
		tab.setAttribute("hidden","true");
		question.innerHTML = currquestion.q;
		currquestion.complete = true;
		questionholder.removeAttribute("hidden");
		qmode = true;
		if (mode)
		{
			this.innerHTML = null;
			window.setTimeout(onAnswer, timerlength * 1000);
		}
	}
	
}

function initialize()
{
	let i;
	questionholder.setAttribute("hidden","true");
	title.innerHTML = set.title;
	for (i = 1; i < 7; i++)
	{
		let cathdr = document.getElementById("cat" + i.toFixed(0));
		cathdr.innerHTML = set.categories[i - 1];
		categories.push(cathdr)
		let Sarray = new Array();
		let j;
		for (j = 1; j < 6; j++)
		{
			const id = i.toFixed(0) + j.toFixed(0);
			let button = document.getElementById(id); 
			button.onclick = onSelect;
			button.innerHTML = j * 100;
			Sarray.push(button);
		}
		selections.push(Sarray);
	}
}
initialize();


