//////////////グローバル変数//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var renderer;
var scene;
var status;
var camera;
var meshlist=[];//メッシュの格納リスト
var Anamorlist = []; //objectの格納リスト
var rWidth=900;//rendererの横のサイズ
var rHeight=900;//rendererの縦のサイズ
var boneActor;//アナモルフォーズの骨(頂点と面だけのデータ)
var waitTime =1000; //監視インターバルタイム　waitTimeミリ秒ごとに、差分を送信
var nearestObjectKey = null; //タッチされた位置から最も小さい位置にあるオブジェクト
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//初期化処理
//setupメソッド(舞台作り)
// function setup(width,height) {
// (function () {
function setup(){
    console.log("setup");
    // (1)レンダラの初期化
    renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setSize(rWidth, rHeight);
    renderer.setClearColorHex(0x000000, 1);
    // document.body.appendChild(renderer.domElement);
    $("#render_canvas").append(renderer.domElement);

    // (2)シーンの作成
    scene = new THREE.Scene();

    // (3)カメラの作成
    camera = new THREE.PerspectiveCamera(15, rWidth / rHeight);
    camera.position = new THREE.Vector3(0, 0, 15);
    // camera.position = new THREE.Vector3(0, 0, 8);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);

    // (4)ライトの作成
    var ambient = new THREE.AmbientLight(0xffffff);//環境光
    scene.add(ambient);

    //(5)オブジェクトの生成
    boneActor = makeBone();

    // var geo = new THREE.CubeGeometry(0.03, 0.03, 0.03); // 立方体作成
    // meshR     = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: 0xaa0000}));
    // scene.add(meshR);


    // 位置の初期化
    preStatus = null;
    nowStatus = null;

    //stage準備OK
    console.log("Finish setting of renderer, scene, camera, and light.");
    console.log("Stage stand-by OK.");

};


function makeBone(){
    console.log("makeBone");
//アナモルフォーズの骨組みを作る(頂点データと面データ)
    var geometry = new THREE.Geometry();
    var uvs = [];
    var nullary = [];

    var bunkatu=100;//分割数

    var xx = [];
    var yy = [];

    for(var y = 0 ; y <=bunkatu ; y++) {
      for(var x = 0 ; x <= bunkatu ; x++) {

        // var sx = x / (bunkatu/2) - 1;
        // var sy = (y / (bunkatu/2) - 1) * 0.7;
        // var sz = Math.sin(x / 4 + y / 8) * 0.05;

        var r = (rHeight/2) / (bunkatu) *y;
        var r = 2/ (bunkatu) *y;
        var radian = x * Math.PI*2 / (bunkatu);
        var sx = r * Math.cos(radian);
        var sy = r * Math.sin(radian);
        var sz = 0;
        // console.log("( " +sx + ", " + sy + ")");

        // xx.push(sx);
        // yy.push(sy);
        geometry.vertices.push(new THREE.Vector3( sx, sy, sz));
        uvs.push(new THREE.UV(x / bunkatu, y / bunkatu));
      }
    }

    // (5-3)面データの作成
    for(var y = 0 ; y < bunkatu ; y++) {
      for(var x = 0 ; x < bunkatu ; x++) {
        var b = x + y * (bunkatu+1);
        var m = (x + y) & 1;
        if(nullary.indexOf(b)==-1 && nullary.indexOf(b+1)==-1 && nullary.indexOf(b+(bunkatu+1))==-1 && nullary.indexOf(b+(bunkatu+2))==-1){
            geometry.faces.push(
              new THREE.Face3(b + 0, b +  1, b + bunkatu+1, null, null, 0),
              new THREE.Face3(b + 1, b + bunkatu+2, b + bunkatu+1, null, null, 0));
            geometry.faceVertexUvs[0].push(
              [uvs[b + 0], uvs[b +  1], uvs[b + bunkatu+1]],
              [uvs[b + 1], uvs[b + bunkatu+2], uvs[b + bunkatu+1]]);
        }

      }
    }
    // (5-5)他のデータを自動計算
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
}

