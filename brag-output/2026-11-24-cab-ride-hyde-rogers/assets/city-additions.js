// Buildings the city data gets wrong (assets/city-wide.js and the rest are built from OpenStreetMap), fixed by hand until
// OSM is corrected and the city files are rebuilt. index.html drops every generated building whose center falls in a
// `replace` ring and adds `buildings`, which are in the same form as the generated ones (p: a closed ring in the film's
// metres, x east and z south; h and m: top and bottom in metres; pt: a part, so it gets no rooftop plant of its own;
// n: a name), so the film draws them like their neighbors.
export default {
  replace: [
    // Westerly, 740 N Aberdeen St (OSM way 791826141): OSM has its outline but no height or floors, so the city data
    // drew it 6 m tall. Its 11 floors are a U round a courtyard over a podium; heights from Cook County's 2022 LiDAR
    // (ISGS; the main roof's median, the courtyard deck's median), the U traced from it inside OSM's outline.
    [-2941.0, -3439.8, -2910.4, -3488.1, -2869.1, -3451.8, -2876.9, -3443.3, -2876.8, -3430.8, -2926.2, -3430.0, -2941.0, -3439.8],
  ],
  buildings: [
    { h: 7.5, m: 0, pt: 1, n: "Westerly", i: 900001, p: [-2941.0, -3439.8, -2910.4, -3488.1, -2869.1, -3451.8, -2876.9, -3443.3, -2876.8, -3430.8, -2926.2, -3430.0, -2941.0, -3439.8] },   // the podium, under the courtyard
    { h: 36.0, m: 0, pt: 1, n: "Westerly", i: 900002, p: [-2926.2, -3430.0, -2941.0, -3439.8, -2910.4, -3488.1, -2869.1, -3451.8, -2877.7, -3442.4, -2881.8, -3442.4, -2882.6, -3438.8, -2886.5, -3438.5, -2903.8, -3454.4, -2907.8, -3454.4, -2910.3, -3445.1, -2920.6, -3434.8, -2923.8, -3434.4, -2923.8, -3430.0, -2926.2, -3430.0] },    // the 11-story U
  ],
};
