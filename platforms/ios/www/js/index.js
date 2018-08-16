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
var stringeeClient;
var stringeeCall;
var isIncomingCall;
var isVideoCall;
var isMute = false;
var isSpeaker = false;
var isTurnOnCamera = true;

var timer;
var mins = 0;
var secs = 0;

const SCREENMODE = {
  LOGIN: 0,
  INVOICECALL: 1,
  INVIDEOCALL: 2,
  INCOMINGCALL: 3
};

var app = {
  initialize: function() {
    document.addEventListener(
      "deviceready",
      this.onDeviceReady.bind(this),
      false
    );
  },

  onDeviceReady: function() {
    this.receivedEvent("app");
  },

  receivedEvent: function(id) {
    console.log("Received Event: " + id);

    // Bắt sự kiện
    addEventListenners();

    // Kết nối tới Stringee Server
    connectToStringeeServer();
  }
};

// TODO: Tích hợp Stringee

function connectToStringeeServer() {
  // 1. Lấy Token
  var vietinbank1 =
    "eyJjdHkiOiJzdHJpbmdlZS1hcGk7dj0xIiwidHlwIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJqdGkiOiJTS0xIb2NCdDl6Qk5qc1pLeThZaUVkSzRsU3NBZjhCSHpyLTE1MzM2MzA4NDIiLCJpc3MiOiJTS0xIb2NCdDl6Qk5qc1pLeThZaUVkSzRsU3NBZjhCSHpyIiwiZXhwIjoxNTM2MjIyODQyLCJ1c2VySWQiOiJ2aWV0aW5iYW5rMSJ9.QueGr-ooRFei6J5MnIXHka78CWuI76PKSRo2Bl-l51U";
  var vietinbank2 =
    "eyJjdHkiOiJzdHJpbmdlZS1hcGk7dj0xIiwidHlwIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJqdGkiOiJTS0xIb2NCdDl6Qk5qc1pLeThZaUVkSzRsU3NBZjhCSHpyLTE1MzM2MzA5MzMiLCJpc3MiOiJTS0xIb2NCdDl6Qk5qc1pLeThZaUVkSzRsU3NBZjhCSHpyIiwiZXhwIjoxNTM2MjIyOTMzLCJ1c2VySWQiOiJ2aWV0aW5iYW5rMiJ9.Y_b8StVSvyVtldjgeIr6NJEq1NgsEiQQEqvGvmWzlBo";

  // Khởi tạo StringeeClient để connect đến Stringee Server
  stringeeClient = Stringee.initStringeeClient();

  var weakself = this;

  // Lắng nghe sự kiện kết nói của StringeeClient
  stringeeClient.on({
    // Đã kết nối tới Stringee server
    didConnect: function(event) {
      console.log("***" + "didConnect" + "***" + stringeeClient.userId);
      $("#userId").text(event.userId);
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
      console.log("***" + "incomingCall");
      var incomingCall = event.call;

      if (stringeeCall) {
        // Vẫn tồn tại tức là có cuộc gọi đang diễn ra => ta sẽ từ chối cuộc gọi mới
        var success = function(message) {
          console.log(message);
        };

        var failure = function(message) {
          console.log(message);
        };
        incomingCall.reject(success, failure);
        return;
      }

      // Gán các biến cuộc gọi
      stringeeCall = incomingCall;
      isIncomingCall = true;
      isVideoCall = incomingCall.isVideoCall;
      // Lắng nghe sự kiện của cuộc gọi.
      stringeeCall.on({
        didChangeSignalingState: function(event) {
          handleDidChangeSignalingState(event);
        },

        didChangeMediaState: function(event) {
          handleDidChangeMediaState(event);
        },

        didReceiveLocalStream: function(event) {
          handleDidReceiveLocalStream(event);
        },

        didReceiveRemoteStream: function(event) {
          handleDidReceiveRemoteStream(event);
        },

        didHandleOnAnotherDevice: function(event) {
          handleDidHandleOnAnotherDevice(event);
        }
      });

      var success = function(message) {
        console.log(message);
        // Báo lại trạng thái ringing thành công thì chuyển màn hình
        updateScreenFollowMode(SCREENMODE.INCOMINGCALL);
      };

      var failure = function(message) {
        console.log(message);
      };

      // Gửi lại tín hiệu ringing cho bên gọi.
      stringeeCall.initAnswer(success, failure);
    }
  });

  stringeeClient.connect(vietinbank2);
}

