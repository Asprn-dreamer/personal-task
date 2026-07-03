const STORAGE_KEY = "flowtask-personal-v1";

const priorityText = {
  high: "高",
  medium: "中",
  low: "低"
};

const statusText = {
  todo: "未开始",
  doing: "进行中",
  done: "已完成"
};

const repeatText = {
  none: "不重复",
  daily: "每天",
  weekly: "每周",
  monthly: "每月"
};

const priorityWeight = {
  high: 3,
  medium: 2,
  low: 1
};

const today = new Date();
const isoToday = toISODate(today);
const tomorrow = addDays(today, 1);
const nextWeek = addDays(today, 6);
const holidayMap = {
  "2026-01-01": { name: "元旦", type: "holiday" },
  "2026-01-02": { name: "元旦假期", type: "rest" },
  "2026-01-03": { name: "元旦假期", type: "rest" },
  "2026-01-04": { name: "调休上班", type: "work" },
  "2026-02-14": { name: "春节调休", type: "work" },
  "2026-02-15": { name: "春节假期", type: "rest" },
  "2026-02-16": { name: "除夕", type: "holiday" },
  "2026-02-17": { name: "春节", type: "holiday" },
  "2026-02-18": { name: "春节", type: "holiday" },
  "2026-02-19": { name: "春节", type: "holiday" },
  "2026-02-20": { name: "春节假期", type: "rest" },
  "2026-02-21": { name: "春节假期", type: "rest" },
  "2026-02-22": { name: "春节假期", type: "rest" },
  "2026-04-04": { name: "清明假期", type: "rest" },
  "2026-04-05": { name: "清明节", type: "holiday" },
  "2026-04-06": { name: "清明补休", type: "rest" },
  "2026-04-26": { name: "劳动节调休", type: "work" },
  "2026-05-01": { name: "劳动节", type: "holiday" },
  "2026-05-02": { name: "劳动节", type: "holiday" },
  "2026-05-03": { name: "劳动节假期", type: "rest" },
  "2026-05-04": { name: "劳动节假期", type: "rest" },
  "2026-05-05": { name: "劳动节假期", type: "rest" },
  "2026-05-09": { name: "劳动节调休", type: "work" },
  "2026-06-19": { name: "端午节", type: "holiday" },
  "2026-06-20": { name: "端午假期", type: "rest" },
  "2026-06-21": { name: "端午假期", type: "rest" },
  "2026-09-25": { name: "中秋节", type: "holiday" },
  "2026-09-26": { name: "中秋假期", type: "rest" },
  "2026-09-27": { name: "中秋假期", type: "rest" },
  "2026-10-01": { name: "国庆节", type: "holiday" },
  "2026-10-02": { name: "国庆节", type: "holiday" },
  "2026-10-03": { name: "国庆节", type: "holiday" },
  "2026-10-04": { name: "国庆假期", type: "rest" },
  "2026-10-05": { name: "国庆假期", type: "rest" },
  "2026-10-06": { name: "国庆假期", type: "rest" },
  "2026-10-07": { name: "国庆假期", type: "rest" },
  "2026-10-10": { name: "国庆调休", type: "work" }
};

const sampleTasks = [
  {
    id: crypto.randomUUID(),
    title: "整理个人任务管理网站需求",
    description: "把核心功能、体验增强和页面结构收束成第一版可开发范围。",
    priority: "high",
    status: "doing",
    dueDate: isoToday,
    repeat: "none",
    tags: ["项目", "产品"],
    pinned: true,
    createdAt: Date.now() - 86400000 * 3,
    order: 1,
    subtasks: [
      { id: crypto.randomUUID(), title: "确定核心字段", done: true },
      { id: crypto.randomUUID(), title: "确认优先级规则", done: false }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "完成课程学习笔记",
    description: "复盘本周课程重点，并把疑问整理到一个列表里。",
    priority: "medium",
    status: "todo",
    dueDate: toISODate(tomorrow),
    repeat: "weekly",
    tags: ["学习"],
    pinned: false,
    createdAt: Date.now() - 86400000 * 2,
    order: 2,
    subtasks: [
      { id: crypto.randomUUID(), title: "阅读资料", done: false },
      { id: crypto.randomUUID(), title: "输出总结", done: false }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "预约体检并准备材料",
    description: "确认时间、地点和需要携带的证件。",
    priority: "low",
    status: "todo",
    dueDate: toISODate(nextWeek),
    repeat: "monthly",
    tags: ["生活", "健康"],
    pinned: false,
    createdAt: Date.now() - 86400000,
    order: 3,
    subtasks: []
  },
  {
    id: crypto.randomUUID(),
    title: "周报复盘",
    description: "记录本周完成项、阻塞项和下周重点。",
    priority: "medium",
    status: "done",
    dueDate: toISODate(addDays(today, -1)),
    repeat: "none",
    tags: ["工作"],
    pinned: false,
    createdAt: Date.now() - 86400000 * 5,
    order: 4,
    subtasks: [
      { id: crypto.randomUUID(), title: "整理完成项", done: true },
      { id: crypto.randomUUID(), title: "发送给团队", done: true }
    ]
  }
];

let state = loadState();
let filters = {
  view: "all",
  status: "all",
  priority: "all",
  tag: "all",
  search: "",
  sort: "smart"
};
let calendarCursor = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedCalendarDate = isoToday;
let draggingId = null;
let activeCanvasTaskId = null;
let canvasPointer = null;
let canvasFullscreen = false;
let connectMode = false;
let pendingConnection = null;
let selectedConnectionId = null;
let selectedCanvasItemId = null;
let selectedCanvasItemIds = new Set();
let connectionDraftTargetId = null;

const refs = {
  taskList: byId("taskList"),
  tagList: byId("tagList"),
  searchInput: byId("searchInput"),
  priorityMenuLabel: byId("priorityMenuLabel"),
  sortMenuLabel: byId("sortMenuLabel"),
  customSelects: Array.from(document.querySelectorAll(".custom-select")),
  viewTitle: byId("viewTitle"),
  viewSubtitle: byId("viewSubtitle"),
  taskModal: byId("taskModal"),
  taskForm: byId("taskForm"),
  modalTitle: byId("modalTitle"),
  taskId: byId("taskId"),
  taskTitle: byId("taskTitle"),
  taskDescription: byId("taskDescription"),
  taskPriority: byId("taskPriority"),
  taskStatus: byId("taskStatus"),
  choiceGroups: Array.from(document.querySelectorAll(".choice-group")),
  taskDueDate: byId("taskDueDate"),
  taskRepeat: byId("taskRepeat"),
  taskTags: byId("taskTags"),
  taskPinned: byId("taskPinned"),
  subtaskFields: byId("subtaskFields"),
  deleteTask: byId("deleteTask"),
  calendarGrid: byId("calendarGrid"),
  monthLabel: byId("monthLabel"),
  completionHistory: byId("completionHistory"),
  weekDoneCount: byId("weekDoneCount"),
  monthDoneCount: byId("monthDoneCount"),
  canvasModal: byId("canvasModal"),
  canvasTitle: byId("canvasTitle"),
  canvasMeta: byId("canvasMeta"),
  canvasSaveState: byId("canvasSaveState"),
  infiniteCanvas: byId("infiniteCanvas"),
  canvasWorld: byId("canvasWorld"),
  canvasSelectionBox: byId("canvasSelectionBox"),
  canvasZoomLabel: byId("canvasZoomLabel"),
  canvasImageInput: byId("canvasImageInput"),
  canvasVideoInput: byId("canvasVideoInput"),
  canvasMuteAll: byId("canvasMuteAll"),
  toggleConnectMode: byId("toggleConnectMode"),
  connectionTypePicker: byId("connectionTypePicker"),
  connectionLabelEditor: byId("connectionLabelEditor"),
  toggleCanvasFullscreen: byId("toggleCanvasFullscreen"),
  toast: byId("toast")
};

bindEvents();
render();

function bindEvents() {
  byId("openTaskModal").addEventListener("click", () => openTaskModal());
  byId("openTaskModalInline").addEventListener("click", () => openTaskModal());
  byId("closeTaskModal").addEventListener("click", closeTaskModal);
  byId("addSubtask").addEventListener("click", () => addSubtaskField());
  byId("clearCompleted").addEventListener("click", clearCompleted);
  byId("themeToggle").addEventListener("click", toggleTheme);
  byId("prevMonth").addEventListener("click", () => moveCalendarMonth(-1));
  byId("nextMonth").addEventListener("click", () => moveCalendarMonth(1));
  byId("todayButton").addEventListener("click", jumpCalendarToToday);
  bindChoiceGroups();

  refs.searchInput.addEventListener("input", (event) => {
    filters.search = event.target.value.trim().toLowerCase();
    render();
  });

  bindCustomMenus();

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      filters.view = button.dataset.view;
      filters.tag = "all";
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });
  });

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      filters.status = button.dataset.status;
      document.querySelectorAll(".segment").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });
  });

  refs.taskForm.addEventListener("submit", saveTaskFromForm);
  refs.deleteTask.addEventListener("click", deleteCurrentTask);
  refs.taskModal.addEventListener("click", (event) => {
    if (event.target === refs.taskModal) closeTaskModal();
  });
  byId("closeCanvasModal").addEventListener("click", closeCanvasModal);
  byId("canvasEditTask").addEventListener("click", editActiveCanvasTask);
  refs.toggleCanvasFullscreen.addEventListener("click", toggleCanvasFullscreen);
  byId("addTextBlock").addEventListener("click", () => addCanvasItem("text"));
  byId("addImageBlock").addEventListener("click", () => refs.canvasImageInput.click());
  byId("addVideoBlock").addEventListener("click", () => refs.canvasVideoInput.click());
  byId("addVideoUrlBlock").addEventListener("click", () => addCanvasItem("video"));
  refs.toggleConnectMode.addEventListener("click", toggleConnectMode);
  refs.connectionTypePicker.addEventListener("click", choosePendingConnectionType);
  refs.connectionLabelEditor.addEventListener("keydown", handleConnectionLabelKeydown);
  refs.connectionLabelEditor.addEventListener("blur", saveConnectionLabelEdit);
  refs.canvasMuteAll.addEventListener("click", toggleCanvasMute);
  byId("resetCanvasView").addEventListener("click", resetCanvasView);
  byId("zoomOutCanvas").addEventListener("click", () => zoomCanvas(-0.1));
  byId("zoomInCanvas").addEventListener("click", () => zoomCanvas(0.1));
  refs.canvasImageInput.addEventListener("change", handleImageInputChange);
  refs.canvasVideoInput.addEventListener("change", handleVideoInputChange);
  refs.canvasModal.addEventListener("click", (event) => {
    if (event.target === refs.canvasModal) closeCanvasModal();
  });
  refs.infiniteCanvas.addEventListener("pointerdown", handleCanvasPointerDown);
  window.addEventListener("pointermove", handleCanvasPointerMove);
  window.addEventListener("pointerup", stopCanvasPointer);
  window.addEventListener("pointercancel", stopCanvasPointer);
  refs.infiniteCanvas.addEventListener("wheel", handleCanvasWheel, { passive: false });
  refs.infiniteCanvas.addEventListener("dragover", handleCanvasDragOver);
  refs.infiniteCanvas.addEventListener("dragleave", handleCanvasDragLeave);
  refs.infiniteCanvas.addEventListener("drop", handleCanvasDrop);
  window.addEventListener("keydown", handleCanvasKeydown);

  refs.calendarGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-date]");
    if (!button) return;
    selectCalendarDate(button.dataset.date);
  });
}

