document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Initialize gallery filters
    function initGalleryFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        // Remove existing event listeners to prevent duplicates
        filterBtns.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        // Get fresh references after cloning
        const freshFilterBtns = document.querySelectorAll('.filter-btn');
        
        freshFilterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                freshFilterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                
                galleryItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.style.display = 'block';
                        if (item.style.animation) {
                            item.style.animation = 'none';
                            void item.offsetWidth; // Trigger reflow
                        }
                        item.style.animation = 'fadeUp 0.6s ease-out';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add active class to current page nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // CONTENT MANAGER: read content from localStorage and apply to DOM
    const readJSON = (k, fallback=null) => {
        try { 
            return JSON.parse(localStorage.getItem(k)) ?? fallback; 
        } catch { 
            return fallback; 
        }
    };

    function applyHeroContent() {
        const hero = readJSON('content_hero');
        if (!hero) return;
        const titleEl = document.querySelector('.hero-title');
        const descEl = document.querySelector('.hero-description');
        const imgEl = document.querySelector('.hero-image');
        if (titleEl && hero.title) titleEl.textContent = hero.title;
        if (descEl && hero.description) descEl.textContent = hero.description;
        if (imgEl && hero.image) imgEl.src = hero.image;
    }

    function applyServicesContent() {
        const items = readJSON('content_services');
        if (!items || !Array.isArray(items)) return;
        const cards = document.querySelectorAll('.services-grid .service-card');
        cards.forEach((card, i) => {
            const item = items[i];
            if (!item) return;
            const h3 = card.querySelector('h3');
            const p = card.querySelector('p');
            if (h3 && item.title) h3.textContent = item.title;
            if (p && item.description) p.textContent = item.description;
        });
    }

    function buildGalleryItemHTML(g, index) {
        const delay = index * 100;
        return `
        <div class="gallery-item" data-category="${g.category || 'wigs'}" data-aos="zoom-in" data-aos-delay="${delay}">
            <img src="${g.src}" alt="${g.alt || 'Gallery'}">
            <div class="gallery-overlay">
                <div class="gallery-info">
                    <span class="gallery-badge">${(g.category||'').charAt(0).toUpperCase() + (g.category||'').slice(1)}</span>
                    <h4>${g.title || ''}</h4>
                    <p>${g.subtitle || ''}</p>
                </div>
                <button class="gallery-view-btn">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        </div>`;
    }

    function applyGalleryContent() {
        const items = readJSON('content_gallery');
        if (!items || !Array.isArray(items) || items.length === 0) return;
        
        const fullGrid = document.getElementById('galleryGrid');
        const previewGrid = document.querySelector('.gallery-preview .gallery-grid');
        
        if (fullGrid) {
            fullGrid.innerHTML = items.map((item, index) => buildGalleryItemHTML(item, index)).join('');
            // Reinitialize filters after content update
            initGalleryFilters();
        }
        
        if (previewGrid) {
            const subset = items.slice(0, 3);
            previewGrid.innerHTML = subset.map((item, index) => buildGalleryItemHTML(item, index)).join('');
        }
    }

    function applyTestimonialsContent() {
        const list = readJSON('content_testimonials');
        if (!list || !Array.isArray(list) || list.length === 0) return;
        const grid = document.querySelector('.testimonials-grid');
        if (!grid) return;
        
        grid.innerHTML = list.map((t, index) => `
            <div class="testimonial-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="testimonial-content">
                    <div class="stars">${'★'.repeat(Math.max(1, Math.min(5, t.stars || 5)))}</div>
                    <p>${t.text || ''}</p>
                    <div class="testimonial-author">
                        <img src="${t.avatar || 'https://placehold.co/100x100'}" alt="${t.name || 'Client'}">
                        <div>
                            <h4>${t.name || 'Client'}</h4>
                            <span>${t.location || ''}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function applyContactContent() {
        const c = readJSON('content_contact');
        if (!c) return;
        
        const vals = document.querySelectorAll('.contact-value');
        if (vals[0] && c.phone) vals[0].textContent = c.phone;
        if (vals[1] && c.whatsapp) vals[1].textContent = c.whatsapp;
        if (vals[2] && c.email) vals[2].textContent = c.email;
        if (vals[3] && c.address) vals[3].textContent = c.address;
    }

    // Apply content across pages
    applyHeroContent();
    applyServicesContent();
    applyGalleryContent();
    applyTestimonialsContent();
    applyContactContent();

    // Initialize gallery filters on load
    initGalleryFilters();

    // Initialize scroll animations if available
    if (typeof initScrollAnimations === 'function') {
        initScrollAnimations();
    }
});