"use strict"

var tex_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
in vec3 position_in;
in vec2 texcoord_in;
uniform float a;
out vec2 tc;

void main()
{
	gl_Position = projectionMatrix * viewMatrix * vec4(position_in,1);;
	tc = a*texcoord_in - (a-1.0)/2.0;
}`;

var tex_color_frag=`#version 300 es
precision highp float;
uniform sampler2D TU0;
in vec2 tc;
out vec4 frag_out;

void main()
{
	vec3 col = texture(TU0,tc).rgb;
	frag_out = vec4(col,1.0);
}`;

var tex_gray_frag=`#version 300 es
precision highp float;
uniform sampler2D TU0;
in vec2 tc;
out vec4 frag_out;

void main()
{
	float g = texture(TU0,tc).r;
	frag_out = vec4(g,g,g,1.0);
}`;


var mesh_rend = null;
var prg_tex_c = null;
var prg_tex_g = null;
var vao1 = null;
var tex = [];
var sl_m;
//var mode;
var linear;
var wraping;


function param_textures()
{
	const FILT = (linear.checked)?gl.LINEAR:gl.NEAREST;
	const WRAP = [gl.CLAMP_TO_EDGE,gl.REPEAT,gl.MIRRORED_REPEAT][wraping.value];

	tex.forEach( t =>
	{
		t.bind();
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, FILT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, FILT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, WRAP);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, WRAP);
		unbind_texture2d();
	});
	update_wgl();
}


function init_wgl()
{
	UserInterface.begin(); // name of html id
	UserInterface.use_field_set('V',"Render");
		linear = UserInterface.add_check_box('linear ', false, param_textures);
		sl_m = UserInterface.add_slider('mult ',0,1000,0,update_wgl);
		wraping = UserInterface.add_list_input(['clamp_to_edge','repeat','mirrored_repeat'],0, param_textures);
		UserInterface.end_use();
	UserInterface.adjust_width();

	prg_tex_c = ShaderProgram(tex_vert,tex_color_frag,'texc');
	prg_tex_g = ShaderProgram(tex_vert,tex_gray_frag,'texg');

	let vbo_p = VBO([-1,-1,0, 1,-1,0, 1,1,0, -1,1,0], 3);
	let vbo_t = VBO([0,1, 1,1, 1,0, 0,0], 2);
	vao1 = VAO([POSITION_ATTRIB, vbo_p], [TEXCOORD_ATTRIB,vbo_t] );

	scene_camera.set_scene_radius(3);
	scene_camera.set_scene_center(Vec3(0,0,0));

	const data = new Uint8Array([
		255,255,255,   0,  0,  0, 255,128,128,   64,  0, 64,
		64,   0,  0,  128,255,128,   0,  0,  0, 128,128,255,
		255,255,255,   0,  0,  0, 128,128,128,   0,  64,  0,
		64  ,64  ,0  , 128,255,255,  0, 64, 64, 255,128,255]);
	tex.push(Texture2d());
	tex[0].alloc(4,4,gl.RGB8,gl.RGB,data);

	const data2 = new Uint8Array([
		255,  0,255,  0,255,  0,255,  0,
		  0,128,  0,255,  0,255,  0,255,
		255,  0,128,  0,255,  0,255,  0,
		  0,255,  0,255,  0,255,  0,255,
		255,  0,255,  0,255,  0,255,  0,
		  0,255,  0,255,  0,128,  0,255,
		255,  0,255,  0,255,  0,128,  0,
		  0,255,  0,255,  0,255,  0,255]);	
	tex.push(Texture2d());
	tex[1].alloc(8,8,gl.R8,gl.RED,data2);

	tex.push(Texture2d());
	tex.push(Texture2d());
	Promise.all([tex[2].load("chaton.png",gl.RGB8,gl.RGB),
	             tex[3].load("chaton_grey.png",gl.R8,gl.RED)]).then(param_textures);

}



function draw_wgl()
{
	gl.clearColor(0,0,0,1);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const projection_matrix = scene_camera.get_projection_matrix();
	const view_matrix = scene_camera.get_view_matrix();

	vao1.bind();

	// couleur
	prg_tex_c.bind();
	update_uniform('projectionMatrix', projection_matrix)
	update_uniform('a',1+0.01*sl_m.value);

	update_uniform('viewMatrix', mmult(view_matrix,translate(1.1,-1.1,0)));
	tex[0].bind(0); // utilise tex1 avec le moteur 0 et met l'uniform sampler2D TU0 à 1
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

	update_uniform('viewMatrix', mmult(view_matrix,translate(1.1,1.1,0)));
	tex[2].bind(0); 
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

	unbind_shader();

	prg_tex_g.bind();
	update_uniform('projectionMatrix', projection_matrix)
	update_uniform('a',1+0.01*sl_m.value);
	update_uniform('viewMatrix', mmult(view_matrix,translate(-1.1,-1.1,0)));
	tex[1].bind(0);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

	update_uniform('viewMatrix', mmult(view_matrix,translate(-1.1,1.1,0)));
	tex[3].bind(0);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

	unbind_shader();
	unbind_vao();
}

launch_3d();
