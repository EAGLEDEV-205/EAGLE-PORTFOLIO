/* ============================================
   EAGLE PORTFOLIO - FEATURES + FIREBASE
   1. Dark/Light mode
   2. Location + device tracker (Firebase)
   ============================================ */

/* ============ FIREBASE CONFIG ============ */
// Aapka Naya Config:
const firebaseConfig = {
  apiKey: "AIzaSyC_YSXU1czjvRmft6H1j-9Z9tN8Id0LSbQ",
  authDomain: "eagle-portfolio205.firebaseapp.com",
  projectId: "eagle-portfolio205",
  storageBucket: "eagle-portfolio205.firebasestorage.app",
  messagingSenderId: "466360593525",
  appId: "1:466360593525:web:c50f81393c1afb1ae39c3c",
  measurementId: "G-MEGW6QJ389"
};

/* ============ FIREBASE INIT ============ */
let db = null;
let firebaseReady = false;

if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseReady = true;
        console.log('%c🔥 Firebase connected', 'color: #ff9800; font-weight: bold;');
    } catch (err) {
        console.warn('Firebase init failed:', err);
    }
}

(function() {
    'use strict';

    /* ============================================
       FEATURE 1: DARK / LIGHT MODE
       ============================================ */

    function injectThemeToggle() {
        if (document.getElementById('themeToggle')) return;

        const btn = document.createElement('button');
        btn.id = 'themeToggle';
        btn.className = 'theme-toggle';
        btn.setAttribute('aria-label', 'Toggle dark mode');
        btn.innerHTML = '<i class="fas fa-moon"></i>';
        document.body.appendChild(btn);

        const savedTheme = localStorage.getItem('eagle-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            btn.innerHTML = '<i class="fas fa-sun"></i>';
        }

        btn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            btn.innerHTML = isDark
                ? '<i class="fas fa-sun"></i>'
                : '<i class="fas fa-moon"></i>';
            localStorage.setItem('eagle-theme', isDark ? 'dark' : 'light');
        });
    }

    /* ============================================
       FEATURE 2: LOCATION + DEVICE TRACKER
       ============================================ */

    function getDeviceInfo() {
        const ua = navigator.userAgent;
        let device = 'Desktop';
        if (/tablet|ipad|playbook|silk/i.test(ua)) device = 'Tablet';
        else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) device = 'Mobile';

        let browser = 'Unknown';
        if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Edg/')) browser = 'Edge';
        else if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

        let os = 'Unknown';
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';

        return { device, browser, os };
    }

    async function getLocationInfo() {
        try {
            const res = await fetch('https://ipapi.co/json/');
            if (!res.ok) throw new Error('Location fetch failed');
            const data = await res.json();
            return {
                ip: data.ip || 'Unknown',
                city: data.city || 'Unknown',
                region: data.region || 'Unknown',
                country: data.country_name || 'Unknown',
                countryCode: data.country_code || '',
                timezone: data.timezone || 'Unknown',
                org: data.org || 'Unknown'
            };
        } catch (err) {
            console.warn('Location fetch failed:', err);
            return {
                ip: 'Unknown', city: 'Unknown', region: 'Unknown',
                country: 'Unknown', countryCode: '', timezone: 'Unknown', org: 'Unknown'
            };
        }
    }

    function countryFlag(code) {
        if (!code || code.length !== 2) return '🌍';
        return String.fromCodePoint(
            ...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0))
        );
    }

    function showLocationBadge(location) {
        if (document.getElementById('locationBadge')) return;
        const badge = document.createElement('div');
        badge.id = 'locationBadge';
        badge.className = 'location-badge';
        badge.innerHTML = `
            <span class="flag">${countryFlag(location.countryCode)}</span>
            <span>${location.city}, ${location.country}</span>
        `;
        document.body.appendChild(badge);
        setTimeout(() => badge.classList.add('show'), 1000);
        setTimeout(() => badge.classList.remove('show'), 9000);
    }

    // 🔥 Firebase mein data save karein
    async function saveVisitorToFirebase(location, device) {
        if (!firebaseReady || !db) return;

        const sessionKey = 'eagle-session-logged';
        if (sessionStorage.getItem(sessionKey)) return; // Duplicate na ho

        const record = {
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ip: location.ip,
            city: location.city,
            region: location.region,
            country: location.country,
            countryCode: location.countryCode,
            timezone: location.timezone,
            org: location.org,
            device: device.device,
            browser: device.browser,
            os: device.os,
            screen: `${screen.width}x${screen.height}`,
            language: navigator.language,
            referrer: document.referrer || 'Direct',
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };

        try {
            await db.collection('visitors').add(record);
            sessionStorage.setItem(sessionKey, 'true');
            console.log('%c🔥 Visitor saved to Firebase', 'color: #ff9800; font-weight: bold;');
        } catch (err) {
            console.warn('Firebase save failed:', err);
        }
    }

    async function trackVisitor() {
        const device = getDeviceInfo();
        const location = await getLocationInfo();

        if (location.country !== 'Unknown') {
            showLocationBadge(location);
        }

        await saveVisitorToFirebase(location, device);
    }

    /* ============ INIT ============ */
    document.addEventListener('DOMContentLoaded', () => {
        injectThemeToggle();
        trackVisitor();
    });
