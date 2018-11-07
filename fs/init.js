load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');
load('api_adc.js');
load('api_rpc.js');

let led = 2;
let sensor = 32;
let button = Cfg.get('pins.button');
let topic = '/devices/' + Cfg.get('device.id') + '/events';

print('LED GPIO:', led, 'button GPIO:', button);

let getInfo = function() {
  return JSON.stringify({
    total_ram: Sys.total_ram(),
    free_ram: Sys.free_ram()
  });
};

let success = ADC.enable(sensor);
print('Success ADC: ', success);

let sensorValues = [];
GPIO.set_mode(led, GPIO.MODE_OUTPUT);
Timer.set(100, Timer.REPEAT, function() {
  let sensorValue = ADC.read(sensor);
  if(sensorValues.length < 100) {
    sensorValues.push(sensorValue);
  }
  GPIO.toggle(led);
  //print('Sensor value: ', sensorValue);
}, null);

RPC.addHandler('connect', function(args) {
  print(args);
  return { sensorValues: sensorValues };
});

// Monitor network connectivity.
Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
  }
  print('== Net event:', ev, evs);
}, null);
