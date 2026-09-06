within 2 months we want to make a mobile Online Parking Availability and Locator App that has the following features and user stories

Features
* MAIN: is there a parking space?
* Does the parking space have EV charging, is it covered or not, disabled accessibility and slots

  * They can reserve the disbaled slot pero we dont check if they are, NOT our job
* Reserve, how close is the spot to the entrance, wheres the elevator

  * Masikip ba don type shit but idk how we will tell them
* Shows trends (what time does it usually fill up)
* Pay
* Find where you parked

Users (Stories)
* Consumer
  * Home page is a map with a search bar

    * It has preset locations that you can save and recent searches
  * Search location
  * Recommends close parking areas with heatmap to indicate how full
    * When you click, it shows the different floors and actual capacity
      * Floor selector, number per floor of available slots
  * Click on a floor → click on a slot → reserve
  * When you get to the parking space
    * Scan to get in, scan to get out
    * Print the QR Code
  * Walk in parking
    * Choose walk in sa scanner then it generates a qr code and reserves a lot for you
* Parking Owners
  * parking statistics
  * financial reports
  * ...

Pages/UI in mind
* nav bar
  * landing
  * qr scan/generation
  * explore page
* side bar
  * user profile (allows non authenticated users to use the app)
  * settings
* landing page
  * map with heat map of parking area capacity
  * search bar
* qr scan/generation or parking finder
  * generates reservation/walk in qr
  * payment details and modes of payment
  * parking locator/gps
* explore page
  * parking slots near  you
  * recent reservations
  * favorite parking slots

Limitation
* for now we want to limit it to our school's parking slots
* business integration will be for future developments instead

Branding Guide
* App Name: Uy Parking!
* primary/accent color: #009f8b
* dark mode: #021c1c
* light mode: #f7f7f7

analyze what we currently and suggest how we can make it better