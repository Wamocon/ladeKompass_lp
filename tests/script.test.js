/**
 * ladeKompass Landing Page - Jest Unit Tests
 *
 * Architecture notes:
 *  - script.js is an IIFE that registers DOMContentLoaded to run all init*() functions.
 *  - jsdom readyState is already 'complete', so DOMContentLoaded never fires automatically.
 *  - Each beforeEach calls jest.resetModules() + buildDOM() + require + dispatchEvent so
 *    the IIFE re-runs with a fresh DOM and event listeners are correctly attached.
 *
 * Environment: jsdom (configured via testEnvironment in package.json)
 */

'use strict';

/* ------------------------------------------------------------------ helpers */

function buildDOM() {
  document.documentElement.lang = 'de';
  document.body.innerHTML = [
    '<button id="lang-de" class="lang-btn active-lang">DE</button>',
    '<button id="lang-en" class="lang-btn">EN</button>',
    '<button id="lang-de-m" class="lang-btn active-lang">DE</button>',
    '<button id="lang-en-m" class="lang-btn">EN</button>',
    '<span id="i18n-text" data-de="Hallo" data-en="Hello">Hallo</span>',
    '<input id="i18n-input" data-ph-de="Suche..." data-ph-en="Search..." placeholder="Suche...">',
    '<div class="app-screen active screen-dashboard"></div>',
    '<div class="app-screen screen-wizard"></div>',
    '<div class="app-screen screen-calendar"></div>',
    '<button class="tab-btn active" data-tab="dashboard">Karte</button>',
    '<button class="tab-btn" data-tab="requests">Stationen</button>',
    '<div id="tab-dashboard" class="tab-panel active"></div>',
    '<div id="tab-requests" class="tab-panel"></div>',
    '<input type="range" id="employee-slider" min="5" max="100" value="50">',
    '<input type="range" id="request-slider"  min="10" max="30"  value="18">',
    '<span id="employee-count-label">50</span>',
    '<span id="request-count-label">18</span>',
    '<div id="savings-value">0 km</div>',
    '<span id="hours-value">0 Min.</span>',
    '<header id="nav"></header>',
    '<button id="mobile-menu-btn" aria-expanded="false"></button>',
    '<div id="mobile-nav" class="hidden"></div>',
    '<div class="faq-item"><button class="faq-question">Q1</button><div class="faq-answer">A1</div></div>',
    '<div class="faq-item open"><button class="faq-question">Q2</button><div class="faq-answer">A2</div></div>',
    '<div id="contact-modal" style="display:none;"></div>',
    '<input  id="cf-name"    value="">',
    '<input  id="cf-email"   value="">',
    '<input  id="cf-company" value="">',
    '<select id="cf-subject"><option value="Demo anfragen">Demo anfragen</option></select>',
    '<textarea id="cf-message"></textarea>',
    '<div id="cf-error" class="hidden"></div>',
    '<a href="#features">Features</a>',
    '<a href="#">Top</a>',
    '<div id="features"></div>',
    '<div class="reveal"></div>',
    '<div class="reveal"></div>'
  ].join('');
}

function loadScript() {
  jest.resetModules();
  buildDOM();
  require('../script.js'); // init() runs immediately (readyState is 'complete' in jsdom)
}

beforeEach(function() { loadScript(); });