function render() {
  persist();
  syncCustomMenus();
  renderStats();
  renderTags();
  renderTasks();
  renderCalendar();
  renderCompletionHistory();
}

function renderStats() {
  const tasks = state.tasks;
  const active = tasks.filter((task) => task.status !== "done");
  const completed = tasks.filter((task) => task.status === "done");
  const allTodayTasks = tasks.filter((task) => task.dueDate === isoToday);
  const todayTasks = allTodayTasks.filter((task) => task.status !== "done");
  const todayCompleted = allTodayTasks.filter((task) => task.status === "done");
  const overdue = active.filter((task) => task.dueDate < isoToday);
  const high = active.filter((task) => task.priority === "high");
  const rate = allTodayTasks.length ? Math.round((todayCompleted.length / allTodayTasks.length) * 100) : 0;

  byId("todayCount").textContent = todayTasks.length;
  byId("todayHint").textContent = todayTasks.length ? "今天别摊太满" : "今天很清爽";
  byId("highCount").textContent = high.length;
  byId("completionRate").textContent = `${rate}%`;
  byId("completedCount").textContent = `${todayCompleted.length}/${allTodayTasks.length} 今日完成`;
  byId("overdueCount").textContent = overdue.length;
  renderStatPopover("todayPopover", "今日待办", todayTasks);
  renderStatPopover("highPopover", "高优先级", high);
  renderStatPopover("completedPopover", "今日已完成", todayCompleted);
  renderStatPopover("overduePopover", "逾期任务", overdue);
}

function renderStatPopover(id, title, tasks) {
  const rows = getSmartSorted(tasks).slice(0, 4);
  byId(id).innerHTML = `
    <strong>${title}</strong>
    ${
      rows.length
        ? `<ul>${rows.map((task) => `<li><i class="preview-dot ${task.priority}"></i><span>${escapeHTML(task.title)}</span></li>`).join("")}</ul>`
        : `<p>暂无对应任务。</p>`
    }
  `;
}

function renderCompletionHistory() {
  const history = state.completionHistory || [];
  const weekStart = getWeekStart(new Date());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const weekCount = history.filter((item) => new Date(item.completedAt) >= weekStart).length;
  const monthCount = history.filter((item) => new Date(item.completedAt) >= monthStart).length;

  refs.weekDoneCount.textContent = weekCount;
  refs.monthDoneCount.textContent = monthCount;
  refs.completionHistory.innerHTML = history.length
    ? `<ul>${history
        .slice(0, 3)
        .map(
          (item) => `
            <li>
              <i class="preview-dot ${item.priority}"></i>
              <div>
                <strong>${escapeHTML(item.title)}</strong>
                <span>${formatDate(toISODate(new Date(item.completedAt)))} · ${repeatText[item.repeat || "none"]}</span>
              </div>
            </li>`
        )
        .join("")}</ul>`
    : `<p>完成任务后会在这里留下记录。</p>`;
}

function renderTags() {
  const tags = Array.from(new Set(state.tasks.flatMap((task) => task.tags))).sort();
  refs.tagList.innerHTML = [
    `<button class="tag-pill ${filters.tag === "all" ? "is-active" : ""}" data-tag="all" type="button">全部标签</button>`,
    ...tags.map((tag) => `<button class="tag-pill ${filters.tag === tag ? "is-active" : ""}" data-tag="${escapeHTML(tag)}" type="button"># ${escapeHTML(tag)}</button>`)
  ].join("");

  refs.tagList.querySelectorAll(".tag-pill").forEach((button) => {
    button.addEventListener("click", () => {
      filters.tag = button.dataset.tag;
      render();
    });
  });
}

function renderTasks() {
  const tasks = getVisibleTasks();
  const titles = {
    all: "全部任务",
    today: "今日任务",
    upcoming: "即将到期",
    completed: "已完成",
    date: formatDate(selectedCalendarDate)
  };

  refs.viewTitle.textContent = filters.tag === "all" ? titles[filters.view] : `# ${filters.tag}`;
  refs.viewSubtitle.textContent = `${tasks.length} 个任务符合当前筛选`;

  if (!tasks.length) {
    refs.taskList.innerHTML = `<div class="empty-state">当前没有匹配任务，换个筛选条件或新建一个任务。</div>`;
    return;
  }

  refs.taskList.innerHTML = tasks.map(renderTaskCard).join("");
  refs.taskList.querySelectorAll(".task-card").forEach((card) => bindTaskCard(card));
}

function renderTaskCard(task) {
  const overdue = task.status !== "done" && task.dueDate < isoToday;
  const subtasksDone = task.subtasks.filter((item) => item.done).length;
  const dueText = overdue ? `逾期 ${formatDate(task.dueDate)}` : formatDate(task.dueDate);
  const subtaskSummary = task.subtasks.length ? `<span class="due-badge">子任务 ${subtasksDone}/${task.subtasks.length}</span>` : "";
  const canvasSummary = task.canvas?.items?.length ? `<span class="canvas-badge">画布 ${task.canvas.items.length}</span>` : "";
  const tagRows = task.tags.map((tag) => `<span class="tag"># ${escapeHTML(tag)}</span>`).join("");
  const subtaskRows = task.subtasks.length
    ? task.subtasks
        .map(
          (item) => `
            <button class="subtask-chip ${item.done ? "is-done" : ""}" type="button" data-subtask-id="${item.id}">
              <span>${item.done ? "✓" : "○"}</span>
              ${escapeHTML(item.title)}
            </button>`
        )
        .join("")
    : `<span class="subtask-empty">暂无子任务</span>`;

  return `
    <article class="task-card priority-${task.priority} ${task.status === "done" ? "is-done" : ""}" draggable="true" data-id="${task.id}">
      <input class="task-check" type="checkbox" ${task.status === "done" ? "checked" : ""} aria-label="标记完成" />
      <div>
        <div class="task-title-row">
          <h3>${escapeHTML(task.title)}</h3>
          <button class="pin-toggle ${task.pinned ? "is-pinned" : ""}" type="button" aria-label="${task.pinned ? "取消重点" : "设为重点"}">
            ${task.pinned ? "★" : "☆"}
            <span>重点</span>
          </button>
          <span class="priority-badge ${task.priority}">${priorityText[task.priority]}</span>
        </div>
        <p class="task-desc">${escapeHTML(task.description || "暂无描述")}</p>
        <div class="task-meta">
          <span class="status-badge">${statusText[task.status]}</span>
          <span class="due-badge">${dueText}</span>
          ${(task.repeat && task.repeat !== "none") ? `<span class="repeat-badge">${repeatText[task.repeat]}</span>` : ""}
          ${subtaskSummary}
          ${canvasSummary}
        </div>
        <div class="task-expand">
          <div class="task-tags">${tagRows}</div>
          <div class="subtask-list">${subtaskRows}</div>
        </div>
      </div>
      <div class="task-actions">
        <button class="mini-action edit-task" type="button" aria-label="编辑">✎</button>
      </div>
    </article>
  `;
}

