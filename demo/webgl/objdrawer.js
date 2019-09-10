/**
 * Created by duocai on 2016/12/13.
 */
// DepthBuffer.js (c) 2012 matsuda
// Vertex shader program
//shaders program
var light2Program;
var SceneObjectList = [];

var SceneObject = function() {
    this.model;  	 //a model contains some vertex buffer
    this.filePath;   //obj file path
    this.objDoc;
    this.drawingInfo;
    this.transform;
    this.modelMatrix = null;
    this.valid = 0;
};

function renderObjScene(){
    var viewMatrix = new Matrix4();  // View matrix
    var projMatrix = new Matrix4();  // Projection matrix
    var mvpMatrix = new Matrix4();   // Model view projection matrix
    var normalMatrix = new Matrix4();

    viewMatrix.setLookAt(CameraPara.eye[0],CameraPara.eye[1],CameraPara.eye[2],
        CameraPara.at[0],CameraPara.at[1],CameraPara.at[2],
        CameraPara.up[0],CameraPara.up[1],CameraPara.up[2]
    );

    projMatrix.setPerspective(CameraPara.fov, canvas.width/canvas.height, CameraPara.near, CameraPara.far);

    gl.useProgram(light2Program);

    gl.activeTexture(gl.TEXTURE1); // Set a texture object to the texture unit
    gl.uniform1i(light2Program.u_ShadowMap, 1);  // Pass 1 because gl.TEXTURE1 is enabled

    //平行光方向
    gl.uniform3f(light2Program.u_DirectionLight,
        sceneDirectionLight[0], sceneDirectionLight[1], sceneDirectionLight[2]);
    // Set the ambient light
    gl.uniform3f(light2Program.u_AmbientLight,
        sceneAmbientLight[0], sceneAmbientLight[1], sceneAmbientLight[2]);

    //如果开启点光源
    if ($animation.PointLightOn) {
        //点光源位置
        gl.uniform3f(light2Program.u_LightPosition,
            CameraPara.eye[0],CameraPara.eye[1],CameraPara.eye[2]);
        //点光源颜色
        gl.uniform3f(light2Program.u_LightColor,
            scenePointLightColor[0], scenePointLightColor[1], scenePointLightColor[2]);
    }
    else {
        //点光源位置
        gl.uniform3f(light2Program.u_LightPosition,
            CameraPara.eye[0],CameraPara.eye[1],CameraPara.eye[2]);
        //点光源颜色,为空
        gl.uniform3f(light2Program.u_LightColor,
            0.0, 0.0, 0.0);
    }

    for(var i=0;i