// TODO: Actions

function addEventListenners() {
  voiceCallTapped();
  videoCallTapped();
  endCallTapped();
  rejectCallTapped();
  answerCallTapped();
  microTapped();
  cameraTapped();
  speakerTapped();
}

function voiceCallTapped() {
  $("#btnVoice").on("click", function() {
    makeCall(false);
  });
}

function videoCallTapped() {
  $("#btnVideo").on("click", function() {
    makeCall(true);
  });
}

function endCallTapped() {
  $("#btnEndCall").on("click", function() {
    var success = function(code, message) {
      console.log("ĐÃ ĂN VÀO END Call" + code + message);
    };

    var failure = function(message) {
      console.log(message);
    };

    stringeeCall.hangup(success, failure);
  });
}

function rejectCallTapped() {
  $("#btnReject").on("click", function() {
    var success = function(message) {
      console.log(message);
    };

    var failure = function(message) {
      console.log(message);
    };

    stringeeCall.reject(success, failure);
  });
}

function answerCallTapped() {
  $("#btnAnswer").on("click", function() {
    var success = function(message) {
      console.log(message);
      if (isVideoCall) {
        updateScreenFollowMode(SCREENMODE.INVIDEOCALL);
      } else {
        updateScreenFollowMode(SCREENMODE.INVOICECALL);
      }
    };

    var failure = function(message) {
      console.log(message);
      updateScreenFollowMode(SCREENMODE.LOGIN);
    };

    stringeeCall.answer(success, failure);
  });
}

function microTapped() {
  $("#btnMicro").on("click", function() {
    var success = function(message) {
      console.log(message);
    };

    var failure = function(message) {
      console.log(message);
    };

    stringeeCall.mute(!isMute, success, failure);
    isMute = !isMute;
  });
}

function cameraTapped() {
  $("#btnCamera").on("click", function() {
    var success = function(message) {
      console.log(message);
    };

    var failure = function(message) {
      console.log(message);
    };

    stringeeCall.enableVideo(!isTurnOnCamera, success, failure);
    isTurnOnCamera = !isTurnOnCamera;
  });
}

function speakerTapped() {
  $("#btnSpeaker").on("click", function() {
    var success = function(message) {
      console.log(message);
    };

    var failure = function(message) {
      console.log(message);
    };

    stringeeCall.setSpeakerphoneOn(!isSpeaker, success, failure);
    isSpeaker = !isSpeaker;
  });
}

function switchCameraTapped() {}

function makeCall(isVideo) {
  if (!stringeeClient.hasConnected) {
    alert("Không có kết nối. Vui lòng kiểm tra lại");
    return;
  }

  var toUserId = $("#tfUserId").val();
  if (!toUserId.length) {
    alert("Bạn cần nhập vào userId để thực hiện cuộc gọi");
    return;
  }

  isVideoCall = isVideo;

  // Khởi tạo cuộc gọi
  isIncomingCall = false;
  stringeeCall = Stringee.initStringeeCall(
    stringeeClient.userId,
    toUserId,
    isVideo,
    "",
    ""
  );

  // Lắng nghe sự kiện của cuộc gọi.
  stringeeCall.on({
    didChangeSignalingState: function(event) {
      handleDidChangeSignalingState(event);
    },

    didChangeMediaState: function(event) {
      handleDidChangeMediaState(event);
    },

    didReceiveLocalStream: function(event) {
      handleDidReceiveLocalStream(event);
    },

    didReceiveRemoteStream: function(event) {
      handleDidReceiveRemoteStream(event);
    },

    didHandleOnAnotherDevice: function(event) {
      handleDidHandleOnAnotherDevice(event);
    }
  });

  var success = function(message) {
    console.log(message);
    // Make call thành công thì chuyển màn hình
  };

  var failure = function(message) {
    console.log(message);
    // Nếu make call fail thì xóa cuộc gọi đã tạo
    stringeeCall = null;
    updateScreenFollowMode(SCREENMODE.LOGIN);
  };

  if (isVideo) {
    updateScreenFollowMode(SCREENMODE.INVIDEOCALL);
  } else {
    updateScreenFollowMode(SCREENMODE.INVOICECALL);
  }

  // Make call
  stringeeCall.makeCall(success, failure);
}

