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
    const sections = Array.from(
        document.querySelectorAll('.product-section')
    );
    const dots = Array.from(
        document.querySelectorAll('#scrollIndicator .indicator-dot')
    );
    const progressBar = document.getElementById('progressBar');

    if (!sections.length) return;

    const total = sections.length;
    let currentIndex = 0;
    let isAnimating = false;
    const animateDuration = 600;

    // 根据真实产品 ID 查找页面位置
    function getIndexByProductId(productId) {
        return sections.findIndex(section =>
            section.dataset.productId === String(productId)
        );
    }

    // 根据网址参数查找对应产品
    function getIndexFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('product');

        if (!productId) return 0;

        const index = getIndexByProductId(productId);
        return index >= 0 ? index : 0;
    }

    // 更新产品页面、指示圆点和进度条
    function updateDisplay() {
        sections.forEach((section, index) => {
            section.classList.toggle('active', index === currentIndex);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });

        if (progressBar) {
            progressBar.style.width = (
                total > 1
                    ? (currentIndex / (total - 1)) * 100
                    : 100
            ) + '%';
        }
    }

    // 初次进入页面时，根据 ?product=ID 定位
    currentIndex = getIndexFromUrl();
    updateDisplay();

    // 切换产品页面
    function goToSection(index, pushUrl = true) {
        if (isAnimating || index < 0 || index >= total) return;
        if (index === currentIndex) return;

        isAnimating = true;
        currentIndex = index;
        updateDisplay();

        // 地址栏使用真实产品 ID，而不是数组下标
        if (pushUrl) {
            const productId = sections[currentIndex].dataset.productId;
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('product', productId);
            history.pushState({}, '', newUrl);
        }

        setTimeout(() => {
            isAnimating = false;
        }, animateDuration);
    }

    // 浏览器前进、后退时同步产品页面
    window.addEventListener('popstate', () => {
        currentIndex = getIndexFromUrl();
        updateDisplay();
    });

    // 鼠标滚轮切换
    document.addEventListener('wheel', function(e) {
        if (!document.querySelector('.products-fullpage')) return;

        // 已滚入页脚等区域时允许正常滚动
        if (window.scrollY > 0) return;

        const atFirst = currentIndex === 0 && e.deltaY < 0;
        const atLast = currentIndex === total - 1 && e.deltaY > 0;

        if (atFirst || atLast) return;

        e.preventDefault();

        if (isAnimating) return;

        if (e.deltaY > 0) {
            goToSection(currentIndex + 1);
        } else {
            goToSection(currentIndex - 1);
        }
    }, { passive: false });

    // 右侧圆点切换
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSection(index);
        });
    });

    // 键盘上下方向键切换
    document.addEventListener('keydown', (e) => {
        if (!document.querySelector('.products-fullpage')) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            goToSection(currentIndex + 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            goToSection(currentIndex - 1);
        }
    });

    // 手机触屏上下滑动
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        if (!document.querySelector('.products-fullpage')) return;
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