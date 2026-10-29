import { Raycaster, Vector3, type Mesh } from 'three'

const ray = new Raycaster()

/**
 * Z de la superficie de `mesh` en (x,y) en el espacio del comuñe en reposo.
 * `dir` +1 mira desde el frente (+z) y −1 desde la espalda. Usa la matriz local del nodo
 * (la raíz del glTF es identidad) porque matrixWorld puede no estar actualizada todavía.
 */
export function zSuperficie(mesh: Mesh, x: number, y: number, dir: 1 | -1, porDefecto: number) {
  const saved = mesh.matrixWorld.clone()
  mesh.matrixWorld.copy(mesh.matrix)
  ray.set(new Vector3(x, y, 2 * dir), new Vector3(0, 0, -dir))
  const hit = ray.intersectObject(mesh, false)[0]
  mesh.matrixWorld.copy(saved)
  return hit ? hit.point.z : porDefecto
}
