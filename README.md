# TP Web GL avec EasyWGL


## Browser supportés

Actuellement WebGL 2 n'est supporté que par google-chrome et firefox

## Travailler en local

Pour travailler sans serveur web dédié plusieurs solutions:

* python3 -m http.server -> http://localhost:8000
* python2 -m SimpleHTTPServer -> http://localhost:8000
* installer _Apache_
* Sous Windows: tinyweb

## Problème de cache

Pour éviter les problème de mise à jour il faut deactiver le cache
* chrome: ctrl-shit i -> F1 -> "cocher Disable cache (while dev tool is open)""
* firefox: ctrl-shit i -> onglet Réseau -> cocher "Désactiver le cache"
* __LAISSER LA CONSOLE DEBUG OUVERTE__


## Vecteurs & Matrices

Objets créé par générateurs:

* Vec2, Vec3, Vec4
* Mat2, Mat3, Mat4

Pas de surcharge des operateurs en JavaScript donc on utilise les méthodes.

Méthodes de vecteurs:

* add, sub, self_add, self_sub, mult, neg, dot, cross, 
* getter .x .y .z .xy .xyz
* setter .x .y .z

```javascript
let u = Vec3(0.1,0.2,0.3);
let v = Vec3(1,2,3);
let w = (u.add(v)).mult(2);
```

Méthodes de matrices:

* id, add, sub, mult, transpose, inverse,  
* inverse3transpose
* accès valeurs: m.data[0-15]

m3 = m1 x m2 s'écrit:

```javascript
m3 = m1.mult(m2);
```

Il existe un raccourci mmult(...):

```javascript
let u = Vec4(1,2,3,1);
let v = mmult(rotateZ(180),translate(100,100,10), scale(2), u);
```

Matrices de transformations:

* scale(,,)
* translate(,,)
* rotateX(b), rotateY(b), rotateZ(b). Angle b en degré
* rotate(b,axis)

## Interface

L'interface utilisateur se crée en javascript

### Initialisation 

``` javascript
UserInterface.begin("Interface")
```

### Groupe

* sans décoration: use_group(dir), dir: 'H' ou 'V'
* avec décolration: use_field_set(dir, label, frame_width,frame_color,bg_color,bold?)
* fin du groupe: .end_use()

``` javascript
UserInterface.use_group('H'); // groupe sans deco
UserInterface.use_field_set('V','Wood', '3px', '#803219', '#FFF4F0', 'bold');
sl_1  = UserInterface.add_slider('Bandes',2,100,10,update_wgl, v=>v, 0);
sl_2  = UserInterface.add_slider('var',0,100,50,update_wgl);
sl_3  = UserInterface.add_slider('sous-bandes',0,100,50,update_wgl);
UserInterface.end_use();
UserInterface.use_field_set('V','Marble', '3px', '#808090', '#F2F2F9', 'bold');
sl_4  = UserInterface.add_slider('Low',0,100,50,update_wgl);
sl_5  = UserInterface.add_slider('Med',0,100,50,update_wgl);
sl_6 = UserInterface.add_slider('High',0,100,50,update_wgl);
UserInterface.end_use();
UserInterface.end_use();
```

### Espace et label

``` javascript
UserInterface.add_label(label);
UserInterface.add_br(nb);
```

* add_dr: passer à la ligne suivante ou laisser n (1 par défaut) espaces verticaux

### Slider (range-input) 

``` javascript
var sl = UserInterface.add_slider(label,min,max,val,callback,callback_aff);
```

* callback: fonction avec la valeur en paramètre appelée si changement (Opt)
* callback_aff: fonction de conversion pour affichage la valeur et param callback (opt)
* retourne le range-input
* sl.value -> valeur entiere du slider dans une chaine
* sl.easy_value() -> valeur convertie par _callback_aff_

### Boutons-radio

``` javascript
var ra = UserInterface.add_radio(dir, title, labels, i, callback);
```

* dir: 'H' ou 'V'
* title: label
* labels: Array de chaines affichés à coté des boutond
* i: num du bouton selectionné initialement
* callback: fonction avec le numéro de selection en paramètre appelée si changement
* retour un objet qui contient le bouton selectionné
  * ra.value -> numéro du bouton selectionné

### Checkbox

``` javascript
var cb = UserInterface.add_check_box(label, val, callback);
```

