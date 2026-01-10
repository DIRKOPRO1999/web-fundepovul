document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MENÚ MÓVIL ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if(menuBtn) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            const icon = menuBtn.querySelector('.material-symbols-rounded');
            if(icon) {
                icon.textContent = nav.classList.contains('active') ? 'close' : 'menu';
            }
        });
    }

    // --- 2. HEADER CAMBIA AL SCROLL ---
    const header = document.querySelector('header');
    
    if(header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- 3. ANIMACIONES SCROLL REVEAL ---
    const revealElements = document.querySelectorAll('.reveal');

    if(revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.1, 
            rootMargin: "0px 0px -50px 0px"
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // --- 4. EFECTO RIPPLE (ONDITA) ---
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            let x = e.clientX - e.target.offsetLeft;
            let y = e.clientY - e.target.offsetTop;

            let ripples = document.createElement('span');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            ripples.classList.add('ripple-effect');
            
            this.appendChild(ripples);

            setTimeout(() => {
                ripples.remove();
            }, 600);
        });
    });
});
