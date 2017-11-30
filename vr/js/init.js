var scene, camera, renderer, controls, stats;
var waterPlane;
var tree = [];
var boxSize = 5000;
var worldWidth = 64, worldDepth = 64;
var smoothinFactor = 150, boundaryHeight = 80;
var treeNumber = 80;
var cameraOffset = 5;
var planeWidth = 500, planeLength = 500;
var boundaryOffset = 10;
var waveCounter = 1;

aframe_init();

function aframe_init(){

  if (!Detector.webgl){
    alert("Your browser doesn't support webgl");
    return;
  }

  AFRAME.registerComponent('land', {
    init: function () {
        el = this.el;  // Entity.
        land_init(el);
    }
  });

  // AFRAME.registerComponent('sky', {
  //   init: function () {
  //       el = this.el;  // Entity.
  //       sky_init(el);
  //   }
  // });

  AFRAME.registerComponent('water', {
    init: function () {
        el = this.el;  // Entity.
        water_init(el);
    },
    tick: function(){
        wave(worldWidth, worldDepth, waveCounter);
        waveCounter += 0.1;
    }
  });


  AFRAME.registerComponent('directional_light', {
    init: function () {
        el = this.el;  // Entity.
        light_init(el);
    }
  });


  AFRAME.registerComponent('cursor-listener', {
    init: function () {
      var lastIndex = -1;
      var COLORS = ['red', 'green', 'blue'];
      var camera = document.querySelector("a-camera").getObject3D("camera");
      var camera_parent = document.querySelector('#camera');
      currentX = camera_parent.getAttribute("position").x;
      currentY = camera_parent.getAttribute("position").y;
      currentZ = camera_parent.getAttribute("position").z;
      this.el.addEventListener('mousedown', function (evt) {
        lastIndex = (lastIndex + 1) % COLORS.length;
        this.setAttribute('material', 'color', COLORS[lastIndex]);
        console.log("User moving");
        //console.log('I was clicked at: ', evt.detail.intersection.point);
        // document.querySelector('#move_animation').setAttribute('to', new_position.x + " " + new_position.y + " " + new_position.z);
        // document.querySelector('#camera').emit('move');
        var direction = camera.getWorldDirection();

        if (Math.abs(currentX + direction.x) >= (planeWidth/2 - boundaryOffset)){
          direction.x = 0;
        }
        if (Math.abs(currentZ + direction.z) >= (planeLength/2 - boundaryOffset)){
          direction.z = 0;
        }
        currentX += direction.x;
        currentY += direction.y;
        currentZ += direction.z;
        camera_parent.setAttribute("position", {
          x: currentX,
          y: currentY,
          z: currentZ
        })
      });
    }
  });



  AFRAME.registerComponent('nav-pointer', {
    init: function () {
      const el = this.el;
      // When hovering on the nav mesh, show a green cursor.
      el.addEventListener('mouseenter', () => {
        el.setAttribute('material', {color: 'green'});
      });
      el.addEventListener('mouseleave', () => {
        el.setAttribute('material', {color: 'crimson'})
      });

      // Refresh the raycaster after models load.
      el.sceneEl.addEventListener('object3dset', () => {
        this.el.components.raycaster.refreshObjects();
      });
    }
  });



  AFRAME.registerComponent('collider-check', {
      dependencies: ['raycaster'],
      init: function () {

          var myHeight = 2.0;
          var cam = this.el.object3D;

          this.el.addEventListener('raycaster-intersection', function (evt) {
              // I've got the camera here and the intersection, so I should be able to adjust camera to match terrain?

              //var dist = evt.detail.intersection.distance;

              // these values do not change :(
              // console.log(evt.detail.intersections[0].object.el.className)
              // console.log(document.querySelector('#camera').object3D.position);
              // console.log(evt.detail.intersections[0].object.el.className+" : "+evt.detail.intersections[0].point.y)
              currentY = evt.detail.intersections[0].point.y + cameraOffset;

              //console.log(cam.position.y, dist, evt.detail.intersection.point.y);

          });

      }
  });

  // when we move the camera, we drag the raycaster object with us - it's not attached to the camera so it won't rotate the ray
  AFRAME.registerComponent('moving', {
      schema: { type: 'selector', default: '#theray'},
      init: function () {
          // this.data is the raycaster component
      },
      tick: function() {
          // camera
          var c = this.el.object3D.position;
          // set raycaster position to match camera - have shifted it over a bit so we can see it
          this.data.setAttribute('position', '' + (c.x) + ' ' + (c.y) + ' ' + (c.z - 2.0));
      }
  });
}

