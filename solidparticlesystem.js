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
    particles.push( {idx: p, position: new BABYLON.Vector3.Zero(), velocity: new BABYLON.Vector3.Zero()} );
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
  this.camera = scene.activeCamera;



  var quadRecycleFunction = function(particle) {
    // reset particle at initial position
    var idx, pt;
    var nbPt = 4;                         // nb vertex per particle : 3 for triangle, 4 for quad, etc
    var posPart = nbPt * 3;               // nb positions per particle
    for (pt = 0; pt < nbPt; pt++) {
      idx = particle.idx * posPart + pt * 3;
      positions[idx] = quad[pt].x;      
      positions[idx + 1] = quad[pt].y;
      positions[idx + 2] = quad[pt].z;
    }
  };

  //this.positionFunction = quadPositionFunction;
  this.recycleFunction = quadRecycleFunction;
};


SolidParticleSystem.prototype.start = function(vel) {
  for (var p = 0; p < this.nb; p++) {
    this.particles[p].velocity = (new BABYLON.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5)).scaleInPlace(vel);
  }
  this.vel = vel;
  this.gravity = -0.01;
};



// animate all the particles
SolidParticleSystem.prototype.animate = function() {
  // set two orthogonal vectors to the cam-mesh axis
  (this.camera.position).subtractToRef(this.mesh.position, this.camAxisY);
  BABYLON.Vector3.CrossToRef(this.camAxisZ, this.axisX, this.camAxisY);
  BABYLON.Vector3.CrossToRef(this.camAxisZ, this.camAxisY, this.camAxisX);
  this.camAxisY.normalize();
  this.camAxisX.normalize();

  var nb = this.nb;
  var particles = this.particles;
  var model = this.model;
  var camAxisX = this.camAxisX;
  var camAxisY = this.camAxisY;
  var camAxisZ = this.camAxisZ;
  var system = this;
  var quadPositionFunction = function(positions) {
    var idx, pt;
    var nbPt = 4;                         // nb vertex per particle : 3 for triangle, 4 for quad, etc
    var posPart = nbPt * 3;               // nb positions per particle
    // particle loop
    for (var p = 0; p < nb; p++) { 
      system.updateParticle(particles[p]);   
      for (pt = 0; pt < nbPt; pt++) {
        idx = p * posPart + pt * 3;
        positions[idx]     = particles[p].position.x + camAxisX.x * model[pt].x + camAxisY.x * model[pt].y + camAxisZ.x * model[pt].z;      
        positions[idx + 1] = particles[p].position.y + camAxisX.y * model[pt].x + camAxisY.y * model[pt].y + camAxisZ.y * model[pt].z; 
        positions[idx + 2] = particles[p].position.z + camAxisX.z * model[pt].x + camAxisY.z * model[pt].y + camAxisZ.z * model[pt].z;  

      }
    }
  };

this.mesh.updateMeshPositions(quadPositionFunction);
};


// recycle a particle : can by overwritten by user
SolidParticleSystem.prototype.recycle = function(particle) {
  this.recycleFunction(particle);
  particle.position = BABYLON.Vector3.Zero();   // à changer en : mesh position
  particle.velocity = (new BABYLON.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5)).scaleInPlace(this.vel);
};


// update a particle : can be overwritten by user
// will be called on each particle :
// just set a particle position or velocity and recycle conditions
SolidParticleSystem.prototype.updateParticle = function(particle) {
  if (particle.position.y + this.size < 0) {
    //this.recycle(particle);
  }
  particle.velocity.y += this.gravity;              // increase y velocity by 1 + gravity
  (particle.position).addInPlace(particle.velocity);      //set particle new position
};