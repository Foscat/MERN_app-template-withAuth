## Modules

<dl>
<dt><a href="#module_server">server</a></dt>
<dd><p>Express server bootstrap for API routes, auth cookies, CORS, and Vite static hosting.</p>
</dd>
<dt><a href="#module_app/controllers/hash">app/controllers/hash</a></dt>
<dd><p>Password hashing utilities used by authentication flows.</p>
</dd>
<dt><a href="#module_app/controllers/users">app/controllers/users</a></dt>
<dd><p>User authentication and CRUD controller methods.</p>
</dd>
<dt><a href="#module_app/middleware/auth">app/middleware/auth</a></dt>
<dd><p>Authentication and authorization middleware for Express routes.</p>
</dd>
<dt><a href="#module_app/models">app/models</a></dt>
<dd><p>Model registry for database collections.</p>
</dd>
<dt><a href="#module_app/models/users">app/models/users</a></dt>
<dd><p>Mongoose model for application users.</p>
</dd>
<dt><a href="#module_app/routes/api">app/routes/api</a></dt>
<dd><p>API route index that mounts resource-specific routers.</p>
</dd>
<dt><a href="#module_app/routes/api/users">app/routes/api/users</a></dt>
<dd><p>Router for authentication and user CRUD endpoints.</p>
</dd>
<dt><a href="#module_app/routes">app/routes</a></dt>
<dd><p>Root router that mounts all API route groups.</p>
</dd>
<dt><a href="#module_client/src/api/API">client/src/api/API</a></dt>
<dd><p>Legacy API facade with auth helpers and user CRUD wrappers.</p>
</dd>
<dt><a href="#module_client/src/api/auth">client/src/api/auth</a></dt>
<dd><p>Auth-focused API utilities for login and registration.</p>
</dd>
<dt><a href="#api.auth.module_test">test</a></dt>
<dd><p>Test module for client behavior verification.</p>
</dd>
<dt><a href="#module_client/src/api/axiosClient">client/src/api/axiosClient</a></dt>
<dd><p>Shared axios instance configured for JWT auth and automatic token refresh.</p>
</dd>
</dl>

<a name="module_server"></a>

## server
Express server bootstrap for API routes, auth cookies, CORS, and Vite static hosting.

<a name="module_server..startServer"></a>

### server~startServer() ⇒ <code>Promise.&lt;void&gt;</code>
Connect to MongoDB and start the HTTP server.

