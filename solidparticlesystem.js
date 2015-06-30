"use strict";

// Solid Particle System : SPS

var SolidParticleSystem = function(name, scene) {

  // public members  
  this.particles = [];
  this.nbParticles = 0;
  this.counter = 0;

  // private members
  this._scene = scene;
  this._positions = [];
  this._indices = [];
  this._normals = [];
  this._colors = [];
  this._uvs = [];
  this._index = 0;  // indices index
  this._shapeCounter = 0;
  this._cam_axisZ = BABYLON.Vector3.Zero();
  this._cam_axisY = BABYLON.Vector3.Zero();
  this._cam_axisX = BABYLON.Vector3.Zero();
  this._axisX = BABYLON.Axis.X;
  this._axisY = BABYLON.Axis.Y;
  this._axisZ = BABYLON.Axis.Z;
  this._camera = scene.activeCamera;
  this._fakeCamPos = BABYLON.Vector3.Zero();
  this._rotMatrix = new BABYLON.Matrix();
  this._invertedMatrix = new BABYLON.Matrix();
  this._rotated = BABYLON.Vector3.Zero();
};

// build the SPS mesh : returns the mesh
SolidParticleSystem.prototype.buildMesh  = function() {
  BABYLON.VertexData.ComputeNormals(this._positions, this._indices, this._normals);
  var vertexData = new BABYLON.VertexData();
  vertexData.positions = this._positions;
  vertexData.indices = this._indices;
  vertexData.normals = this._normals;
  vertexData.uvs = this._uvs;
  vertexData.colors = this._colors;
  var mesh = new BABYLON.Mesh(name, this._scene);
  vertexData.applyToMesh(mesh, true);
  this.mesh = mesh;
  return mesh;
};


// add a particle object in the particles array
SolidParticleSystem.prototype._addParticle = function(p, idxpos, shape, shapeId) {
  this.particles.push( {
    idx: p, 
    _pos: idxpos,
    _shape: shape, 
    shapeId: shapeId,
    color: new BABYLON.Color4(1, 1, 1, 1),
    position: BABYLON.Vector3.Zero(), 
    rotation : BABYLON.Vector3.Zero(),
    scale: new BABYLON.Vector3(1 ,1, 1), 
    velocity: BABYLON.Vector3.Zero(),
    alive: true
  } );
};

// add all the particles of a given shape to the particles array
SolidParticleSystem.prototype._addParticles = function(nb, builder, shape) {
  for (var i = 0; i < nb; i++) {
    builder(this._index, shape, this._positions, this._indices, this._uvs, this._colors);
    this._addParticle(this.nbParticles + i, this._positions.length, shape, this._shapeCounter);
    this._index += shape.length;
  }
  this.nbParticles += nb;
  this._shapeCounter ++;
};

// Pre-build model : triangle
SolidParticleSystem.prototype.addTriangles = function(nb, size) {
  var half = size / 2;
  var h = size * Math.sqrt(3) / 4;
  // shape
  var triangleShape = [
    new BABYLON.Vector3(-half, -h, 0),
    new BABYLON.Vector3(half, -h, 0),
    new BABYLON.Vector3(0, h, 0)
  ];
  // builder
  var triangleBuilder = function(p, shape, positions, indices, uvs, colors) {
    positions.push(shape[0].x, shape[0].y, shape[0].z);
    positions.push(shape[1].x, shape[1].y, shape[1].z);
    positions.push(shape[2].x, shape[2].y, shape[2].z);
    indices.push(p, p + 1, p + 2);
    uvs.push(0,1, 1,1, 0.5,0);
    for (var v = 0; v < 3; v++) {
      colors.push(1,1,1,1);
    }
  };
  // particles
  this._addParticles(nb, triangleBuilder, triangleShape);
  return this._shapeCounter;
};