function land_init(el){

  var geometry = new THREE.PlaneGeometry( planeWidth, planeLength, worldWidth - 1, worldWidth - 1 );
  geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

  var loader = new THREE.TextureLoader();
  var grassTex = loader.load('/vr/img/grass.png', function(){
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.x = 16;
    grassTex.repeat.y = 16;
  });


  // var mountainMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe:false, side:THREE.DoubleSide, map:grassTex } );
  var mountainMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe:false, side:THREE.DoubleSide, map:grassTex } );

  mountain = new THREE.Mesh( geometry, mountainMaterial  );
  generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber);

  mountain.receiveShadow = true;
  mountain.castShadow = true;
  el.setObject3D('mesh', mountain);
}

function water_init(el){
  var worldWidth = 64, worldDepth = 64, worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;

  var geometry = new THREE.PlaneGeometry(boxSize, boxSize, worldWidth - 1, worldDepth - 1 );
  geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

  var loader = new THREE.TextureLoader();
  var texture = loader.load( "img/water.jpg" , function ( texture ) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 5, 5 );
  });
  waterPlane = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0x0055ff, wireframe:false, map:texture } ) );
  //waterPlane.castShadow = true;
  waterPlane.receiveShadow = true;
  el.setObject3D('mesh', waterPlane);
}

// function sky_init(el){
//   var skyGeometry = new THREE.BoxGeometry( boxSize, boxSize, boxSize );
//
//
//   var imagePrefix = "img/";
//   var imageSuffix = ".png";
//   var materialArray = [];
//
//   var materialArray = [
//
//                   new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/newSky/px.jpg' ) ,side: THREE.BackSide } ), // right
//                   new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/newSky/nx.jpg' ) ,side: THREE.BackSide } ), // left
//                   new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/newSky/py.jpg' ) ,side: THREE.BackSide } ), // top
//                   new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/newSky/ny.jpg' ) ,side: THREE.BackSide } ), // bottom
//                   new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/newSky/pz.jpg' ) ,side: THREE.BackSide } ), // back
//                   new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/newSky/nz.jpg' ) ,side: THREE.BackSide } )  // front
//
//               ];
//
//   var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
//
//   var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
//   el.setObject3D('mesh', skyBox);
// }

function light_init(el){
  light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(500, 200, 500);

  light.castShadow = true;

  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  var d = 400;

  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;

  light.shadow.camera.far = 5000;

  el.setObject3D('light', light);


}



// $(document).ready(function(){
function old_init(){
    scene = new THREE.Scene();

    //////////
    //camera//
    //////////


    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 100000 );
    camera.position.set(0, 300, -500);
    ////////////
    //renderer//
    ////////////

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x000000, 1);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.autoClear = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

    document.body.appendChild( renderer.domElement );

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

    /////////
    //water//
    /////////


    ////////////
    //mountain//
    ////////////




    //////////
    //skybox//
    //////////





    /////////
    //light//
    /////////



    ///////
    //fog//
    ///////

    scene.fog = new THREE.Fog(0xffffff,0,boxSize*(3/4));



    ////////////
    //CONTROLS//
    ////////////

    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 0.1;
    controls.zoomSpeed = 2.2;
    controls.panSpeed = 0.2;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;

    controls.minDistance = 0.1;
    controls.maxDistance = boxSize/2;

    controls.keys = [ 16, 17, 18 ]; // [ rotateKey, zoomKey, panKey ]





    ///////////
    //animate//
    ///////////

    var waveCounter = 0;
    var render = function () {

        requestAnimationFrame( render );
        renderer.render(scene, camera);
        controls.update(); //for cameras

        stats.update();

        wave(worldWidth, worldDepth, waveCounter);
        waveCounter += 0.1;

    };

    render();
    window.addEventListener('resize', onWindowResize, false);
}


