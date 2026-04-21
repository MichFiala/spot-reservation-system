# SpotsApi

All URIs are relative to *http://localhost:5042*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiSpotsGet**](#apispotsget) | **GET** /api/spots | |
|[**apiSpotsIdDelete**](#apispotsiddelete) | **DELETE** /api/spots/{id} | |
|[**apiSpotsIdGet**](#apispotsidget) | **GET** /api/spots/{id} | |
|[**apiSpotsIdPut**](#apispotsidput) | **PUT** /api/spots/{id} | |
|[**apiSpotsPost**](#apispotspost) | **POST** /api/spots | |

# **apiSpotsGet**
> Array<SpotDto> apiSpotsGet()


### Example

```typescript
import {
    SpotsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SpotsApi(configuration);

let onlyActive: boolean; // (optional) (default to true)

const { status, data } = await apiInstance.apiSpotsGet(
    onlyActive
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **onlyActive** | [**boolean**] |  | (optional) defaults to true|


### Return type

**Array<SpotDto>**

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

# **apiSpotsIdDelete**
> apiSpotsIdDelete()


### Example

```typescript
import {
    SpotsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SpotsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.apiSpotsIdDelete(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiSpotsIdGet**
> SpotDto apiSpotsIdGet()


### Example

```typescript
import {
    SpotsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SpotsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.apiSpotsIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SpotDto**

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

# **apiSpotsIdPut**
> SpotDto apiSpotsIdPut(updateSpotRequest)


### Example

```typescript
import {
    SpotsApi,
    Configuration,
    UpdateSpotRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SpotsApi(configuration);

let id: string; // (default to undefined)
let updateSpotRequest: UpdateSpotRequest; //

const { status, data } = await apiInstance.apiSpotsIdPut(
    id,
    updateSpotRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateSpotRequest** | **UpdateSpotRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SpotDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiSpotsPost**
> SpotDto apiSpotsPost(createSpotRequest)


### Example

```typescript
import {
    SpotsApi,
    Configuration,
    CreateSpotRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SpotsApi(configuration);

let createSpotRequest: CreateSpotRequest; //

const { status, data } = await apiInstance.apiSpotsPost(
    createSpotRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createSpotRequest** | **CreateSpotRequest**|  | |


### Return type

**SpotDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