function bindTaskCard(card) {
  const taskId = card.dataset.id;
  card.addEventListener("click", (event) => {
    if (event.target.closest("button, input, .subtask-chip")) return;
    openCanvasModal(findTask(taskId));
  });

  card.querySelector(".task-check").addEventListener("change", (event) => {
    const task = findTask(taskId);
    if (event.target.checked) {
      completeTask(task);
    } else {
      task.status = "todo";
    }
    toast(task.status === "done" ? "任务已完成" : "任务已恢复");
    render();
  });

  card.querySelector(".edit-task").addEventListener("click", () => openTaskModal(findTask(taskId)));
  card.querySelector(".pin-toggle").addEventListener("click", (event) => {
    event.stopPropagation();
    const task = findTask(taskId);
    task.pinned = !task.pinned;
    toast(task.pinned ? "已标为重点任务" : "已取消重点标记");
    render();
  });
  card.querySelectorAll("[data-subtask-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const task = findTask(taskId);
      const subtask = task.subtasks.find((item) => item.id === button.dataset.subtaskId);
      if (!subtask) return;
      subtask.done = !subtask.done;
      if (task.subtasks.length && task.subtasks.every((item) => item.done)) {
        completeTask(task);
      } else if (task.status === "done") {
        task.status = "doing";
      }
      toast(subtask.done ? "子任务已完成" : "子任务已恢复");
      render();
    });
  });

  card.addEventListener("dragstart", () => {
    draggingId = taskId;
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", () => {
    draggingId = null;
    card.classList.remove("dragging");
  });

  card.addEventListener("dragover", (event) => event.preventDefault());
  card.addEventListener("drop", () => {
    if (!draggingId || draggingId === taskId) return;
    reorderTasks(draggingId, taskId);
  });
}

function renderCalendar() {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = addDays(firstDay, -startOffset);
  const taskInfoByDate = state.tasks.reduce((map, task) => {
    if (!map[task.dueDate]) {
      map[task.dueDate] = { count: 0, priority: task.priority };
    }
    map[task.dueDate].count += 1;
    if (priorityWeight[task.priority] > priorityWeight[map[task.dueDate].priority]) {
      map[task.dueDate].priority = task.priority;
    }
    return map;
  }, {});

  refs.monthLabel.textContent = `${year} 年 ${month + 1} 月`;
  refs.calendarGrid.innerHTML = Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    const iso = toISODate(date);
    const isCurrentMonth = date.getMonth() === month;
    const dayInfo = getCalendarDayInfo(iso);
    const taskInfo = taskInfoByDate[iso];
    const taskCount = taskInfo?.count || 0;
    const taskPriority = taskInfo?.priority || "";
    const dayTasks = state.tasks.filter((task) => task.dueDate === iso);
    const classes = [
      "calendar-day",
      isCurrentMonth ? "" : "is-muted",
      iso === isoToday ? "is-today" : "",
      iso === selectedCalendarDate ? "is-selected" : "",
      taskCount ? "has-task" : "",
      taskPriority ? `task-priority-${taskPriority}` : "",
      dayInfo.type === "holiday" ? "has-holiday" : "",
      dayInfo.isRest ? "is-rest-day" : "",
      dayInfo.isWorkday ? "is-work-day" : ""
    ].filter(Boolean).join(" ");

    return `
      <button class="${classes}" type="button" data-date="${iso}" aria-label="${formatFullDate(iso)}">
        <span class="calendar-number">${date.getDate()}</span>
        ${dayInfo.label ? `<small>${dayInfo.label}</small>` : ""}
        ${taskCount ? `<i aria-hidden="true"></i>` : ""}
        <span class="calendar-popover">
          <strong>${formatFullDate(iso)}</strong>
          <em>${dayInfo.description} · ${taskCount} 个任务</em>
          ${
            dayTasks.length
              ? `<ul>${dayTasks.slice(0, 4).map((task) => `<li><b class="preview-dot ${task.priority}"></b>${escapeHTML(task.title)}</li>`).join("")}</ul>`
              : `<p>这一天还没有安排任务。</p>`
          }
        </span>
      </button>`;
  }).join("");
}

function getVisibleTasks() {
  let tasks = [...state.tasks];
  if (filters.view === "today") tasks = tasks.filter((task) => task.dueDate === isoToday && task.status !== "done");
  if (filters.view === "date") tasks = tasks.filter((task) => task.dueDate === selectedCalendarDate);
  if (filters.view === "upcoming") tasks = tasks.filter((task) => task.dueDate > isoToday && task.status !== "done");
  if (filters.view === "completed") tasks = tasks.filter((task) => task.status === "done");
  if (filters.status !== "all") tasks = tasks.filter((task) => task.status === filters.status);
  if (filters.priority !== "all") tasks = tasks.filter((task) => task.priority === filters.priority);
  if (filters.tag !== "all") tasks = tasks.filter((task) => task.tags.includes(filters.tag));
  if (filters.search) {
    tasks = tasks.filter((task) => `${task.title} ${task.description} ${task.tags.join(" ")}`.toLowerCase().includes(filters.search));
  }

  if (filters.sort === "priority") return tasks.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  if (filters.sort === "due") return tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  if (filters.sort === "created") return tasks.sort((a, b) => b.createdAt - a.createdAt);
  if (filters.sort === "manual") return tasks.sort((a, b) => a.order - b.order);
  return getSmartSorted(tasks);
}

function getSmartSorted(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.status === "done" && b.status !== "done") return 1;
    if (a.status !== "done" && b.status === "done") return -1;
    const priorityDelta = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (priorityDelta) return priorityDelta;
    return a.dueDate.localeCompare(b.dueDate) || a.order - b.order;
  });
}

function completeTask(task) {
  const wasDone = task.status === "done";
  task.status = "done";
  task.completedAt = Date.now();
  task.subtasks.forEach((item) => (item.done = true));

  if (!wasDone) {
    recordCompletion(task);
    createNextRepeatTask(task);
  }
}

function recordCompletion(task) {
  state.completionHistory.unshift({
    id: crypto.randomUUID(),
    taskId: task.id,
    title: task.title,
    completedAt: Date.now(),
    dueDate: task.dueDate,
    priority: task.priority,
    tags: [...task.tags],
    repeat: task.repeat || "none"
  });
  state.completionHistory = state.completionHistory.slice(0, 80);
}

function createNextRepeatTask(task) {
  if (!task.repeat || task.repeat === "none") return;
  const nextDueDate = getNextRepeatDate(task.dueDate, task.repeat);
  const repeatParentId = task.repeatParentId || task.id;
  const alreadyExists = state.tasks.some(
    (item) => item.repeatParentId === repeatParentId && item.dueDate === nextDueDate && item.status !== "done"
  );
  if (alreadyExists) return;

  state.tasks.push({
    id: crypto.randomUUID(),
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: "todo",
    dueDate: nextDueDate,
    repeat: task.repeat,
    repeatParentId,
    tags: [...task.tags],
    pinned: task.pinned,
    canvas: createEmptyCanvas(),
    createdAt: Date.now(),
    order: getNextOrder(),
    subtasks: task.subtasks.map((item) => ({
      id: crypto.randomUUID(),
      title: item.title,
      done: false
    }))
  });
}

function getNextRepeatDate(dateValue, repeat) {
  const date = parseISODate(dateValue);
  if (repeat === "daily") return toISODate(addDays(date, 1));
  if (repeat === "weekly") return toISODate(addDays(date, 7));
  if (repeat === "monthly") {
    const next = new Date(date);
    next.setMonth(next.getMonth() + 1);
    return toISODate(next);
  }
  return dateValue;
}

function openTaskModal(task = null) {
  refs.taskForm.reset();
  refs.subtaskFields.innerHTML = "";
  refs.deleteTask.style.visibility = task ? "visible" : "hidden";
  refs.modalTitle.textContent = task ? "编辑任务" : "新建任务";

  if (task) {
    refs.taskId.value = task.id;
    refs.taskTitle.value = task.title;
    refs.taskDescription.value = task.description;
    refs.taskPriority.value = task.priority;
    refs.taskStatus.value = task.status;
    refs.taskDueDate.value = task.dueDate;
    refs.taskRepeat.value = task.repeat || "none";
    refs.taskTags.value = task.tags.join(", ");
    refs.taskPinned.checked = task.pinned;
    task.subtasks.forEach((item) => addSubtaskField(item));
  } else {
    refs.taskId.value = "";
    refs.taskDueDate.value = isoToday;
    refs.taskRepeat.value = "none";
    addSubtaskField();
  }

  refs.taskModal.classList.add("is-open");
  refs.taskModal.setAttribute("aria-hidden", "false");
  syncChoiceGroups();
  refs.taskTitle.focus();
}

function closeTaskModal() {
  refs.taskModal.classList.remove("is-open");
  refs.taskModal.setAttribute("aria-hidden", "true");
}

function openCanvasModal(task) {
  if (!task) return;
  activeCanvasTaskId = task.id;
  ensureTaskCanvas(task);
  refs.canvasTitle.textContent = task.title;
  refs.canvasMeta.textContent = `${formatDate(task.dueDate)} · ${priorityText[task.priority]}优先级 · ${statusText[task.status]}`;
  refs.canvasModal.classList.add("is-open");
  refs.canvasModal.setAttribute("aria-hidden", "false");
  syncCanvasFullscreenState();
  renderCanvas();
}

function closeCanvasModal() {
  canvasFullscreen = false;
  refs.canvasModal.classList.remove("is-fullscreen");
  refs.canvasModal.classList.remove("is-open");
  refs.canvasModal.setAttribute("aria-hidden", "true");
  activeCanvasTaskId = null;
  canvasPointer = null;
  selectedConnectionId = null;
  selectedCanvasItemId = null;
  selectedCanvasItemIds = new Set();
  render();
}

function editActiveCanvasTask() {
  const task = findTask(activeCanvasTaskId);
  closeCanvasModal();
  openTaskModal(task);
}

function toggleCanvasFullscreen() {
  if (!refs.canvasModal.classList.contains("is-open")) return;
  canvasFullscreen = !canvasFullscreen;
  syncCanvasFullscreenState();
}

