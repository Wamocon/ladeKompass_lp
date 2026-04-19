#!/usr/bin/env node
// ladeKompass Landing Page - Automated Integrity Checks
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
let failures = 0, passes = 0;
function pass(msg) { console.log("  \x1b[32mOK\x1b[0m " + msg); passes++; }
function fail(msg) { console.error("  \x1b[31mFAIL\x1b[0m " + msg); failures++; }
function warn(msg) { console.warn("  \x1b[33mWARN\x1b[0m " + msg); }
function check(name, fn) { console.log("\n--- " + name + " ---"); try { fn(); } catch(e) { fail("Error: " + e.message); } }
function readFile(rel) { const abs = path.join(ROOT, rel); if (!fs.existsSync(abs)) { console.error("FATAL: " + rel); process.exit(1); } return fs.readFileSync(abs, "utf8"); }
const html = readFile("index.html");
const js = readFile("script.js");
readFile("style.css");

check("Required files exist", function() {
  ["index.html","style.css","script.js","favicon.png","favicon.svg","impressum.html","datenschutz.html","agb.html",".nojekyll","CNAME",".github/workflows/deploy.yml",".github/workflows/test.yml",".github/workflows/validate.yml"].forEach(function(f) {
    if (fs.existsSync(path.join(ROOT, f))) pass(f); else fail(f + " is MISSING");
  });
});

check("Required HTML IDs", function() {
  ["nav","hero","features","how","showcase","roi","pricing","faq","contact-modal","contact-form","lang-de","lang-en","mobile-menu-btn","mobile-nav","employee-slider","request-slider","savings-value","hours-value","cf-name","cf-email","cf-message","cf-subject","cf-error"].forEach(function(id) {
    if (html.includes("id=\"" + id + "\"")) pass("#" + id); else fail("#" + id + " MISSING");
  });
});

