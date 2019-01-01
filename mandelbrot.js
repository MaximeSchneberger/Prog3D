"use strict"


var mandel_vert=`#version 300 es
uniform mat4 transf;
out vec2 c;

void main()
{
	const vec2 carre[4] = vec2[ ](vec2(-1.0,-1.0),vec2(1.0,-1.0),vec2(1.0,1.0),vec2(-1.0,1.0));
	c= (transf*vec4(carre[gl_VertexID],0,1)).xy;
	gl_Position = vec4(carre[gl_VertexID],0,1);
}
`;



var mandel_frag=`#version 300 es
precision highp float;
uniform int N;
in vec2 c;
out vec4 frag_out;
vec2 carre(vec2 z)
{
	return vec2((z.x*z.x-z.y*z.y),2.0*z.x*z.y);
}

void main()
{
	vec2 z=vec2(0);
	int i=0;
	do
	{
		z=carre(z)+c;
		i++;
	}
	while((i<N) && dot(z,z)<4.0);
	float g= float(i)/float(N);



	frag_out = vec4(g,g,g,1);
}
`;
//dot(z,z)<4 ou length(z)<2
//dot(z,z) -> produit scalaire entre z et z => z[0]*z[0]+z[1]*z[1]

//(x²-y²)+i(2xy)-> vec2((x²-y²),2xy)

//Noir 	-> Vert    -> Bleu    -> Rouge
//0,0,0 -> 0,255,0 -> 0,0,255 -> 255,0,0

var prg = null;

var sl_n;

var mono;

var xPos=0.0;
var yPos=0.0;
var zoom=1.0;

function onkey_wgl(k)
{
    switch (k) {
        case '+':
        	zoom*=0.9;
            break;
        case '-':
        	zoom*=1.1;
            break;
        case 'ArrowUp':
        	yPos+=(0.1*zoom);
            break;
        case 'ArrowDown':
        	yPos-=(0.1*zoom);
            break;
        case 'ArrowLeft':
        	xPos-=(0.1*zoom);
            break;
        case 'ArrowRight':
        	xPos+=(0.1*zoom);
            break;
        default:
            return false;
            break;
    }
    update_wgl();
    return true;
}

function create_interf()
{
	UserInterface.begin(); // name of html id
	sl_n = UserInterface.add_slider('NB Iteration ',0,256,64,update_wgl);
	UserInterface.add_br();
	mono = UserInterface.add_check_box('Mono ',true, (mono)=>
	{
		if (mono)
		{
			animation = setInterval( () => { b += 5; update_wgl(); }, 50);
		}
		else
		{
			window.clearInterval(animation);
			animation = null;
		}
	});
}

function init_wgl()
{
	create_interf();

	prg = ShaderProgram(mandel_vert,mandel_frag,'mandel');
  
}

function draw_wgl()
{
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0,0,0,1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	prg.bind();
	
	update_uniform('N',(sl_n.value));

	let m= mmult(translate(xPos,yPos,0),scale(zoom));
	update_uniform('transf',m);
	

	gl.drawArrays(gl.TRIANGLE_FAN,0,4);
	
	unbind_shader();
}


launch_2d();
