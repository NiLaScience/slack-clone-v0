/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/getData/route";
exports.ids = ["app/api/getData/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@prisma/client");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:crypto");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2FgetData%2Froute&page=%2Fapi%2FgetData%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2FgetData%2Froute.ts&appDir=%2FUsers%2Fnilsl%2FDocuments%2FNils%2Fprojects%2Fgauntlet%2Fslack-clone-v0%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnilsl%2FDocuments%2FNils%2Fprojects%2Fgauntlet%2Fslack-clone-v0&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2FgetData%2Froute&page=%2Fapi%2FgetData%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2FgetData%2Froute.ts&appDir=%2FUsers%2Fnilsl%2FDocuments%2FNils%2Fprojects%2Fgauntlet%2Fslack-clone-v0%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnilsl%2FDocuments%2FNils%2Fprojects%2Fgauntlet%2Fslack-clone-v0&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_nilsl_Documents_Nils_projects_gauntlet_slack_clone_v0_app_api_getData_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/getData/route.ts */ \"(rsc)/./app/api/getData/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/getData/route\",\n        pathname: \"/api/getData\",\n        filename: \"route\",\n        bundlePath: \"app/api/getData/route\"\n    },\n    resolvedPagePath: \"/Users/nilsl/Documents/Nils/projects/gauntlet/slack-clone-v0/app/api/getData/route.ts\",\n    nextConfigOutput,\n    userland: _Users_nilsl_Documents_Nils_projects_gauntlet_slack_clone_v0_app_api_getData_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZnZXREYXRhJTJGcm91dGUmcGFnZT0lMkZhcGklMkZnZXREYXRhJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGZ2V0RGF0YSUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRm5pbHNsJTJGRG9jdW1lbnRzJTJGTmlscyUyRnByb2plY3RzJTJGZ2F1bnRsZXQlMkZzbGFjay1jbG9uZS12MCUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZuaWxzbCUyRkRvY3VtZW50cyUyRk5pbHMlMkZwcm9qZWN0cyUyRmdhdW50bGV0JTJGc2xhY2stY2xvbmUtdjAmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ3FDO0FBQ2xIO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvbmlsc2wvRG9jdW1lbnRzL05pbHMvcHJvamVjdHMvZ2F1bnRsZXQvc2xhY2stY2xvbmUtdjAvYXBwL2FwaS9nZXREYXRhL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9nZXREYXRhL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvZ2V0RGF0YVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvZ2V0RGF0YS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9uaWxzbC9Eb2N1bWVudHMvTmlscy9wcm9qZWN0cy9nYXVudGxldC9zbGFjay1jbG9uZS12MC9hcHAvYXBpL2dldERhdGEvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2FgetData%2Froute&page=%2Fapi%2FgetData%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2FgetData%2Froute.ts&appDir=%2FUsers%2Fnilsl%2FDocuments%2FNils%2Fprojects%2Fgauntlet%2Fslack-clone-v0%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnilsl%2FDocuments%2FNils%2Fprojects%2Fgauntlet%2Fslack-clone-v0&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./app/api/getData/route.ts":
/*!**********************************!*\
  !*** ./app/api/getData/route.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./lib/db.ts\");\n/* harmony import */ var _clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @clerk/nextjs/server */ \"(rsc)/./node_modules/@clerk/nextjs/dist/esm/server/createGetAuth.js\");\n\n\n\nconst DEFAULT_CHANNELS = [\n    'general',\n    'random'\n];\n// Create default channels if they don't exist\nasync function ensureDefaultChannels() {\n    for (const channelName of DEFAULT_CHANNELS){\n        const existingChannel = await _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.channel.findFirst({\n            where: {\n                name: channelName\n            }\n        });\n        if (!existingChannel) {\n            await _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.channel.create({\n                data: {\n                    id: `channel_${Date.now()}_${Math.random().toString(36).slice(2)}`,\n                    name: channelName,\n                    isPrivate: false,\n                    isDM: false,\n                    createdAt: new Date(),\n                    updatedAt: new Date()\n                }\n            });\n        }\n    }\n}\nasync function GET(req) {\n    try {\n        // Ensure default channels exist\n        await ensureDefaultChannels();\n        const { userId } = (0,_clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_2__.getAuth)(req);\n        if (!userId) {\n            return new next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse(\"Unauthorized\", {\n                status: 401\n            });\n        }\n        // Get all data with limits and selective fields\n        const [channels, messages, users, reactions] = await Promise.all([\n            _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.channel.findMany({\n                select: {\n                    id: true,\n                    name: true,\n                    isPrivate: true,\n                    isDM: true,\n                    isSelfNote: true,\n                    memberships: {\n                        select: {\n                            userId: true\n                        }\n                    }\n                }\n            }),\n            _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.message.findMany({\n                take: 100,\n                orderBy: {\n                    createdAt: 'desc'\n                },\n                select: {\n                    id: true,\n                    content: true,\n                    senderId: true,\n                    channelId: true,\n                    parentMessageId: true,\n                    createdAt: true,\n                    editedAt: true,\n                    attachments: {\n                        select: {\n                            id: true,\n                            filename: true,\n                            fileUrl: true,\n                            contentType: true\n                        }\n                    }\n                }\n            }),\n            _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findMany({\n                select: {\n                    id: true,\n                    name: true,\n                    avatar: true,\n                    status: true,\n                    isBot: true\n                }\n            }),\n            _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.reaction.findMany({\n                select: {\n                    id: true,\n                    emoji: true,\n                    messageId: true,\n                    userId: true\n                }\n            })\n        ]);\n        // Transform channels to include memberIds\n        const transformedChannels = channels.map((channel)=>({\n                ...channel,\n                memberIds: channel.memberships.map((m)=>m.userId)\n            }));\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            channels: transformedChannels,\n            messages: messages.reverse(),\n            users,\n            reactions\n        });\n    } catch (error) {\n        console.error('Failed to get data:', error);\n        return new next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse(JSON.stringify({\n            error: 'Failed to get data',\n            details: error instanceof Error ? error.message : 'Unknown error'\n        }), {\n            status: 500,\n            headers: {\n                'Content-Type': 'application/json'\n            }\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEVBQUUsT0FBTytCLE9BQU87UUFDZEMsUUFBUUQsS0FBSyxDQUFDLHVCQUF1QkE7UUFDckMsT0FBTyxJQUFJOUQscURBQVlBLENBQ3JCZ0UsS0FBS0MsU0FBUyxDQUFDO1lBQ2JILE9BQU87WUFDUEksU0FBU0osaUJBQWlCSyxRQUFRTCxNQUFNeEIsT0FBTyxHQUFHO1FBQ3BELElBQ0E7WUFBRVgsUUFBUTtZQUFLeUMsU0FBUztnQkFBRSxnQkFBZ0I7WUFBbUI7UUFBRTtJQUVuRTtBQUNGIiwic291cmNlcyI6WyIvVXNlcnMvbmlsc2wvRG9jdW1lbnRzL05pbHMvcHJvamVjdHMvZ2F1bnRsZXQvc2xhY2stY2xvbmUtdjAvYXBwL2FwaS9nZXREYXRhL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSwgTmV4dFJlcXVlc3QgfSBmcm9tICduZXh0L3NlcnZlcidcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0AvbGliL2RiJ1xuaW1wb3J0IHsgZ2V0QXV0aCB9IGZyb20gJ0BjbGVyay9uZXh0anMvc2VydmVyJ1xuXG5jb25zdCBERUZBVUxUX0NIQU5ORUxTID0gWydnZW5lcmFsJywgJ3JhbmRvbSddXG5cbi8vIENyZWF0ZSBkZWZhdWx0IGNoYW5uZWxzIGlmIHRoZXkgZG9uJ3QgZXhpc3RcbmFzeW5jIGZ1bmN0aW9uIGVuc3VyZURlZmF1bHRDaGFubmVscygpIHtcbiAgZm9yIChjb25zdCBjaGFubmVsTmFtZSBvZiBERUZBVUxUX0NIQU5ORUxTKSB7XG4gICAgY29uc3QgZXhpc3RpbmdDaGFubmVsID0gYXdhaXQgcHJpc21hLmNoYW5uZWwuZmluZEZpcnN0KHtcbiAgICAgIHdoZXJlOiB7IG5hbWU6IGNoYW5uZWxOYW1lIH1cbiAgICB9KVxuXG4gICAgaWYgKCFleGlzdGluZ0NoYW5uZWwpIHtcbiAgICAgIGF3YWl0IHByaXNtYS5jaGFubmVsLmNyZWF0ZSh7XG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBpZDogYGNoYW5uZWxfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpfWAsXG4gICAgICAgICAgbmFtZTogY2hhbm5lbE5hbWUsXG4gICAgICAgICAgaXNQcml2YXRlOiBmYWxzZSxcbiAgICAgICAgICBpc0RNOiBmYWxzZSxcbiAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxOiBOZXh0UmVxdWVzdCkge1xuICB0cnkge1xuICAgIC8vIEVuc3VyZSBkZWZhdWx0IGNoYW5uZWxzIGV4aXN0XG4gICAgYXdhaXQgZW5zdXJlRGVmYXVsdENoYW5uZWxzKClcblxuICAgIGNvbnN0IHsgdXNlcklkIH0gPSBnZXRBdXRoKHJlcSlcbiAgICBpZiAoIXVzZXJJZCkge1xuICAgICAgcmV0dXJuIG5ldyBOZXh0UmVzcG9uc2UoXCJVbmF1dGhvcml6ZWRcIiwgeyBzdGF0dXM6IDQwMSB9KVxuICAgIH1cblxuICAgIC8vIEdldCBhbGwgZGF0YSB3aXRoIGxpbWl0cyBhbmQgc2VsZWN0aXZlIGZpZWxkc1xuICAgIGNvbnN0IFtjaGFubmVscywgbWVzc2FnZXMsIHVzZXJzLCByZWFjdGlvbnNdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgcHJpc21hLmNoYW5uZWwuZmluZE1hbnkoe1xuICAgICAgICBzZWxlY3Q6IHtcbiAgICAgICAgICBpZDogdHJ1ZSxcbiAgICAgICAgICBuYW1lOiB0cnVlLFxuICAgICAgICAgIGlzUHJpdmF0ZTogdHJ1ZSxcbiAgICAgICAgICBpc0RNOiB0cnVlLFxuICAgICAgICAgIGlzU2VsZk5vdGU6IHRydWUsXG4gICAgICAgICAgbWVtYmVyc2hpcHM6IHtcbiAgICAgICAgICAgIHNlbGVjdDoge1xuICAgICAgICAgICAgICB1c2VySWQ6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgcHJpc21hLm1lc3NhZ2UuZmluZE1hbnkoe1xuICAgICAgICB0YWtlOiAxMDAsIC8vIExpbWl0IHRvIGxhc3QgMTAwIG1lc3NhZ2VzXG4gICAgICAgIG9yZGVyQnk6IHtcbiAgICAgICAgICBjcmVhdGVkQXQ6ICdkZXNjJ1xuICAgICAgICB9LFxuICAgICAgICBzZWxlY3Q6IHtcbiAgICAgICAgICBpZDogdHJ1ZSxcbiAgICAgICAgICBjb250ZW50OiB0cnVlLFxuICAgICAgICAgIHNlbmRlcklkOiB0cnVlLFxuICAgICAgICAgIGNoYW5uZWxJZDogdHJ1ZSxcbiAgICAgICAgICBwYXJlbnRNZXNzYWdlSWQ6IHRydWUsXG4gICAgICAgICAgY3JlYXRlZEF0OiB0cnVlLFxuICAgICAgICAgIGVkaXRlZEF0OiB0cnVlLFxuICAgICAgICAgIGF0dGFjaG1lbnRzOiB7XG4gICAgICAgICAgICBzZWxlY3Q6IHtcbiAgICAgICAgICAgICAgaWQ6IHRydWUsXG4gICAgICAgICAgICAgIGZpbGVuYW1lOiB0cnVlLFxuICAgICAgICAgICAgICBmaWxlVXJsOiB0cnVlLFxuICAgICAgICAgICAgICBjb250ZW50VHlwZTogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICBwcmlzbWEudXNlci5maW5kTWFueSh7XG4gICAgICAgIHNlbGVjdDoge1xuICAgICAgICAgIGlkOiB0cnVlLFxuICAgICAgICAgIG5hbWU6IHRydWUsXG4gICAgICAgICAgYXZhdGFyOiB0cnVlLFxuICAgICAgICAgIHN0YXR1czogdHJ1ZSxcbiAgICAgICAgICBpc0JvdDogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHByaXNtYS5yZWFjdGlvbi5maW5kTWFueSh7XG4gICAgICAgIHNlbGVjdDoge1xuICAgICAgICAgIGlkOiB0cnVlLFxuICAgICAgICAgIGVtb2ppOiB0cnVlLFxuICAgICAgICAgIG1lc3NhZ2VJZDogdHJ1ZSxcbiAgICAgICAgICB1c2VySWQ6IHRydWVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICBdKVxuXG4gICAgLy8gVHJhbnNmb3JtIGNoYW5uZWxzIHRvIGluY2x1ZGUgbWVtYmVySWRzXG4gICAgY29uc3QgdHJhbnNmb3JtZWRDaGFubmVscyA9IGNoYW5uZWxzLm1hcChjaGFubmVsID0+ICh7XG4gICAgICAuLi5jaGFubmVsLFxuICAgICAgbWVtYmVySWRzOiBjaGFubmVsLm1lbWJlcnNoaXBzLm1hcChtID0+IG0udXNlcklkKVxuICAgIH0pKVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIGNoYW5uZWxzOiB0cmFuc2Zvcm1lZENoYW5uZWxzLFxuICAgICAgbWVzc2FnZXM6IG1lc3NhZ2VzLnJldmVyc2UoKSwgLy8gUmV2ZXJzZSB0byBnZXQgY2hyb25vbG9naWNhbCBvcmRlclxuICAgICAgdXNlcnMsXG4gICAgICByZWFjdGlvbnNcbiAgICB9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBnZXQgZGF0YTonLCBlcnJvcilcbiAgICByZXR1cm4gbmV3IE5leHRSZXNwb25zZShcbiAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gZ2V0IGRhdGEnLFxuICAgICAgICBkZXRhaWxzOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ1xuICAgICAgfSksXG4gICAgICB7IHN0YXR1czogNTAwLCBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSB9XG4gICAgKVxuICB9XG59ICJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJwcmlzbWEiLCJnZXRBdXRoIiwiREVGQVVMVF9DSEFOTkVMUyIsImVuc3VyZURlZmF1bHRDaGFubmVscyIsImNoYW5uZWxOYW1lIiwiZXhpc3RpbmdDaGFubmVsIiwiY2hhbm5lbCIsImZpbmRGaXJzdCIsIndoZXJlIiwibmFtZSIsImNyZWF0ZSIsImRhdGEiLCJpZCIsIkRhdGUiLCJub3ciLCJNYXRoIiwicmFuZG9tIiwidG9TdHJpbmciLCJzbGljZSIsImlzUHJpdmF0ZSIsImlzRE0iLCJjcmVhdGVkQXQiLCJ1cGRhdGVkQXQiLCJHRVQiLCJyZXEiLCJ1c2VySWQiLCJzdGF0dXMiLCJjaGFubmVscyIsIm1lc3NhZ2VzIiwidXNlcnMiLCJyZWFjdGlvbnMiLCJQcm9taXNlIiwiYWxsIiwiZmluZE1hbnkiLCJzZWxlY3QiLCJpc1NlbGZOb3RlIiwibWVtYmVyc2hpcHMiLCJtZXNzYWdlIiwidGFrZSIsIm9yZGVyQnkiLCJjb250ZW50Iiwic2VuZGVySWQiLCJjaGFubmVsSWQiLCJwYXJlbnRNZXNzYWdlSWQiLCJlZGl0ZWRBdCIsImF0dGFjaG1lbnRzIiwiZmlsZW5hbWUiLCJmaWxlVXJsIiwiY29udGVudFR5cGUiLCJ1c2VyIiwiYXZhdGFyIiwiaXNCb3QiLCJyZWFjdGlvbiIsImVtb2ppIiwibWVzc2FnZUlkIiwidHJhbnNmb3JtZWRDaGFubmVscyIsIm1hcCIsIm1lbWJlcklkcyIsIm0iLCJqc29uIiwicmV2ZXJzZSIsImVycm9yIiwiY29uc29sZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJkZXRhaWxzIiwiRXJyb3IiLCJoZWFkZXJzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/getData/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/db.ts":
