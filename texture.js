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
	vec4 P4 = viewMatrix*vec4(position_in,1);
	gl_Position = projectionMatrix * viewMatrix * vec4(position_in,1);

	TC=texcoord_in;
}`;

var white_frag=`#version 300 es
precision highp float;
uniform sampler2D TU0;
uniform sampler2D TU1;
in vec2 TC;
out vec4 frag_out;
void main()
{
	vec3 color= texture(TU0,TC).rgb+texture(TU1,TC).rgb;
	frag_out=vec4(color,1);
}`;


let prg_white = null;
let mesh_rend = null;
let tex1;
let tex2;
let tex3;

let sl_n;

function init_wgl()
{
	UserInterface.begin();
	sl_n=UserInterface.add_slider('A',0,100,50,update_wgl);



	prg_white = ShaderProgram(white_vert,white_frag,'white');

    // cree un tore
    let mesh = Mesh.Grid(80);
    // cree le renderer (positions?/normales?/coord_texture?)
    // il contient VBO + VAO + VBO + draw()
    mesh_rend = mesh.renderer(true,false,true);

    // place la camera pour bien voir l'objet
	scene_camera.show_scene(mesh.BB);


	let data= new Uint8Array([
			255,0,0,	50,35,0,	0,255,0,	0,0,0,
			0,0,0,		0,0,255,	0,0,0,		25,255,0,
			255,0,0,	0,0,0,		0,255,0,	0,0,0,
			0,0,0,		0,255,255,	0,0,0,		55,255,0
	])
	tex1=Texture2d();
	tex1.alloc(4,4,gl.RGB8,gl.RGBdata,data);

	tex1.bind();
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.MIRRORED_REPEAT);
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);

	tex2=Texture2d();
	tex2.load("pepe.jpg");
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