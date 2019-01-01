"use strict"


// SHADER 3D MINIMUM

//vertex shader
var white_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
in vec3 position_in;
in vec3 normal_in;
out vec3 P,No;

void main()
{
	vec4 P4 = viewMatrix * vec4(position_in,1);
	gl_Position = projectionMatrix * P4;

	P = P4.xyz;
	No= normalMatrix * normal_in;
	
	
}`;
//lamb = coefficient de lambert = N.L

//fragment shader
var white_frag=`#version 300 es
precision highp float;
uniform vec3 pos_lum;
in vec3 P,No;
out vec4 frag_out;


const float alpha = 150.0;

void main()
{
	//vec3 N = normalize(No);
	vec3 N=normalize(cross(dFdx(P),dFdy(P)));//commenter updateuniform normal matrix si on utilise cette ligne plutot que celle du haut
	vec3 L = normalize(pos_lum-P);
	float lamb0 = clamp(dot(N,L),0.0,1.0);
	float lamb=0.15+0.85*lamb0;//(round(lamb0*10.0)/10.0);

	vec3 V = normalize(-P);
	vec3 R = reflect(-L,N);

	float spec= pow(clamp(dot(V,R),0.0,1.0),alpha);

	vec3 col;
	if(gl_FrontFacing)
		col = vec3(1,0,0)*lamb+vec3(1,1,1)*spec;
	else
		col = vec3(0,1,0)*lamb+vec3(1,1,1)*spec;

	frag_out = vec4(col,1);
}`;


let prg_white = null;
let mesh_rend = null;

let mercuredisttosoleil = 0.003;
let venusdisttosoleil = 0.006;
let terredisttosoleil = 0.009;
let marsdisttosoleil = 0.012;
let jupiterdisttosoleil = 0.018;
let saturnedisttosoleil = 0.021;
let uranusdisttosoleil = 0.024;
let neptunedisttosoleil = 0.027;

let mercureinitrot = Math.random()*360;
let venusinitrot = Math.random()*360;
let terreinitrot = Math.random()*360;
let marsinitrot = Math.random()*360;
let jupiterinitrot = Math.random()*360;
let saturneinitrot = Math.random()*360;
let uranusinitrot = Math.random()*360;
let neptuneinitrot = Math.random()*360;

let soleilrotspeed = 3.23;
let mercurerotspeed = 10.23;
let venusrotspeed = 8.52;
let terrerotspeed = 22.01;
let marsrotspeed = 33.33;
let jupiterrotspeed = 10.23;
let saturnerotspeed = 10.23;
let uranusrotspeed = 10.23;
let neptunerotspeed = 10.23;

function init_wgl()
{
	prg_white = ShaderProgram(white_vert,white_frag,'white');

    // cree une sphere
    let mesh = Mesh.Sphere(256);
    // cree le renderer (positions?/normales?/coord_texture?)
    // il contient VBO + VAO + VBO + draw()
    mesh_rend = mesh.renderer(true,true,false);

    // place la camera pour bien voir l'objet
	//scene_camera.show_scene(mesh.BB);

	ewgl_continuous_update=true;
}

function draw_wgl()
{
	//gl.viewport(0,0,400,400,gl.clientWidth/2,gl.clientHeight/2);
	gl.clearColor(0,0,0,1);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	

	// les matrices sont deduites de la camera
	const projection_matrix = scene_camera.get_projection_matrix();
	const view_matrix = scene_camera.get_view_matrix();

	let a= ewgl_current_time;
	//let pl = Vec3(10*Math.cos(a),10*Math.sin(a),1.0);
	let pl = Vec3(1,1,1);
	let pos_lum=view_matrix.mult(Vec4(pl,1)).xyz;



	//Sphere englobante
	prg_white.bind();
	update_uniform('viewMatrix',view_matrix);
	update_uniform('normalMatrix', view_matrix.inverse3transpose());
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('pos_lum', pos_lum);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();

	//Soleil
	prg_white.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(a*soleilrotspeed),scale(0.001)));
	update_uniform('normalMatrix', view_matrix.inverse3transpose());
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('pos_lum', pos_lum);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();

	//Mercure
	prg_white.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(mercureinitrot+a*mercurerotspeed),translate(0,0,mercuredisttosoleil),scale(0.0001)));
	update_uniform('normalMatrix', view_matrix.inverse3transpose());
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('pos_lum', pos_lum);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();

	//Vénus
	prg_white.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(venusinitrot+a*venusrotspeed),translate(0,0,venusdisttosoleil),scale(0.0001)));
	update_uniform('normalMatrix', view_matrix.inverse3transpose());
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('pos_lum', pos_lum);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();

	//Terre
	prg_white.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(terreinitrot+a*terrerotspeed),translate(0,0,terredisttosoleil),scale(0.0001)));
	update_uniform('normalMatrix', view_matrix.inverse3transpose());
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('pos_lum', pos_lum);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();

	//Mars
	prg_white.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(marsinitrot+a*marsrotspeed),translate(0,0,marsdisttosoleil),scale(0.0001)));
	update_uniform('normalMatrix', view_matrix.inverse3transpose());
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('pos_lum', pos_lum);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();

	//Jupiter
	prg_white.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(jupiterinitrot+a*jupiterrotspeed),translate(0,0,jupiterdisttosoleil),scale(0.0001)));
	update_uniform('normalMatrix', view_matrix.inverse3transpose());
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('pos_lum', pos_lum);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();

	//Saturne
	prg_white.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(saturneinitrot+a*saturnerotspeed),translate(0,0,saturnedisttosoleil),scale(0.0001)));
	update_uniform('normalMatrix', view_matrix.inverse3transpose());
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('pos_lum', pos_lum);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();

	//Uranus
	prg_white.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(uranusinitrot+a*uranusrotspeed),translate(0,0,uranusdisttosoleil),scale(0.0001)));
	update_uniform('normalMatrix', view_matrix.inverse3transpose());
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('pos_lum', pos_lum);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();

	//Neptune
	prg_white.bind();
	update_uniform('viewMatrix', mmult(view_matrix,rotateY(neptuneinitrot+a*neptunerotspeed),translate(0,0,neptunedisttosoleil),scale(0.0001)));
	update_uniform('normalMatrix', view_matrix.inverse3transpose());
	update_uniform('projectionMatrix', projection_matrix);
	update_uniform('pos_lum', pos_lum);
	mesh_rend.draw(gl.TRIANGLES);
	unbind_shader();
}

launch_3d();
