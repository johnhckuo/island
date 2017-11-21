var scene, camera, renderer, controls, stats;    
var waterPlane;
var tree = [];
var boxSize = 5000;
$(document).ready(function(){

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
    var worldWidth = 64, worldDepth = 64, worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;


    var geometry = new THREE.PlaneGeometry(boxSize, boxSize, worldWidth - 1, worldDepth - 1 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
    
    var texture = THREE.ImageUtils.loadTexture( "img/water.jpg" );
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 5, 5 );

    waterPlane = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0x0055ff, wireframe:false, map:texture } ) );
    //waterPlane.castShadow = true;
    waterPlane.receiveShadow = true;
    scene.add( waterPlane );

    ////////////
    //mountain//
    ////////////

    var worldWidth = 64;
    var smoothinFactor = 150, boundaryHeight = 80;
    var treeNumber = 80;

    var geometry = new THREE.PlaneGeometry( 500, 500, worldWidth - 1, worldWidth - 1 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    var grassTex = THREE.ImageUtils.loadTexture('img/grass.png');
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.x = 16;
    grassTex.repeat.y = 16;

    var mountainMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe:false, side:THREE.DoubleSide, map:grassTex } );
    mountain = new THREE.Mesh( geometry, mountainMaterial  );
    generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber);
    
    mountain.receiveShadow = true;
    mountain.castShadow = true;
    scene.add( mountain );


    //////////
    //skybox//
    //////////

    var skyGeometry = new THREE.BoxGeometry( boxSize, boxSize, boxSize );   
    
    
    var imagePrefix = "img/";
    var imageSuffix = ".png";
    var materialArray = [];

    var materialArray = [

                    new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/newSky/px.jpg' ) ,side: THREE.BackSide } ), // right
                    new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/newSky/nx.jpg' ) ,side: THREE.BackSide } ), // left
                    new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/newSky/py.jpg' ) ,side: THREE.BackSide } ), // top
                    new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/newSky/ny.jpg' ) ,side: THREE.BackSide } ), // bottom
                    new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/newSky/pz.jpg' ) ,side: THREE.BackSide } ), // back
                    new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/newSky/nz.jpg' ) ,side: THREE.BackSide } )  // front
                
                ]; 

    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add( skyBox );
    


    /////////
    //light//
    /////////

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 6.5 );
    directionalLight.position.set( 500, 200, 500 );
    directionalLight.castShadow = true;
    directionalLight.shadowMapWidth = 2048;
    directionalLight.shadowMapHeight = 2048;
    scene.add( directionalLight );

    ///////
    //fog//
    ///////

    scene.fog = new THREE.Fog(0xffffff,0,boxSize*(3/4));

    ////////
    //info//
    ////////

    info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '30px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.style.color = '#fff';
    info.style.fontWeight = 'bold';
    info.style.backgroundColor = 'transparent';
    info.style.zIndex = '1';
    info.style.fontFamily = 'Monospace';
    info.innerHTML = 'Island Generator Project by johnhckuo';
    document.body.appendChild( info );

    ////////
    //Stat//
    ////////

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '20px';
    stats.domElement.style.left = '20px';
    document.body.appendChild(stats.domElement);

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

    /////////
    //panel//
    /////////

    var gui = new dat.GUI({
        height : 5 * 32 - 1
    });

    var params = {
        TreeNumber: treeNumber,
        Smooth : smoothinFactor,
        Height : boundaryHeight,
        BasicMaterial : false,
        Wireframe : false
    };


    var button = { Regenerate:function(){ generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber); }};
    gui.add(button,'Regenerate');

    gui.add(params, 'TreeNumber').min(0).max(300).step(1).onFinishChange(function(){
        treeNumber = params.TreeNumber;
        generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber);
    });

    gui.add(params, 'Wireframe').onFinishChange(function(){
        
        if(params.Wireframe == true){
            waterPlane.material.wireframe = true;
            mountain.material.wireframe = true;
            for (var i = 0 ; i < tree.length ; i ++){
                tree[i].material = new THREE.MeshFaceMaterial([
                    new THREE.MeshBasicMaterial({ color: 0x3d2817, wireframe:params.Wireframe}), // brown
                    new THREE.MeshBasicMaterial({ color: 0x2d4c1e, wireframe:params.Wireframe}), // green
                ]);;
            }

        }
        else{
            waterPlane.material.wireframe = false;
            mountain.material.wireframe = false;
            for (var i = 0 ; i < tree.length ; i ++){
                tree[i].material = new THREE.MeshFaceMaterial([
                    new THREE.MeshLambertMaterial({ color: 0x3d2817, wireframe:params.Wireframe}), // brown
                    new THREE.MeshLambertMaterial({ color: 0x2d4c1e, wireframe:params.Wireframe}), // green
                ]);;
            }
        }
    });

    gui.add(params, 'BasicMaterial').onFinishChange(function(){
        
        if(params.BasicMaterial == true){
            waterPlane.material = new THREE.MeshBasicMaterial( { color: 0x2B65EC, wireframe:params.Wireframe } );
            mountain.material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe:params.Wireframe, side:THREE.DoubleSide } );
            waterPlane.receiveShadow = false;
            mountain.receiveShadow = false;
            mountain.castShadow = false;

            for (var i = 0 ; i < tree.length ; i ++){
                tree[i].material = new THREE.MeshFaceMaterial([
                    new THREE.MeshBasicMaterial({ color: 0x3d2817, wireframe:params.Wireframe}), // brown
                    new THREE.MeshBasicMaterial({ color: 0x2d4c1e, wireframe:params.Wireframe}), // green
                ]);;
            }
        }
        else{

            var texture = THREE.ImageUtils.loadTexture( "img/water.jpg" );
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set( 5, 5 );
            waterPlane.material = new THREE.MeshLambertMaterial( { color: 0x2B65EC, wireframe:params.Wireframe, map:texture } );

            var grassTex = THREE.ImageUtils.loadTexture('img/grass.png');
            grassTex.wrapS = THREE.RepeatWrapping;
            grassTex.wrapT = THREE.RepeatWrapping;
            grassTex.repeat.x = 16;
            grassTex.repeat.y = 16;
            mountain.material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe:params.Wireframe, side:THREE.DoubleSide, map:grassTex } );
            waterPlane.receiveShadow = true;
            mountain.receiveShadow = true;
            mountain.castShadow = true;

            for (var i = 0 ; i < tree.length ; i ++){
                tree[i].material = new THREE.MeshFaceMaterial([
                    new THREE.MeshLambertMaterial({ color: 0x3d2817, wireframe:params.Wireframe}), // brown
                    new THREE.MeshLambertMaterial({ color: 0x2d4c1e, wireframe:params.Wireframe}), // green
                ]);;
            }
        }
    });

    gui.add(params, 'Height').min(0).max(300).step(1).onFinishChange(function(){
        boundaryHeight = params.Height;
        generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber);
    });

    gui.add(params, 'Smooth').min(0).max(1000).step(1).onFinishChange(function(){
        smoothinFactor = params.Smooth;
        generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber);
    });




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
});


function buildTree() {
  var treeMaterial = new THREE.MeshFaceMaterial([
    new THREE.MeshLambertMaterial({ color: 0x3d2817, wireframe:false }), // brown
    new THREE.MeshLambertMaterial({ color: 0x2d4c1e, wireframe:false }), // green
  ]);

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
    if (tree != null){
        for (var i = 0 ; i <tree.length ; i++){
            scene.remove(tree[i]);
        }
    }



    for(var i = 0; i < treeNumber; i++) {
        tree[i] = buildTree();
        var randomPosition = Math.ceil(Math.random()*(worldWidth-1)*(worldWidth-1));
        tree[i].position.x = mountain.geometry.vertices[randomPosition].x;
        tree[i].position.y = mountain.geometry.vertices[randomPosition].y;
        tree[i].position.z = mountain.geometry.vertices[randomPosition].z;
        tree[i].scale.set(0.5,0.5,0.5)
        scene.add(tree[i])
 
        
    }
    
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
