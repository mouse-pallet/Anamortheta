
function AnamorClass(boneGeometry,video){//コンストラクタ
    this.video=video;
    // this.geometry = new THREE.Geometry();
    this.geometry =boneGeometry;
    this.videoTexture = new THREE.Texture(video);
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;
    this.videoTexture.format = THREE.RGBFormat;
}

//頂点データと面データがすでに備わっているgeometryをもらって、video貼り付けて返す
AnamorClass.prototype.mappingVideo = function(){
    console.log("mappingVideo");
     this.geometry.materials = [
                new THREE.MeshPhongMaterial({
                    color: 0xffffff, specular: 0xffffff, shininess:50,
                    ambient: 0xffffff, side: THREE.DoubleSide, map: this.videoTexture }),
                new THREE.MeshPhongMaterial({
                    color: 0xcccccc, specular: 0x888888, shininess:50,
                    ambient: 0xcccccc, side: THREE.DoubleSide, map: this.videoTexture })];


      // // (5-6)メッシュの作成
      var mesh = new THREE.Mesh(this.geometry, new THREE.MeshFaceMaterial());
      mesh.rotation.z=Math.PI;
      return mesh;

}


//videoがちゃんとデータが十分あるかを調べる
AnamorClass.prototype.videoStatus = function(){
	return this.video.readyState === this.video.HAVE_ENOUGH_DATA;
}

//videoの更新
AnamorClass.prototype.reloadTexture = function(){
	if(this.videoTexture) this.videoTexture.needsUpdate = true;
}

//videoの更新
AnamorClass.prototype.changeTexture = function(){
    this.geometry.materials[0].map = new THREE.ImageUtils.loadTexture("img/testCat.jpg");
}
//videoの更新
AnamorClass.prototype.changeVideo = function(){
    this.geometry.materials[0].map = this.videoTexture;
}

// AnamorClass.prototype.changeWithRadian = function(radian){
//     console.log("ChangeTexture");

//     var degree = radian*180/Math.PI;
//     if(247.5 < degree && degree < 292.5){

//         this.geometry.materials[0].map = this.videoTexture;

//     }else if(0 < degree && degree >22.5 && 337.5 < degree && degree < 360){
//         this.geometry.materials[0].map = imgDic[0];

//     }else if( 22.5 < degree && degree < 67.5){
//         this.geometry.materials[0].map = imgDic[45];
//     }else if( 67.5 < degree && degree < 112.5){
//         this.geometry.materials[0].map = imgDic[90];
//     }else if( 112.5 < degree && degree < 157.5){
//         this.geometry.materials[0].map = imgDic[135];
//     }else if( 157.5 < degree && degree < 202.5){
//         this.geometry.materials[0].map = imgDic[180];
//     }else if( 202.5 < degree && degree < 247.5){
//         this.geometry.materials[0].map = imgDic[225];
//     }else if( 292.5 < degree && degree < 337.5){
//         this.geometry.materials[0].map = imgDic[315];
//     }
// }




