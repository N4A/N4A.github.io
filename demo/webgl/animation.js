/**
 * Created by duocai on 2016/10/28.
 */
var $animation = {
    wOn : false,
    aOn : false,
    sOn : false,
    dOn : false,
    jOn : false,
    lOn : false,
    iOn : false,
    kOn : false,
    PointLightOn: false,
    startAnimation: null,//w animation function
    animationOn: function() {
        return this.wOn||this.aOn||this.sOn||this.dOn
            ||this.jOn||this.lOn||this.iOn||this.kOn;
    },
    init: function(gl) {
        var g_last = Date.now();
        // Start animation rotate and scale
        this.startAnimation = function() {
            g_last = Date.now();
            animate();  // Update the rotation angle
        };
        /**
         * animate function
         * @returns {number}
         */
        function animate() {
            // Calculate the elapsed time
            var now = Date.now();
            var elapsed = now - g_last;
            g_last = now;
            // Update the current rotation angle (adjusted by the elapsed time)

            var eye,at,up,direc,direcWithDis,rotateDirec,rotateDirecWithLen,newDirec;
            if ($animation.wOn) {
                eye = new Vector3(CameraPara.eye);
                at = new Vector3(CameraPara.at);
                direc = VectorMinus(at,eye);
                direcWithDis = VectorMultNum(direc,
                    elapsed*MOVE_VELOCITY/1000.0/(VectorLength(direc)));
                CameraPara.eye = VectorAdd(eye,direcWithDis).elements;
                CameraPara.at = VectorAdd(at,direcWithDis).elements;
            }
            if ($animation.sOn) {
                eye = new Vector3(CameraPara.eye);
                at = new Vector3(CameraPara.at);
                direc = VectorMinus(at,eye);
                direcWithDis = VectorMultNum(direc,
                    elapsed*MOVE_VELOCITY/1000.0/(VectorLength(direc)));
                CameraPara.eye = VectorMinus(eye,direcWithDis).elements;
                CameraPara.at = VectorMinus(at,direcWithDis).elements;
            }
            if ($animation.aOn) {
                eye = new Vector3(CameraPara.eye);
                at = new Vector3(CameraPara.at);
                direc = VectorMinus(at,eye);//眼睛方向
                rotateDirec = VectorCross(direc,new Vector3(CameraPara.up));//旋转方向
                rotateDirecWithLen = VectorMultNum(rotateDirec,
                    elapsed*MOVE_VELOCITY/1000.0/(VectorLength(rotateDirec)));
                CameraPara.eye = VectorMinus(eye,rotateDirecWithLen).elements;//向左减
                CameraPara.at = VectorMinus(at,rotateDirecWithLen).elements;
            }
            if ($animation.dOn) {
                eye = new Vector3(CameraPara.eye);
                at = new Vector3(CameraPara.at);
                direc = VectorMinus(at,eye);//眼睛方向
                rotateDirec = VectorCross(direc,new Vector3(CameraPara.up));//旋转方向
                rotateDirecWithLen = VectorMultNum(rotateDirec,
                    elapsed*MOVE_VELOCITY/1000.0/(VectorLength(rotateDirec)));
                CameraPara.eye = VectorAdd(eye,rotateDirecWithLen).elements;//右加
                CameraPara.at = VectorAdd(at,rotateDirecWithLen).elements;
            }
            if ($animation.jOn) {
                eye = new Vector3(CameraPara.eye);
                at = new Vector3(CameraPara.at);
                direc = VectorMinus(at,eye);//眼睛方向
                rotateDirec = VectorCross(new Vector3(CameraPara.up),direc);//旋转方向
                //偏转长度
                rotateDirecWithLen = VectorMultNum(rotateDirec,
                    Math.tan(elapsed*ROT_VELOCITY/50000.0)*VectorLength(direc)/(VectorLength(rotateDirec)));
                newDirec = VectorAdd(direc,rotateDirecWithLen);//新的目标方向
                CameraPara.at = VectorAdd(new Vector3(CameraPara.eye),
                    VectorMultNum(newDirec,//方向
                        VectorLength(direc)/VectorLength(newDirec)//大小
                    )).elements;
            }
            if ($animation.lOn) {
                eye = new Vector3(CameraPara.eye);
                at = new Vector3(CameraPara.at);
                direc = VectorMinus(at,eye);//眼睛方向
                rotateDirec = VectorCross(direc,new Vector3(CameraPara.up));//旋转方向
                //偏转长度
                rotateDirecWithLen = VectorMultNum(rotateDirec,
                    Math.tan(elapsed*ROT_VELOCITY/50000.0)*VectorLength(direc)/(VectorLength(rotateDirec)));
                newDirec = VectorAdd(direc,rotateDirecWithLen);//新的目标方向
                CameraPara.at = VectorAdd(new Vector3(CameraPara.eye),
                    VectorMultNum(newDirec,//方向
                        VectorLength(direc)/VectorLength(newDirec)//大小
                    )).elements;
            }
            if ($animation.iOn) {
                eye = new Vector3(CameraPara.eye);
                at = new Vector3(CameraPara.at);
                up = new Vector3(CameraPara.up);
                direc = VectorMinus(at,eye);//眼睛方向
                rotateDirec = VectorReverse(direc);
                //偏转长度
                rotateDirecWithLen = VectorMultNum(rotateDirec,
                    Math.tan(elapsed*ROT_VELOCITY/50000.0)
                    *VectorLength(up)
                    /(VectorLength(rotateDirec)));
                newDirec = VectorAdd(up,rotateDirecWithLen);//新的目标方向
                CameraPara.up = VectorMultNum(newDirec,//方向
                        VectorLength(up)/VectorLength(newDirec)//大小
                    ).elements;

                rotateDirec = up;
                rotateDirecWithLen = VectorMultNum(rotateDirec,
                    Math.tan(elapsed*ROT_VELOCITY/50000.0)
                    *VectorLength(direc)
                    /(VectorLength(rotateDirec)));
                newDirec = VectorAdd(direc,rotateDirecWithLen);//新的目标方向
                CameraPara.at = VectorAdd(new Vector3(CameraPara.eye),
                    VectorMultNum(newDirec,//方向
                        VectorLength(direc)/VectorLength(newDirec)//大小
                    )).elements;
            }
            if ($animation.kOn) {
                eye = new Vector3(CameraPara.eye);
                at = new Vector3(CameraPara.at);
                up = new Vector3(CameraPara.up);
                direc = VectorMinus(at,eye);//眼睛方向
                rotateDirec = direc;
                //偏转长度
                rotateDirecWithLen = VectorMultNum(rotateDirec,
                    Math.tan(elapsed*ROT_VELOCITY/50000.0)
                    *VectorLength(up)
                    /(VectorLength(rotateDirec)));
                newDirec = VectorAdd(up,rotateDirecWithLen);//新的目标方向
                CameraPara.up = VectorMultNum(newDirec,//方向
                    VectorLength(up)/VectorLength(newDirec)//大小
                ).elements;

                rotateDirec = VectorReverse(up);
                rotateDirecWithLen = VectorMultNum(rotateDirec,
                    Math.tan(elapsed*ROT_VELOCITY/50000.0)
                    *VectorLength(direc)
                    /(VectorLength(rotateDirec)));
                newDirec = VectorAdd(direc,rotateDirecWithLen);//新的目标方向
                CameraPara.at = VectorAdd(new Vector3(CameraPara.eye),
                    VectorMultNum(newDirec,//方向
                        VectorLength(direc)/VectorLength(newDirec)//大小
                    )).elements;
            }

            //repaint
            //repaint(gl);

            if ($animation.animationOn())//be careful, can not use this here
                requestAnimationFrame(animate);// Request that the browser ?calls tick
        }
    },
    startBirdFly: function(gl) {
        var g_last = Date.now();
        var cycle = 200000.0;
        fly();

        function fly() {
            // Calculate the elapsed time
            var now = Date.now();
            var elapsed = now - g_last;

            var bird = SceneObjectList[1];
            var translate = bird.transform[0].content;
            var rotate = bird.transform[1].content;
            //海宝中心为xz平面（0.-5）
            translate[0] = Math.sin((elapsed%cycle)*360.0/cycle)*11;
            translate[1] = Math.sin((elapsed%cycle)*360.0/cycle)*4 + 5;
            translate[2] = Math.cos((elapsed%cycle)*360.0/cycle)*11 - 5;

            rotate[0] = (elapsed%5000)*360.0/5000;

            var modelMatrix = new Matrix4();
            modelMatrix.setIdentity();
            //初始化物体变换矩阵
            for (var j = 0; j < bird.transform.length; j++) {
                var trans = bird.transform[j];
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
            bird.modelMatrix = modelMatrix;

            repaint(gl);
            requestAnimationFrame(fly);
        }
    }
};
