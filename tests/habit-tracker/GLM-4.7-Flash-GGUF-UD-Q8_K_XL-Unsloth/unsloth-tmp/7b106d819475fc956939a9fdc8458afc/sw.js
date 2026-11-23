import {clientsClaim as workbox_core_clientsClaim} from '/Users/cedi/Clouds/Projekte/KI/LLM-Bench/tests/habit-tracker/GLM-4.7-Flash-GGUF-UD-Q8_K_XL-Unsloth/rhythm/node_modules/workbox-core/clientsClaim.mjs';
import {precacheAndRoute as workbox_precaching_precacheAndRoute} from '/Users/cedi/Clouds/Projekte/KI/LLM-Bench/tests/habit-tracker/GLM-4.7-Flash-GGUF-UD-Q8_K_XL-Unsloth/rhythm/node_modules/workbox-precaching/precacheAndRoute.mjs';
import {cleanupOutdatedCaches as workbox_precaching_cleanupOutdatedCaches} from '/Users/cedi/Clouds/Projekte/KI/LLM-Bench/tests/habit-tracker/GLM-4.7-Flash-GGUF-UD-Q8_K_XL-Unsloth/rhythm/node_modules/workbox-precaching/cleanupOutdatedCaches.mjs';
import {registerRoute as workbox_routing_registerRoute} from '/Users/cedi/Clouds/Projekte/KI/LLM-Bench/tests/habit-tracker/GLM-4.7-Flash-GGUF-UD-Q8_K_XL-Unsloth/rhythm/node_modules/workbox-routing/registerRoute.mjs';
import {NavigationRoute as workbox_routing_NavigationRoute} from '/Users/cedi/Clouds/Projekte/KI/LLM-Bench/tests/habit-tracker/GLM-4.7-Flash-GGUF-UD-Q8_K_XL-Unsloth/rhythm/node_modules/workbox-routing/NavigationRoute.mjs';
import {createHandlerBoundToURL as workbox_precaching_createHandlerBoundToURL} from '/Users/cedi/Clouds/Projekte/KI/LLM-Bench/tests/habit-tracker/GLM-4.7-Flash-GGUF-UD-Q8_K_XL-Unsloth/rhythm/node_modules/workbox-precaching/createHandlerBoundToURL.mjs';/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */




self.skipWaiting();
workbox_core_clientsClaim();
/**
 * The precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
workbox_precaching_precacheAndRoute([
  {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  },
  {
    "url": "index.html",
    "revision": "7442ab8cbbf7627c1092d05e1b813d52"
  },
  {
    "url": "assets/index-DUUhcM3f.js",
    "revision": null
  },
  {
    "url": "assets/index-DAKva2sB.css",
    "revision": null
  },
  {
    "url": "icon.svg",
    "revision": "23ecbd94457eb4206d7e6a439432a5d3"
  },
  {
    "url": "manifest.webmanifest",
    "revision": "7938e58987045e8a15e17db2c91f24c1"
  }
], {});
workbox_precaching_cleanupOutdatedCaches();workbox_routing_registerRoute(new workbox_routing_NavigationRoute(workbox_precaching_createHandlerBoundToURL("index.html")));


