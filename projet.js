"use strict"

var background_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
in vec3 position_in;
in vec2 texcoord_in;
out vec2 TC;

void main()
{
	mat3 vm3 = mat3(viewMatrix);

	mat4 vm4 = mat4(vm3);

	gl_Position = projectionMatrix * vm4 * vec4(position_in,1);

	TC = texcoord_in;
}`;


var background_frag=`#version 300 es
precision highp float;
uniform sampler2D TU0;
in vec2 TC;
out vec4 frag_out;
void main()
{
	vec3 color = texture(TU0, TC).rgb;
	frag_out = vec4(color, 1);
}`;


var sun_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;

in vec3 position_in;
in vec2 texcoord_in;

out vec2 TC;

void main()
{
	vec4 P4 = viewMatrix*vec4(position_in,1.0);
	gl_Position = projectionMatrix * P4;

	TC= vec2(1.0 - texcoord_in.x, texcoord_in.y);
}`;


var sun_frag=`#version 300 es
precision highp float;
uniform sampler2D TU0;

in vec2 TC;

out vec4 frag_out;

void main()
{
	vec4 color= texture(TU0,TC);
	frag_out = vec4(color);
}`;


var planet_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;

in vec3 position_in;
in vec2 texcoord_in;
in vec3 normal_in;

out vec3 Po;
out vec3 No;
out vec2 TC;

void main()
{
	vec4 P4 = viewMatrix*vec4(position_in,1.0);

	No = normalMatrix * normal_in;
	Po = P4.xyz;

	gl_Position = projectionMatrix * P4;

	TC= vec2(1.0 - texcoord_in.x, texcoord_in.y);
}`;

var planet_frag=`#version 300 es
precision highp float;
uniform sampler2D TU0;
uniform vec3 light_pos;

uniform float specness;
uniform float shininess;


in vec3 Po;
in vec3 No;
in vec2 TC;

out vec4 frag_out;

void main()
{
	vec3 N = normalize(No);
	vec3 L = normalize(light_pos-Po);
	float ps = dot(N,L);
	
	if (gl_FrontFacing)
	{
		float lamb = clamp(ps,0.1,1.0);
		vec3 E = normalize(-Po);
		vec3 R = reflect(-L, N);
		float spec = pow( max(dot(R,E), 0.0), specness);
		vec3 color= texture(TU0,TC).rgb;
		vec3 specol = mix(color, vec3(1.0),shininess);
		frag_out = vec4(mix(color*lamb,specol,spec),1);
	}
}`;

var orbite_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform float orbiteWidth;
uniform float orbiteOffset;
uniform int orbitePrecision;
uniform int side;

int modulo(int a, int b)	//la fonction mod ne voulant pas marcher, on prend une fonction custom, on utilise des float pour éviter un warning sur la division d'entier à l'affichage
{
    float tmp = float(a)/float(b);
    return a - (b*int(tmp));
}

void main()
{
	float a = 6.2832*float(gl_VertexID)/float(orbitePrecision);
	if(side==0)		//orbite horizontale
	{
		if(modulo(gl_VertexID,2)==0)
			gl_Position = projectionMatrix * viewMatrix * vec4(sin(a)*(orbiteOffset+orbiteWidth),cos(a)*(orbiteOffset+orbiteWidth),0,1);
		else
			gl_Position = projectionMatrix * viewMatrix * vec4(sin(a)*(orbiteOffset-orbiteWidth),cos(a)*(orbiteOffset-orbiteWidth),0,1);
	}
	else		//orbite verticale
	{
		if(modulo(gl_VertexID,2)==0)
			gl_Position = projectionMatrix * viewMatrix * vec4(sin(a)*(orbiteOffset),cos(a)*(orbiteOffset),orbiteWidth,1);
		else
			gl_Position = projectionMatrix * viewMatrix * vec4(sin(a)*(orbiteOffset),cos(a)*(orbiteOffset),-orbiteWidth,1);
	}
	
}`;

var orbite_frag=`#version 300 es
precision mediump float;
out vec4 frag_out;

void main()
{
	frag_out = vec4(0,1,0.9,1);
}`;

var saturn_ring_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform float orbiteWidth;
uniform float orbiteOffset;
uniform int orbitePrecision;
in vec3 position_in;
in vec2 texcoord_in;
out vec2 tc;

int modulo(int a, int b)	//la fonction mod ne voulant pas marcher, on prend une fonction custom, on utilise des float pour éviter un warning sur la division d'entier à l'affichage
{
    float tmp = float(a)/float(b);
    return a - (b*int(tmp));
}