function buildTree() {
  var treeMaterial = [
    new THREE.MeshLambertMaterial({ color: 0x3d2817, wireframe:false }), // brown
    new THREE.MeshLambertMaterial({ color: 0x2d4c1e, wireframe:false }), // green
  ];

  var c0 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6, 1, true));
  c0.position.y = 6;
  var c1 = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 14, 8));
  c1.position.y = 18;
  var c2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 13, 8));
  c2.position.y = 25;
  var c3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 12, 8));
  c3.position.y = 32;

  var g = new THREE.Geometry();
  c0.updateMatrix();
  c1.updateMatrix();
  c2.updateMatrix();
  c3.updateMatrix();
  g.merge(c0.geometry, c0.matrix);
  g.merge(c1.geometry, c1.matrix);
  g.merge(c2.geometry, c2.matrix);
  g.merge(c3.geometry, c3.matrix);

  var b = c0.geometry.faces.length;
  for (var i = 0, l = g.faces.length; i < l; i++) {
    g.faces[i].materialIndex = i < b ? 0 : 1;
  }

  var m = new THREE.Mesh(g, treeMaterial);

  m.scale.x = m.scale.z = 3;
  m.scale.y = 5;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber){
    var terrainGeneration = new TerrainBuilder(worldWidth, worldWidth, worldWidth, smoothinFactor, boundaryHeight);
    var terrain = terrainGeneration.diamondSquare();

    mountain.geometry.verticesNeedUpdate = true;
    mountain.geometry.normalsNeedUpdate = true;

    var index = 0;
    for(var i = 0; i < worldWidth; i++) {
        for(var j = 0; j < worldWidth; j++) {
            mountain.geometry.vertices[index].y = terrain[i][j];
            index++;
        }
    }

    //build tree
    // if (tree != null){
    //     for (var i = 0 ; i <tree.length ; i++){
    //         scene.remove(tree[i]);
    //     }
    // }
    // el.removeObject3D('tree');
    var tree_entity = document.querySelector('#tree');

    var forest = new THREE.Group();
    for(var i = 0; i < treeNumber; i++) {

        tree[i] = buildTree();
        var randomPosition = Math.ceil(Math.random()*(worldWidth-1)*(worldWidth-1));
        tree[i].position.x = mountain.geometry.vertices[randomPosition].x;
        tree[i].position.y = mountain.geometry.vertices[randomPosition].y -1;
        tree[i].position.z = mountain.geometry.vertices[randomPosition].z;
        tree[i].scale.set(1,1,1);
        forest.add(tree[i]);

    }
    tree_entity.setObject3D('mesh', forest);

}


function wave(worldWidth, worldDepth, count){

    waterPlane.updateMatrix();
    var waveHeight = 10;

    waterPlane.geometry.verticesNeedUpdate = true;
    waterPlane.geometry.normalsNeedUpdate = true;

    for(var i = 0; i < worldWidth; i++) {

        for (var j = 0 ; j <worldDepth ; j++){
            waterPlane.geometry.vertices[i*worldWidth + j].y = ( Math.sin( ( i + count ) * 0.5 ) * waveHeight ) +( Math.sin( ( j + count ) * 0.5 ) * waveHeight );
        }

    }
}




function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
