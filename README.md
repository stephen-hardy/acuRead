# acuRead.js
Node.js library for reading data (and updates) from AcuRite weather stations (currently supporting 02064C)

# Usage

## Methods
* refresh()
  * **Description:** Refreshes (currently just adds to) the list of known weather stations
  * **Arguments:** None
  * **Returns:** Array of "station" objects (see "stations" property below)

## Properties
* stations
  * **Type:** Array
  * **Description:** Array of "station" objects (see "Station" below)

## Station
* **Type:** Object
* **Description:** Object containing weather data, USB information, and change events for the respective station

### Methods
* refresh()
  * **Description:** Refreshes the data property with the latest weather data. Though, please note that only half the data refreshes every 18 seconds.