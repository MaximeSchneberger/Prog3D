"use strict"

function win2gl(ev)
{
	let xgl = ev.x / gl.canvas.clientWidth * 2 - 1;
	let ygl = 1 - ev.y / gl.canvas.clientHeight * 2;
	xgl /= ortho2D.data[0];
	ygl /= ortho2D.data[5];
	return Vec2(xgl,ygl);
}

function mousedown_wgl(ev)
{
	let p = win2gl(ev);
    for(let i=0; i<PC.length; ++i)
    {
        if (p.sub(PC[i]).norm() < 0.01)
	 	{
	 		sel = i;
	 	} 
    }
}
   
function mouseup_wgl(ev)
{
	sel = -1;
}
	
function mousemove_wgl(ev)
{
	if (sel >= 0)
	{
		let p = win2gl(ev);
		PC[sel] = p;
		update_wgl();
	}
}




var circle_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform int nb;

void main()
{
	gl_PointSize = 2.0;
	float a = 6.2832*float(gl_VertexID)/float(nb);
	gl_Position = projectionMatrix * vec4(sin(a),cos(a),0,1);
}
`;//float(gl_VertexID)/float(nb) appartient [0,1]


var pc_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform vec2 PC[20];

void main()
{
	gl_PointSize = 6.0;
	gl_Position = projectionMatrix * vec4(PC[gl_VertexID],0,1);
}
`;

var color_frag=`#version 300 es
precision mediump float;
out vec4 frag_out;
uniform vec3 color;
void main()
{
	frag_out = vec4(color,1);
}
`;

var bezier_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform vec2 PC[20];
uniform int nb;
uniform int nbPC;

void main()
{
	gl_PointSize = 2.0;
	float t = float(gl_VertexID) / float(nb-1);
	vec2 Q[20];
	for(int i=0;i<nbPC-1;i++)
	{
		Q[i]=mix(PC[i],PC[i+1],t);
	}

	for(int i=nbPC-2;i>=0;i--)
	{
		for(int j=0;j<i;j++)
		{
			Q[j]=mix(Q[j],Q[j+1],t);
		}
	}

	gl_Position = projectionMatrix * vec4(Q[0],0,1);
}
`;

var pvcolor_frag=`#version 300 es

`

var PC = [Vec2(-0.8,-0.8), Vec2(-0.8,0.8), Vec2(-0.4,0.4), Vec2(0.0,0.0), Vec2(0.4,-0.4), Vec2(0.8,-0.8), Vec2(0.8,0.8)];


var sel = -1;

var prg_circ = null;
var prg_pc = null;
var prg_bz = null;

var sl_n;
var mode;

function create_interf()
{
	UserInterface.begin(); // name of html id
	sl_n = UserInterface.add_slider('NB Eval ',10,100,50,update_wgl);
	UserInterface.add_br();
	mode = UserInterface.add_radio('H','Mode',['point','lines'],0, update_wgl);
	UserInterface.add_br();
}

function init_wgl()
{
	create_interf();

	prg_circ = ShaderProgram(circle_vert,color_frag,'circle');
	prg_pc = ShaderProgram(pc_vert,color_frag,'pc');
	prg_bz = ShaderProgram(bezier_vert,color_frag,'bezier');
  
}

function draw_wgl()
{
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0,0,0,1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	/*prg_circ.bind();
	update_uniform('projectionMatrix', ortho2D);
	update_uniform('color', 1,1,1);
	update_uniform('nb',sl_n.value);
	switch(mode.value)
	{
		case 0:
		gl.drawArrays(gl.POINTS, 0, sl_n.value);
		break;
		case 1:
		gl.drawArrays(gl.LINE_LOOP, 0, sl_n.value);
		break;
	}
	unbind_shader();*/

	prg_pc.bind();
	update_uniform('projectionMatrix', ortho2D);
	update_uniform('color',1,1,1);
	update_uniform('PC', PC);

	switch(mode.value)
	{
		case 0:
			gl.drawArrays(gl.POINTS,0,PC.length);
			break;
		case 1:
			gl.drawArrays(gl.POINTS,0,PC.length);
			update_uniform('color',0.2,1,0.5);
			gl.drawArrays(gl.LINE_STRIP,0,PC.length);
			break;
	}


	prg_bz.bind();
	update_uniform('projectionMatrix', ortho2D);
	update_uniform('color',0.5,0,1);
	update_uniform('nb', sl_n.value);
	update_uniform('PC', PC);
	update_uniform('nbPC', PC.length);

	switch(mode.value)
	{
		case 0:
			gl.drawArrays(gl.POINTS,0, sl_n.value);
			break;
		case 1:
			gl.drawArrays(gl.POINTS,0, sl_n.value);
			update_uniform('color',0.7,0.2,0.5);
			gl.drawArrays(gl.LINE_STRIP,0, sl_n.value);
			break;
	}
	
	unbind_shader();
}


launch_2d();
