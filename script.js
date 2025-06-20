class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.filter = 'all';
        // Default to dark theme if no preference is set
        this.theme = localStorage.getItem('theme') || 'dark'; // Changed default to 'dark'
        this.initElements();
        this.bindEvents();
        this.applyTheme();
        this.render();
    }

    applyTheme() {
        // Default to dark mode if no theme is set
        if (this.theme === 'light' || (this.theme === null && window.matchMedia('(prefers-color-scheme: light)').matches)) {
            document.documentElement.classList.remove('dark');
            document.getElementById('sunIcon').classList.add('hidden');
            document.getElementById('moonIcon').classList.remove('hidden');
            this.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            document.getElementById('sunIcon').classList.remove('hidden');
            document.getElementById('moonIcon').classList.add('hidden');
            this.theme = 'dark';
        }
        localStorage.setItem('theme', this.theme);
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
    }

    initElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.todoCount = document.getElementById('todoCount');
        this.allBtn = document.getElementById('allBtn');
        this.activeBtn = document.getElementById('activeBtn');
        this.completedBtn = document.getElementById('completedBtn');
        this.clearBtn = document.getElementById('clearBtn');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        this.allBtn.addEventListener('click', () => this.setFilter('all'));
        this.activeBtn.addEventListener('click', () => this.setFilter('active'));
        this.completedBtn.addEventListener('click', () => this.setFilter('completed'));
        this.clearBtn.addEventListener('click', () => this.clearCompleted());
        
        // Add theme toggle event
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!('theme' in localStorage)) {
                this.theme = e.matches ? 'dark' : 'light';
                this.applyTheme();
            }
        });
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.save();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.save();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.save();
        this.render();
    }

    editTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            this.save();
            this.render();
        }
    }

    setFilter(filter) {
        this.filter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (filter === 'all') this.allBtn.classList.add('active');
        else if (filter === 'active') this.activeBtn.classList.add('active');
        else if (filter === 'completed') this.completedBtn.classList.add('active');
        
        this.render();
    }

    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.save();
        this.render();
    }

    getFilteredTodos() {
        switch (this.filter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    save() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = 'p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center group';
        li.dataset.id = todo.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'h-5 w-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800';
        checkbox.checked = todo.completed;
        checkbox.onchange = () => this.toggleTodo(todo.id);
        
        const span = document.createElement('span');
        span.className = 'ml-3 flex-1' + (todo.completed ? ' line-through text-gray-400' : ' text-gray-700 dark:text-gray-200');
        span.textContent = todo.text;
        span.ondblclick = (e) => {
            e.target.contentEditable = true;
            e.target.focus();
            e.target.classList.add('bg-yellow-50', 'dark:bg-yellow-900', 'px-2', 'py-1', 'rounded');
        };
        span.onblur = (e) => {
            e.target.contentEditable = false;
            e.target.classList.remove('bg-yellow-50', 'dark:bg-yellow-900', 'px-2', 'py-1', 'rounded');
            this.editTodo(todo.id, e.target.textContent);
        };
        span.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
            }
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'ml-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity';
        deleteBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>';
        deleteBtn.setAttribute('aria-label', 'Delete todo');
        deleteBtn.onclick = () => this.deleteTodo(todo.id);
        
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        
        return li;
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        const activeTodos = this.todos.filter(t => !t.completed);
        
        // Clear the todo list
        this.todoList.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            this.emptyState.classList.remove('hidden');
        } else {
            this.emptyState.classList.add('hidden');
            
            filteredTodos.forEach(todo => {
                const li = this.createTodoElement(todo);
                this.todoList.appendChild(li);
            });
        }
        
        if (this.todoCount) {
            this.todoCount.textContent = `${activeTodos.length} ${activeTodos.length === 1 ? 'item' : 'items'} left`;
        }
    }
}

// Wait for the DOM to be fully loaded before initializing the app
document.addEventListener('DOMContentLoaded', () => {
    const app = new TodoApp();
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .filter-btn {
            @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
        }
        .filter-btn.active {
            @apply bg-blue-500 text-white hover:bg-blue-600;
        }
    `;
    document.head.appendChild(style);
});