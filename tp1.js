"use strict"

//
// Shaders
//

var color_vert=`#version 300 es
uniform mat4 orthoMatrix;
in vec2 position_in;
void main()
{
	gl_PointSize = 8.0;
	gl_Position = orthoMatrix*vec4(position_in, 0.0, 1.0);
}
`;
//on met en 4 dimensions, en prenant le vecteur en 2d et en rajoutant 0.0 et 1.0 pour dimensions 3 et 4

var color_frag=`#version 300 es
precision highp float;
uniform vec3 color;
out vec4 frag_out;
void main()
{
	frag_out = vec4(color, 1.0);
}
`;//couleur opaque avec 1.0

//uniform mat4 orthoMatrix; : empêche la déformation sur la page
var cpv_vert=`#version 300 es
uniform mat4 orthoMatrix;	
in vec2 position_in;
in vec3 color_in;
out vec3 color;
void main()
{
	gl_PointSize = 8.0;
	gl_Position = orthoMatrix*vec4(position_in, 0.0, 1.0);
	color = color_in;
}
`;

//out color au dessus passe dans in en dessous

var cpv_frag=`#version 300 es
precision highp float;
in vec3 color;
out vec4 frag_out;
void main()
{
	frag_out = vec4(color, 1.0);
}
`;

var prg1 = null;
var vao1 = null;
var ebo1 = null;

var prg2 = null;
var vao2 = null;
var vao3 = null;
var ebo2 = null;

var b=0;
var animation = null;
var mode;
var sl_r;
var sl_g;
var sl_b;



function init_wgl()
{
	UserInterface.begin(); // name of html id
	UserInterface.use_field_set('H',"Color");
	sl_r  = UserInterface.add_slider('R ',0,100,50,update_wgl);
	set_widget_color(sl_r,'#ff0000','#ffcccc');
	sl_g  = UserInterface.add_slider('G ',0,100,50,update_wgl);
	set_widget_color(sl_g,'#00bb00','#ccffcc');
	sl_b  = UserInterface.add_slider('B ',0,100,50,update_wgl);
	set_widget_color(sl_b,'#0000ff','#ccccff');
	UserInterface.end_use();	UserInterface.add_br();
	mode = UserInterface.add_radio('H','Mode',['points','lines ','both  '],0, update_wgl);
	UserInterface.add_br();
	UserInterface.add_check_box('Animate ',false, (c)=>
	{
		if (c)
		{
			animation = setInterval( () => { b += 5; update_wgl(); }, 50);
		}
		else
		{
			window.clearInterval(animation);
			animation = null;
		}
	});
	UserInterface.add_br();
	UserInterface.adjust_width();

	/// programs shader
	prg1 = ShaderProgram(color_vert,color_frag,'color1');
	prg2 = ShaderProgram(cpv_vert,cpv_frag,'cpv');

	/// VBO
	let vb1=VBO([-0.8,-0.8,-0.8,0.8,0.8,0.8,0.8,-0.8],2);	//on coupe l'array tout les 2 (second param) nombres, pour obtenir une coord du vb1, donc ici coord1={-1,-1} et coord2={1,1}
	let vb2=VBO([0,-0.6,0,0.6,-0.6,0,0.6,0,0,0],2);
	let vb_col = VBO([1,0,0, 0,1,0, 0,0,1, 1,1,0, 1,1,1],3);

	/// VAO
	vao1 = VAO([POSITION_ATTRIB,vb1]);
	vao2 = VAO([POSITION_ATTRIB,vb2]);
	vao3 = VAO([POSITION_ATTRIB,vb1],[COLOR_ATTRIB,vb_col]);

	/// indices
	ebo1 = EBO([0,1, 1,2, 2,3, 3,0]);
	ebo2 = EBO([0,1,4, 1,2,4, 2,3,4, 3,0,4]);
}

function draw_wgl()
{
	gl.clearColor(0,0,0,1);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	

	prg1.bind();
	vao1.bind();
	ebo1.bind();
	const R = Vec3(1,0,0);
	const B = Vec3(0,0,1);


	for(var i=0;i<10;i++)
	{
		update_uniform('orthoMatrix',mmult(ortho2D,scale(1-0.09*i),rotateZ(5*(i+b/20))));
		update_uniform('color',(sl_r.value/100)*(((i+(b*2)/10)/10)%1),(sl_g.value/100)*(((i+b/10)/10)%1),(sl_b.value/100)*(((i+b/10)/10)%1));
		if(mode.value==0 || mode.value==2)
		{
			gl.drawElements(gl.POINTS,8,gl.UNSIGNED_INT,0);
		}
		if(mode.value==1 || mode.value==2)
		{
			gl.drawElements(gl.LINES,8,gl.UNSIGNED_INT,0);
		}
	}
	gl.drawElements(gl.TRIANGLES,3,gl.UNSIGNED_INT,0);

	vao2.bind();
	update_uniform('color',0,0.6,0);
	gl.drawArrays(gl.LINES,0,4);

	unbind_ebo();
	unbind_vao();
	

	prg2.bind();
	update_uniform('orthoMatrix',ortho2D);
	vao3.bind();
	ebo2.bind();
	gl.drawElements(gl.TRIANGLES,12,gl.UNSIGNED_INT,0);

	unbind_shader();
}

launch_2d();

