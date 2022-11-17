let tab = document.getElementById("grid");
let title = document.getElementById("title");
let question = document.getElementById("question");
let questionholder = document.getElementById("questionholder");
let categories = new Array();
let selections = new Array();
let mode = true; // true = normal mode / false = flashcard
let qmode = true; // true = show question / false = show answer
let level = 0; //0 = 1st round, 1 = 2nd round, 2 = 3rd round
let timerlength = 10; // seconds
let currquestion = null;

let set = {
	title: "ASTR 1304 Exam 4 Review",
	categories: ["Uranus & Neptune", "Rings & Moons", "Asteroids", "Kuiper Belt & The Oort Cloud", "Comets", "Measurements"],
	questions: 
	[
		[
			[
				{q:"Uranus and Neptune both share this feature with Jupiter and Saturn, even if not as visible",a:"rings",complete:false},
				{q:"This planet is known for it's extreme seasons due to it's large axial tilt",a:"Uranus",complete:false},
				{q:"This stormy feature on Neptune was observed by Voyager 2, but is likely long gone",a:"The Great Dark Spot",complete:false},
				{q:"Uranus and Neptune have clouds consiting of these molecules, also found in the clouds on Jupiter and Saturn",a:"Ammonia, Ammonium Hydrosulfate, and Water",complete:false},
				{q:"Just above the core of Uranus and Neptune can be found the mantle, consisting of these substances",a:"Ammonia, Methane, and Water Ices",complete:false}
			],
			[
				{q:"This moon is remarkable for it's thick methane atmosphere and hydrocarbon lakes",a:"Titan",complete:false},
				{q:"Around this planet you would find the most volcanically active moon in the solar system",a:"Jupiter",complete:false},
				{q:"This moon is notable for evidence of tectonic activity, revealed by reddish-brown features called lineae",a:"Europa",complete:false},
				{q:"These types of moons have a ravioli-like appearance, such as this moon of Saturn",a:"Shepherd Moons",complete:false},
				{q:"Nearly all major moons seem to have this, which supplies geysers on some moons",a:"Subsurface Oceans",complete:false}
			],
			[
				{q:"The main-belt asteroids can be found between these two planets",a:"Mars and Jupiter",complete:false},
				{q:"The ages of meteorites have been measured using this method, finding an average age of about 4.5 billion years.",a:"Radiometric Dating",complete:false},
				{q:"This average distance between asteroids in the main belt is about 50 times the size of Earth, or about 30% larger than the average distance betwen the Earth and the Moon.",a:"500,000 km",complete:false},
				{q:"This term is used to describe asteroids that share a similar orbit around the Sun.",a:"Families",complete:false},
				{q:"M-Type asteroids are thought to be the remnant of this part of a larger body",a:"Iron Core",complete:false}
			],
			[
				{q:"This object is the largest known body within the Kuiper belt", q: "Pluto",complete:false},
				{q:"This moon is thought to be a captured Kuiper Belt object",a:"Triton",complete:false},
				{q:"These companions seem to be quite common to Kuiper Belt Objects, unlike the smaller planets in the inner solar system.",a:"Moons",complete:false},
				{q:"Craters on parts of Pluto show evidence of this phenomenon, only otherwise directly observed on Earth.",a:"Frost or Snow",complete:false},
				{q:"Dwarf planets in the Kuiper Belt probably all have mantles consisting of this substance.",a:"Ices",complete:false}
			],
			[
				{q:"This well known comet returns every 75 years; it will return in 2061", q: "Halley",complete:false},
				{q:"This substance, extremely common on Earth, can readily be found on comets and their coma and tail.",a:"Water",complete:false},
				{q:"This type of comet may originate in the Oort cloud",a:"One-and-Done",complete:false},
				{q:"This component of a comet is contorlled by the Sun's magnetic field",a:"Ion Tail",complete:false},
				{q:"This scary sounding molecule can be found in the coma and tail of comets",a:"Formeldehyde",complete:false}
			],
			[
				{q:"The synodic variety of this can be observed directly, the sidereal one needs a little bit of calculation", q: "Orbital Period",complete:false},
				{q:"By measuring the angular size of an object, and knowing it's distance, we can find this property of an object",a:"Radius or Diameter",complete:false},
				{q:"Only by observing an orbiting partner or moon can we find this for a planet or other body",a:"Mass",complete:false},
				{q:"The orbital distance of any object is found using this mathematical method",a:"Trigonometry",complete:false},
				{q:"To determine the composition of an object, we need to measure one of these",a:"Spectrum",complete:false}
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


