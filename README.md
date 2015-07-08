# SolidParticleSystem

Solid Particle System (SPS) experiment for BabylonJS.   

A single updatable mesh.   
The particles are built with this mesh vertices and faces, then animated.  


## Installation
Just add a script tag in your HTML page
```html
<script src = "solidparticlesystem.js"></script>
```

## Usage
First you create an empty SPS and you add particles to it with the _addXXX(nb, size)_ methods as many times you need.   
The SPS name will be its underlying mesh name.   

You can also create particles from an existing mesh with _addShape(mesh)_.

Then you build the mesh.

```javascript
var SPS = new SolidParticleSystem("SPS", scene);
// plane shapes
SPS.addTriangles(500, 3);    // 500 triangles sized 3
SPS.addQuads(200, 3);        // 200 quads sized 3
SPS.addPolygons(100, 5, 8);  // 100 polygons sized 5 with 8 vertices each
SPS.addTriangles(80, 8);      // 80 triangles sized 8
// solid shapes
SPS.addTetrahedrons(10, 4);  // 10 tetrahedrons sized 4
SPS.addCubes(20, 3);         // 20 cubes sized 3

var sphere = BABYLON.Mesh.CreateSphere("s", 5, 3, scene);
SPS.addShape(sphere, 20, 12);  // 20 spheres with the shapeID set to 12 (optional parameter)
sphere.dispose();

var mesh = SPS.buildMesh();
```
Now your SPS is ready to get a behavior. Once the behavior will be given (or not), you actually display the particles at their current positions with current properties with :
```javascript
SPS.billboard = true;
SPS.setParticles();
```
_SPS.billboard_ is a boolean (default _false_). If set to _true_, all the particles will face the cam and their _x_ and _y_ rotation values will be ignored. This is useful if you display only plane particles. You need to call _SPS.setParticles()_ within the _scene.registerBeforeRender()_ function in order to display the SPS in billboard mode.   


The _setParticles()_ function can be used in the BJS render loop.  
It is mandatory to use this function to update the mesh.  

## SPS Animation
You can give your SPS a behavior by setting some custom functions :  

* **_initParticles()_** : lets you set all the initial particle properties. You must iterate over all the particles by using the _SPS.nbParticles_ property. The usage of this function is not mandatory.
* **_recycleParticle(particle)_** : lets you set a particle to be recycled. It is called per particle. The usage of this function is not mandatory. 
* **_updateParticle(particle)_** : lets you set the particle properties. This function is called per particle by _SPS.setParticles()_. The usage of this function is not mandatory.  
* **_beforeUpdateParticles()_** : lets you make things within the call to _SPS.setParticles()_ just before iterating over all the particles.  The usage of this function is not mandatory.   
* **_afterUpdateParticles()_** : lets you make things within the call to _SPS.setParticles()_  just after the iteration over all the particles is done. The usage of this function is not mandatory.   

The particle properties that can be set are :

* **_position_** : Vector3  default = (0, 0, 0)
* **_rotation_** : Vector3  default = (0, 0, 0)  
* **_quaternion_** : Vector3  default = undefined
* **_velocity_** : Vector3  default = (0, 0, 0)
* **_color_** : Vector4  default = (1, 1, 1, 1)
* **_scale_** : Vector3  default = (1, 1, 1)
* **_uvs_** : Array(4) default = [0,0, 1,1]
* **_alive_** : boolean  default = true

If you set a particle rotation quaternion, its rotation property will then be ignored.    
If you set your SPS in billboard mode, you should only set a _rotation.z_ value.   

Please note that all positions are expressed in the mesh **local space** and not in the World space.  

You can obviously also create your own properties like _acceleration: Vector3_ or _age_, in _initParticles()_ for instance.  
You may access to some read-only properties :   

* **_idx_** : particle index
* **_shapeId_** : shape model ID

Actually each time you call a _SPS.addXXX()_ method the related newly created particle set shapeID is returned.
```javascript
var quadsID = SPS.addQuads(20, 2);
```
This is usefull if you want to apply a given behavior to some particle types only.    

You have also access to some SPS properties :

* **SPS.particles** : this is the array containing all the particles. You should iterate over this array in _initParticles()_ function for instance.
* **SPS.nbParticles** : this is number of particles in the SPS.
* **SPS.counter** : this is a counter for your own usage. It's not set by any SPS default functions.

Here again, you can add your own properties like _capacity_ or _rate_ if needed.

If you don't need some given features (ex : particle colors), you can disable/enable them at any time (disabling a feature will improve the performance) : 
```javascript
SPS.enableParticleRotation();       // re-activates computing particle.rotation
SPS.disableParticleRotation();      // prevents from particle.rotation computing
SPS.enableParticleTexture();        // re-activates computing particle.uvs
SPS.disableParticleTexture();       // prevents froms particle.uvs computing
SPS.enableParticleColor();          // re-activates computing particle.color
SPS.disableParticleColor();         // prevents from particle.color computing
SPS.enableParticleVertex();          // re-activates call to custom updateParticleVertex()
SPS.disableParticleVertex();         // prevents from calling to custom updateParticleVertex()
```
All features, except the call to the custom _updateParticleVertex()_ function, are enabled by default. These affect the _SPS.setParticles()_ process only.   
Note you can also use the standard BJS mesh _freezeXXX()_ methods if the SPS mesh is immobile or if the normals aren't needed :   
```javascript
SPS.mesh.freezeWorldMatrix();       // prevents from re-computing the World Matrix each frame
SPS.mesh.freezeNormals();           // prevents from re-computing the normals each frame
```

If you don't need your SPS any longer, you can dispose it to free the memory
```javascript
SPS.dispose();
```

example :

```javascript
 // Particle system
  var speed = 2;
  var gravity = -0.01;
  var PS = new SolidParticleSystem('SPS', scene);
  PS.addTriangles(200, 3);
  PS.addQuads(200, 3);
  PS.addCubes(500, 2);
  var mesh = PS.buildMesh();
  mesh.freezeWorldMatrix();


  // define a custom SPS behavior

  PS.initParticles = function() {
    // just recycle everything
    for (var p = 0; p < this.nbParticles; p++) {
      this.recycleParticle(this.particles[p]);
    }
  };

  PS.recycleParticle = function(particle) {
    // set particle new velocity, scale and rotation
    particle.position = BABYLON.Vector3.Zero();  
    particle.velocity = (new BABYLON.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5)).scaleInPlace(speed);
    particle.scale = (new BABYLON.Vector3(1, 1, 1)).scaleInPlace(Math.random() * 3 + 1);
    particle.rotation = (new BABYLON.Vector3(Math.random(), Math.random(), Math.random())).scaleInPlace(0.1);
    particle.color = new BABYLON.Color4(Math.random(), Math.random(), Math.random(), Math.random());
  };

  PS.updateParticle = function(particle) {
  if (particle.position.y < 0) {
      this.recycleParticle(particle);
    }
    particle.velocity.y += gravity;                         // apply gravity to y
    (particle.position).addInPlace(particle.velocity);      // update particle new position
    particle.position.y += speed / 2;
    var sign = (particle.idx % 2 == 0) ? 1 : -1;            // rotation sign and new value
    particle.rotation.z += 0.1 * sign;
    particle.rotation.x += 0.05 * sign;
    particle.rotation.y += 0.008 * sign;
  };


  // init all particle values
  PS.initParticles();

  // animation
  scene.registerBeforeRender(function() {
    PS.setParticles();
  });
  ```