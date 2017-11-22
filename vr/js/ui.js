ui_init();

function ui_init(){
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

}