// ============ CMS: LOAD DYNAMIC CONTENT ============
async function loadSiteContent() {
    if (!firebaseReady || !db) return;
    try {
        const doc = await db.collection('site_content').doc('main').get();
        if (doc.exists) {
            const data = doc.data();
            if(data.name) document.getElementById('cms-name').innerText = data.name;
            if(data.bio) document.getElementById('cms-bio').innerHTML = data.bio;
            if(data.phone) document.getElementById('cms-phone').innerText = data.phone;
            if(data.email) document.getElementById('cms-email').innerText = data.email;
            if(data.color) {
                document.documentElement.style.setProperty('--primary-color', data.color);
            }
        }
    } catch (e) { console.log(e); }
}
document.addEventListener('DOMContentLoaded', loadSiteContent);


// ============ CMS: LOAD DYNAMIC LISTS ============
async function loadDynamicLists() {
    if (!firebaseReady || !db) return;
    try {
        const doc = await db.collection('site_content').doc('main').get();
        if (!doc.exists) return;
        const data = doc.data();

        // 1. Calisthenics Skills Load
        if (data.skills && data.skills.length > 0) {
            document.getElementById('cms-calisthenics-container').innerHTML = data.skills.map(cat => `
                <div class="skill-category">
                    <div class="category-title">
                        <i class="${cat.icon}"></i>
                        <h3>${cat.title}</h3>
                    </div>
                    <ul class="skill-list">
                        ${cat.items.map(item => `
                            <li class="skill-item">
                                <i class="fas fa-check-circle"></i>
                                <span class="skill-name">${item.name}</span>
                                <span class="skill-level ${item.adv ? 'advanced' : ''}">${item.level}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `).join('');
        }

        // 2. Timeline Load
        if (data.timeline && data.timeline.length > 0) {
            document.getElementById('cms-timeline-container').innerHTML = data.timeline.map(item => `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-date">${item.date}</div>
                        <h3>${item.title}</h3>
                        <p>${item.desc}</p>
                    </div>
                </div>
            `).join('');
        }

        // 3. Social Links Load
        if (data.socials && data.socials.length > 0) {
            document.getElementById('cms-social-container').innerHTML = data.socials.map(s => `
                <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="social-icon ${s.type}" title="${s.title}">
                    <i class="${s.icon}"></i>
                </a>
            `).join('');
        }
    } catch (e) { console.log('Dynamic load error:', e); }
}
document.addEventListener('DOMContentLoaded', loadDynamicLists);




})();