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
  taskDueDate: byId("taskDueDate"),
  taskTags: byId("taskTags"),
  taskPinned: byId("taskPinned"),
  subtaskFields: byId("subtaskFields"),
  deleteTask: byId("deleteTask"),
  boardPreview: byId("boardPreview"),
  boardLanes: Array.from(document.querySelectorAll(".board-lane")),
  calendarGrid: byId("calendarGrid"),
  monthLabel: byId("monthLabel"),
  selectedDatePanel: byId("selectedDatePanel"),
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

  refs.boardLanes.forEach((lane) => {
    lane.addEventListener("mouseenter", () => renderBoardPreview(lane.dataset.boardStatus));
    lane.addEventListener("focus", () => renderBoardPreview(lane.dataset.boardStatus));
  });

  document.querySelector(".mini-board").addEventListener("mouseleave", () => renderBoardPreview());

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
  renderBoardPreview();
}

function renderStats() {
  const tasks = state.tasks;
  const active = tasks.filter((task) => task.status !== "done");
  const completed = tasks.filter((task) => task.status === "done");
  const todayTasks = active.filter((task) => task.dueDate === isoToday);
  const overdue = active.filter((task) => task.dueDate < isoToday);
  const high = active.filter((task) => task.priority === "high");
  const rate = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;

  byId("todayCount").textContent = todayTasks.length;
  byId("todayHint").textContent = todayTasks.length ? "今天别摊太满" : "今天很清爽";
  byId("highCount").textContent = high.length;
  byId("completionRate").textContent = `${rate}%`;
  byId("completedCount").textContent = `${completed.length} 个已完成`;
  byId("overdueCount").textContent = overdue.length;
  byId("todoLane").textContent = tasks.filter((task) => task.status === "todo").length;
  byId("doingLane").textContent = tasks.filter((task) => task.status === "doing").length;
  byId("doneLane").textContent = completed.length;
  renderStatPopover("todayPopover", "今日待办", todayTasks);
  renderStatPopover("highPopover", "高优先级", high);
  renderStatPopover("completedPopover", "已完成任务", completed);
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

function renderBoardPreview(status = "todo") {
  const statusTasks = getSmartSorted(state.tasks.filter((task) => task.status === status));
  const title = statusText[status] || "未开始";
  refs.boardLanes.forEach((lane) => {
    lane.classList.toggle("is-active", lane.dataset.boardStatus === status);
  });

  refs.boardPreview.innerHTML = `
    <div class="board-preview-head">
      <strong>${title}</strong>
      <span>${statusTasks.length} 个任务</span>
    </div>
    ${
      statusTasks.length
        ? `<ul>${statusTasks.slice(0, 4).map((task) => `<li><i class="preview-dot ${task.priority}"></i>${escapeHTML(task.title)}</li>`).join("")}</ul>`
        : `<p>当前没有${title}任务。</p>`
    }
  `;
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

  return `
    <article class="task-card priority-${task.priority} ${task.status === "done" ? "is-done" : ""}" draggable="true" data-id="${task.id}">
      <input class="task-check" type="checkbox" ${task.status === "done" ? "checked" : ""} aria-label="标记完成" />
      <div>
        <div class="task-title-row">
          <h3>${escapeHTML(task.title)}</h3>
          ${task.pinned ? `<span class="pin-badge">置顶</span>` : ""}
          <span class="priority-badge ${task.priority}">${priorityText[task.priority]}</span>
        </div>
        <p class="task-desc">${escapeHTML(task.description || "暂无描述")}</p>
        <div class="task-meta">
          <span class="status-badge">${statusText[task.status]}</span>
          <span class="due-badge">${dueText}</span>
          ${task.subtasks.length ? `<span class="due-badge">子任务 ${subtasksDone}/${task.subtasks.length}</span>` : ""}
        </div>
        <div class="task-tags">
          ${task.tags.map((tag) => `<span class="tag"># ${escapeHTML(tag)}</span>`).join("")}
        </div>
        ${task.subtasks.length ? `<div class="subtask-list">${task.subtasks.map((item) => `<span class="subtask-chip">${item.done ? "✓" : "○"} ${escapeHTML(item.title)}</span>`).join("")}</div>` : ""}
      </div>
      <div class="task-actions">
        <button class="mini-action edit-task" type="button" aria-label="编辑">✎</button>
        <button class="mini-action pin-task" type="button" aria-label="置顶">${task.pinned ? "⌃" : "⌄"}</button>
      </div>
    </article>
  `;
}

function bindTaskCard(card) {
  const taskId = card.dataset.id;
  card.querySelector(".task-check").addEventListener("change", (event) => {
    const task = findTask(taskId);
    task.status = event.target.checked ? "done" : "todo";
    if (task.status === "done") {
      task.subtasks.forEach((item) => (item.done = true));
    }
    toast(task.status === "done" ? "任务已完成" : "任务已恢复");
    render();
  });

  card.querySelector(".edit-task").addEventListener("click", () => openTaskModal(findTask(taskId)));
  card.querySelector(".pin-task").addEventListener("click", () => {
    const task = findTask(taskId);
    task.pinned = !task.pinned;
    render();
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
      </button>`;
  }).join("");
  renderSelectedDatePanel();
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
    refs.taskTags.value = task.tags.join(", ");
    refs.taskPinned.checked = task.pinned;
    task.subtasks.forEach((item) => addSubtaskField(item));
  } else {
    refs.taskId.value = "";
    refs.taskDueDate.value = isoToday;
    addSubtaskField();
  }

  refs.taskModal.classList.add("is-open");
  refs.taskModal.setAttribute("aria-hidden", "false");
  refs.taskTitle.focus();
}

function closeTaskModal() {
  refs.taskModal.classList.remove("is-open");
  refs.taskModal.setAttribute("aria-hidden", "true");
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
    tags: tags.length ? tags : ["未分类"],
    pinned: refs.taskPinned.checked,
    subtasks
  };

  if (id) {
    Object.assign(findTask(id), payload);
    toast("任务已更新");
  } else {
    state.tasks.unshift({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      order: getNextOrder(),
      ...payload
    });
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

function renderSelectedDatePanel() {
  const tasks = state.tasks.filter((task) => task.dueDate === selectedCalendarDate);
  const dayInfo = getCalendarDayInfo(selectedCalendarDate);
  refs.selectedDatePanel.innerHTML = `
    <div>
      <strong>${formatFullDate(selectedCalendarDate)}</strong>
      <span>${dayInfo.description} · ${tasks.length} 个任务</span>
    </div>
    ${
      tasks.length
        ? `<ul>${tasks.slice(0, 3).map((task) => `<li>${escapeHTML(task.title)}</li>`).join("")}</ul>`
        : `<p>这一天还没有安排任务。</p>`
    }
  `;
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
      document.body.classList.toggle("dark", stored.theme === "dark");
      return stored;
    }
  } catch (_) {}
  return { tasks: sampleTasks, theme: "light" };
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
