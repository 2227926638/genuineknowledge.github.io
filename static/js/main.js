document.addEventListener('DOMContentLoaded', function() {
    initHeaderScroll();
    initBannerCarousel();
    initScrollAnimations();
    initProductFullpage();
    initNewsSearch();
    initJobExpand();
    initModal();
    initMobileMenu();
});

// 导航栏滚动渐变效果
function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    const updateHeader = () => {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader);
}

// Banner 轮播（自动5秒、悬停暂停、箭头/圆点切换、淡入淡出）
function initBannerCarousel() {
    const carousel = document.getElementById('bannerCarousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.banner-slide');
    const prevBtn = document.getElementById('bannerPrev');
    const nextBtn = document.getElementById('bannerNext');
    const indicators = document.getElementById('bannerIndicators').querySelectorAll('.indicator-dot');
    
    let currentIndex = 0;
    let autoPlayTimer = null;
    const interval = 5000;

    function goToSlide(index) {
        slides[currentIndex].classList.remove('active');
        indicators[currentIndex].classList.remove('active');
        
        currentIndex = (index + slides.length) % slides.length;
        
        slides[currentIndex].classList.add('active');
        indicators[currentIndex].classList.add('active');
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayTimer = setInterval(nextSlide, interval);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    }

    prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoPlay();
    });

    indicators.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            startAutoPlay();
        });
    });

    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
}

// 滚动渐入动画
function initScrollAnimations() {
    const elements = document.querySelectorAll('.section-animate, .timeline-item');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// 产品页：滚轮整屏翻页（仅修改此函数，其余代码完全不变）
function initProductFullpage() {
    const sections = document.querySelectorAll('.product-section');
    const dots = document.querySelectorAll('#scrollIndicator .indicator-dot');
    const progressBar = document.getElementById('progressBar');
    if (!sections.length) return;

    const total = sections.length;
    let currentIndex = 0;
    let isAnimating = false;
    const animateDuration = 600;

    // 初始化第一屏
    // 初始化：根据 URL 参数直接定位到目标产品屏，避免先显示第一屏
    const urlParams = new URLSearchParams(window.location.search);
    const urlProduct = urlParams.get('product');
    if (urlProduct) {
        const idx = parseInt(urlProduct, 10) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < total) {
            currentIndex = idx;
        }
    }
    sections[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
    if (progressBar) {
        progressBar.style.width = ((currentIndex / (total - 1)) * 100) + '%';
    }

    // 跳转区块，同步更新url参数
    function goToSection(index, pushUrl = true) {
        if (isAnimating || index < 0 || index >= total) return;
        isAnimating = true;

        sections[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');

        currentIndex = index;

        sections[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');

        // 更新进度条
        if (progressBar) {
            progressBar.style.width = ((currentIndex / (total - 1)) * 100) + '%';
        }

        // 更新地址栏 ?product=数字
        if (pushUrl) {
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('product', currentIndex + 1);
            history.pushState({}, '', newUrl);
        }

        setTimeout(() => {
            isAnimating = false;
        }, animateDuration);
    }

    // 页面加载时读取url参数，自动跳对应产品
    window.addEventListener('load', () => {
        const params = new URLSearchParams(window.location.search);
        const productIndex = params.get('product');
        if (productIndex) {
            const index = parseInt(productIndex, 10) - 1;
            if (!isNaN(index) && index >= 0 && index < total && index !== currentIndex) {
                setTimeout(() => goToSection(index, false), 300);
            }
        }
    });

    // 浏览器前进后退监听
    window.addEventListener('popstate', () => {
        const params = new URLSearchParams(window.location.search);
        const productIndex = params.get('product');
        if (!productIndex) return;
        const index = parseInt(productIndex, 10) - 1;
        if (!isNaN(index) && index >= 0 && index < total) {
            goToSection(index, false);
        }
    });

    // 滚轮监听（带节流，一次滚动只翻一屏）
    document.addEventListener('wheel', function(e) {
        if (!document.querySelector('.products-fullpage')) return;
        
        // 已滚入页脚等区域：放行原生滚动，回到顶部前不再接管
        if (window.scrollY > 0) return;

        // 边界放行：首屏向上、末屏向下时允许浏览器原生滚动
        const atFirst = (currentIndex === 0 && e.deltaY < 0);
        const atLast = (currentIndex === total - 1 && e.deltaY > 0);
        if (atFirst || atLast) return;

        e.preventDefault();
        if (isAnimating) return;

        if (e.deltaY > 0) {
            goToSection(currentIndex + 1);
        } else if (e.deltaY < 0) {
            goToSection(currentIndex - 1);
        }
    }, { passive: false });

    // 右侧圆点点击
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSection(index);
        });
    });

    // 键盘上下键切换
    document.addEventListener('keydown', (e) => {
        if (!document.querySelector('.products-fullpage')) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            goToSection(currentIndex + 1);
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            goToSection(currentIndex - 1);
        }
    });

    // 触屏滑动支持
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (!document.querySelector('.products-fullpage')) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                goToSection(currentIndex + 1);
            } else {
                goToSection(currentIndex - 1);
            }
        }
    }, { passive: true });
}

// 新闻页实时搜索过滤
function initNewsSearch() {
    const searchInput = document.getElementById('newsSearch');
    const newsList = document.getElementById('newsList');
    if (!searchInput || !newsList) return;

    const cards = newsList.querySelectorAll('.news-card-link');

    searchInput.addEventListener('input', function() {
        const keyword = this.value.toLowerCase().trim();

        cards.forEach(card => {
            const title = card.querySelector('.news-title').textContent.toLowerCase();
            const summary = card.querySelector('.news-summary').textContent.toLowerCase();

            if (title.includes(keyword) || summary.includes(keyword)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// 招聘卡片展开/收起
function initJobExpand() {
    const jobCards = document.querySelectorAll('.job-card');
    if (!jobCards.length) return;

    jobCards.forEach(card => {
        const header = card.querySelector('.job-header');
        header.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
    });
}

// 通用弹窗
function initModal() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalClose');
    const content = document.getElementById('modalContent');
    if (!overlay) return;

    function openModal(html) {
        content.innerHTML = html;
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('show')) {
            closeModal();
        }
    });

    window.closeModal = closeModal;
}

// 移动端汉堡菜单
function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
        });
    });
}