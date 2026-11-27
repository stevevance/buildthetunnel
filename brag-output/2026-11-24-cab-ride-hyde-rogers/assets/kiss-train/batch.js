import { mergeGeometries } from '../vendor/addons/BufferGeometryUtils.js';

// Keep each car and equipment assembly addressable. Inside a static assembly
// batch compatible opaque parts to avoid a draw call for every seam or bolt.
export function preparePart(THREE, root) {
  const meshes = [];
  root.traverse(node => { if (node.isMesh) meshes.push(node); });
  if (meshes.length < 48) return root;
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const batches = new Map();
  for (const mesh of meshes) {
    const material = mesh.material;
    if (!mesh.visible || mesh.isInstancedMesh || mesh.isSkinnedMesh || Array.isArray(material)) continue;
    if (mesh.geometry.morphAttributes?.position || (material.transparent && !material.alphaTest)) continue;
    const geo = mesh.geometry;
    const attributes = Object.entries(geo.attributes).sort(([a],[b])=>a.localeCompare(b))
      .map(([key,a])=>`${key}/${a.itemSize}/${a.normalized}/${a.array.constructor.name}`).join(',');
    const key = [material.uuid, attributes, mesh.renderOrder, mesh.castShadow, mesh.receiveShadow].join('|');
    if (!batches.has(key)) batches.set(key, []);
    batches.get(key).push(mesh);
  }
  for (const batch of batches.values()) {
    if (batch.length < 3) continue;
    const first = batch[0];
    const prepared = batch.map(mesh => {
      const geo = mesh.geometry.clone();
      const transform = new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld);
      geo.applyMatrix4(transform);
      if (!geo.index) geo.setIndex(Array.from({length:geo.attributes.position.count}, (_,i)=>i));
      // A negative scale reverses the triangle winding once transforms are baked.
      if (transform.determinant() < 0) {
        const ids = geo.index.array;
        for (let i=0; i<ids.length; i+=3) [ids[i+1],ids[i+2]]=[ids[i+2],ids[i+1]];
      }
      return geo;
    });
    const united = mergeGeometries(prepared, false);
    if (!united) continue;
    const mesh = new THREE.Mesh(united,first.material);
    mesh.name = first.material.name || first.name || 'Detail surfaces';
    mesh.renderOrder = first.renderOrder;
    mesh.castShadow = first.castShadow;
    mesh.receiveShadow = first.receiveShadow;
    batch.forEach(item => item.removeFromParent());
    root.add(mesh);
    prepared.forEach(geometry => geometry.dispose());
  }
  const empty = [];
  root.traverse(object=>{ if (object !== root && object.isGroup) empty.push(object); });
  for (const group of empty.reverse()) if (group.children.length === 0) group.removeFromParent();
  return root;
}
