"use strict";

// Particle system

var SolidParticleSystem = function(nb, size, scene) {
  var positions = [];
  var indices = [];
  var normals = [];
  var uvs = [];
  var particles = [];
  var half = size / 2;


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
    model.builder(index, model.shape, positions, indices, uvs);
    particles.push( {
      idx: p, 
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

  var mesh = new BABYLON.Mesh("mesh", scene);
  vertexData.applyToMesh(mesh, true);

  
  this.size = size;
  this.nb = nb;
  this.particles = particles;
  this.vel = 0.0;
  this.mesh = mesh;
  this.camAxisZ = BABYLON.Vector3.Zero();
  this.camAxisY = BABYLON.Vector3.Zero();
  this.camAxisX = BABYLON.Vector3.Zero();
  this.axisX = BABYLON.Axis.X;
  this.axisY = BABYLON.Axis.Y;
  this.axisZ = BABYLON.Axis.Z;
  this.camera = scene.activeCamera;
  this.fakeCamPos = BABYLON.Vector3.Zero();
  this.rotMatrix = new BABYLON.Matrix();
  this.invertedMatrix = new BABYLON.Matrix();
  this.rotated = BABYLON.Vector3.Zero();



  // reset a particle to its original model
  var resetParticle = function(particle) {
    // reset particle at initial position
    var idx, pt;
    var nbPT = particle.shape.length;             // nb vertex per particle : 3 for triangle, 4 for quad, etc
    var index = 0;
    for (pt = 0; pt < nbPT; pt++) {
      idx = index + pt * 3;
      positions[idx] = particle.shape[pt].x;      
      positions[idx + 1] = particle.shape[pt].y;
      positions[idx + 2] = particle.shape[pt].z;
    }
    index = idx + 3;
  };

  this.resetParticle = resetParticle;
};






// animate all the particles
SolidParticleSystem.prototype.setParticles = function(billboard) {

  var nb = this.nb;
  var particles = this.particles;
  //var model = this.model;
  var camAxisX = this.axisX;
  var camAxisY = this.axisY;
  var camAxisZ = this.axisZ;

  if (billboard) {    // the particles will always face the camera
    
    // compute a fake camera position : un-rotate the camera position by the current mesh rotation
    BABYLON.Matrix.RotationYawPitchRollToRef(this.mesh.rotation.y, this.mesh.rotation.x, this.mesh.rotation.z, this.rotMatrix);
    this.rotMatrix.invertToRef(this.invertedMatrix);
    BABYLON.Vector3.TransformCoordinatesToRef(this.camera.position, this.invertedMatrix, this.fakeCamPos);
    
    // set two orthogonal vectors (camAxisX and and camAxisY) to the cam-mesh axis (camAxisZ)
    (this.fakeCamPos).subtractToRef(this.mesh.position, this.camAxisZ);
    BABYLON.Vector3.CrossToRef(this.camAxisZ, this.axisX, this.camAxisY);
    BABYLON.Vector3.CrossToRef(this.camAxisZ, this.camAxisY, this.camAxisX);
    this.camAxisY.normalize();
    this.camAxisX.normalize();

    camAxisX = this.camAxisX;
    camAxisY = this.camAxisY;
    camAxisZ = this.camAxisZ;
  }

  var system = this;
  var rotMatrix = this.rotMatrix;
  var rotated = this.rotated;
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
      BABYLON.Matrix.RotationYawPitchRollToRef(particle.rotation.y, particle.rotation.x, particle.rotation.z, rotMatrix);

      nbPT = particle.shape.length;
      system.updateParticle(particle);   // call to custom user function to update the particle position
      for (pt = 0; pt < nbPT; pt++) {
        idx = index + pt * 3;

        BABYLON.Vector3.TransformCoordinatesToRef(particle.shape[pt], rotMatrix, rotated);

        sizeX = rotated.x * particle.scale.x;
        sizeY = rotated.y * particle.scale.y;
        sizeZ = rotated.z * particle.scale.z;
        
        positions[idx]     = particle.position.x + camAxisX.x * sizeX + camAxisY.x * sizeY + camAxisZ.x * sizeZ;      
        positions[idx + 1] = particle.position.y + camAxisX.y * sizeX + camAxisY.y * sizeY + camAxisZ.y * sizeZ; 
        positions[idx + 2] = particle.position.z + camAxisX.z * sizeX + camAxisY.z * sizeY + camAxisZ.z * sizeZ; 
      }
      index = idx + 3;
    }

  };
 
this.mesh.updateMeshPositions(vertexPositionFunction, false);
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
  this.resetParticle(particle);
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