function syncCanvasFullscreenState() {
  refs.canvasModal.classList.toggle("is-fullscreen", canvasFullscreen);
  refs.toggleCanvasFullscreen.innerHTML = getFullscreenIcon(canvasFullscreen);
  refs.toggleCanvasFullscreen.setAttribute("aria-label", canvasFullscreen ? "退出铺满窗口" : "铺满窗口显示");
  refs.toggleCanvasFullscreen.title = canvasFullscreen ? "退出铺满窗口" : "铺满窗口显示";
}

function renderCanvas() {
  const task = findTask(activeCanvasTaskId);
  if (!task) return;
  const canvas = ensureTaskCanvas(task);
  refs.canvasWorld.style.transform = `translate(${canvas.view.x}px, ${canvas.view.y}px) scale(${canvas.view.zoom})`;
  refs.canvasZoomLabel.textContent = `${Math.round(canvas.view.zoom * 100)}%`;
  syncCanvasMuteButton(canvas);
  syncConnectionControls(canvas);
  refs.canvasWorld.innerHTML = `
    <svg class="canvas-connections" aria-hidden="true">${renderCanvasConnections(canvas)}</svg>
    ${canvas.items.map((item) => renderCanvasItem(item, canvas)).join("")}
  `;
  refs.canvasWorld.querySelectorAll(".canvas-item").forEach((item) => bindCanvasItem(item));
  refs.canvasWorld.querySelectorAll("[data-connection-id]").forEach((connection) => bindCanvasConnection(connection));
  updateSelectedCanvasItemClass();
}

function renderCanvasItem(item, canvas) {
  const videoUrl = item.content ? normalizeVideoUrl(item.content) : "";
  const body = {
    text: `<div class="canvas-text" contenteditable="true" data-editable="true">${escapeHTML(item.content || "点击输入文字")}</div>`,
    image: item.content
      ? `<img src="${escapeHTML(item.content)}" alt="任务图片资料" />`
      : `<div class="canvas-placeholder">点击工具栏选择图片，或直接拖入图片文件</div>`,
    video: `
      <div class="media-content">
        ${videoUrl
          ? isDirectVideoUrl(videoUrl)
            ? `<video src="${escapeHTML(videoUrl)}" controls preload="metadata" ${canvas.muted !== false ? "muted" : ""}></video>`
            : `<iframe src="${escapeHTML(videoUrl)}" title="任务视频资料" allowfullscreen loading="lazy"></iframe>`
          : `<div class="canvas-placeholder">粘贴视频 URL 后预览</div>`}
        <input class="canvas-url-input" type="url" value="${escapeHTML(item.content || "")}" placeholder="YouTube / B 站 / .mp4 视频链接" />
      </div>`
  }[item.type];

  return `
    <article class="canvas-item type-${item.type}" data-item-id="${item.id}" style="left:${item.x}px; top:${item.y}px; width:${item.width}px; ${item.type === "video" ? `height:${item.height}px;` : `min-height:${item.height}px;`}">
      ${body}
      <button class="connect-handle connect-top" data-side="top" type="button" aria-label="从上边连线"></button>
      <button class="connect-handle connect-right" data-side="right" type="button" aria-label="从右边连线"></button>
      <button class="connect-handle connect-bottom" data-side="bottom" type="button" aria-label="从下边连线"></button>
      <button class="connect-handle connect-left" data-side="left" type="button" aria-label="从左边连线"></button>
      <button class="resize-canvas-item" type="button" aria-label="调整大小"></button>
    </article>
  `;
}

function renderCanvasConnections(canvas) {
  const validConnections = canvas.connections.filter(
    (connection) => findCanvasItemInCanvas(canvas, connection.fromId) && findCanvasItemInCanvas(canvas, connection.toId)
  );
  if (validConnections.length !== canvas.connections.length) {
    canvas.connections = validConnections;
    persist();
  }

  return `
    <defs>
      <marker id="arrow-sequence" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M1 1 9 5 1 9Z"></path>
      </marker>
      <marker id="arrow-cause" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M1 1 9 5 1 9Z"></path>
      </marker>
      <marker id="arrow-child" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M1 1 9 5 1 9Z"></path>
      </marker>
    </defs>
    ${validConnections.map((connection) => renderConnectionPath(canvas, connection)).join("")}
    <path class="connection-line connection-draft" data-draft-connection hidden></path>
  `;
}

function renderCanvasConnectionsOnly(canvas) {
  const svg = refs.canvasWorld.querySelector(".canvas-connections");
  if (!svg) return;
  svg.innerHTML = renderCanvasConnections(canvas);
  svg.querySelectorAll("[data-connection-id]").forEach((connection) => bindCanvasConnection(connection));
}

function renderConnectionPath(canvas, connection) {
  const fromItem = findCanvasItemInCanvas(canvas, connection.fromId);
  const toItem = findCanvasItemInCanvas(canvas, connection.toId);
  const { from, to } = connection.fromSide && connection.toSide
    ? { from: getCanvasItemAnchor(fromItem, connection.fromSide), to: getCanvasItemAnchor(toItem, connection.toSide) }
    : getConnectionAnchors(fromItem, toItem);
  const path = getConnectionPath(from, to);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  return `
    <g class="connection-group type-${connection.type} ${connection.id === selectedConnectionId ? "is-selected" : ""}" data-connection-id="${connection.id}">
      <path class="connection-hit" d="${path}"></path>
      <path class="connection-line" d="${path}"></path>
      ${connection.label ? `<text class="connection-label" x="${midX}" y="${midY - 8}">${escapeHTML(connection.label)}</text>` : ""}
    </g>
  `;
}

function bindCanvasItem(element) {
  const itemId = element.dataset.itemId;
  element.addEventListener("pointerdown", (event) => {
    if (!selectedCanvasItemIds.has(itemId)) {
      selectCanvasItem(itemId);
    }
    if (event.target.closest(".resize-canvas-item, .connect-handle, button, input, textarea") || event.target.dataset.editable) return;
    event.preventDefault();
    event.stopPropagation();
    const item = findCanvasItem(itemId);
    if (!item) return;
    canvasPointer = {
      mode: "item",
      id: itemId,
      startX: event.clientX,
      startY: event.clientY,
      itemX: item.x,
      itemY: item.y,
      groupItems: getSelectedCanvasItemsSnapshot()
    };
    element.classList.add("is-moving");
    element.setPointerCapture(event.pointerId);
  });

  element.querySelectorAll(".connect-handle").forEach((handle) => {
    handle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const item = findCanvasItem(itemId);
      if (!item) return;
      hideConnectionTypePicker();
      hideConnectionLabelEditor(false);
      selectedConnectionId = null;
      connectionDraftTargetId = null;
      updateSelectedConnectionClass();
      const side = handle.dataset.side || "right";
      const start = getCanvasItemAnchor(item, side);
      canvasPointer = {
        mode: "connect",
        id: itemId,
        fromSide: side,
        start
      };
      element.classList.add("is-connecting");
      updateDraftConnection(start, getCanvasPoint(event.clientX, event.clientY));
    });
  });

  element.querySelector(".resize-canvas-item").addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const item = findCanvasItem(itemId);
    const task = findTask(activeCanvasTaskId);
    if (!item || !task) return;
    canvasPointer = {
      mode: "resize",
      id: itemId,
      startX: event.clientX,
      startY: event.clientY,
      width: item.width,
      height: item.height,
      zoom: ensureTaskCanvas(task).view.zoom
    };
    element.classList.add("is-resizing");
    element.setPointerCapture(event.pointerId);
  });

  const editable = element.querySelector("[data-editable]");
  if (editable) {
    editable.addEventListener("input", () => {
      const item = findCanvasItem(itemId);
      if (!item) return;
      item.content = editable.innerText.trim();
      markCanvasSaved();
      persist();
    });
  }

  const urlInput = element.querySelector(".canvas-url-input");
  if (urlInput) {
    urlInput.addEventListener("change", () => {
      const item = findCanvasItem(itemId);
      if (!item) return;
      item.content = urlInput.value.trim();
      saveCanvasAndRender("媒体内容已更新");
    });
    urlInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        urlInput.blur();
      }
    });
  }
}

function bindCanvasConnection(element) {
  element.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  element.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    selectedCanvasItemId = null;
    selectedCanvasItemIds = new Set();
    updateSelectedCanvasItemClass();
    selectedConnectionId = element.dataset.connectionId;
    updateSelectedConnectionClass();
  });

  element.addEventListener("dblclick", (event) => {
    event.preventDefault();
    event.stopPropagation();
    selectedCanvasItemId = null;
    selectedCanvasItemIds = new Set();
    updateSelectedCanvasItemClass();
    selectedConnectionId = element.dataset.connectionId;
    startConnectionLabelEdit(selectedConnectionId, event.clientX, event.clientY);
  });
}

function handleCanvasPointerDown(event) {
  if (event.target.closest(".canvas-item, .connection-group, .connection-type-picker, .connection-label-editor")) return;
  const task = findTask(activeCanvasTaskId);
  if (!task) return;
  event.preventDefault();
  selectedConnectionId = null;
  selectedCanvasItemId = null;
  selectedCanvasItemIds = new Set();
  hideConnectionLabelEditor(false);
  hideConnectionTypePicker();
  updateSelectedCanvasItemClass();
  renderCanvasConnectionsOnly(ensureTaskCanvas(task));
  const canvas = ensureTaskCanvas(task);
  if (event.ctrlKey || event.metaKey) {
    const start = { x: event.clientX, y: event.clientY };
    const canvasStart = getCanvasPoint(event.clientX, event.clientY);
    canvasPointer = {
      mode: "select",
      start,
      current: start,
      canvasStart,
      canvasCurrent: canvasStart
    };
    updateCanvasSelectionBox(start, start);
    refs.infiniteCanvas.setPointerCapture(event.pointerId);
    return;
  }
  canvasPointer = {
    mode: "pan",
    startX: event.clientX,
    startY: event.clientY,
    viewX: canvas.view.x,
    viewY: canvas.view.y
  };
  refs.infiniteCanvas.setPointerCapture(event.pointerId);
}

