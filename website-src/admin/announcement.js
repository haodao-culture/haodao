/* Local announcement parsing; pasted content never leaves the browser until the event is saved. */
window.HaodaoAnnouncement = (() => {
  const names = {
    title: '活動名稱',
    start_date: '開始日期',
    end_date: '結束日期',
    start_time: '開始時間',
    end_time: '結束時間',
    mode: '活動形式',
    region: '所在地區',
    location: '地點',
    registration_url: '報名連結',
    description: '活動介紹',
  };
  const clean = line => line.trim().replace(/^[^\p{L}\p{N}【「]+/u, '');
  const validDate = (year, month, day) => {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return year >= 1912 &&
      year <= 2199 &&
      !Number.isNaN(Date.parse(date)) &&
      new Date(date).toISOString().slice(0, 10) === date
      ? date
      : '';
  };
  const deadline = line => /截止|報名日期|報名時間|報名期間|報名至|早鳥|繳費|匯款/.test(line);
  function parse(input, referenceDate, kind = 'courses') {
    const original = String(input).trim(),
      warnings = [],
      fields = {};
    if (!original) return { fields, warnings: ['請先貼上文字公告。'] };
    if (original.length > 15000)
      return { fields, warnings: ['公告最多 15,000 字，請先縮短內容。'] };
    fields.description = original;
    const lines = original.normalize('NFKC').split(/\r?\n/).map(clean).filter(Boolean);
    const label = patterns => {
      for (const line of lines) {
        const match = line.match(new RegExp(`^(?:${patterns})\\s*[:：]\\s*(.+)$`));
        if (match) return match[1].trim();
      }
      return '';
    };
    const named = label('活動名稱|課程名稱|主題|活動主題|課程主題|名稱');
    const first = lines.find(
      line => !/^(?:活動公告|課程公告|共學公告|公告|報名資訊|歡迎報名)[!！。\s]*$/.test(line),
    );
    const title =
      named ||
      (first &&
      first.length <= 120 &&
      !/^(?:活動)?(?:日期|時間|地點|地址|報名|聯絡|費用|對象|區域|形式)\s*[:：]/.test(first) &&
      !/^\d|^https?:/.test(first)
        ? first.replace(/^[【「](.+)[】」]$/, '$1')
        : '');
    if (title && title.length <= 120) fields.title = title;
    else warnings.push('未辨識活動名稱，請自行填寫。');
    const location = label('活動地點|上課地點|集合地點|共學地點|地點|地址|線上參與方式');
    if (location && location.length <= 300) fields.location = location;
    else warnings.push('未辨識地點，請自行確認。');
    const region = label('所在地區|地區|區域|共學區域') || title;
    const regions = [...new Set((region || '').match(/北區|中區|嘉南區|高屏區/g) || [])];
    if (kind === 'community' && regions.length === 1) fields.region = regions[0];
    if (kind === 'community' && !fields.region) warnings.push('請確認所在地區。');
    const mode = label('活動形式|課程形式|形式|上課方式');
    if (/^(線上|線下|實體)/.test(mode)) fields.mode = /^線上/.test(mode) ? '線上' : '線下';
    else if (/線上/.test(title + location) && !/實體|線下/.test(title + location))
      fields.mode = '線上';
    else if (/線下|實體/.test(title + location) && !/線上/.test(title + location))
      fields.mode = '線下';
    const candidates = lines.filter(line => !deadline(line));
    const dated = candidates.filter(line =>
      /^(?:活動|上課|課程|共學|開始|結束)?(?:日期|時間)\s*[:：]/.test(line),
    );
    const dateText = (dated.length ? dated : candidates).join('\n').replace(/https?:\/\/\S+/g, '');
    const datePattern =
      /(?<!\d)(?<!\d:)(?:(民國)?(\d{3,4})\s*[年/.-]\s*)?(\d{1,2})\s*[月/.-]\s*(\d{1,2})(?:日|號)?(?![\d:])/g;
    const dates = [...dateText.matchAll(datePattern)];
    const yearNow = Number(String(referenceDate).slice(0, 4));
    const defaultYear = yearNow >= 1912 && yearNow <= 2199 ? yearNow : new Date().getFullYear();
    if (dates.length === 1) {
      const end = dateText
        .slice(dates[0].index + dates[0][0].length)
        .match(/^(?:\s*[（(][^）)]{1,5}[）)])?\s*[-~～至到—–]\s*(\d{1,2})(?:日|號)?(?!\d|[:：])/);
      if (end)
        dates.push(
          Object.assign(['', undefined, undefined, dates[0][3], end[1]], {
            index: dates[0].index + dates[0][0].length,
          }),
        );
    }
    let resolvedDates = [];
    if (
      dates.length > 2 ||
      (dates.length === 2 &&
        /[、,，]/.test(dateText.slice(dates[0].index + dates[0][0].length, dates[1].index)))
    ) {
      warnings.push('公告有多個場次，請選擇本次活動的開始與結束日期。');
    } else if (dates.length) {
      let inheritedYear = defaultYear,
        assumedYear = false,
        previousMonth = 0;
      resolvedDates = dates.map(match => {
        let year = match[2] ? Number(match[2]) : inheritedYear;
        if (match[1] || (match[2] && year >= 100 && year < 300)) year += 1911;
        if (match[2] && year < 1912) return '';
        if (!match[2] && !previousMonth) assumedYear = true;
        const month = Number(match[3]);
        if (!match[2] && previousMonth === 12 && month === 1) year++;
        inheritedYear = year;
        previousMonth = month;
        return validDate(year, month, Number(match[4]));
      });
      if (
        resolvedDates.every(Boolean) &&
        (resolvedDates.length === 1 || resolvedDates[1] >= resolvedDates[0])
      ) {
        fields.start_date = resolvedDates[0];
        fields.end_date = resolvedDates.at(-1);
        if (assumedYear) warnings.push(`公告未寫年份，暫以 ${defaultYear} 年帶入，請確認。`);
      } else {
        resolvedDates = [];
        warnings.push('公告日期無效或順序不明，請自行填寫日期。');
      }
    } else warnings.push('未辨識活動日期，請自行填寫，勿直接沿用表單預設日期。');
    const timeLines = candidates.filter(line =>
      /時間|上午|下午|晚上|早上|中午|凌晨|\d\s*[:：]\s*\d{2}|\d\s*[點時]/.test(line),
    );
    const timeText = timeLines
      .join('\n')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/^(?:.*?時間)\s*[:：]/gm, '');
    const times = [
      ...timeText.matchAll(
        /(上午|下午|晚上|早上|中午|凌晨|AM|PM)?\s*(\d{1,2})\s*(?:[:：]\s*(\d{2})|[點時](?:\s*(半|\d{1,2})\s*分?)?)/gi,
      ),
    ];
    if (times.length > 2) warnings.push('公告有多組時間，請選擇本次活動的開始與結束時間。');
    else if (times.length) {
      let period = '';
      const values = times.map(match => {
        period = match[1]?.toLowerCase() || period;
        let hour = Number(match[2]),
          minute = match[3] ? Number(match[3]) : match[4] === '半' ? 30 : Number(match[4] || 0);
        if (hour > 23 || minute > 59 || (period && hour > 12)) return '';
        if (['下午', '晚上', 'pm'].includes(period) && hour < 12) hour += 12;
        if (period === '中午' && hour < 11) hour += 12;
        if (['上午', '早上', '凌晨', 'am'].includes(period) && hour === 12) hour = 0;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      });
      if (
        values.every(Boolean) &&
        !(values.length === 2 && values[1] < values[0] && fields.start_date === fields.end_date)
      ) {
        fields.start_time = values[0];
        if (values[1]) fields.end_time = values[1];
      } else warnings.push('公告時間無效或順序不明，請自行確認。');
    }
    if (!fields.start_time || !fields.end_time)
      warnings.push('未完整辨識開始與結束時間，請自行確認。');
    if (kind === 'courses') {
      const registrationLines = lines.filter(
        (line, index) =>
          /報名(?:連結|網址|方式)?\s*[:：]?|forms\.gle|docs\.google\.com\/forms/.test(line) ||
          (/^https:\/\//.test(line) &&
            /報名(?:連結|網址|方式)?\s*[:：]?$/.test(lines[index - 1] || '')),
      );
      const urls = [
        ...new Set(
          registrationLines
            .flatMap(line => line.match(/https:\/\/[^\s<>「」【】]+/g) || [])
            .map(url => url.replace(/[。。，,；;！!）)]+$/, '')),
        ),
      ].filter(url => {
        try {
          const u = new URL(url);
          return !u.username && !u.password && !/zoom\.us|meet\.google\.com/.test(u.hostname);
        } catch {
          return false;
        }
      });
      if (urls.length === 1) fields.registration_url = urls[0];
      else if (urls.length > 1) warnings.push('公告有多個報名連結，請自行選擇。');
    }
    return { fields, warnings };
  }
  return { parse, names };
})();
