
interface MonthName {
  full: string[];
  mmm: string[];
}

interface DayName {
  full: string[];
  d: string[];
  dd: string[];
  ddd: string[];
}

interface CalendarData {
  year: number;
  month: number;
  date: number;
  today: {
    dayIndex: number;
    dayName: string;
    dayFullName: string;
    monthIndex: number;
    monthName: string;
    monthNameFull: string;
    date: number;
    year: string;
  };
  firstDayIndex: number;
  firstDayName: string;
  firstDayFullName: string;
  monthIndex: number;
  monthName: string;
  monthNameFull: string;
  totaldays: number;
  targetedDayIndex: number;
  targetedDayName: string;
  targetedDayFullName: string;
}

interface CalendarOption {
  target: string;
  type?: "day" | "month";
  month?: number;
  year?: number;
  date?: number;
  monthformat?: "full" | "mmm";
  dayformat?: "full" | "ddd";
  highlighttoday?: boolean;
  highlighttargetdate?: boolean;
  prevnextbutton?: "show" | "hide";
}

interface Dycalendar {
  draw(option: CalendarOption): void;
}

(function (global: Window) {
  "use strict";

  const dycalendar: Dycalendar = {};

  const document: Document = global.document;

  const START_YEAR: number = 1900;

  const END_YEAR: number = 9999;

  const monthName: MonthName = {
    full: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    mmm: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  };

  const dayName: DayName = {
    full: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    d: ["S", "M", "T", "W", "T", "F", "S"],
    dd: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    ddd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  };

  function createMonthTable(data: CalendarData, option: CalendarOption): HTMLTableElement {
    let table: HTMLTableElement,
      tr: HTMLTableRowElement,
      td: HTMLTableDataCellElement,
      r: number,
      c: number,
      count: number;

    table = document.createElement("table");
    tr = document.createElement("tr");

    for (c = 0; c <= 6; c = c + 1) {
      td = document.createElement("td");
      td.innerHTML = "SMTWTFS"[c];
      tr.appendChild(td);
    }
    table.appendChild(tr);

    tr = document.createElement("tr");

    for (c = 0; c <= 6; c = c + 1) {
      if (c === data.firstDayIndex) {
        break;
      }
      td = document.createElement("td");
      tr.appendChild(td);
    }

    count = 1;
    while (c <= 6) {
      td = document.createElement("td");
      td.innerHTML = count.toString();
      if (
        data.today.date === count &&
        data.today.monthIndex === data.monthIndex &&
        option.highlighttoday === true
      ) {
        td.setAttribute("class", "dycalendar-today-date");
      }
      if (
        option.date === count &&
        option.month === data.monthIndex &&
        option.highlighttargetdate === true
      ) {
        td.setAttribute("class", "dycalendar-target-date");
      }
      tr.appendChild(td);
      count = count + 1;
      c = c + 1;
    }
    table.appendChild(tr);

    for (r = 3; r <= 7; r = r + 1) {
      tr = document.createElement("tr");
      for (c = 0; c <= 6; c = c + 1) {
        if (count > data.totaldays) {
          table.appendChild(tr);
          return table;
        }
        td = document.createElement("td");
        td.innerHTML = count.toString();
        if (
          data.today.date === count &&
          data.today.monthIndex === data.monthIndex &&
          option.highlighttoday === true
        ) {
          td.setAttribute("class", "dycalendar-today-date");
        }
        if (
          option.date === count &&
          option.month === data.monthIndex &&
          option.highlighttargetdate === true
        ) {
          td.setAttribute("class", "dycalendar-target-date");
        }
        count = count + 1;
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    return table;
  }

  function drawCalendarMonthTable(data: CalendarData, option: CalendarOption): HTMLDivElement {
    let table: HTMLTableElement,
      div: HTMLDivElement,
      container: HTMLDivElement,
      elem: HTMLSpanElement;

    table = createMonthTable(data, option);

    container = document.createElement("div");
    container.setAttribute("class", "dycalendar-month-container");

    div = document.createElement("div");
    div.setAttribute("class", "dycalendar-header");
    div.setAttribute("data-option", JSON.stringify(option));

    if (option.prevnextbutton === "show") {
      elem = document.createElement("span");
      elem.setAttribute("class", "dycalendar-prev-next-btn prev-btn");
      elem.setAttribute("data-date", option.date.toString());
      elem.setAttribute("data-month", option.month.toString());
      elem.setAttribute("data-year", option.year.toString());
      elem.setAttribute("data-btn", "prev");
      elem.innerHTML = "&lt;";
      div.appendChild(elem);
    }

    elem = document.createElement("span");
    elem.setAttribute("class", "dycalendar-span-month-year");
    if (option.monthformat === "mmm") {
      elem.innerHTML = `${data.monthName} ${data.year}`;
    } else if (option.monthformat === "full") {
      elem.innerHTML = `${data.monthNameFull} ${data.year}`;
    }

    div.appendChild(elem);

    if (option.prevnextbutton === "show") {
      elem = document.createElement("span");
      elem.setAttribute("class", "dycalendar-prev-next-btn next-btn");
      elem.setAttribute("data-date", option.date.toString());
      elem.setAttribute("data-month", option.month.toString());
      elem.setAttribute("data-year", option.year.toString());
      elem.setAttribute("data-btn", "next");
      elem.innerHTML = "&gt;";
      div.appendChild(elem);
    }

    container.appendChild(div);

    div = document.createElement("div");
    div.setAttribute("class", "dycalendar-body");
    div.appendChild(table);

    container.appendChild(div);

    return container;
  }

  function drawCalendarDay(data: CalendarData, option: CalendarOption): HTMLDivElement {
    let div: HTMLDivElement,
      container: HTMLDivElement,
      elem: HTMLSpanElement;

    container = document.createElement("div");
    container.setAttribute("class", "dycalendar-day-container");

    div = document.createElement("div");
    div.setAttribute("class", "dycalendar-header");

    elem = document.createElement("span");
    elem.setAttribute("class", "dycalendar-span-day");
    if (option.dayformat === "ddd") {
      elem.innerHTML = dayName.ddd[data.targetedDayIndex];
    } else if (option.dayformat === "full") {
      elem.innerHTML = dayName.full[data.targetedDayIndex];
    }

    div.appendChild(elem);

    container.appendChild(div);

    div = document.createElement("div");
    div.setAttribute("class", "dycalendar-body");

    elem = document.createElement("span");
    elem.setAttribute("class", "dycalendar-span-date");
    elem.innerHTML = data.date.toString();

    div.appendChild(elem);

    container.appendChild(div);

    div = document.createElement("div");
    div.setAttribute("class", "dycalendar-footer");

    elem = document.createElement("span");
    elem.setAttribute("class", "dycalendar-span-month-year");
    if (option.monthformat === "mmm") {
      elem.innerHTML = `${data.monthName} ${data.year}`;
    } else if (option.monthformat === "full") {
      elem.innerHTML = `${data.monthNameFull} ${data.year}`;
    }

    div.appendChild(elem);

    container.appendChild(div);

    return container;
  }

  function extendSource(source: any, defaults: any): any {
    for (let property in defaults) {
      if (!source.hasOwnProperty(property)) {
        source[property] = defaults[property];
      }
    }
    return source;
  }

  function getCalendar(year?: number, month?: number, date?: number): CalendarData | boolean {
    const dateObj = new Date();
    const dateString = dateObj.toString().split(" ");
    const result: CalendarData = {} as CalendarData;
    let idx: number;

    if (year && (year < START_YEAR || year > END_YEAR)) {
      global.console.error("Invalid Year");
      return false;
    }
    if (month && (month > 11 || month < 0)) {
      global.console.error("Invalid Month");
      return false;
    }
    if (date && (date > 31 || date < 1)) {
      global.console.error("Invalid Date");
      return false;
    }

    result.year = year || dateObj.getFullYear();
    result.month = month || dateObj.getMonth();
    result.date = date || dateObj.getDate();

    result.today = {} as any;
    idx = dayName.ddd.indexOf(dateString[0]);
    result.today.dayIndex = idx;
    result.today.dayName = dateString[0];
    result.today.dayFullName = dayName.full[idx];

    idx = monthName.mmm.indexOf(dateString[1]);
    result.today.monthIndex = idx;
    result.today.monthName = dateString[1];
    result.today.monthNameFull = monthName.full[idx];

    result.today.date = dateObj.getDate();

    result.today.year = dateString[3];

    dateObj.setDate(1);
    dateObj.setMonth(result.month);
    dateObj.setFullYear(result.year);
    dateString = dateObj.toString().split(" ");

    idx = dayName.ddd.indexOf(dateString[0]);
    result.firstDayIndex = idx;
    result.firstDayName = dateString[0];
    result.firstDayFullName = dayName.full[idx];

    idx = monthName.mmm.indexOf(dateString[1]);
    result.monthIndex = idx;
    result.monthName = dateString[1];
    result.monthNameFull = monthName.full[idx];

    dateObj.setFullYear(result.year);
    dateObj.setMonth(result.month + 1);
    dateObj.setDate(0);
    result.totaldays = dateObj.getDate();

    dateObj.setFullYear(result.year);
    dateObj.setMonth(result.month);
    dateObj.setDate(result.date);
    dateString = dateObj.toString().split(" ");

    idx = dayName.ddd.indexOf(dateString[0]);
    result.targetedDayIndex = idx;
    result.targetedDayName = dateString[0];
    result.targetedDayFullName = dayName.full[idx];

    return result;
  }

  function onClick(): void {
    document.body.onclick = function (e: MouseEvent): void {
      e = global.event || e;

      const targetDomObject = e.target || e.srcElement;
      let date: number,
        month: number,
        year: number,
        btn: string,
        option: CalendarOption,
        dateObj: Date;

      if (
        targetDomObject &&
        targetDomObject.classList &&
        targetDomObject.classList.contains("dycalendar-prev-next-btn")
      ) {
        date = parseInt(targetDomObject.getAttribute("data-date") || "");
        month = parseInt(targetDomObject.getAttribute("data-month") || "");
        year = parseInt(targetDomObject.getAttribute("data-year") || "");
        btn = targetDomObject.getAttribute("data-btn") || "";
        option = JSON.parse(targetDomObject.parentElement.getAttribute("data-option") || "");

        if (btn === "prev") {
          month = month - 1;
          if (month < 0) {
            year = year - 1;
            month = 11;
          }
        } else if (btn === "next") {
          month = month + 1;
          if (month > 11) {
            year = year + 1;
            month = 0;
          }
        }

        option.date = date;
        option.month = month;
        option.year = year;

        drawCalendar(option);
      }

      if (
        targetDomObject &&
        targetDomObject.classList &&
        targetDomObject.classList.contains("dycalendar-span-month-year")
      ) {
        option = JSON.parse(targetDomObject.parentElement.getAttribute("data-option") || "");
        dateObj = new Date();

        option.date = dateObj.getDate();
        option.month = dateObj.getMonth();
        option.year = dateObj.getFullYear();

        drawCalendar(option);
      }
    };
  }

  dycalendar.draw = function (option: CalendarOption): void {
    if (typeof option === "undefined") {
      global.console.error("Option missing");
      return;
    }

    const self = this;
    const dateObj = new Date();
    const defaults: CalendarOption = {
      type: "day",
      month: dateObj.getMonth(),
      year: dateObj.getFullYear(),
      date: dateObj.getDate(),
      monthformat: "full",
      dayformat: "full",
      highlighttoday: false,
      highlighttargetdate: false,
      prevnextbutton: "hide",
    };

    option = extendSource(option, defaults);

    drawCalendar(option);
  };

  onClick();

  global.dycalendar = dycalendar;
})(typeof window !== "undefined" ? window : this);