/*!*******************!*\
  !*** ./lib/db.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nlet prisma;\nif (false) {} else {\n    if (!global.prisma) {\n        global.prisma = new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\n    }\n    prisma = global.prisma;\n}\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZGIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQTZDO0FBTTdDLElBQUlDO0FBRUosSUFBSUMsS0FBcUMsRUFBRSxFQUUxQyxNQUFNO0lBQ0wsSUFBSSxDQUFDQyxPQUFPRixNQUFNLEVBQUU7UUFDbEJFLE9BQU9GLE1BQU0sR0FBRyxJQUFJRCx3REFBWUE7SUFDbEM7SUFDQUMsU0FBU0UsT0FBT0YsTUFBTTtBQUN4QjtBQUVpQiIsInNvdXJjZXMiOlsiL1VzZXJzL25pbHNsL0RvY3VtZW50cy9OaWxzL3Byb2plY3RzL2dhdW50bGV0L3NsYWNrLWNsb25lLXYwL2xpYi9kYi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCdcblxuZGVjbGFyZSBnbG9iYWwge1xuICB2YXIgcHJpc21hOiBQcmlzbWFDbGllbnQgfCB1bmRlZmluZWRcbn1cblxubGV0IHByaXNtYTogUHJpc21hQ2xpZW50XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIHByaXNtYSA9IG5ldyBQcmlzbWFDbGllbnQoKVxufSBlbHNlIHtcbiAgaWYgKCFnbG9iYWwucHJpc21hKSB7XG4gICAgZ2xvYmFsLnByaXNtYSA9IG5ldyBQcmlzbWFDbGllbnQoKVxuICB9XG4gIHByaXNtYSA9IGdsb2JhbC5wcmlzbWFcbn1cblxuZXhwb3J0IHsgcHJpc21hIH0iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwicHJpc21hIiwicHJvY2VzcyIsImdsb2JhbCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/db.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/@clerk","vendor-chunks/tslib","vendor-chunks/cookie","vendor-chunks/map-obj","vendor-chunks/no-case","vendor-chunks/lower-case","vendor-chunks/snakecase-keys","vendor-chunks/snake-case","vendor-chunks/dot-case","vendor-chunks/next","vendor-chunks/crypto-js"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2FgetData%2Froute&page=%2Fapi%2FgetData%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2FgetData%2Froute.ts&appDir=%2FUsers%2Fnilsl%2FDocuments%2FNils%2Fprojects%2Fgauntlet%2Fslack-clone-v0%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnilsl%2FDocuments%2FNils%2Fprojects%2Fgauntlet%2Fslack-clone-v0&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();