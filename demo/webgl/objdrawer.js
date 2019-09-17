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

    for(var i=0;i<SceneObjectList.length;i++){
        var so = SceneObjectList[i];
        if (so.objDoc != null && so.objDoc.isMTLComplete()){ // OBJ and all MTLs are available
            so.drawingInfo = onReadComplete(gl, so.model, so.objDoc);
            SceneObjectList[i].objname = so.objDoc.objects[0].name;
            so.objname = so.objDoc.objects[0].name;
            so.objDoc = null;
        }
        if (so.drawingInfo){
            mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(so.modelMatrix);
            gl.uniformMatrix4fv(light2Program.u_MvpMatrix, false, mvpMatrix.elements);

            gl.uniformMatrix4fv(light2Program.u_MvpMatrixFromLight, false, mvpMatrixFromLight_obj[i].elements);

            normalMatrix.setInverseOf(so.modelMatrix);
            normalMatrix.transpose();
            gl.uniformMatrix4fv(light2Program.u_NormalMatrix, false, normalMatrix.elements);

            //model matrix
            gl.uniformMatrix4fv(light2Program.u_ModelMatrix, false, so.modelMatrix.elements);

            initAttributeVariable(gl, light2Program.a_Position, so.model.vertexBuffer);  // Vertex coordinates
            initAttributeVariable(gl, light2Program.a_Normal, so.model.normalBuffer);    // Normal
            initAttributeVariable(gl, light2Program.a_Color, so.model.colorBuffer);// Texture coordinates

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, so.model.indexBuffer);
            // Draw
            gl.drawElements(gl.TRIANGLES, so.drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
        }
    }
}
// Assign the buffer objects and enable the assignment
function initAttributeVariable(gl, a_attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

function initObjDrawer(program,initDraw) {

    light2Program = program;

    for(var i =0; i<ObjectList.length; i++){
        var e = ObjectList[i];
        var so = new SceneObject();
        // Prepare empty buffer objects for vertex coordinates, colors, and normals
        so.model = initVertexBuffers(gl, light2Program);
        if (!so.model) {
            console.log('Failed to set the vertex information');
            so.valid = 0;
            continue;
        }
        so.valid = 1;
        so.kads= e.kads;
        so.transform = e.transform;
        var modelMatrix = new Matrix4();
        modelMatrix.setIdentity();
        //初始化物体变换矩阵
        for (var j = 0; j < so.transform.length; j++) {
            var trans = so.transform[j];
            switch (trans.type) {
                case 'translate': {
                    modelMatrix.translate(trans.content[0],trans.content[1],trans.content[2]);
                    break;
                }
                case 'rotate': {
                    modelMatrix.rotate(trans.content[0],trans.content[1],trans.content[2],trans.content[3]);
                    break;
                }
                case 'scale': {
                    modelMatrix.scale(trans.content[0],trans.content[1],trans.content[2]);
                    break;
                }
            }
        }
        so.modelMatrix = modelMatrix;
        so.objFilePath = e.objFilePath;
        so.color = e.color;
        //补齐最后一个alpha值
        if(so.color.length ==3 ){
            so.color.push(1.0);
        }
        // Start reading the OBJ file
        readOBJFile(so, gl, 1.0, true,initDraw);

        //压入物体列表中
        SceneObjectList.push(so);
    }
}

//################################################################
//		obj配置物体初始化部分
//################################################################

// Create an buffer object and perform an initial configuration
function initVertexBuffers(gl, program) {
    var o = new Object(); // Utilize Object object to return multiple buffer objects
    o.vertexBuffer = createEmptyArrayBuffer(gl, program.a_Position, 3, gl.FLOAT);
    o.normalBuffer = createEmptyArrayBuffer(gl, program.a_Normal, 3, gl.FLOAT);
    o.colorBuffer = createEmptyArrayBuffer(gl, program.a_Color, 4, gl.FLOAT);
    o.indexBuffer = gl.createBuffer();
    if (!o.vertexBuffer || !o.normalBuffer || !o.colorBuffer || !o.indexBuffer) { return null; }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return o;
}

// Create a buffer object, assign it to attribute variables, and enable the assignment
function createEmptyArrayBuffer(gl, a_attribute, num, type) {
    var buffer =  gl.createBuffer();  // Create a buffer object
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);  // Assign the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);  // Enable the assignment

    //在buffer中填入type和element数量信息，以备之后绘制过程中绑定shader使用
    buffer.num = num;
    buffer.type = type;

    return buffer;
}


// Read a file
function readOBJFile(so, gl, scale, reverse,initDraw) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status !== 404) {
            onReadOBJFile(request.responseText, so, gl, scale, reverse);
            so.ready = true;
            initDraw(gl);
        }
    };
    request.open('GET', so.objFilePath, true); // Create a request to acquire the file
    request.send();                      // Send the request
}

// OBJ File has been read
function onReadOBJFile(fileString, so, gl, scale, reverse) {
    var objDoc = new OBJDoc(so.filePath);  // Create a OBJDoc object
    objDoc.defaultColor = so.color;
    var result = objDoc.parse(fileString, scale, reverse); // Parse the file
    if (!result) {
        so.objDoc = null; so.drawingInfo = null;
        console.log("OBJ file parsing error.");
        return;
    }
    so.objDoc = objDoc;
}

// OBJ File has been read compreatly
function onReadComplete(gl, model, objDoc) {
    // Acquire the vertex coordinates and colors from OBJ file
    var drawingInfo = objDoc.getDrawingInfo();

    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

    return drawingInfo;
}