// Particle system
var ParticleSystem = function(nb, size, scene) {
  var positions = [];
  var indices = [];
  var normals = [];
  var uvs = [];
  // 2 triangles per particle
  for (var p = 0; p < nb; p ++) {
    positions.push(0.0, 0.0, 0.0);
    positions.push(size, 0.0, 0.0);
    positions.push(size, size, 0.0);
    positions.push(0.0, size, 0.0);
    indices.push(p * 4, p * 4 + 1, p * 4 + 2);
    indices.push(p * 4, p * 4 + 2, p * 4 + 3);
    uvs.push(0,1, 1,1, 1,0, 0,0);
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
  this.mesh = mesh;
  this.correction = BABYLON.Vector3.Zero();
  this.camAxisZ = BABYLON.Vector3.Zero();
  this.camAxisY = BABYLON.Vector3.Zero();
  this.camAxisX = BABYLON.Vector3.Zero();
  this.axisX = BABYLON.Axis.X;
  this.axisY = BABYLON.Axis.Y;
  this.rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(0.0, 0.0, 0.0);
  this.yaw = 0.0;
  this.pitch = 0.0;
};

ParticleSystem.prototype.start = function(vel) {
  var vcts = new Array(this.nb);
  var lifes = new Array(this.nb);
  for (var p = 0; p < this.nb; p++) {
    vcts[p] = (new BABYLON.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5)).scaleInPlace(vel);
  }
  this.vcts = vcts;
  this.vel = vel;
  this.gravity = -0.01;
};

ParticleSystem.prototype.animate = function(camera, positionFunction) {
  (camera.position).subtractToRef(this.mesh.position, this.camAxisY);
  this.camAxisY.normalize();
  BABYLON.Vector3.CrossToRef(this.camAxisZ, this.axisX, this.camAxisY);
  BABYLON.Vector3.CrossToRef(this.camAxisZ, this.camAxisY, this.camAxisX);

  /*
  var yaw = -Math.atan2(this.camAxis.z, this.camAxis.x) - Math.PI / 2;
  var len = Math.sqrt(this.camAxis.x * this.camAxis.x + this.camAxis.z * this.camAxis.z);
  var pitch = Math.atan2(this.camAxis.y, len);
  //BABYLON.Matrix.RotationYawPitchRollToRef(yaw, pitch, 0.0, this.rotationMatrix);
  this.correction.x = Math.cos(yaw);
  this.correction.y = Math.cos(pitch);
  this.correction.z = 0.0;
  */

  this.mesh.updateMeshPositions(positionFunction);
};