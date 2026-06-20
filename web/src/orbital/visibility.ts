/**
 * Honest optical-visibility model (differentiator D4, grounded in Fankhauser 2023 arXiv:2305.11123).
 * A satellite "may be visible" only when the standard three gates hold:
 *   (1) the satellite is sunlit (not in Earth's umbra),
 *   (2) the observer is in darkness (Sun below ~-6deg, civil twilight or darker),
 *   (3) the satellite is above the horizon.
 * Brightness/magnitude is NOT asserted here — we only say "may be visible", never guaranteed.
 * Sun position uses a low-precision (~0.01deg) geocentric model; adequate for a degree-scale Sun
 * elevation and a km-scale shadow test, not for precise photometry.
 */
import {
  twoline2satrec, propagate, gstime, eciToEcf, ecfToLookAngles, geodeticToEcf, type EciVec3,
} from "satellite.js";
import type { Observer } from "./propagate";

const DEG = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const R_EARTH_KM = 6378.137;
const AU_KM = 149_597_870.7;

/** Low-precision geocentric Sun position (equatorial / ~ECI), km. */
export function sunEciKm(when: Date): EciVec3<number> {
  const jd = when.getTime() / 86_400_000 + 2440587.5;
  const n = jd - 2451545.0;
  const L = ((280.46 + 0.9856474 * n) % 360) * DEG;        // mean longitude
  const g = ((357.528 + 0.9856003 * n) % 360) * DEG;        // mean anomaly
  const lambda = L + (1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG; // ecliptic longitude
  const eps = 23.439 * DEG;                                  // obliquity
  const R = (1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g)) * AU_KM;
  return { x: R * Math.cos(lambda), y: R * Math.cos(eps) * Math.sin(lambda), z: R * Math.sin(eps) * Math.sin(lambda) };
}

/** Sun elevation (deg) at the observer; < -6 ~ civil dark, < -18 ~ astronomical night. */
export function observerSunElevationDeg(observer: Observer, when: Date): number {
  const gmst = gstime(when);
  const sunEcf = eciToEcf(sunEciKm(when), gmst);
  const look = ecfToLookAngles(
    { longitude: observer.longitudeDeg * DEG, latitude: observer.latitudeDeg * DEG, height: observer.heightKm },
    sunEcf,
  );
  return look.elevation * RAD2DEG;
}

export type BrightnessClass = "very bright" | "bright" | "naked-eye" | "binoculars" | "telescope";

export interface Visibility {
  aboveHorizon: boolean;
  sunlit: boolean;          // satellite not in Earth's umbra
  observerDark: boolean;    // Sun below -6deg at observer
  sunElevationDeg: number;
  mayBeVisible: boolean;    // all three gates -> modelled, not guaranteed
  rangeKm: number;
  phaseAngleDeg: number | null;   // Sun-satellite-observer angle
  magnitude: number | null;       // modelled apparent visual magnitude (coarse)
  brightnessClass: BrightnessClass | null;
}

/** Lambertian-sphere phase function (normalised to 1 at phase 0). */
function phaseFn(beta: number): number {
  const raw = (Math.PI - beta) * Math.cos(beta) + Math.sin(beta); // unnormalised
  return raw / Math.PI; // p(0) = pi/pi = 1
}

function classify(mag: number): BrightnessClass {
  if (mag < 2) return "very bright";
  if (mag < 4) return "bright";
  if (mag < 6.5) return "naked-eye";
  if (mag < 9) return "binoculars";
  return "telescope";
}

/**
 * @param stdMag standard magnitude (apparent mag at 1000 km range, phase 0) for the object's class.
 * Magnitude is a COARSE modelled estimate (no per-object size/BRDF, simplified phase) — for
 * "roughly how bright", never precise photometry.
 */
export function satVisibility(tle1: string, tle2: string, observer: Observer, when: Date, stdMag = 6): Visibility | null {
  const satrec = twoline2satrec(tle1, tle2);
  const pv = propagate(satrec, when);
  const pos = pv.position as EciVec3<number> | false | undefined;
  if (!pos) return null;

  const gmst = gstime(when);
  const obsGd = { longitude: observer.longitudeDeg * DEG, latitude: observer.latitudeDeg * DEG, height: observer.heightKm };
  const look = ecfToLookAngles(obsGd, eciToEcf(pos, gmst));
  const aboveHorizon = look.elevation > 0;
  const rangeKm = look.rangeSat;

  // Sunlit test: cylindrical umbra. In shadow if anti-sunward and within Earth's radius of the Sun-Earth line.
  const s = sunEciKm(when);
  const sMag = Math.hypot(s.x, s.y, s.z);
  const sx = s.x / sMag, sy = s.y / sMag, sz = s.z / sMag;
  const dot = pos.x * sx + pos.y * sy + pos.z * sz;
  let sunlit = true;
  if (dot < 0) {
    const px = pos.x - dot * sx, py = pos.y - dot * sy, pz = pos.z - dot * sz;
    sunlit = Math.hypot(px, py, pz) >= R_EARTH_KM;
  }

  const sunElevationDeg = observerSunElevationDeg(observer, when);
  const observerDark = sunElevationDeg < -6;
  const mayBeVisible = aboveHorizon && sunlit && observerDark;

  // Phase angle (Sun-satellite-observer) for a coarse apparent magnitude.
  let phaseAngleDeg: number | null = null, magnitude: number | null = null, brightnessClass: BrightnessClass | null = null;
  if (sunlit) {
    const oEcf = geodeticToEcf(obsGd);
    const cg = Math.cos(gmst), sg = Math.sin(gmst);
    const oEci = { x: oEcf.x * cg - oEcf.y * sg, y: oEcf.x * sg + oEcf.y * cg, z: oEcf.z };
    const toSun = { x: s.x - pos.x, y: s.y - pos.y, z: s.z - pos.z };
    const toObs = { x: oEci.x - pos.x, y: oEci.y - pos.y, z: oEci.z - pos.z };
    const dotv = toSun.x * toObs.x + toSun.y * toObs.y + toSun.z * toObs.z;
    const mag1 = Math.hypot(toSun.x, toSun.y, toSun.z), mag2 = Math.hypot(toObs.x, toObs.y, toObs.z);
    const beta = Math.acos(Math.max(-1, Math.min(1, dotv / (mag1 * mag2))));
    phaseAngleDeg = beta * RAD2DEG;
    const p = phaseFn(beta);
    magnitude = stdMag + 5 * Math.log10(rangeKm / 1000) - 2.5 * Math.log10(Math.max(p, 1e-4));
    brightnessClass = classify(magnitude);
  }

  return { aboveHorizon, sunlit, observerDark, sunElevationDeg, mayBeVisible, rangeKm, phaseAngleDeg, magnitude, brightnessClass };
}
