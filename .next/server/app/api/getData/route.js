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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./lib/db.ts\");\n/* harmony import */ var _clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @clerk/nextjs/server */ \"(rsc)/./node_modules/@clerk/nextjs/dist/esm/server/createGetAuth.js\");\n\n\n\nasync function GET(request) {\n    try {\n        console.log('Starting getData request');\n        const { userId } = (0,_clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_2__.getAuth)(request);\n        if (!userId) {\n            return new next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse(\"Unauthorized\", {\n                status: 401\n            });\n        }\n        // Verify user exists\n        const user = await _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findUnique({\n            where: {\n                id: userId\n            }\n        });\n        if (!user) {\n            return new next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse(JSON.stringify({\n                error: \"User not found\"\n            }), {\n                status: 404,\n                headers: {\n                    'Content-Type': 'application/json'\n                }\n            });\n        }\n        // Fetch all data\n        console.log('Fetching all data');\n        const [users, channels, messages, reactions] = await Promise.all([\n            _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findMany(),\n            _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.channel.findMany({\n                include: {\n                    memberships: true\n                }\n            }),\n            _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.message.findMany({\n                include: {\n                    attachments: true,\n                    sender: true,\n                    channel: true\n                }\n            }),\n            _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.reaction.findMany()\n        ]);\n        // Add memberIds to channels\n        const channelsWithMemberIds = channels.map((channel)=>({\n                ...channel,\n                memberIds: channel.memberships.map((m)=>m.userId)\n            }));\n        console.log('Data fetch complete:', {\n            userCount: users.length,\n            channelCount: channels.length,\n            messageCount: messages.length,\n            reactionCount: reactions.length\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            users,\n            channels: channelsWithMemberIds,\n            messages,\n            reactions\n        });\n    } catch (error) {\n        console.error('Failed to fetch data:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Internal Server Error\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2dldERhdGEvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUF1RDtBQUN0QjtBQUNhO0FBR3ZDLGVBQWVHLElBQUlDLE9BQW9CO0lBQzVDLElBQUk7UUFDRkMsUUFBUUMsR0FBRyxDQUFDO1FBRVosTUFBTSxFQUFFQyxNQUFNLEVBQUUsR0FBR0wsNkRBQU9BLENBQUNFO1FBQzNCLElBQUksQ0FBQ0csUUFBUTtZQUNYLE9BQU8sSUFBSVAscURBQVlBLENBQUMsZ0JBQWdCO2dCQUFFUSxRQUFRO1lBQUk7UUFDeEQ7UUFFQSxxQkFBcUI7UUFDckIsTUFBTUMsT0FBTyxNQUFNUiwyQ0FBTUEsQ0FBQ1EsSUFBSSxDQUFDQyxVQUFVLENBQUM7WUFDeENDLE9BQU87Z0JBQUVDLElBQUlMO1lBQU87UUFDdEI7UUFFQSxJQUFJLENBQUNFLE1BQU07WUFDVCxPQUFPLElBQUlULHFEQUFZQSxDQUNyQmEsS0FBS0MsU0FBUyxDQUFDO2dCQUFFQyxPQUFPO1lBQWlCLElBQ3pDO2dCQUFFUCxRQUFRO2dCQUFLUSxTQUFTO29CQUFFLGdCQUFnQjtnQkFBbUI7WUFBRTtRQUVuRTtRQUVBLGlCQUFpQjtRQUNqQlgsUUFBUUMsR0FBRyxDQUFDO1FBQ1osTUFBTSxDQUFDVyxPQUFPQyxVQUFVQyxVQUFVQyxVQUFVLEdBQUcsTUFBTUMsUUFBUUMsR0FBRyxDQUFDO1lBQy9EckIsMkNBQU1BLENBQUNRLElBQUksQ0FBQ2MsUUFBUTtZQUNwQnRCLDJDQUFNQSxDQUFDdUIsT0FBTyxDQUFDRCxRQUFRLENBQUM7Z0JBQ3RCRSxTQUFTO29CQUNQQyxhQUFhO2dCQUNmO1lBQ0Y7WUFDQXpCLDJDQUFNQSxDQUFDMEIsT0FBTyxDQUFDSixRQUFRLENBQUM7Z0JBQ3RCRSxTQUFTO29CQUNQRyxhQUFhO29CQUNiQyxRQUFRO29CQUNSTCxTQUFTO2dCQUNYO1lBQ0Y7WUFDQXZCLDJDQUFNQSxDQUFDNkIsUUFBUSxDQUFDUCxRQUFRO1NBQ3pCO1FBRUQsNEJBQTRCO1FBQzVCLE1BQU1RLHdCQUF3QmIsU0FBU2MsR0FBRyxDQUFDLENBQUNSLFVBQTZEO2dCQUN2RyxHQUFHQSxPQUFPO2dCQUNWUyxXQUFXVCxRQUFRRSxXQUFXLENBQUNNLEdBQUcsQ0FBQyxDQUFDRSxJQUF5QkEsRUFBRTNCLE1BQU07WUFDdkU7UUFFQUYsUUFBUUMsR0FBRyxDQUFDLHdCQUF3QjtZQUNsQzZCLFdBQVdsQixNQUFNbUIsTUFBTTtZQUN2QkMsY0FBY25CLFNBQVNrQixNQUFNO1lBQzdCRSxjQUFjbkIsU0FBU2lCLE1BQU07WUFDN0JHLGVBQWVuQixVQUFVZ0IsTUFBTTtRQUNqQztRQUVBLE9BQU9wQyxxREFBWUEsQ0FBQ3dDLElBQUksQ0FBQztZQUN2QnZCO1lBQ0FDLFVBQVVhO1lBQ1ZaO1lBQ0FDO1FBQ0Y7SUFDRixFQUFFLE9BQU9MLE9BQU87UUFDZFYsUUFBUVUsS0FBSyxDQUFDLHlCQUF5QkE7UUFDdkMsT0FBT2YscURBQVlBLENBQUN3QyxJQUFJLENBQ3RCO1lBQUV6QixPQUFPO1FBQXdCLEdBQ2pDO1lBQUVQLFFBQVE7UUFBSTtJQUVsQjtBQUNGIiwic291cmNlcyI6WyIvVXNlcnMvbmlsc2wvRG9jdW1lbnRzL05pbHMvcHJvamVjdHMvZ2F1bnRsZXQvc2xhY2stY2xvbmUtdjAvYXBwL2FwaS9nZXREYXRhL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSwgTmV4dFJlcXVlc3QgfSBmcm9tICduZXh0L3NlcnZlcidcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0AvbGliL2RiJ1xuaW1wb3J0IHsgZ2V0QXV0aCB9IGZyb20gJ0BjbGVyay9uZXh0anMvc2VydmVyJ1xuaW1wb3J0IHsgQ2hhbm5lbCwgQ2hhbm5lbE1lbWJlcnNoaXAgfSBmcm9tICdAL3R5cGVzL2RhdGFTdHJ1Y3R1cmVzJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2coJ1N0YXJ0aW5nIGdldERhdGEgcmVxdWVzdCcpXG4gICAgXG4gICAgY29uc3QgeyB1c2VySWQgfSA9IGdldEF1dGgocmVxdWVzdClcbiAgICBpZiAoIXVzZXJJZCkge1xuICAgICAgcmV0dXJuIG5ldyBOZXh0UmVzcG9uc2UoXCJVbmF1dGhvcml6ZWRcIiwgeyBzdGF0dXM6IDQwMSB9KVxuICAgIH1cbiAgICBcbiAgICAvLyBWZXJpZnkgdXNlciBleGlzdHNcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICB3aGVyZTogeyBpZDogdXNlcklkIH1cbiAgICB9KVxuICAgIFxuICAgIGlmICghdXNlcikge1xuICAgICAgcmV0dXJuIG5ldyBOZXh0UmVzcG9uc2UoXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFwiVXNlciBub3QgZm91bmRcIiB9KSxcbiAgICAgICAgeyBzdGF0dXM6IDQwNCwgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfVxuICAgICAgKVxuICAgIH1cblxuICAgIC8vIEZldGNoIGFsbCBkYXRhXG4gICAgY29uc29sZS5sb2coJ0ZldGNoaW5nIGFsbCBkYXRhJylcbiAgICBjb25zdCBbdXNlcnMsIGNoYW5uZWxzLCBtZXNzYWdlcywgcmVhY3Rpb25zXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIHByaXNtYS51c2VyLmZpbmRNYW55KCksXG4gICAgICBwcmlzbWEuY2hhbm5lbC5maW5kTWFueSh7XG4gICAgICAgIGluY2x1ZGU6IHtcbiAgICAgICAgICBtZW1iZXJzaGlwczogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHByaXNtYS5tZXNzYWdlLmZpbmRNYW55KHtcbiAgICAgICAgaW5jbHVkZToge1xuICAgICAgICAgIGF0dGFjaG1lbnRzOiB0cnVlLFxuICAgICAgICAgIHNlbmRlcjogdHJ1ZSxcbiAgICAgICAgICBjaGFubmVsOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICBwcmlzbWEucmVhY3Rpb24uZmluZE1hbnkoKSxcbiAgICBdKVxuXG4gICAgLy8gQWRkIG1lbWJlcklkcyB0byBjaGFubmVsc1xuICAgIGNvbnN0IGNoYW5uZWxzV2l0aE1lbWJlcklkcyA9IGNoYW5uZWxzLm1hcCgoY2hhbm5lbDogQ2hhbm5lbCAmIHsgbWVtYmVyc2hpcHM6IENoYW5uZWxNZW1iZXJzaGlwW10gfSkgPT4gKHtcbiAgICAgIC4uLmNoYW5uZWwsXG4gICAgICBtZW1iZXJJZHM6IGNoYW5uZWwubWVtYmVyc2hpcHMubWFwKChtOiBDaGFubmVsTWVtYmVyc2hpcCkgPT4gbS51c2VySWQpXG4gICAgfSkpXG5cbiAgICBjb25zb2xlLmxvZygnRGF0YSBmZXRjaCBjb21wbGV0ZTonLCB7XG4gICAgICB1c2VyQ291bnQ6IHVzZXJzLmxlbmd0aCxcbiAgICAgIGNoYW5uZWxDb3VudDogY2hhbm5lbHMubGVuZ3RoLFxuICAgICAgbWVzc2FnZUNvdW50OiBtZXNzYWdlcy5sZW5ndGgsXG4gICAgICByZWFjdGlvbkNvdW50OiByZWFjdGlvbnMubGVuZ3RoLFxuICAgIH0pXG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgdXNlcnMsXG4gICAgICBjaGFubmVsczogY2hhbm5lbHNXaXRoTWVtYmVySWRzLFxuICAgICAgbWVzc2FnZXMsXG4gICAgICByZWFjdGlvbnMsXG4gICAgfSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZmV0Y2ggZGF0YTonLCBlcnJvcilcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7IGVycm9yOiBcIkludGVybmFsIFNlcnZlciBFcnJvclwiIH0sXG4gICAgICB7IHN0YXR1czogNTAwIH1cbiAgICApXG4gIH1cbn0gIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInByaXNtYSIsImdldEF1dGgiLCJHRVQiLCJyZXF1ZXN0IiwiY29uc29sZSIsImxvZyIsInVzZXJJZCIsInN0YXR1cyIsInVzZXIiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJpZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJlcnJvciIsImhlYWRlcnMiLCJ1c2VycyIsImNoYW5uZWxzIiwibWVzc2FnZXMiLCJyZWFjdGlvbnMiLCJQcm9taXNlIiwiYWxsIiwiZmluZE1hbnkiLCJjaGFubmVsIiwiaW5jbHVkZSIsIm1lbWJlcnNoaXBzIiwibWVzc2FnZSIsImF0dGFjaG1lbnRzIiwic2VuZGVyIiwicmVhY3Rpb24iLCJjaGFubmVsc1dpdGhNZW1iZXJJZHMiLCJtYXAiLCJtZW1iZXJJZHMiLCJtIiwidXNlckNvdW50IiwibGVuZ3RoIiwiY2hhbm5lbENvdW50IiwibWVzc2FnZUNvdW50IiwicmVhY3Rpb25Db3VudCIsImpzb24iXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/getData/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/db.ts":
/*!*******************!*\
  !*** ./lib/db.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = global;\nconst prisma = globalForPrisma.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log: [\n        \"query\"\n    ]\n});\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZGIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQTZDO0FBRTdDLE1BQU1DLGtCQUFrQkM7QUFFakIsTUFBTUMsU0FDWEYsZ0JBQWdCRSxNQUFNLElBQ3RCLElBQUlILHdEQUFZQSxDQUFDO0lBQ2ZJLEtBQUs7UUFBQztLQUFRO0FBQ2hCLEdBQUU7QUFFSixJQUFJQyxJQUFxQyxFQUFFSixnQkFBZ0JFLE1BQU0sR0FBR0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9uaWxzbC9Eb2N1bWVudHMvTmlscy9wcm9qZWN0cy9nYXVudGxldC9zbGFjay1jbG9uZS12MC9saWIvZGIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSBcIkBwcmlzbWEvY2xpZW50XCJcblxuY29uc3QgZ2xvYmFsRm9yUHJpc21hID0gZ2xvYmFsIGFzIHVua25vd24gYXMgeyBwcmlzbWE6IFByaXNtYUNsaWVudCB9XG5cbmV4cG9ydCBjb25zdCBwcmlzbWEgPVxuICBnbG9iYWxGb3JQcmlzbWEucHJpc21hIHx8XG4gIG5ldyBQcmlzbWFDbGllbnQoe1xuICAgIGxvZzogW1wicXVlcnlcIl0sXG4gIH0pXG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPSBwcmlzbWEiXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsIiwicHJpc21hIiwibG9nIiwicHJvY2VzcyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/db.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@clerk","vendor-chunks/tslib","vendor-chunks/cookie","vendor-chunks/map-obj","vendor-chunks/no-case","vendor-chunks/lower-case","vendor-chunks/snakecase-keys","vendor-chunks/snake-case","vendor-chunks/dot-case","vendor-chunks/crypto-js"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2FgetData%2Froute&page=%2Fapi%2FgetData%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2FgetData%2Froute.ts&appDir=%2FUsers%2Fnilsl%2FDocuments%2FNils%2Fprojects%2Fgauntlet%2Fslack-clone-v0%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnilsl%2FDocuments%2FNils%2Fprojects%2Fgauntlet%2Fslack-clone-v0&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();