**Kind**: inner method of [<code>server</code>](#module_server)  
<a name="module_app/controllers/hash"></a>

## app/controllers/hash
Password hashing utilities used by authentication flows.


* [app/controllers/hash](#module_app/controllers/hash)
    * [~hashThis(input)](#module_app/controllers/hash..hashThis) ⇒ <code>string</code>
    * [~compareHash(plainTxt, hash)](#module_app/controllers/hash..compareHash) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="module_app/controllers/hash..hashThis"></a>

### app/controllers/hash~hashThis(input) ⇒ <code>string</code>
Hash plain text input using bcrypt.

**Kind**: inner method of [<code>app/controllers/hash</code>](#module_app/controllers/hash)  
**Returns**: <code>string</code> - Bcrypt hash.  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | Plain text password. |

<a name="module_app/controllers/hash..compareHash"></a>

### app/controllers/hash~compareHash(plainTxt, hash) ⇒ <code>Promise.&lt;boolean&gt;</code>
Compare a plain text value to a bcrypt hash.

**Kind**: inner method of [<code>app/controllers/hash</code>](#module_app/controllers/hash)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - True when the values match.  

| Param | Type | Description |
| --- | --- | --- |
| plainTxt | <code>string</code> | Plain text password. |
| hash | <code>string</code> | Stored bcrypt hash. |

<a name="module_app/controllers/users"></a>

## app/controllers/users
User authentication and CRUD controller methods.


* [app/controllers/users](#module_app/controllers/users)
    * [~signAccessToken(payload)](#module_app/controllers/users..signAccessToken) ⇒ <code>string</code>
    * [~signRefreshToken(payload)](#module_app/controllers/users..signRefreshToken) ⇒ <code>string</code>
    * [~setRefreshCookie(res, token)](#module_app/controllers/users..setRefreshCookie) ⇒ <code>void</code>
    * [~buildPayload(user)](#module_app/controllers/users..buildPayload) ⇒ <code>TokenPayload</code>
    * [~findAll(req, res)](#module_app/controllers/users..findAll) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~findById(req, res)](#module_app/controllers/users..findById) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~register(req, res)](#module_app/controllers/users..register) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~create(req, res)](#module_app/controllers/users..create) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~update(req, res)](#module_app/controllers/users..update) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~remove(req, res)](#module_app/controllers/users..remove) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~login(req, res)](#module_app/controllers/users..login) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~refreshToken(req, res)](#module_app/controllers/users..refreshToken) ⇒ <code>void</code>
    * [~logout(req, res)](#module_app/controllers/users..logout) ⇒ <code>void</code>
    * [~currentUser(req, res)](#module_app/controllers/users..currentUser) ⇒ <code>void</code>
    * [~AuthenticatedRequest](#module_app/controllers/users..AuthenticatedRequest) : <code>Object</code>
    * [~TokenPayload](#module_app/controllers/users..TokenPayload) : <code>Object</code>

<a name="module_app/controllers/users..signAccessToken"></a>

### app/controllers/users~signAccessToken(payload) ⇒ <code>string</code>
Sign a short-lived JWT access token.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  
**Returns**: <code>string</code> - Signed access token.  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>TokenPayload</code> | Claims to include in the token. |

<a name="module_app/controllers/users..signRefreshToken"></a>

### app/controllers/users~signRefreshToken(payload) ⇒ <code>string</code>
Sign a long-lived JWT refresh token.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  
**Returns**: <code>string</code> - Signed refresh token.  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>TokenPayload</code> | Claims to include in the token. |

<a name="module_app/controllers/users..setRefreshCookie"></a>

### app/controllers/users~setRefreshCookie(res, token) ⇒ <code>void</code>
Attach refresh token as an HTTP-only cookie.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>Object</code> | Express response. |
| token | <code>string</code> | Refresh token value. |

<a name="module_app/controllers/users..buildPayload"></a>

### app/controllers/users~buildPayload(user) ⇒ <code>TokenPayload</code>
Build token payload from a user record.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  
**Returns**: <code>TokenPayload</code> - Token claims.  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | User document. |

<a name="module_app/controllers/users..findAll"></a>

### app/controllers/users~findAll(req, res) ⇒ <code>Promise.&lt;void&gt;</code>
Return all users matching query params.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Express request. |
| res | <code>Object</code> | Express response. |

<a name="module_app/controllers/users..findById"></a>

### app/controllers/users~findById(req, res) ⇒ <code>Promise.&lt;void&gt;</code>
Return a user by id.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Express request. |
| res | <code>Object</code> | Express response. |

<a name="module_app/controllers/users..register"></a>

### app/controllers/users~register(req, res) ⇒ <code>Promise.&lt;void&gt;</code>
Register a new user and return an access token.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Express request. |
| res | <code>Object</code> | Express response. |

<a name="module_app/controllers/users..create"></a>

### app/controllers/users~create(req, res) ⇒ <code>Promise.&lt;void&gt;</code>
Legacy alias for register endpoint behavior.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Express request. |
| res | <code>Object</code> | Express response. |

<a name="module_app/controllers/users..update"></a>

### app/controllers/users~update(req, res) ⇒ <code>Promise.&lt;void&gt;</code>
Update a user by id.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Express request. |
| res | <code>Object</code> | Express response. |

<a name="module_app/controllers/users..remove"></a>

### app/controllers/users~remove(req, res) ⇒ <code>Promise.&lt;void&gt;</code>
Delete a user by id.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Express request. |
| res | <code>Object</code> | Express response. |

<a name="module_app/controllers/users..login"></a>

### app/controllers/users~login(req, res) ⇒ <code>Promise.&lt;void&gt;</code>
Authenticate a user and return an access token.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Express request. |
| res | <code>Object</code> | Express response. |

<a name="module_app/controllers/users..refreshToken"></a>

### app/controllers/users~refreshToken(req, res) ⇒ <code>void</code>
Refresh the access token using the refresh cookie.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Express request. |
| res | <code>Object</code> | Express response. |

<a name="module_app/controllers/users..logout"></a>

### app/controllers/users~logout(req, res) ⇒ <code>void</code>
Clear the refresh token cookie.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Express request. |
| res | <code>Object</code> | Express response. |

<a name="module_app/controllers/users..currentUser"></a>

### app/controllers/users~currentUser(req, res) ⇒ <code>void</code>
Return the currently authenticated user payload from middleware.

**Kind**: inner method of [<code>app/controllers/users</code>](#module_app/controllers/users)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>AuthenticatedRequest</code> | Express request. |
| res | <code>Object</code> | Express response. |

<a name="module_app/controllers/users..AuthenticatedRequest"></a>

### app/controllers/users~AuthenticatedRequest : <code>Object</code>
**Kind**: inner typedef of [<code>app/controllers/users</code>](#module_app/controllers/users)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [user] | <code>Object</code> | Authenticated token payload. |
| [user.id] | <code>string</code> | User id. |
| [user.email] | <code>string</code> | User email. |
| [user.role] | <code>string</code> | User role. |

<a name="module_app/controllers/users..TokenPayload"></a>

### app/controllers/users~TokenPayload : <code>Object</code>
**Kind**: inner typedef of [<code>app/controllers/users</code>](#module_app/controllers/users)  
<a name="module_app/middleware/auth"></a>

## app/middleware/auth
Authentication and authorization middleware for Express routes.


* [app/middleware/auth](#module_app/middleware/auth)
    * [~requireAuth(req, res, next)](#module_app/middleware/auth..requireAuth) ⇒ <code>void</code>
    * [~requireRole(...roles)](#module_app/middleware/auth..requireRole) ⇒ <code>function</code>
    * [~AuthenticatedRequest](#module_app/middleware/auth..AuthenticatedRequest) : <code>Object</code>

<a name="module_app/middleware/auth..requireAuth"></a>

### app/middleware/auth~requireAuth(req, res, next) ⇒ <code>void</code>
Verify a bearer access token and attach decoded claims to `req.user`.

**Kind**: inner method of [<code>app/middleware/auth</code>](#module_app/middleware/auth)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>AuthenticatedRequest</code> | Express request. |
| res | <code>Object</code> | Express response. |
| next | <code>function</code> | Next middleware callback. |

<a name="module_app/middleware/auth..requireRole"></a>

### app/middleware/auth~requireRole(...roles) ⇒ <code>function</code>
Allow access only when `req.user.role` is one of the provided roles.

**Kind**: inner method of [<code>app/middleware/auth</code>](#module_app/middleware/auth)  
**Returns**: <code>function</code> - Role-check middleware.  

| Param | Type | Description |
| --- | --- | --- |
| ...roles | <code>string</code> | Allowed role names. |

<a name="module_app/middleware/auth..AuthenticatedRequest"></a>

### app/middleware/auth~AuthenticatedRequest : <code>Object</code>
**Kind**: inner typedef of [<code>app/middleware/auth</code>](#module_app/middleware/auth)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [user] | <code>Object</code> | Authenticated token payload. |
| [user.id] | <code>string</code> | User id. |
| [user.email] | <code>string</code> | User email. |
| [user.role] | <code>string</code> | User role. |

<a name="module_app/models"></a>

## app/models
Model registry for database collections.

<a name="module_app/models/users"></a>

## app/models/users
Mongoose model for application users.


* [app/models/users](#module_app/models/users)
    * [~userSchema](#module_app/models/users..userSchema) : <code>mongoose.Schema</code>
    * [~User](#module_app/models/users..User) : <code>mongoose.Model</code>

<a name="module_app/models/users..userSchema"></a>

### app/models/users~userSchema : <code>mongoose.Schema</code>
User schema for authentication and profile fields.

**Kind**: inner constant of [<code>app/models/users</code>](#module_app/models/users)  
<a name="module_app/models/users..User"></a>

### app/models/users~User : <code>mongoose.Model</code>
User collection model.

**Kind**: inner constant of [<code>app/models/users</code>](#module_app/models/users)  
<a name="module_app/routes/api"></a>

## app/routes/api
API route index that mounts resource-specific routers.

<a name="module_app/routes/api/users"></a>

## app/routes/api/users
Router for authentication and user CRUD endpoints.

<a name="module_app/routes"></a>

## app/routes
Root router that mounts all API route groups.

<a name="module_client/src/api/API"></a>

## client/src/api/API
Legacy API facade with auth helpers and user CRUD wrappers.


* [client/src/api/API](#module_client/src/api/API)
    * _static_
        * [.loginUser](#module_client/src/api/API.loginUser) ⇒ <code>Promise.&lt;{token: string}&gt;</code>
        * [.registerUser](#module_client/src/api/API.registerUser) ⇒ <code>Promise.&lt;{token: string}&gt;</code>
        * [.addUser(userData)](#module_client/src/api/API.addUser) ⇒ <code>Promise.&lt;Object&gt;</code>
        * [.getUsers()](#module_client/src/api/API.getUsers) ⇒ <code>Promise.&lt;Object&gt;</code>
        * [.updateUser(id, updateData)](#module_client/src/api/API.updateUser) ⇒ <code>Promise.&lt;Object&gt;</code>
        * [.deleteUser(id)](#module_client/src/api/API.deleteUser) ⇒ <code>Promise.&lt;Object&gt;</code>
        * ~~[.signInUser(signInData)](#module_client/src/api/API.signInUser) ⇒ <code>Promise.&lt;Object&gt;</code>~~
        * ~~[.currentUser(token)](#module_client/src/api/API.currentUser) ⇒ <code>Promise.&lt;Object&gt;</code>~~
    * _inner_
        * [~LoginPayload](#module_client/src/api/API..LoginPayload) : <code>Object</code>
        * [~RegisterPayload](#module_client/src/api/API..RegisterPayload) : <code>Object</code>

<a name="module_client/src/api/API.loginUser"></a>

### client/src/api/API.loginUser ⇒ <code>Promise.&lt;{token: string}&gt;</code>
Authenticate and return an access token.

**Kind**: static constant of [<code>client/src/api/API</code>](#module_client/src/api/API)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>LoginPayload</code> | Login payload. |

<a name="module_client/src/api/API.registerUser"></a>

### client/src/api/API.registerUser ⇒ <code>Promise.&lt;{token: string}&gt;</code>
Register and return an access token.

**Kind**: static constant of [<code>client/src/api/API</code>](#module_client/src/api/API)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>RegisterPayload</code> | Register payload. |

<a name="module_client/src/api/API.addUser"></a>

### client/src/api/API.addUser(userData) ⇒ <code>Promise.&lt;Object&gt;</code>
Create a user via legacy endpoint.

**Kind**: static method of [<code>client/src/api/API</code>](#module_client/src/api/API)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>object</code> | User fields. |

<a name="module_client/src/api/API.getUsers"></a>

### client/src/api/API.getUsers() ⇒ <code>Promise.&lt;Object&gt;</code>
Fetch all users.

**Kind**: static method of [<code>client/src/api/API</code>](#module_client/src/api/API)  
<a name="module_client/src/api/API.updateUser"></a>

### client/src/api/API.updateUser(id, updateData) ⇒ <code>Promise.&lt;Object&gt;</code>
Update a user by id.

**Kind**: static method of [<code>client/src/api/API</code>](#module_client/src/api/API)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | User id. |
| updateData | <code>object</code> | Fields to patch. |

<a name="module_client/src/api/API.deleteUser"></a>

### client/src/api/API.deleteUser(id) ⇒ <code>Promise.&lt;Object&gt;</code>
Delete a user by id.

**Kind**: static method of [<code>client/src/api/API</code>](#module_client/src/api/API)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | User id. |

<a name="module_client/src/api/API.signInUser"></a>

### ~~client/src/api/API.signInUser(signInData) ⇒ <code>Promise.&lt;Object&gt;</code>~~
***Endpoint `/api/users/signIn` is legacy and may not exist.***

**Kind**: static method of [<code>client/src/api/API</code>](#module_client/src/api/API)  

| Param | Type | Description |
| --- | --- | --- |
| signInData | <code>object</code> | Sign-in payload. |

<a name="module_client/src/api/API.currentUser"></a>

### ~~client/src/api/API.currentUser(token) ⇒ <code>Promise.&lt;Object&gt;</code>~~
***Prefer `GET /api/users/current` through axiosClient with bearer auth.***

**Kind**: static method of [<code>client/src/api/API</code>](#module_client/src/api/API)  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>object</code> | Legacy token payload. |

<a name="module_client/src/api/API..LoginPayload"></a>

### client/src/api/API~LoginPayload : <code>Object</code>
**Kind**: inner typedef of [<code>client/src/api/API</code>](#module_client/src/api/API)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| email | <code>string</code> | User email. |
| password | <code>string</code> | User password. |

<a name="module_client/src/api/API..RegisterPayload"></a>

### client/src/api/API~RegisterPayload : <code>Object</code>
**Kind**: inner typedef of [<code>client/src/api/API</code>](#module_client/src/api/API)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| email | <code>string</code> | User email. |
| password | <code>string</code> | User password. |
| [name] | <code>string</code> | Display name. |
| [username] | <code>string</code> | Unique username. |
| [phone_num] | <code>number</code> | Optional phone number. |
| [role] | <code>string</code> | Optional role override. |

<a name="module_client/src/api/auth"></a>

## client/src/api/auth
Auth-focused API utilities for login and registration.


* [client/src/api/auth](#module_client/src/api/auth)
    * _static_
        * [.loginUser](#module_client/src/api/auth.loginUser) ⇒ <code>Promise.&lt;{token: string}&gt;</code>
        * [.registerUser](#module_client/src/api/auth.registerUser) ⇒ <code>Promise.&lt;{token: string}&gt;</code>
    * _inner_
        * [~LoginPayload](#module_client/src/api/auth..LoginPayload) : <code>Object</code>
        * [~RegisterPayload](#module_client/src/api/auth..RegisterPayload) : <code>Object</code>

<a name="module_client/src/api/auth.loginUser"></a>

### client/src/api/auth.loginUser ⇒ <code>Promise.&lt;{token: string}&gt;</code>
Log in with credentials and receive an access token.

**Kind**: static constant of [<code>client/src/api/auth</code>](#module_client/src/api/auth)  
**Returns**: <code>Promise.&lt;{token: string}&gt;</code> - API response payload.  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>LoginPayload</code> | Login request payload. |

<a name="module_client/src/api/auth.registerUser"></a>

### client/src/api/auth.registerUser ⇒ <code>Promise.&lt;{token: string}&gt;</code>
Register a new account and receive an access token.

**Kind**: static constant of [<code>client/src/api/auth</code>](#module_client/src/api/auth)  
**Returns**: <code>Promise.&lt;{token: string}&gt;</code> - API response payload.  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>RegisterPayload</code> | Registration request payload. |

<a name="module_client/src/api/auth..LoginPayload"></a>

### client/src/api/auth~LoginPayload : <code>Object</code>
**Kind**: inner typedef of [<code>client/src/api/auth</code>](#module_client/src/api/auth)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| email | <code>string</code> | User email. |
| password | <code>string</code> | User password. |

<a name="module_client/src/api/auth..RegisterPayload"></a>

### client/src/api/auth~RegisterPayload : <code>Object</code>
**Kind**: inner typedef of [<code>client/src/api/auth</code>](#module_client/src/api/auth)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| email | <code>string</code> | User email. |
| password | <code>string</code> | User password. |
| [name] | <code>string</code> | Display name. |
| [username] | <code>string</code> | Unique username. |
| [phone_num] | <code>number</code> | Optional phone number. |
| [role] | <code>string</code> | Optional role override. |

<a name="api.auth.module_test"></a>

## test
Test module for client behavior verification.

<a name="module_client/src/api/axiosClient"></a>

## client/src/api/axiosClient
Shared axios instance configured for JWT auth and automatic token refresh.


* [client/src/api/axiosClient](#module_client/src/api/axiosClient)
    * [~pendingRequests](#module_client/src/api/axiosClient..pendingRequests) : <code>Array.&lt;Object&gt;</code>
    * [~api](#module_client/src/api/axiosClient..api) : <code>Object</code>
    * [~processQueue(error, [token])](#module_client/src/api/axiosClient..processQueue) ⇒ <code>void</code>

<a name="module_client/src/api/axiosClient..pendingRequests"></a>

### client/src/api/axiosClient~pendingRequests : <code>Array.&lt;Object&gt;</code>
**Kind**: inner property of [<code>client/src/api/axiosClient</code>](#module_client/src/api/axiosClient)  
<a name="module_client/src/api/axiosClient..api"></a>

### client/src/api/axiosClient~api : <code>Object</code>
Axios instance for all frontend API requests.

**Kind**: inner constant of [<code>client/src/api/axiosClient</code>](#module_client/src/api/axiosClient)  
<a name="module_client/src/api/axiosClient..processQueue"></a>

### client/src/api/axiosClient~processQueue(error, [token]) ⇒ <code>void</code>
Resolve or reject queued API requests waiting on token refresh.

**Kind**: inner method of [<code>client/src/api/axiosClient</code>](#module_client/src/api/axiosClient)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| error | <code>\*</code> |  | Error to reject with, if refresh failed. |
| [token] | <code>string</code> \| <code>null</code> | <code>null</code> | New access token if refresh succeeded. |

