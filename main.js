import * as THREE from 'three';
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


let intersects=[];

console.log(intersects.length,"Before first");

let camera, scene, renderer;
let particles;
const PARTICLE_SIZE=0.1;

let raycaster;

console.log(intersects.length,"first");

let pointer, INTERSECTED;
// console.log(intersects.length,"zero");



init();


function init() {

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.01, 40 );
    camera.position.set( 0,0,2 );
    scene.add( camera );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );
    controls.minDistance = 0.01;
    controls.maxDistance = 1000;
    const loader = new PCDLoader();
    loader.load( '/5.pcd', function ( points ) {

        points.geometry.center();  
        const geometry = points.geometry.rotateX(Math.PI);
        const positionAttribute = geometry.getAttribute('position');
        const positionArray = positionAttribute.array;

        const positions = positionArray;

        const geometry1 = new THREE.BufferGeometry();
        geometry1.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const colors = [];
        const sizes = [];

        for (let i = 0, l = positions.length / 3; i < l; i++) {
 
        const color = new THREE.Color();
        color.setHSL(0.01 + 0.9 * (i / l), 1.0, 0.5);
        color.toArray(colors, i * 3);

        sizes[i] = PARTICLE_SIZE * 1;
        }

        geometry1.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
        geometry1.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        // Create a ShaderMaterial
        const material = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            pointTexture: { value: new THREE.TextureLoader().load('/disc.png') },
            alphaTest: { value: 0.9 }
        },
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent
        });

        particles = new THREE.Points(geometry1, material);
        scene.add(particles);
        init2();
                

    } );

    function init2(){

        raycaster = new THREE.Raycaster();
        pointer = new THREE.Vector2();
        
        window.addEventListener( 'resize', onWindowResize );

        for (let i = 0, l = 3; i < l; i++){
            document.addEventListener( 'pointermove', onPointerMove );
        }

        animate();
    }

}

function onPointerMove( event ) {

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate(){

    requestAnimationFrame(animate);
    intersects=[];

    render();

}

function render() {
    // console.log(intersects.length,"first");

    const geometry = particles.geometry;
    const attributes = geometry.attributes;

    raycaster.setFromCamera( pointer, camera );
    
    intersects = raycaster.intersectObject( particles );

    console.log(intersects.length,"dsf");

    if ( intersects.length > 0 ) {

        if ( INTERSECTED != intersects[ 0 ].index ) {

            attributes.size.array[ INTERSECTED ] = 0.3   ;

            INTERSECTED = intersects[ 0 ].index;

            attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE * 1.5;

            attributes.size.needsUpdate = true;

        }

    } 
    else if ( INTERSECTED !== null ) {


        attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE;
        attributes.size.needsUpdate = true;
        INTERSECTED = null;

    }

    renderer.render( scene, camera );

}
