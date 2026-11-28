// Written by tools/make-station-stats.py from ../../analysis/data/station_faster_access_chicago.csv (analysis/station_faster_access_chicago.py):
// for each stop, the Chicago residents (2020 Census) whose door-to-station trip at 8 AM would be at least 15 minutes faster with CrossTowner,
// and the wards within 250 ft of it (City of Chicago ward boundaries, 2023). tunnel: at least one of the five tunnel stations, counted once.
export default {
 "stations": {
  "18th (Soldier Field)": {
   "wards": [
    3,
    4
   ],
   "people": 1090252
  },
  "Roosevelt": {
   "wards": [
    3,
    4,
    34
   ],
   "people": 24593
  },
  "Taylor/Clinton": {
   "wards": [
    28
   ],
   "people": 351720
  },
  "Union Station": {
   "wards": [
    34,
    42
   ],
   "people": 115468
  },
  "Randolph/Clinton": {
   "wards": [
    34,
    42
   ],
   "people": 67586
  },
  "Chicago/Halsted": {
   "wards": [
    27
   ],
   "people": 416542
  }
 },
 "tunnel": 486854,
 "tunnelWards": [
  3,
  4,
  27,
  28,
  34,
  42
 ]
};
