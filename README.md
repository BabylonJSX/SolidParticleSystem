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
First you create an empty SPS and you add particles to it with _addXXX(nb, size)_ as many times you need.   
Its name will be its underlying mesh name.   
Then you build the mesh

```javascript
var SPS = new SolidParticleSystem("SPS", scene);
SPS.addTriangles(500, 3);    // 500 triangles sized 3
SPS.addQuads(200, 3);        // 200 quads sized 3
SPS.addTriangle(80, 8);      // 80 triangles sized 8
var mesh = SPS.buildMesh();
```
Now your SPS is ready to get a behavior. Once the behavior will be given, you actually display the particles at their current positions with current properties with :
```javascript
SPS.setParticles();
```
This function can be used in the BJS render loop.  


You can give it a behavior by setting some custom functions :  

* **initParticles()** : lets you set all the initial particle properties. You must iterate over all the particles by using _SPS.nbParticles_ property. The usage of this function is not mandatory.
* **recycleParticle(particle)** : lets you set a particle to be recycled. It is called per particle. The usage of this function is not mandatory. 
* **updateParticle(particle)** : lets you set the particle properties. This function is called per particle by _SPS.setParticles()_. The usage of this function is not mandatory.  
* **beforeUpdateParticles()** : lets you make things within the call to _SPS.setParticles()_ just before iterating over all the particles.  The usage of this function is not mandatory.   
* **afterUpdateParticles()** : lets you make things within the call to _SPS.setParticles()_  just after the iteration over all the particles is done. The usage of this function is not mandatory.   

The particle properties that can be set are :

* position : Vector3  default = (0, 0, 0)
* rotation : Vector3  default = (0, 0, 0)  
* velocity : Vector3  default = (0, 0, 0)
* color : Vector4  default = (1, 1, 1, 1)
* scale : Vector3  default = (1, 1, 1)
* alive : boolean  default = true

You can obviously also create your own properties like _acceleration: Vector3_, in _initParticles()_ for instance.  
You may access to some read-only properties :   

* idx : particle index
* shapeId : shape model ID (0 = triangle, 1 = quad, 2 = cube, etc)

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