/* ================================================================
   1. LANGUAGE TOGGLE
================================================================ */
describe('Language Toggle', function() {
  test('switching to EN updates data-en text', function() {
    document.getElementById('lang-en').click();
    expect(document.getElementById('i18n-text').textContent).toBe('Hello');
  });

  test('switching back to DE restores text', function() {
    document.getElementById('lang-en').click();
    document.getElementById('lang-de').click();
    expect(document.getElementById('i18n-text').textContent).toBe('Hallo');
  });

  test('switching to EN updates placeholder', function() {
    document.getElementById('lang-en').click();
    expect(document.getElementById('i18n-input').placeholder).toBe('Search...');
  });

  test('switching to DE restores placeholder', function() {
    document.getElementById('lang-en').click();
    document.getElementById('lang-de').click();
    expect(document.getElementById('i18n-input').placeholder).toBe('Suche...');
  });

  test('active-lang class is correctly toggled', function() {
    document.getElementById('lang-en').click();
    expect(document.getElementById('lang-en').classList.contains('active-lang')).toBe(true);
    expect(document.getElementById('lang-de').classList.contains('active-lang')).toBe(false);
  });

  test('document.lang is set to en', function() {
    document.getElementById('lang-en').click();
    expect(document.documentElement.lang).toBe('en');
  });

  test('document.lang is set back to de', function() {
    document.getElementById('lang-en').click();
    document.getElementById('lang-de').click();
    expect(document.documentElement.lang).toBe('de');
  });

  test('element with child icon nodes does not throw', function() {
    var el = document.createElement('span');
    el.setAttribute('data-de', 'Deutsch');
    el.setAttribute('data-en', 'English');
    el.appendChild(document.createElement('svg'));
    el.appendChild(document.createTextNode(' Deutsch '));
    document.body.appendChild(el);
    expect(function() { document.getElementById('lang-en').click(); }).not.toThrow();
  });
});

