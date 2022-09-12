// Constellation lines using SIMBAD (http://simbad.cfa.harvard.edu/) star names 
// and based on IAU constellation maps (https://www.iau.org/public/themes/constellations/)
// some personal liberties have been taken, so these don't entirely match the IAU depictions

// Constellations types:
// zodiac: the commonly known zodiacal constellations
// major: constellations that the average non-astronomer might know
// minor: constellations that the average non-astronomer probably hasn't heard of, or at least couldn't recognize
// obscure: used to separate constellations that the average non-astronomer has almost certainly not heard of or could recognize. Mostly small or relatively shapeless constellations.
// note: I've made these type designations based on my own knowledge of the sky. I live in the U.S., so the northern hemisphere constellations are more familiar to me,
// so the "major" constellations are definitely biased. I'm happy to add southern hemisphere major constellations if there are some that are commonly recognized that I haven't included.

const constellationData = [
	{name:"Andromeda", type:"minor", paths:[ 
			["* alf And","* del And","* bet And","* gam01 And"],
			["* eta And","* zet And","* eps And","* del And","* pi. And","* iot And","* kap And","* lam And"],
			["* iot And","* omi And"],
			["* pi. And","* bet And","* mu. And","* nu. And","* phi And","* ups Per"]
		]
	},
	{name:"Antila", type:"obscure", paths:[ 
			["* eps Ant", "* alf Ant", "* iot Ant"]
		]
	},
	{name:"Apus", type:"obscure", paths:[ 
			["* alf Aps", "* del01 Aps", "* gam Aps", "* bet Aps", "* del01 Aps"]
		]
	},
	{name:"Aquarius", type:"zodiac", paths:[ 
			["* eps Aqr", "* mu. Aqr", "* bet Aqr", "* alf Aqr", "* pi. Aqr", "* zet Aqr", "* gam Aqr", "* alf Aqr", "* tet Aqr", "* lam Aqr", "* tau Aqr", "* del Aqr", "* psi01 Aqr", "* phi Aqr", "* lam Aqr"],
			["* eta Aqr", "* zet Aqr"],
			["* iot Aqr", "* bet Aqr"],
			["* b01 Aqr", "* psi01 Aqr", "* c02 Aqr"]
		]
	},
	{name:"Aquila", type:"minor", paths:[ 
			["* i Aql", "* lam Aql", "* del Aql", "* alf Aql", "* gam Aql", "* zet Aql", "* del Aql", "* eta Aql", "* tet Aql", "* bet Aql", "* alf Aql"]
		]
	},
	{name:"Ara", type:"obscure", paths:[ 
			["* tet Ara", "* alf Ara", "* eps01 Ara", "* zet Ara", "* eta Ara", "* del Ara", "* gam Ara", "* bet Ara", "* alf Ara"]
		]
	},
	{name:"Aries", type:"zodiac", paths:[ 
			["*  41 Ari", "* alf Ari", "* bet Ari", "* gam01 Ari"]
		]
	},
	{name:"Auriga", type:"minor", paths:[ 
			["* iot Aur", "* eta Aur", "* alf Aur", "* del Aur", "* bet Aur", "* tet Aur", "* bet Tau", "* iot Aur"],
			["* zet Aur", "* eps Aur", "* alf Aur", "* bet Aur"]
		]
	},
	{name:"Bootes", type:"minor", paths:[ 
			["* zet Boo", "* alf Boo", "* eps Boo", "* del Boo", "* bet Boo", "* gam Boo", "* rho Boo", "* alf Boo", "* eta Boo", "* tau Boo"],
			["* gam Boo", "* lam Boo", "* kap02 Boo", "* tet Boo", "* lam Boo"]
		]
	},
	{name:"Caelum", type:"obscure", paths:[ 
			["* gam Cae", "* bet Cae", "* alf Cae", "* del Cae"]
		]
	},
	{name:"Camelopardalis", type:"obscure", paths:[ 
			["*   7 Cam", "* bet Cam", "* alf Cam", "* gam Cam", "V* BE Cam", "HD  21291"],
			["* alf Cam", "HD  29678"]
		]
	},
	{name:"Cancer", type:"zodiac", paths:[ 
			["* iot Cnc", "* gam Cnc", "* del Cnc", "* bet Cnc"],
			["* zet01 Cnc A", "* del Cnc", "* alf Cnc"]
		]
	},
	{name:"Canes Venatici", type:"obscure", paths:[ 
			["* alf01 CVn" , "* bet CVn"]
		]
	},
	{name:"Canis Major", type:"major", paths:[ 
			["* alf CMa", "* bet CMa", "* nu.02 CMa", "* omi01 CMa", "* eps CMa", "* del CMa", "* alf CMa"],
			["* eta CMa", "* del CMa"],
			["* alf CMa", "* iot CMa", "* gam CMa", "* tet CMa", "* iot CMa"]
		]
	},
	{name:"Canis Minor", type:"minor", paths:[ 
			["* alf CMi" , "* bet CMi"]
		]
	},
	{name:"Capricornus", type:"zodiac", paths:[ 
			["* alf01 Cap", "* bet01 Cap", "* omi Cap A", "* psi Cap", "* ome Cap", "* zet Cap", "* eps Cap", "* del Cap", "* gam Cap", "* iot Cap", "* tet Cap", "* alf01 Cap"]
		]
	},
	{name:"Carina", type:"obscure", paths:[ 
			["* alf Car", "* bet Car", "* ome Car", "* tet Car", "* z Car", "* y Car", "* x Car", "* u Car", "* p Car", "* tet Car"],
			["* p Car", "* q Car", "* iot Car", "* kap Vel", "* del Vel", "* chi Car", "* eps Car", "* iot Car"]
		]
	},
	{name:"Cassiopeia", type:"major", paths:[ 
			["* eps Cas","* del Cas","* gam Cas","* alf Cas","* bet Cas"]
		]
	},
	{name:"Centaurus", type:"major", paths:[ 
			["* alf Cen", "* bet Cen", "* eps Cen", "* zet Cen", "* ups01 Cen", "* phi Cen", "* chi Cen", "* psi Cen", "* tet Cen", "* nu. Cen", "* mu. Cen", "* zet Cen", "* gam Cen", "* eps Cen"],
			["* phi Cen", "* eta Cen", "* kap Cen"],
			["* nu. Cen", "* d Cen", "* iot Cen", "* n Cen"],
			["* gam Cen", "* sig Cen", "* del Cen", "* pi. Cen A"],
			["* sig Cen", "* rho Cen", "* omi01 Cen"]
		]
	},
	{name:"Cepheus", type:"minor", paths:[ 
			["* tet Cep", "* eta Cep", "* alf Cep", "* mu. Cep", "* zet Cep", "* del Cep", "* iot Cep", "* bet Cep", "* gam Cep", "* iot Cep"],
			["* alf Cep", "* bet Cep"]
		]
	},
	{name:"Cetus", type:"minor", paths:[ 
			["* gam Cet", "* nu. Cet", "* ksi02 Cet", "* mu. Cet", "* lam Cet", "* alf Cet", "* gam Cet", "* del Cet", "* zet Cet", "* tet Cet", "* eta Cet", "* iot Cet", "* bet Cet", "* tau Cet", "* zet Cet"]
		]
	},
	{name:"Chamaeleon", type:"obscure", paths:[ 
			["* alf Cha", "* gam Cha", "* eps Cha A", "* bet Cha", "* del02 Cha", "* gam Cha"]
		]
	},
	{name:"Circinus", type:"obscure", paths:[ 
			["* gam Cir A", "* alf Cir", "* bet Cir"]
		]
	},
	{name:"Columba", type:"obscure", paths:[ 
			["* eps Col", "* alf Col", "* bet Col", "* del Col"],
			["* bet Col", "* eta Col"]
		]
	},
	{name:"Coma Berenices", type:"obscure", paths:[ 
			["* alf Com", "* bet Com", "* gam Com"]
		]
	},
	{name:"Corona Australis", type:"obscure", paths:[ 
			["* gam CrA", "* alf CrA", "* bet CrA", "* del CrA", "* tet CrA"]
		]
	},
	{name:"Corona Borealis", type:"minor", paths:[ 
			["* tet CrB","* bet CrB","* alf CrB","* gam CrB A","* del CrB","* eps CrB"]
		]
	},
	{name:"Corvus", type:"obscure", paths:[ 
			["* alf Crv", "* eps Crv", "* bet Crv", "* del Crv", "* gam Crv", "* eps Crv"]
		]
	},
	{name:"Crater", type:"major", paths:[ 
			["* alf Crt", "* bet Crt", "* gam Crt", "* del Crt", "* alf Crt"],
			["* eta Crt", "* zet Crt", "* gam Crt", "* del Crt", "* eps Crt", "* tet Crt"]
		]
	},
	{name:"Crux", type:"major", paths:[ 
			["* gam Cru", "* alf01 Cru"],
			["* bet Cru", "* del Cru"]
		]
	},
	{name:"Cygnus", type:"major", paths:[ 
			["* bet01 Cyg", "* eta Cyg", "* gam Cyg", "* alf Cyg"],
			["* zet Cyg", "* eps Cyg", "* gam Cyg", "* del Cyg", "* iot Cyg", "* kap Cyg"]
		]
	},
	{name:"Delphinus", type:"minor", paths:[ 
			["* eps Del", "* bet Del", "* del Del", "* gam02 Del", "* alf Del", "* bet Del"]
		]
	},
	{name:"Dorado", type:"obscure", paths:[ 
			["* gam Dor", "* alf Dor", "* bet Dor", "* del Dor", "*  36 Dor", "* bet Dor", "* zet Dor", "* alf Dor"]
		]
	},
	{name:"Draco", type:"obscure", paths:[ 
			["* lam Dra", "* kap Dra", "* alf Dra", "* iot Dra", "* tet Dra", "* eta Dra", "* zet Dra", "* ome Dra", "* phi Dra", "* del Dra", "* ksi Dra", "* nu.02 Dra", "* bet Dra", "* gam Dra", "* ksi Dra"],
			["* del Dra", "* eps Dra"],
			["* phi Dra", "* chi Dra"]
		]
	},
	{name:"Equuleus", type:"obscure", paths:[ 
			["* alf Equ", "* del Equ"]
		]
	},
	{name:"Eridanus", type:"obscure", paths:[ 
			["* bet Eri", "* ome Eri", "* mu. Eri", "* nu. Eri", "* ksi Eri", "* omi01 Eri", "* gam Eri", "* pi. Eri", "* del Eri", "* eps Eri", "* zet Eri", "* eta Eri", "* tau01 Eri", "* tau02 Eri", "* tau03 Eri", "* tau04 Eri", "* tau05 Eri", "* tau06 Eri", "* tau08 Eri", "* tau09 Eri", "* ups01 Eri", "* ups02 Eri", "* ups04 Eri", "* tet01 Eri", "* s Eri", "* kap Eri", "* phi Eri", "* chi Eri", "* alf Eri"]
		]
	},
	{name:"Fornax", type:"obscure", paths:[ 
			["* alf For", "* bet For","* nu. For"]
		]
	},
	{name:"Gemini", type:"zodiac", paths:[ 
			["* ksi Gem", "* lam Gem", "* del Gem", "* ups Gem", "* iot Gem", "* tau Gem", "* eps Gem", "* mu. Gem", "* eta Gem", "*   1 Gem"],
			["* gam Gem", "* zet Gem", "* del Gem"],
			["* kap Gem", "* ups Gem", "* bet Gem"],
			["* alf Gem", "* tau Gem", "* tet Gem"],
			["* eps Gem", "* nu. Gem"]
		]
	},
	{name:"Grus", type:"minor", paths:[ 
			["* gam Gru", "* lam Gru","* mu.01 Gru", "* del01 Gru", "* bet Gru", "* eps Gru", "* zet Gru"],
			["* del01 Gru", "* alf Gru", "* bet Gru"]
		]
	},
	{name:"Hercules", type:"major", paths:[ 
			["* omi Her", "* ksi Her", "* mu.01 Her", "* lam Her", "* del Her", "* eps Her", "* pi. Her", "* eta Her", "* zet Her", "* bet Her", "* alf Her", "* del Her"],
			["* eps Her", "* zet Her"],
			["* iot Her", "* tet Her", "* rho Her", "* pi. Her"],
			["* eta Her", "* sig Her", "* tau Her", "* phi Her", "* chi Her"],
			["* bet Her", "* gam Her", "* ome Her", "* h Her"]
		]
	},
	{name:"Horologium", type:"obscure", paths:[ 
			["* alf Hor", "* iot Hor", "* eta Hor", "* zet Hor", "* mu. Hor", "* bet Hor"]
		]
	},
	{name:"Hydra", type:"obscure", paths:[ 
			["* E Hya", "* pi. Hya", "* gam Hya", "* psi Hya", "* bet Hya", "* ksi Hya", "* nu. Hya", "* phi Hya", "* mu. Hya", "* lam Hya", "* ups02 Hya", "* ups01 Hya", "* alf Hya", "* iot Hya", "* tet Hya", "* zet Hya", "* eps Hya", "* del Hya", "* sig Hya", "* eta Hya", "* rho Hya"]
		]
	},
	{name:"Hydrus", type:"obscure", paths:[ 
			["* alf Hyi", "* bet Hyi", "* gam Hyi", "* alf Hyi"]
		]
	},
	{name:"Indus", type:"obscure", paths:[ 
			["* alf Ind", "* bet Ind", "* del Ind", "* tet Ind A", "* alf Ind"]
		]
	},
	{name:"Lacerta", type:"obscure", paths:[ 
			["*   1 Lac", "HD 211073", "*   6 Lac", "*   2 Lac", "*   5 Lac", "*   4 Lac", "* bet Lac", "* alf Lac", "*   5 Lac", "*  11 Lac", "*   6 Lac"]
		]
	},
	{name:"Leo", type:"zodiac", paths:[ 
			["* eps Leo","* mu. Leo","* zet Leo","* gam Leo", "* eta Leo", "* alf Leo", "* tet Leo", "* bet Leo", "* del Leo", "* gam Leo"],
			["* del Leo","* tet Leo"] 
		]
	},
	{name:"Leo Minor", type:"obscure", paths:[ 
			["*  10 LMi", "*  21 LMi", "*  30 LMi", "*  46 LMi", "* bet LMi", "*  21 LMi"]
		]
	},
	{name:"Lepus", type:"minor", paths:[ 
			["* alf Lep", "* zet Lep", "* eta Lep", "* tet Lep", "* del Lep", "* gam Lep", "* bet Lep", "* alf Lep", "* mu. Lep", "* eps Lep", "* bet Lep"],
			["* lam Lep", "* mu. Lep", "* kap Lep A"]
		]
	},
	{name:"Libra", type:"zodiac", paths:[ 
			["* tau Lib", "* ups Lib", "* gam Lib", "* bet Lib", "* alf01 Lib", "* sig Lib"],
			["* gam Lib", "* alf01 Lib"]
		]
	},
	{name:"Lupus", type:"minor", paths:[ 
			["* alf Lup", "* zet Lup", "* eta Lup", "* chi Lup", "* phi01 Lup", "* eta Lup", "* gam Lup", "* eps Lup", "* mu.01 Lup", "* zet Lup"],
			["* gam Lup", "* del Lup", "* bet Lup"]
		]
	},
	{name:"Lynx", type:"obscure", paths:[ 
			["* alf Lyn", "*  38 Lyn", "HD  77912", "*  10 UMa", "*  31 Lyn", "*  21 Lyn", "*  15 Lyn", "*   2 Lyn"]
		]
	},
	{name:"Lyra", type:"minor", paths:[ 
			["* alf Lyr", "* zet01 Lyr", "* bet Lyr", "* gam Lyr", "* del02 Lyr", "* zet01 Lyr", "* eps01 Lyr", "* alf Lyr"]
		]
	},
	{name:"Mensa", type:"obscure", paths:[ 
			["* alf Men", "* bet Men", "* mu. Men", "* eta Men", "* gam Men", "* alf Men"]
		]
	},
	{name:"Miscroscopium", type:"obscure", paths:[ 
			["* eps Mic", "* gam Mic", "* alf Mic"]
		]
	},
	{name:"Monoceros", type:"minor", paths:[ 
			["* alf Mon", "* zet Mon", "* del Mon", "* bet Mon", "* gam Mon"],
			["* del Mon", "*  18 Mon", "* eps Mon A", "*  13 Mon", "*  15 Mon"],
			["*  18 Mon", "*  13 Mon"]
		]
	},
	{name:"Musca", type:"obscure", paths:[ 
			["* lam Mus", "* eps Mus", "* alf Mus", "* bet Mus A", "* del Mus", "* gam Mus", "* alf Mus"]
		]
	},
	{name:"Norma", type:"obscure", paths:[ 
			["* del Nor", "* eta Nor", "* gam02 Nor", "* eps Nor", "* del Nor"]
		]
	},
	{name:"Octans", type:"obscure", paths:[ 
			["* bet Oct", "* nu. Oct", "* del Oct", "* bet Oct"]
		]
	},
	{name:"Ophiucus", type:"obscure", paths:[ 
			["* alf Oph", "* kap Oph", "* del Oph", "* eps Oph", "* ups Oph", "* zet Oph", "* eta Oph", "* bet Oph", "* gam Oph", "* nu. Oph"],
			["* alf Oph", "* bet Oph"],
			["* kap Oph", "* zet Oph", "* phi Oph", "* chi Oph", "* psi Oph", "* rho Oph"],
			["* eta Oph", "* tet Oph", "* d Oph"]
		]
	},
	{name:"Orion", type:"major", paths:[ 
			["* kap Ori","* zet Ori","* alf Ori","* lam Ori","* gam Ori","* del Ori","* eta Ori","* bet Ori"],
			["* zet Ori","* eps Ori","* del Ori"],// belt
			["* alf Ori","* gam Ori","* pi.03 Ori","* pi.02 Ori","* pi.01 Ori"], // arm and bow.  optional, but looks bad: ,"* omi Ori","*  11 Ori"],
			["* pi.03 Ori","* pi.04 Ori","* pi.05 Ori","* pi.06 Ori"],// bottom of bow
			["* zet Ori","* tet01 Ori C"]// sword
		]
	},
	{name:"{Pavo", type:"minor", paths:[ 
			["* del Pav", "* alf Pav", "* gam Pav", "* bet Pav", "* del Pav", "* lam Pav", "* ksi Pav", "* pi. Pav", "* kap Pav", "* del Pav", "* zet Pav"],
			["* del Pav", "* eps Pav"],
			["* pi. Pav", "* eta Pav"]
		]
	},
	{name:"{Pegasus", type:"major", paths:[ 
			["* alf And", "* gam Peg", "* alf Peg", "* bet Peg", "* alf And"],
			["* pi. Peg", "* eta Peg", "* bet Peg", "* lam Peg", "* iot Peg", "* kap Peg"],
			["* alf Peg", "*  42 Peg", "* tet Peg", "* eps Peg"]
		]
	},
	{name:"{Perseus", type:"major", paths:[ 
			["* gam Per", "* tau Per", "* eta Per", "* gam Per", "* alf Per", "* del Per", "* c Per", "* mu. Per", "* b Per", "* lam Per"],
			["* del Per", "* eps Per", "* ksi Per", "* zet Per", "* omi Per"],
			["* phi Per", "* tet Per", "* iot Per", "* alf Per"],
			["* iot Per", "* bet Per", "* eps Per"],
			["* bet Per", "* rho Per"]
		]
	},
	{name:"{Phoenix", type:"minor", paths:[ 
			["* alf Phe", "* eps Phe", "* bet Phe", "* zet Phe", "* del Phe", "* gam Phe", "* bet Phe", "* alf Phe"]
		]
	},
	{name:"{Pictor", type:"obscure", paths:[ 
			["* alf Pic", "* gam Pic", "* bet Pic"]
		]
	},
	{name:"{Pisces", type:"zodiac", paths:[ 
			["* iot Psc", "* lam Psc", "* kap Psc", "* gam Psc", "* tet Psc", "* iot Psc", "* ome Psc", "* del Psc", "* eps Psc", "* zet Psc A", "* mu. Psc", "* nu. Psc", "* ksi Psc", "* alf Psc A", "* omi Psc", "* pi. Psc", "* eta Psc", "* rho Psc", "* phi Psc", "* tau Psc", "* ups Psc", "* phi Psc"]
		]
	},
	{name:"{Pisces Austrinus", type:"minor", paths:[ 
			["* alf PsA", "* eps PsA", "* mu. PsA", "* tet PsA", "* iot PsA", "* mu. PsA", "* bet PsA", "* gam PsA", "* del PsA", "* alf PsA"]
		]
	},
	{name:"{Puppis", type:"minor", paths:[ 
			[ "* gam01 Vel", "* zet Pup", "* rho Pup", "* ksi Pup", "* k01 Pup", "* pi. Pup", "* nu. Pup", "* alf Car"]
		]
	},
	{name:"{Pyxis", type:"obscure", paths:[ 
			["* gam Pyx", "* alf Pyx", "* bet Pyx"]
		]
	},
	{name:"Reticulum", type:"obscure", paths:[ 
			["* alf Ret", "* bet Ret", "* del Ret", "* eps Ret", "* alf Ret"]
		]
	},
	{name:"Sagitta", type:"obscure", paths:[ 
			["* alf Sge", "* del Sge", "* gam Sge"],
			["* bet Sge", "* del Sge"]
		]
	},
	{name:"Sagittarius", type:"zodiac", paths:[ 
			["* eta Sgr", "* eps Sgr", "* gam01 Sgr", "* del Sgr", "* lam Sgr", "* phi Sgr", "* sig Sgr", "* tau Sgr", "* zet Sgr", "* phi Sgr", "* del Sgr", "* eps Sgr", "* zet Sgr"],
			["* lam Sgr", "* mu. Sgr"],
			["* sig Sgr", "* zet Sgr", "* omi Sgr", "* pi. Sgr", "* rho01 Sgr"],
			["* alf Sgr", "* kap01 Sgr", "* bet01 Sgr"],
			["* kap01 Sgr", "* tet01 Sgr", "* zet Sgr"]
		]
	},
	{name:"Scorpius", type:"zodiac", paths:[ 
			["* G Sco", "* lam Sco", "* kap Sco", "* iot01 Sco", "* tet Sco", "* eta Sco", "* zet01 Sco", "* mu.01 Sco", "* eps Sco", "* tau Sco", "* alf Sco", "* sig Sco", "* del Sco", "* bet Sco"],
			["* del Sco", "* pi. Sco", "* rho Sco"]
		]
	},
	{name:"Sculptor", type:"obscure", paths:[ 
			["* alf Scl", "* del Scl", "* gam Scl", "* bet Scl"]
		]
	},
	{name:"Scutum", type:"obscure", paths:[ 
			["* alf Sct", "* bet Sct", "* del Sct", "* gam Sct", "* alf Sct"]
		]
	},
	{name:"Serpens", type:"obscure", paths:[ 
			["* tet01 Ser", "* eta Ser", "* nu. Oph", "* zet Ser", "* eta Oph"], // the tail - Serpens Cauda
			["* del Oph", "* mu. Ser", "* eps Ser", "* alf Ser", "* del Ser A", "* bet Ser", "* iot Ser", "* kap Ser", "* gam Ser", "* bet Ser"], // the head - Serpens Caput
		]
	},
	{name:"Sextans", type:"obscure", paths:[ 
			["* del Sex", "* bet Sex", "* alf Sex", "* gam Sex A"]
		]
	},
	{name:"Taurus", type:"zodiac", paths:[ 
			["* nu. Tau","* ksi Tau","* lam Tau","* gam Tau","* del Tau","* eps Tau","* bet Tau"],
			["* gam Tau","* alf Tau","* zet Tau"],
			["* eps Tau","* alf Tau"],
			["* omi Tau","*  10 Tau"]
		]
	},
	{name:"Telescopium", type:"obscure", paths:[ 
			["* eta Tel", "* alf Tel", "* zet Tel"]
		]
	},
	{name:"Triangulum", type:"minor", paths:[ 
			["* alf Tri", "* bet Tri", "* gam Tri", "* alf Tri"]
		]
	},
	{name:"Triangulum Australe", type:"minor", paths:[ 
			["* alf TrA", "* bet TrA", "* gam TrA", "* alf TrA"]
		]
	},
	{name:"Tucana", type:"minor", paths:[ 
			["* alf Tuc", "* del Tuc", "* eps Tuc", "* zet Tuc", "* bet01 Tuc", "* gam Tuc", "* alf Tuc"]
		]
	},
	{name:"Ursa Major", type:"major", paths:[ 
			["* eta UMa", "* zet01 UMa", "* eps UMa", "* del UMa", "* alf UMa", "* h UMa", "* omi UMa", "* ups UMa", "* bet UMa", "* gam UMa", "* del UMa"],
			["* alf UMa", "* bet UMa"],
			["* h UMa", "* ups UMa"],
			["* gam UMa", "* chi UMa", "* nu. UMa", "* ksi UMa"],
			["* chi UMa", "* psi UMa", "* mu. UMa", "* lam UMa"],
			["* ups UMa", "* tet UMa", "* kap UMa", "* iot UMa"]
		]
	},
	{name:"Ursa Minor", type:"major", paths:[ 
			["* alf UMi", "* del UMi", "* eps UMi", "* zet UMi", "* bet UMi", "* gam UMi", "* eta UMi", "* zet UMi"]
		]
	},
	{name:"Vela", type:"obscure", paths:[ 
			["* del Vel", "* gam01 Vel", "* lam Vel", "* psi Vel", "* q Vel", "* mu. Vel", "* phi Vel", "* kap Vel", "* del Vel"]
		]
	},
	{name:"Virgo", type:"zodiac", paths:[ 
			["* mu. Vir", "* iot Vir", "* zet Vir", "* gam Vir", "* eta Vir", "* bet Vir", "* nu. Vir", "* omi Vir", "* eta Vir"],
			["* alf Vir", "* tet Vir", "* gam Vir", "* del Vir", "* eps Vir"],
			["* zet Vir", "* tau Vir", "* 109 Vir"]
		]
	},
	{name:"Volans", type:"obscure", paths:[ 
			["* alf Vol","* bet Vol","* eps Vol","* del Vol","* gam01 Vol","* eps Vol","* alf Vol"]
		]
	},
	{name:"Vulpecula", type:"obscure", paths:[ 
			["* alf Vul", "*  15 Vul"]
			]
	}
]



function createConstellations()
{
	for (i = 0; i < constellationData.length; i++)
	{
		let j;
		constellationData[i].pathData = new Array();
		for (j = 0; j < constellationData[i].paths.length; j++)
		{
			let k;
			let pathCurr = new Array();
			for (k = 0; k < constellationData[i].paths[j].length; k++)
			{
				const idx = starFindByID(constellationData[i].paths[j][k]);
				if (idx !== null)
				{
					pathCurr.push(idx);
				}
				else
				{
					console.log("Did not find " + constellationData[i].paths[j][k])
				}
			}
			constellationData[i].pathData.push(pathCurr);
		}
	}
}
let constellationsReady = false;

function prepareConstellations()
{
	if (!starsm6.ready)
	{
		window.setTimeout(prepareConstellations, 1000.0); // wait 1 second and try again
	}
	else
	{
		createConstellations();
		constellationsReady = true;
	}
}
prepareConstellations();