// Pre-build model : quad
SolidParticleSystem.prototype.addQuads = function(nb, size) {
  var half = size / 2;
  // shape
  var quadShape = [ 
    new BABYLON.Vector3(-half, -half, 0.0),
    new BABYLON.Vector3(half, -half, 0.0),
    new BABYLON.Vector3(half, half, 0.0),
    new BABYLON.Vector3(-half, half, 0.0),
  ];
  // builder
  var quadBuilder = function(p, shape, positions, indices, uvs, colors) {
    positions.push(shape[0].x, shape[0].y, shape[0].z);
    positions.push(shape[1].x, shape[1].y, shape[1].z);
    positions.push(shape[2].x, shape[2].y, shape[2].z);
    positions.push(shape[3].x, shape[3].y, shape[3].z);
    indices.push(p, p + 1, p + 2);
    indices.push(p, p + 2, p + 3);
    uvs.push(0,1, 1,1, 1,0, 0,0);
    for (var v = 0; v < 4; v++) {
      colors.push(1,1,1,1);
    }
  };
  // particles
  this._addParticles(nb, quadBuilder, quadShape);
  return this._shapeCounter;
};


SolidParticleSystem.prototype.addCubes = function(nb, size) {
  var half = size / 2;
  // shape
  var cubeShape = [ 
    // front face
    new BABYLON.Vector3(-half, -half, -half), 
    new BABYLON.Vector3(half, -half, -half),
    new BABYLON.Vector3(half, half, -half),
    new BABYLON.Vector3(-half, half, -half),
    //back face
    new BABYLON.Vector3(half, -half, half), 
    new BABYLON.Vector3(-half, -half, half),
    new BABYLON.Vector3(-half, half, half),
    new BABYLON.Vector3(half, half, half),   
    // left face
    new BABYLON.Vector3(-half, -half, half), 
    new BABYLON.Vector3(-half, -half, -half),
    new BABYLON.Vector3(-half, half, -half),
    new BABYLON.Vector3(-half, half, half),
    // right face 
    new BABYLON.Vector3(half, -half, -half), 
    new BABYLON.Vector3(half, -half, half),
    new BABYLON.Vector3(half, half, half),
    new BABYLON.Vector3(half, half, -half),
    // top face
    new BABYLON.Vector3(-half, half, -half), 
    new BABYLON.Vector3(half, half, -half),
    new BABYLON.Vector3(half, half, half),
    new BABYLON.Vector3(-half, half, half),
    // bottom face
    new BABYLON.Vector3(-half, -half, half), 
    new BABYLON.Vector3(half, -half, half),
    new BABYLON.Vector3(half, -half, -half),
    new BABYLON.Vector3(-half, -half, -half)    
  ];
  // builder
  var cubeBuilder = function(p, shape, positions, indices, uvs, colors) { 
    var i;
    for (i = 0; i < 24; i++) {
      positions.push(shape[i].x, shape[i].y, shape[i].z);
      colors.push(1,1,1,1);
    }
    var j;
    for (i = 0; i < 6; i++) {
      j = i * 4;
      indices.push(p + j, p + j + 1, p + j + 2);
      indices.push(p + j, p + j + 2, p + j + 3);
      uvs.push(0,1, 1,1, 1,0, 0,0);
    }
  };
  // particles
  this._addParticles(nb, cubeBuilder, cubeShape);
  return this._shapeCounter;
};

SolidParticleSystem.prototype.addTetrahedrons = function(nb, size) {
  var half = size / 2;
  var h = size * Math.sqrt(3) / 4;
  var high = size * Math.sqrt(6) / 3;
  // shape
  var pt0 = new BABYLON.Vector3(-half, -h, -high / 4);
  var pt1 = new BABYLON.Vector3(half, -h, -high / 4);
  var pt2 = new BABYLON.Vector3(0, h, -high / 4);
  var pt3 = new BABYLON.Vector3(0, 0, high * 3 / 4);
  var tetraShape = [ 
    pt0, pt1, pt2,    // front face
    pt0, pt3, pt1,    // bottom face
    pt3, pt0, pt2,    // left face
    pt1, pt3, pt2     // right face
  ];
  // builder
  var tetraBuilder = function(p, shape, positions, indices, uvs, colors) { 
    var i;
    for (i = 0; i < 12; i++) {
      positions.push(shape[i].x, shape[i].y, shape[i].z);
      colors.push(1,1,1,1);
    }
    var j;
    for (i = 0; i < 4; i++) {
      j = i * 3;
      indices.push(p + j, p + j + 1, p + j + 2);
      uvs.push(0,1, 1,1, 0.5,0);
    }
  };
  // particles
  this._addParticles(nb, tetraBuilder, tetraShape);
  return this._shapeCounter;
};

