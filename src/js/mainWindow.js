const electron = require('electron');
const { remote, ipcRenderer} = electron;
var mqtt = require('mqtt');
var ipBroker = '192.168.0.7';
var client = '';
const dialog = electron.remote.dialog;

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBy_bPl1gTzp4QDtQajTi4KFzpF5nwZDyE",
  authDomain: "angucama-control-2ec5a.firebaseapp.com",
  databaseURL: "https://angucama-control-2ec5a.firebaseio.com",
  projectId: "angucama-control-2ec5a",
  storageBucket: "angucama-control-2ec5a.appspot.com",
  messagingSenderId: "827582107892"
};
firebase.initializeApp(config);

//Declaring firebase database service
var database = firebase.database();

// Creating beds arrays
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

// Starting MQTT
mqtt_init();
mqtt_handler();

// Catch ip:set
ipcRenderer.on('ip:set', function(e,ip){
  let brokerSettingsWindow = remote.getGlobal('brokerSettingsWindow');
  if(ip != ipBroker){
      if(isAValidIPaddress(ip)){
          ipBroker = ip;
          client.end();
          mqtt_init();
          mqtt_handler();
          brokerSettingsWindow.close(); 
      }else{
          dialog.showErrorBox('IP inválida', 'Ingrese una dirección IP válida');
      }
      
  } else{
      dialog.showErrorBox('IP ya establecida', 'Ingrese una nueva dirección IP');
  }
});

function isAValidIPaddress(ip) {
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)){
      return (true);
  }
  return (false)
}

// Initialize MQTT Client and subscribe to BED POSITIONING
function mqtt_init() {
  client  = mqtt.connect('ws://' + ipBroker + ':9001');
  client.on('connect', function () {
    client.subscribe('fvl/uci/bed/positioning', {qos: 1})
  })
}

// Handle new messages from BED POSITIONING, compare values and update DB
function mqtt_handler() {
  client.on('message', function (topic, message) {
    var message_received = message.toString();
    var message_JSON = JSON.parse(message_received);
    var id_message = message_JSON.id;
    var num_message = message_JSON.number;
    var section_message = message_JSON.section;
    var position_message = message_JSON.good_position;
    var d = new Date();
    var day = d.getDate();
    console.log(day); 
    var month = d.getMonth() + 1; 
    var year = d.getFullYear();
    var h = addZero(d.getHours());
    var m = addZero(d.getMinutes());
    var s = addZero(d.getSeconds());
    var current_time = day + '|' +  month + '|' + year + '-' + h + ':' + m + ':' + s;
    var key_id = id_message + '-' + current_time;
    if (position_message != beds[id_message].good_position) {
      beds[id_message].good_position = position_message;
      console.log('Hol');      
      writeBedPositioning(key_id, current_time, id_message, num_message, section_message, position_message);
    }
  })
}

//Function to add a good format in current_time variable
function addZero(i) { 
  if (i < 10) {
    i = "0" + i;
  }
  return i;
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
