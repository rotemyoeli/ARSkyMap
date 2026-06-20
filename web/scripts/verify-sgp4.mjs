// Independent SGP4 golden-vector check for satellite.js (differentiator D9 / Gate G0.5).
// Pins satellite.js to the SAME published SGP4-VER reference vector as the Python test
// (backend/tests/test_golden_vectors.py), so the two engines are cross-validated against an
// authoritative source. Run: `node scripts/verify-sgp4.mjs` (exits non-zero on mismatch).
import { twoline2satrec, sgp4 } from "satellite.js";

const L1 = "1 88888U          80275.98708465  .00073094  13844-3  66816-4 0    87";
const L2 = "2 88888  72.8435 115.9689 0086731  52.6988 110.5714 16.05824518  1058";
const EXPECTED_R = [2328.97048951, -5995.22076416, 1719.97067261]; // TEME km, tsince=0, WGS72
const TOL_KM = 0.2;

const satrec = twoline2satrec(L1, L2);
const { position } = sgp4(satrec, 0); // tsince = 0 minutes (epoch)
if (!position) { console.error("FAIL: satellite.js returned no position"); process.exit(1); }

const got = [position.x, position.y, position.z];
let ok = true;
for (let i = 0; i < 3; i++) {
  const d = Math.abs(got[i] - EXPECTED_R[i]);
  if (d >= TOL_KM) { ok = false; console.error(`FAIL axis ${i}: ${got[i].toFixed(6)} vs ${EXPECTED_R[i]} (|d|=${d.toFixed(6)} km)`); }
}
if (!ok) process.exit(1);
console.log(`PASS: satellite.js matches SGP4-VER golden vector within ${TOL_KM} km`, got.map((n) => n.toFixed(4)));