SolidParticleSystem.prototype.addPolygons = function(nb, size, vertexNb) {
  vertexNb = vertexNb || 12;
  var half = size / 2;
  var pi2 = Math.PI * 2;
  // shape
  var polygonShape = [];
  polygonShape.push(BABYLON.Vector3.Zero()); // central point
  var ang = 0;
  for (var i = 0; i < vertexNb; i++) {
    ang = i * pi2 / vertexNb;
    polygonShape.push(new BABYLON.Vector3(half * Math.cos(ang), half * Math.sin(ang), 0));
  }
  polygonShape.push(polygonShape[1]); // close the polygon
  // builder
  var polygonBuilder = function(p, shape, positions, indices, uvs, colors) { 
    var i;
    for (i = 0; i < shape.length; i++) {
      positions.push(shape[i].x, shape[i].y, shape[i].z);
      colors.push(1,1,1,1);
      var u = ((shape[i].x / half) + 1) / 2;
      var v = (1 - (shape[i].y / half)) / 2;
      uvs.push(u, v);
    }
    for (i = 1; i <= vertexNb; i++) {
      indices.push(p + i + 1, p, p + i);
    }
  };
  // particles
  this._addParticles(nb, polygonBuilder, polygonShape);
  return this._shapeCounter;
};

SolidParticleSystem.prototype.addShape = function(mesh, nb) {
  var meshPos = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  var meshInd = mesh.getIndices();
  var meshUV = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
  var meshCol = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
  // shape
  var posToShape = function(positions) {
    var shape = [];
    for (var i = 0; i < positions.length; i += 3) {
      shape.push(new BABYLON.Vector3(positions[i], positions[i + 1], positions[i + 2]));
    }
    return shape;
  };
  var shape = posToShape(meshPos);
  // builder
  var meshBuilder = function(p, shape, positions, meshInd, indices, meshUV, uvs, meshCol, colors) { 
    var i;
    var u = 0;
    var c = 0;
    for (i = 0; i < shape.length; i++) {
      positions.push(shape[i].x, shape[i].y, shape[i].z);
      uvs.push(meshUV[u], meshUV[u + 1]);
      u += 2;
      if (meshCol) {
        colors.push(meshCol[c], meshCol[c + 1], meshCol[c + 2], meshCol[c + 3]);
        c += 4;
      }
      else {
        colors.push(1,1,1,1);
      }
    }
    for (i = 0; i < meshInd.length; i++) {
      indices.push(p + meshInd[i]);
    }
  };
  // particles
  for (var i = 0; i < nb; i++) {
    meshBuilder(this._index, shape, this._positions, meshInd, this._indices, meshUV, this._uvs, meshCol, this._colors);
    this._addParticle(this.nbParticles + i, this._positions.length, shape, this._shapeCounter);
    this._index += shape.length;
  }
  this.nbParticles += nb;
  this._shapeCounter ++;
  return this._shapeCounter;
};

// reset a particle to its just built status
SolidParticleSystem.prototype.resetParticle = function(particle) {
  for (var pt = 0; pt < particle._shape.length; pt++) {
    this._positions[particle._pos + pt * 3] = particle._shape[pt].x;      
    this._positions[particle._pos + pt * 3 + 1] = particle._shape[pt].y;
    this._positions[particle._pos + pt * 3 + 2] = particle._shape[pt].z;
  }
};




