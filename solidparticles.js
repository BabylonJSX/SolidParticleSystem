"use strict";

// Scene

var createScene = function(canvas, engine) {
  var scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3( .5, .5, .5);
  var camera = new BABYLON.ArcRotateCamera("camera1",  0, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
  camera.setPosition(new BABYLON.Vector3(0, 5, -10));
  camera.attachControl(canvas, true);
  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 0.5, 0), scene);
  light.intensity = 0.7;
  var pl = new BABYLON.PointLight("pl", new BABYLON.Vector3(0, 0, 0), scene);
  pl.diffuse = new BABYLON.Color3(1, 1, 1);
  pl.specular = new BABYLON.Color3(1, 0, 0);
  pl.intensity = 0.95;


  var mat = new BABYLON.StandardMaterial("mat1", scene);
  var texture = new BABYLON.Texture("/BJS/test/Tree.png", scene);
  mat.diffuseTexture = texture;
  mat.diffuseTexture.hasAlpha = true;

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
  var nb = 5;
  var size = 48;
  var PS = new ParticleSystem(nb, size, scene);
  PS.mesh.material = mat;

  PS.start(2);

  // positionFunction : defines the particle trajectory for this emitter
  var positionFunction = function(positions) {
    var idx;
    for (var p = 0; p < PS.nb; p++) {
      idx = p * 12;
      // if a given triangle vertex has y < 0 then reset this quad positions
      // quad vertex : [0,0] [1,0] [1,1] [0,1]
      if (positions[idx + 1] < 0.0) {
        positions[idx] = 0.0;             // vertex 0
        positions[idx + 1] = 0.0;
        positions[idx + 2] = 0.0;
        positions[idx + 3] = PS.size;     // vertex 1
        positions[idx + 4] = 0.0;
        positions[idx + 5] = 0.0;
        positions[idx + 6] = PS.size;     // vertex 2
        positions[idx + 7] = PS.size;
        positions[idx + 8] = 0.0;
        positions[idx + 9] = 0.0;         // vertex 3
        positions[idx + 10] = PS.size;
        positions[idx + 11] = 0.0;
        PS.vcts[p] = (new BABYLON.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5)).scaleInPlace(PS.vel);
      }
      // apply just gravity + velocity vector
      var nbPt = 4;                         // nb vertex per particle : 3 for triangle, 4 for quad, etc
      var posPart = nbPt * 3;               // nb positions per particle
      //for (var pt = 0; pt < nbPt; pt++) {
        //idx = p * posPart + pt * 3;

        PS.vcts[p].y += PS.gravity;       // increase velocity.y by gravity each frame

        positions[idx] += PS.vcts[p].x;
        positions[idx + 1] += PS.vcts[p].y + 1;
        positions[idx + 2] += PS.vcts[p].z;

        positions[idx + 3] += PS.vcts[p].x + PS.camAxisX.x * PS.size;





      //}
    }
  };

  //scene.debugLayer.show();
  // animation
  scene.registerBeforeRender(function() {
    PS.animate(camera, positionFunction);
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