function handleCanvasPointerMove(event) {
  if (!canvasPointer) return;
  const task = findTask(activeCanvasTaskId);
  if (!task) return;
  const canvas = ensureTaskCanvas(task);
  const dx = event.clientX - canvasPointer.startX;
  const dy = event.clientY - canvasPointer.startY;
  if (canvasPointer.mode === "pan") {
    canvas.view.x = canvasPointer.viewX + dx;
    canvas.view.y = canvasPointer.viewY + dy;
    refs.canvasWorld.style.transform = `translate(${canvas.view.x}px, ${canvas.view.y}px) scale(${canvas.view.zoom})`;
  } else if (canvasPointer.mode === "item") {
    const moveItems = canvasPointer.groupItems?.length ? canvasPointer.groupItems : [{ id: canvasPointer.id, x: canvasPointer.itemX, y: canvasPointer.itemY }];
    moveItems.forEach((snapshot) => {
      const item = findCanvasItem(snapshot.id);
      if (!item) return;
      item.x = Math.round(snapshot.x + dx / canvas.view.zoom);
      item.y = Math.round(snapshot.y + dy / canvas.view.zoom);
      const element = refs.canvasWorld.querySelector(`[data-item-id="${CSS.escape(snapshot.id)}"]`);
      if (element) {
        element.style.left = `${item.x}px`;
        element.style.top = `${item.y}px`;
      }
    });
    renderCanvasConnectionsOnly(canvas);
  } else if (canvasPointer.mode === "resize") {
    const item = findCanvasItem(canvasPointer.id);
    if (!item) return;
    const minSize = item.type === "text" ? { width: 180, height: 110 } : { width: 220, height: 160 };
    item.width = Math.max(minSize.width, Math.round(canvasPointer.width + dx / canvasPointer.zoom));
    item.height = Math.max(minSize.height, Math.round(canvasPointer.height + dy / canvasPointer.zoom));
    const element = refs.canvasWorld.querySelector(`[data-item-id="${CSS.escape(canvasPointer.id)}"]`);
    if (element) {
      element.style.width = `${item.width}px`;
      if (item.type === "video") {
        element.style.height = `${item.height}px`;
      } else {
        element.style.minHeight = `${item.height}px`;
      }
    }
    renderCanvasConnectionsOnly(canvas);
  } else if (canvasPointer.mode === "connect") {
    const target = getConnectionTargetFromPoint(event.clientX, event.clientY, canvasPointer.id);
    setConnectionDraftTarget(target?.dataset.itemId || null);
    if (target) {
      const fromItem = findCanvasItem(canvasPointer.id);
      const toItem = findCanvasItem(target.dataset.itemId);
      if (fromItem && toItem) {
        const targetSide = getNearestCanvasItemSide(toItem, getCanvasPoint(event.clientX, event.clientY));
        updateDraftConnection(getCanvasItemAnchor(fromItem, canvasPointer.fromSide || "right"), getCanvasItemAnchor(toItem, targetSide));
      }
    } else {
      updateDraftConnection(canvasPointer.start, getCanvasPoint(event.clientX, event.clientY));
    }
  } else if (canvasPointer.mode === "select") {
    canvasPointer.current = { x: event.clientX, y: event.clientY };
    canvasPointer.canvasCurrent = getCanvasPoint(event.clientX, event.clientY);
    updateCanvasSelectionBox(canvasPointer.start, canvasPointer.current);
    selectCanvasItemsInRect(getCanvasRectFromPoints(canvasPointer.canvasStart, canvasPointer.canvasCurrent), canvas);
  }
  markCanvasSaved();
  persist();
}

function stopCanvasPointer(event) {
  if (canvasPointer?.mode === "connect") {
    finishCanvasConnection(event);
  }
  if (canvasPointer?.mode === "select") {
    hideCanvasSelectionBox();
  }
  canvasPointer = null;
  setConnectionDraftTarget(null);
  refs.canvasWorld.querySelectorAll(".canvas-item.is-moving").forEach((item) => item.classList.remove("is-moving"));
  refs.canvasWorld.querySelectorAll(".canvas-item.is-resizing").forEach((item) => item.classList.remove("is-resizing"));
  refs.canvasWorld.querySelectorAll(".canvas-item.is-connecting").forEach((item) => item.classList.remove("is-connecting"));
  updateDraftConnection(null);
  if (document.activeElement?.closest?.(".canvas-item")) {
    document.activeElement.blur();
  }
}

function finishCanvasConnection(event) {
  const task = findTask(activeCanvasTaskId);
  if (!task || !event) return;
  const canvas = ensureTaskCanvas(task);
  const targetCard = getConnectionTargetFromPoint(event.clientX, event.clientY, canvasPointer.id);
  const toId = targetCard?.dataset.itemId;
  if (!toId || toId === canvasPointer.id) return;
  pendingConnection = {
    fromId: canvasPointer.id,
    toId,
    fromSide: canvasPointer.fromSide || "right",
    toSide: getNearestCanvasItemSide(findCanvasItemInCanvas(canvas, toId), getCanvasPoint(event.clientX, event.clientY)),
    clientX: event.clientX,
    clientY: event.clientY
  };
  showConnectionTypePicker(event.clientX, event.clientY);
}

function updateCanvasSelectionBox(start, end) {
  const rect = getCanvasRectFromPoints(start, end);
  const bounds = refs.infiniteCanvas.getBoundingClientRect();
  refs.canvasSelectionBox.hidden = false;
  refs.canvasSelectionBox.style.left = `${rect.x - bounds.left}px`;
  refs.canvasSelectionBox.style.top = `${rect.y - bounds.top}px`;
  refs.canvasSelectionBox.style.width = `${rect.width}px`;
  refs.canvasSelectionBox.style.height = `${rect.height}px`;
}

function hideCanvasSelectionBox() {
  refs.canvasSelectionBox.hidden = true;
  refs.canvasSelectionBox.removeAttribute("style");
}

function getCanvasRectFromPoints(start, end) {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  return {
    x,
    y,
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y)
  };
}

function selectCanvasItemsInRect(rect, canvas) {
  selectedCanvasItemIds = new Set(
    canvas.items
      .filter((item) => rectsIntersect(rect, { x: item.x, y: item.y, width: item.width, height: item.height }))
      .map((item) => item.id)
  );
  selectedCanvasItemId = selectedCanvasItemIds.size === 1 ? Array.from(selectedCanvasItemIds)[0] : null;
  selectedConnectionId = null;
  updateSelectedConnectionClass();
  updateSelectedCanvasItemClass();
}

function rectsIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function getSelectedCanvasItemsSnapshot() {
  const task = findTask(activeCanvasTaskId);
  if (!task || !selectedCanvasItemIds.size) return [];
  return ensureTaskCanvas(task).items
    .filter((item) => selectedCanvasItemIds.has(item.id))
    .map((item) => ({ id: item.id, x: item.x, y: item.y }));
}

function updateDraftConnection(from, to = null, type = "related") {
  const draft = refs.canvasWorld.querySelector("[data-draft-connection]");
  if (!draft) return;
  if (!from || !to) {
    draft.setAttribute("hidden", "");
    draft.removeAttribute("d");
    return;
  }
  draft.removeAttribute("hidden");
  draft.setAttribute("d", getConnectionPath(from, to));
  draft.setAttribute("class", `connection-line connection-draft type-${type}`);
}

function getConnectionTargetFromPoint(clientX, clientY, fromId) {
  const element = document.elementFromPoint(clientX, clientY);
  return element?.closest?.(".canvas-item:not(.is-connecting)")?.dataset.itemId === fromId
    ? null
    : element?.closest?.(".canvas-item:not(.is-connecting)") || null;
}

function setConnectionDraftTarget(itemId) {
  if (connectionDraftTargetId === itemId) return;
  connectionDraftTargetId = itemId;
  refs.canvasWorld.querySelectorAll(".canvas-item.is-connect-target").forEach((item) => {
    item.classList.toggle("is-connect-target", item.dataset.itemId === itemId);
  });
  if (itemId) {
    refs.canvasWorld.querySelector(`[data-item-id="${CSS.escape(itemId)}"]`)?.classList.add("is-connect-target");
  }
}

function getConnectionAnchors(fromItem, toItem) {
  const fromCenter = getCanvasItemAnchor(fromItem, "center");
  const toCenter = getCanvasItemAnchor(toItem, "center");
  const horizontal = Math.abs(toCenter.x - fromCenter.x) >= Math.abs(toCenter.y - fromCenter.y);
  if (horizontal) {
    return toCenter.x >= fromCenter.x
      ? { from: getCanvasItemAnchor(fromItem, "right"), to: getCanvasItemAnchor(toItem, "left") }
      : { from: getCanvasItemAnchor(fromItem, "left"), to: getCanvasItemAnchor(toItem, "right") };
  }
  return toCenter.y >= fromCenter.y
    ? { from: getCanvasItemAnchor(fromItem, "bottom"), to: getCanvasItemAnchor(toItem, "top") }
    : { from: getCanvasItemAnchor(fromItem, "top"), to: getCanvasItemAnchor(toItem, "bottom") };
}

