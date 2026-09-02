const STORAGE_KEY = "todo-app-tasks";

let tasks = loadTasks();
let currentFilter = "all";

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const filters = document.querySelector("#filters");
const clearCompletedButton = document.querySelector("#clear-completed");
const taskCount = document.querySelector("#task-count");

// -------------------------
// Local Storage
// -------------------------

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    console.error("Could not load tasks:", error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// -------------------------
// Create
// -------------------------

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();

  if (!text) {
    return;
  }

  const newTask = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: Date.now()
  };

  tasks.push(newTask);

  saveTasks();
  render();

  todoInput.value = "";
  todoInput.focus();
});

// -------------------------
// Read / Render
// -------------------------

function getFilteredTasks() {
  switch (currentFilter) {
    case "active":
      return tasks.filter((task) => !task.completed);

    case "completed":
      return tasks.filter((task) => task.completed);

    default:
      return tasks;
  }
}

function render() {
  const filteredTasks = getFilteredTasks();

  todoList.innerHTML = "";

  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";

    emptyMessage.textContent =
      currentFilter === "all"
        ? "No tasks yet. Add one above!"
        : `No ${currentFilter} tasks.`;

    todoList.appendChild(emptyMessage);
  } else {
    filteredTasks.forEach((task) => {
      todoList.appendChild(createTodoElement(task));
    });
  }

  updateTaskCount();
}

function createTodoElement(task) {
  const li = document.createElement("li");

  li.className = `todo-item ${task.completed ? "completed" : ""}`;
  li.dataset.id = task.id;

  // Checkbox
  const checkbox = document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.dataset.action = "toggle";
  checkbox.checked = task.completed;

  // Text
  const span = document.createElement("span");

  span.className = "todo-text";
  span.textContent = task.text;

  // Edit button
  const editButton = document.createElement("button");

  editButton.className = "edit-btn";
  editButton.dataset.action = "edit";
  editButton.textContent = "Edit";

  // Delete button
  const deleteButton = document.createElement("button");

  deleteButton.className = "delete-btn";
  deleteButton.dataset.action = "delete";
  deleteButton.textContent = "Delete";

  li.append(checkbox, span, editButton, deleteButton);

  return li;
}

// -------------------------
// Event Delegation
// -------------------------

todoList.addEventListener("click", (event) => {
  const action = event.target.dataset.action;

  if (!action) {
    return;
  }

  const todoItem = event.target.closest(".todo-item");

  if (!todoItem) {
    return;
  }

  const id = todoItem.dataset.id;

  switch (action) {
    case "edit":
      startEditing(id);
      break;

    case "delete":
      deleteTask(id);
      break;
  }
});

// Checkbox delegation
todoList.addEventListener("change", (event) => {
  if (event.target.dataset.action !== "toggle") {
    return;
  }

  const todoItem = event.target.closest(".todo-item");

  if (!todoItem) {
    return;
  }

  toggleTask(todoItem.dataset.id);
});

// -------------------------
// Update
// -------------------------

function toggleTask(id) {
  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return;
  }

  task.completed = !task.completed;

  saveTasks();
  render();
}

function startEditing(id) {
  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return;
  }

  const todoItem = todoList.querySelector(`[data-id="${id}"]`);

  if (!todoItem) {
    return;
  }

  const textElement = todoItem.querySelector(".todo-text");
  const editButton = todoItem.querySelector('[data-action="edit"]');

  const input = document.createElement("input");

  input.type = "text";
  input.className = "edit-input";
  input.value = task.text;

  textElement.replaceWith(input);

  editButton.textContent = "Save";
  editButton.dataset.action = "save";

  input.focus();
  input.select();
}

function saveEditedTask(id) {
  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return;
  }

  const todoItem = todoList.querySelector(`[data-id="${id}"]`);
  const input = todoItem.querySelector(".edit-input");

  const newText = input.value.trim();

  if (!newText) {
    return;
  }

  task.text = newText;

  saveTasks();
  render();
}

// Extend delegated handler for Save
todoList.addEventListener("click", (event) => {
  if (event.target.dataset.action !== "save") {
    return;
  }

  const todoItem = event.target.closest(".todo-item");

  if (!todoItem) {
    return;
  }

  saveEditedTask(todoItem.dataset.id);
});

// Save editing with Enter
todoList.addEventListener("keydown", (event) => {
  if (!event.target.classList.contains("edit-input")) {
    return;
  }

  if (event.key === "Enter") {
    const todoItem = event.target.closest(".todo-item");

    if (todoItem) {
      saveEditedTask(todoItem.dataset.id);
    }
  }

  if (event.key === "Escape") {
    render();
  }
});

// -------------------------
// Delete
// -------------------------

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();
  render();
}

// -------------------------
// Filtering
// -------------------------

filters.addEventListener("click", (event) => {
  const button = event.target.closest(".filter");

  if (!button) {
    return;
  }

  currentFilter = button.dataset.filter;

  document.querySelectorAll(".filter").forEach((filterButton) => {
    filterButton.classList.remove("active");
  });

  button.classList.add("active");

  render();
});

// -------------------------
// Clear Completed
// -------------------------

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);

  saveTasks();
  render();
});

// -------------------------
// Task Counter
// -------------------------

function updateTaskCount() {
  const remaining = tasks.filter((task) => !task.completed).length;

  taskCount.textContent =
    remaining === 1
      ? "1 task left"
      : `${remaining} tasks left`;
}

// Initial render
render();