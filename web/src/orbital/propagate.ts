// On-device propagation: TLE -> look angles (Alt/Az) for a ground observer.
// Uses satellite.js (SGP4). This is the M0 spike core; AR rendering builds on it.

import {
  twoline2satrec,
  propagate,
  gstime,
  eciToEcf,
  ecfToLookAngles,
  degreesLat,
  degreesLong,
  type EciVec3,
} from "satellite.js";

const RAD2DEG = 180 / Math.PI;

export interface Observer {
  latitudeDeg: number;
  longitudeDeg: number;
  heightKm: number;
}

export interface LookAngle {
  azimuthDeg: number; // 0=N, 90=E
  elevationDeg: number; // altitude above horizon; <0 = below
  rangeKm: number;
  aboveHorizon: boolean;
}

/**
 * Compute the Alt/Az look angle of a TLE object from an observer at a given time.
 * Returns null when SGP4 fails to produce a position (decayed/invalid element set).
 */
export function lookAngle(
  tleLine1: string,
  tleLine2: string,
  observer: Observer,
  when: Date,
): LookAngle | null {
  const satrec = twoline2satrec(tleLine1, tleLine2);
  const pv = propagate(satrec, when);
  const position = pv.position as EciVec3<number> | false | undefined;
  if (!position) return null;

  const gmst = gstime(when);
  const ecf = eciToEcf(position, gmst);
  const observerGd = {
    longitude: (observer.longitudeDeg * Math.PI) / 180,
    latitude: (observer.latitudeDeg * Math.PI) / 180,
    height: observer.heightKm,
  };
  const look = ecfToLookAngles(observerGd, ecf);

  const elevationDeg = look.elevation * RAD2DEG;
  return {
    azimuthDeg: ((look.azimuth * RAD2DEG) % 360 + 360) % 360,
    elevationDeg,
    rangeKm: look.rangeSat,
    aboveHorizon: elevationDeg > 0,
  };
}

/** Compass-point label for an azimuth in degrees. */
export function compass(azimuthDeg: number): string {
  const points = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return points[Math.round(azimuthDeg / 45) % 8];
}

// Re-export helpers the UI may want for ground-track / debugging.
export { degreesLat, degreesLong };
