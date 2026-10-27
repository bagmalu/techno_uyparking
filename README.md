within 1 month we want to make a mobile Online Parking Availability and Locator lo-fi App that has the following features and user stories

Features
* MAIN: is there a parking space?
* Does the parking space have EV charging, is it covered or not, disabled accessibility and slots

  * They can reserve the disbaled slot pero we dont check if they are, NOT our job
* Reserve
  * Masikip ba don type shit but idk how we will tell them
* Shows trends (what time does it usually fill up)
* Pay

Current mockup
* default.png is the landing page. you can zoom this in which leads to `zoomed in.png` which shows how many slots are available
* if the person clicks on one of the lots, `space selected.png` shows up. the person can click on the bars on the trends section, which leads to `live space selected.png`
* if the person has a reservation, a pop up is shown as displayed in `w reserved.png`

Users (Stories)
* Consumer
  * Home page is a map with a search bar

    * It has preset locations that you can save and recent searches
  * Search location
  * Recommends close parking areas with heatmap to indicate how full
  * Reserve
  * When you get to the parking space
    * Scan to get in, scan to get out (can be qr ph or through nfc)
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
  * qr/nfc scan/generation
  * explore page
* side bar
  * user profile (allows non authenticated users to use the app)
  * settings
* landing page
  * map with heat map of parking area capacity
  * search bar
* qr/nfc scan/generation or parking finder
  * generates reservation/walk in qr
  * payment details and modes of payment
  * parking locator/gps
* explore page
  * parking slots near  you
  * recent reservations
  * favorite parking slots

Limitation
* business integration will be for future developments instead

Branding Guide
* App Name: Uy Parking!
* primary/accent color: #009f8b
* dark mode: #021c1c
* light mode: #f7f7f7

analyze what we currently and suggest how we can make it better