function getNearestCanvasItemSide(item, point) {
  const distances = [
    { side: "left", value: Math.abs(point.x - item.x) },
    { side: "right", value: Math.abs(point.x - (item.x + item.width)) },
    { side: "top", value: Math.abs(point.y - item.y) },
    { side: "bottom", value: Math.abs(point.y - (item.y + item.height)) }
  ];
  return distances.sort((a, b) => a.value - b.value)[0].side;
}

function getCanvasItemAnchor(item, side) {
  const centerX = item.x + item.width / 2;
  const centerY = item.y + item.height / 2;
  if (side === "center") return { x: centerX, y: centerY, side };
  if (side === "left") return { x: item.x, y: centerY, side };
  if (side === "right") return { x: item.x + item.width, y: centerY, side };
  if (side === "top") return { x: centerX, y: item.y, side };
  if (side === "bottom") return { x: centerX, y: item.y + item.height, side };
  return {
    x: centerX,
    y: centerY,
    side: "center"
  };
}

function getConnectionPath(from, to) {
  const padding = getConnectionPadding(from, to);
  const start = offsetPointBySide(from, padding);
  const end = offsetPointBySide(to, padding);
  const points = simplifyPolyline([
    from,
    start,
    ...getOrthogonalBridgePoints(start, end),
    end,
    to
  ]);
  return getRoundedPolylinePath(points, Math.min(16, Math.max(8, padding * 0.5)));
}

function getConnectionPadding(from, to) {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const distance = Math.hypot(dx, dy);
  const sameAxis = isHorizontalSide(from.side) === isHorizontalSide(to.side);
  const base = sameAxis ? Math.min(dx, dy || dx) : Math.min(dx || dy, dy || dx);
  return Math.max(14, Math.min(42, distance * 0.18, base * 0.45 || 42));
}

function offsetPointBySide(point, distance) {
  const direction = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    top: { x: 0, y: -1 },
    bottom: { x: 0, y: 1 },
    center: { x: 0, y: 0 }
  }[point.side || "center"];
  return {
    x: point.x + direction.x * distance,
    y: point.y + direction.y * distance,
    side: point.side
  };
}

function getOrthogonalBridgePoints(start, end) {
  const startHorizontal = isHorizontalSide(start.side);
  const endHorizontal = isHorizontalSide(end.side);
  const closeX = Math.abs(end.x - start.x) < 36;
  const closeY = Math.abs(end.y - start.y) < 36;
  if (startHorizontal && endHorizontal && closeX) {
    return [{ x: start.x, y: end.y }];
  }
  if (!startHorizontal && !endHorizontal && closeY) {
    return [{ x: end.x, y: start.y }];
  }
  if (startHorizontal && endHorizontal) {
    const midX = (start.x + end.x) / 2;
    return [{ x: midX, y: start.y }, { x: midX, y: end.y }];
  }
  if (!startHorizontal && !endHorizontal) {
    const midY = (start.y + end.y) / 2;
    return [{ x: start.x, y: midY }, { x: end.x, y: midY }];
  }
  return [{ x: end.x, y: start.y }];
}

function isHorizontalSide(side) {
  return side === "left" || side === "right";
}

function simplifyPolyline(points) {
  const uniquePoints = points.filter((point, index, list) => {
    const prev = list[index - 1];
    return !prev || prev.x !== point.x || prev.y !== point.y;
  });
  return uniquePoints.filter((point, index, list) => {
    const prev = list[index - 1];
    const next = list[index + 1];
    if (!prev || !next) return true;
    const sameVertical = prev.x === point.x && point.x === next.x;
    const sameHorizontal = prev.y === point.y && point.y === next.y;
    return !sameVertical && !sameHorizontal;
  });
}

function getRoundedPolylinePath(points, radius) {
  if (points.length < 2) return "";
  const commands = [`M ${points[0].x} ${points[0].y}`];
  for (let index = 1; index < points.length - 1; index += 1) {
    const prev = points[index - 1];
    const current = points[index];
    const next = points[index + 1];
    const prevDistance = Math.hypot(current.x - prev.x, current.y - prev.y);
    const nextDistance = Math.hypot(next.x - current.x, next.y - current.y);
    const cornerRadius = Math.min(radius, prevDistance / 2, nextDistance / 2);
    if (!cornerRadius) {
      commands.push(`L ${current.x} ${current.y}`);
      continue;
    }
    const before = moveToward(current, prev, cornerRadius);
    const after = moveToward(current, next, cornerRadius);
    commands.push(`L ${before.x} ${before.y}`);
    commands.push(`Q ${current.x} ${current.y} ${after.x} ${after.y}`);
  }
  const last = points[points.length - 1];
  commands.push(`L ${last.x} ${last.y}`);
  return commands.join(" ");
}

function moveToward(from, to, distance) {
  const total = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  return {
    x: from.x + ((to.x - from.x) / total) * distance,
    y: from.y + ((to.y - from.y) / total) * distance
  };
}

function findCanvasItemInCanvas(canvas, itemId) {
  return canvas.items.find((item) => item.id === itemId);
}

function getConnectionLabel(type) {
  return {
    related: "",
    sequence: "",
    cause: "",
    child: ""
  }[type] || "";
}

function showConnectionTypePicker(clientX, clientY) {
  const rect = refs.infiniteCanvas.getBoundingClientRect();
  refs.connectionTypePicker.style.left = `${Math.min(rect.width - 250, Math.max(12, clientX - rect.left + 12))}px`;
  refs.connectionTypePicker.style.top = `${Math.min(rect.height - 148, Math.max(12, clientY - rect.top + 12))}px`;
  refs.connectionTypePicker.hidden = false;
}

function hideConnectionTypePicker() {
  refs.connectionTypePicker.hidden = true;
  pendingConnection = null;
}

function choosePendingConnectionType(event) {
  const button = event.target.closest("[data-type]");
  if (!button || !pendingConnection) return;
  const task = findTask(activeCanvasTaskId);
  if (!task) return;
  const canvas = ensureTaskCanvas(task);
  const type = button.dataset.type;
  const exists = canvas.connections.some(
    (connection) => connection.fromId === pendingConnection.fromId && connection.toId === pendingConnection.toId && connection.type === type
  );
  if (exists) {
    toast("这条连线已经存在");
    hideConnectionTypePicker();
    return;
  }
  const connection = {
    id: crypto.randomUUID(),
    fromId: pendingConnection.fromId,
    toId: pendingConnection.toId,
    fromSide: pendingConnection.fromSide,
    toSide: pendingConnection.toSide,
    type,
    label: getConnectionLabel(type)
  };
  canvas.connections.push(connection);
  selectedConnectionId = connection.id;
  hideConnectionTypePicker();
  saveCanvasAndRender("连线已创建");
}

function startConnectionLabelEdit(connectionId, clientX, clientY) {
  const task = findTask(activeCanvasTaskId);
  if (!task) return;
  const connection = ensureTaskCanvas(task).connections.find((item) => item.id === connectionId);
  if (!connection) return;
  const rect = refs.infiniteCanvas.getBoundingClientRect();
  refs.connectionLabelEditor.dataset.connectionId = connectionId;
  refs.connectionLabelEditor.value = connection.label || "";
  refs.connectionLabelEditor.style.left = `${Math.min(rect.width - 220, Math.max(12, clientX - rect.left - 80))}px`;
  refs.connectionLabelEditor.style.top = `${Math.min(rect.height - 48, Math.max(12, clientY - rect.top - 18))}px`;
  refs.connectionLabelEditor.hidden = false;
  refs.connectionLabelEditor.focus();
  refs.connectionLabelEditor.select();
}

function handleConnectionLabelKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    saveConnectionLabelEdit();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    hideConnectionLabelEditor(false);
  }
}

function saveConnectionLabelEdit() {
  if (refs.connectionLabelEditor.hidden) return;
  const task = findTask(activeCanvasTaskId);
  const connectionId = refs.connectionLabelEditor.dataset.connectionId;
  const connection = task ? ensureTaskCanvas(task).connections.find((item) => item.id === connectionId) : null;
  if (connection) {
    connection.label = refs.connectionLabelEditor.value.trim();
    persist();
    renderCanvasConnectionsOnly(ensureTaskCanvas(task));
  }
  hideConnectionLabelEditor(false);
}

function hideConnectionLabelEditor(save = true) {
  if (save) saveConnectionLabelEdit();
  refs.connectionLabelEditor.hidden = true;
  refs.connectionLabelEditor.dataset.connectionId = "";
}

function handleCanvasKeydown(event) {
  if (!refs.canvasModal.classList.contains("is-open")) return;
  if (isTypingTarget(event.target)) return;
  if (event.key !== "Delete" && event.key !== "Backspace") return;
  if (selectedConnectionId) {
    event.preventDefault();
    deleteSelectedConnection();
    return;
  }
  if (selectedCanvasItemIds.size) {
    event.preventDefault();
    deleteSelectedCanvasItem();
  }
}

function isTypingTarget(target) {
  return Boolean(target?.closest?.("input, textarea, [contenteditable='true']"));
}

function deleteSelectedConnection() {
  const task = findTask(activeCanvasTaskId);
  if (!task || !selectedConnectionId) return;
  const canvas = ensureTaskCanvas(task);
  canvas.connections = canvas.connections.filter((connection) => connection.id !== selectedConnectionId);
  selectedConnectionId = null;
  saveCanvasAndRender("连线已删除");
}

