# ReservationsApi

All URIs are relative to *http://localhost:5042*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiReservationsBySpotSpotIdGet**](#apireservationsbyspotspotidget) | **GET** /api/reservations/by-spot/{spotId} | |
|[**apiReservationsIdCancelPost**](#apireservationsidcancelpost) | **POST** /api/reservations/{id}/cancel | |
|[**apiReservationsIdGet**](#apireservationsidget) | **GET** /api/reservations/{id} | |
|[**apiReservationsMineGet**](#apireservationsmineget) | **GET** /api/reservations/mine | |
|[**apiReservationsPost**](#apireservationspost) | **POST** /api/reservations | |

# **apiReservationsBySpotSpotIdGet**
> Array<ReservationDto> apiReservationsBySpotSpotIdGet()


### Example

```typescript
import {
    ReservationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReservationsApi(configuration);

let spotId: string; // (default to undefined)

const { status, data } = await apiInstance.apiReservationsBySpotSpotIdGet(
    spotId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **spotId** | [**string**] |  | defaults to undefined|


### Return type

**Array<ReservationDto>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiReservationsIdCancelPost**
> apiReservationsIdCancelPost()


### Example

```typescript
import {
    ReservationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReservationsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.apiReservationsIdCancelPost(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No Content |  -  |
|**404** | Not Found |  -  |
|**409** | Conflict |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiReservationsIdGet**
> ReservationDto apiReservationsIdGet()


### Example

```typescript
import {
    ReservationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReservationsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.apiReservationsIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ReservationDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiReservationsMineGet**
> Array<ReservationDto> apiReservationsMineGet()


### Example

```typescript
import {
    ReservationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReservationsApi(configuration);

const { status, data } = await apiInstance.apiReservationsMineGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ReservationDto>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiReservationsPost**
> ReservationDto apiReservationsPost(createReservationRequest)


### Example

```typescript
import {
    ReservationsApi,
    Configuration,
    CreateReservationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ReservationsApi(configuration);

let createReservationRequest: CreateReservationRequest; //

const { status, data } = await apiInstance.apiReservationsPost(
    createReservationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createReservationRequest** | **CreateReservationRequest**|  | |


### Return type

**ReservationDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**409** | Conflict |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

