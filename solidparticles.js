"use strict";

// Scene

var createScene = function(canvas, engine) {
  var scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3( .1, .2, .4);
  var camera = new BABYLON.ArcRotateCamera("camera1",  0, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
  camera.setPosition(new BABYLON.Vector3(0, 100, -200));
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


  // Particle system
  var nb = 500;
  var size = 6;
  var PS = new SolidParticleSystem('SPS', scene);
  PS.addTriangles(500, 1);
  PS.addQuads(500, 2);
  var mesh = PS.buildMesh();
  mesh.material = mat;
  mesh.freezeWorldMatrix();
  //mesh.freezeNormals();

  //mesh.position.x = 80;

  //mesh.getBoundingInfo()._update(BABYLON.Matrix.Scaling(new BABYLON.Vector3(300, 300, 300)));

  PS.initParticles();

  //scene.debugLayer.show();
  // animation
  scene.registerBeforeRender(function() {
    PS.setParticles(true);
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

