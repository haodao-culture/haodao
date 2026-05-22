(function () {
    'use strict';

    // ---------------------------------------------------------------
    // CONFIG
    //
    // 資料來源優先順序：SHEET_CSV_URL > 本地 events.json
    //
    // 之後要切換到 Google Sheets：
    //   1. 開一張試算表，第一列為欄位名稱（見下方 FIELD_ALIASES，
    //      中文或英文皆可，多個別名都會自動辨識）
    //   2. 「檔案 → 共用 → 發佈到網路」→ 選擇「逗號分隔值 (.csv)」→ 取得連結
    //   3. 把連結貼到 SHEET_CSV_URL
    // ---------------------------------------------------------------
    var SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRN3Y4zJ-ReF0qFUbd8BPwdlwbWNZBA2RYL2XX3rWi51OeQtK2R4DOO8bwic1PH-WKJQyoVLudn0w2V/pub?gid=1291996599&single=true&output=csv';
    var LOCAL_JSON_URL = 'events.json';

    // 欄位對照：每個欄位可接受多個名稱（中文 / 英文），
    // 讀資料時會依序嘗試，第一個非空的值就採用。
    var FIELD_ALIASES = {
        id:              ['id', '提交時間', '時間戳記', 'Timestamp'],
        title:           ['title', '主題', '活動主題'],
        date:            ['date', '活動日期', '日期', '日期 (開始)', '日期(開始)', '開始日期'],
        endDate:         ['endDate', '日期 (結束)', '日期(結束)', '結束日期'],
        startTime:       ['startTime', '開始時間', '時間 (開始)', '時間(開始)'],
        endTime:         ['endTime', '結束時間', '時間 (結束)', '時間(結束)'],
        location:        ['location', '活動地點', '地點'],
        audience:        ['audience', '對象', '開放報名對象', '開放報名對象範圍（可多選、但儘量單一）'],
        description:     ['description', '活動簡要', '活動簡要說明 (引文)', '簡短引文', '簡介'],
        registrationUrl: ['registrationUrl', '報名網址', '報名連結', '報名網址 / 報名接龍群組'],
        format:          ['format', '形式', '活動形式'],
        tags:            ['tags', '標籤', '分類'],
        image:           ['image', '海報', '活動海報', '上傳活動海報']
    };

    // ---------------------------------------------------------------
    // 狀態
    // ---------------------------------------------------------------
    var now = new Date();
    var state = {
        events: [],
        currentTab: 'current',
        currentFilter: 'all',
        calendarMonth: new Date(now.getFullYear(), now.getMonth(), 1)
    };

    // ---------------------------------------------------------------
    // 載入資料
    // ---------------------------------------------------------------
    function loadEvents() {
        var url = SHEET_CSV_URL || LOCAL_JSON_URL;
        return fetch(url, { cache: 'no-cache' })
            .then(function (res) {
                if (!res.ok) throw new Error('Failed to load events');
                return SHEET_CSV_URL ? res.text().then(parseCsv) : res.json();
            })
            .then(function (events) {
                return events.map(normaliseEvent);
            });
    }

    function parseCsv(text) {
        var rows = csvToRows(text);
        if (rows.length < 2) return [];
        var header = rows[0];
        return rows.slice(1)
            .filter(function (row) { return row.some(function (c) { return c.trim() !== ''; }); })
            .map(function (row) {
                var obj = {};
                header.forEach(function (col, i) {
                    obj[col.trim()] = (row[i] || '').trim();
                });
                return obj;
            });
    }

    // 簡易 CSV parser，支援欄位內含引號與換行
    function csvToRows(text) {
        var rows = [];
        var row = [];
        var field = '';
        var inQuotes = false;
        for (var i = 0; i < text.length; i++) {
            var c = text[i];
            if (inQuotes) {
                if (c === '"') {
                    if (text[i + 1] === '"') { field += '"'; i++; }
                    else { inQuotes = false; }
                } else {
                    field += c;
                }
            } else {
                if (c === '"') inQuotes = true;
                else if (c === ',') { row.push(field); field = ''; }
                else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
                else if (c === '\r') { /* skip */ }
                else field += c;
            }
        }
        if (field !== '' || row.length) { row.push(field); rows.push(row); }
        return rows;
    }

    function normaliseEvent(raw) {
        function pick(key) {
            var aliases = FIELD_ALIASES[key];
            for (var i = 0; i < aliases.length; i++) {
                var v = raw[aliases[i]];
                if (v != null && v !== '') return v;
            }
            return '';
        }
        var rawTags = pick('tags');
        return {
            id:              pick('id'),
            title:           pick('title'),
            date:            normaliseDate(pick('date')),
            endDate:         normaliseDate(pick('endDate')),
            startTime:       normaliseTime(pick('startTime')),
            endTime:         normaliseTime(pick('endTime')),
            location:        pick('location'),
            audience:        pick('audience'),
            description:     pick('description'),
            registrationUrl: pick('registrationUrl'),
            format:          pick('format'),
            tags: Array.isArray(rawTags)
                ? rawTags
                : String(rawTags).split(/[,，、]/).map(function (t) { return t.trim(); }).filter(Boolean),
            image: normaliseImageUrl(pick('image'))
        };
    }

    // 把日期統一成 YYYY-MM-DD：接受 2026/7/17、2026-7-17、2026/07/17… 等格式
    function normaliseDate(s) {
        if (!s) return '';
        var m = String(s).match(/(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
        if (!m) return s;
        var pad = function (n) { return n.length < 2 ? '0' + n : n; };
        return m[1] + '-' + pad(m[2]) + '-' + pad(m[3]);
    }

    // 把時間統一成 HH:MM：接受 上午 9:00:00、下午 5:00、09:00:00 等格式
    function normaliseTime(s) {
        if (!s) return '';
        s = String(s).trim();
        var ampm = /^(上午|下午|AM|PM|am|pm)\s*(\d{1,2}):(\d{2})/.exec(s);
        var plain = /^(\d{1,2}):(\d{2})/.exec(s);
        var h, mm;
        if (ampm) {
            h = parseInt(ampm[2], 10);
            mm = ampm[3];
            var isPm = ampm[1] === '下午' || /pm/i.test(ampm[1]);
            if (isPm && h < 12) h += 12;
            if (!isPm && h === 12) h = 0;
        } else if (plain) {
            h = parseInt(plain[1], 10);
            mm = plain[2];
        } else {
            return s;
        }
        return (h < 10 ? '0' + h : '' + h) + ':' + mm;
    }

    // Google Drive 的分享網址（file/d/ID/view、open?id=ID、uc?id=ID）轉成
    // 可直接嵌入的圖片網址。其他網址原樣回傳。
    function normaliseImageUrl(url) {
        if (!url) return '';
        var m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
            || url.match(/drive\.google\.com\/open\?id=([^&]+)/)
            || url.match(/drive\.google\.com\/uc\?[^#]*id=([^&]+)/);
        if (m) return 'https://lh3.googleusercontent.com/d/' + m[1];
        return url;
    }

    // ---------------------------------------------------------------
    // 分流：進行中 / 歷史
    // ---------------------------------------------------------------
    function isPast(event) {
        if (!event.date) return false;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var lastDay = event.endDate || event.date;
        var eventEnd = new Date(lastDay + 'T00:00:00');
        return eventEnd < today;
    }

    function matchesFilter(event, filter) {
        if (filter === 'all') return true;
        if (filter === '線上') {
            return event.format === '線上' || event.format === '線上活動'
                || event.tags.indexOf('線上') !== -1;
        }
        if (filter === '線下實體') {
            return event.format === '線下實體' || event.format === '實體'
                || event.format === '實體活動' || event.format === '線下'
                || event.tags.indexOf('線下') !== -1 || event.tags.indexOf('實體') !== -1;
        }
        return true;
    }

    // ---------------------------------------------------------------
    // 渲染：頁面切換
    // ---------------------------------------------------------------
    function render() {
        var list = document.getElementById('events-list');
        var calendar = document.getElementById('events-calendar');
        var filter = document.getElementById('events-filter');
        if (!list || !calendar || !filter) return;

        var isCalendar = state.currentTab === 'calendar';

        // 視圖切換
        list.hidden = isCalendar;
        calendar.hidden = !isCalendar;
        filter.hidden = isCalendar; // 行事曆不套用 線上/線下 篩選

        if (isCalendar) {
            renderCalendar();
        } else {
            renderList();
        }
    }

    // ---------------------------------------------------------------
    // 渲染：卡片列表
    // ---------------------------------------------------------------
    function renderList() {
        var list = document.getElementById('events-list');
        if (!list) return;

        var showPast = state.currentTab === 'past';
        var filtered = state.events
            .filter(function (e) { return showPast ? isPast(e) : !isPast(e); })
            .filter(function (e) { return matchesFilter(e, state.currentFilter); })
            .sort(function (a, b) {
                return showPast
                    ? (a.date < b.date ? 1 : -1)
                    : (a.date < b.date ? -1 : 1);
            });

        if (filtered.length === 0) {
            list.innerHTML = '<p class="events-empty">' +
                (showPast ? '目前沒有歷史活動' : '目前沒有進行中的活動') +
                '</p>';
            return;
        }

        list.innerHTML = filtered.map(function (e) {
            return renderCard(e, showPast);
        }).join('');
    }

    function renderCard(event, isPastEvent) {
        var dateStr = formatDateRange(event.date, event.endDate);
        var timeStr = event.startTime
            ? (event.endTime ? event.startTime + '–' + event.endTime : event.startTime)
            : '';

        var tagsHtml = event.tags.map(function (t) {
            return '<span class="event-tag">#' + escapeHtml(t) + '</span>';
        }).join('');

        var ctaHtml = renderCta(event, isPastEvent);

        var imageHtml = event.image
            ? '<div class="event-image"><img src="' + escapeAttr(event.image) +
                '" alt="' + escapeAttr(event.title) + ' 活動海報" loading="lazy"></div>'
            : '';

        return '' +
            '<article class="event-card' + (isPastEvent ? ' is-past' : '') + '">' +
                imageHtml +
                '<div class="event-body">' +
                    '<h3 class="event-title">' + escapeHtml(event.title) + '</h3>' +
                    '<p class="event-meta">' +
                        '<span class="event-date">' + escapeHtml(dateStr) + '</span>' +
                        (timeStr ? '<span class="event-time">' + escapeHtml(timeStr) + '</span>' : '') +
                        (event.location ? '<span class="event-location">' + escapeHtml(event.location) + '</span>' : '') +
                    '</p>' +
                    (event.audience ? '<p class="event-audience">對象：' + escapeHtml(event.audience) + '</p>' : '') +
                    (event.description ? '<p class="event-desc">' + escapeHtml(event.description) + '</p>' : '') +
                    (tagsHtml ? '<p class="event-tags">' + tagsHtml + '</p>' : '') +
                    ctaHtml +
                '</div>' +
            '</article>';
    }

    function renderCta(event, isPastEvent) {
        if (isPastEvent) {
            return '<span class="event-cta is-disabled">活動已結束</span>';
        }
        if (event.registrationUrl) {
            return '<a class="event-cta" href="' + escapeAttr(event.registrationUrl) +
                '" target="_blank" rel="noopener">立即報名</a>';
        }
        return '<span class="event-cta is-disabled">報名連結準備中</span>';
    }

    // ---------------------------------------------------------------
    // 渲染：行事曆
    // ---------------------------------------------------------------
    function renderCalendar() {
        var title = document.getElementById('cal-title');
        var grid = document.getElementById('cal-grid');
        if (!title || !grid) return;

        var year = state.calendarMonth.getFullYear();
        var month = state.calendarMonth.getMonth(); // 0–11

        title.textContent = year + ' 年 ' + (month + 1) + ' 月';

        var firstDay = new Date(year, month, 1);
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var startWeekday = firstDay.getDay(); // 0 = Sunday
        var totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

        var todayIso = isoOf(new Date());

        // 預先建立日期 → 活動 的索引（跨日活動會出現在範圍內每一天）
        var byDate = {};
        state.events.forEach(function (e) {
            if (!e.date) return;
            expandDateRange(e.date, e.endDate).forEach(function (d) {
                (byDate[d] = byDate[d] || []).push(e);
            });
        });

        var cells = [];
        for (var i = 0; i < totalCells; i++) {
            var dayNum = i - startWeekday + 1;
            if (dayNum < 1 || dayNum > daysInMonth) {
                cells.push('<div class="cal-cell is-empty"></div>');
                continue;
            }
            var iso = formatIso(year, month + 1, dayNum);
            var dayEvents = byDate[iso] || [];
            var chips = dayEvents.map(function (e) {
                return '<button type="button" class="cal-chip" data-event-id="' +
                    escapeAttr(e.id) + '" title="' + escapeAttr(e.title) + '">' +
                    escapeHtml(e.title) + '</button>';
            }).join('');
            var classes = 'cal-cell';
            if (iso === todayIso) classes += ' is-today';
            if (dayEvents.length) classes += ' has-events';
            cells.push(
                '<div class="' + classes + '">' +
                    '<span class="cal-day">' + dayNum + '</span>' +
                    (chips ? '<div class="cal-chips">' + chips + '</div>' : '') +
                '</div>'
            );
        }

        grid.innerHTML = cells.join('');

        // 綁定活動點擊
        grid.querySelectorAll('.cal-chip').forEach(function (chip) {
            chip.addEventListener('click', function () {
                var id = chip.dataset.eventId;
                var event = state.events.find(function (e) { return e.id === id; });
                if (event) openModal(event);
            });
        });
    }

    function formatIso(y, m, d) {
        var mm = m < 10 ? '0' + m : '' + m;
        var dd = d < 10 ? '0' + d : '' + d;
        return y + '-' + mm + '-' + dd;
    }

    function isoOf(date) {
        return formatIso(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    // 把 [startIso, endIso] 展開成日期陣列（含起訖）
    function expandDateRange(startIso, endIso) {
        if (!startIso) return [];
        if (!endIso || endIso === startIso) return [startIso];
        var start = new Date(startIso + 'T00:00:00');
        var end = new Date(endIso + 'T00:00:00');
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [startIso];
        var result = [];
        var d = new Date(start);
        while (d <= end) {
            result.push(isoOf(d));
            d.setDate(d.getDate() + 1);
        }
        return result;
    }

    // ---------------------------------------------------------------
    // 活動詳情 Modal
    // ---------------------------------------------------------------
    function openModal(event) {
        var modal = document.getElementById('event-modal');
        var body = document.getElementById('event-modal-body');
        if (!modal || !body) return;

        var dateStr = formatDateRange(event.date, event.endDate);
        var timeStr = event.startTime
            ? (event.endTime ? event.startTime + '–' + event.endTime : event.startTime)
            : '';
        var isPastEvent = isPast(event);

        var imageHtml = event.image
            ? '<div class="event-image"><img src="' + escapeAttr(event.image) +
                '" alt="' + escapeAttr(event.title) + ' 活動海報" loading="lazy"></div>'
            : '';

        body.innerHTML = '' +
            imageHtml +
            '<h3 class="event-title">' + escapeHtml(event.title) + '</h3>' +
            '<p class="event-meta">' +
                '<span class="event-date">' + escapeHtml(dateStr) + '</span>' +
                (timeStr ? '<span class="event-time">' + escapeHtml(timeStr) + '</span>' : '') +
                (event.location ? '<span class="event-location">' + escapeHtml(event.location) + '</span>' : '') +
            '</p>' +
            (event.audience ? '<p class="event-audience">對象：' + escapeHtml(event.audience) + '</p>' : '') +
            (event.description ? '<p class="event-desc">' + escapeHtml(event.description) + '</p>' : '') +
            renderCta(event, isPastEvent);

        if (typeof modal.showModal === 'function') {
            modal.showModal();
        } else {
            modal.setAttribute('open', '');
        }
    }

    function closeModal() {
        var modal = document.getElementById('event-modal');
        if (!modal) return;
        if (typeof modal.close === 'function' && modal.open) {
            modal.close();
        } else {
            modal.removeAttribute('open');
        }
    }

    // ---------------------------------------------------------------
    // 共用
    // ---------------------------------------------------------------
    function formatDate(iso) {
        if (!iso) return '';
        var parts = iso.split('-');
        if (parts.length !== 3) return iso;
        var d = new Date(iso + 'T00:00:00');
        if (isNaN(d.getTime())) return iso;
        var weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        return parts[0] + '年' + parseInt(parts[1], 10) + '月' + parseInt(parts[2], 10) + '日（' + weekdays[d.getDay()] + '）';
    }

    // 跨日活動顯示日期範圍；同年的話結束日省略年份
    function formatDateRange(startIso, endIso) {
        if (!startIso) return '';
        var startStr = formatDate(startIso);
        if (!endIso || endIso === startIso) return startStr;
        var startD = new Date(startIso + 'T00:00:00');
        var endD = new Date(endIso + 'T00:00:00');
        if (isNaN(endD.getTime())) return startStr;
        if (startD.getFullYear() === endD.getFullYear()) {
            var weekdays = ['日', '一', '二', '三', '四', '五', '六'];
            var p = endIso.split('-');
            var endShort = parseInt(p[1], 10) + '月' + parseInt(p[2], 10) + '日（' + weekdays[endD.getDay()] + '）';
            return startStr + ' – ' + endShort;
        }
        return startStr + ' – ' + formatDate(endIso);
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escapeAttr(s) {
        return escapeHtml(s).replace(/'/g, '&#39;');
    }

    // ---------------------------------------------------------------
    // 事件綁定
    // ---------------------------------------------------------------
    function bindUi() {
        document.querySelectorAll('.tab-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                state.currentTab = btn.dataset.tab;
                document.querySelectorAll('.tab-btn').forEach(function (b) {
                    b.classList.toggle('is-active', b === btn);
                });
                render();
            });
        });

        document.querySelectorAll('.filter-chip').forEach(function (btn) {
            btn.addEventListener('click', function () {
                state.currentFilter = btn.dataset.filter;
                document.querySelectorAll('.filter-chip').forEach(function (b) {
                    b.classList.toggle('is-active', b === btn);
                });
                render();
            });
        });

        var prev = document.getElementById('cal-prev');
        var next = document.getElementById('cal-next');
        if (prev) {
            prev.addEventListener('click', function () {
                state.calendarMonth = new Date(
                    state.calendarMonth.getFullYear(),
                    state.calendarMonth.getMonth() - 1, 1);
                renderCalendar();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                state.calendarMonth = new Date(
                    state.calendarMonth.getFullYear(),
                    state.calendarMonth.getMonth() + 1, 1);
                renderCalendar();
            });
        }

        var closeBtn = document.getElementById('event-modal-close');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        var modal = document.getElementById('event-modal');
        if (modal) {
            // 點背景關閉
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeModal();
            });
        }
    }

    // ---------------------------------------------------------------
    // 啟動
    // ---------------------------------------------------------------
    bindUi();
    loadEvents()
        .then(function (events) {
            state.events = events;
            render();
        })
        .catch(function (err) {
            console.error(err);
            var list = document.getElementById('events-list');
            if (list) {
                list.innerHTML = '<p class="events-empty">活動資訊載入失敗，請稍後再試。</p>';
            }
        });
})();
