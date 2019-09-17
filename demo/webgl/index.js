/**
 * Created by duocai on 2016/10/27.
 */
var canvas;
var gl;
function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    //init webGL context, although we always do the same thing,
    //I don't think it's a good idea to package these operation in one single function
    // Get the rendering context for WebGL
    gl = $webGL.getWebGL(canvas);
    // Initialize shaders
    $webGL.initShaders(gl);
    // Specify the color for clearing <canvas>
    gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //init animation
    $animation.init(gl);
    //init key event
    $keyEvent.init(gl,canvas);

    //init texture
    floorRes.texture = $webGL.initTextureBuffers(gl,floorRes,initDraw);
    boxRes.texture = $webGL.initTextureBuffers(gl,boxRes,initDraw);

    //init obj file
    initObjDrawer($webGL.objShader.program,initDraw);

    //init FBO
    // Initialize framebuffer object (FBO)
    fbo = $webGL.initFramebufferObject(gl);
}

/**
 * 首次绘制，需等待所有贴图都加载完
 * @param gl
 */
function initDraw(gl) {
    var ready = true;
    for (var i = 0; i < SceneObjectList.length; i++)
        if (!SceneObjectList[i].ready)
            ready = false;
    if(floorRes.ready && boxRes.ready && ready){
        repaint(gl);
        $animation.startBirdFly(gl);
    }
}

/**
 * 重回场景
 * @param gl
 */
function repaint(gl) {
    //debug message
    showMessage();

    drawShadowMap(gl,$webGL.shadowShader.program);

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    onDrawTexture(gl,floorRes);
    onDrawTexture(gl,boxRes);

    renderObjScene();
}

function showMessage() {
    var eye = CameraPara.eye;
    var at = CameraPara.at;
    document.getElementById("messageBox").innerHTML
        = "eye:" + Math.round(eye[0]) + "," + Math.round(eye[1]) + "," + Math.round(eye[2]) + "<br>"
          + "at:" + Math.round(at[0]) + "," + Math.round(at[1]) + "," + Math.round(at[2]);
}
/**
 * 绘制贴图场景
 * @param gl
 * @param ob
 */
function onDrawTexture(gl,ob) {
    gl.useProgram(gl.program);

    //是否加点光源
    checkPointLight(gl,gl.program);

    //init normals
    $webGL.initArrayBuffer(gl,gl.program,gl.program.a_Normal,new Float32Array(ob.normals),3);

    //init floor vertex buffer
    var vertices = [];
    var len = ob.vertex.length/3;
    for (var i = 0; i < len; i++){
        for (var j = 0; j < 3; j++) {
            vertices.push(ob.vertex[3*i + j]);
        }
        for (var j = 0; j < 2; j++) {
            vertices.push(ob.texCoord[2*i + j]);
        }
    }
    //初始化顶点
    var n = $webGL.initVertexTexBuffers(gl,gl.program,vertices,ob.index);
    //初始化变换矩阵
    $webGL.initMvpMatrix(gl,CameraPara,ob);
    //normal matrix
    var normalMatrix = new Matrix4(); // Transformation matrix for normals
    normalMatrix.setInverseOf(ob.modelMatrix);
    normalMatrix.transpose();
    // Pass the transformation matrix for normals to u_NormalMatrix
    gl.uniformMatrix4fv(gl.program.u_NormalMatrix, false, normalMatrix.elements);

    //bind shadow map to texture 1
    gl.activeTexture(gl.TEXTURE1); // Set a texture object to the texture unit
    gl.uniform1i(gl.program.u_ShadowMap, 1);  // Pass 1 because gl.TEXTURE1 is enabled
    gl.uniformMatrix4fv(gl.program.u_MvpMatrixFromLight, false, ob.mvpMatrixFromLight.elements);

    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, ob.texture);

    // Draw the cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

/**
 * 增加贴图点光源照射。
 * @param gl
 * @param program
 */
function checkPointLight(gl,program) {
    //如果开启点光源
    if ($animation.PointLightOn) {
        //点光源位置
        gl.uniform3f(program.u_LightPosition,
            CameraPara.eye[0],CameraPara.eye[1],CameraPara.eye[2]);
        //点光源颜色
        gl.uniform3f(program.u_LightColor,
            0.1, 0.1, 0.1);
    }
    else {
        //点光源位置
        gl.uniform3f(program.u_LightPosition,
            CameraPara.eye[0],CameraPara.eye[1],CameraPara.eye[2]);
        //点光源颜色,为空
        gl.uniform3f(program.u_LightColor,
            0.0, 0.0, 0.0);
    }
}