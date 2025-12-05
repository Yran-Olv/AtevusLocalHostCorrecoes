import React, { useState, useEffect, useRef } from 'react';
import { format, isPast, isToday, isTomorrow, addDays, addWeeks, addMonths } from 'date-fns';
import './ToDoList.css';
import './todo-theme.css';

const PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

const REPEAT_OPTIONS = {
  NEVER: 'never',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

const FILTERS = {
  ALL: 'all',
  PENDING: 'pending',
  COMPLETED: 'completed',
  HIGH_PRIORITY: 'high',
  MEDIUM_PRIORITY: 'medium',
  LOW_PRIORITY: 'low'
};

const ToDoList = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [notifications, setNotifications] = useState([]);
  const notificationTimeoutRef = useRef({});

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: PRIORITIES.MEDIUM,
    category: '',
    repeat: REPEAT_OPTIONS.NEVER
  });

  // Carregar tarefas do localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map(task => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
      }
    }
  }, []);

  // Salvar tarefas no localStorage
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('todoTasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Verificar lembretes e mostrar notificações
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');

      tasks.forEach((task, index) => {
        if (task.completed || !task.dueDate) return;

        const taskDate = format(task.dueDate, 'yyyy-MM-dd');
        const taskTime = task.dueTime || '00:00';
        const isDueNow = isToday(task.dueDate) && taskTime === currentTime;
        const isOverdue = isPast(task.dueDate) && !isToday(task.dueDate);
        const isDueSoon = isToday(task.dueDate) && taskTime !== currentTime;

        // Notificar se está vencendo agora
        if (isDueNow && !notificationTimeoutRef.current[`due-${index}`]) {
          showNotification({
            title: 'Lembrete: ' + task.title,
            message: task.description || 'Esta tarefa está vencendo agora!',
            priority: task.priority,
            taskId: index
          });
          notificationTimeoutRef.current[`due-${index}`] = true;
        }

        // Notificar se está vencida
        if (isOverdue && !notificationTimeoutRef.current[`overdue-${index}`]) {
          showNotification({
            title: '⚠️ Tarefa Vencida: ' + task.title,
            message: 'Esta tarefa está atrasada!',
            priority: PRIORITIES.HIGH,
            taskId: index
          });
          notificationTimeoutRef.current[`overdue-${index}`] = true;
        }

        // Notificar se vence hoje (15 minutos antes)
        if (isDueSoon && task.dueTime) {
          const [hours, minutes] = task.dueTime.split(':');
          const taskDateTime = new Date(task.dueDate);
          taskDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
          const reminderTime = new Date(taskDateTime.getTime() - 15 * 60000);
          
          if (format(reminderTime, 'HH:mm') === currentTime && 
              !notificationTimeoutRef.current[`reminder-${index}`]) {
            showNotification({
              title: '⏰ Lembrete em 15min: ' + task.title,
              message: `Esta tarefa vence às ${task.dueTime}`,
              priority: task.priority,
              taskId: index
            });
            notificationTimeoutRef.current[`reminder-${index}`] = true;
          }
        }
      });
    };

    // Verificar a cada minuto
    const interval = setInterval(checkReminders, 60000);
    checkReminders(); // Verificar imediatamente

    return () => clearInterval(interval);
  }, [tasks]);

  const showNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Remover após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const closeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAddTask = () => {
    if (!formData.title.trim()) {
      showNotification({
        title: 'Erro',
        message: 'O título da tarefa é obrigatório',
        priority: PRIORITIES.HIGH
      });
      return;
    }

    const now = new Date();
    let dueDate = null;

    if (formData.dueDate) {
      dueDate = new Date(formData.dueDate);
      if (formData.dueTime) {
        const [hours, minutes] = formData.dueTime.split(':');
        dueDate.setHours(parseInt(hours), parseInt(minutes), 0);
      }
    }

    const newTask = {
      id: editingIndex >= 0 ? tasks[editingIndex].id : Date.now(),
      title: formData.title,
      description: formData.description,
      dueDate,
      dueTime: formData.dueTime || null,
      priority: formData.priority,
      category: formData.category,
      repeat: formData.repeat,
      completed: false,
      createdAt: editingIndex >= 0 ? tasks[editingIndex].createdAt : now,
      updatedAt: now
    };

    if (editingIndex >= 0) {
      const newTasks = [...tasks];
      newTasks[editingIndex] = newTask;
      setTasks(newTasks);
      showNotification({
        title: 'Tarefa atualizada',
        message: 'A tarefa foi atualizada com sucesso',
        priority: PRIORITIES.LOW
      });
    } else {
      setTasks([newTask, ...tasks]);
      showNotification({
        title: 'Tarefa criada',
        message: 'Nova tarefa adicionada com sucesso',
        priority: PRIORITIES.LOW
      });
    }

    resetForm();
    setModalOpen(false);
  };

  const handleEditTask = (index) => {
    const task = tasks[index];
    setFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '',
      dueTime: task.dueTime || '',
      priority: task.priority,
      category: task.category || '',
      repeat: task.repeat || REPEAT_OPTIONS.NEVER
    });
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleDeleteTask = (index) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      const newTasks = tasks.filter((_, i) => i !== index);
      setTasks(newTasks);
      showNotification({
        title: 'Tarefa excluída',
        message: 'A tarefa foi removida',
        priority: PRIORITIES.LOW
      });
    }
  };

  const handleToggleComplete = (index) => {
    const newTasks = [...tasks];
    const task = newTasks[index];
    task.completed = !task.completed;
    task.updatedAt = new Date();

    // Se completou e tem repetição, criar próxima ocorrência
    if (task.completed && task.repeat !== REPEAT_OPTIONS.NEVER) {
      let nextDueDate = null;
      if (task.dueDate) {
        switch (task.repeat) {
          case REPEAT_OPTIONS.DAILY:
            nextDueDate = addDays(task.dueDate, 1);
            break;
          case REPEAT_OPTIONS.WEEKLY:
            nextDueDate = addWeeks(task.dueDate, 1);
            break;
          case REPEAT_OPTIONS.MONTHLY:
            nextDueDate = addMonths(task.dueDate, 1);
            break;
        }
      }

      if (nextDueDate) {
        const nextTask = {
          ...task,
          id: Date.now(),
          completed: false,
          dueDate: nextDueDate,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        newTasks.splice(index + 1, 0, nextTask);
      }
    }

    setTasks(newTasks);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      dueTime: '',
      priority: PRIORITIES.MEDIUM,
      category: '',
      repeat: REPEAT_OPTIONS.NEVER
    });
    setEditingIndex(-1);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    resetForm();
  };

  // Filtrar e buscar tarefas
  const filteredTasks = tasks.filter(task => {
    // Filtro
    if (filter === FILTERS.PENDING && task.completed) return false;
    if (filter === FILTERS.COMPLETED && !task.completed) return false;
    if (filter === FILTERS.HIGH_PRIORITY && task.priority !== PRIORITIES.HIGH) return false;
    if (filter === FILTERS.MEDIUM_PRIORITY && task.priority !== PRIORITIES.MEDIUM) return false;
    if (filter === FILTERS.LOW_PRIORITY && task.priority !== PRIORITIES.LOW) return false;

    // Busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(search) ||
        (task.description && task.description.toLowerCase().includes(search)) ||
        (task.category && task.category.toLowerCase().includes(search))
      );
    }

    return true;
  });

  const formatTaskDate = (date, time) => {
    if (!date) return null;
    
    const taskDate = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':');
      taskDate.setHours(parseInt(hours), parseInt(minutes), 0);
    }

    if (isPast(taskDate) && !isToday(taskDate)) {
      return { text: `Vencida em ${format(taskDate, 'dd/MM/yyyy')}`, class: 'overdue' };
    }
    if (isToday(taskDate)) {
      return { text: `Hoje${time ? ` às ${time}` : ''}`, class: time ? 'due-soon' : '' };
    }
    if (isTomorrow(taskDate)) {
      return { text: `Amanhã${time ? ` às ${time}` : ''}`, class: 'due-soon' };
    }
    return { text: format(taskDate, "dd/MM/yyyy") + (time ? ` às ${time}` : ''), class: '' };
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      [PRIORITIES.HIGH]: 'Alta',
      [PRIORITIES.MEDIUM]: 'Média',
      [PRIORITIES.LOW]: 'Baixa'
    };
    return labels[priority] || 'Média';
  };

  const getRepeatLabel = (repeat) => {
    const labels = {
      [REPEAT_OPTIONS.NEVER]: 'Nunca',
      [REPEAT_OPTIONS.DAILY]: 'Diária',
      [REPEAT_OPTIONS.WEEKLY]: 'Semanal',
      [REPEAT_OPTIONS.MONTHLY]: 'Mensal'
    };
    return labels[repeat] || 'Nunca';
  };

  return (
    <div className="todo-container">
      {/* Notificações */}
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`todo-notification priority-${notification.priority}`}
        >
          <div className="todo-notification-header">
            <h4 className="todo-notification-title">{notification.title}</h4>
            <button
              className="todo-notification-close"
              onClick={() => closeNotification(notification.id)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <p className="todo-notification-message">{notification.message}</p>
        </div>
      ))}

      {/* Header */}
      <div className="todo-header">
        <h1 className="todo-header-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          Lembretes
        </h1>
        <div className="todo-header-actions">
          <button
            className="todo-btn-primary"
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="todo-filters">
        <div className="todo-search">
          <input
            type="text"
            className="todo-search-input"
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="todo-filter-buttons">
          <button
            className={`todo-filter-btn ${filter === FILTERS.ALL ? 'active' : ''}`}
            onClick={() => setFilter(FILTERS.ALL)}
          >
            Todas
          </button>
          <button
            className={`todo-filter-btn ${filter === FILTERS.PENDING ? 'active' : ''}`}
            onClick={() => setFilter(FILTERS.PENDING)}
          >
            Pendentes
          </button>
          <button
            className={`todo-filter-btn ${filter === FILTERS.COMPLETED ? 'active' : ''}`}
            onClick={() => setFilter(FILTERS.COMPLETED)}
          >
            Concluídas
          </button>
          <button
            className={`todo-filter-btn ${filter === FILTERS.HIGH_PRIORITY ? 'active' : ''}`}
            onClick={() => setFilter(FILTERS.HIGH_PRIORITY)}
          >
            Alta Prioridade
          </button>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="todo-list">
        {filteredTasks.length === 0 ? (
          <div className="todo-empty">
            <div className="todo-empty-icon">📝</div>
            <p className="todo-empty-text">
              {searchTerm ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa ainda. Crie uma nova tarefa!'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task, index) => {
            const originalIndex = tasks.findIndex(t => t.id === task.id);
            const dateInfo = formatTaskDate(task.dueDate, task.dueTime);
            
            return (
              <div
                key={task.id}
                className={`todo-item ${task.completed ? 'completed' : ''}`}
              >
                <input
                  type="checkbox"
                  className="todo-checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(originalIndex)}
                />
                <div className="todo-item-content">
                  <div className="todo-item-header">
                    <h3 className="todo-item-title">{task.title}</h3>
                    <span className={`todo-priority-badge todo-priority-${task.priority}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                  {task.description && (
                    <p className="todo-item-description">{task.description}</p>
                  )}
                  <div className="todo-item-meta">
                    {dateInfo && (
                      <div className={`todo-item-date ${dateInfo.class}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
                        {dateInfo.text}
                      </div>
                    )}
                    {task.category && (
                      <div className="todo-item-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-3.37-6.16z"/>
                        </svg>
                        {task.category}
                      </div>
                    )}
                    {task.repeat !== REPEAT_OPTIONS.NEVER && (
                      <div className="todo-item-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                        </svg>
                        {getRepeatLabel(task.repeat)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="todo-item-actions">
                  <button
                    className="todo-icon-btn"
                    onClick={() => handleEditTask(originalIndex)}
                    title="Editar"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                  <button
                    className="todo-icon-btn"
                    onClick={() => handleDeleteTask(originalIndex)}
                    title="Excluir"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="todo-modal-overlay" onClick={handleCloseModal}>
          <div className="todo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="todo-modal-header">
              <h2 className="todo-modal-title">
                {editingIndex >= 0 ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h2>
              <button className="todo-icon-btn" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="todo-form-group">
              <label className="todo-form-label">Título *</label>
              <input
                type="text"
                className="todo-form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Digite o título da tarefa"
              />
            </div>

            <div className="todo-form-group">
              <label className="todo-form-label">Descrição</label>
              <textarea
                className="todo-form-textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Adicione uma descrição (opcional)"
              />
            </div>

            <div className="todo-form-row">
              <div className="todo-form-group">
                <label className="todo-form-label">Data de Vencimento</label>
                <input
                  type="date"
                  className="todo-form-input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div className="todo-form-group">
                <label className="todo-form-label">Hora</label>
                <input
                  type="time"
                  className="todo-form-input"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                />
              </div>
            </div>

            <div className="todo-form-row">
              <div className="todo-form-group">
                <label className="todo-form-label">Prioridade</label>
                <select
                  className="todo-form-input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value={PRIORITIES.LOW}>Baixa</option>
                  <option value={PRIORITIES.MEDIUM}>Média</option>
                  <option value={PRIORITIES.HIGH}>Alta</option>
                </select>
              </div>
              <div className="todo-form-group">
                <label className="todo-form-label">Repetir</label>
                <select
                  className="todo-form-input"
                  value={formData.repeat}
                  onChange={(e) => setFormData({ ...formData, repeat: e.target.value })}
                >
                  <option value={REPEAT_OPTIONS.NEVER}>Nunca</option>
                  <option value={REPEAT_OPTIONS.DAILY}>Diária</option>
                  <option value={REPEAT_OPTIONS.WEEKLY}>Semanal</option>
                  <option value={REPEAT_OPTIONS.MONTHLY}>Mensal</option>
                </select>
              </div>
            </div>

            <div className="todo-form-group">
              <label className="todo-form-label">Categoria</label>
              <input
                type="text"
                className="todo-form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Trabalho, Pessoal, Compras..."
              />
            </div>

            <div className="todo-form-actions">
              <button className="todo-btn-secondary" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className="todo-btn-primary" onClick={handleAddTask}>
                {editingIndex >= 0 ? 'Salvar' : 'Criar Tarefa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToDoList;
