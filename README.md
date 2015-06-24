# SolidParticleSystem

Solid Particle System (SPS) experiment.   

A single updatable mesh.   
The particles are built with this mesh vertices and faces, then animated.  


## Installation
Just add a script tag in your HTML page
```html
<script src = "solidparticlesystem.js"></script>
```

## Usage
First you create an empty SPS and you add particles to it with _addXXX(nb, size) as many times you need.   
Its name will be its underlying mesh name.   
Then you build the mesh

```javascript
var SPS = new SolidParticleSystem("SPS", scene);
SPS.addTriangles(500, 3);    // 500 triangles sized 3
SPS.addQuads(200, 3);        // 200 quads sized 3
SPS.addTriangle(80, 8);      // 80 triangles sized 8
var mesh = SPS.buildMesh();
```
