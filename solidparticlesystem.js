"use strict";

// Solid Particle System : SPS

var SolidParticleSystem = function(name, scene) {
  var positions = [];
  var indices = [];
  var normals = [];
  var uvs = [];
  var particles = [];

/*
  // model shapes
  // quad
  var quadShape = [ 
    new BABYLON.Vector3(-half, -half, 0.0),
    new BABYLON.Vector3(half, -half, 0.0),
    new BABYLON.Vector3(half, half, 0.0),
    new BABYLON.Vector3(-half, half, 0.0),
  ];

  var quadBuilder = function(p, shape, positions, indices, uvs) {
    positions.push(shape[0].x, shape[0].y, shape[0].z);
    positions.push(shape[1].x, shape[1].y, shape[1].z);
    positions.push(shape[2].x, shape[2].y, shape[2].z);
    positions.push(shape[3].x, shape[3].y, shape[3].z);
    indices.push(p, p + 1, p + 2);
    indices.push(p, p + 2, p + 3);
    uvs.push(0,1, 1,1, 1,0, 0,0);
  };

  // triangles
  var h = size * Math.sqrt(3) / 4;
  var triangleShape = [
    new BABYLON.Vector3(-half, -h, 0),
    new BABYLON.Vector3(half, -h, 0),
    new BABYLON.Vector3(0, h, 0)
  ];

  var triangleBuilder = function(p, shape, positions, indices, uvs) {
    positions.push(shape[0].x, shape[0].y, shape[0].z);
    positions.push(shape[1].x, shape[1].y, shape[1].z);
    positions.push(shape[2].x, shape[2].y, shape[2].z);
    indices.push(p, p + 1, p + 2);
    uvs.push(0,1, 1,1, 0.5,0);
  };


  var models = [ 
    {name: 'quad', shape: quadShape, builder: quadBuilder},
    {name: 'triangle', shape: triangleShape, builder: triangleBuilder}
  ];

  
  // particles build loop
  var index = 0;
  for (var p = 0; p < nb; p ++) {
    var model = models[(p+1) % 2];
    var idxpos = positions.length;
    model.builder(index, model.shape, positions, indices, uvs);
    particles.push( {
      idx: p, 
      pos: idxpos,
      shape: model.shape, 
      position: BABYLON.Vector3.Zero(), 
      rotation : BABYLON.Vector3.Zero(),
      scale: new BABYLON.Vector3(1 ,1, 1), 
      velocity: BABYLON.Vector3.Zero()
      } );

    index += model.shape.length;
  }
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  var vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;

  var mesh = new BABYLON.Mesh(name, scene);
  vertexData.applyToMesh(mesh, true);
*/
  
  this.particles = particles;
  this.counter = 0;


  // private members
  this._scene = scene;
  this._positions = positions;
  this._indices = indices;
  this._normals = normals;
  this._uvs = uvs;
  this._partCount = 0;
  this._index = 0;  // indices index
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

// build the SPS mesh 
SolidParticleSystem.prototype.build  = function() {
  BABYLON.VertexData.ComputeNormals(this._positions, this._indices, this._normals);
  var vertexData = new BABYLON.VertexData();
  vertexData.positions = this._positions;
  vertexData.indices = this._indices;
  vertexData.normals = this._normals;
  vertexData.uvs = this._uvs;
  var mesh = new BABYLON.Mesh(name, this._scene);
  vertexData.applyToMesh(mesh, true);
  this.mesh = mesh;
};


// add a particle object in particles array
SolidParticleSystem.prototype.addParticle = function(p, idxpos, shape) {
  this.particles.push( {
    idx: p, 
    pos: idxpos,
    shape: shape, 
    position: BABYLON.Vector3.Zero(), 
    rotation : BABYLON.Vector3.Zero(),
    scale: new BABYLON.Vector3(1 ,1, 1), 
    velocity: BABYLON.Vector3.Zero()
  } );
};


SolidParticleSystem.prototype.addTriangles = function(nb, size) {
  var half = size / 2;
  var h = size * Math.sqrt(3) / 4;
  var triangleShape = [
    new BABYLON.Vector3(-half, -h, 0),
    new BABYLON.Vector3(half, -h, 0),
    new BABYLON.Vector3(0, h, 0)
  ];
  var triangleBuilder = function(p, shape, positions, indices, uvs) {
    positions.push(shape[0].x, shape[0].y, shape[0].z);
    positions.push(shape[1].x, shape[1].y, shape[1].z);
    positions.push(shape[2].x, shape[2].y, shape[2].z);
    indices.push(p, p + 1, p + 2);
    uvs.push(0,1, 1,1, 0.5,0);
  };
  for (var i = 0; i < nb; i++) {
    triangleBuilder(this._index, triangleShape, this._positions, this._indices, this._uvs);
    var idxpos = this._positions.length;
    this.addParticle(this._partCount + i, this._positions.length, triangleShape);
    this._index += triangleShape.length;
  }
  this._partCount += nb;
};



// reset a particle to its just built status
SolidParticleSystem.prototype.resetParticle = function(particle) {
  var idx, pt;
  var nbPT = particle.shape.length;           
  var index = particle.pos;
  for (pt = 0; pt < nbPT; pt++) {
    idx = index + pt * 3;
    this._positions[idx] = particle.shape[pt].x;      
    this._positions[idx + 1] = particle.shape[pt].y;
    this._positions[idx + 2] = particle.shape[pt].z;
  }
};




// set all the particles
SolidParticleSystem.prototype.setParticles = function(billboard) {

  var nb = this.nb;
  var particles = this.particles;
  //var model = this.model;
  var _cam_axisX = this._axisX;
  var _cam_axisY = this._axisY;
  var _cam_axisZ = this._axisZ;

  if (billboard) {    // the particles will always face the camera
    
    // compute a fake camera position : un-rotate the camera position by the current mesh rotation
    BABYLON.Matrix.RotationYawPitchRollToRef(this.mesh.rotation.y, this.mesh.rotation.x, this.mesh.rotation.z, this._rotMatrix);
    this._rotMatrix.invertToRef(this._invertedMatrix);
    BABYLON.Vector3.TransformCoordinatesToRef(this._camera.position, this._invertedMatrix, this._fakeCamPos);
    
    // set two orthogonal vectors (_cam_axisX and and _cam_axisY) to the cam-mesh axis (_cam_axisZ)
    (this._fakeCamPos).subtractToRef(this.mesh.position, this._cam_axisZ);
    BABYLON.Vector3.CrossToRef(this._cam_axisZ, this._axisX, this._cam_axisY);
    BABYLON.Vector3.CrossToRef(this._cam_axisZ, this._cam_axisY, this._cam_axisX);
    this._cam_axisY.normalize();
    this._cam_axisX.normalize();

    _cam_axisX = this._cam_axisX;
    _cam_axisY = this._cam_axisY;
    _cam_axisZ = this._cam_axisZ;
  }

  var system = this;
  var _rotMatrix = this._rotMatrix;
  var _rotated = this._rotated;
  var vertexPositionFunction = function(positions) {
    var idx, pt, sizeX, sizeY, sizeZ, nbPT; //  nbPT nb vertex per particle : 3 for triangle, 4 for quad, etc         
    var posPart;                            // nb positions per particle = 3 * nbPT
    var particle;
    
    // particle loop
    var index = 0;
    for (var p = 0; p < nb; p++) { 
      particle = particles[p];

      // particle rotation matrix
      if (billboard) {
        particle.rotation.x = 0.0;
        particle.rotation.y = 0.0;
      }
      BABYLON.Matrix.RotationYawPitchRollToRef(particle.rotation.y, particle.rotation.x, particle.rotation.z, _rotMatrix);

      nbPT = particle.shape.length;
      system.updateParticle(particle);   // call to custom user function to update the particle position
      for (pt = 0; pt < nbPT; pt++) {
        idx = index + pt * 3;

        BABYLON.Vector3.TransformCoordinatesToRef(particle.shape[pt], _rotMatrix, _rotated);

        sizeX = _rotated.x * particle.scale.x;
        sizeY = _rotated.y * particle.scale.y;
        sizeZ = _rotated.z * particle.scale.z;
        
        positions[idx]     = particle.position.x + _cam_axisX.x * sizeX + _cam_axisY.x * sizeY + _cam_axisZ.x * sizeZ;      
        positions[idx + 1] = particle.position.y + _cam_axisX.y * sizeX + _cam_axisY.y * sizeY + _cam_axisZ.y * sizeZ; 
        positions[idx + 2] = particle.position.z + _cam_axisX.z * sizeX + _cam_axisY.z * sizeY + _cam_axisZ.z * sizeZ; 
      }
      index = idx + 3;
    }

  };

this.mesh.updateMeshPositions(vertexPositionFunction, !this.mesh._areNormalsFrozen);
//this.mesh.refreshBoundingInfo();
};






// =======================================================================
// Particle behavior logic
// these following methods may be overwritten by the user to fit his needs


// init : set all particles first values and calls updateParticle to set them in space
// can be overwritten by the user
SolidParticleSystem.prototype.initParticles = function() {
  for (var p = 0; p < this.nb; p++) {
    this.particles[p].velocity = (new BABYLON.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5)).scaleInPlace(2);
    this.particles[p].scale = (new BABYLON.Vector3(1, 1, 0)).scaleInPlace(Math.random() * this.size + 0.1);
    this.updateParticle(this.particles[p]);
  }
};



// recycle a particle : can by overwritten by the user
SolidParticleSystem.prototype.recycleParticle = function(particle) {
  particle.position = BABYLON.Vector3.Zero();  
  particle.velocity = (new BABYLON.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5)).scaleInPlace(2);
  particle.scale = (new BABYLON.Vector3(1, 1, 0)).scaleInPlace(Math.random() * this.size + 1);
};


// update a particle : can be overwritten by the user
// will be called on each particle by setParticles() :
// ex : just set a particle position or velocity and recycle conditions
SolidParticleSystem.prototype.updateParticle = function(particle) {
  if (particle.position.y < 0) {
    this.recycleParticle(particle);
  }
  particle.velocity.y -= 0.01;                            // apply gravity to y : -0.01
  (particle.position).addInPlace(particle.velocity);      //set particle new position
  particle.position.y += 1.5;
  var sign = (particle.idx % 2 == 0) ? 1 : -1;
  particle.rotation.z += 0.1 * sign;
};