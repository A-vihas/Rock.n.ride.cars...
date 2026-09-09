import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8eb8d8);
scene.fog=new THREE.Fog(0x8eb8d8,130,420);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,900);
camera.position.set(0,7,16);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdcefff,0x334022,2.0));
const sun=new THREE.DirectionalLight(0xffffff,3.2); sun.position.set(-80,130,60); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-180;sun.shadow.camera.right=180;sun.shadow.camera.top=180;sun.shadow.camera.bottom=-180;scene.add(sun);

const mats={
 grass:new THREE.MeshStandardMaterial({color:0x476c38,roughness:1}),
 dirt:new THREE.MeshStandardMaterial({color:0x6f5133,roughness:1}),
 road:new THREE.MeshStandardMaterial({color:0x30343b,roughness:.9}),
 white:new THREE.MeshStandardMaterial({color:0xf2f4f7,roughness:.7}),
 dark:new THREE.MeshStandardMaterial({color:0x11151b,roughness:.8}),
 red:new THREE.MeshStandardMaterial({color:0xff4a3d,roughness:.45,metalness:.15}),
 yellow:new THREE.MeshStandardMaterial({color:0xffc83d,roughness:.5}),
 glass:new THREE.MeshStandardMaterial({color:0x152d42,roughness:.08,metalness:.55,transparent:true,opacity:.82})
};
const box=(x,y,z,mat,pos,rot=[0,0,0])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(x,y,z),mat);m.position.set(...pos);m.rotation.set(...rot);m.castShadow=m.receiveShadow=true;scene.add(m);return m};
const cyl=(r,h,mat,pos,seg=24)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat);m.position.set(...pos);m.castShadow=m.receiveShadow=true;scene.add(m);return m};

box(600,1,600,mats.grass,[0,-.8,0]);
const track=new THREE.Mesh(new THREE.RingGeometry(52,74,96),mats.dirt);track.rotation.x=-Math.PI/2;track.position.y=.01;track.receiveShadow=true;scene.add(track);
const inner=new THREE.Mesh(new THREE.CircleGeometry(51,96),mats.grass);inner.rotation.x=-Math.PI/2;inner.position.y=.02;inner.receiveShadow=true;scene.add(inner);
const road=new THREE.Mesh(new THREE.RingGeometry(58,69,96),mats.road);road.rotation.x=-Math.PI/2;road.position.y=.08;road.receiveShadow=true;scene.add(road);

// road stripes, deliberately curved/radial instead of a grid
for(let i=0;i<48;i++){const a=i*Math.PI*2/48;const r=63;box(1.1,.08,3.8,mats.white,[Math.cos(a)*r,.15,Math.sin(a)*r],[0,-a,0])}

// scenery rocks/trees
for(let i=0;i<85;i++){
 const a=Math.random()*Math.PI*2, r=88+Math.random()*120, x=Math.cos(a)*r,z=Math.sin(a)*r;
 if(Math.random()<.6){
  const trunk=cyl(.7,4,mats.dirt,[x,2,z],10); trunk.scale.setScalar(.7+Math.random());
  const crown=new THREE.Mesh(new THREE.ConeGeometry(3.5,8,8),mats.grass); crown.position.set(x,7,z); crown.castShadow=true;scene.add(crown);
 }else{
  const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(2+Math.random()*3,0),mats.dirt);rock.position.set(x,1.5,z);rock.scale.y=.65;rock.castShadow=true;scene.add(rock);
 }
}

// 15 physical ramps, distributed around the loop, with distinct sizes/angles
const ramps=[];
for(let i=0;i<15;i++){
 const a=i*Math.PI*2/15+.08, r=63, x=Math.cos(a)*r,z=Math.sin(a)*r;
 const len=9+(i%4)*1.5, width=6+(i%3), h=2.5+(i%5)*.45;
 const ramp=new THREE.Mesh(new THREE.BoxGeometry(width,h,len),mats.yellow);
 ramp.position.set(x,h/2+.12,z);
 ramp.rotation.set(0,-a+Math.PI/2,0);
 ramp.castShadow=ramp.receiveShadow=true;scene.add(ramp);
 // red side supports
 for(const s of [-1,1]){
  const support=new THREE.Mesh(new THREE.BoxGeometry(.45,h+.8,len*.92),mats.red);
  support.position.set(x+Math.cos(a+Math.PI/2)*s*(width/2+.25),h/2,z+Math.sin(a+Math.PI/2)*s*(width/2+.25));
  support.rotation.y=-a+Math.PI/2; support.castShadow=true;scene.add(support);
 }
 ramps.push({pos:new THREE.Vector3(x,0,z),r});
}

