const request = window.indexedDB.open('myDatabase', 1);
let db;

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  if (!db.objectStoreNames.contains('tableName')) {
    db.createObjectStore('tableName');
  }
};

request.onsuccess = function(event) {
  db = event.target.result;
  console.log('Соединение с базой данных установлено');
  updateTable();
};

request.onerror = function(event) {
  console.error('Ошибка соединения с базой данных:', event.target.errorCode);
};

function updateTable() {
  const tableBody = document.querySelector('#myTable tbody');

  tableBody.innerHTML = '';

  const transaction = db.transaction(['tableName'], 'readonly');
  const objectStore = transaction.objectStore('tableName');
  const request = objectStore.openCursor();

  request.onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      const row = document.createElement('tr');
      const keyCell = document.createElement('td');
      const valueCell = document.createElement('td');
      const editCell = document.createElement('td');
      const deleteCell = document.createElement('td');

      keyCell.textContent = cursor.key;
      valueCell.textContent = cursor.value;

      const editLink = document.createElement('span');
      const deleteLink = document.createElement('span');

      editLink.className = 'action';
      editLink.textContent = 'Изменить';
      editLink.onclick = function() {
        updateItem(cursor.key);
      };

      deleteLink.className = 'action';
      deleteLink.textContent = 'Удалить';
      deleteLink.onclick = function() {
        deleteItem(cursor.key);
      };

      editCell.appendChild(editLink);
      deleteCell.appendChild(deleteLink);

      row.appendChild(keyCell);
      row.appendChild(valueCell);
      row.appendChild(editCell);
      row.appendChild(deleteCell);

      tableBody.appendChild(row);

      cursor.continue();
    }
  };

  transaction.onerror = function(event) {
    console.error('Ошибка чтения данных:', event.target.errorCode);
  };
}

function saveItem() {
  const keyInput = document.querySelector('#key');
  const valueInput = document.querySelector('#value');

  const transaction = db.transaction(['tableName'], 'readwrite');
  const objectStore = transaction.objectStore('tableName');
  const request = objectStore.add(valueInput.value, keyInput.value);

  request.onsuccess = function(event) {
    alert('Запись успешно добавлена');
    keyInput.value = '';
    valueInput.value = '';
    updateTable();
  };

  request.onerror = function(event) {
    alert('Ошибка добавления записи');
    console.error('Ошибка добавления записи:', event.target.errorCode);
  };
}

function updateItem(key) {
  const newValue = prompt('Введите новое значение:');
  const transaction = db.transaction(['tableName'], 'readwrite');
  const objectStore = transaction.objectStore('tableName');
  const request = objectStore.put(newValue, key);

  request.onsuccess = function(event) {
    alert('Запись успешно изменена');
    updateTable();
  };

  request.onerror = function(event) {
    alert('Ошибка изменения записи');
    console.error('Ошибка изменения записи:', event.target.errorCode);
  };
}

function deleteItem(key) {
  const confirmDelete = confirm('Вы уверены, что хотите удалить запись?');
  if (!confirmDelete) return;

  const transaction = db.transaction(['tableName'], 'readwrite');
  const objectStore = transaction.objectStore('tableName');
  const request = objectStore.delete(key);

  request.onsuccess = function(event) {
    alert('Запись успешно удалена');
    updateTable();
  };

  request.onerror = function(event) {
    alert('Ошибка удаления записи');
    console.error('Ошибка удаления записи:', event.target.errorCode);
  };
}