void main()
{
	float a = 6.2832*float(gl_VertexID)/float(orbitePrecision);
	if(modulo(gl_VertexID,2)==0)
	{
		gl_Position = projectionMatrix * viewMatrix * vec4(sin(a)*(orbiteOffset+orbiteWidth),cos(a)*(orbiteOffset+orbiteWidth),0,1);
		tc = vec2(0.0,1.0);
	}
	else
	{
		gl_Position = projectionMatrix * viewMatrix * vec4(sin(a)*(orbiteOffset),cos(a)*(orbiteOffset),0,1);
		tc = vec2(1.0,1.0);
	}
}`;

var saturn_ring_frag=`#version 300 es
precision highp float;
uniform sampler2D TU0;
in vec2 tc;
out vec4 frag_out;

void main()
{
	vec4 color = texture(TU0,tc);

	frag_out = vec4(color);
}`;


var ceinture_asteroide_vert = `#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
in vec3 position_in;
in vec2 texcoord_in;
uniform float orbiteOffset;
uniform float randoms;

out vec2 TC;



void main()
{
	float a = 6.2832*float(randoms);
	gl_Position = projectionMatrix * viewMatrix * vec4(sin(a)*orbiteOffset,cos(a)*orbiteOffset,0,1) + vec4(texcoord_in.x*0.00005,texcoord_in.y*0.0001,0,0);

	TC=vec2(texcoord_in+vec2(1.0))/2.0;
	TC=vec2(TC.x,1.0-TC.y);
}`;


var ceinture_asteroide_frag = `#version 300 es
precision highp float;
uniform sampler2D TU0;
in vec2 TC;
out vec4 frag_out;

