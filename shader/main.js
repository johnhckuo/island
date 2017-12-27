var camera, scene, renderer;
var geometry, material, mesh;
var light_source = new THREE.Vector3(0.70707, 0.70707, 0.7);
var water_color = new THREE.Vector3(0.109, 0.419, 0.627);
var imgUrl = "https://raw.githubusercontent.com/jbouny/ocean/master/demo/assets/img";

var time = new THREE.Clock();
var width = 5000, height = 5000;
var land_depth = 800;
var land_frequency = 7;
var land_vertex = 64;

init();
animate();

function init() {

      // water plane test
    THREE.TextureLoader.prototype.crossOrigin = '';
    var loader = new THREE.TextureLoader();
    // var bumpTex = loader.load('http://res.cloudinary.com/johnhckuo/image/upload/v1513674522/waternormals_q9a5yi.jpg', function(texture){
    //   texture.wrapS = THREE.RepeatWrapping;
    //   texture.wrapT = THREE.RepeatWrapping;
    // });
    var grassTex = loader.load('../normal/img/grass.png', function(texture){
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });

  uniforms = {
    amplitude: {
      type: 'f', // a float
      value: 0
    },
    u_mouse:{
      type: "v2",
      value:new THREE.Vector2()
    },
    u_resolution:{
      type: "v2",
      value: new THREE.Vector2()
    },
    u_time:{
      type: "f",
      value:0
    },
    // bumpTexture:{
    //   type:"t",
    //   value:bumpTex
    // },
    alpha: 			{ type: "f", value: 0.0 },
    baseSpeed:  {type :"f", value:0.01},
    noiseScale:		{ type: "f", value: 1.0 },
    eye: {type:"f", value: new THREE.Vector3(0, 0, 0)},
    sunDirection: {type:"v3", value: light_source},
    water_sampler: {type:"t", value:null},
    depth:		{ type: "f", value: 1000.0 },


  };



  terrain_uniforms = {
    amplitude: {
      type: 'f', // a float
      value: 0
    },
    u_mouse:{
      type: "v2",
      value:new THREE.Vector2()
    },
    u_resolution:{
      type: "v2",
      value: new THREE.Vector2()
    },
    u_time:{
      type: "f",
      value:0
    },
    // bumpTexture:{
    //   type:"t",
    //   value:bumpTex
    // },
    depth:		{ type: "f", value: land_depth },
    frequency:		{ type: "f", value: land_frequency },
    land_vertex: {type:"f", value:land_vertex},
    sunDirection: {type:"v3", value: light_source},
    grassTexture:{type:"t", value: grassTex}



  };
  attributes = {
    displacement: {
      type: 'f', // a float
      value: [] // an empty array
    }
  };

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.x = -1000;
  camera.position.y = 700;
  camera.position.z = -1000;

  controls = new THREE.OrbitControls( camera );
  controls.update();

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000000 );
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerHeight;

  var plane_geometry = new THREE.PlaneBufferGeometry( width, height, 32 );

  var water_texture = new THREE.WebGLRenderTarget(width, height);
  uniforms.water_sampler.value = water_texture;

  var customMaterial = new THREE.ShaderMaterial(
    {
      uniforms: uniforms,
      //attributes:     attributes,
      vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent

    }
  );
  customMaterial.side = THREE.DoubleSide;
  surface = new THREE.Mesh( plane_geometry, customMaterial );
	surface.position.set(0,0,0);
  surface.rotation.x = Math.PI*0.5;
	scene.add( surface );

  //island
  var land_geometry = new THREE.PlaneGeometry( width/3, height/3, land_vertex, land_vertex );
  land_geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI /2  ) );

 //  // now populate the array of attributes
 //  var verts = land_geometry.attributes.position.array;
 //  var values = attributes.displacement.value;

 //  for (var v = 0; v < verts.length; v+=3) {
 //    values.push((Math.sin(verts[v]) + Math.cos(verts[v+1]))*50);
 //  }
 //  displacement = new Float32Array( attributes.displacement.value );
	// land_geometry.addAttribute( 'displacement', new THREE.BufferAttribute( displacement, 1 ) );

  var customMaterial = new THREE.ShaderMaterial(
    {
      uniforms: terrain_uniforms,
      // attributes:  attributes,
      vertexShader:   document.getElementById( 'islandVertex'   ).textContent,
      fragmentShader:   document.getElementById( 'islandFragment'   ).textContent
    }
  );
  customMaterial.side = THREE.DoubleSide;
  land = new THREE.Mesh( land_geometry, customMaterial );
  generateHeight(land_vertex, 1500, 100);
	land.position.set(0,0,0);
	scene.add( land );

  var axesHelper = buildAxes(500);
  scene.add( axesHelper );

    var skyGeometry = new THREE.BoxGeometry( width, width, width );
    THREE.TextureLoader.prototype.crossOrigin = '';
    var loader = new THREE.TextureLoader();
    var materialArray = [

                    new THREE.MeshBasicMaterial( { map: loader.load( imgUrl+'/px.jpg' ) ,side: THREE.DoubleSide } ), // right
                    new THREE.MeshBasicMaterial( { map: loader.load( imgUrl+'/nx.jpg' ) ,side: THREE.DoubleSide } ), // left
                    new THREE.MeshBasicMaterial( { map: loader.load( imgUrl+'/py.jpg' ) ,side: THREE.DoubleSide } ), // top
                    new THREE.MeshBasicMaterial( { map: loader.load( imgUrl+'/ny.jpg' ) ,side: THREE.DoubleSide } ), // bottom
                    new THREE.MeshBasicMaterial( { map: loader.load( imgUrl+'/pz.jpg' ) ,side: THREE.DoubleSide } ), // back
                    new THREE.MeshBasicMaterial( { map: loader.load( imgUrl+'/nz.jpg' ) ,side: THREE.DoubleSide } )  // front

                ];

  var skyMaterial = new THREE.MeshFaceMaterial( materialArray );

  var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
  scene.add( skyBox );

  //scene.fog = new THREE.Fog(0xffffff,0,width*(3/4));
    /////////
    //panel//
    /////////

    var gui = new dat.GUI({
        height : 5 * 32 - 1
    });

    var params = {
        Depth: land_depth,
        Frequency: land_frequency,
        Wireframe : false,
        LightX:light_source.x,
        LightY:light_source.y,
        LightZ:light_source.z
    };

    gui.add(params, 'Wireframe').onFinishChange(function(){
      land.material.wireframe = params.Wireframe;
      surface.material.wireframe = params.Wireframe;

    });

    gui.add(params, 'Depth').min(0).max(5000).step(1).onChange(function(){
        terrain_uniforms.depth.value = params.Depth;
    });


    gui.add(params, 'Frequency').min(0).max(50).step(0.5).onChange(function(){
        terrain_uniforms.frequency.value = params.Frequency;
    });

    gui.add(params, 'LightX').min(-100).max(100).step(1).onChange(function(){
        terrain_uniforms.sunDirection.value.x = params.LightX;
    });

    gui.add(params, 'LightY').min(-100).max(100).step(1).onChange(function(){
        terrain_uniforms.sunDirection.value.y = params.LightY;
    });

    gui.add(params, 'LightZ').min(-100).max(100).step(1).onChange(function(){
        terrain_uniforms.sunDirection.value.z = params.LightZ;
    });

  var meshMaterial = new THREE.MeshBasicMaterial({ color: 0xFF00FF, wireframe: true });
  var sphere = new THREE.Mesh( new THREE.SphereGeometry( 5 ), meshMaterial );
  sphere.position.set(light_source.x, light_source.y, light_source.z);
  scene.add( sphere );


  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);
  document.onmousemove = function(e){
    uniforms.u_mouse.value.x = e.pageX
    uniforms.u_mouse.value.y = e.pageY
  }
}

