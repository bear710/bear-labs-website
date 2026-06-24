# Placeholder concentrate jar — source assets

These files are reference/source material for the temporary imported jar
model used in the 3D product showroom. They are **not** served by the
website — only the optimized GLB under `public/models/` is.

## Files in this folder

- **`Cream Jar 05.gltf`** — the original downloaded source model, as-is.
- **`placeholder-concentrate-jar.glb`** — the unoptimized packed
  conversion of the source `.gltf` into a single binary GLB (all
  buffers embedded, no simplification or compression applied).

## Production file (lives elsewhere)

- **`placeholder-concentrate-jar-optimized.glb`** — the web-production
  version actually loaded by the showroom. Remains under
  `public/models/placeholder-concentrate-jar/` so Next.js can serve it.

## Size / triangle comparison

| | Original (`placeholder-concentrate-jar.glb`) | Optimized (`-optimized.glb`) |
|---|---|---|
| Triangles | 356,224 | 106,863 |
| File size | ≈ 8.16 MB | ≈ 450 KB |

The optimized version uses Meshopt compression (`EXT_meshopt_compression`),
which is why a `MeshoptDecoder` must be configured on the loader before it
can be read — see `src/components/three/TemporaryJarModel.js`.

## Node mapping (current, temporary)

| Node name | Role |
|---|---|
| `Circle_006` | jar body |
| `Circle_014` | product fill |
| `Circle_013` | lid |
| `Circle_012` | lid detail |

## Status

These assets are **temporary placeholders** and should eventually be
replaced by the final Bear Labs jar model.
