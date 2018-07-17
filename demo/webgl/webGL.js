/**
 * Created by duocai on 2016/11/8.
 */

$webGL = {
    shadowShader: {
        program: null,
        SHADOW_VSHADER_SOURCE :
            'attribute vec4 a_Position;\n' +
            'uniform mat4 u_MvpMatrix;\n' +
            'void main() {\n' +
            '  gl_Position = u_MvpMatrix * a_Position;\n' +
            '}\n',
        // Fragment shader program for generating a shadow map
        SHADOW_FSHADER_SOURCE :
        //'#ifdef GL_ES\n' +
        'precision mediump float;\n' +
        //'#endif\n' +
        'void main() {\n' +
        '  gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 0.0);\n' + // Write the z-value in R
        '}\n'
    },
    TexShader: {
        VSHADER_SOURCE:
        'attribute vec4 a_Position;\n' +
        'attribute vec4 a_Normal;\n' +
        'attribute vec2 a_TexCoord;\n' +
        'uniform mat4 u_MvpMatrix;\n' +
        'uniform mat4 u_ModelMatrix;\n' +
        'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
        'varying vec2 v_TexCoord;\n' +
        'varying vec3 v_Normal;\n' +
        'varying vec3 v_Position;\n' +

        'uniform mat4 u_MvpMatrixFromLight;\n' +
        'varying vec4 v_PositionFromLight;\n' +
        'void main() {\n' +
        '  gl_Position = u_MvpMatrix * a_Position;\n' +
        '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
        '  v_TexCoord = a_TexCoord;\n' +
        '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
        '  v_PositionFromLight = u_MvpMatrixFromLight * a_Position;\n' +
        '}\n',
        // Fragment shader program
        FSHADER_SOURCE:
  //      '#ifdef GL_ES\n' +
        'precision mediump float;\n' +
     //   '#endif\n' +
        'uniform sampler2D u_Sampler;\n' +
        'varying vec2 v_TexCoord;\n' +

       // 'uniform vec3 u_LightPosition;\n' + // Position of the light source (in the world coordinate system)
        'uniform vec3 u_FogColor;\n' + // Color of Fog
        'uniform vec2 u_FogDist;\n' +  // Distance of Fog (starting point, end point)

        'uniform vec3 u_LightColor;\n' +    //point Light color
        'uniform vec3 u_LightPosition;\n' +
        'varying vec3 v_Position;\n' +
        'varying vec3 v_Normal;\n' +

        'uniform sampler2D u_ShadowMap;\n' +
        'varying vec4 v_PositionFromLight;\n' +
        'void main() {\n' +
        '  vec4 color_tex = texture2D(u_Sampler, v_TexCoord);'+
            // Normalize the normal because it is interpolated and not 1.0 in length any more
        '  vec3 normal = normalize(v_Normal);\n' +
            // Calculate the light direction and make its length 1.
        '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
            // The dot product of the light direction and the orientation of a surface (the normal)
        '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
            // Calculate the final color from diffuse reflection and ambient reflection
        '  vec3 diffuse = u_LightColor * color_tex.rgb * nDotL;\n' +
        '  vec4 color_temp = vec4(color_tex.rgb + diffuse + u_LightColor,color_tex.a);\n' +

        '  vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;\n' +
        '  vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);\n' +
        '  float depth = rgbaDepth.r;\n' + // Retrieve the z-value from R
        '  float visibility = (shadowCoord.z > depth + 0.005) ? 0.5 : 1.0;\n' +

        '  vec4 shadow_color = vec4(color_temp.rgb * visibility, color_temp.a);\n' +

            // Calculation of fog factor (factor becomes smaller as it goes further away from eye point)
        '  float f_Dist = distance(vec4(v_Position,1.0), vec4(u_LightPosition,1.0));\n' +
        '  float fogFactor = clamp((u_FogDist.y - f_Dist) / (u_FogDist.y - u_FogDist.x), 0.0, 1.0);\n' +
            // Stronger fog as it gets further: u_FogColor * (1 - fogFactor) + v_Color * fogFactor
        '  vec3 color = mix(u_FogColor, vec3(shadow_color), fogFactor);\n' +
        '  gl_FragColor = vec4(color, shadow_color.a);\n' +
        //'  gl_FragColor = shadow_color;\n' +
        '}\n'
    },
    objShader: {
        program:null,
        VSHADER_LIGHT2_SOURCE:
        'attribute vec4 a_Position;\n' +
        'attribute vec4 a_Color;\n' +
        'attribute vec4 a_Normal;\n' +
        'uniform mat4 u_ModelMatrix;\n' +
        'uniform mat4 u_MvpMatrix;\n' +
        'uniform mat4 u_NormalMatrix;\n' +
        'uniform mat4 u_MvpMatrixFromLight;\n' +

        //'uniform vec3 u_DirectionLight;\n' +
        'varying vec4 v_Color;\n' +
        'varying vec3 v_Position;\n' +
        'varying vec3 v_Normal;\n' +
        'varying vec4 v_PositionFromLight;\n' +
        'void main() {\n' +
        '  gl_Position = u_MvpMatrix * a_Position;\n' +
            // Calculate the vertex position in the world coordinate
        '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
        '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
        '  v_Color = a_Color;\n' +

        '  v_PositionFromLight = u_MvpMatrixFromLight * a_Position;\n' +
        '}\n',

        // Fragment shader program
        FSHADER_LIGHT2_SOURCE:
        //'#ifdef GL_ES\n' +
        'precision mediump float;\n' +
        //'#endif\n' +

        'uniform vec3 u_FogColor;\n' + // Color of Fog
        'uniform vec2 u_FogDist;\n' +  // Distance of Fog (starting point, end point)
            // Ambient light color
        'uniform vec3 u_AmbientLight;\n' +   // Color of an ambient light
        'uniform vec3 u_LightColor;\n' +    //point Light color
            // also Position of eye point (world coordinates)
        'uniform vec3 u_LightPosition;\n' + // Position of the light source (in the world coordinate system)
        'uniform vec3 u_DirectionLight;\n' +
        'uniform sampler2D u_ShadowMap;\n' +
        'varying vec3 v_Position;\n' +
        'varying vec3 v_Normal;\n' +
        'varying vec4 v_Color;\n' +
        'varying vec4 v_PositionFromLight;\n' +
        'void main() {\n' +
        '  vec3 normal = normalize(v_Normal);\n' +
        '  float nDotL = max(dot(normal, u_DirectionLight), 0.0);\n' +
        '  vec3 diffuse = v_Color.rgb * nDotL;\n' +

            // Calculate the point light direction and make it 1.0 in length,also view direction
        '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
        '  vec3 specular_r = -1.0 * u_DirectionLight + 2.0 * dot(normal, u_DirectionLight) * normal;'+
        '  float nDotS = max(dot(specular_r, u_DirectionLight), 0.0);'+
        '  vec3 specular = v_Color.rgb * nDotS;' +

        '  vec3 specular_r_p = -1.0 * lightDirection + 2.0 * dot(normal, lightDirection) * normal;'+
        '  float nDotS_P = max(dot(specular_r_p, u_DirectionLight), 0.0);'+
        '  vec3 specular_p = u_LightColor * nDotS_P * 0.05;' +

            // The dot product of the light direction and the normal
        '  float nDotLPoint = max(dot(lightDirection, normal), 0.0);\n' +
            // Calculate the color due to diffuse reflection
        '  vec3 diffusePoint = u_LightColor * u_LightColor * nDotLPoint;\n' +
            // Calculate the color due to ambient reflection
        '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
        '  vec4 f_Color = vec4(specular + specular_p + diffuse + diffusePoint + ambient, v_Color.a);\n' +

        '  vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;\n' +
        '  vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);\n' +
        '  float depth = rgbaDepth.r;\n' + // Retrieve the z-value from R
        '  float visibility = (shadowCoord.z > depth + 0.005) ? 0.5 : 1.0;\n' +
        '  vec4 shadow_color = vec4(f_Color.rgb * visibility, f_Color.a);\n' +

            // Calculate the distance to each vertex from eye point,also the light position
        '  float f_Dist = distance(vec4(v_Position,1.0), vec4(u_LightPosition,1.0));\n' +

            // Calculation of fog factor (factor becomes smaller as it goes further away from eye point)
        '  float fogFactor = clamp((u_FogDist.y - f_Dist) / (u_FogDist.y - u_FogDist.x), 0.0, 1.0);\n' +
            // Stronger fog as it gets further: u_FogColor * (1 - fogFactor) + v_Color * fogFactor
        '  vec3 color = mix(u_FogColor, vec3(shadow_color), fogFactor);\n' +
        '  gl_FragColor = vec4(color,f_Color.a);' +
        '}\n'
    },
    floorReady: false,
    boxReady: false,
    /**
     * Get the rendering context for WebGL
     * @param canvas
     */
    getWebGL: function(canvas){
        var gl = getWebGLContext(canvas);
        if (!gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }
        return gl;
    },
    /**
     * Initialize texture shader and obj shader
     * @param gl
     */
    initShaders: function(gl) {
        // Initialize shaders
        if (!initShaders(gl, this.TexShader.VSHADER_SOURCE, this.TexShader.FSHADER_SOURCE)) {
            console.log('Failed to intialize shaders.');
            return;
        }
        gl.program.a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
        gl.program.u_LightColor = gl.getUniformLocation(gl.program,'u_LightColor');
        gl.program.u_LightPosition = gl.getUniformLocation(gl.program,'u_LightPosition');
        gl.program.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
        gl.program.u_MvpMatrixFromLight = gl.getUniformLocation(gl.program, 'u_MvpMatrixFromLight');
        gl.program.u_ShadowMap = gl.getUniformLocation(gl.program, 'u_ShadowMap');
        gl.program.u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');


        this.initFrog(gl,gl.program);

        var light2Program = createProgram(gl,
            this.objShader.VSHADER_LIGHT2_SOURCE, this.objShader.FSHADER_LIGHT2_SOURCE);
        if (!light2Program) {
            console.log('Failed to intialize shaders.');
            return;
        }
        //gl.useProgram(light2Program);
        light2Program.a_Position = gl.getAttribLocation(light2Program, 'a_Position');
        light2Program.a_Color = gl.getAttribLocation(light2Program, 'a_Color');
        light2Program.a_Normal = gl.getAttribLocation(light2Program, 'a_Normal');
        light2Program.u_ModelMatrix = gl.getUniformLocation(light2Program, 'u_ModelMatrix');
        light2Program.u_MvpMatrix = gl.getUniformLocation(light2Program, 'u_MvpMatrix');
        light2Program.u_NormalMatrix = gl.getUniformLocation(light2Program, 'u_NormalMatrix');
        light2Program.u_DirectionLight = gl.getUniformLocation(light2Program, 'u_DirectionLight');
        light2Program.u_AmbientLight = gl.getUniformLocation(light2Program, 'u_AmbientLight');
        light2Program.u_LightColor = gl.getUniformLocation(light2Program,'u_LightColor');
        light2Program.u_LightPosition = gl.getUniformLocation(light2Program,'u_LightPosition');
        light2Program.u_MvpMatrixFromLight = gl.getUniformLocation(light2Program, 'u_MvpMatrixFromLight');
        light2Program.u_ShadowMap = gl.getUniformLocation(light2Program, 'u_ShadowMap');

        if(light2Program.a_Position<0 ||light2Program.a_Color<0 ||light2Program.a_Normal<0
            ||!light2Program.u_MvpMatrix||!light2Program.u_NormalMatrix ||!light2Program.u_DirectionLight){
            console.log('Failed to get the storage location of attribute or uniform variable');
            return;
        }

        this.initFrog(gl,light2Program);
        this.objShader.program = light2Program;

        // Initialize shaders for generating a shadow map
        var shadowProgram = createProgram(gl, this.shadowShader.SHADOW_VSHADER_SOURCE, this.shadowShader.SHADOW_FSHADER_SOURCE);
        shadowProgram.a_Position = gl.getAttribLocation(shadowProgram, 'a_Position');
        shadowProgram.u_MvpMatrix = gl.getUniformLocation(shadowProgram, 'u_MvpMatrix');
        if (shadowProgram.a_Position < 0 || !shadowProgram.u_MvpMatrix) {
            console.log('Failed to get the storage location of attribute or uniform variable from shadowProgram');
            return;
        }
        this.shadowShader.program = shadowProgram;
    },
    initFrog: function(gl,program) {
        program.u_FogColor = gl.getUniformLocation(program, 'u_FogColor');
        program.u_FogDist = gl.getUniformLocation(program, 'u_FogDist');
        gl.useProgram(program);
        // Pass fog color, distances, and eye point to uniform variable
        gl.uniform3fv(program.u_FogColor, fogColor); // Colors
        gl.uniform2fv(program.u_FogDist, fogDist);   // Starting point and end point
    },
    /**
     * init texture buffer object with given img
     * @param gl
     * @param ob
     * @param drawer
     */
    initTextureBuffers: function(gl,ob,drawer) {
        gl.useProgram(gl.program);
        var texture = gl.createTexture();   // Create a texture object
        if (!texture) {
            console.log('Failed to create the texture object');
            return false;
        }

        // Get the storage location of u_Sampler
        var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
        if (!u_Sampler) {
            console.log('Failed to get the storage location of u_Sampler');
            return false;
        }
        var image = new Image();  // Create the image object
        if (!image) {
            console.log('Failed to create the image object');
            return false;
        }

        image.onload = function(){
            //bind to unit 0
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
            // Enable texture unit0
            gl.activeTexture(gl.TEXTURE0);
            // Bind the texture object to the target
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Set the texture parameters
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            // Set the texture image
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

            // Set the texture unit 0 to the sampler
            gl.uniform1i(u_Sampler, 0);
            gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture

            ob.ready = true;
            drawer(gl);
        };

        // Tell the browser to load an image
        image.src = ob.texImagePath;

        //init model matrix
        var modelMatrix = new Matrix4();
        modelMatrix.setTranslate(ob.translate[0],ob.translate[1],ob.translate[2]);
        modelMatrix.scale(ob.scale[0], ob.scale[1], ob.scale[2]);
        ob.modelMatrix = modelMatrix;

        return texture;
    },
    initVertexTexBuffers: function(gl,program,verticesTexCoords,indices) {
        // Vertex coordinates, texture coordinate
        verticesTexCoords = new Float32Array(verticesTexCoords);
        indices = new Uint8Array(indices);

        // Create the buffer object
        var vertexTexCoordBuffer = gl.createBuffer();
        var indexBuffer = gl.createBuffer();
        if (!vertexTexCoordBuffer || !indexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

        var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
        //Get the storage location of a_Position, assign and enable buffer
        var a_Position = gl.getAttribLocation(program, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return -1;
        }
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
        gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

        // Get the storage location of a_TexCoord
        var a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
        if (a_TexCoord < 0) {
            console.log('Failed to get the storage location of a_TexCoord');
            return -1;
        }
        // Assign the buffer object to a_TexCoord variable
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
        gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object

        // Write the indices to the buffer object
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        return indices.length;
    },

    /**
     * init mvp matrix for the ob
     * @param gl
     * @param camera
     * @param ob
     */
    initMvpMatrix: function(gl,camera,ob) {
        // Get the storage location of u_MvpMatrix
        var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
        if (!u_MvpMatrix) {
            console.log('Failed to get the storage location of u_MvpMatrix');
            return;
        }

        var viewMatrix = new Matrix4();  // View matrix
        var projMatrix = new Matrix4();  // Projection matrix
        var mvpMatrix = new Matrix4();   // Model view projection matrix

        // Calculate the view matrix and the projection matrix
        viewMatrix.setLookAt(camera.eye[0], camera.eye[1], camera.eye[2],
            camera.at[0], camera.at[1], camera.at[2],
            camera.up[0], camera.up[1], camera.up[2]);
        projMatrix.setPerspective(camera.fov, 1, camera.near, camera.far);
        // Calculate the model view projection matrix
        mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(ob.modelMatrix);

        // Pass the model view projection matrix to u_MvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // init model Maxtix
        gl.uniformMatrix4fv(gl.program.u_ModelMatrix, false, ob.modelMatrix.elements);
    },
    initFramebufferObject: function (gl) {
        var framebuffer, texture, depthBuffer;

        // Define the error handling function
        var error = function() {
            if (framebuffer) gl.deleteFramebuffer(framebuffer);
            if (texture) gl.deleteTexture(texture);
            if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
            return null;
        };

        // Create a framebuffer object (FBO)
        framebuffer = gl.createFramebuffer();
        if (!framebuffer) {
            console.log('Failed to create frame buffer object');
            return error();
        }

        // Create a texture object and set its size and parameters
        texture = gl.createTexture(); // Create a texture object
        if (!texture) {
            console.log('Failed to create texture object');
            return error();
        }
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        // Create a renderbuffer object and Set its size and parameters
        depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
        if (!depthBuffer) {
            console.log('Failed to create renderbuffer object');
            return error();
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

        // Attach the texture and the renderbuffer object to the FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

        // Check if FBO is configured correctly
        var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (gl.FRAMEBUFFER_COMPLETE !== e) {
            console.log('Frame buffer object is incomplete: ' + e.toString());
            return error();
        }

        framebuffer.texture = texture; // keep the required object

        // Unbind the buffer object
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        if (!framebuffer) {
            console.log('Failed to initialize frame buffer object');
            return;
        }
        return framebuffer;
    },
    initArrayBuffer: function(gl,program, a_attribute, data, num) {
        // Create a buffer object
        var buffer = gl.createBuffer();
        if (!buffer) {
            console.log('Failed to create the buffer object');
            return false;
        }
        // Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, 0, 0);
        // Enable the assignment of the buffer object to the attribute variable
        gl.enableVertexAttribArray(a_attribute);
        return true;
    }
};