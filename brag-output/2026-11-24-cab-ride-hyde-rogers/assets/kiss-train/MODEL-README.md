# Caltrain Stadler KISS · set 321/322

An editable, metre-scale Three.js reconstruction of Caltrain's seven-car electric train. The model depicts a northbound service to San Francisco, with cab 321 leading and the pantograph on bicycle car F raised. The technical references and the side photograph used for the individual car layouts are in [REFERENCES.md](REFERENCES.md).

## Open the model

Open **Caltrain-KISS-viewer.html** in a current desktop browser with WebGL 2. Everything required to draw the train is embedded in the HTML. Select a camera view, drag to orbit, and scroll to zoom. The Side view lets you select any of the seven road numbers and switch sides. Use the keyboard-shortcut button for the full control list. The toolbar download button exports the train as a binary glTF file. The track, studio and camera rig belong to the viewer.

**Caltrain-KISS-321-322.glb** opens directly in Blender's glTF importer, Three.js GLTFLoader, and other glTF 2.0 viewers. The seven cars and their six connections are separately named in the scene hierarchy.

## Use the procedural model in Three.js

With the dependencies installed in the source directory:

```js
import * as THREE from 'three';
import { buildTrain, formation, specs } from './train.mjs';

const train = buildTrain(THREE);
scene.add(train);
console.log(specs.lengthOverCouplers, formation.map(car => car.number));
```

The railhead is at Y = 0. Positive X points toward the San Francisco end and Z runs across the cars. The outer coupling planes are at X = ±91.280 m. The 3.000 m dimension refers to the nominal body shell. Seals, glazing and fittings project beyond it. The raised current collector reaches approximately 6.706 m above railhead. Use `buildTrain(THREE, { raw: true })` to retain the component builders' original grouping before the final draw-call optimization.

## Edit and rebuild

Use Node.js 20 or later. From the source directory, run:

```sh
npm ci
npm run build
```

Open `dist/Caltrain-KISS-viewer.html` to inspect the revised model. To write the optimized binary asset directly from Node, run `npm run model`. The packaged GLB shares identical vertices and materials without simplifying the surfaces. The viewer download also preserves the full geometry. The source files use metres throughout. Car geometry is constructed in its own local coordinate system, and the train builder reverses the southern driving car to face outward.

| Module | Contents |
| --- | --- |
| train.mjs | Car order, road numbers, coupling planes, shell lengths, bogie centres, service state and assembly |
| body.mjs | Cross-section, car-specific side layouts, passenger and high-platform doors, glazing, livery and side graphics |
| cab.mjs | Compound nose surfaces, glazing, front-end equipment, lights and outer coupling |
| roof.mjs | Roof units, grilles, cable runs, electrical apparatus and single-arm pantographs |
| gear.mjs | Powered and unpowered bogies, wheels, suspension, underfloor equipment and intercar connections |
| viewer.mjs | Studio, display track, camera presets and interaction |
| batch.mjs, export-glb.mjs, write-glb.mjs, optimize-glb.mjs, build.mjs | Mesh batching, binary glTF export and single-file HTML packaging |

## Reconstruction notes

The coupling envelope, formation and bogie positions follow Stadler's published dimensions. The nose curvature, individual housings, running-gear castings and small fittings were reconstructed from public elevations and photographs. The glazing is an exterior representation. The visible traction and pneumatic equipment is static. Roof hardware and the underside include inferred geometry wherever the public references give an incomplete view.

Three.js and its bundled add-ons are distributed under the MIT license in THREE-LICENSE.txt. The Caltrain and Stadler names and graphics identify the equipment depicted. The photographic reference guide credits the source and license for its two photograph crops.
