const electron = require('electron');

// Creating beds array  

var beds = {
  "1A": {
    "id": "1A",
    "number": "1",
    "section": "A",
    "good_position": "false"
  },
  "2A": {
    "id": "2A",
    "number": "2",
    "section": "A",
    "good_position": "false"
  }
}

//Declaring MQTT nedeed variables
var mqtt = require('mqtt')
var client = mqtt.connect('ws://10.103.53.43:9001')
console.log(client);

//Declaring firebase database service
var database = firebase.database();

// Call MQTT methods
mqtt_init();
mqtt_handle();

//Method to subscribe to a topic once the app is connected to MQTT
function mqtt_init() {
  client.on('connect', function () {
    client.subscribe('fvl/uci/bed/positioning')
  })
}

//Method to handle incoming message
function mqtt_handle() {
  client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString())
    var message_received = message.toString();
    var message_JSON = JSON.parse(message_received);
    var id_message = message_JSON.id;
    var num_message = message_JSON.number;
    var section_message = message_JSON.section;
    var position_message = message_JSON.good_position;
    var d = new Date();
    var h = addZero(d.getHours());
    var m = addZero(d.getMinutes());
    var s = addZero(d.getSeconds());
    
    
    function addZero(i) { //Function to add a good format in current_time variable
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }

    var current_time = h + ':' + m + ':' + s;
  
    var key_id = id_message + '-' + current_time;
    

    if (position_message != beds[id_message].good_position) {
      beds[id_message].good_position = position_message;
      console.log('Posicion actual: ' + beds[id_message].good_position);
      writeBedPositioning(key_id, current_time, id_message, num_message, section_message, position_message);

    } else {
      console.log(current_time);
    }

    //client.end() -> This disconnect the client not allowing it to receive messagges
  })
}

//Method to write on Firebase DB
function writeBedPositioning(key_id, current_time, id_message, num_message, section_message, position_message) {
  firebase.database().ref('beds/' + key_id).set({
    id: id_message,
    number: num_message,
    section: section_message,
    good_position: position_message,
    time: current_time
  });
}
