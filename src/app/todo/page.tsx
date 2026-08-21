"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Type definitions                                                    */
/* ------------------------------------------------------------------ */
type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "todo-app-tasks-v1";

/* ------------------------------------------------------------------ */
/*  Utility: generate a unique id                                       */
/* ------------------------------------------------------------------ */
function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/*  Load initial tasks from localStorage (lazy initializer)            */
/*  Runs lazily on mount inside useState, avoiding setState-in-effect   */
/* ------------------------------------------------------------------ */
function loadInitialTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (t): t is Task =>
          t && typeof t.text === "string" && typeof t.completed === "boolean",
      );
    }
  } catch {
    /* corrupted data — start fresh */
  }
  return [];
}

export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>(loadInitialTasks);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  /* ----- persist to localStorage whenever tasks change ----- */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      /* storage unavailable — fail silently */
    }
  }, [tasks]);

  /* ----- keep editing input focused while editing ----- */
  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  /* ----- handlers ----- */
  const addTask = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setTasks((prev) => [
      { id: createId(), text, completed: false, createdAt: Date.now() },
      ...prev,
    ]);
    setInput("");
    inputRef.current?.focus();
  }, [input]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  const startEditing = useCallback((task: Task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  }, []);

  const saveEdit = useCallback(() => {
    const text = editingText.trim();
    if (editingId) {
      if (text) {
        setTasks((prev) =>
          prev.map((t) => (t.id === editingId ? { ...t, text } : t)),
        );
      }
      setEditingId(null);
      setEditingText("");
    }
  }, [editingId, editingText]);

  /* ----- derived data ----- */
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "active":
        return tasks.filter((t) => !t.completed);
      case "completed":
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const activeCount = useMemo(
    () => tasks.filter((t) => !t.completed).length,
    [tasks],
  );

  const completedCount = tasks.length - activeCount;

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "全部", count: tasks.length },
    { key: "active", label: "進行中", count: activeCount },
    { key: "completed", label: "已完成", count: completedCount },
  ];

  /* ----- render helpers ----- */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addTask();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") {
      setEditingId(null);
      setEditingText("");
    }
  };

  return (
    <main
      className="flex min-h-screen w-full items-start justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-sky-100 px-4 py-10 sm:py-16"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      <div className="w-full max-w-xl rounded-3xl bg-white/90 shadow-xl shadow-indigo-200/50 backdrop-blur-sm ring-1 ring-white/60 transition-all duration-300">
        {/* ---------- Header ---------- */}
        <header className="border-b border-slate-100 px-6 py-6 sm:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            ✅ To-Do List
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            管理你嘅購物清單同待辦事項 — 資料自動儲存喺你嘅裝置
          </p>

          {/* ---------- Add form ---------- */}
          <div className="mt-5 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="輸入新任務…"
              aria-label="新增任務"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
            />
            <button
              onClick={addTask}
              disabled={!input.trim()}
              aria-label="新增任務"
              className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-md shadow-indigo-300/50 transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-300/50 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              ＋ 新增
            </button>
          </div>
        </header>

        {/* ---------- Filter tabs ---------- */}
        <nav
          className="flex gap-2 border-b border-slate-100 px-6 py-3 sm:px-8"
          aria-label="任務篩選"
        >
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                filter === f.key
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-300/40"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
              <span
                className={`ml-1.5 rounded-full px-1.5 text-xs ${
                  filter === f.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </nav>

        {/* ---------- Task list ---------- */}
        <ul className="max-h-[55vh] divide-y divide-slate-100 overflow-y-auto px-4 py-2 sm:px-6">
          {filteredTasks.length === 0 && (
            <li className="flex flex-col items-center gap-3 py-14 text-center text-slate-400">
              <span className="text-5xl">🗒️</span>
              <div>
                <p className="font-medium text-slate-500">
                  {tasks.length === 0 ? "未有任務" : "呢個分類冇任務"}
                </p>
                <p className="mt-1 text-sm">
                  {tasks.length === 0
                    ? "喺上面輸入內容，然後按「＋ 新增」開始吧！"
                    : "試吓轉另一個分類睇睇"}
                </p>
              </div>
            </li>
          )}

          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className="group flex items-center gap-3 py-3 transition-all duration-200"
            >
              {/* ---------- Checkbox ---------- */}
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                aria-label={`標記「${task.text}」為${task.completed ? "未完成" : "完成"}`}
                className="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 accent-indigo-600 transition-all"
              />

              {/* ---------- Task body (edit or view) ---------- */}
              {editingId === task.id ? (
                <input
                  ref={editRef}
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={saveEdit}
                  aria-label="編輯任務內容"
                  className="flex-1 rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-slate-800 outline-none ring-2 ring-indigo-100"
                />
              ) : (
                <span
                  onClick={() => startEditing(task)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") startEditing(task);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`編輯「${task.text}」`}
                  className={`flex-1 cursor-text px-1 font-medium transition-colors ${
                    task.completed
                      ? "text-slate-400 line-through decoration-slate-300"
                      : "text-slate-700 hover:text-indigo-700"
                  }`}
                >
                  {task.text}
                </span>
              )}

              {/* ---------- Delete button ---------- */}
              <button
                onClick={() => deleteTask(task.id)}
                aria-label={`刪除「${task.text}」`}
                className="shrink-0 rounded-lg p-2 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-500 active:scale-90 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        {/* ---------- Footer stats ---------- */}
        <footer className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm text-slate-500 sm:px-8">
          <span>
            {activeCount > 0
              ? `剩餘 ${activeCount} 項待完成`
              : tasks.length > 0
                ? "全部完成！🎉"
                : "開始加入任務吧"}
          </span>
          {completedCount > 0 && (
            <button
              onClick={() =>
                setTasks((prev) => prev.filter((t) => !t.completed))
              }
              className="rounded-lg px-3 py-1.5 font-medium text-rose-500 transition-all hover:bg-rose-50 active:scale-95"
            >
              清除已完成 ({completedCount})
            </button>
          )}
        </footer>
      </div>
    </main>
  );
}
