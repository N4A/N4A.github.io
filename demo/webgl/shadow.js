/**
 * Created by duocai on 2016/12/31.
 */

var OFFSCREEN_WIDTH = 2048, OFFSCREEN_HEIGHT = 2048;
var mvpMatrixFromLight_obj = [];
var fbo;


function drawShadowMap(gl,shadowProgram) {
    gl.activeTexture(gl.TEXTURE1); // Set a texture object to the texture unit
    gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);               // Change the drawing destination to FBO
    gl.viewport(0, 0, OFFSCREEN_HEIGHT, OFFSCREEN_HEIGHT); // Set view port for FBO
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // Clear FBO

    gl.useProgram(shadowProgram); // Set shaders for generating a shadow map
    // Draw the triangle and the plane (for generating a shadow map)
    renderTexShadowMap(gl,shadowProgram, floorRes);
    renderTexShadowMap(gl,shadowProgram, boxRes);
    renderObjShadowMap(gl,shadowProgram);
    //finish
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);               // Change the drawing destination to color buffer
    gl.viewport(0, 0, canvas.width, canvas.height);
}

var viewMatrix = new Matrix4();  // View matrix
var projMatrix = new Matrix4();  // Projection matrix

viewMatrix.setLookAt(11.0,5.0,48.0,
    10.0,5.0,43.0,
    0.0,1.0,0.0
);

projMatrix.setPerspective(90, OFFSCREEN_WIDTH/OFFSCREEN_HEIGHT, 1, 2000);

function renderTexShadowMap(gl,program,ob) {
    var mvpMatrix = new Matrix4();
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(ob.modelMatrix);
    ob.mvpMatrixFromLight = mvpMatrix;
    gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);

    //init position
    var vertices = new Float32Array(ob.vertex);
    var indices = new Uint8Array(ob.index);

    // Create the buffer object
    var vertexTexCoordBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();
    if (!vertexTexCoordBuffer || !indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    //var FSIZE = vertices.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(program.a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Position);  // Enable the assignment of the buffer object

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Draw the cube
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
}

function renderObjShadowMap(gl,program) {
    gl.useProgram(program);

    mvpMatrixFromLight_obj = [];
    for(var i=0;i<SceneObjectList.length;i++){
        var mvpMatrix = new Matrix4();

        var so = SceneObjectList[i];
        if (so.objDoc != null && so.objDoc.isMTLComplete()){ // OBJ and all MTLs are available
            so.drawingInfo = onReadComplete(gl, so.model, so.objDoc);
            SceneObjectList[i].objname = so.objDoc.objects[0].name;
            so.objname = so.objDoc.objects[0].name;
            so.objDoc = null;
        }
        if (so.drawingInfo){
            mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(so.modelMatrix);
            gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);

            mvpMatrixFromLight_obj.push(mvpMatrix);

            initAttributeVariable(gl, program.a_Position, so.model.vertexBuffer);  // Vertex coordinates

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, so.model.indexBuffer);
            // Draw
            gl.drawElements(gl.TRIANGLES, so.drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
        }
    }
}