check("Internal anchor links resolve", function() {
  var anchors = Array.from(html.matchAll(/href="#([^"]+)"/g)).map(function(m) { return m[1]; });
  var ids = new Set(Array.from(html.matchAll(/id="([^"]+)"/g)).map(function(m) { return m[1]; }));
  Array.from(new Set(anchors)).forEach(function(a) {
    if (ids.has(a)) pass("#" + a); else fail("#" + a + " referenced but id not found");
  });
});

check("No legacy AWAY brand remnants", function() {
  ["AWAY Landing Page","away-alpha.vercel.app","Urlaubsplaner","Urlaubsantrag"].forEach(function(t) {
    if (!html.includes(t)) pass("\"" + t + "\" absent from HTML"); else fail("\"" + t + "\" still in HTML");
  });
  ["AWAY Landing Page","AWAY Anfrage","away-alpha.vercel.app","minutesSaved","moneySaved"].forEach(function(t) {
    if (!js.includes(t)) pass("\"" + t + "\" absent from script.js"); else fail("\"" + t + "\" still in script.js");
  });
});

check("CTA buttons point to www.ladekompass.com", function() {
  var count = (html.match(/https:\/\/www\.ladekompass\.com/g) || []).length;
  if (count >= 5) pass("Production URL referenced " + count + "x (>=5 ok)"); else fail("Only " + count + "x prod URL - expected >=5");
  if (!html.includes("app.ladekompass.de")) pass("No old app.ladekompass.de in HTML"); else fail("Old app.ladekompass.de still present");
});

check("Contact modal JS functions", function() {
  ["window.openContactModal","window.closeContactModal","window.submitContactForm"].forEach(function(fn) {
    if (js.includes(fn)) pass(fn); else fail(fn + " MISSING");
  });
  if (html.includes("openContactModal()")) pass("openContactModal() called in HTML"); else fail("openContactModal() not called");
});

check("DE/EN language toggle", function() {
  var de = (html.match(/data-de="/g) || []).length;
  var en = (html.match(/data-en="/g) || []).length;
  if (de >= 50) pass(de + " data-de attrs"); else fail("Only " + de + " data-de (expected >=50)");
  if (en >= 50) pass(en + " data-en attrs"); else fail("Only " + en + " data-en (expected >=50)");
  if (de === en) pass("data-de/en counts match"); else fail("Mismatch: de=" + de + " en=" + en);
});

check("iPhone frame and screens", function() {
  if (html.includes("iphone-frame")) pass("iPhone frame present"); else fail("iPhone frame MISSING");
  var sc = (html.match(/class="[^"]*app-screen/g) || []).length;
  if (sc >= 3) pass(sc + " app-screens (>=3 ok)"); else fail("Only " + sc + " app-screens");
});

check("Pricing tiers Free/Lite/Pro", function() {
  var m = html.match(/<section[^>]*id="pricing"[\s\S]*?<\/section>/);
  var p = m ? m[0] : "";
  ["FREE","LITE","PRO"].forEach(function(t) { if (p.includes(t)) pass(t + " tier present"); else fail(t + " tier MISSING"); });
  if (p.includes("4,99")) pass("Lite price 4,99 EUR found"); else fail("Lite price 4,99 EUR MISSING");
  if (p.includes("9,99")) pass("Pro price 9,99 EUR found"); else fail("Pro price 9,99 EUR MISSING");
  if (!p.includes("2,99")) pass("Old 2,99 EUR removed"); else fail("Old 2,99 EUR still present");
  if (!p.includes("FLEET")) pass("No FLEET tier"); else fail("FLEET tier still present");
});

check("Range calculator", function() {
  if (html.includes("id=\"employee-slider\"")) pass("#employee-slider present"); else fail("#employee-slider MISSING");
  if (js.includes("BATTERY_KWH")) pass("BATTERY_KWH in script.js"); else fail("BATTERY_KWH MISSING");
  if (js.includes("rangekm")) pass("rangekm in script.js"); else fail("rangekm MISSING");
});

check("FAQ section", function() {
  var n = (html.match(/class="[^"]*faq-item/g) || []).length;
  if (n >= 5) pass(n + " FAQ items"); else fail("Only " + n + " FAQ items");
  if (html.includes("faq-question") && html.includes("faq-answer")) pass("FAQ structure ok"); else fail("FAQ structure MISSING");
  if (html.includes("LITE") && html.includes("PRO")) pass("FAQ has LITE/PRO"); else fail("FAQ missing tier refs");
});

check("Accessibility basics", function() {
  if (html.match(/<html[^>]+lang="/)) pass("html[lang] set"); else fail("html[lang] MISSING");
  var imgs = Array.from(html.matchAll(/<img\s([^>]*?)>/gi));
  var bad = imgs.filter(function(m) { return !m[1].includes("alt="); }).length;
  if (bad === 0) pass("All " + imgs.length + " img have alt"); else fail(bad + " img missing alt");
  if (html.includes("aria-modal=\"true\"")) pass("aria-modal on modal"); else fail("aria-modal MISSING");
  if (html.includes("<meta name=\"description\"")) pass("meta description present"); else fail("meta description MISSING");
  if (html.includes("<title>")) pass("title present"); else fail("title MISSING");
});

check("script.js core functions", function() {
  ["initLangToggle","initIphoneScreenCycle","initShowcaseTabs","initROICalculator","initFAQ","initMobileMenu","initReveal"].forEach(function(fn) {
    if (js.includes(fn)) pass(fn); else fail(fn + " MISSING");
  });
});

check("No security anti-patterns", function() {
  if (!html.includes("javascript:")) pass("No javascript: href"); else fail("javascript: href found");
  if (!js.includes("eval(")) pass("No eval()"); else fail("eval() found");
  if (!js.includes("document.write")) pass("No document.write()"); else fail("document.write() found");
});

check("Static site config", function() {
  if (fs.existsSync(path.join(ROOT, ".nojekyll"))) pass(".nojekyll present"); else fail(".nojekyll MISSING");
  if (html.includes("tailwind")) pass("Tailwind referenced"); else fail("Tailwind not referenced");
  var cname = fs.existsSync(path.join(ROOT, "CNAME")) ? fs.readFileSync(path.join(ROOT, "CNAME"), "utf8").trim() : "";
  if (cname === "landingpage.ladekompass.com") pass("CNAME correct"); else fail("CNAME is \"" + cname + "\" expected \"landingpage.ladekompass.com\"");
});

check("Favicon is ladeKompass SVG", function() {
  if (html.includes("favicon.svg")) pass("favicon.svg in HTML"); else fail("favicon.svg not in HTML");
  var svg = fs.existsSync(path.join(ROOT, "favicon.svg")) ? fs.readFileSync(path.join(ROOT, "favicon.svg"), "utf8") : "";
  if (svg.includes("4f46e5") || svg.includes("6366f1")) pass("Indigo brand colour in favicon"); else warn("Favicon colour not indigo - check visually");
  if (!svg.includes("M12 19l9 2-9-18")) pass("AWAY arrow removed from favicon"); else fail("AWAY arrow still in favicon");
});

check("Showcase URLs use www.ladekompass.com", function() {
  if (html.includes("www.ladekompass.com/map")) pass("Map URL ok"); else fail("Map URL wrong");
  if (html.includes("www.ladekompass.com/stations")) pass("Stations URL ok"); else fail("Stations URL wrong");
  if (html.includes("www.ladekompass.com/route")) pass("Route URL ok"); else fail("Route URL wrong");
  if (!html.includes("ladekompass.app/")) pass("No old ladekompass.app/ URL"); else fail("Old ladekompass.app/ still present");
});

check("iPhone screens match real app", function() {
  if (html.includes("screen-wizard") && html.includes("Stationen")) pass("Screen 2: Stations list"); else fail("Screen 2 wrong");
  if (html.includes("screen-calendar") && html.includes("Route planen")) pass("Screen 3: Route planner"); else fail("Screen 3 wrong");
  if (html.includes("screen-dashboard") && html.includes("In der N")) pass("Screen 1: Dashboard"); else fail("Screen 1 wrong");
});

console.log("\n" + "-".repeat(60));
console.log("  Passed: \x1b[32m" + passes + "\x1b[0m  Failed: \x1b[" + (failures > 0 ? "31" : "32") + "m" + failures + "\x1b[0m");
console.log("-".repeat(60));
if (failures > 0) { console.error("\nValidation FAILED with " + failures + " error(s).\n"); process.exit(1); }
else { console.log("\nAll checks PASSED.\n"); process.exit(0); }

