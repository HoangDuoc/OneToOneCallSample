cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-plugin-device.device",
    "file": "plugins/cordova-plugin-device/www/device.js",
    "pluginId": "cordova-plugin-device",
    "clobbers": [
      "device"
    ]
  },
  {
    "id": "stringee-cordova-plugin.stringee",
    "file": "plugins/stringee-cordova-plugin/www/stringee.js",
    "pluginId": "stringee-cordova-plugin",
    "clobbers": [
      "stringee"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-whitelist": "1.3.3",
  "cordova-plugin-device": "2.0.2",
  "stringee-cordova-plugin": "1.0.0"
};
// BOTTOM OF METADATA
});