function updateScreenFollowMode(mode) {
  switch (mode) {
    case SCREENMODE.LOGIN:
      $(".page-login").removeClass("display-none");
      $(".page-incommingcall").addClass("display-none");
      $(".page-incall").addClass("display-none");
      $("#app").removeClass("background-transparent");
      updateLbState("");
      isVideoCall = false;

      isMute = false;
      isTurnOnCamera = true;
      isSpeaker = false;
      break;
    case SCREENMODE.INCOMINGCALL:
      $(".page-login").addClass("display-none");
      $(".page-incommingcall").removeClass("display-none");
      $(".page-incall").addClass("display-none");
      break;
    case SCREENMODE.INVOICECALL:
      $(".page-login").addClass("display-none");
      $(".page-incommingcall").addClass("display-none");
      $(".page-incall").removeClass("display-none");
      $("#inCallInfoView").removeClass("display-none");
      $("#btnSwitchCamera").addClass("display-none");
      $("#btnCamera").addClass("display-none");

      $("#btnMicro .icon-toggle").addClass("display-none");
      $("#btnSpeaker .icon-toggle").removeClass("display-none");

      isMute = false;
      isSpeaker = false;

      if (isIncomingCall) {
        updateLbName(stringeeCall.from);
      } else {
        updateLbName(stringeeCall.to);
      }
      break;
    case SCREENMODE.INVIDEOCALL:
      $(".page-login").addClass("display-none");
      $(".page-incommingcall").addClass("display-none");
      $(".page-incall").removeClass("display-none");

      $("#inCallInfoView").addClass("display-none");
      $("#btnSwitchCamera").removeClass("display-none");
      $("#btnCamera").removeClass("display-none");
      $("#app").addClass("background-transparent");

      $("#btnMicro .icon-toggle").addClass("display-none");
      $("#btnCamera .icon-toggle").addClass("display-none");
      $("#imgSpeakerSlash").addClass("display-none");

      isMute = false;
      isTurnOnCamera = true;
      isSpeaker = true;
      break;

    default:
  }
}

function updateLbName(strInfo) {
  $("#lbName").text(strInfo);
}

function updateLbState(strInfo) {
  $("#lbState").text(strInfo);
}

function startTimer() {
  if (!timer) {
    timer = setInterval(count, 1000);
  }
}

function count() {
  secs++;

  if (secs == 60) {
    secs = 0;
    mins = mins + 1;
  }

  var dSecs = secs > 9 ? secs : "0" + secs;
  var dMins = mins > 9 ? mins : "0" + mins;

  updateLbState(dMins + ":" + dSecs);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
  mins = 0;
  secs = 0;
}

// TODO: Handle call events

function handleDidChangeSignalingState(event) {
  console.log("***" + "didChangeSignalingState" + "***" + event.reason);
  $("#lbState").text(event.reason);
  switch (event.code) {
    case 0:
      // Calling

      break;
    case 1:
      // Ringing

      break;
    case 2:
      // Answered

      break;
    case 3:
      // Busy
      stringeeCall = null;
      updateScreenFollowMode(SCREENMODE.LOGIN);
      break;
    case 4:
      // End
      stringeeCall = null;
      updateScreenFollowMode(SCREENMODE.LOGIN);
      stopTimer();
      break;

    default:
      break;
  }
}

function handleDidChangeMediaState(event) {
  console.log("***" + "didChangeMediaState" + "***" + event.description);
  startTimer();
  switch (event.code) {
    case 0:
      // Conencted
      break;
    case 1:
      // Disconnected
      break;

    default:
      break;
  }
}

function handleDidReceiveLocalStream(event) {
  console.log("***" + "didReceiveLocalStream" + "***" + event.callId);
  var success = function(message) {
    console.log(message);
  };

  var failure = function(message) {
    console.log(message);
  };

  stringeeCall.renderVideo(true, "videoLocal", success, failure);
}

function handleDidReceiveRemoteStream(event) {
  console.log("***" + "didReceiveRemoteStream" + "***" + event.callId);
  var success = function(message) {
    console.log(message);
  };

  var failure = function(message) {
    console.log(message);
  };
  stringeeCall.renderVideo(false, "videoRemote", success, failure);
}

function handleDidHandleOnAnotherDevice(event) {
  console.log("***" + "didHandleOnAnotherDevice" + "***" + event.description);
}

app.initialize();