function DetectStatus(e){
    var touchList = e.touches;
    var nodeList = [{NO:01,LEN:0},{NO:12,LEN:0},{NO:02,LEN:0}];

    nodeList[0].LEN = Math.sqrt(Math.pow(touchList[0].pageX-touchList[1].pageX,2)
            + Math.pow(touchList[0].pageY-touchList[1].pageY,2));
    nodeList[0].NO = "01";

    nodeList[1].LEN = Math.sqrt(Math.pow(touchList[2].pageX-touchList[1].pageX,2)
        + Math.pow(touchList[2].pageY-touchList[1].pageY,2));
    nodeList[1].NO = "12";

    nodeList[2].LEN = Math.sqrt(Math.pow(touchList[0].pageX-touchList[2].pageX,2)
        + Math.pow(touchList[0].pageY-touchList[2].pageY,2));
    nodeList[2].NO = "02";

    nodeList.sort(function(a, b) {
        return (a.LEN < b.LEN) ? -1 : 1;
    });

    var longP;
    var semiLongP;
    var shortP;

    if(nodeList[2].NO==="01"){
        longP=touchList[2];
        if(nodeList[1].NO==="12"){
            semiLongP=touchList[0];
            shortP=touchList[1];
        }
        else if(nodeList[1].NO==="02"){
            semiLongP=touchList[1];
            shortP=touchList[0];
        }
    }
    else if(nodeList[2].NO==="12"){
        longP=touchList[0];
        if(nodeList[1].NO==="01"){
            semiLongP=touchList[2];
            shortP=touchList[1];
        }
        else if(nodeList[1].NO==="02"){
            semiLongP=touchList[1];
            shortP=touchList[2];
        }
    }
    else if(nodeList[2].NO==="02"){
        longP=touchList[1];
        if(nodeList[1].NO==="01"){
            semiLongP=touchList[2];
            shortP=touchList[0];
        }
        else if(nodeList[1].NO==="12"){
            semiLongP=touchList[0];
            shortP=touchList[2];
        }
    }

    var posX = (semiLongP.pageX + shortP.pageX) / 2;
    var posY = (semiLongP.pageY + shortP.pageY) / 2;

    var moveX = posX - renderer.domElement.offsetLeft;
    var moveY = posY - renderer.domElement.offsetTop;

    //中間点と、頂点のポイントの角度を取る
    var radian = Math.atan2(-(posY-longP.pageY), posX-longP.pageX)+Math.PI;
    var degree = radian*180/Math.PI;


    return { x : moveX, y : moveY, degree : degree, timeStamp : new Date()} ;  // status
}

function addActorAction(){
    var i=0;

    //タッチイベントをサポートしているか調べる
    //対応してなければクリック対応
    if(window.TouchEvent){
        console.log("タッチイベントに対応");
    } else {
        console.log("ERROR : タッチイベント未対応");
    }
        //Touch Event
        //移動
        renderer.domElement.addEventListener("touchstart", function(e){

            if(e.touches.length >= 3){

                if(nowStatus == null){
                    preStatus = DetectStatus(e);
                }else{
                    nowStatus = DetectStatus(e);
                }
            }

        });

        //回転
        renderer.domElement.addEventListener("touchmove", function(e){

            if(e.touches.length >= 3){
                nowStatus = DetectStatus(e);

                var radian = nowStatus.degree/180*Math.PI;
                meshlist[i].rotation.z = radian;

            }
        });
}


//オブジェクト、およびメッシュリストを追加する
function addActor(video){
    console.log("addActor");
    var anamor = new AnamorClass(boneActor,video);
    Anamorlist.push(anamor);
    var Mesh = anamor.mappingVideo();
    meshlist.push(Mesh);
    scene.add(Mesh);
    addActorAction();

    //render
    render();
}

//videoが十分なデータをもっているか
function howVideoState(){
    var flag=0;

    for(var n=0;n<Anamorlist.length;n++){
        if(!Anamorlist[n].videoStatus()){
            flag++;
        }
    }

    return flag==0;//すべてのvideoは十分な状態だったか？
}

//すべてのvideoデータを更新
function reloadVideo(){
    for(var n=0;n<Anamorlist.length;n++){
        Anamorlist[n].reloadTexture();
    }
}



//render メソッド
function render() {
    if(howVideoState()) {
        reloadVideo();
        renderer.render(scene, camera);
    }

    requestAnimationFrame(render);

}