// car
const car=new THREE.Group();scene.add(car);
const body=box(3.0,.8,5.4,mats.red,[0,1.15,0]); body.parent=car; body.position.set(0,0,0);
const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.2,.85,2.1),mats.glass);cabin.position.set(0,.65,-.15);cabin.castShadow=true;car.add(cabin);
const hood=new THREE.Mesh(new THREE.BoxGeometry(2.6,.28,1.8),mats.red);hood.position.set(0,.35,1.7);hood.castShadow=true;car.add(hood);
const wing=new THREE.Mesh(new THREE.BoxGeometry(3.4,.16,.7),mats.dark);wing.position.set(0,.8,-2.45);car.add(wing);
for(const x of [-1.55,1.55])for(const z of [-1.75,1.75]){
 const w=new THREE.Mesh(new THREE.CylinderGeometry(.58,.58,.38,20),mats.dark);w.rotation.z=Math.PI/2;w.position.set(x,0,z);w.castShadow=true;car.add(w);
}
car.position.set(0,1,63);car.rotation.y=Math.PI;

const state={started:false,speed:0,heading:Math.PI,vy:0,air:0,rampCount:0,boost:0,cam:0};
const keys={};
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='c')state.cam=(state.cam+1)%3;if(e.key.toLowerCase()==='r')reset();});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
for(const b of document.querySelectorAll('[data-key]')){
 const k=b.dataset.key; const on=e=>{e.preventDefault();keys[k]=true}; const off=e=>{e.preventDefault();keys[k]=false};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);
}
document.querySelector('#startBtn').onclick=()=>{state.started=true;document.querySelector('#start').style.display='none'};

function reset(){car.position.set(0,1,63);state.speed=0;state.vy=0;state.heading=Math.PI;state.air=0}
function flash(t){const m=document.querySelector('#message');m.textContent=t;m.style.opacity=1;clearTimeout(flash.t);flash.t=setTimeout(()=>m.style.opacity=0,700)}

const clock=new THREE.Clock();let lastRamp=-1;
function loop(){
 requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.035);
 if(state.started){
  const gas=keys.w||keys.arrowup||keys.gas, brake=keys.s||keys.arrowdown||keys.brake, left=keys.a||keys.arrowleft||keys.left, right=keys.d||keys.arrowright||keys.right, boost=keys[' ']||keys.boost;
  if(gas)state.speed+=34*dt;else state.speed-=9*dt;
  if(brake)state.speed-=48*dt;
  if(boost&&state.speed>8)state.speed+=55*dt;
  state.speed=THREE.MathUtils.clamp(state.speed,-14,62);
  const steer=(left?-1:0)+(right?1:0);
  state.heading+=steer*dt*1.65*THREE.MathUtils.clamp(Math.abs(state.speed)/22,0,1)*Math.sign(state.speed||1);
  const forward=new THREE.Vector3(-Math.sin(state.heading),0,-Math.cos(state.heading));
  car.position.addScaledVector(forward,state.speed*dt);
  car.rotation.y=state.heading;

  // ramp detection and real jumps
  for(let i=0;i<ramps.length;i++){
   const rr=car.position.distanceTo(ramps[i].pos);
   if(rr<5.5 && Math.abs(state.speed)>18 && state.vy<=0.2 && lastRamp!==i){
    state.vy=12+Math.min(10,Math.abs(state.speed)*.15);state.air=0;state.rampCount=Math.min(15,state.rampCount+1);lastRamp=i;flash('RAMP JUMP +1');
   }
  }
  state.vy-=28*dt;car.position.y+=state.vy*dt;
  if(car.position.y>1.15)state.air+=dt;
  if(car.position.y<=1){car.position.y=1;state.vy=0;if(state.air>.25){flash('CLEAN LANDING');}state.air=0;lastRamp=-1}
  // keep the car on the world, not in a flat rectangular grid
  const d=Math.hypot(car.position.x,car.position.z);if(d>245){car.position.x*=.96;car.position.z*=.96;state.speed*=.7}

  document.querySelector('#speed').textContent=Math.round(Math.abs(state.speed)*3.6);
  document.querySelector('#air').textContent=state.air.toFixed(1);
  document.querySelector('#rampCount').textContent=state.rampCount;

  let target=new THREE.Vector3();
  if(state.cam===0){target.copy(car.position).addScaledVector(forward,-15);target.y+=7;camera.position.lerp(target,1-Math.pow(.001,dt));camera.lookAt(car.position.x,car.position.y+1,car.position.z)}
  else if(state.cam===1){target.copy(car.position);target.y+=20;camera.position.lerp(target,1-Math.pow(.001,dt));camera.lookAt(car.position)}
  else {target.copy(car.position).add(new THREE.Vector3(10,5,10));camera.position.lerp(target,1-Math.pow(.001,dt));camera.lookAt(car.position)}
 }
 renderer.render(scene,camera);
}
loop();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
