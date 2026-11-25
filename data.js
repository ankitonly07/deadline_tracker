var KEY = "deadline-tracker-v1", items = [], filter = "all";

function load() {
  try {
    var r = localStorage.getItem(KEY);
    if (r) items = JSON.parse(r) || [];
  } catch (e) {
    items = [];
  }
  if (!items.length) {
    var d = new Date();
    items = [
      {id: 1, title: "Sample: Lab 1 – Hello World", subject: "Programming", type: "lab",
       due: new Date(d.getTime() + 86400000).toISOString().slice(0, 16), done: false},
      {id: 2, title: "Sample: Maths worksheet 2", subject: "Mathematics", type: "homework",
       due: new Date(d.getTime() - 3600000 * 5).toISOString().slice(0, 16), done: false}
    ];
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
}

function status(it) {
  if (it.done) return {k: "done", t: "Submitted ✓", c: "ok"};
  var ms = new Date(it.due).getTime() - Date.now();
  if (ms < 0) {
    var h = Math.floor(-ms / 3600000);
    return {k: "overdue", t: "Overdue by " + (h >= 24 ? Math.floor(h / 24) + "d" : h + "h"), c: "bad"};
  }
  var hrs = Math.floor(ms / 3600000), days = Math.floor(hrs / 24);
  var txt = days >= 1 ? days + "d " + (hrs % 24) + "h left"
          : (hrs >= 1 ? hrs + "h left" : Math.max(1, Math.floor(ms / 60000)) + "m left");
  return {k: "pending", t: txt, c: hrs < 24 ? "warn" : "ok"};
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c];
  });
}

function render() {
  var s = {t: items.length, p: 0, l: 0, d: 0};
  items.forEach(function (i) {
    var k = status(i).k;
    if (k == "done") s.d++;
    else if (k == "overdue") s.l++;
    else s.p++;
  });
  sTotal.textContent = s.t;
  sPend.textContent = s.p + s.l;
  sLate.textContent = s.l;
  sDone.textContent = s.d;

  var v = items.filter(function (i) {
    var k = status(i).k;
    return filter == "all" ||
      (filter == "pending" && k != "done") ||
      (filter == "overdue" && k == "overdue") ||
      (filter == "done" && k == "done") ||
      i.type == filter;
  });
  v.sort(function (a, b) { return (a.done - b.done) || (new Date(a.due) - new Date(b.due)); });

  list.innerHTML = v.length ? v.map(function (i) {
    var st = status(i);
    return '<div class="item ' + i.type + (i.done ? ' done' : '') + '">' +
      '<input type="checkbox" ' + (i.done ? 'checked' : '') + ' onchange="tog(' + i.id + ')" aria-label="Mark submitted">' +
      '<div class="body"><div class="t">' + esc(i.title) + '</div>' +
      '<div class="m">' + esc(i.subject) + ' · ' + (i.type == "lab" ? "Lab" : "Homework") +
      ' · Due ' + new Date(i.due).toLocaleString([], {dateStyle: "medium", timeStyle: "short"}) + '</div>' +
      '<span class="badge ' + st.c + '">' + st.t + '</span></div>' +
      '<button class="del" onclick="rm(' + i.id + ')" aria-label="Delete">✕</button></div>';
  }).join("") : '<div class="empty">No assignments here yet 🎉</div>';
}

function tog(id) {
  items.forEach(function (i) { if (i.id == id) i.done = !i.done; });
  save(); render();
}

function rm(id) {
  items = items.filter(function (i) { return i.id != id; });
  save(); render();
}

f.addEventListener("submit", function (e) {
  e.preventDefault();
  items.push({id: Date.now(), title: title.value.trim(), subject: subject.value.trim(),
              type: type.value, due: due.value, done: false});
  save(); f.reset(); render();
});

tabs.addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (!b) return;
  filter = b.dataset.f;
  [].forEach.call(tabs.children, function (x) { x.classList.toggle("on", x == b); });
  render();
});

theme.addEventListener("click", function () {
  var r = document.documentElement, dark = getComputedStyle(r).colorScheme == "dark";
  r.setAttribute("data-theme", dark ? "light" : "dark");
});

load();
render();
setInterval(render, 60000);
