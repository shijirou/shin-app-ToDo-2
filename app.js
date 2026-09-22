const STORAGE_KEY = 'trello-mock-board';

/** @type {{lists: Array<{id:string,name:string}>, cards: Array<{id:string,listId:string,content:string,order:number}>}} */
let state = loadState();

const boardEl = document.getElementById('board');
const addListBtn = document.getElementById('add-list-btn');

const addCardModal = document.getElementById('add-card-modal');
const addCardListSelect = document.getElementById('add-card-list-select');
const addCardContent = document.getElementById('add-card-content');
const addCardError = document.getElementById('add-card-error');
const addCardSubmit = document.getElementById('add-card-submit');

const editCardModal = document.getElementById('edit-card-modal');
const editCardContent = document.getElementById('edit-card-content');
const editCardError = document.getElementById('edit-card-error');
const editCardSave = document.getElementById('edit-card-save');
const editCardDelete = document.getElementById('edit-card-delete');
let editingCardId = null;

let draggingCardId = null;

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // 壊れたデータの場合は初期化
    }
  }
  return {
    lists: [
      { id: uid(), name: 'ToDo' },
      { id: uid(), name: '進行中' },
      { id: uid(), name: '完了' }
    ],
    cards: []
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function render() {
  // 既存のリスト要素を削除(add-listボタンは残す)
  boardEl.querySelectorAll('.list').forEach((el) => el.remove());

  state.lists.forEach((list) => {
    const listEl = buildListEl(list);
    boardEl.insertBefore(listEl, document.querySelector('.add-list'));
  });

  // カード追加モーダルのリスト選択肢を更新
  addCardListSelect.innerHTML = '';
  state.lists.forEach((list) => {
    const opt = document.createElement('option');
    opt.value = list.id;
    opt.textContent = list.name;
    addCardListSelect.appendChild(opt);
  });
}

function buildListEl(list) {
  const listEl = document.createElement('div');
  listEl.className = 'list';
  listEl.dataset.listId = list.id;

  const header = document.createElement('div');
  header.className = 'list-header';

  const title = document.createElement('input');
  title.className = 'list-title';
  title.value = list.name;
  title.addEventListener('change', () => {
    const name = title.value.trim();
    if (!name) {
      title.value = list.name;
      return;
    }
    list.name = name;
    saveState();
    render();
  });

  const menuWrap = document.createElement('div');
  menuWrap.style.position = 'relative';

  const menuBtn = document.createElement('button');
  menuBtn.className = 'list-menu-btn';
  menuBtn.textContent = '…';
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllListMenus();
    const menu = buildListMenu(list);
    menuWrap.appendChild(menu);
  });

  menuWrap.appendChild(menuBtn);
  header.appendChild(title);
  header.appendChild(menuWrap);
  listEl.appendChild(header);

  const cardsEl = document.createElement('div');
  cardsEl.className = 'cards';
  cardsEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    listEl.classList.add('drag-over');
  });
  cardsEl.addEventListener('dragleave', () => {
    listEl.classList.remove('drag-over');
  });
  cardsEl.addEventListener('drop', (e) => {
    e.preventDefault();
    listEl.classList.remove('drag-over');
    handleDrop(list.id, e, cardsEl);
  });

  getCardsForList(list.id).forEach((card) => {
    cardsEl.appendChild(buildCardEl(card));
  });

  listEl.appendChild(cardsEl);

  const addCardBtn = document.createElement('button');
  addCardBtn.className = 'add-card-btn';
  addCardBtn.textContent = '+ カードを追加';
  addCardBtn.addEventListener('click', () => openAddCardModal(list.id));
  listEl.appendChild(addCardBtn);

  return listEl;
}

function buildListMenu(list) {
  const menu = document.createElement('div');
  menu.className = 'list-menu';

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'リストを削除';
  deleteBtn.addEventListener('click', () => {
    closeAllListMenus();
    const ok = confirm(`リスト「${list.name}」と中のカードをすべて削除しますか？`);
    if (!ok) return;
    state.lists = state.lists.filter((l) => l.id !== list.id);
    state.cards = state.cards.filter((c) => c.listId !== list.id);
    saveState();
    render();
  });

  menu.appendChild(deleteBtn);
  return menu;
}

