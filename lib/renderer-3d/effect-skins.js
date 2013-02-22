var debug = require('debug')('renderer:3d:effect-skins')
  , settings = require('../settings')
  , Materials = require('./materials');

module.exports = {
  fire: FireSkin,
  ghost: GhostSkin,
  bomb: BombSkin
};

// Effects
//   - puckTrails[]
//   #update(world)

function FireSkin() {

  var container = new THREE.Object3D();
  var fireGeo = new THREE.BoxGeometry(100,100,100,1,1,1, { px: true, nx: true, py: true, ny: false, pz: true, nz: true });
  fireGeo.applyMatrix( new THREE.Matrix4().translate( new THREE.Vector3(0,50, 0)));
  var fireMesh = new THREE.Mesh(fireGeo, Materials.fire );
  container.add(fireMesh)

  //fire reflection
  //var fireMeshReflection = new THREE.Mesh(fireGeo, Materials.fireReflection );
  //container.add(fireMeshReflection)

  this.c1 = null;
  this.c2 = new THREE.Color(settings.data.fireColor2).getHSV();
  this.container = container;
  this.isActive = false;
}

FireSkin.prototype.attachToMesh = function( mesh ) {

  this.isActive = true;

  this.parentMesh = mesh

  this.container.position = mesh.position;

  //add as sibling to skinned mesh to solve scaling issues
  this.parentMesh.parent.add(this.container);

  this.c1 = new THREE.Color(settings.data.fireColor).getHSV();

  TweenMax.to(this.c1 ,0.35,{h:this.c2.h,s:this.c2.s,v:this.c2.v, yoyo:true, repeat:-1, onUpdate:function(){
    Materials.fire.color.setHSV(this.c1.h,this.c1.s,this.c1.v);
  }.bind(this),onRepeat:function(){
    //this._duration = Math.random()*0.2+0.35;
  }})

}

FireSkin.prototype.update = function(){
  if( !this.isActive ) return;

  this.parentMesh.geometry.computeBoundingBox();
  var bb = this.parentMesh.geometry.boundingBox.max;

  var parentWidth = this.parentMesh.scale.x*100;
  var parentWidthWithMargins = parentWidth+settings.data.unitSize

  this.container.scale.set(
    parentWidthWithMargins/100,
    (bb.y+settings.data.unitSize*.5)/100,
    (bb.z+settings.data.unitSize)/100
  )
}

FireSkin.prototype.detach = function() {
  this.isActive = false;
  if( this.container.parent) {
    this.container.parent.remove(this.container)
    TweenMax.killTweensOf(this.c1);
  }
}



function GhostSkin() {

  var ghostGeo = new THREE.CubeGeometry(settings.data.unitSize,settings.data.unitSize,settings.data.unitSize);
  ghostGeo.applyMatrix( new THREE.Matrix4().translate( new THREE.Vector3(0,settings.data.unitSize*.5, 0)));
  var ghostMesh = new THREE.Mesh(ghostGeo, Materials.ghost );
  this.isActive = false;
  this.mesh = ghostMesh
  Materials.ghost.opacity = 1;
}

GhostSkin.prototype.attachToMesh = function( mesh ) {

  this.isActive = true;

  this.parentMesh = mesh
  this.parentMesh.visible = false;

  this.mesh.position = mesh.position;

  //add as sibling to skinned mesh to solve scaling issues
  this.parentMesh.parent.add(this.mesh);

}

GhostSkin.prototype.update = function(){
  if( !this.isActive ) return;

  Materials.ghost.opacity *= 0.9;

  if( Materials.ghost.opacity < 0.01 ) Materials.ghost.opacity = 0.01

}

GhostSkin.prototype.detach = function() {
  this.isActive = false;

  if( this.mesh.parent) {
    this.mesh.parent.remove(this.mesh);
    this.parentMesh.visible = true;
  }
}



function BombSkin() {

  var bombGeo = new THREE.BoxGeometry(settings.data.unitSize,settings.data.unitSize,settings.data.unitSize,1,1,1, { px: true, nx: true, py: true, ny: false, pz: true, nz: true });
  bombGeo.applyMatrix( new THREE.Matrix4().translate( new THREE.Vector3(0,settings.data.unitSize*.5, 0)));
  var bombMesh = new THREE.Mesh(bombGeo, Materials.bomb );
  this.bombMesh = bombMesh;
  this.isActive = false;
}

BombSkin.prototype.attachToMesh = function( mesh ) {

  this.isActive = true;
  this.parentMesh = mesh
  this.bombMesh.position = mesh.position;

  TweenMax.killTweensOf(this.bombMesh.scale);
  TweenMax.killTweensOf(Materials.bomb);

  Materials.bomb.opacity = 0.8;

  //add as sibling to skinned mesh to solve scaling issues
  this.parentMesh.parent.add(this.bombMesh);

  this.bombMesh.scale.set(3,3,3);

  TweenMax.to(this.bombMesh.scale,1,{x:1,y:1,z:1, repeat:3});

}

BombSkin.prototype.update = function(){
  //if( !this.isActive ) return;

}

BombSkin.prototype.detach = function() {

  if( !this.isActive ) return;

  this.isActive = false;

  for (var i = 0; i < 20; i++) {
    var cube = new THREE.Mesh(new THREE.CubeGeometry( 100,100,100,1,1,1), Materials.bomb);
    var scale = Math.random()+0.5;
    cube.scale.set(scale,scale,scale);
    this.parentMesh.parent.add(cube);

    cube.position = this.parentMesh.position.clone();
    var newPosition = this.parentMesh.position.clone();
    newPosition.x += (Math.random()*1000)*((Math.random()>0.5)?-1:1);

    newPosition.z += (Math.random()*1000)*((Math.random()>0.5)?-1:1);
    newPosition.y += (Math.random()*300);

    TweenMax.to( cube.position,1, {x:newPosition.x,y:newPosition.y,z:newPosition.z, ease:Linear.easeNone, onCompleteScope:cube,onComplete:function(){
      this.parent.remove(this);
    }})

  };

  TweenMax.to( Materials.bomb,.7, {opacity:0, ease:Linear.easeNone})

  this.bombMesh.position = this.parentMesh.position.clone();

  TweenMax.to(this.bombMesh.scale,1.5,{x:15,y:15,z:15, ease: Linear.easeNone, onComplete:function(){
    if( this.bombMesh.parent) {
      this.bombMesh.parent.remove(this.bombMesh)
      TweenMax.killTweensOf(this.bombMesh.scale);
    }
  }.bind(this)});

}