function updateSelectedConnectionClass() {
  refs.canvasWorld.querySelectorAll("[data-connection-id]").forEach((connection) => {
    connection.classList.toggle("is-selected", connection.dataset.connectionId === selectedConnectionId);
  });
}

function selectCanvasItem(itemId) {
  selectedCanvasItemId = itemId;
  selectedCanvasItemIds = new Set([itemId]);
  selectedConnectionId = null;
  updateSelectedConnectionClass();
  updateSelectedCanvasItemClass();
}

function deleteSelectedCanvasItem() {
  const task = findTask(activeCanvasTaskId);
  if (!task || !selectedCanvasItemIds.size) return;
  const canvas = ensureTaskCanvas(task);
  const deletedIds = new Set(selectedCanvasItemIds);
  canvas.items = canvas.items.filter((item) => !deletedIds.has(item.id));
  canvas.connections = canvas.connections.filter(
    (connection) => !deletedIds.has(connection.fromId) && !deletedIds.has(connection.toId)
  );
  selectedCanvasItemId = null;
  selectedCanvasItemIds = new Set();
  saveCanvasAndRender(deletedIds.size > 1 ? "卡片已批量删除" : "卡片已删除");
}

function updateSelectedCanvasItemClass() {
  refs.canvasWorld.querySelectorAll(".canvas-item").forEach((item) => {
    item.classList.toggle("is-selected", selectedCanvasItemIds.has(item.dataset.itemId));
  });
}

function toggleConnectMode() {
  connectMode = !connectMode;
  const task = findTask(activeCanvasTaskId);
  if (task) syncConnectionControls(ensureTaskCanvas(task));
  toast(connectMode ? "关系线辅助已开启" : "关系线辅助已关闭");
}

function syncConnectionControls(canvas) {
  refs.toggleConnectMode.classList.toggle("is-active", connectMode);
  refs.toggleConnectMode.textContent = connectMode ? "选择节点" : "关系线";
  refs.toggleConnectMode.title = "从卡片四边圆点拖到另一张卡片即可创建关系线";
  refs.canvasWorld.classList.toggle("is-connect-mode", connectMode);
}

function addCanvasItem(type) {
  const task = findTask(activeCanvasTaskId);
  if (!task) return;
  const canvas = ensureTaskCanvas(task);
  let content = type === "text" ? "写下一个想法" : "";

  canvas.items.push({
    id: crypto.randomUUID(),
    type,
    content,
    muted: type === "video" ? true : undefined,
    x: Math.round((120 - canvas.view.x) / canvas.view.zoom),
    y: Math.round((90 - canvas.view.y) / canvas.view.zoom),
    width: type === "text" ? 260 : 340,
    height: type === "text" ? 140 : 220
  });
  saveCanvasAndRender("已添加到画布");
}

function handleImageInputChange(event) {
  const [file] = Array.from(event.target.files || []);
  if (!file) return;
  addMediaFileToCanvas(file);
  event.target.value = "";
}

function handleVideoInputChange(event) {
  const [file] = Array.from(event.target.files || []);
  if (!file) return;
  addMediaFileToCanvas(file);
  event.target.value = "";
}

function handleCanvasDragOver(event) {
  if (!hasMediaFile(event.dataTransfer)) return;
  event.preventDefault();
  refs.infiniteCanvas.classList.add("is-dragging-file");
}

function handleCanvasDragLeave(event) {
  if (refs.infiniteCanvas.contains(event.relatedTarget)) return;
  refs.infiniteCanvas.classList.remove("is-dragging-file");
}

function handleCanvasDrop(event) {
  if (!hasMediaFile(event.dataTransfer)) return;
  event.preventDefault();
  refs.infiniteCanvas.classList.remove("is-dragging-file");
  Array.from(event.dataTransfer.files)
    .filter((file) => isSupportedMediaFile(file))
    .forEach((file, index) => addMediaFileToCanvas(file, event, index));
}

function hasMediaFile(dataTransfer) {
  return Array.from(dataTransfer?.items || []).some(
    (item) => item.kind === "file" && (item.type.startsWith("image/") || item.type.startsWith("video/"))
  );
}

function isSupportedMediaFile(file) {
  return file.type.startsWith("image/") || file.type.startsWith("video/");
}

function addMediaFileToCanvas(file, event = null, offsetIndex = 0) {
  if (!isSupportedMediaFile(file)) {
    toast("请拖入图片或视频文件");
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const task = findTask(activeCanvasTaskId);
    if (!task) return;
    const canvas = ensureTaskCanvas(task);
    const point = event ? getCanvasPoint(event.clientX, event.clientY) : getCanvasPointFromOffset(130, 110);
    const isVideo = file.type.startsWith("video/");
    canvas.items.push({
      id: crypto.randomUUID(),
      type: isVideo ? "video" : "image",
      content: reader.result,
      muted: isVideo ? true : undefined,
      x: point.x + offsetIndex * 24,
      y: point.y + offsetIndex * 24,
      width: isVideo ? 420 : 360,
      height: isVideo ? 280 : 240
    });
    saveCanvasAndRender(isVideo ? "视频已添加到画布" : "图片已添加到画布");
  });
  reader.readAsDataURL(file);
}

function getCanvasPoint(clientX, clientY) {
  const task = findTask(activeCanvasTaskId);
  const canvas = ensureTaskCanvas(task);
  const rect = refs.infiniteCanvas.getBoundingClientRect();
  return {
    x: Math.round((clientX - rect.left - rect.width / 2 - canvas.view.x) / canvas.view.zoom),
    y: Math.round((clientY - rect.top - rect.height / 2 - canvas.view.y) / canvas.view.zoom)
  };
}

function getCanvasPointFromOffset(x, y) {
  const task = findTask(activeCanvasTaskId);
  const canvas = ensureTaskCanvas(task);
  return {
    x: Math.round((x - canvas.view.x) / canvas.view.zoom),
    y: Math.round((y - canvas.view.y) / canvas.view.zoom)
  };
}

function resetCanvasView() {
  const task = findTask(activeCanvasTaskId);
  if (!task) return;
  const canvas = ensureTaskCanvas(task);
  canvas.view = { x: 0, y: 0, zoom: 1 };
  saveCanvasAndRender("已回到中心");
}

function zoomCanvas(delta) {
  const task = findTask(activeCanvasTaskId);
  if (!task) return;
  const canvas = ensureTaskCanvas(task);
  canvas.view.zoom = Math.min(1.6, Math.max(0.5, Number((canvas.view.zoom + delta).toFixed(2))));
  saveCanvasAndRender();
}

function toggleCanvasMute() {
  const task = findTask(activeCanvasTaskId);
  if (!task) return;
  const canvas = ensureTaskCanvas(task);
  canvas.muted = canvas.muted === false;
  refs.canvasWorld.querySelectorAll("video").forEach((video) => {
    video.muted = canvas.muted !== false;
  });
  syncCanvasMuteButton(canvas);
  persist();
  toast(canvas.muted !== false ? "画布视频已静音" : "画布视频已取消静音");
}

function syncCanvasMuteButton(canvas) {
  const isMuted = canvas.muted !== false;
  refs.canvasMuteAll.classList.toggle("is-muted", isMuted);
  refs.canvasMuteAll.innerHTML = getVolumeIcon(isMuted);
  refs.canvasMuteAll.setAttribute("aria-label", isMuted ? "取消全局静音" : "全局静音");
  refs.canvasMuteAll.title = isMuted ? "取消全局静音" : "全局静音";
}

function handleCanvasWheel(event) {
  const task = findTask(activeCanvasTaskId);
  if (!task) return;
  event.preventDefault();
  const canvas = ensureTaskCanvas(task);
  const oldZoom = canvas.view.zoom;
  const nextZoom = Math.min(1.8, Math.max(0.35, Number((oldZoom + (event.deltaY > 0 ? -0.08 : 0.08)).toFixed(2))));
  if (nextZoom === oldZoom) return;

  const rect = refs.infiniteCanvas.getBoundingClientRect();
  const pointerX = event.clientX - rect.left - rect.width / 2;
  const pointerY = event.clientY - rect.top - rect.height / 2;
  const worldX = (pointerX - canvas.view.x) / oldZoom;
  const worldY = (pointerY - canvas.view.y) / oldZoom;

  canvas.view.zoom = nextZoom;
  canvas.view.x = Math.round(pointerX - worldX * nextZoom);
  canvas.view.y = Math.round(pointerY - worldY * nextZoom);
  refs.canvasWorld.style.transform = `translate(${canvas.view.x}px, ${canvas.view.y}px) scale(${canvas.view.zoom})`;
  refs.canvasZoomLabel.textContent = `${Math.round(canvas.view.zoom * 100)}%`;
  markCanvasSaved();
  persist();
}

function saveCanvasAndRender(message = "") {
  markCanvasSaved();
  persist();
  renderCanvas();
  if (message) toast(message);
}

function markCanvasSaved() {
  refs.canvasSaveState.textContent = "已自动保存";
}

function ensureTaskCanvas(task) {
  if (!task.canvas || !Array.isArray(task.canvas.items)) {
    task.canvas = createEmptyCanvas();
  }
  if (!task.canvas.view) {
    task.canvas.view = { x: 0, y: 0, zoom: 1 };
  }
  if (!Array.isArray(task.canvas.connections)) {
    task.canvas.connections = [];
  }
  if (typeof task.canvas.muted !== "boolean") {
    task.canvas.muted = true;
  }
  return task.canvas;
}

function createEmptyCanvas() {
  return {
    view: { x: 0, y: 0, zoom: 1 },
    muted: true,
    connections: [],
    items: []
  };
}