* val: valeur booléenne initiale
* callback: fonction avec la valeur booléenne en paramètre appelée si changement
* retourne la _checkbox_
  * cb.checked -> valeur booléenne 

### Bouton

``` javascript
var cb = UserInterface.add_button(label, val, callback);
```

* callback: fonction sans paramètre si click


## Interface GL 2D

Clique gauche souris sur le canvas GL

* en haut à droite : cache/montre UI
* en bas à gauche : cache/montre CONSOlE
* sur le bord droit et _drag_: ajuste taille UI
* sur le bord bas et _drag_: ajuste taille CONSOlE

Dernière ligne du script :`launch_2d();`

Matrice accessible: ortho2D (conserve l'aspect)


## Interface GL 3D

Dernière ligne du script :`launch_3d();`

La caméra (`scene_camera`) est gérés par la souris:

* bouton gauche rotation
* bouton droit translation
* molette zoom

``` javascript
scene_camera.set_scene_radius(R);
scene_camera.set_scene_center(Vec3(X,Y,Z));
const projection_matrix = scene_camera.get_projection_matrix();
const view_matrix = scene_camera.get_view_matrix();
```


## OPENGL

### Shader Program

#### Création

```javascript
prg = ShaderProgram(vert, frag, name, fixed_attr=[])
```

* vert: variable chaine de caractères du vertex-shader
* frag: variable chaine de caractères du vertex-shader
* name: nom affiché en cas d'erreur de compilation
* fixed\_attr: array de array (pair) chaine, id attribut (OPTIONNEL)

#### Envoit de constantes (uniform):

```javascript
update_uniform(u, v);
```

envoit la variable/valeur v dans l'uniform u (chaine du nom) du shader courant bindé

#### Constantes standardisées

Pour plus de clareté et pour l'utilisation de la fonction _update\_matrices_ on
utilisera toujours dans les shaders les nom de variables suivants:

* projectionMatrix
* viewMatrix
* normalMatrix
* TU0, TU1, ... pour les sampler de texture (__T__exture __U__nit)

#### Envoi des matrices

```javascript
update_matrices(proj,view);
```

#### attribut standardisés

Afin de pouvoir utiliser le même VAO avec différents shader, il faut que les
id d'attributs soient identiques. On donc utilisera les mêmes noms de variables
pour que la lib puisse fixer les id des attrobuts les plus standard:

* position\_in -> POSITION\_ATTRIB (1)
* normal\_in   -> NORMAL\_ATTRIB   (2)
* texcoord\_in -> TEXCOORD\_ATTRIB (3)
* color\_in    -> COLOR\_ATTRIB    (4)

Le dernier paramètre de la fonction génératrice _ShaderProgram_ permet de fixer
les id de n'importe quel attribut.

#### Accès aux identifiants

Les id des uniforms  sont accessibles par _prg.unif\_xxx_ (xxx: nom de l'uniform)  
Les id des attributs  sont accessibles par _prg.attrib\_xxx_ (xxx: nom de l'attribut)  

### Buffer de données de sommets (VB0)

#### Création

```javascript
var vbo = VBO(data,nb_floats);
```

* data: données à copier FloatArray32 ou Array (null par defaut)
* nb_floats: taille du vecteur (1,2,3,4) (3 par défaut)


#### Allocation

```javascript
vbo.alloc(nbv);     allocation de nbv vecteurs
```

#### Mise à jour

```javascript
vbo.update(buffer, offset_dst=0);    m.a.j. des données
```

* buffer: donnée à envoyer
* offset\_dst: décalage dans la destination

### Buffer d'indices (EBO)

#### Création

```javascript
var ebo = EBO(buffer);
```

* buffer: Uint32Array ou Array contenant les indices

### Vertex Array Object (VAO)

#### Création

```javascript
var vao = VAO([attribut,vbo], [attribut,vbo], ...);
var vao = VAO([attribut,vbo,divisor], [attribut,vbo,divisor], ...);
```

### Texture 2d

#### Création

```javascript
var t = Texture2d([param,value],[param,value], ...);
```

* param/value couple paramètre,valeur définissant les propriétés de la texture:
* par defaut:
  * gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  * gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  * gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  * gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);	

#### Allocation

```javascript
t.alloc(w, h, internal_format, external_format, buffer);
```

* w: largeur
* h: hauteur
* internal_format: format de stockage interne dans la carte
* external_format: format des données à copier (buffer)
* buffer: TypedArray (Uint8Array, Float32Array ...) à copier

#### Mise à jour

```javascript
t.update(w,h,external_format, buffer);
```

#### Chargement image

```javascript
t.load(url, internal_format, external_format, mm);
```

* url: adresse de l'image (format supporté par html)
* internal_format: format de stockage interne dans la carte
* external_format: format des données à copier (buffer)
* mm: génération mip-maping (bool)
* retourne une [promesse](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Utiliser_les_promesses)

#### Utilisation

```javascript
t.bind(e);
t.bind(e,s);
```

* e: numéro de l'unité de texture à activer et utiliser (0,1,2,3,...)
* s: uniform du sampler (par défaut TU_s_)

### Texture 3d

#### Création

```javascript
var t = Texture3d([param,value],[param,value], ....);
```

#### Allocation

```javascript
t.alloc(w, h, d, internal_format, external_format, buffer);
```

* w: largeur
* h: hauteur
* d: profondeur
* internal_format: format de stockage interne dans la carte
* external_format: format des données à copier (buffer)
* buffer: TypedArray (Uint8Array, Float32Array ...) à copier

#### Mise à jour

```javascript
t.update(w,h,external_format, buffer);
```

#### Utilisation

```javascript
t.bind(e);
t.bind(e,s);
```

* e: numéro de l'unité de texture à activer et utiliser (0,1,2,3,...)
* s: uniform du sampler (par défaut TU_s_)

### Frame Buffer Object

#### Création

```javascript
var fbo = FBO(colors_attach, depth_attach);
```

* colors_attach: Array de texture (2d)
* depth_attach: attache un tampon de profondeur (bool)

#### re-dimensionnement

```javascript
fbo.resize(w,h);
```

### Binding

Permet de choisir l'objet utilisé par OpenGL.  
Pour les utiliser (paramétrage ou tracé) il faut lier (_bind_):

* les ShaderProgram
* les VBO
* les VAO
* les EBO
* les textures
* les FBO

```javascript
obj.bind();
```

### Unbinding

Il n'est pas nécessaire de délier (_unbind_) un obj. Le _bind_ suivant s'en charge.
Mais cela simplifie grandement le debugage. La fonction bas niveau consistant à
lier avec null, les _unbind_ sont globaux.

```javascript
unbind_shader();
unbind_vbo();
unbind_ebo();
unbind_vao();
unbind_texture2d();
unbind_texture3d();
unbind_fbo();
```

### Appel OpenGL-ES 3.0

On peut appeler directement toute les fonctions OpenGL, soit

* en bindant l'objet
* en récupérant l'id OpenGL: `obj.id`

## MAILLAGES

### Création de primitives

```javascript
var m = Mesh.Cube()
var m = Mesh.Sphere(s)
var m = Mesh.Cylinder(s)
var m = Mesh.Tore(s)
var m = Mesh.Wave(s)
```

* s: paramètre de subdivision

### Création par lecture de fichier off, obj

```javascript
Mesh.load(blob)
```

* blob donnée récupéré d'un FileReader (à utiliser avec FileDroppedOnCanevas)
* retourne une promesse

```javascript
FileDroppedOnCanevas( (blob) =>
{
  Mesh.load(blob).then((mesh) =>
  {
    mesh_rend = mesh.renderer(true,true,false);
    mat_obj = scale(1/BB.radius).mult(translate(BB.center.neg()));
    scene_camera.set_scene_radius(mesh.BB.radius);
    scene_camera.set_scene_center(mesh.BB.center);
    update_wgl();
  });
});
```

### Accès à la Bounding-Box

```javascript
var bb = mesh.BB;
let C = bb.center;
let R = bb.radius;
```

### Génération d'un Renderer (VBO/VAO/EBO)

```javascript
rend = mesh.renderer(p,n,t);
```

* p: utilise les positions (bool)
* n: utilise les normales (bool)
* t: utilise les coordonnée de texture (bool)

### Affichage

```javascript
sh_prg.bind();
rend.draw(prim);
shader.bind();
```

* prim: gl.POINTS ou gl.LINES ou gl.TRIANGLES