/* ================================================================
   2. iPHONE SCREEN CYCLE
================================================================ */
describe('iPhone Screen Cycle', function() {
  beforeEach(function() {
    jest.useFakeTimers();
    jest.resetModules();
    buildDOM();
    require('../script.js'); // init() runs immediately with fake timers active
  });

  afterEach(function() {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('screen 0 is active on init', function() {
    var screens = document.querySelectorAll('.app-screen');
    expect(screens[0].classList.contains('active')).toBe(true);
    expect(screens[1].classList.contains('active')).toBe(false);
  });

  test('advances to screen 1 after 4200 ms', function() {
    jest.advanceTimersByTime(4200);
    var screens = document.querySelectorAll('.app-screen');
    expect(screens[1].classList.contains('active')).toBe(true);
    expect(screens[0].classList.contains('active')).toBe(false);
  });

  test('wraps back to screen 0 after 3 intervals', function() {
    jest.advanceTimersByTime(4200 * 3);
    var screens = document.querySelectorAll('.app-screen');
    expect(screens[0].classList.contains('active')).toBe(true);
  });
});

/* ================================================================
   3. APP SHOWCASE TABS
================================================================ */
describe('Showcase Tabs', function() {
  test('clicking a tab activates it', function() {
    var btn = document.querySelectorAll('.tab-btn')[1];
    btn.click();
    expect(btn.classList.contains('active')).toBe(true);
  });

  test('clicking a tab activates its panel', function() {
    document.querySelectorAll('.tab-btn')[1].click();
    expect(document.getElementById('tab-requests').classList.contains('active')).toBe(true);
  });

  test('clicking a tab deactivates others', function() {
    document.querySelectorAll('.tab-btn')[1].click();
    expect(document.querySelectorAll('.tab-btn')[0].classList.contains('active')).toBe(false);
    expect(document.getElementById('tab-dashboard').classList.contains('active')).toBe(false);
  });
});

/* ================================================================
   4. RANGE CALCULATOR
================================================================ */
describe('Range Calculator', function() {
  function setSliders(battery, consumption) {
    document.getElementById('employee-slider').value = String(battery);
    document.getElementById('request-slider').value  = String(consumption);
    document.getElementById('employee-slider').dispatchEvent(new Event('input'));
  }

  test('shows a km value on initial load', function() {
    expect(document.getElementById('savings-value').textContent).toMatch(/\d+ km/);
  });

  test('50% / 18 kWh per 100km gives 208 km', function() {
    setSliders(50, 18);
    expect(document.getElementById('savings-value').textContent).toBe('208 km');
  });

  test('100% / 15 kWh per 100km gives 500 km', function() {
    setSliders(100, 15);
    expect(document.getElementById('savings-value').textContent).toBe('500 km');
  });

  test('5% / 30 kWh per 100km gives 13 km', function() {
    setSliders(5, 30);
    expect(document.getElementById('savings-value').textContent).toBe('13 km');
  });

  test('updates battery percentage label', function() {
    setSliders(75, 18);
    expect(document.getElementById('employee-count-label').textContent).toBe('75');
  });

  test('battery <= 15% gives time < 2 Min.', function() {
    setSliders(10, 18);
    expect(document.getElementById('hours-value').textContent).toBe('< 2 Min.');
  });

  test('battery 16-40% gives time < 4 Min.', function() {
    setSliders(25, 18);
    expect(document.getElementById('hours-value').textContent).toBe('< 4 Min.');
  });

  test('battery 41-70% gives time < 6 Min.', function() {
    setSliders(55, 18);
    expect(document.getElementById('hours-value').textContent).toBe('< 6 Min.');
  });

  test('battery > 70% gives time < 8 Min.', function() {
    setSliders(80, 18);
    expect(document.getElementById('hours-value').textContent).toBe('< 8 Min.');
  });

  test('consumption slider also triggers recalculation (100%/25kWh=300km)', function() {
    document.getElementById('employee-slider').value = '100';
    document.getElementById('request-slider').value  = '25';
    document.getElementById('request-slider').dispatchEvent(new Event('input'));
    expect(document.getElementById('savings-value').textContent).toBe('300 km');
  });
});

/* ================================================================
   5. NAVIGATION SCROLL EFFECT
================================================================ */
describe('Navigation Scroll Effect', function() {
  var rafMock;

  beforeEach(function() {
    rafMock = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(function(cb) {
      cb(0);
      return 0;
    });
  });

  afterEach(function() {
    rafMock.mockRestore();
  });

  test('adds nav-scrolled when scrollY > 60', function() {
    Object.defineProperty(window, 'scrollY', { writable: true, value: 80 });
    window.dispatchEvent(new Event('scroll'));
    expect(document.getElementById('nav').classList.contains('nav-scrolled')).toBe(true);
  });

  test('removes nav-scrolled when scrollY returns to <= 60', function() {
    // Force nav into scrolled state directly
    document.getElementById('nav').classList.add('nav-scrolled');
    // Fire a scroll event from top position to trigger removal
    Object.defineProperty(window, 'scrollY', { writable: true, value: 0 });
    window.dispatchEvent(new Event('scroll'));
    expect(document.getElementById('nav').classList.contains('nav-scrolled')).toBe(false);
  });
});

/* ================================================================
   6. FAQ ACCORDION
================================================================ */
describe('FAQ Accordion', function() {
  test('clicking a closed question opens it', function() {
    var item = document.querySelectorAll('.faq-item')[0];
    item.querySelector('.faq-question').click();
    expect(item.classList.contains('open')).toBe(true);
  });

  test('clicking an open question closes it', function() {
    var item = document.querySelectorAll('.faq-item')[1];
    item.querySelector('.faq-question').click();
    expect(item.classList.contains('open')).toBe(false);
  });

  test('opening one item closes others', function() {
    var items = document.querySelectorAll('.faq-item');
    items[0].querySelector('.faq-question').click();
    items[1].querySelector('.faq-question').click();
    expect(items[0].classList.contains('open')).toBe(false);
    expect(items[1].classList.contains('open')).toBe(true);
  });
});

/* ================================================================
   7. MOBILE MENU TOGGLE
================================================================ */
describe('Mobile Menu Toggle', function() {
  test('first click shows mobile nav', function() {
    document.getElementById('mobile-menu-btn').click();
    expect(document.getElementById('mobile-nav').classList.contains('hidden')).toBe(false);
  });

  test('second click hides mobile nav', function() {
    var btn = document.getElementById('mobile-menu-btn');
    btn.click();
    btn.click();
    expect(document.getElementById('mobile-nav').classList.contains('hidden')).toBe(true);
  });

  test('aria-expanded is true after first click', function() {
    document.getElementById('mobile-menu-btn').click();
    expect(document.getElementById('mobile-menu-btn').getAttribute('aria-expanded')).toBe('true');
  });

  test('aria-expanded is false after second click', function() {
    var btn = document.getElementById('mobile-menu-btn');
    btn.click();
    btn.click();
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });
});

/* ================================================================
   8. CONTACT MODAL
================================================================ */
describe('Contact Modal', function() {
  test('openContactModal sets display to flex', function() {
    window.openContactModal();
    expect(document.getElementById('contact-modal').style.display).toBe('flex');
  });

  test('openContactModal locks body scroll', function() {
    window.openContactModal();
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('closeContactModal hides modal', function() {
    window.openContactModal();
    window.closeContactModal();
    expect(document.getElementById('contact-modal').style.display).toBe('none');
  });

  test('closeContactModal restores body overflow', function() {
    window.openContactModal();
    window.closeContactModal();
    expect(document.body.style.overflow).toBe('');
  });

  test('closeContactModal hides cf-error', function() {
    document.getElementById('cf-error').classList.remove('hidden');
    window.openContactModal();
    window.closeContactModal();
    expect(document.getElementById('cf-error').classList.contains('hidden')).toBe(true);
  });

  test('Escape key closes modal', function() {
    window.openContactModal();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.getElementById('contact-modal').style.display).toBe('none');
  });

  test('backdrop click closes modal', function() {
    window.openContactModal();
    var modal = document.getElementById('contact-modal');
    var evt = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(evt, 'target', { value: modal });
    modal.dispatchEvent(evt);
    expect(modal.style.display).toBe('none');
  });

  test('submitContactForm shows error when fields empty', function() {
    var e = { preventDefault: jest.fn() };
    window.submitContactForm(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(document.getElementById('cf-error').classList.contains('hidden')).toBe(false);
  });

  test('submitContactForm opens mailto when all fields filled', function() {
    var openSpy = jest.spyOn(window, 'open').mockImplementation(function() {});
    document.getElementById('cf-name').value    = 'Max Muster';
    document.getElementById('cf-email').value   = 'max@example.de';
    document.getElementById('cf-message').value = 'Ich bin interessiert.';
    window.submitContactForm({ preventDefault: jest.fn() });
    expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('mailto:'));
    openSpy.mockRestore();
  });

  test('submitContactForm encodes company name in subject', function() {
    var openSpy = jest.spyOn(window, 'open').mockImplementation(function() {});
    document.getElementById('cf-name').value    = 'Max Muster';
    document.getElementById('cf-email').value   = 'max@example.de';
    document.getElementById('cf-company').value = 'Musterfirma GmbH';
    document.getElementById('cf-message').value = 'Anfrage.';
    window.submitContactForm({ preventDefault: jest.fn() });
    expect(openSpy.mock.calls[0][0]).toContain('Musterfirma');
    openSpy.mockRestore();
  });

  test('submitContactForm hides cf-error on valid submit', function() {
    var openSpy = jest.spyOn(window, 'open').mockImplementation(function() {});
    document.getElementById('cf-error').classList.remove('hidden');
    document.getElementById('cf-name').value    = 'Max';
    document.getElementById('cf-email').value   = 'max@test.de';
    document.getElementById('cf-message').value = 'Test';
    window.submitContactForm({ preventDefault: jest.fn() });
    expect(document.getElementById('cf-error').classList.contains('hidden')).toBe(true);
    openSpy.mockRestore();
  });
});

/* ================================================================
   9. SMOOTH SCROLLING
================================================================ */
describe('Smooth Scrolling', function() {
  test('anchor click calls scrollIntoView with smooth behavior', function() {
    var anchor = document.querySelector('a[href="#features"]');
    var target = document.getElementById('features');
    var scrollSpy = jest.fn();
    target.scrollIntoView = scrollSpy;
    anchor.click();
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  test('href="#" anchor click does not throw', function() {
    var anchor = document.querySelector('a[href="#"]');
    expect(function() { anchor.click(); }).not.toThrow();
  });
});

/* ================================================================
   10. REVEAL ON SCROLL (IntersectionObserver)
================================================================ */
describe('Reveal on Scroll', function() {
  var capturedCallback;

  beforeEach(function() {
    capturedCallback = null;
    window.IntersectionObserver = jest.fn(function(cb) {
      capturedCallback = cb;
      return { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
    });
    jest.resetModules();
    buildDOM();
    require('../script.js'); // init() runs immediately; uses the mocked IntersectionObserver
  });

  afterEach(function() {
    delete window.IntersectionObserver;
  });

  test('intersecting entry adds reveal--visible', function() {
    var reveals = document.querySelectorAll('.reveal');
    capturedCallback([{ isIntersecting: true, target: reveals[0] }]);
    expect(reveals[0].classList.contains('reveal--visible')).toBe(true);
  });

  test('non-intersecting entry does not add reveal--visible', function() {
    var reveals = document.querySelectorAll('.reveal');
    capturedCallback([{ isIntersecting: false, target: reveals[1] }]);
    expect(reveals[1].classList.contains('reveal--visible')).toBe(false);
  });
});

/* ================================================================
   11. EDGE CASES & COVERAGE GAPS
================================================================ */
describe('Edge cases: init deferred via DOMContentLoaded', function() {
  test('init() is called via DOMContentLoaded when readyState is "loading"', function() {
    // Simulate readyState = 'loading'
    var addSpy = jest.spyOn(document, 'addEventListener');
    Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true });

    jest.resetModules();
    buildDOM();
    require('../script.js');

    // The IIFE should have registered a DOMContentLoaded listener
    expect(addSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));

    // Manually fire DOMContentLoaded to trigger init
    var calls = addSpy.mock.calls.filter(function(c) { return c[0] === 'DOMContentLoaded'; });
    if (calls.length > 0) {
      calls[calls.length - 1][1](); // invoke the last registered callback
    }
    expect(document.getElementById('savings-value').textContent).toMatch(/\d+ km/);

    // Restore
    Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
    addSpy.mockRestore();
  });
});

describe('Edge cases: early-return guards', function() {
  test('initLangToggle returns safely when buttons are missing', function() {
    document.body.innerHTML = '';
    jest.resetModules();
    expect(function() { require('../script.js'); }).not.toThrow();
  });

  test('openContactModal does nothing when modal element is absent', function() {
    document.getElementById('contact-modal').remove();
    expect(function() { window.openContactModal(); }).not.toThrow();
  });

  test('closeContactModal does nothing when modal element is absent', function() {
    document.getElementById('contact-modal').remove();
    expect(function() { window.closeContactModal(); }).not.toThrow();
  });

  test('submitContactForm handles missing optional elements gracefully', function() {
    document.getElementById('cf-company').remove();
    document.getElementById('cf-name').value    = 'Max';
    document.getElementById('cf-email').value   = 'max@test.de';
    document.getElementById('cf-message').value = 'Test';
    var openSpy = jest.spyOn(window, 'open').mockImplementation(function() {});
    expect(function() {
      window.submitContactForm({ preventDefault: jest.fn() });
    }).not.toThrow();
    openSpy.mockRestore();
  });

  test('smooth scroll anchor pointing to non-existent target does not throw', function() {
    // Add a broken anchor and reload
    var a = document.createElement('a');
    a.setAttribute('href', '#nonexistent-section');
    a.textContent = 'Broken';
    document.body.appendChild(a);
    jest.resetModules();
    require('../script.js');
    expect(function() { a.click(); }).not.toThrow();
  });

  test('mobile menu: clicking btn toggles nav even when called multiple times', function() {
    // 3 clicks: show → hide → show
    var btn = document.getElementById('mobile-menu-btn');
    btn.click(); btn.click(); btn.click();
    expect(document.getElementById('mobile-nav').classList.contains('hidden')).toBe(false);
  });

  test('showcase tab click on missing panel does not throw', function() {
    // Tab with data-tab pointing to a panel that does not exist
    var btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.setAttribute('data-tab', 'missing-panel');
    btn.textContent = 'Missing';
    document.body.appendChild(btn);
    jest.resetModules();
    require('../script.js');
    expect(function() { btn.click(); }).not.toThrow();
  });
});