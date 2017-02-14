/**
 * Bluetooth デバイスとの通信機能モジュール
 */

function deviceConnector () {
  this.configMap = {
    main_html : (function () {
      /*
        <div id="device-list">
          <div class="device-connector-header">
            Devices
          </div>
          <div class="device-connector-body">
            <ul id="device-connector-device-group">
              <!-- デバイスが追加されていく -->
            </ul>
            <div class="device-connector-button-area">
              <div class="device-connector-button" id="update-btn">UPDATE</div>
              <div class="device-connector-button danger" id="disconnect-btn">DISCONNECT</div>
            </div>
          </div>
        </div>
      */}).toString().replace(/(\n)/g, '').split('*')[1]
  };
  this.stateMap = {
    $append_target : undefined,
    isConnected : false,
    deviceMap: []
  };
  this.jqueryMap = {};
  this.getLogFileName = undefined;

  this.ipc = require('electron').ipcRenderer;
  this.$ = require('./model/lib/jquery-3.1.0.min.js');
};

/******* イベントハンドラ *******/

deviceConnector.prototype.onUpdateDevices = function () {
  this.ipc.send('updateDevices', '');
  this.jqueryMap.$update_btn.addClass('disabled');
  this.jqueryMap.$disconnect_btn.addClass('disabled');
};

deviceConnector.prototype.onUpdateDevicesFailed = function ( ev, message ) {
  console.log(message);
  this.jqueryMap.$update_btn.removeClass('disabled');
  this.jqueryMap.$disconnect_btn.removeClass('disabled');
};

deviceConnector.prototype.onUpdateDevicesComplete = function ( ev, message ) {
  var device = message;

  // リストに追加済みであったなら追加しない
  var isAlreadyAdded = false;
  this.stateMap.deviceMap.forEach(function (d) {
    console.log(d.address + " : " + device.address);
    if ( d.address === device.address ) {
      isAlreadyAdded = true;
      return;
    }
  });
  if ( isAlreadyAdded ) { return; }

  this.stateMap.deviceMap.push(device);

  this.jqueryMap.$device_group.append(
    this.$('<li>').append(
      this.$("<a/>")
        .attr("href", "#")
        .text(device.name)
        .bind( 'click', device.address, this.onConnectDevice.bind(this) )));
  this.jqueryMap.$update_btn.removeClass('disabled');
  this.jqueryMap.$disconnect_btn.removeClass('disabled');
};

deviceConnector.prototype.onConnectDevice = function ( event ) {
  this.ipc.send('connectDevice', event.data);
  this.jqueryMap.$update_btn.addClass('disabled');
  this.jqueryMap.$disconnect_btn.addClass('disabled');
};

deviceConnector.prototype.onConnectDeviceComplete = function ( ev, message ) {
  console.log(message);
  this.stateMap.isConnected = true;
  this.jqueryMap.$update_btn.removeClass('disabled');
  this.jqueryMap.$disconnect_btn.removeClass('disabled');
};

deviceConnector.prototype.onConnectDeviceFailed = function ( ev, message ) {
  console.log(message);
  this.jqueryMap.$update_btn.removeClass('disabled');
  this.jqueryMap.$disconnect_btn.removeClass('disabled');
};

deviceConnector.prototype.onDisconnectDevice = function () {
  if ( this.stateMap.isConnected == false ) { return; }
  this.ipc.send('disconnectDevice', this.getLogFileName());
  this.jqueryMap.$update_btn.addClass('disabled');
  this.jqueryMap.$disconnect_btn.addClass('disabled');
};

deviceConnector.prototype.onDisconnectDeviceComplete = function ( ev, message ) {
  console.log(message);
  this.stateMap.isConnected = false;
  this.jqueryMap.$update_btn.removeClass('disabled');
  this.jqueryMap.$disconnect_btn.removeClass('disabled');
};

/********************************/

deviceConnector.prototype.setJqueryMap = function () {
  var $append_target = this.stateMap.$append_target;
  this.jqueryMap = {
    $append_target: $append_target,
    $device_group : $append_target.find("#device-connector-device-group"),
    $update_btn : $append_target.find("#update-btn"),
    $disconnect_btn : $append_target.find("#disconnect-btn")
  };
};

deviceConnector.prototype.initModule = function ( $append_target, getLogFileName ) {
  this.stateMap.$append_target = $append_target;
  $append_target.append( this.configMap.main_html );
  this.setJqueryMap();

  this.getLogFileName = getLogFileName;

  // イベントハンドラの登録

  this.jqueryMap.$update_btn.bind( 'click', this.onUpdateDevices.bind(this));
  this.jqueryMap.$disconnect_btn.bind( 'click', this.onDisconnectDevice.bind(this));

  this.ipc.on('updateDevicesComplete', this.onUpdateDevicesComplete.bind(this));
  this.ipc.on('updateDevicesFailed', this.onUpdateDevicesFailed.bind(this));
  this.ipc.on('connectDeviceComplete', this.onConnectDeviceComplete.bind(this));
  this.ipc.on('connectDeviceFailed', this.onConnectDeviceFailed.bind(this));
  this.ipc.on('disconnectDeviceComplete', this.onDisconnectDeviceComplete.bind(this));
};

module.exports = deviceConnector;
