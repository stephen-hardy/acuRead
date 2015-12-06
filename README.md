# acuRead.js
Node.js library for reading data (and updates) from AcuRite weather stations (currently supporting 02064C)

# Usage

## Methods
* **refresh()**
  * ***Description:*** Refreshes (currently just adds to) the list of known weather stations
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
  * **Arguments:** 1 (boolean). True returns only the data which has changed with the update. False, or no arguments, will return all weather data.
  * **Returns:** Changed data, or all weather data, depending upon the first argument.
* on()
  * **Description:** Register a function for the specified event, similar to jQuery's "on()"
  * **Arguments:** 2
    1. Event Type. Currently, "change" is the only event.
    2. Event Function. Change events are called with the first argument being all weather data, and the second being changes only.
  * **Returns:** Station (parent)

### Properties