function closeAllListMenus() {
  document.querySelectorAll('.list-menu').forEach((el) => el.remove());
}

document.addEventListener('click', closeAllListMenus);

function getCardsForList(listId) {
  return state.cards
    .filter((c) => c.listId === listId)
    .sort((a, b) => a.order - b.order);
}

function buildCardEl(card) {
  const el = document.createElement('div');
  el.className = 'card';
  el.textContent = card.content;
  el.draggable = true;
  el.dataset.cardId = card.id;

  el.addEventListener('dragstart', () => {
    draggingCardId = card.id;
    el.classList.add('dragging');
  });
  el.addEventListener('dragend', () => {
    draggingCardId = null;
    el.classList.remove('dragging');
  });
  el.addEventListener('click', () => openEditCardModal(card.id));

  return el;
}

function handleDrop(targetListId, event, cardsEl) {
  if (!draggingCardId) return;
  const card = state.cards.find((c) => c.id === draggingCardId);
  if (!card) return;

  // ドロップ位置を、マウス位置に一番近いカードの前後で決める
  const afterEl = getDragAfterElement(cardsEl, event.clientY);
  const targetCards = getCardsForList(targetListId).filter((c) => c.id !== card.id);

  let newOrder;
  if (!afterEl) {
    newOrder = targetCards.length ? targetCards[targetCards.length - 1].order + 1 : 0;
  } else {
    const afterCard = state.cards.find((c) => c.id === afterEl.dataset.cardId);
    newOrder = afterCard.order - 0.5;
  }

  card.listId = targetListId;
  card.order = newOrder;
  normalizeOrders(targetListId);
  saveState();
  render();
}

function getDragAfterElement(container, y) {
  const cards = [...container.querySelectorAll('.card:not(.dragging)')];
  return cards.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function normalizeOrders(listId) {
  getCardsForList(listId).forEach((card, i) => {
    card.order = i;
  });
}

// --- リスト追加 ---
addListBtn.addEventListener('click', () => {
  const name = prompt('リスト名を入力してください');
  if (name === null) return;
  const trimmed = name.trim();
  if (!trimmed) return;
  state.lists.push({ id: uid(), name: trimmed });
  saveState();
  render();
});

// --- カード追加モーダル ---
function openAddCardModal(listId) {
  addCardModal.hidden = false;
  addCardListSelect.value = listId;
  addCardContent.value = '';
  addCardError.hidden = true;
  addCardContent.focus();
}

addCardSubmit.addEventListener('click', () => {
  const content = addCardContent.value.trim();
  if (!content) {
    addCardError.hidden = false;
    return;
  }
  const listId = addCardListSelect.value;
  const order = getCardsForList(listId).length;
  state.cards.push({ id: uid(), listId, content, order });
  saveState();
  render();
  addCardModal.hidden = true;
});

// --- カード編集モーダル ---
function openEditCardModal(cardId) {
  const card = state.cards.find((c) => c.id === cardId);
  if (!card) return;
  editingCardId = cardId;
  editCardContent.value = card.content;
  editCardError.hidden = true;
  editCardModal.hidden = false;
  editCardContent.focus();
}

editCardSave.addEventListener('click', () => {
  const content = editCardContent.value.trim();
  if (!content) {
    editCardError.hidden = false;
    return;
  }
  const card = state.cards.find((c) => c.id === editingCardId);
  if (card) {
    card.content = content;
    saveState();
    render();
  }
  editCardModal.hidden = true;
});

editCardDelete.addEventListener('click', () => {
  const ok = confirm('このカードを削除しますか？');
  if (!ok) return;
  state.cards = state.cards.filter((c) => c.id !== editingCardId);
  saveState();
  render();
  editCardModal.hidden = true;
});

// --- モーダル共通の閉じる処理 ---
document.querySelectorAll('.modal-close').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.close).hidden = true;
  });
});

[addCardModal, editCardModal].forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.hidden = true;
  });
});

render();