function animate() {
  var deltaTime = time.getDelta();
  var elapsedTime = time.getElapsedTime();

  requestAnimationFrame(animate);

  scene.updateMatrixWorld();
  var vector = camera.position.clone();
  vector.setFromMatrixPosition( camera.matrixWorld );
  uniforms.eye.value = vector;

  uniforms.u_time.value += deltaTime;
   // camera.rotation.y += deltaTime;

  uniforms.amplitude.value = Math.sin(elapsedTime);
  renderer.render(scene, camera);
  controls.update();

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerHeight;

}


function buildAxes( length ) {
        var axes = new THREE.Object3D();

        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

        return axes;

}

function buildAxis( src, dst, colorHex, dashed ) {
        var geom = new THREE.Geometry(),
            mat;

        if(dashed) {
                mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
        } else {
                mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
        }

        geom.vertices.push( src.clone() );
        geom.vertices.push( dst.clone() );
        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        var axis = new THREE.Line( geom, mat, THREE.LinePieces );

        return axis;

}


function generateHeight(worldWidth, smoothinFactor, boundaryHeight){
    var terrainGeneration = new TerrainBuilder(worldWidth, worldWidth, worldWidth, smoothinFactor, boundaryHeight);
    var terrain = terrainGeneration.diamondSquare();
    land.geometry.verticesNeedUpdate = true;
    land.geometry.normalsNeedUpdate = true;
    var index = 0;
    for(var i = 0; i < worldWidth; i++) {
        for(var j = 0; j < worldWidth; j++) {
            land.geometry.vertices[index].y = terrain[i][j];
            index++;
        }
    }

    // //build tree
    // if (tree != null){
    //     for (var i = 0 ; i <tree.length ; i++){
    //         scene.remove(tree[i]);
    //     }
    // }



    // for(var i = 0; i < treeNumber; i++) {
    //     tree[i] = buildTree();
    //     var randomPosition = Math.ceil(Math.random()*(worldWidth-1)*(worldWidth-1));
    //     tree[i].position.x = mountain.geometry.vertices[randomPosition].x;
    //     tree[i].position.y = mountain.geometry.vertices[randomPosition].y;
    //     tree[i].position.z = mountain.geometry.vertices[randomPosition].z;
    //     tree[i].scale.set(0.5,0.5,0.5)
    //     scene.add(tree[i])
 
        
    // }
    
}
