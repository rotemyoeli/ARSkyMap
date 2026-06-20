/**
 * Orbital parameters from a TLE (Idea 3 re-entry/decay watch + Idea 4 crowded shells).
 * Derives perigee/apogee altitude, eccentricity, period and inclination from the satrec.
 * Decay is a coarse modelled flag (low perigee), never a precise re-entry time/place.
 */
import { twoline2satrec } from "satellite.js";

const R_EARTH_KM = 6378.137;

export interface OrbitParams {
  perigeeKm: number;
  apogeeKm: number;
  eccentricity: number;
  periodMin: number;
  inclinationDeg: number;
  bstar: number;
  decaying: boolean; // low perigee -> modelled likely to re-enter "soon"
}

export function orbitParams(tle1: string, tle2: string): OrbitParams | null {
  const s = twoline2satrec(tle1, tle2) as unknown as {
    a: number; ecco: number; no: number; inclo: number; bstar: number; error: number;
  };
  if (!s || s.error || !s.a) return null;
  const aKm = s.a * R_EARTH_KM;
  const perigeeKm = aKm * (1 - s.ecco) - R_EARTH_KM;
  const apogeeKm = aKm * (1 + s.ecco) - R_EARTH_KM;
  const periodMin = s.no > 0 ? (2 * Math.PI) / s.no : NaN; // no is rad/min
  return {
    perigeeKm,
    apogeeKm,
    eccentricity: s.ecco,
    periodMin,
    inclinationDeg: (s.inclo * 180) / Math.PI,
    bstar: s.bstar,
    // Low perigee + meaningful drag (B*) => decaying. ~300 km is a common "decaying soon" heuristic.
    decaying: perigeeKm < 300 && s.bstar > 1e-4,
  };
}

/** Altitude band (km) a circular-ish object mostly occupies, for the "crowded shells" view. */
export function altitudeBandKm(p: OrbitParams): number {
  return Math.round(((p.perigeeKm + p.apogeeKm) / 2) / 100) * 100;
}
