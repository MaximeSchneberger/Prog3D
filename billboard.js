"use strict"

/*
*   SHADERS
*/

var bb_vert = `#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
in vec3 position_in;
in vec2 texcoord_in;

out vec2 TC;

void main()
{
	vec4 P4 = viewMatrix*vec4(position_in,1) + vec4(texcoord_in*0.01,0,0);
	gl_Position = projectionMatrix * P4;

	TC=vec2(texcoord_in+vec2(1.0))/2.0;
	TC=vec2(TC.x,1.0-TC.y);
}`;


var bb_frag = `#version 300 es
precision highp float;
uniform sampler2D TU0;
in vec2 TC;
out vec4 frag_out;
void main()
{
	vec4 color= texture(TU0,TC);
	//if(length(TC-0.5)>0.48)
	//	discard;
	if(color.a!=1.0)
		discard;
	
	frag_out= vec4(color);
}
`;


var prg_bb = null;
var vao1 = null;
var tex1 = null;
var mesh_rend = null;

var sl_r;


function init_wgl()
{
	UserInterface.begin(); // name of html id
	UserInterface.use_field_set('V','Render');
	sl_r = UserInterface.add_slider('Radius',1,50,10,update_wgl);
	UserInterface.end_use();


	let mesh = Mesh.Tore(200);
	let BB = mesh.BB;
	mesh_rend = mesh.renderer(true,false,false);
	// mesh.vbo_p = vbo de position du maillage mesh
	// mesh_rend.nbv = nb sommets

	scene_camera.set_scene_radius(mesh.BB.radius);
	scene_camera.set_scene_center(mesh.BB.center);

	prg_bb = ShaderProgram(bb_vert,bb_frag,'billboard');

	let vbo_p = mesh.vbo_p;						//les points du mesh
	let vbo_q = VBO([-1,-1, 1,-1, 1,1, -1,1],2);	//le carré
	vao1 = VAO([TEXCOORD_ATTRIB,vbo_q,0],[POSITION_ATTRIB,vbo_p,1]);

	tex1=Texture2d();
	tex1.load("Mistersmileyface.png",gl.RGBA8,gl.RGBA,false).then(update_wgl);
}

function draw_wgl()
{
	gl.clearColor(0,0,0,1);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const projection_matrix = scene_camera.get_projection_matrix();
	const view_matrix = scene_camera.get_view_matrix();

	prg_bb.bind();

	update_uniform('viewMatrix', view_matrix);
	update_uniform('projectionMatrix', projection_matrix);
	vao1.bind();
	tex1.bind(0);
	gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0 , 4, mesh_rend.nbv);
	unbind_shader();
}

launch_3d();
