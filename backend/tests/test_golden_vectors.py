"""Independent SGP4 golden-vector verification (differentiator D9 / Gate G0.5).

Validates the Python SGP4 propagator against the published SGP4-VER reference output for
catalogue object 88888 (Spacetrack Report #3 / Vallado, WGS72) at epoch (tsince = 0). The
identical vector is checked on the JS side by `web/scripts/verify-sgp4.mjs`, so both engines
are pinned to the same independent, authoritative reference rather than to each other.
"""
from sgp4.api import Satrec

# SGP4-VER test object 88888.
L1 = "1 88888U          80275.98708465  .00073094  13844-3  66816-4 0    87"
L2 = "2 88888  72.8435 115.9689 0086731  52.6988 110.5714 16.05824518  1058"

# Published TEME position (km) and velocity (km/s) at tsince = 0 (WGS72).
EXPECTED_R = (2328.97048951, -5995.22076416, 1719.97067261)
EXPECTED_V = (2.91207230, -0.98341546, -7.09081703)
TOL_R_KM = 0.2
TOL_V_KMS = 0.001


def test_sgp4_golden_vector_at_epoch():
    sat = Satrec.twoline2rv(L1, L2)
    err, r, v = sat.sgp4(sat.jdsatepoch, sat.jdsatepochF)
    assert err == 0, f"SGP4 error code {err}"
    for got, exp in zip(r, EXPECTED_R):
        assert abs(got - exp) < TOL_R_KM, f"position {got} vs published {exp}"
    for got, exp in zip(v, EXPECTED_V):
        assert abs(got - exp) < TOL_V_KMS, f"velocity {got} vs published {exp}"