// set all the particles
SolidParticleSystem.prototype.setParticles = function(billboard) {

  this._cam_axisX.x = 1;
  this._cam_axisX.y = 0;
  this._cam_axisX.z = 0;
  this._cam_axisY.x = 0;
  this._cam_axisY.y = 1;
  this._cam_axisY.z = 0;
  this._cam_axisZ.x = 0;
  this._cam_axisZ.y = 0;
  this._cam_axisZ.z = 1;

  if (billboard) {    // the particles will always face the camera
    
    // compute a fake camera position : un-rotate the camera position by the current mesh rotation
    BABYLON.Matrix.RotationYawPitchRollToRef(this.mesh.rotation.y, this.mesh.rotation.x, this.mesh.rotation.z, this._rotMatrix);
    this._rotMatrix.invertToRef(this._invertedMatrix);
    BABYLON.Vector3.TransformCoordinatesToRef(this._camera.globalPosition, this._invertedMatrix, this._fakeCamPos);
    
    // set two orthogonal vectors (_cam_axisX and and _cam_axisY) to the cam-mesh axis (_cam_axisZ)
    (this._fakeCamPos).subtractToRef(this.mesh.position, this._cam_axisZ);
    BABYLON.Vector3.CrossToRef(this._cam_axisZ, this._axisX, this._cam_axisY);
    BABYLON.Vector3.CrossToRef(this._cam_axisZ, this._cam_axisY, this._cam_axisX);
    this._cam_axisY.normalize();
    this._cam_axisX.normalize();
    this._cam_axisZ.normalize();
  }
  
  var idx = 0;
  var index = 0;
  var colidx = 0;
  var colorIndex = 0;

  // particle loop
  for (var p = 0; p < this.nbParticles; p++) { 

    // call to custom user function to update the particle properties
    this.updateParticle(this.particles[p]);   

    // particle rotation matrix
    if (billboard) {
      this.particles[p].rotation.x = 0.0;
      this.particles[p].rotation.y = 0.0;
    }
    BABYLON.Matrix.RotationYawPitchRollToRef(this.particles[p].rotation.y, this.particles[p].rotation.x, this.particles[p].rotation.z, this._rotMatrix);
  
    for (var pt = 0; pt < this.particles[p]._shape.length; pt++) {
      idx = index + pt * 3;
      colidx = colorIndex + pt * 4;
      BABYLON.Vector3.TransformCoordinatesToRef(this.particles[p]._shape[pt],this._rotMatrix, this._rotated);

      this._positions[idx]     = this.particles[p].position.x + this._cam_axisX.x * this._rotated.x * this.particles[p].scale.x + this._cam_axisY.x * this._rotated.y * this.particles[p].scale.y + this._cam_axisZ.x * this._rotated.z * this.particles[p].scale.z;      
      this._positions[idx + 1] = this.particles[p].position.y + this._cam_axisX.y * this._rotated.x * this.particles[p].scale.x + this._cam_axisY.y * this._rotated.y * this.particles[p].scale.y + this._cam_axisZ.y * this._rotated.z * this.particles[p].scale.z; 
      this._positions[idx + 2] = this.particles[p].position.z + this._cam_axisX.z * this._rotated.x * this.particles[p].scale.x + this._cam_axisY.z * this._rotated.y * this.particles[p].scale.y + this._cam_axisZ.z * this._rotated.z * this.particles[p].scale.z; 

      this._colors[colidx] = this.particles[p].color.r;
      this._colors[colidx + 1] = this.particles[p].color.g;
      this._colors[colidx + 2] = this.particles[p].color.b;
      this._colors[colidx + 3] = this.particles[p].color.a;
    }
    index = idx + 3;
    colorIndex = colidx + 4;
  }

this.beforeUpdateParticles();
this.mesh.updateVerticesData(BABYLON.VertexBuffer.ColorKind, this._colors, false, false);
this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, this._positions, false, false);
if (!this.mesh._areNormalsFrozen) {
  var indices = this.mesh.getIndices();
  BABYLON.VertexData.ComputeNormals(this._positions, this._indices, this._normals);
  this.mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, this._normals, false, false);
}
this.afterUpdateParticles();
//this.mesh.refreshBoundingInfo();
};






// =======================================================================
// Particle behavior logic
// these following methods may be overwritten by the user to fit his needs


// init : set all particles first values and calls updateParticle to set them in space
// can be overwritten by the user
SolidParticleSystem.prototype.initParticles = function() {
    /*
    for (var p = 0; p < this.nbParticles; p++) {
      // your process here
    }
    */
};



// recycle a particle : can by overwritten by the user
SolidParticleSystem.prototype.recycleParticle = function(particle) {
  return particle;
};


// update a particle : can be overwritten by the user
// will be called on each particle by setParticles() :
// ex : just set a particle position or velocity and recycle conditions
SolidParticleSystem.prototype.updateParticle = function(particle) {
  return particle;
};

SolidParticleSystem.prototype.beforeUpdateParticles = function() {

};

SolidParticleSystem.prototype.afterUpdateParticles = function() {

};