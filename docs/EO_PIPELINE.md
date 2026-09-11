# Earth-Observation Pipeline Foundation

## Scope

The current implementation provides a real, authenticated Sentinel-2 scene-discovery foundation. It queries a standards-compatible SpatioTemporal Asset Catalog (STAC) and returns provider-labelled scene metadata, acquisition timestamps, cloud-cover metadata, bounding boxes, and asset links. It does not fabricate imagery, spectral indices, damage classifications, or confidence values.

The default catalog is Element84 Earth Search. Deployments may replace it with an approved institutional catalog through `STAC_CATALOG_URL`. The API returns an explicit `503` response when the provider is unavailable or returns malformed data.

## API Contract

Authenticated reviewers and administrators can call:

```text
GET /api/earth-observation/sentinel-2/search
  ?bbox=west,south,east,north
  &datetime=2026-01-01T00:00:00Z/2026-12-31T23:59:59Z
  &maxCloudCover=20
  &limit=25
```

The endpoint validates geographic bounds and result limits before making the provider request. Each normalized scene includes a `source` object containing the provider name, catalog URL, and retrieval timestamp. Provider failure is represented as `earth_observation_unavailable` with `retryable: true`; the API never substitutes a successful-looking empty or synthetic response for an upstream failure.

## Temporal Analysis

The server also includes a deterministic temporal-summary library. It accepts timestamped observations containing measured values and optional cloud fractions. It computes the arithmetic mean, median, median absolute deviation, baseline median, latest difference, and a robust z-score only when measurable dispersion is available.

The result separates measured statistics from uncertainty. The implementation reports `UNKNOWN_NOT_CALIBRATED` when the series contains insufficient valid values, nodata, material cloud contamination, or unavailable dispersion. It does not interpret a numerical change as physical heritage damage. Any future classification must remain subject to research review and expert validation.

## Deliberate Limitations

The current phase does not download or process raster bands, perform reprojection, apply cloud-shadow masks, generate NDVI/NDWI/NDBI, process Sentinel-1 SAR, or persist derived rasters. Those operations require a validated raster-processing worker, storage policy, provider licensing review, and calibration datasets. The discovery and temporal-statistics layers are intentionally isolated so those later capabilities can be added without changing the UI contract or overstating scientific conclusions.

| Capability | Current state | Evidence boundary |
|---|---|---|
| Sentinel-2 scene discovery | Implemented | Provider metadata only |
| Cloud-cover filtering | Implemented at STAC query level | Depends on provider metadata |
| Asset provenance | Implemented | Records provider, catalog, and retrieval time |
| Temporal robust statistics | Implemented | Requires measured input values |
| Spectral-index generation | Not yet implemented | No index is claimed |
| Sentinel-1 SAR processing | Not yet implemented | No SAR conclusion is claimed |
| Human validation workflow | Existing reviewer workflow | Required before final classification |

## References

[1]: https://github.com/Element84/earth-search "Element84 Earth Search STAC API"

[2]: https://documentation.dataspace.copernicus.eu/APIs/STAC.html "Copernicus Data Space Ecosystem STAC documentation"
