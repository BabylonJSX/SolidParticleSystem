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

Then you build the mesh.

```javascript
var SPS = new SolidParticleSystem("SPS", scene);
// plane shapes
SPS.addTriangles(500, 3);    // 500 triangles sized 3
SPS.addQuads(200, 3);        // 200 quads sized 3
SPS.addPolygons(100, 5, 8);  // 100 polygons sized 5 with 8 vertices each
SPS.addTriangle(80, 8);      // 80 triangles sized 8
// solid shapes
SPS.addTetrahedrons(10, 4);  // 10 tetrahedrons sized 4
var mesh = SPS.buildMesh();
```
Now your SPS is ready to get a behavior. Once the behavior will be given (or not), you actually display the particles at their current positions with current properties with :
```javascript
SPS.setParticles(billboarded);
```
_billboarded_ is a boolean (default false). If set to true, all the particles will face the cam and their _x_ and _y_ rotation values will be ignored. This is useful if you display only plane particles.


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
* **_velocity_** : Vector3  default = (0, 0, 0)
* **_color_** : Vector4  default = (1, 1, 1, 1)
* **_scale_** : Vector3  default = (1, 1, 1)
* **_alive_** : boolean  default = true

Please note that all positions are expressed in the mesh **local space** and not in the World space.  

You can obviously also create your own properties like _acceleration: Vector3_ or _age_, in _initParticles()_ for instance.  
You may access to some read-only properties :   

* **_idx_** : particle index
* **_shapeId_** : shape model ID (0 = triangle, 1 = quad, 2 = cube, etc)

You have also access to some SPS properties :

* **SPS.particles** : this is the array containing all the particles. You should iterate over this array in _initParticles()_ function for instance.
* **SPS.nbParticles** : this is number of particles in the SPS.
* **SPS.counter** : this is a counter for your own usage. It's not set by any SPS default functions.

Here again, you can add your own properties like _capacity_ or _rate_ if needed.


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
    particle.color = (new BABYLON.Vector4(Math.random() + 1.2, Math.random() + 1.2, Math.random() + 1.2, Math.random() + 1.2)).scaleInPlace(0.5);
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
    PS.setParticles(false);
  });
  ```