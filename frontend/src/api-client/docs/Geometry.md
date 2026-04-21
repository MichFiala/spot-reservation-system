# Geometry


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**factory** | [**GeometryFactory**](GeometryFactory.md) |  | [optional] [default to undefined]
**userData** | **any** |  | [optional] [default to undefined]
**srid** | **number** |  | [optional] [default to undefined]
**geometryType** | **string** |  | [optional] [default to undefined]
**ogcGeometryType** | **number** |  | [optional] [default to undefined]
**precisionModel** | [**PrecisionModel**](PrecisionModel.md) |  | [optional] [default to undefined]
**coordinate** | [**Coordinate2**](Coordinate2.md) |  | [optional] [default to undefined]
**coordinates** | **Array&lt;any&gt;** |  | [optional] [default to undefined]
**numPoints** | **number** |  | [optional] [default to undefined]
**numGeometries** | **number** |  | [optional] [default to undefined]
**isSimple** | **boolean** |  | [optional] [default to undefined]
**isValid** | **boolean** |  | [optional] [default to undefined]
**isEmpty** | **boolean** |  | [optional] [default to undefined]
**area** | **number** |  | [optional] [default to undefined]
**length** | **number** |  | [optional] [default to undefined]
**centroid** | [**Point**](Point.md) |  | [optional] [default to undefined]
**interiorPoint** | **any** |  | [optional] [default to undefined]
**pointOnSurface** | **any** |  | [optional] [default to undefined]
**dimension** | **number** |  | [optional] [default to undefined]
**boundary** | [**Geometry**](Geometry.md) |  | [optional] [default to undefined]
**boundaryDimension** | **number** |  | [optional] [default to undefined]
**envelope** | [**Geometry**](Geometry.md) |  | [optional] [default to undefined]
**envelopeInternal** | **any** |  | [optional] [default to undefined]
**isRectangle** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { Geometry } from './api';

const instance: Geometry = {
    factory,
    userData,
    srid,
    geometryType,
    ogcGeometryType,
    precisionModel,
    coordinate,
    coordinates,
    numPoints,
    numGeometries,
    isSimple,
    isValid,
    isEmpty,
    area,
    length,
    centroid,
    interiorPoint,
    pointOnSurface,
    dimension,
    boundary,
    boundaryDimension,
    envelope,
    envelopeInternal,
    isRectangle,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
