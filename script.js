var sock;
var chart;
const interval = 1000;
var timer;
var allSensorValues = []
var allSensor2Values = []

function sendRPC(method, params) {
  data = {
    "jsonrpc": "2.0",
    "method": method,
    "params": params
  }
  sock.send(JSON.stringify(data))
}


window.addEventListener('load', function(event) {
   chart = new Chartist.Line('.ct-chart', {
    labels: [],
    series: [[]]
  }, {
    fullWidth: true,
    chartPadding: {
      right: 40
    }
  });
  
  sock = new WebSocket(`ws://${document.location.host}/rpc`)
  sock.onmessage = function(event) {
    eventData = JSON.parse(event.data)
    console.log(eventData)
    let sensorValues = eventData.result.sensorValues
    let sensor2Values = eventData.result.sensor2Values
    allSensorValues = allSensorValues.concat(sensorValues)
    allSensor2Values = allSensor2Values.concat(sensor2Values)
    if(allSensorValues.length > 1000) {
      allSensorValues = allSensorValues.slice(-1000);
      allSensor2Values = allSensor2Values.slice(-1000);
    }
    chart.update({
      labels: allSensorValues,
      series: [
        allSensorValues,
        allSensor2Values
      ]
    })
  }

  sock.onerror = function(err) {
    timer.stop()
  	console.log("Web socket error detected!")
  }
  
  sock.onclose = function() {
    timer.stop()
  	console.log("Web socket closed!")
  }
  
  sock.onopen = function() {
    console.log('sending connect rpc...')
    timer = setInterval(function () {
      sendRPC('connect')  
    }, interval)
    console.log('...connect rpc sent')
  }
})

