"use strict";

// Scene

var createScene = function(canvas, engine) {
  var scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3( .1, .2, .4);
  var camera = new BABYLON.ArcRotateCamera("camera1",  0, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
  camera.setPosition(new BABYLON.Vector3(0, 50, -300));
  camera.attachControl(canvas, true);
  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
  light.intensity = 0.9;
  var pl = new BABYLON.PointLight("pl", new BABYLON.Vector3(0, 0, 0), scene);
  pl.diffuse = new BABYLON.Color3(1, 1, 1);
  pl.specular = new BABYLON.Color3(0.8, 0.7, 0);
  pl.intensity = 0.95;


  //var url = "http://jerome.bousquie.fr/BJS/images/sc-snowflakes1.png";
  var url = "https://upload.wikimedia.org/wikipedia/en/8/86/Einstein_tongue.jpg";
  var mat = new BABYLON.StandardMaterial("mat1", scene);
  //mat.backFaceCulling = false;
  //mat.wireframe = true;
  var texture = new BABYLON.Texture(url, scene);
  texture.vScale = 0.5;
  mat.diffuseTexture = texture;
  //mat.diffuseTexture.hasAlpha = true;
  //mat.useSpecularOverAlpha = false;
  //mat.useAlphaFromDiffuseTexture = true;
  //mat.alpha = 0.9;
  //mat.diffuseColor = BABYLON.Color3.Red();



  var knot = BABYLON.Mesh.CreateTorusKnot("knot", 2, 0.5, 32, 8, 2, 3, scene);
  var cyl = BABYLON.Mesh.CreateCylinder("cyl", 3, 2, 4, 6, 1, scene);
  var sphere = BABYLON.Mesh.CreateSphere("sphere", 8, 5, scene);
  var plane = BABYLON.Mesh.CreatePlane("plane", 10, scene);

  // Particle system
  var speed = 1;
  var gravity = -0.01;
  var PS = new SolidParticleSystem('SPS', scene);
  //PS.addTriangles(100, 20);
  //PS.addQuads(100, 20);
  //PS.addCubes(100, 20);
  //PS.addTetrahedrons(100, 20);
  //PS.addPolygons(100, 20, 6);
  //PS.addShape(knot, 100);
  //PS.addShape(cyl, 100);
  PS.addShape(plane, 100);
  var mesh = PS.buildMesh();

  knot.dispose();
  cyl.dispose();
  sphere.dispose();
  plane.dispose();

  mesh.material = mat;
  mesh.freezeWorldMatrix();
  mesh.freezeNormals();

  PS.billboard = true;


  // define a custom SPS behavior

  PS.initParticles = function() {
    // just recycle everything
    var fact = 100;
    for (var p = 0; p < this.nbParticles; p++) {
      //this.recycleParticle(this.particles[p]);
      var scale = Math.random() + 0.5;
      this.particles[p].position = new BABYLON.Vector3((Math.random() - 0.5) * fact, (Math.random() - 0.5) * fact, (Math.random() - 0.5) * fact);
      //this.particles[p].rotation = new BABYLON.Vector3(Math.random(), Math.random(), Math.random());
      //this.particles[p].color = new BABYLON.Color4(Math.random(), Math.random(), Math.random(), 1);
      //this.particles[p].uvs = [Math.random() * .5, Math.random() *.5, Math.random() * .5 + .5, Math.random() * .5 + .5];
    }
  };

  PS.recycleParticle = function(particle) {
    // set particle new velocity, scale and rotation
    particle.position.x = 0;
    particle.position.y = 0;
    particle.position.z = 0;
    particle.velocity.x = (Math.random() - 0.5) * speed;
    particle.velocity.y = Math.random() * speed;
    particle.velocity.z = (Math.random() - 0.5) * speed;
    var scale = Math.random() + 0.5;
    particle.scale.x = scale;
    particle.scale.y = scale;
    particle.scale.z = scale;
    particle.rotation.x = Math.random() * 0.1;
    particle.rotation.y = Math.random() * 0.1;
    particle.rotation.z = Math.random() * 0.1;
    particle.color.r = Math.random() * 0.6 + 0.5;
    particle.color.g = Math.random() * 0.6 + 0.5;
    particle.color.b = Math.random() * 0.6 + 0.5;
    //particle.color.a = Math.random() * 0.6 + 0.5;
  };

  PS.updateParticle = function(particle) {  
    //particle.uvs = [Math.random() * .5, Math.random() *.5, Math.random() * .5 + .5, Math.random() * .5 + .5];
    //particle.rotation.y += particle.position.x / 500;;
    //particle.rotation.z += particle.position.z / 500;
    /*
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
    */
  };


  // init all particle values
  PS.initParticles();


  //scene.debugLayer.show();
  // animation
  scene.registerBeforeRender(function() {
    PS.setParticles();
    pl.position = camera.position;
    //PS.mesh.rotation.y += 0.01;
    //PS.mesh.rotation.x += 0.01;
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

