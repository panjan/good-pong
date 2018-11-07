var sock = new WebSocket(`ws://${document.location.host}/rpc`)

sock.onmessage = function(event) {
  eventData = JSON.parse(event.data)
  console.log(eventData)
  let sensorValues = eventData.result.sensorValues
  new Chartist.Line('.ct-chart', {
    labels: sensorValues,
    series: [
      sensorValues
    ]
  }, {
    fullWidth: true,
    chartPadding: {
      right: 40
    }
  });
}

sock.onerror = function(err) {
	console.log("Web socket error detected!")
}

sock.onclose = function() {
	console.log("Web socket closed!")
}

function sendRPC(method, params) {
  data = {
    "jsonrpc": "2.0",
    "method": method,
    "params": params
  }
  sock.send(JSON.stringify(data))
}

sock.onopen = function() {
  console.log('sending connect rpc...')
  sendRPC('connect')
  console.log('...connect rpc sent')
}

