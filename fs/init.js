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
let sensor2 = 35;
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
let success2 = ADC.enable(sensor2);
print('Success ADC (sensor 1): ', success);
print('Success ADC (sensor 2): ', success2);

let sensorValues = [];
let sensor2Values = [];
GPIO.set_mode(led, GPIO.MODE_OUTPUT);
Timer.set(10, Timer.REPEAT, function() {
  let sensorValue = ADC.read(sensor);
  let sensor2Value = ADC.read(sensor2);
  if(sensorValues.length < 100) {
    sensorValues.push(sensorValue);
    sensor2Values.push(sensor2Value);
  }
  GPIO.toggle(led);
  //print('Sensor value: ', sensorValue);
}, null);

RPC.addHandler('connect', function(args) {
  let oldSensorValues = sensorValues;
  let oldSensor2Values = sensor2Values;
  sensorValues = [];
  sensor2Values = [];
  return { sensorValues: oldSensorValues, sensor2Values: oldSensor2Values };
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
