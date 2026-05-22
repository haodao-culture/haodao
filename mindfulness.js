(function () {
    var storageKey = 'haodaoMindfulnessRecords';
    var SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbyU6R2UsV4H001HQX9PKvwCAKYoPIBSQOoX-GEsoWyFz_tK83ZNHxRcXSWNikdjbjKo/exec';
    var adminPassword = 'vx123';
    var records = {
        checkins: [],
        reflections: [],
        periods: [],
        members: []
    };
    var currentName = '';
    var currentPeriodId = 'all';
    var adminUnlocked = false;
    var remoteLoaded = false;

    function $(selector) {
        return document.querySelector(selector);
    }

    var el = {
        checkinForm: $('#checkin-form'),
        reflectionForm: $('#reflection-form'),
        searchForm: $('#practice-search-form'),
        periodFilter: $('#practice-period-filter'),
        exportPeriodFilter: $('#export-period-filter'),
        checkinMessage: $('#checkin-message'),
        reflectionMessage: $('#reflection-message'),
        searchMessage: $('#practice-search-message'),
        results: $('#practice-results'),
        count: $('#practice-count'),
        totalMinutes: $('#practice-total-minutes'),
        stateBody: $('#practice-state-body'),
        reflectionList: $('#practice-reflections'),
        exportButton: $('#export-reflections'),
        adminToggle: $('#admin-toggle'),
        adminPanel: $('#admin-panel'),
        periodForm: $('#period-form'),
        periodId: $('#period-id'),
        periodNumber: $('#period-number'),
        periodStart: $('#period-start'),
        periodEnd: $('#period-end'),
        periodReset: $('#period-reset'),
        periodMessage: $('#period-message'),
        periodList: $('#period-list'),
        memberForm: $('#member-form'),
        memberId: $('#member-id'),
        memberPeriod: $('#member-period'),
        memberName: $('#member-name'),
        memberNote: $('#member-note'),
        memberReset: $('#member-reset'),
        memberMessage: $('#member-message'),
        importPeriod: $('#import-period'),
        importFile: $('#member-import-file'),
        importMessage: $('#import-message'),
        memberList: $('#member-list'),
        passwordModal: $('#admin-password-modal'),
        passwordForm: $('#admin-password-form'),
        passwordInput: $('#admin-password-input'),
        passwordCancel: $('#admin-password-cancel'),
        passwordMessage: $('#admin-password-message'),
        appDialogModal: $('#app-dialog-modal'),
        appDialogMessage: $('#app-dialog-message'),
        appDialogConfirm: $('#app-dialog-confirm'),
        appDialogCancel: $('#app-dialog-cancel')
    };

    function loadRecords() {
        try {
            var saved = JSON.parse(localStorage.getItem(storageKey));
            records.checkins = Array.isArray(saved && saved.checkins) ? saved.checkins : [];
            records.reflections = Array.isArray(saved && saved.reflections) ? saved.reflections : [];
            records.periods = Array.isArray(saved && saved.periods) ? saved.periods : [];
            records.members = Array.isArray(saved && saved.members) ? saved.members : [];
            ensureRecordIds();
        } catch (error) {
            records.checkins = [];
            records.reflections = [];
            records.periods = [];
            records.members = [];
        }
    }

    function saveRecords() {
        localStorage.setItem(storageKey, JSON.stringify(records));
    }

    function useSheetApi() {
        return Boolean(SHEET_API_URL);
    }

    function normalizeRemoteRecords(data) {
        records.checkins = Array.isArray(data && data.checkins) ? data.checkins : [];
        records.reflections = Array.isArray(data && data.reflections) ? data.reflections : [];
        records.periods = Array.isArray(data && data.periods) ? data.periods : [];
        records.members = Array.isArray(data && data.members) ? data.members : [];
        ensureRecordIds();
    }

    function apiGet(action, params) {
        return new Promise(function (resolve, reject) {
            var callbackName = 'haodaoSheetCallback_' + Date.now() + '_' + Math.random().toString(36).slice(2);
            var query = new URLSearchParams(params || {});
            var script = document.createElement('script');

            query.set('action', action);
            query.set('callback', callbackName);

            window[callbackName] = function (data) {
                delete window[callbackName];
                script.remove();
                resolve(data);
            };

            script.onerror = function () {
                delete window[callbackName];
                script.remove();
                reject(new Error('Google Sheet 讀取失敗'));
            };

            script.src = SHEET_API_URL + '?' + query.toString();
            document.body.appendChild(script);
        });
    }

    function apiPost(action, payload) {
        if (!useSheetApi()) return Promise.resolve();

        return fetch(SHEET_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({
                action: action,
                payload: payload || {}
            })
        });
    }

    function syncRemoteRecords() {
        if (!useSheetApi()) return Promise.resolve();

        return apiGet('list').then(function (data) {
            normalizeRemoteRecords(data || {});
            remoteLoaded = true;
            renderPeriodOptions();
            if (currentName) renderResults(currentName);
            if (el.adminPanel && !el.adminPanel.hidden) renderAdmin();
        }).catch(function () {
            showMessage(el.searchMessage || el.periodMessage, 'Google Sheet 讀取失敗，暫時顯示本機資料。', 'error');
        });
    }

    function cleanChineseName(value) {
        var matches = String(value || '').match(/[\u4e00-\u9fff]/g);
        return matches ? matches.join('') : '';
    }

    function todayDate() {
        return currentTimestamp().slice(0, 10);
    }

    function currentTimestamp() {
        var now = new Date();
        var timezoneOffset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 19).replace('T', ' ');
    }

    function timeFromTimestamp(value) {
        return String(value || '').split(' ')[1] || '00:00:00';
    }

    function createId() {
        if (window.crypto && window.crypto.randomUUID) {
            return window.crypto.randomUUID();
        }

        return String(Date.now()) + '-' + Math.random().toString(36).slice(2);
    }

    function showMessage(node, text, type) {
        if (!node) return;
        node.textContent = text;
        node.className = 'form-note ' + (type || 'success');
    }

    function ensureRecordIds() {
        ['checkins', 'reflections', 'periods', 'members'].forEach(function (key) {
            records[key].forEach(function (item) {
                if (!item.id) item.id = createId();
            });
        });
        saveRecords();
    }

    function showAppDialog(message, options) {
        if (el.appDialogModal && el.appDialogMessage && el.appDialogConfirm && el.appDialogCancel) {
            return showStaticAppDialog(message, options);
        }

        var modal = document.createElement('div');
        var confirmText = options && options.confirmText ? options.confirmText : '確定';
        var cancelText = options && options.cancelText ? options.cancelText : '取消';
        var isConfirm = Boolean(options && options.confirm);

        modal.className = 'app-dialog-modal';
        modal.innerHTML =
            '<div class="app-dialog" role="dialog" aria-modal="true">' +
            '<p>' + escapeHtml(message) + '</p>' +
            '<div class="app-dialog-actions">' +
            (isConfirm ? '<button class="text-link-button" type="button" data-dialog-cancel>' + escapeHtml(cancelText) + '</button>' : '') +
            '<button class="password-submit-button" type="button" data-dialog-confirm>' + escapeHtml(confirmText) + '</button>' +
            '</div>' +
            '</div>';
        document.body.appendChild(modal);

        return new Promise(function (resolve) {
            modal.addEventListener('click', function (event) {
                if (event.target.hasAttribute('data-dialog-confirm')) {
                    modal.remove();
                    resolve(true);
                }
                if (event.target.hasAttribute('data-dialog-cancel') || event.target === modal) {
                    modal.remove();
                    resolve(false);
                }
            });
        });
    }

    function showStaticAppDialog(message, options) {
        var confirmText = options && options.confirmText ? options.confirmText : '確定';
        var cancelText = options && options.cancelText ? options.cancelText : '取消';
        var isConfirm = Boolean(options && options.confirm);

        el.appDialogMessage.textContent = message;
        el.appDialogConfirm.textContent = confirmText;
        el.appDialogCancel.textContent = cancelText;
        el.appDialogCancel.hidden = !isConfirm;
        el.appDialogModal.hidden = false;
        el.appDialogConfirm.focus();

        return new Promise(function (resolve) {
            function cleanup(result) {
                el.appDialogModal.hidden = true;
                el.appDialogConfirm.removeEventListener('click', confirmHandler);
                el.appDialogCancel.removeEventListener('click', cancelHandler);
                el.appDialogModal.removeEventListener('click', backdropHandler);
                resolve(result);
            }

            function confirmHandler() {
                cleanup(true);
            }

            function cancelHandler() {
                cleanup(false);
            }

            function backdropHandler(event) {
                if (event.target === el.appDialogModal) cleanup(false);
            }

            el.appDialogConfirm.addEventListener('click', confirmHandler);
            el.appDialogCancel.addEventListener('click', cancelHandler);
            el.appDialogModal.addEventListener('click', backdropHandler);
        });
    }

    function confirmRecordDeletion(callback) {
        showAppDialog('您即將刪除一個記錄，請確認是否刪除？', {
            confirm: true,
            confirmText: '確認刪除',
            cancelText: '取消'
        }).then(function (confirmed) {
            if (confirmed) callback();
        });
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function periodLabel(period) {
        return '第' + period.number + '期 ' + period.startDate + '～' + period.endDate;
    }

    function sortedPeriods() {
        return records.periods.slice().sort(function (a, b) {
            return Number(a.number) - Number(b.number) || a.startDate.localeCompare(b.startDate);
        });
    }

    function getPeriod(periodId) {
        return records.periods.find(function (period) {
            return period.id === periodId;
        });
    }

    function isWithinPeriod(item, periodId) {
        var period = getPeriod(periodId);
        if (!period) return true;
        return item.date >= period.startDate && item.date <= period.endDate;
    }

    function getNameRecords(name, periodId) {
        var cleanedName = cleanChineseName(name);
        var checkins = records.checkins.filter(function (item) {
            return item.name === cleanedName;
        });
        var reflections = records.reflections.filter(function (item) {
            return item.name === cleanedName;
        });

        if (periodId && periodId !== 'all') {
            checkins = checkins.filter(function (item) {
                return isWithinPeriod(item, periodId);
            });
            reflections = reflections.filter(function (item) {
                return isWithinPeriod(item, periodId);
            });
        }

        return {
            cleanedName: cleanedName,
            checkins: checkins,
            reflections: reflections
        };
    }

    function renderPeriodOptions() {
        var periods = sortedPeriods();
        var queryOptions = '<option value="all">總打卡記錄</option>';
        var exportOptions = '<option value="all">全部心得體悟</option>';
        var adminOptions = '<option value="">請先選擇期數</option>';

        periods.forEach(function (period) {
            var option = '<option value="' + escapeHtml(period.id) + '">' + escapeHtml(periodLabel(period)) + '</option>';
            queryOptions += option;
            exportOptions += option;
            adminOptions += option;
        });

        if (el.periodFilter) el.periodFilter.innerHTML = queryOptions;
        if (el.exportPeriodFilter) el.exportPeriodFilter.innerHTML = exportOptions;
        if (el.memberPeriod) el.memberPeriod.innerHTML = adminOptions;
        if (el.importPeriod) el.importPeriod.innerHTML = adminOptions;
    }

    function renderResults(name) {
        var userRecords;
        var checkins;
        var reflections;
        var totalMinutes;
        var periodText;

        if (!el.results || !el.count || !el.totalMinutes || !el.stateBody || !el.reflectionList) return;

        currentPeriodId = el.periodFilter ? el.periodFilter.value : 'all';
        userRecords = getNameRecords(name, currentPeriodId);
        checkins = userRecords.checkins;
        reflections = userRecords.reflections;
        totalMinutes = checkins.reduce(function (sum, item) {
            return sum + Number(item.minutes || 0);
        }, 0);
        currentName = userRecords.cleanedName;
        periodText = currentPeriodId === 'all' ? '總打卡記錄' : periodLabel(getPeriod(currentPeriodId));

        if (!currentName) {
            el.results.hidden = true;
            showMessage(el.searchMessage, '請輸入中文姓名後再查詢。', 'error');
            return;
        }

        el.count.textContent = String(checkins.length);
        el.totalMinutes.textContent = String(totalMinutes);

        el.stateBody.innerHTML = checkins.length
            ? checkins.slice().sort(function (a, b) {
                return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
            }).map(function (item) {
                return '<tr>' +
                    '<td>' + escapeHtml(item.date) + '</td>' +
                    '<td>' + escapeHtml(timeFromTimestamp(item.createdAt)) + '</td>' +
                    '<td>' + escapeHtml(item.minutes) + '</td>' +
                    '<td>' + escapeHtml(item.stateNote) + '</td>' +
                    '<td><button class="delete-record-button" type="button" aria-label="刪除打卡記錄" onclick="window.haodaoDeleteCheckin(&quot;' + escapeHtml(item.id) + '&quot;)">🗑</button></td>' +
                    '</tr>';
            }).join('')
            : '<tr><td colspan="5">此範圍尚無打卡記錄。</td></tr>';

        el.reflectionList.innerHTML = reflections.length
            ? reflections.slice().sort(function (a, b) {
                return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
            }).map(function (item) {
                var quote = item.documentQuote
                    ? '<p><strong>文檔應心語句：</strong>' + escapeHtml(item.documentQuote) + '</p>'
                    : '';

                return '<article class="reflection-item">' +
                    '<div class="reflection-item-header">' +
                    '<time datetime="' + escapeHtml(item.date) + '">' + escapeHtml(item.date) + '</time>' +
                    '<span>' + escapeHtml(timeFromTimestamp(item.createdAt)) + '</span>' +
                    '<button class="delete-record-button" type="button" aria-label="刪除心得記錄" onclick="window.haodaoDeleteReflection(&quot;' + escapeHtml(item.id) + '&quot;)">🗑</button>' +
                    '</div>' +
                    '<p><strong>實作心得：</strong>' + escapeHtml(item.reflection) + '</p>' + quote +
                    '</article>';
            }).join('')
            : '<p class="empty-record">此範圍尚無心得體悟記錄。</p>';

        el.results.hidden = false;
        showMessage(el.searchMessage, '已查詢「' + currentName + '」的「' + periodText + '」。');
    }

    function deleteCheckin(id) {
        records.checkins = records.checkins.filter(function (item) {
            return item.id !== id;
        });
        saveRecords();
        apiPost('deleteCheckin', { id: id }).then(syncRemoteRecords);
        if (currentName) renderResults(currentName);
    }

    function deleteReflection(id) {
        records.reflections = records.reflections.filter(function (item) {
            return item.id !== id;
        });
        saveRecords();
        apiPost('deleteReflection', { id: id }).then(syncRemoteRecords);
        if (currentName) renderResults(currentName);
    }

    window.haodaoDeleteCheckin = function (id) {
        confirmRecordDeletion(function () {
            deleteCheckin(id);
        });
    };

    window.haodaoDeleteReflection = function (id) {
        confirmRecordDeletion(function () {
            deleteReflection(id);
        });
    };

    function buildExcelTable(rows) {
        var body = rows.map(function (item) {
            return '<tr>' +
                '<td>' + escapeHtml(item.date) + '</td>' +
                '<td>' + escapeHtml(timeFromTimestamp(item.createdAt)) + '</td>' +
                '<td>' + escapeHtml(item.name) + '</td>' +
                '<td>' + escapeHtml(item.reflection) + '</td>' +
                '<td>' + escapeHtml(item.documentQuote || '') + '</td>' +
                '<td>' + escapeHtml(item.createdAt) + '</td>' +
                '</tr>';
        }).join('');

        return '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
            'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
            'xmlns="http://www.w3.org/TR/REC-html40">' +
            '<head><meta charset="utf-8"></head>' +
            '<body><table>' +
            '<tr><th>日期</th><th>時間</th><th>姓名</th><th>實作心得</th><th>文檔應心語句</th><th>建立時間</th></tr>' +
            body +
            '</table></body></html>';
    }

    function exportReflections() {
        var exportPeriodId = el.exportPeriodFilter ? el.exportPeriodFilter.value : 'all';
        var userRecords;
        var filtered;
        var blob;
        var url;
        var link;
        var periodText;

        if (!currentName) {
            showMessage(el.searchMessage, '請先查詢姓名，再匯出心得體悟。', 'error');
            return;
        }

        userRecords = getNameRecords(currentName, exportPeriodId);
        filtered = userRecords.reflections;
        periodText = exportPeriodId === 'all' ? '全部心得體悟' : periodLabel(getPeriod(exportPeriodId));

        if (!filtered.length) {
            showMessage(el.searchMessage, '此範圍沒有可匯出的心得體悟。', 'error');
            return;
        }

        blob = new Blob(['\ufeff', buildExcelTable(filtered)], {
            type: 'application/vnd.ms-excel;charset=utf-8'
        });
        url = URL.createObjectURL(blob);
        link = document.createElement('a');
        link.href = url;
        link.download = currentName + '_靜心修煉心得體悟_' + periodText.replace(/[\\/:*?"<>|]/g, '') + '.xls';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showMessage(el.searchMessage, 'Excel 檔已匯出。');
    }

    function resetPeriodForm() {
        if (!el.periodId || !el.periodNumber || !el.periodStart || !el.periodEnd) return;
        el.periodId.value = '';
        el.periodNumber.value = '';
        el.periodStart.value = '';
        el.periodEnd.value = '';
    }

    function resetMemberForm() {
        if (!el.memberId || !el.memberPeriod || !el.memberName || !el.memberNote) return;
        el.memberId.value = '';
        el.memberPeriod.value = '';
        el.memberName.value = '';
        el.memberNote.value = '';
    }

    function renderAdmin() {
        var periods = sortedPeriods();
        var memberRows = records.members.slice().sort(function (a, b) {
            var aPeriod = getPeriod(a.periodId);
            var bPeriod = getPeriod(b.periodId);
            var periodSort = Number(aPeriod && aPeriod.number || 0) - Number(bPeriod && bPeriod.number || 0);
            return periodSort || a.name.localeCompare(b.name, 'zh-Hant');
        });

        renderPeriodOptions();

        if (!el.periodList || !el.memberList) return;

        el.periodList.innerHTML = periods.length
            ? periods.map(function (period) {
                return '<article class="admin-row">' +
                    '<strong>' + escapeHtml(periodLabel(period)) + '</strong>' +
                    '<span>起迄日：' + escapeHtml(period.startDate) + ' ～ ' + escapeHtml(period.endDate) + '</span>' +
                    '<div class="admin-row-actions">' +
                    '<button type="button" data-edit-period="' + escapeHtml(period.id) + '">管理</button>' +
                    '<button type="button" data-delete-period="' + escapeHtml(period.id) + '">刪除</button>' +
                    '</div>' +
                    '</article>';
            }).join('')
            : '<p class="empty-record">尚未新增期數。</p>';

        el.memberList.innerHTML = memberRows.length
            ? memberRows.map(function (member) {
                var period = getPeriod(member.periodId);
                return '<article class="admin-row">' +
                    '<strong>' + escapeHtml(member.name) + '</strong>' +
                    '<span>' + escapeHtml(period ? periodLabel(period) : '未指定期數') + '</span>' +
                    (member.note ? '<p>' + escapeHtml(member.note) + '</p>' : '<p>尚無備註。</p>') +
                    '<div class="admin-row-actions">' +
                    '<button type="button" data-edit-member="' + escapeHtml(member.id) + '">管理</button>' +
                    '<button type="button" data-delete-member="' + escapeHtml(member.id) + '">刪除</button>' +
                    '</div>' +
                    '</article>';
            }).join('')
            : '<p class="empty-record">尚未新增報名名單。</p>';
    }

    function savePeriod(event) {
        var periodId;
        var number;
        var startDate;
        var endDate;
        var existing;
        var periodRecord;

        event.preventDefault();
        periodId = el.periodId.value;
        number = Number(el.periodNumber.value);
        startDate = el.periodStart.value;
        endDate = el.periodEnd.value;

        if (!Number.isInteger(number) || number <= 0 || !startDate || !endDate) {
            showMessage(el.periodMessage, '請完整填寫第幾期與起迄日。', 'error');
            return;
        }

        if (startDate > endDate) {
            showMessage(el.periodMessage, '起始日不可晚於結束日。', 'error');
            return;
        }

        existing = records.periods.find(function (period) {
            return period.id === periodId;
        });

        if (existing) {
            existing.number = number;
            existing.startDate = startDate;
            existing.endDate = endDate;
            existing.updatedAt = currentTimestamp();
            periodRecord = existing;
        } else {
            periodRecord = {
                id: createId(),
                number: number,
                startDate: startDate,
                endDate: endDate,
                createdAt: currentTimestamp()
            };
            records.periods.push(periodRecord);
        }

        saveRecords();
        apiPost('savePeriod', periodRecord).then(syncRemoteRecords);
        resetPeriodForm();
        renderAdmin();
        showMessage(el.periodMessage, '期數已儲存，前台下拉選項已更新。');
    }

    function saveMember(event) {
        var memberId;
        var periodId;
        var name;
        var note;
        var existing;
        var memberRecord;

        event.preventDefault();
        memberId = el.memberId.value;
        periodId = el.memberPeriod.value;
        name = cleanChineseName(el.memberName.value);
        note = el.memberNote.value.trim();

        if (!periodId || !name) {
            showMessage(el.memberMessage, '請選擇期數並填寫中文姓名。', 'error');
            return;
        }

        existing = records.members.find(function (member) {
            return member.id === memberId;
        });

        if (existing) {
            existing.periodId = periodId;
            existing.name = name;
            existing.note = note;
            existing.updatedAt = currentTimestamp();
            memberRecord = existing;
        } else {
            memberRecord = {
                id: createId(),
                periodId: periodId,
                name: name,
                note: note,
                createdAt: currentTimestamp()
            };
            records.members.push(memberRecord);
        }

        saveRecords();
        apiPost('saveMember', memberRecord).then(syncRemoteRecords);
        resetMemberForm();
        renderAdmin();
        showMessage(el.memberMessage, '名單已儲存。');
    }

    function handleAdminClick(event) {
        var periodId = event.target.getAttribute('data-edit-period');
        var deletePeriodId = event.target.getAttribute('data-delete-period');
        var memberId = event.target.getAttribute('data-edit-member');
        var deleteMemberId = event.target.getAttribute('data-delete-member');
        var period;
        var member;

        if (periodId) {
            period = getPeriod(periodId);
            if (!period) return;
            el.periodId.value = period.id;
            el.periodNumber.value = period.number;
            el.periodStart.value = period.startDate;
            el.periodEnd.value = period.endDate;
            showMessage(el.periodMessage, '正在管理「' + periodLabel(period) + '」。');
        }

        if (deletePeriodId) {
            period = getPeriod(deletePeriodId);
            if (!period || !window.confirm('確定刪除「' + periodLabel(period) + '」？此期名單也會一起刪除。')) return;
            records.periods = records.periods.filter(function (item) {
                return item.id !== deletePeriodId;
            });
            records.members = records.members.filter(function (item) {
                return item.periodId !== deletePeriodId;
            });
            saveRecords();
            apiPost('deletePeriod', { id: deletePeriodId }).then(syncRemoteRecords);
            renderAdmin();
            showMessage(el.periodMessage, '期數已刪除。');
        }

        if (memberId) {
            member = records.members.find(function (item) {
                return item.id === memberId;
            });
            if (!member) return;
            el.memberId.value = member.id;
            el.memberPeriod.value = member.periodId;
            el.memberName.value = member.name;
            el.memberNote.value = member.note || '';
            showMessage(el.memberMessage, '正在管理「' + member.name + '」。');
        }

        if (deleteMemberId) {
            member = records.members.find(function (item) {
                return item.id === deleteMemberId;
            });
            if (!member || !window.confirm('確定刪除「' + member.name + '」？')) return;
            records.members = records.members.filter(function (item) {
                return item.id !== deleteMemberId;
            });
            saveRecords();
            apiPost('deleteMember', { id: deleteMemberId }).then(syncRemoteRecords);
            renderAdmin();
            showMessage(el.memberMessage, '名單已刪除。');
        }
    }

    function parseDelimitedText(text) {
        return text.trim().split(/\r?\n/).map(function (line) {
            return line.split(/\t|,/);
        });
    }

    function rowsToMembers(rows, periodId) {
        var header = rows[0] || [];
        var hasHeader = header.some(function (cell) {
            return String(cell).indexOf('姓名') !== -1 || String(cell).indexOf('備註') !== -1;
        });
        var nameIndex = hasHeader ? header.findIndex(function (cell) {
            return String(cell).indexOf('姓名') !== -1;
        }) : 0;
        var noteIndex = hasHeader ? header.findIndex(function (cell) {
            return String(cell).indexOf('備註') !== -1 || String(cell).indexOf('狀態') !== -1;
        }) : 1;
        var dataRows = hasHeader ? rows.slice(1) : rows;
        var count = 0;

        if (nameIndex < 0) nameIndex = 0;

        dataRows.forEach(function (row) {
            var name = cleanChineseName(row[nameIndex]);
            var note = noteIndex >= 0 ? String(row[noteIndex] || '').trim() : '';
            var existing;

            if (!name) return;
            existing = records.members.find(function (member) {
                return member.periodId === periodId && member.name === name;
            });

            if (existing) {
                existing.note = note || existing.note || '';
                existing.updatedAt = currentTimestamp();
            } else {
                records.members.push({
                    id: createId(),
                    periodId: periodId,
                    name: name,
                    note: note,
                    createdAt: currentTimestamp()
                });
            }
            count += 1;
        });

        return count;
    }

    function importMembers(file) {
        var periodId = el.importPeriod.value;
        var reader;

        if (!periodId) {
            showMessage(el.importMessage, '請先選擇要匯入的期數。', 'error');
            el.importFile.value = '';
            return;
        }

        if (!file) return;

        reader = new FileReader();
        reader.onload = function (event) {
            var rows;
            var count;
            var fileName = file.name.toLowerCase();
            var workbook;
            var firstSheetName;

            if (fileName.endsWith('.csv') || fileName.endsWith('.tsv')) {
                rows = parseDelimitedText(String(event.target.result || ''));
            } else {
                if (!window.XLSX) {
                    showMessage(el.importMessage, 'Excel 匯入套件尚未載入，請確認網路後再試。', 'error');
                    return;
                }
                workbook = window.XLSX.read(event.target.result, { type: 'array' });
                firstSheetName = workbook.SheetNames[0];
                rows = window.XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { header: 1 });
            }

            count = rowsToMembers(rows, periodId);
            saveRecords();
            renderAdmin();
            el.importFile.value = '';
            showMessage(el.importMessage, '已匯入 ' + count + ' 筆名單。');
        };

        if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.tsv')) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    }

    function openPasswordModal() {
        if (!el.passwordModal) return;
        el.passwordModal.hidden = false;
        if (el.passwordInput) {
            el.passwordInput.value = '';
            window.setTimeout(function () {
                el.passwordInput.focus();
            }, 0);
        }
        showMessage(el.passwordMessage, '');
    }

    function closePasswordModal() {
        if (!el.passwordModal) return;
        el.passwordModal.hidden = true;
        showMessage(el.passwordMessage, '');
    }

    function openAdminPanel() {
        adminUnlocked = true;
        closePasswordModal();
        if (!el.adminPanel) return;
        el.adminPanel.hidden = false;
        if (el.adminToggle) el.adminToggle.textContent = '關閉修煉組管理後台';
        renderAdmin();
    }

    if (el.checkinForm) el.checkinForm.addEventListener('submit', function (event) {
        var name;
        var minutes;
        var statePreset;
        var stateCustom;
        var stateNote;
        var checkinRecord;

        event.preventDefault();
        name = cleanChineseName($('#checkin-name').value);
        minutes = Number($('#checkin-minutes').value);
        statePreset = $('#checkin-state-preset').value.trim();
        stateCustom = $('#checkin-state-custom').value.trim();
        stateNote = stateCustom || statePreset;

        if (!name) {
            showMessage(el.checkinMessage, '姓名請填寫中文全名。', 'error');
            return;
        }

        if (!Number.isInteger(minutes) || minutes <= 0) {
            showMessage(el.checkinMessage, '靜心分鐘數請填寫大於 0 的整數。', 'error');
            return;
        }

        if (!stateNote) {
            showMessage(el.checkinMessage, '請選擇或填寫今日靜心狀態。', 'error');
            return;
        }

        checkinRecord = {
            id: createId(),
            name: name,
            minutes: minutes,
            stateNote: stateNote,
            date: todayDate(),
            createdAt: currentTimestamp()
        };
        records.checkins.push(checkinRecord);
        saveRecords();
        apiPost('saveCheckin', checkinRecord).then(syncRemoteRecords);
        el.checkinForm.reset();
        showMessage(el.checkinMessage, '已完成「' + name + '」今日靜心打卡。');
        showAppDialog('已收到您的打卡');

        if (currentName === name) {
            renderResults(name);
        }
    });

    if (el.reflectionForm) el.reflectionForm.addEventListener('submit', function (event) {
        var name;
        var reflection;
        var documentQuote;
        var reflectionRecord;

        event.preventDefault();
        name = cleanChineseName($('#reflection-name').value);
        reflection = $('#reflection-text').value.trim();
        documentQuote = $('#reflection-quote').value.trim();

        if (!name) {
            showMessage(el.reflectionMessage, '姓名請填寫中文全名。', 'error');
            return;
        }

        if (!reflection) {
            showMessage(el.reflectionMessage, '請填寫實作心得。', 'error');
            return;
        }

        reflectionRecord = {
            id: createId(),
            name: name,
            reflection: reflection,
            documentQuote: documentQuote,
            date: todayDate(),
            createdAt: currentTimestamp()
        };
        records.reflections.push(reflectionRecord);
        saveRecords();
        apiPost('saveReflection', reflectionRecord).then(syncRemoteRecords);
        el.reflectionForm.reset();
        showMessage(el.reflectionMessage, '已完成「' + name + '」心得分享。');
        showAppDialog('已收到您的心得');

        if (currentName === name) {
            renderResults(name);
        }
    });

    if (el.searchForm) el.searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        renderResults($('#practice-search-name').value);
    });

    if (el.exportButton) el.exportButton.addEventListener('click', exportReflections);

    if (el.stateBody) {
        el.stateBody.addEventListener('click', function (event) {
            var id = event.target.getAttribute('data-delete-checkin');
            if (id) {
                window.haodaoDeleteCheckin(id);
            }
        });
    }

    if (el.reflectionList) {
        el.reflectionList.addEventListener('click', function (event) {
            var id = event.target.getAttribute('data-delete-reflection');
            if (id) {
                window.haodaoDeleteReflection(id);
            }
        });
    }

    if (el.periodFilter) {
        el.periodFilter.addEventListener('change', function () {
            if (currentName) renderResults(currentName);
        });
    }

    if (el.adminToggle && el.adminPanel) {
        el.adminToggle.addEventListener('click', function () {
            if (!adminUnlocked) {
                openPasswordModal();
                return;
            }

            el.adminPanel.hidden = !el.adminPanel.hidden;
            el.adminToggle.textContent = el.adminPanel.hidden ? '修煉組管理後台' : '關閉修煉組管理後台';
            if (!el.adminPanel.hidden) renderAdmin();
        });
    }

    if (el.passwordForm) {
        el.passwordForm.addEventListener('submit', function (event) {
            event.preventDefault();

            if (el.passwordInput.value === adminPassword) {
                openAdminPanel();
                return;
            }

            showMessage(el.passwordMessage, '密碼不正確，請重新輸入。', 'error');
            el.passwordInput.select();
        });
    }

    if (el.passwordCancel) {
        el.passwordCancel.addEventListener('click', closePasswordModal);
    }

    if (el.passwordModal) {
        el.passwordModal.addEventListener('click', function (event) {
            if (event.target !== el.passwordModal) return;
            if (el.adminToggle) {
                closePasswordModal();
                return;
            }
            if (el.passwordInput) el.passwordInput.focus();
        });
    }

    if (el.periodForm) el.periodForm.addEventListener('submit', savePeriod);
    if (el.memberForm) el.memberForm.addEventListener('submit', saveMember);
    if (el.periodReset) el.periodReset.addEventListener('click', resetPeriodForm);
    if (el.memberReset) el.memberReset.addEventListener('click', resetMemberForm);
    if (el.periodList) el.periodList.addEventListener('click', handleAdminClick);
    if (el.memberList) el.memberList.addEventListener('click', handleAdminClick);
    if (el.importFile) {
        el.importFile.addEventListener('change', function () {
            importMembers(el.importFile.files[0]);
        });
    }

    loadRecords();
    renderPeriodOptions();
    syncRemoteRecords();
    if (el.adminPanel && !el.passwordModal) renderAdmin();
})();
