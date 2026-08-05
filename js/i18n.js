(function initializeI18nRuntime() {
    const STORAGE_KEY = 'jerry-portfolio.locale';
    const SUPPORTED_LOCALES = ['zh', 'en'];

    const messages = {
        zh: {
            'meta.home.title': 'Jerry Shen - 个人作品集',
            'meta.home.description': 'Jerry Shen 的建筑、摄影、交互设计与旅行作品集。',
            'meta.arch.title': 'Jerry Shen - 建筑作品',
            'meta.arch.description': 'Jerry Shen 的建筑设计项目地图、项目列表与完整作品档案。',
            'meta.tools.title': 'Jerry Shen - 小工具集',
            'meta.tools.description': 'Jerry Shen 制作的建筑分析、创作辅助与日常实验性网页工具。',
            'nav.main': '主导航',
            'nav.home': '主页',
            'nav.architecture': '建筑',
            'nav.uiux': '交互',
            'nav.photography': '摄影',
            'nav.tools': '小工具集',
            'language.switcher': '语言切换',
            'language.zh': '切换为中文',
            'language.en': '切换为英文',
            'hero.motto': 'Per Aspera ad astra.',
            'hero.location': '中国·四川·阿坝',
            'hero.tibetan': 'རི་མཐོན་ཆུ་རྒྱང་། ཡོན་ཏན་ཟིལ་རྒྱང་།',
            'hero.tibetanTranslation': '山高水自长，德厚声自远',
            'hero.scrollAbout': '滚动至个人介绍',
            'about.imageAlt': '沈俊阳站在雪山前举手迎向阳光',
            'about.name': '沈俊阳',
            'about.alias': '别名：忘了猫叔',
            'about.tags': '零零后 / 建筑设计 / 交互设计 / 摄影 / 电影',
            'about.statement': '于方寸之间，见万千气象。',
            'quote.portraitAlt': '建筑师勒·柯布西耶肖像',
            'quote.text': '“少即是多。”',
            'quote.author': '勒·柯布西耶',
            'education.title': '教育经历',
            'education.pku.name': '北京大学附属中学',
            'education.pku.period': '2016–2022',
            'education.scu.name': '四川大学',
            'education.scu.degree': '建筑学学士',
            'education.scu.period': '2022–2027',
            'awards.title': '荣誉奖项',
            'awards.milan.name': '第九届米兰设计周',
            'awards.milan.level': '四川省三等奖',
            'awards.futureSichuan.name': '未来设计师 · 四川省高校设计大赛',
            'awards.futureSichuan.level': '四川省一等奖',
            'awards.futureNational.name': '未来设计师 · 全国高校设计大赛',
            'awards.futureNational.level': '全国三等奖',
            'awards.scu.name': '四川大学奖学金',
            'awards.scu.level': '综合二等奖学金',
            'awards.national.name': '国家奖学金',
            'awards.national.level': '本科生国家奖学金',
            'archives.title': '项目存档',
            'archives.photography.title': '摄影作品',
            'archives.architecture.title': '建筑设计',
            'archives.uiux.title': '交互设计',
            'footer.made': 'Jerry 用 ❤️ 制作',
            'footer.copyright': '© 2026 Orson Krennic。保留所有权利。',
            'footer.powered': '由 Chimi 的爱💗 与 GitHub Pages 驱动',
            'map.title': '项目分布',
            'map.region': '建筑项目分布地图',
            'projects.list': '建筑项目列表',
            'projects.noscript': '请启用 JavaScript 以浏览建筑项目。',
            'modal.close': '关闭项目详情',
            'gallery.previous': '上一张项目图片',
            'gallery.next': '下一张项目图片',
            'project.field.time': '项目时间',
            'project.field.location': '位置地点',
            'project.field.type': '功能类型',
            'project.field.area': '建筑面积',
            'project.field.far': '容积率',
            'project.field.greening': '绿地率',
            'project.field.designer': '设计人员',
            'project.more': '更多 +',
            'project.unnamed': '未命名项目',
            'project.view': '查看项目：{title}',
            'project.previewAlt': '{title}项目预览',
            'project.galleryAlt': '{title}，项目图片 {current} / {total}',
            'project.galleryDot': '查看第 {index} 张项目图片',
            'status.projectsUnavailable': '项目资料暂时无法加载，请稍后重试。',
            'status.mapUnavailable': '地图暂时无法加载，项目列表仍可正常浏览。',
            'status.noImages': '该项目暂未提供图片。',
            'tools.kicker': 'DIGITAL WORKBENCH · 02 APPS',
            'tools.title': '小工具集',
            'tools.intro': '把重复的步骤变成工具，把模糊的想法变成可以打开、使用和继续改造的网页应用。',
            'tools.catalog': '网页应用项目',
            'tools.webApp': 'WEB APP',
            'tools.live': 'LIVE',
            'tools.tags': '项目标签',
            'tools.openApp': '打开应用',
            'tools.viewSource': '查看源码',
            'tools.antimap.subtitle': '建筑前期分析与概念制图工具集',
            'tools.antimap.description': '面向建筑、规划与景观设计的浏览器端工作台。覆盖场地数据分析、策略图、泡泡图、体块演变、平剖面渲染和作品集排版，让“场地到图板”的工作流集中在一个入口。',
            'tools.antimap.tag1': '场地分析',
            'tools.antimap.tag2': '概念制图',
            'tools.antimap.openLabel': '打开 AntiMap 应用',
            'tools.antimap.repoLabel': '查看 AntiMap GitHub 仓库',
            'tools.perler.subtitle': '在线拼豆图纸生成器',
            'tools.perler.description': '基于 MARD 221 色卡的在线拼豆图纸生成器。上传图片后可以进行色彩匹配、抖动、颗粒高亮与尺寸调整，并导出 PNG 图纸和 CSV 材料清单。',
            'tools.perler.tag1': '像素艺术',
            'tools.perler.tag2': '色彩匹配',
            'tools.perler.tag3': '图纸导出',
            'tools.perler.openLabel': '打开 MARD 221 Palette 应用',
            'tools.perler.repoLabel': '查看 MARD 221 Palette GitHub 仓库',
            'tools.note': '这里会持续收录新的网页实验与实用工具。'
        },
        en: {
            'meta.home.title': 'Jerry Shen - Portfolio',
            'meta.home.description': 'Jerry Shen’s portfolio of architecture, photography, interaction design, and travel.',
            'meta.arch.title': 'Jerry Shen - Architecture',
            'meta.arch.description': 'Explore Jerry Shen’s architectural work through a project map, index, and detailed archive.',
            'meta.tools.title': 'Jerry Shen - Vibe Tools',
            'meta.tools.description': 'Web tools by Jerry Shen for architecture, creative work, and everyday experiments.',
            'nav.main': 'Primary navigation',
            'nav.home': 'Portfolio',
            'nav.architecture': 'Architecture',
            'nav.uiux': 'UI/UX',
            'nav.photography': 'Photography',
            'nav.tools': 'Vibe Tools',
            'language.switcher': 'Language selector',
            'language.zh': 'Switch to Chinese',
            'language.en': 'Switch to English',
            'hero.motto': 'Per Aspera ad astra.',
            'hero.location': 'Ngawa, Sichuan, China',
            'hero.tibetan': 'རི་མཐོན་ཆུ་རྒྱང་། ཡོན་ཏན་ཟིལ་རྒྱང་།',
            'hero.tibetanTranslation': 'High mountains, far-reaching waters; deep virtue, enduring renown.',
            'hero.scrollAbout': 'Scroll to the profile section',
            'about.imageAlt': 'Shen Junyang reaching toward the sunlight before snow-covered mountains',
            'about.name': 'Shen Junyang',
            'about.alias': 'Also known as Orson Krennic',
            'about.tags': 'Gen Z / Architect / Interaction Designer / Photographer / Filmmaker',
            'about.statement': 'Design distills the richest story into its clearest form.',
            'quote.portraitAlt': 'Portrait of architect Le Corbusier',
            'quote.text': '“Less is more.”',
            'quote.author': 'Le Corbusier',
            'education.title': 'Education',
            'education.pku.name': 'Peking University High School',
            'education.pku.period': '2016–2022',
            'education.scu.name': 'Sichuan University',
            'education.scu.degree': 'Bachelor of Architecture',
            'education.scu.period': '2022–2027',
            'awards.title': 'Awards',
            'awards.milan.name': '9th Milan Design Week',
            'awards.milan.level': 'Third Prize, Sichuan',
            'awards.futureSichuan.name': 'Future Designer · Sichuan University Design Competition',
            'awards.futureSichuan.level': 'First Prize, Sichuan',
            'awards.futureNational.name': 'Future Designer · National College Design Competition',
            'awards.futureNational.level': 'National Third Prize',
            'awards.scu.name': 'Sichuan University Scholarship',
            'awards.scu.level': 'Second-Class Comprehensive Scholarship',
            'awards.national.name': 'National Scholarship',
            'awards.national.level': 'National Scholarship for Undergraduate Students',
            'archives.title': 'Project Archives',
            'archives.photography.title': 'Photography',
            'archives.architecture.title': 'Architecture',
            'archives.uiux.title': 'UI/UX',
            'footer.made': 'Made by Jerry with ❤️',
            'footer.copyright': '© 2026 Orson Krennic. All rights reserved.',
            'footer.powered': 'Powered by Chimi’s LOVE💗 and GitHub Pages',
            'map.title': 'Project Map',
            'map.region': 'Map of architecture projects',
            'projects.list': 'Architecture project list',
            'projects.noscript': 'Enable JavaScript to browse the architecture projects.',
            'modal.close': 'Close project details',
            'gallery.previous': 'Previous project image',
            'gallery.next': 'Next project image',
            'project.field.time': 'Timeline',
            'project.field.location': 'Location',
            'project.field.type': 'Typology',
            'project.field.area': 'Floor Area',
            'project.field.far': 'Floor Area Ratio',
            'project.field.greening': 'Green Coverage',
            'project.field.designer': 'Designer',
            'project.more': 'MORE +',
            'project.unnamed': 'Untitled Project',
            'project.view': 'View project: {title}',
            'project.previewAlt': 'Preview of {title}',
            'project.galleryAlt': '{title}, project image {current} of {total}',
            'project.galleryDot': 'View project image {index}',
            'status.projectsUnavailable': 'Project information is temporarily unavailable. Please try again later.',
            'status.mapUnavailable': 'The map is unavailable, but the project list remains accessible.',
            'status.noImages': 'No images are currently available for this project.',
            'tools.kicker': 'DIGITAL WORKBENCH · 02 APPS',
            'tools.title': 'Vibe Tools',
            'tools.intro': 'Turning repeated steps into tools, and unfinished ideas into web apps that can be opened, used, and reshaped.',
            'tools.catalog': 'Web application projects',
            'tools.webApp': 'WEB APP',
            'tools.live': 'LIVE',
            'tools.tags': 'Project tags',
            'tools.openApp': 'OPEN APP',
            'tools.viewSource': 'VIEW SOURCE',
            'tools.antimap.subtitle': 'Early-stage architecture analysis and concept drawing toolkit',
            'tools.antimap.description': 'A browser-based workspace for architecture, planning, and landscape design. It brings site data, strategy diagrams, bubble diagrams, massing studies, plan and section rendering, and portfolio layout into one path from site to board.',
            'tools.antimap.tag1': 'Site Analysis',
            'tools.antimap.tag2': 'Concept Drawing',
            'tools.antimap.openLabel': 'Open the AntiMap application',
            'tools.antimap.repoLabel': 'View the AntiMap GitHub repository',
            'tools.perler.subtitle': 'Online fuse-bead pattern generator',
            'tools.perler.description': 'An online pattern generator built around the MARD 221 color chart. Upload an image, refine its color matching, dithering, bead highlighting, and dimensions, then export a PNG pattern and CSV material list.',
            'tools.perler.tag1': 'Pixel Art',
            'tools.perler.tag2': 'Color Matching',
            'tools.perler.tag3': 'Pattern Export',
            'tools.perler.openLabel': 'Open the MARD 221 Palette application',
            'tools.perler.repoLabel': 'View the MARD 221 Palette GitHub repository',
            'tools.note': 'New web experiments and practical tools will continue to join this collection.'
        }
    };

    function readStoredLocale() {
        try {
            return window.localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }

    function detectLocale() {
        const storedLocale = readStoredLocale();
        if (SUPPORTED_LOCALES.includes(storedLocale)) return storedLocale;
        return window.navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    }

    let currentLocale = detectLocale();

    function interpolate(message, variables = {}) {
        return message.replace(/\{(\w+)\}/g, (match, key) => (
            Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : match
        ));
    }

    function translate(key, variables) {
        const dictionary = messages[currentLocale] || messages.zh;
        const message = dictionary[key] ?? messages.zh[key] ?? key;
        return interpolate(message, variables);
    }

    function elementsIncludingRoot(root, selector) {
        const elements = Array.from(root.querySelectorAll(selector));
        if (root instanceof Element && root.matches(selector)) elements.unshift(root);
        return elements;
    }

    function translateDocument(root = document) {
        elementsIncludingRoot(root, '[data-i18n]').forEach((element) => {
            element.textContent = translate(element.dataset.i18n);
        });

        ['aria-label', 'alt', 'content', 'title', 'placeholder'].forEach((attributeName) => {
            const dataAttribute = `data-i18n-${attributeName}`;
            elementsIncludingRoot(root, `[${dataAttribute}]`).forEach((element) => {
                element.setAttribute(attributeName, translate(element.getAttribute(dataAttribute)));
            });
        });

        document.documentElement.lang = currentLocale === 'zh' ? 'zh-CN' : 'en';
        document.documentElement.dataset.locale = currentLocale;

        document.querySelectorAll('[data-locale]').forEach((button) => {
            const isActive = button.dataset.locale === currentLocale;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    function persistLocale(locale) {
        try {
            window.localStorage.setItem(STORAGE_KEY, locale);
        } catch {
            // The site remains functional when storage is unavailable.
        }
    }

    function setLocale(locale, options = {}) {
        if (!SUPPORTED_LOCALES.includes(locale)) return;

        const changed = locale !== currentLocale;
        currentLocale = locale;
        translateDocument();
        if (options.persist !== false) persistLocale(locale);

        if (changed || options.emit === true) {
            window.dispatchEvent(new CustomEvent('localechange', {
                detail: { locale: currentLocale }
            }));
        }
    }

    function initializeControls() {
        document.querySelectorAll('[data-locale]').forEach((button) => {
            button.addEventListener('click', () => setLocale(button.dataset.locale));
        });
        setLocale(currentLocale, { persist: false, emit: true });
    }

    window.SiteI18n = Object.freeze({
        getLocale: () => currentLocale,
        setLocale,
        t: translate,
        translate: translateDocument,
        supportedLocales: Object.freeze([...SUPPORTED_LOCALES])
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeControls, { once: true });
    } else {
        initializeControls();
    }
})();
