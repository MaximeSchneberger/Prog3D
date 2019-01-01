"use strict"


// SHADER 3D MINIMUM

var white_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
in vec3 position_in;
in vec2 texcoord_in;

out vec2 TC;

void main()
{
	vec4 P4 = viewMatrix*vec4(position_in,1.0);
	gl_Position = projectionMatrix * P4;

	TC=texcoord_in;
}`;

var white_frag=`#version 300 es
precision highp float;
uniform sampler2D TU1;		//texture de tuile (RGB) => texture(...)
uniform highp usampler2D TU0;	// indirection map (unsigned int) => texelFetch(...)
in vec2 TC;
out vec4 frag_out;
void main()
{
	int nbCellW=8;
	int nbCellH=8;
	vec2 uv = TC * vec2(nbCellH,nbCellW);

	uint cellIndex = texelFetch(TU0, ivec2(uv),0).r;

	vec2 imageSize = vec2(500.0,498.0);
	vec2 patchSize = vec2(imageSize.x / 5.0,imageSize.y / 5.0);

	vec2 cellID = vec2 (cellIndex%uint(5),cellIndex/uint(5));
	vec2 uvColor = vec2(
				(cellID.x+ fract(uv.x)) * patchSize.x ,
				(cellID.y+ fract(uv.y)) * patchSize.y
			);

	vec3 color = texture(TU1, uvColor/500.0).rgb;

	frag_out=vec4(color,1);
}`;


let prg_white = null;
let mesh_rend = null;
let tex1;
let tex2;

let sl_n;

function init_wgl()
{



	prg_white = ShaderProgram(white_vert,white_frag,'white');

    // cree un tore
    let mesh = Mesh.Grid(80);
    // cree le renderer (positions?/normales?/coord_texture?)
    // il contient VBO + VAO + VBO + draw()
    mesh_rend = mesh.renderer(true,false,true);

    // place la camera pour bien voir l'objet
	

	tex1=Texture2d([gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_T,gl.REPEAT],[gl.TEXTURE_WRAP_S,gl.REPEAT]);

	let taille= 4 * 4;

	let data= new Uint8Array([
		1,	12,	13,	0, 7,	5,	3,	14,
		9,	6,	2,	15, 1,	12,	13,	0,
		7,	5,	3,	14, 11,	2,	18,	24,
		11,	2,	18,	24, 11,	2,	18,	24,
		1,	12,	13,	0, 7,	5,	3,	14,
		9,	6,	2,	15, 1,	12,	13,	0,
		7,	5,	3,	14, 11,	2,	18,	24,
		11,	2,	18,	24, 11,	2,	18,	24
	]);
	//data.map(item => Math.random() * 24);

	tex1.alloc(8,8,gl.R8UI,gl.RED_INTEGER,data);

	tex2=Texture2d();
	tex2.load("tiles.jpg").then(update_wgl);

	scene_camera.show_scene(mesh.BB);
}

function draw_wgl()
{
	gl.clearColor(0,0,0,1);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// les matrices sont deduites de la camera
	const projection_matrix = scene_camera.get_projection_matrix();
	const view_matrix = scene_camera.get_view_matrix();

	prg_white.bind();
	update_uniform('viewMatrix', view_matrix);
	update_uniform('projectionMatrix', projection_matrix);
	tex1.bind(0);
	tex2.bind(1);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();
}

launch_3d();