function findCanvasItem(itemId) {
  const task = findTask(activeCanvasTaskId);
  return task?.canvas?.items?.find((item) => item.id === itemId);
}

function normalizeVideoUrl(url) {
  const value = url.trim();
  const youtubeMatch = value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  const bilibiliMatch = value.match(/bilibili\.com\/video\/([^/?#]+)/);
  if (bilibiliMatch) return `https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}`;
  return removeAutoplayParam(value);
}

function getVolumeIcon(isMuted) {
  return isMuted
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.1l4.4 3.4V6.1L7.1 9.5H4Z"/><path d="m16.2 9.2 3.6 3.6m0-3.6-3.6 3.6"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.1l4.4 3.4V6.1L7.1 9.5H4Z"/><path d="M15.3 8.4a5 5 0 0 1 0 7.2M17.8 6a8.4 8.4 0 0 1 0 12"/></svg>`;
}

function getFullscreenIcon(isFullscreen) {
  return isFullscreen
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H5v4M15 4h4v4M9 20H5v-4M15 20h4v-4"/><path d="M9 9 5 5M15 9l4-4M9 15l-4 4M15 15l4 4"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"/><path d="M4 4l6 6M20 4l-6 6M4 20l6-6M20 20l-6-6"/></svg>`;
}

function isDirectVideoUrl(url) {
  return url.startsWith("data:video/") || /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function removeAutoplayParam(url) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("autoplay");
    parsed.searchParams.delete("autoPlay");
    return parsed.toString();
  } catch (_) {
    return url.replace(/([?&])autoplay=1(&?)/i, (match, prefix, suffix) => (prefix === "?" && suffix ? "?" : prefix === "?" ? "" : suffix ? "&" : ""));
  }
}

function bindChoiceGroups() {
  refs.choiceGroups.forEach((group) => {
    const target = byId(group.dataset.choiceFor);
    group.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        target.value = button.dataset.value;
        syncChoiceGroups();
      });
    });
  });
}

function syncChoiceGroups() {
  refs.choiceGroups.forEach((group) => {
    const target = byId(group.dataset.choiceFor);
    group.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.value === target.value);
    });
  });
}

function addSubtaskField(item = { title: "", done: false }) {
  const row = document.createElement("div");
  row.className = "subtask-field";
  row.innerHTML = `
    <input type="checkbox" ${item.done ? "checked" : ""} aria-label="子任务完成状态" />
    <input type="text" value="${escapeHTML(item.title)}" placeholder="输入子任务" />
    <button class="mini-action" type="button" aria-label="删除子任务">×</button>
  `;
  row.querySelector("button").addEventListener("click", () => row.remove());
  refs.subtaskFields.appendChild(row);
}

function saveTaskFromForm(event) {
  event.preventDefault();
  const id = refs.taskId.value;
  const existingTask = id ? findTask(id) : null;
  const tags = refs.taskTags.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean);
  const subtasks = Array.from(refs.subtaskFields.querySelectorAll(".subtask-field"))
    .map((row) => ({
      id: crypto.randomUUID(),
      done: row.querySelector("input[type='checkbox']").checked,
      title: row.querySelector("input[type='text']").value.trim()
    }))
    .filter((item) => item.title);

  const payload = {
    title: refs.taskTitle.value.trim(),
    description: refs.taskDescription.value.trim(),
    priority: refs.taskPriority.value,
    status: refs.taskStatus.value,
    dueDate: refs.taskDueDate.value,
    repeat: refs.taskRepeat.value,
    tags: tags.length ? tags : ["未分类"],
    pinned: refs.taskPinned.checked,
    canvas: existingTask?.canvas || createEmptyCanvas(),
    subtasks
  };

  if (id) {
    const wasDoneBefore = existingTask.status === "done";
    if (payload.status === "done" && !wasDoneBefore) {
      Object.assign(existingTask, { ...payload, status: "todo" });
      completeTask(existingTask);
    } else {
      Object.assign(existingTask, payload);
    }
    toast("任务已更新");
  } else {
    const newTask = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      order: getNextOrder(),
      ...payload,
      status: payload.status === "done" ? "todo" : payload.status
    };
    state.tasks.unshift(newTask);
    if (payload.status === "done") completeTask(newTask);
    toast("任务已创建");
  }

  closeTaskModal();
  render();
}

function deleteCurrentTask() {
  const id = refs.taskId.value;
  if (!id) return;
  state.tasks = state.tasks.filter((task) => task.id !== id);
  closeTaskModal();
  toast("任务已删除");
  render();
}

function clearCompleted() {
  const before = state.tasks.length;
  state.tasks = state.tasks.filter((task) => task.status !== "done");
  toast(`已清理 ${before - state.tasks.length} 个完成任务`);
  render();
}

function reorderTasks(sourceId, targetId) {
  const tasks = [...state.tasks].sort((a, b) => a.order - b.order);
  const sourceIndex = tasks.findIndex((task) => task.id === sourceId);
  const targetIndex = tasks.findIndex((task) => task.id === targetId);
  const [source] = tasks.splice(sourceIndex, 1);
  tasks.splice(targetIndex, 0, source);
  tasks.forEach((task, index) => (task.order = index + 1));
  state.tasks = tasks;
  filters.sort = "manual";
  syncCustomMenus();
  render();
}

function bindCustomMenus() {
  refs.customSelects.forEach((select) => {
    const toggle = select.querySelector(".custom-select-button");
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const willOpen = !select.classList.contains("is-open");
      closeCustomMenus();
      select.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
    });

    select.querySelectorAll(".custom-select-menu button").forEach((option) => {
      option.addEventListener("click", () => {
        if (option.dataset.priorityValue) filters.priority = option.dataset.priorityValue;
        if (option.dataset.sortValue) filters.sort = option.dataset.sortValue;
        closeCustomMenus();
        render();
      });
    });
  });

  document.addEventListener("click", closeCustomMenus);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCustomMenus();
  });
}

function closeCustomMenus() {
  refs.customSelects.forEach((select) => {
    select.classList.remove("is-open");
    select.querySelector(".custom-select-button").setAttribute("aria-expanded", "false");
  });
}

function syncCustomMenus() {
  const priorityLabels = {
    all: "全部优先级",
    high: "高优先级",
    medium: "中优先级",
    low: "低优先级"
  };
  const sortLabels = {
    smart: "智能排序",
    priority: "按优先级",
    due: "按截止时间",
    created: "按创建时间",
    manual: "手动排序"
  };

  refs.priorityMenuLabel.textContent = priorityLabels[filters.priority];
  refs.sortMenuLabel.textContent = sortLabels[filters.sort];
  document.querySelectorAll("[data-priority-value]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.priorityValue === filters.priority);
  });
  document.querySelectorAll("[data-sort-value]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.sortValue === filters.sort);
  });
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  document.body.classList.toggle("dark", state.theme === "dark");
  render();
}

function moveCalendarMonth(step) {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + step, 1);
  renderCalendar();
}

function jumpCalendarToToday() {
  calendarCursor = new Date(today.getFullYear(), today.getMonth(), 1);
  selectCalendarDate(isoToday);
}

function selectCalendarDate(isoDate) {
  selectedCalendarDate = isoDate;
  const target = parseISODate(isoDate);
  calendarCursor = new Date(target.getFullYear(), target.getMonth(), 1);
  filters.view = "date";
  filters.tag = "all";
  filters.status = "all";
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("is-active"));
  document.querySelectorAll(".segment").forEach((item) => item.classList.toggle("is-active", item.dataset.status === "all"));
  render();
  document.querySelector(".task-column")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getCalendarDayInfo(isoDate) {
  const date = parseISODate(isoDate);
  const override = holidayMap[isoDate];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  if (override?.type === "work") {
    return {
      name: override.name,
      label: override.name,
      type: "work",
      isRest: false,
      isWorkday: true,
      description: `${override.name} · 调休上班日`
    };
  }

  if (override) {
    return {
      name: override.name,
      label: override.name,
      type: override.type,
      isRest: true,
      isWorkday: false,
      description: `${override.name} · 休息日`
    };
  }

  if (isWeekend) {
    return {
      name: "周末",
      label: "",
      type: "weekend",
      isRest: true,
      isWorkday: false,
      description: "周末 · 休息日"
    };
  }

  return {
    name: "",
    label: "",
    type: "weekday",
    isRest: false,
    isWorkday: true,
    description: "工作日"
  };
}

function findTask(id) {
  return state.tasks.find((task) => task.id === id);
}

function getNextOrder() {
  return Math.max(0, ...state.tasks.map((task) => task.order)) + 1;
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && Array.isArray(stored.tasks)) {
      stored.tasks = stored.tasks.map((task) => ({
        repeat: "none",
        subtasks: [],
        tags: ["未分类"],
        ...task,
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
        tags: Array.isArray(task.tags) ? task.tags : ["未分类"],
        canvas: task.canvas && Array.isArray(task.canvas.items) ? task.canvas : createEmptyCanvas()
      }));
      if (!Array.isArray(stored.completionHistory)) stored.completionHistory = [];
      document.body.classList.toggle("dark", stored.theme === "dark");
      return stored;
    }
  } catch (_) {}
  return { tasks: sampleTasks, completionHistory: [], theme: "light" };
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function byId(id) {
  return document.getElementById(id);
}

function toISODate(date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getWeekStart(date) {
  const start = new Date(date);
  const day = (start.getDay() + 6) % 7;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - day);
  return start;
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatFullDate(value) {
  const date = parseISODate(value);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
}

function parseISODate(value) {
  return new Date(`${value}T00:00:00`);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => refs.toast.classList.remove("show"), 1800);
}
