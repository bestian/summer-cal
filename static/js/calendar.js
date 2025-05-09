(function() {
  'use strict';

  const calendarEl = document.getElementById('calendar');
  const monthLabel = document.getElementById('monthLabel');
  const prevMonthButton = document.getElementById('prev-month-button');
  const nextMonthButton = document.getElementById('next-month-button');

  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth(); // 0-based
  let events = [];

  const SOURCE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-ZZ5igNAgYF2aDKkvNqmY1ia5yv2RMDymvD3qvAJzzVPU5oVoFepzDHva8y6BJWPlkrbrJNKmPlK8/pub?gid=1419688078&single=true&output=csv';
  const FIELDS = ['title', 'start', 'end', 'intro', 'url', 'seq', 'categories', 'ageStart', 'ageEnd', 'source', 'color1', 'color2'];

  prevMonthButton.onclick = (e) => { changeMonth(-1) };
  nextMonthButton.onclick = (e) => { changeMonth(1) };

  function renderCalendar() {
    calendarEl.innerHTML = '';
    const daysOfWeek = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
    daysOfWeek.forEach(day => {
      const header = document.createElement('div');
      header.textContent = day;
      header.className = 'header';
      calendarEl.appendChild(header);
    });

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    monthLabel.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${currentYear}`;

    const prePad = (startDay === 0) ? 6 : startDay - 1;
    for (let i = 0; i < prePad; i++) {
      calendarEl.appendChild(document.createElement('div'));
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const cellDate = new Date(currentYear, currentMonth, d);
      //console.log(dateStr, cellDate);
      const cell = document.createElement('div');
      cell.className = 'day';
      cell.innerHTML = `<strong>${d}</strong>`;

      events.forEach(event => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        if (cellDate >= start && cellDate <= end) {
          const ev = document.createElement('div');
          ev.className = 'event';
          ev.textContent = event.title;
          if (event.color1 && event.color2) {
            ev.style.background = `#${event.color2}`;
            ev.style.borderLeftColor = `#${event.color1}`;
          }
          cell.appendChild(ev);
        }
      });

      calendarEl.appendChild(cell);
      }
  }

  function changeMonth(offset) {
    currentMonth += offset;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    } else if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  }

  function parseCSV(text) {
    const lines = text.trim().split('\n');
    const [headerLine, ...rows] = lines;
    const headers = headerLine.split(',').map(h => h.trim());
    return rows.map(row => {
      const values = row.split(',').map(v => v.trim());
      let data = {};
      values.forEach( (x, i) => {
        data[FIELDS[i]] = x;
      });
      return data;
    });
  }

  fetch(SOURCE_URL)
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.text(); // CSV is plain text
    })
    .then(csvText => {
      events = parseCSV(csvText);
      renderCalendar();
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });

})();
