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

        if(light2Program.a_Position