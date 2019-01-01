"use strict"


var full_vert=`#version 300 es
void main()
{
}
`;

var full_frag=`#version 300 es
void main()
{
}
`;

var prg1 = null;
var vao1 = null;
var sl_n;

function init_wgl()
{
	UserInterface.begin(); // name of html id
	sl_n = UserInterface.add_slider('NB ',2,50,10,update_wgl);
	UserInterface.add_br();
	UserInterface.adjust_width();
	/// programs shader
	prg1 = ShaderProgram(full_vert,full_frag,'full');

}

function draw_wgl()
{
	gl.clearColor(0,0,0,1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	prg1.bind();
	update_uniform('a',sl_n.value);


	unbind_shader();
}

launch_2d();
