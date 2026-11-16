const firebaseConfig = {
  apiKey: "AIzaSyC_YsXU1czjvRmft6H1j-9Z9tN8Id0LSbQ",
  authDomain: "eagle-portfolio205.firebaseapp.com",
  projectId: "eagle-portfolio205",
  storageBucket: "eagle-portfolio205.firebasestorage.app",
  messagingSenderId: "466360593525",
  appId: "1:466360593525:web:c50f81393c1afb1ae39c3c",
  measurementId: "G-MEGW6QJ389"
};

let db = null;
let firebaseReady = false;

if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseReady = true;
    } catch (err) { console.warn('Firebase init failed:', err); }
}

(function() {
    'use strict';

    // --- DARK MODE ---
    function injectThemeToggle() {
        if (document.getElementById('themeToggle')) return;
        const btn = document.createElement('button');
        btn.id = 'themeToggle';
        btn.className = 'theme-toggle';
        btn.innerHTML = '<i class="fas fa-moon"></i>';
        document.body.appendChild(btn);
        if (localStorage.getItem('eagle-theme') === 'dark') {
            document.body.classList.add('dark-mode');
            btn.innerHTML = '<i class="fas fa-sun"></i>';
        }
        btn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            localStorage.setItem('eagle-theme', isDark ? 'dark' : 'light');
        });
    }

    // --- TRACK VISITOR (Location) ---
    async function trackVisitor() {
        if (!firebaseReady || !db) return;
        
        const ua = navigator.userAgent;
        let device = /mobile/i.test(ua) ? 'Mobile' : 'Desktop';
        let browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : 'Unknown';

        try {
            const res = await fetch('https://ipapi.co/json/');
            const loc = await res.json();
            
            // Firebase mein save karein (bina sessionStorage ke, taake har refresh par record ho)
            await db.collection('visitors').add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ip: loc.ip || 'Unknown',
                city: loc.city || 'Unknown',
                country: loc.country_name || 'Unknown',
                device: device,
                browser: browser
            });
            console.log('📍 Visitor tracked successfully!');
        } catch (e) { 
            console.log('Tracking failed (Adblock?), saving basic info.');
            await db.collection('visitors').add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ip: 'Unknown', city: 'Unknown', country: 'Unknown', device: device, browser: browser
            });
        }
    }

    // --- LOAD DYNAMIC DATA (Social, Skills, Timeline) ---
    async function loadDynamicData() {
        if (!firebaseReady || !db) return;
        try {
            const doc = await db.collection('site_content').doc('main').get();
            if (doc.exists) {
                const data = doc.data();

                // 1. Skills
                if (data.skills && data.skills.length > 0) {
                    document.getElementById('cms-calisthenics-container').innerHTML = data.skills.map(cat => `
                        <div class="skill-category">
                            <div class="category-title"><i class="${cat.icon}"></i><h3>${cat.title}</h3></div>
                            <ul class="skill-list">
                                ${cat.items.map(item => `
                                    <li class="skill-item"><i class="fas fa-check-circle"></i><span class="skill-name">${item.name}</span><span class="skill-level ${item.adv ? 'advanced' : ''}">${item.level}</span></li>
                                `).join('')}
                            </ul>
                        </div>
                    `).join('');
                }

                // 2. Timeline
                if (data.timeline && data.timeline.length > 0) {
                    document.getElementById('cms-timeline-container').innerHTML = data.timeline.map(item => `
                        <div class="timeline-item reveal">
                            <div class="timeline-content">
                                <div class="timeline-date">${item.date}</div>
                                <h3>${item.title}</h3>
                                <p>${item.desc}</p>
                            </div>
                        </div>
                    `).join('');
                }

                // 3. Social Links
                if (data.socials && data.socials.length > 0) {
                    document.getElementById('cms-social-container').innerHTML = data.socials.map(s => `
                        <a href="${s.url}" target="_blank" class="social-icon ${s.type}" title="${s.title}"><i class="${s.icon}"></i></a>
                    `).join('');
                }

                // 4. Text
                if(data.name) {
                    document.getElementById('cms-name').innerText = data.name;
                }
                if(data.bio) {
                    document.getElementById('cms-bio').innerHTML = data.bio;
                }
                if(data.phone) {
                    if(document.getElementById('cms-phone')) document.getElementById('cms-phone').innerText = data.phone;
                    if(document.getElementById('cms-phone-contact')) document.getElementById('cms-phone-contact').innerText = data.phone;
                }
                if(data.email) {
                    if(document.getElementById('cms-email')) document.getElementById('cms-email').innerText = data.email;
                    if(document.getElementById('cms-email-contact')) document.getElementById('cms-email-contact').innerText = data.email;
                }
                if(data.color) {
                    document.documentElement.style.setProperty('--primary-color', data.color);
                }
            }
        } catch (e) { console.log('Dynamic load error:', e); }
    }

    document.addEventListener('DOMContentLoaded', () => {
        injectThemeToggle();
        trackVisitor();
        loadDynamicData();
    });
})();