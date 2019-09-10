/**
 * Created by duocai on 2016/10/28.
 */

$keyEvent = {

  init: function(gl,canvas) {
      document.onkeydown = function(e){
          e = e||window.event;
          switch (e.keyCode) {
              //forward w
              case 87: {
                  $animation.wOn = true;
                  break;
              }
              //left a
              case 65: {
                  $animation.aOn = true;
                  break;
              }
              //back w
              case 83: {
                  $animation.sOn = true;
                  break;
              }
              //right d
              case 68: {
                  $animation.dOn = true;
                  break;
              }
              //rigth rotate l
              case 76: {
                  $animation.lOn = true;
                  break;
              }
              //left rotate j
              case 74: {
                  $animation.jOn = true;
                  break;
              }
              //forward rotate i
              case 73: {
                  $animation.iOn = true;
                  break;
              }
              //forward rotate i
              case 75: {
                  $animation.kOn = true;
                  break;
              }
              //point light F
              case 70: {
                  $animation.PointLightOn = true;
                  break;
              }
          }
          $animation.startAnimation();
      };

      document.onkeyup = function(e) {
          e = e||window.event;
          switch (e.keyCode) {
              //forward w
              case 87: {
                  $animation.wOn = false;
              }
              //left a
              case 65: {
                  $animation.aOn = false;
                  break;
              }
              //back w
              case 83: {
                  $animation.sOn = false;
                  break;
              }
              //right d
              case 68: {
                  $animation.dOn = false;
                  break;
              }
              //rigth rotate l
              case 76: {
                  $animation.lOn = false;
                  break;
              }
              //left rotate j
              case 74: {
                  $animation.jOn = false;
                  break;
              }
              //forward rotate i
              case 73: {
                  $animation.iOn = false;
                  break;
              }
              //forward rotate i
              case 75: {
                  $animation.kOn = false;
                  break;
              }
              //point light F
              case 70: {
                  $animation.PointLightOn = false;
                  repaint(gl);
                  break;
              }
          }
      }
  }
};

