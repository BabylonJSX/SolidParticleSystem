"use strict";

// Scene

var createScene = function(canvas, engine) {
  var scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3( .1, .2, .4);
  var camera = new BABYLON.ArcRotateCamera("camera1",  0, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
  camera.setPosition(new BABYLON.Vector3(0, 100, -500));
  camera.attachControl(canvas, true);
  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
  light.intensity = 0.9;
  var pl = new BABYLON.PointLight("pl", new BABYLON.Vector3(0, 0, 0), scene);
  pl.diffuse = new BABYLON.Color3(1, 1, 1);
  pl.specular = new BABYLON.Color3(0.8, 0.7, 0);
  pl.intensity = 0.95;


  var url = "http://jerome.bousquie.fr/BJS/images/sc-snowflakes1.png";
  var mat = new BABYLON.StandardMaterial("mat1", scene);
  //mat.backFaceCulling = false;
  //mat.wireframe = true;
  var texture = new BABYLON.Texture(url, scene);
  //mat.diffuseTexture = texture;
  //mat.diffuseTexture.hasAlpha = true;
  //mat.useSpecularOverAlpha = false;
  //mat.useAlphaFromDiffuseTexture = true;
  mat.alpha = 0.9;
  mat.diffuseColor = BABYLON.Color3.Red();

  // ground and boxes
  var ground = BABYLON.Mesh.CreateGround("gd", 100, 100, 4, scene);
  ground.material = new BABYLON.StandardMaterial("groundMat", scene);
  ground.material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  var box1 = BABYLON.Mesh.CreateBox("box1", 10, scene);
  var box2  = BABYLON.Mesh.CreateBox("box2", 10, scene);
  box1.position = new BABYLON.Vector3(15, 5, 7);
  box2.position = new BABYLON.Vector3(-15, 5, -5);
  var boxmat = new BABYLON.StandardMaterial("boxmat", scene);
  boxmat.diffuseColor = new BABYLON.Color3(1, 0.8, 0.8);
  boxmat.alpha = 0.5;
  box2.material = boxmat;
  ground.freezeWorldMatrix();
  box1.freezeWorldMatrix();
  box2.freezeWorldMatrix();

  // Particle system
  var speed = 1;
  var gravity = -0.01;
  var PS = new SolidParticleSystem('SPS', scene);
  PS.addCubes(5, 2);
  var mesh = PS.buildMesh();
  //mesh.material = mat;
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
    particle.color = new BABYLON.Vector4(Math.random(), Math.random(), Math.random(), Math.random());
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

  //scene.debugLayer.show();
  // animation
  scene.registerBeforeRender(function() {
    PS.setParticles(false);
    pl.position = camera.position;
  });

  return scene;
};



var init = function() {
  var canvas = document.querySelector('#renderCanvas');
  var engine = new BABYLON.Engine(canvas, true);
  var scene = createScene(canvas, engine);
  window.addEventListener("resize", function() {
    engine.resize();
  });

  engine.runRenderLoop(function(){
    scene.render();
  });
};

