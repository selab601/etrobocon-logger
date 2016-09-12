/*
 * RealTimeView.js
 */
function RealTimeView (model, jQueryObject, dialog) {
  this.model = model;
  this.$ = jQueryObject;
  this.dialog = dialog;

  this.model.setRenderValueKinds([]);
  this.model.setShownContent("realtime");

  this.$('#content').load('./htmlComponent/realtime.html', function () {
    this.dialog.hide();
    this.updateBluetoothDeviceList(this.model.getConnectedDevices());
    this.$("input.render-value").attr('onclick', "main.updateRenderValueKinds()");
  }.bind(this));
};

RealTimeView.prototype.updateBluetoothDeviceList = function () {
  var devices = this.model.getConnectedDevices();
  for (var i=0; i<devices.length; i++) {
    this.$("#bt-device-group").append(
      this.$('<li>').append(
        this.$("<a/>")
          .attr("href", "#")
          .attr("onclick", "main.io.connect(\"" + devices[i].address + "\");")
          .text(devices[i].name)));
  }
};

RealTimeView.prototype.enableDisconnectButton = function () {
  this.$("#disconnect-btn").prop('disabled', false);
};

RealTimeView.prototype.disableDisconnecButton = function () {
  this.$("#disconnect-btn").prop('disabled', true);
};

module.exports = RealTimeView;