void main()
{
	vec4 color= texture(TU0,TC);

	if(color.a!=1.0)
		discard;

	frag_out= vec4(color);
}
`;



let prg_background = null;
let prg_sun = null;
let prg_planet = null;
let prg_orbite = null;
let prg_saturn_ring = null;
let prg_ceinture_asteroide = null;
let mesh_rend = null;

//textures du background
let tex_background;

//textures des planètes
let tex_sun;
let tex_mercury;
let tex_venus;
let tex_earth;
let tex_mars;
let tex_jupiter;
let tex_saturn;
let tex_uranus;
let tex_neptune;

let tex_saturn_ring;
let tex_uranus_ring;

let tex_moon;

let tex_asteroide1;
let tex_asteroide2;
let tex_asteroide3;
let tex_asteroide4;
let tex_asteroide5;
let tex_asteroide6;
let tex_asteroide7;
let tex_asteroide8;
let tex_asteroide9;
let tex_asteroide10;

//taille des planètes (rayon moyen, soleil exclu, sa taille sera fixé)
let mercuryscale = 2439.0;
let venusscale = 6051.0;
let earthscale = 6371.0;
let marsscale = 3389.0;
let jupiterscale = 69911.0;
let saturnscale = 58232.0;
let saturnringstartscale = 66900.0;
let saturnringendscale = 140180.0;
let uranusscale = 25362.0;
let uranusringstartscale = 38000.0;
let uranusringendscale = 66000.0;
let neptunescale = 24622.0;
let moonscale = 1737.0;
let maxScale = jupiterscale;
let minScale = mercuryscale;

//distance entre la planète et le soleil
let mercurydisttosoleil = 57909227.0;
let venusdisttosoleil = 108208475.0;
let earthdisttosoleil = 149589262.0;
let marsdisttosoleil = 227943824.0;
let ceintureasteroidedisttosoleil = 500000000.0;
let jupiterdisttosoleil = 778340821.0;
let saturndisttosoleil = 1426666422.0;
let uranusdisttosoleil = 2870658186.0;
let neptunedisttosoleil = 4498396441.0;
let moondisttoearth = 384400.0;
let minDist = mercurydisttosoleil;
let maxDist = neptunedisttosoleil;

//rotation initiale (on les initialisent aléatoirement pour éviter un rendu trop brut)
let mercuryinitrot = Math.random()*360;
let venusinitrot = Math.random()*360;
let earthinitrot = Math.random()*360;
let marsinitrot = Math.random()*360;
let jupiterinitrot = Math.random()*360;
let saturninitrot = Math.random()*360;
let uranusinitrot = Math.random()*360;
let neptuneinitrot = Math.random()*360;
let mooninitrot = Math.random()*360;

//inclinaison des astres
let suninclinaison = 7.25;
let mercuryinclinaison = 0.03;
let venusinclinaison = 177.36;
let earthinclinaison = 23.44;
let marsinclinaison = 25.19;
let jupiterinclinaison = 3.12;
let saturninclinaison = 26.73;
let uranusinclinaison = 97.77;
let neptuneinclinaison = 28.3;
let mooninclinaison = 6.68;

//vitesse de rotation autour du soleil (terre pour la lune) (= temps de révolution, on divise pour avoir les valeurs inverses et obtenir une vitesse de rotation en fonction des autres planètes)
let mercuryrotspeed = 1.0/87.0;
let venusrotspeed = 1.0/224.0;
let earthrotspeed = 1.0/365.0;
let marsrotspeed = 1.0/686.0;
let jupiterrotspeed = 1.0/4335.0;
let saturnrotspeed = 1.0/10757.0;
let uranusrotspeed = 1.0/30687.0;
let neptunerotspeed = 1.0/60224.0;
let moonrotspeed = 1.0/27.3;
let minRotSpeed = neptunerotspeed;
let maxRotSpeed = mercuryrotspeed;

//vitesse de rotation sur elle-même
let sunselfrotspeed = 1.0/25.0;
let mercuryselfrotspeed = 1.0/58.0;
let venusselfrotspeed = 1.0/243.0;
let earthselfrotspeed = 1.0/0.99;
let marsselfrotspeed = 1.0/1.02;
let jupiterselfrotspeed = 1.0/0.41;
let saturnselfrotspeed = 1.0/0.44;
let uranusselfrotspeed = 1.0/0.71;
let neptuneselfrotspeed = 1.0/0.67;
let moonselfrotspeed = 1.0/27.3;
let minSelfRotSpeed = venusselfrotspeed;
let maxSelfRotSpeed = jupiterselfrotspeed;

let vao1 = null;

let asteroideSize = 2000;
let asteroideRotArray = new Array(asteroideSize);
let asteroideDistArray = new Array(asteroideSize);
let asteroideSpeedArray = new Array(asteroideSize);
let asteroideTypeArray = new Array(asteroideSize);

function getSizeNorm(minValue,maxValue,intervalMin,intervalMax,input)
{
	//minValue = valeur minimal qu'on peut obtenir en return
	//maxValue = valeur max qu'on peut obtenir en return
	//intervalMin = valeur minimale du tableau de valeurs sur lequel on fait le normalisation
	//intervalMax = idem pour valeur max
	//input = valeur dans la tableau a normaliser
	let pourcent = (input-intervalMin)*100 / (intervalMax - intervalMin); //valeur de l'input en pourcentage sur l'intervalle [intervalMin;intervalMax] => [0%;100%]
	return ((pourcent * (maxValue - minValue)) / 100) + minValue;		  //valeur de l'input dans l'intervalle [minValue,maxValue] en fonction de son pourcentage
}



function init_wgl()
{
	prg_background = ShaderProgram(background_vert,background_frag,'planet');
	prg_sun = ShaderProgram(sun_vert,sun_frag,'sun');
	prg_planet = ShaderProgram(planet_vert,planet_frag,'planet');
	prg_orbite = ShaderProgram(orbite_vert,orbite_frag,'orbite');
	prg_saturn_ring = ShaderProgram(saturn_ring_vert,saturn_ring_frag,'saturn ring');
	prg_ceinture_asteroide = ShaderProgram(ceinture_asteroide_vert,ceinture_asteroide_frag,'asteroide ring');

    // cree une sphere
    let mesh = Mesh.Sphere(256);

    // cree le renderer (positions?/normales?/coord_texture?)
    // il contient VBO + VAO + VBO + draw()
    mesh_rend = mesh.renderer(true,true,true);

    // place la camera pour bien voir l'objet
	//scene_camera.show_scene(mesh.BB);
	//scene_camera.s_radius=0.1;

	ewgl_continuous_update=true;

	tex_background = Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);
	tex_background.load("texture/stars.jpg").then(update_wgl);

	tex_sun = Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST]);
	tex_sun.load("texture/sunmap.jpg").then(update_wgl);

	tex_mercury = Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST]);
	tex_mercury.load("texture/mercurymap.jpg").then(update_wgl);
	tex_venus = Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST]);
	tex_venus.load("texture/venusmap.jpg").then(update_wgl);
	tex_earth = Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST]);
	tex_earth.load("texture/earthmap.jpg").then(update_wgl);
	tex_mars = Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST]);
	tex_mars.load("texture/marsmap.jpg").then(update_wgl);
	tex_jupiter = Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST]);
	tex_jupiter.load("texture/jupitermap.jpg").then(update_wgl);
	tex_saturn = Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST]);
	tex_saturn.load("texture/saturnmap.jpg").then(update_wgl);
	tex_uranus = Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST]);
	tex_uranus.load("texture/uranusmap.jpg").then(update_wgl);
	tex_neptune = Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST]);
	tex_neptune.load("texture/neptunemap.jpg").then(update_wgl);
	tex_saturn_ring = Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);
	tex_saturn_ring.load("texture/saturn_ring.png",gl.RGBA8,gl.RGBA,false).then(update_wgl);
	tex_uranus_ring = Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);
	tex_uranus_ring.load("texture/uranusringtrans.png",gl.RGBA8,gl.RGBA,false).then(update_wgl);

	tex_moon = Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST]);
	tex_moon.load("texture/moonmap.jpg").then(update_wgl);

	tex_asteroide1=Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);
	tex_asteroide1.load("texture/asteroide1.png",gl.RGBA8,gl.RGBA,false).then(update_wgl);
	tex_asteroide2=Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);
	tex_asteroide2.load("texture/asteroide2.png",gl.RGBA8,gl.RGBA,false).then(update_wgl);
	tex_asteroide3=Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);
	tex_asteroide3.load("texture/asteroide3.png",gl.RGBA8,gl.RGBA,false).then(update_wgl);
	tex_asteroide4=Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);
	tex_asteroide4.load("texture/asteroide4.png",gl.RGBA8,gl.RGBA,false).then(update_wgl);
	tex_asteroide5=Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);
	tex_asteroide5.load("texture/asteroide5.png",gl.RGBA8,gl.RGBA,false).then(update_wgl);
	tex_asteroide6=Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);
	tex_asteroide6.load("texture/asteroide6.png",gl.RGBA8,gl.RGBA,false).then(update_wgl);
	tex_asteroide7=Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);
	tex_asteroide7.load("texture/asteroide7.png",gl.RGBA8,gl.RGBA,false).then(update_wgl);
	tex_asteroide8=Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);
	tex_asteroide8.load("texture/asteroide8.png",gl.RGBA8,gl.RGBA,false).then(update_wgl);
	tex_asteroide9=Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);
	tex_asteroide9.load("texture/asteroide9.png",gl.RGBA8,gl.RGBA,false).then(update_wgl);
	tex_asteroide10=Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);
	tex_asteroide10.load("texture/asteroide10.png",gl.RGBA8,gl.RGBA,false).then(update_wgl);

	//normalisation des tailles des planètes
	let startringcoeff = saturnringstartscale/saturnscale;
	let endringcoeff = saturnringendscale/saturnscale;
	let ustartringcoeff = uranusringstartscale/uranusscale;
	let uendringcoeff = uranusringendscale/uranusscale;
	let minvalue = 0.0002;
	let maxvalue = 0.0005;
	mercuryscale = getSizeNorm(minvalue,maxvalue,minScale,maxScale,mercuryscale);
	venusscale = getSizeNorm(minvalue,maxvalue,minScale,maxScale,venusscale);
	earthscale = getSizeNorm(minvalue,maxvalue,minScale,maxScale,earthscale);
	marsscale = getSizeNorm(minvalue,maxvalue,minScale,maxScale,marsscale);
	jupiterscale = getSizeNorm(minvalue,maxvalue,minScale,maxScale,jupiterscale);
	saturnscale = getSizeNorm(minvalue,maxvalue,minScale,maxScale,saturnscale);
	uranusscale = getSizeNorm(minvalue,maxvalue,minScale,maxScale,uranusscale);
	neptunescale = getSizeNorm(minvalue,maxvalue,minScale,maxScale,neptunescale);
	saturnringstartscale = saturnscale * startringcoeff;
	saturnringendscale = saturnscale * endringcoeff;
	uranusringstartscale = uranusscale * ustartringcoeff;
	uranusringendscale = uranusscale * uendringcoeff;
	moonscale = minvalue/3.0;

	//normalisation des distances des planètes entre le soleil
	minvalue = 0.003;
	maxvalue = 0.1;
	mercurydisttosoleil = getSizeNorm(minvalue,maxvalue,minDist,maxDist,mercurydisttosoleil);
	venusdisttosoleil = getSizeNorm(minvalue,maxvalue,minDist,maxDist,venusdisttosoleil);
	earthdisttosoleil = getSizeNorm(minvalue,maxvalue,minDist,maxDist,earthdisttosoleil);
	marsdisttosoleil = getSizeNorm(minvalue,maxvalue,minDist,maxDist,marsdisttosoleil);
	ceintureasteroidedisttosoleil = getSizeNorm(minvalue,maxvalue,minDist,maxDist,ceintureasteroidedisttosoleil);
	jupiterdisttosoleil = getSizeNorm(minvalue,maxvalue,minDist,maxDist,jupiterdisttosoleil);
	saturndisttosoleil = getSizeNorm(minvalue,maxvalue,minDist,maxDist,saturndisttosoleil);
	uranusdisttosoleil = getSizeNorm(minvalue,maxvalue,minDist,maxDist,uranusdisttosoleil);
	neptunedisttosoleil = getSizeNorm(minvalue,maxvalue,minDist,maxDist,neptunedisttosoleil);
	moondisttoearth = minvalue/5.0;

	//normalisation des vitesse de rotation autour du soleil
	minvalue = 1.0;
	maxvalue = 10.0;
	mercuryrotspeed = getSizeNorm(minvalue,maxvalue,minRotSpeed,maxRotSpeed,mercuryrotspeed);
	venusrotspeed = getSizeNorm(minvalue,maxvalue,minRotSpeed,maxRotSpeed,venusrotspeed);
	earthrotspeed = getSizeNorm(minvalue,maxvalue,minRotSpeed,maxRotSpeed,earthrotspeed);
	marsrotspeed = getSizeNorm(minvalue,maxvalue,minRotSpeed,maxRotSpeed,marsrotspeed);
	jupiterrotspeed = getSizeNorm(minvalue,maxvalue,minRotSpeed,maxRotSpeed,jupiterrotspeed);
	saturnrotspeed = getSizeNorm(minvalue,maxvalue,minRotSpeed,maxRotSpeed,saturnrotspeed);
	uranusrotspeed = getSizeNorm(minvalue,maxvalue,minRotSpeed,maxRotSpeed,uranusrotspeed);
	neptunerotspeed = getSizeNorm(minvalue,maxvalue,minRotSpeed,maxRotSpeed,neptunerotspeed);

	//normalisation des vitesse de rotation sur elles-mêmes
	minvalue = 20.0;
	maxvalue = 50.0;
	sunselfrotspeed = getSizeNorm(minvalue,maxvalue,minSelfRotSpeed,maxSelfRotSpeed,sunselfrotspeed);
	mercuryselfrotspeed = getSizeNorm(minvalue,maxvalue,minSelfRotSpeed,maxSelfRotSpeed,mercuryselfrotspeed);
	venusselfrotspeed = getSizeNorm(minvalue,maxvalue,minSelfRotSpeed,maxSelfRotSpeed,venusselfrotspeed);
	earthselfrotspeed = getSizeNorm(minvalue,maxvalue,minSelfRotSpeed,maxSelfRotSpeed,earthselfrotspeed);
	marsselfrotspeed = getSizeNorm(minvalue,maxvalue,minSelfRotSpeed,maxSelfRotSpeed,marsselfrotspeed);
	jupiterselfrotspeed = getSizeNorm(minvalue,maxvalue,minSelfRotSpeed,maxSelfRotSpeed,jupiterselfrotspeed);
	saturnselfrotspeed = getSizeNorm(minvalue,maxvalue,minSelfRotSpeed,maxSelfRotSpeed,saturnselfrotspeed);
	uranusselfrotspeed = getSizeNorm(minvalue,maxvalue,minSelfRotSpeed,maxSelfRotSpeed,uranusselfrotspeed);
	neptuneselfrotspeed = getSizeNorm(minvalue,maxvalue,minSelfRotSpeed,maxSelfRotSpeed,neptuneselfrotspeed);

	moonselfrotspeed = getSizeNorm(minvalue,maxvalue,minSelfRotSpeed,maxSelfRotSpeed,moonselfrotspeed);
	moonrotspeed = moonselfrotspeed;


	let vbo_q = VBO([-1,-1, 1,-1, 1,1, -1,1],2);
	vao1 = VAO([TEXCOORD_ATTRIB,vbo_q,0]);

	for(var i=0;i<asteroideSize;i++)
	{
		var rand = Math.random()*360;
		asteroideRotArray[i]=rand;

		var rand2 = (ceintureasteroidedisttosoleil-(ceintureasteroidedisttosoleil/8))+Math.random()*(ceintureasteroidedisttosoleil/4);
		asteroideDistArray[i]=rand2;

		var rand3 = (Math.random()*5.0+2.0)/2.0;
		asteroideSpeedArray[i]=rand3;

		var rand4 = Math.floor((Math.random()*10.0)+1.0);
		asteroideTypeArray[i]=rand4;
	}


	
}

function draw_wgl()
{

	gl.clearColor(0,0,0,1);
	gl.enable(gl.DEPTH_TEST);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	

	// les matrices sont deduites de la camera
	const projection_matrix = scene_camera.get_projection_matrix();
	const view_matrix = scene_camera.get_view_matrix();

	let a= ewgl_current_time;
	//let pl = Vec3(10*Math.cos(a),10*Math.sin(a),1.0);
	let pl = Vec3(0,0,0);
	let pos_lum=view_matrix.mult(Vec4(pl,1)).xyz;



	gl.disable(gl.DEPTH_TEST);

	//Sphere englobante
	prg_background.bind();
	update_uniform('viewMatrix',mmult(view_matrix,rotateX(90)));
	update_uniform('projectionMatrix', projection_matrix);
	tex_background.bind(0);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();
	unbind_texture2d();

	gl.enable(gl.DEPTH_TEST);

	//Soleil
	prg_sun.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(-1*(a*sunselfrotspeed)),rotateX(90+suninclinaison),scale(0.001)));
	update_uniform('projectionMatrix', projection_matrix);
	tex_sun.bind(0);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();
	unbind_texture2d();

	//Mercure
	prg_planet.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(mercuryinitrot+a*mercuryrotspeed),translate(0,0,mercurydisttosoleil),rotateX(90+mercuryinclinaison),rotateZ(mercuryselfrotspeed*a),scale(mercuryscale)));
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('normalMatrix',  mmult(view_matrix,rotateY(mercuryinitrot+a*mercuryrotspeed),translate(0,0,mercurydisttosoleil),rotateX(90+mercuryinclinaison),rotateZ(mercuryselfrotspeed*a),scale(mercuryscale)).inverse3transpose());
	update_uniform('light_pos', pos_lum);
	update_uniform('specness', 2+Math.pow(2.0,1+50/10));
	update_uniform('shininess', 1/100);
	tex_mercury.bind(0);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();
	unbind_texture2d();

	//Vénus
	prg_planet.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(venusinitrot+a*venusrotspeed),translate(0,0,venusdisttosoleil),rotateX(90+venusinclinaison),rotateZ(-1*(venusselfrotspeed*a)),scale(venusscale)));
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('normalMatrix',  mmult(view_matrix,rotateY(venusinitrot+a*venusrotspeed),translate(0,0,venusdisttosoleil),rotateX(90+venusinclinaison),rotateZ(-1*(venusselfrotspeed*a)),scale(venusscale)).inverse3transpose());
	update_uniform('light_pos', pos_lum);
	update_uniform('specness', 2+Math.pow(2.0,1+50/10));
	update_uniform('shininess', 50/100);
	tex_venus.bind(0);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();
	unbind_texture2d();

	//Terre
	prg_planet.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(earthinitrot+a*earthrotspeed),translate(0,0,earthdisttosoleil),rotateX(90+earthinclinaison),rotateZ(earthselfrotspeed*a),scale(earthscale)));
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('normalMatrix',  mmult(view_matrix,rotateY(earthinitrot+a*earthrotspeed),translate(0,0,earthdisttosoleil),rotateX(90+earthinclinaison),rotateZ(earthselfrotspeed*a),scale(earthscale)).inverse3transpose());
	update_uniform('light_pos', pos_lum);
	update_uniform('specness', 2+Math.pow(2.0,1+50/10));
	update_uniform('shininess', 50/100);
	tex_earth.bind(0);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();
	unbind_texture2d();

	//Lune
	prg_planet.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(earthinitrot+a*earthrotspeed),translate(0,0,earthdisttosoleil),rotateY(mooninitrot+a*moonrotspeed),translate(0,0,moondisttoearth),rotateY(-90),rotateX(90+mooninclinaison),scale(moonscale)));
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('normalMatrix', mmult(view_matrix,rotateY(earthinitrot+a*earthrotspeed),translate(0,0,earthdisttosoleil),rotateY(mooninitrot+a*moonrotspeed),translate(0,0,moondisttoearth),rotateY(-90),rotateX(90+mooninclinaison),scale(moonscale)).inverse3transpose());
	update_uniform('light_pos', pos_lum);
	update_uniform('specness', 2+Math.pow(2.0,1+50/10));
	update_uniform('shininess', 50/100);
	tex_moon.bind(0);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();
	unbind_texture2d();

	//Mars
	prg_planet.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(marsinitrot+a*marsrotspeed),translate(0,0,marsdisttosoleil),rotateX(90+marsinclinaison),rotateZ(marsselfrotspeed*a),scale(marsscale)));
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('normalMatrix', mmult(view_matrix,rotateY(marsinitrot+a*marsrotspeed),translate(0,0,marsdisttosoleil),rotateX(90+marsinclinaison),rotateZ(marsselfrotspeed*a),scale(marsscale)).inverse3transpose());
	update_uniform('light_pos', pos_lum);
	update_uniform('specness', 2+Math.pow(2.0,1+50/10));
	update_uniform('shininess', 50/100);
	tex_mars.bind(0);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();
	unbind_texture2d();

	//Jupiter
	prg_planet.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(jupiterinitrot+a*jupiterrotspeed),translate(0,0,jupiterdisttosoleil),rotateX(90+jupiterinclinaison),rotateZ(jupiterselfrotspeed*a),scale(jupiterscale)));
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('normalMatrix', mmult(view_matrix,rotateY(jupiterinitrot+a*jupiterrotspeed),translate(0,0,jupiterdisttosoleil),rotateX(90+jupiterinclinaison),rotateZ(jupiterselfrotspeed*a),scale(jupiterscale)).inverse3transpose());
	update_uniform('light_pos', pos_lum);
	update_uniform('specness', 2+Math.pow(2.0,1+50/10));
	update_uniform('shininess', 50/100);
	tex_jupiter.bind(0);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();
	unbind_texture2d();

	//Saturne
	prg_planet.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(saturninitrot+a*saturnrotspeed),translate(0,0,saturndisttosoleil),rotateX(90-saturninclinaison),rotateZ(saturnselfrotspeed*a),scale(saturnscale)));
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('normalMatrix', mmult(view_matrix,rotateY(saturninitrot+a*saturnrotspeed),translate(0,0,saturndisttosoleil),rotateX(90-saturninclinaison),rotateZ(saturnselfrotspeed*a),scale(saturnscale)).inverse3transpose());
	update_uniform('light_pos', pos_lum);
	update_uniform('specness', 2+Math.pow(2.0,1+50/10));
	update_uniform('shininess', 50/100);
	tex_saturn.bind(0);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();
	unbind_texture2d();

	//Uranus
	prg_planet.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(uranusinitrot+a*uranusrotspeed),translate(0,0,uranusdisttosoleil),rotateX(90+uranusinclinaison),rotateZ(-1*(uranusselfrotspeed*a)),scale(uranusscale)));
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('normalMatrix', mmult(view_matrix,rotateY(uranusinitrot+a*uranusrotspeed),translate(0,0,uranusdisttosoleil),rotateX(90+uranusinclinaison),rotateZ(-1*(uranusselfrotspeed*a)),scale(uranusscale)).inverse3transpose());
	update_uniform('light_pos', pos_lum);
	update_uniform('specness', 2+Math.pow(2.0,1+50/10));
	update_uniform('shininess', 50/100);
	tex_uranus.bind(0);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();
	unbind_texture2d();

	//Neptune
	prg_planet.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(neptuneinitrot+a*neptunerotspeed),translate(0,0,neptunedisttosoleil),rotateX(90+neptuneinclinaison),rotateZ(neptuneselfrotspeed*a),scale(neptunescale)));
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('normalMatrix', mmult(view_matrix,rotateY(neptuneinitrot+a*neptunerotspeed),translate(0,0,neptunedisttosoleil),rotateX(90+neptuneinclinaison),rotateZ(neptuneselfrotspeed*a),scale(neptunescale)).inverse3transpose());
	update_uniform('light_pos', pos_lum);
	update_uniform('specness', 2+Math.pow(2.0,1+50/10));
	update_uniform('shininess', 50/100);
	tex_neptune.bind(0);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();
	unbind_texture2d();


	//orbite de Mercure
	prg_orbite.bind();
	update_uniform('orbitePrecision',1024);
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('viewMatrix',mmult(view_matrix,rotateX(90)));
	update_uniform('orbiteWidth',mercuryscale/10);
	update_uniform('orbiteOffset',mercurydisttosoleil);
	update_uniform('side',0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	update_uniform('side',1);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	unbind_shader();

	//orbite de Venus
	prg_orbite.bind();
	update_uniform('orbitePrecision',1024);
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('viewMatrix',mmult(view_matrix,rotateX(90)));
	update_uniform('orbiteWidth',venusscale/10);
	update_uniform('orbiteOffset',venusdisttosoleil);
	update_uniform('side',0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	update_uniform('side',1);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	unbind_shader();

	//orbite de la Terre
	prg_orbite.bind();
	update_uniform('orbitePrecision',1024);
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('viewMatrix',mmult(view_matrix,rotateX(90)));
	update_uniform('orbiteWidth',earthscale/10);
	update_uniform('orbiteOffset',earthdisttosoleil);
	update_uniform('side',0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	update_uniform('side',1);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	unbind_shader();

	//orbite de la Lune
	prg_orbite.bind();
	update_uniform('orbitePrecision',1024);
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(earthinitrot+a*earthrotspeed),translate(0,0,earthdisttosoleil),rotateX(90)));
	update_uniform('orbiteWidth',moonscale/10);
	update_uniform('orbiteOffset',moondisttoearth);
	update_uniform('side',0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	update_uniform('side',1);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	unbind_shader();

	//orbite de Mars
	prg_orbite.bind();
	update_uniform('orbitePrecision',1024);
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('viewMatrix',mmult(view_matrix,rotateX(90)));
	update_uniform('orbiteWidth',marsscale/10);
	update_uniform('orbiteOffset',marsdisttosoleil);
	update_uniform('side',0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	update_uniform('side',1);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	unbind_shader();

	//orbite de Jupiter
	prg_orbite.bind();
	update_uniform('orbitePrecision',1024);
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('viewMatrix',mmult(view_matrix,rotateX(90)));
	update_uniform('orbiteWidth',jupiterscale/10);
	update_uniform('orbiteOffset',jupiterdisttosoleil);
	update_uniform('side',0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	update_uniform('side',1);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	unbind_shader();

	//orbite de Saturne
	prg_orbite.bind();
	update_uniform('orbitePrecision',1024);
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('viewMatrix',mmult(view_matrix,rotateX(90)));
	update_uniform('orbiteWidth',saturnscale/10);
	update_uniform('orbiteOffset',saturndisttosoleil);
	update_uniform('side',0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	update_uniform('side',1);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	unbind_shader();

	//orbite de Uranus
	prg_orbite.bind();
	update_uniform('orbitePrecision',1024);
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('viewMatrix',mmult(view_matrix,rotateX(90)));
	update_uniform('orbiteWidth',uranusscale/10);
	update_uniform('orbiteOffset',uranusdisttosoleil);
	update_uniform('side',0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	update_uniform('side',1);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	unbind_shader();

	//orbite de Neptune
	prg_orbite.bind();
	update_uniform('orbitePrecision',1024);
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('viewMatrix',mmult(view_matrix,rotateX(90)));
	update_uniform('orbiteWidth',neptunescale/10);
	update_uniform('orbiteOffset',neptunedisttosoleil);
	update_uniform('side',0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	update_uniform('side',1);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	unbind_shader();


	//anneaux de Saturne
	prg_saturn_ring.bind();
	update_uniform('orbitePrecision',1024);
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('viewMatrix',mmult(view_matrix,rotateY(saturninitrot+a*saturnrotspeed),translate(0,0,saturndisttosoleil),rotateX(90-saturninclinaison)));
	update_uniform('orbiteWidth',saturnringendscale - saturnringstartscale);
	update_uniform('orbiteOffset',saturnringstartscale);
	tex_saturn_ring.bind(0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	unbind_shader();
	unbind_texture2d();


	//anneaux d'Uranus
	prg_saturn_ring.bind();
	update_uniform('orbitePrecision',1024);
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('viewMatrix',mmult(view_matrix,rotateY(uranusinitrot+a*uranusrotspeed),translate(0,0,uranusdisttosoleil),rotateX(90+uranusinclinaison)));
	update_uniform('orbiteWidth',uranusringendscale - uranusringstartscale);
	update_uniform('orbiteOffset',uranusringstartscale);
	tex_uranus_ring.bind(0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1026);
	unbind_shader();
	unbind_texture2d();


	//ceinture d'astéroïdes
	for(var i=0;i<asteroideSize;i++)
	{
		vao1.bind();
		prg_ceinture_asteroide.bind();
		update_uniform('projectionMatrix', projection_matrix);
		update_uniform('viewMatrix',mmult(view_matrix,rotateY(a*asteroideSpeedArray[i]),rotateX(90)));
		update_uniform('orbiteOffset',asteroideDistArray[i]);
		update_uniform('randoms',asteroideRotArray[i]);
		switch(asteroideTypeArray[i])
		{
			case 1:
				tex_asteroide1.bind(0);
				break;
			case 2:
				tex_asteroide2.bind(0);
				break;
			case 3:
				tex_asteroide3.bind(0);
				break;
			case 4:
				tex_asteroide4.bind(0);
				break;
			case 5:
				tex_asteroide5.bind(0);
				break;
			case 6:
				tex_asteroide6.bind(0);
				break;
			case 7:
				tex_asteroide7.bind(0);
				break;
			case 8:
				tex_asteroide8.bind(0);
				break;
			case 9:
				tex_asteroide9.bind(0);
				break;
			default:
				tex_asteroide10.bind(0);
				break;
		}
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		unbind_shader();
		unbind_texture2d();
	}
	
}

launch_3d();
