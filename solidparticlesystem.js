"use strict";

// Particle system

var SolidParticleSystem = function(nb, size, scene) {
  var positions = [];
  var indices = [];
  var normals = [];
  var uvs = [];
  var particles = [];

  var half = size / 2;
  var quad = [ 
    new BABYLON.Vector3(-half, -half, 0.0),
    new BABYLON.Vector3(half, -half, 0.0),
    new BABYLON.Vector3(half, half, 0.0),
    new BABYLON.Vector3(-half, half, 0.0),
  ];
  // quads : 2 triangles per particle
  for (var p = 0; p < nb; p ++) {
    positions.push(quad[0].x, quad[0].y, quad[0].z);
    positions.push(quad[1].x, quad[1].y, quad[1].z);
    positions.push(quad[2].x, quad[2].y, quad[2].z);
    positions.push(quad[3].x, quad[3].y, quad[3].z);
    indices.push(p * 4, p * 4 + 1, p * 4 + 2);
    indices.push(p * 4, p * 4 + 2, p * 4 + 3);
    uvs.push(0,1, 1,1, 1,0, 0,0);
    particles.push( {idx: p, nbPT: quad.length, position: BABYLON.Vector3.Zero(), scale: new BABYLON.Vector3(1 ,1, 1), velocity: BABYLON.Vector3.Zero()} );
  }
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  var vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;

  var mesh = new BABYLON.Mesh("mesh", scene);
  vertexData.applyToMesh(mesh, true);

  this.model = quad;
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



  // reset a particle to its original model
  var resetParticle = function(particle) {
    // reset particle at initial position
    var idx, pt;
    var nbPT = particle.nbPT;             // nb vertex per particle : 3 for triangle, 4 for quad, etc
    var posPart = nbPT * 3;               // nb positions per particle
    for (pt = 0; pt < nbPT; pt++) {
      idx = particle.idx * posPart + pt * 3;
      positions[idx] = quad[pt].x;      
      positions[idx + 1] = quad[pt].y;
      positions[idx + 2] = quad[pt].z;
    }
  };

  this.resetParticle = resetParticle;
};






// animate all the particles
SolidParticleSystem.prototype.setParticles = function(billboard) {

  var nb = this.nb;
  var particles = this.particles;
  var model = this.model;
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
  var vertexPositionFunction = function(positions) {
    var idx, pt, sizeX, sizeY, sizeZ, nbPT; //  nbPT nb vertex per particle : 3 for triangle, 4 for quad, etc         
    var posPart;                            // nb positions per particle = 3 * nbPT
    
    // particle loop
    for (var p = 0; p < nb; p++) { 
      nbPT = particles[p].nbPT;
      posPart = nbPT * 3
      system.updateParticle(particles[p]);   // call to custom user function to update the particle position
      for (pt = 0; pt < nbPT; pt++) {
        idx = p * posPart + pt * 3;

        sizeX = model[pt].x * particles[p].scale.x;
        sizeY = model[pt].y * particles[p].scale.y;
        sizeZ = model[pt].z * particles[p].scale.z;
        
        positions[idx]     = particles[p].position.x + camAxisX.x * sizeX + camAxisY.x * sizeY + camAxisZ.x * sizeZ;      
        positions[idx + 1] = particles[p].position.y + camAxisX.y * sizeX + camAxisY.y * sizeY + camAxisZ.y * sizeZ; 
        positions[idx + 2] = particles[p].position.z + camAxisX.z * sizeX + camAxisY.z * sizeY + camAxisZ.z * sizeZ;  
      }
    }

  };
 
this.mesh.updateMeshPositions(vertexPositionFunction);
//this.mesh.refreshBoundingInfo();
};






// =======================================================================
// Particle behavior logic
// these following methods may be overwritten by the user to fit his needs


// init : set all particles first values and calls updateParticle to set them in space
// can be overwritten by the user
SolidParticleSystem.prototype.initParticles = function() {
  for (var p = 0; p < this.nb; p++) {
    this.particles[p].velocity = (new BABYLON.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5));
    this.particles[p].scale = (new BABYLON.Vector3(1, 1, 0)).scaleInPlace(Math.random() * this.size + 0.1);
    this.updateParticle(this.particles[p]);
  }
  //this.setParticles(true);
};



// recycle a particle : can by overwritten by the user
SolidParticleSystem.prototype.recycleParticle = function(particle) {
  this.resetParticle(particle);
  particle.position = BABYLON.Vector3.Zero();  
  particle.velocity = (new BABYLON.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5));
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
  particle.position.y += 1;
};