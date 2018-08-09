/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
  initialize: function() {
    document.addEventListener(
      "deviceready",
      this.onDeviceReady.bind(this),
      false
    );
  },

  onDeviceReady: function() {
    this.receivedEvent("deviceready");
  },

  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector(".listening");
    var receivedElement = parentElement.querySelector(".received");

    listeningElement.setAttribute("style", "display:none;");
    receivedElement.setAttribute("style", "display:block;");
    console.log("Received Event: " + id);

    this.connectToStringeeServer();
  },

  // Tích hợp Stringee
  connectToStringeeServer: function() {
    // 1. Lấy Token
    var vietinbank1 =
      "eyJjdHkiOiJzdHJpbmdlZS1hcGk7dj0xIiwidHlwIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJqdGkiOiJTS0xIb2NCdDl6Qk5qc1pLeThZaUVkSzRsU3NBZjhCSHpyLTE1MzM2MzA4NDIiLCJpc3MiOiJTS0xIb2NCdDl6Qk5qc1pLeThZaUVkSzRsU3NBZjhCSHpyIiwiZXhwIjoxNTM2MjIyODQyLCJ1c2VySWQiOiJ2aWV0aW5iYW5rMSJ9.QueGr-ooRFei6J5MnIXHka78CWuI76PKSRo2Bl-l51U";
    var vietinbank2 =
      "eyJjdHkiOiJzdHJpbmdlZS1hcGk7dj0xIiwidHlwIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJqdGkiOiJTS0xIb2NCdDl6Qk5qc1pLeThZaUVkSzRsU3NBZjhCSHpyLTE1MzM2MzA5MzMiLCJpc3MiOiJTS0xIb2NCdDl6Qk5qc1pLeThZaUVkSzRsU3NBZjhCSHpyIiwiZXhwIjoxNTM2MjIyOTMzLCJ1c2VySWQiOiJ2aWV0aW5iYW5rMiJ9.Y_b8StVSvyVtldjgeIr6NJEq1NgsEiQQEqvGvmWzlBo";

    // Khởi tạo StringeeClient để connect đến Stringee Server
    var stringeeClient = Stringee.initStringeeClient();

    var weakself = this;

    // Lắng nghe sự kiện kết nói của StringeeClient
    stringeeClient.on({
      // Đã kết nối tới Stringee server
      didConnect: function(event) {
        console.log("***" + "didConnect" + "***" + event.userId);
      },

      // Đã mất kết nối tới Stringee server: có thể là mất mạng...
      didDisConnect: function(event) {
        console.log("***" + "didDisConnect" + "***" + event.userId);
      },

      // Kết nối thất bại tới Stringee server. Có thể do server cấu hình sai, hoặc token sai...
      didFailWithError: function(event) {
        console.log("***" + "didFailWithError" + "***" + event.userId);
      },

      // Token đang kết nối tới Stringee server hết hạn.
      requestAccessToken: function(event) {
        console.log("***" + "requestAccessToken" + "***" + event.userId);
        // Lấy lại token mới và kết nối lại...
      },

      // Có cuộc gọi đến
      incomingCall: function(event) {
        console.log("***" + "incomingCall" + "***" + event.userId);

        // Lấy ra cuộc gọi đang gọi đến mình
        weakself.incomingCall = event.call;

        var success = function(message) {
          console.log(message);
        };

        var failure = function(message) {
          console.log("Error calling Plugin");
        };

        // Lắng nghe sự kiện của cuộc gọi.
        weakself.incomingCall.on({
          didChangeSignalingState: function(event) {
            console.log(
              "***" + "didChangeSignalingState" + "***" + event.reason
            );
          },

          didChangeMediaState: function(event) {
            console.log(
              "***" + "didChangeMediaState" + "***" + event.description
            );
          },

          didReceiveLocalStream: function(event) {
            console.log("***" + "didReceiveLocalStream" + "***" + event.callId);
            var success = function(message) {
              console.log(message);
            };

            var failure = function(message) {
              console.log("Error calling Plugin");
            };

            weakself.incomingCall.renderVideo(true, "local", success, failure);
          },

          didReceiveRemoteStream: function(event) {
            console.log(
              "***" + "didReceiveRemoteStream" + "***" + event.callId
            );
            var success = function(message) {
              console.log(message);
            };

            var failure = function(message) {
              console.log("Error calling Plugin");
            };
            weakself.incomingCall.renderVideo(
              false,
              "remote",
              success,
              failure
            );
          },

          didHandleOnAnotherDevice: function(event) {
            console.log(
              "***" + "didHandleOnAnotherDevice" + "***" + event.description
            );
          }
        });

        // weakself.incomingCall.initAnswer(success, failure);
      }
    });

    stringeeClient.connect(vietinbank1);
  }
};

app.initialize();
