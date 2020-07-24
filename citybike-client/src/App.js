import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { Map, TileLayer, Marker, Popup} from "react-leaflet";
import L from 'leaflet';



export const bikeIcon = new L.Icon({
  iconUrl: '../images/bike.svg',
  iconRetinaUrl: '../images/bike.svg',
  iconAnchor: [5, 55],
  popupAnchor: [10, -44],
  iconSize: [40, 40],
  shadowSize: [68, 95],
  shadowAnchor: [20, 92]
})

export const bikeIconZero = new L.Icon({
  iconUrl: '../images/bike_red.svg',
  iconRetinaUrl: '../images/bike_red.svg',
  iconAnchor: [5, 55],
  popupAnchor: [10, -44],
  iconSize: [40, 40],
  shadowSize: [68, 95],
  shadowAnchor: [20, 92]
})


class App extends Component {
  constructor() {
    super();

    this.state = {
      response: false,
      endpoint: "http://127.0.0.1:4001",
      lat: 25.761681,
      lng: -80.191788,
      zoom: 13,
      markers: []
    };
  }


  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);

    socket.on('refreshChannel', (data) => {
      this.refreshMarkers(data);
    });
  }

  refreshMarkers(data){
    let points = [];
    data.forEach( function(element, index) {
      let point = new Object();
      point.name = element.name;
      point.latitude = element.latitude;
      point.longitude = element.longitude;
      point.freeBikes = element.free_bikes;
      point.emptySlots = element.empty_slots;
      points.push(point);
    });
    this.setState({
      markers: points,
    });
  }

  render() {
    const { response } = this.state;
    const position = [this.state.lat, this.state.lng]
    return (

        <div className="map">
          <h1> City Bikes in Miami </h1>
          <Map center={position} zoom={this.state.zoom}>
            <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {this.state.markers.map((element, index) =>
                <Marker
                    key={index}
                    position={[element.latitude, element.longitude]}
                    icon={ element.freeBikes == 0 ? bikeIconZero : bikeIcon  }
                    onMouseOver={(e) => {
                      e.target.openPopup();
                    }}
                >
                  <Popup>
                    <h1 > {element.name}</h1>
                    <ul>
                      <li>Free Bikes: {element.freeBikes}</li>
                      <li>Empty Slots: {element.emptySlots}</li>
                    </ul>
                  </Popup>
                </Marker>
            )}
          </Map>
        </div>
    );
  }
}

export default App;
