// Yangi partiya qo'shish funksiyasi
async function addGame() {
  const data = {
    opponent: document.getElementById('opponent').value.trim(),
    opening: document.getElementById('opening').value.trim(),
    result: document.getElementById('result').value.trim(),
    moves: document.getElementById('moves').value.trim(),
    analysis: document.getElementById('analysis').value.trim(),
    date: new Date().toISOString().slice(0, 10) // YYYY-MM-DD formatida hozirgi sana
  };

  if (!data.opponent || !data.opening || !data.result) {
    alert('Iltimos, opponent, ochildi va natija maydonlarini to‘ldiring!');
    return;
  }

  const res = await fetch('http://localhost:3000/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    alert('Partiya qo‘shildi!');
    clearForm();
    loadGames();
  } else {
    alert('Xatolik yuz berdi, qayta urinib ko‘ring');
  }
}

// Formani tozalash
function clearForm() {
  document.getElementById('opponent').value = '';
  document.getElementById('opening').value = '';
  document.getElementById('result').value = '';
  document.getElementById('moves').value = '';
  document.getElementById('analysis').value = '';
  document.getElementById('game-details').classList.add('hidden'); // tafsilotni yashirish
}

// Partiyalar ro'yxatini yuklash va tugmalar yaratish
async function loadGames() {
  const res = await fetch('http://localhost:3000/games');
  const games = await res.json();

  const container = document.getElementById('games-list');
  container.innerHTML = '';

  games.forEach(game => {
    const btn = document.createElement('button');
    btn.className = 'game-button';

    // Tugma uchun asosiy ma'lumot
    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `
      <strong>${game.date}</strong> — <em>${game.opponent}</em> | Natija: <strong>${game.result}</strong> | Ochildi: ${game.opening}
    `;

    // O'chirish tugmasi
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'O‘chirish';
    deleteBtn.className = 'delete-btn';

    deleteBtn.onclick = async (e) => {
      e.stopPropagation(); // asosiy tugma klikini to'xtatamiz
      if (confirm(`Partiyani o'chirmoqchimisiz?\nRaqib: ${game.opponent}\nSanasi: ${game.date}`)) {
        await deleteGame(game.id);
      }
    };

    btn.appendChild(infoDiv);
    btn.appendChild(deleteBtn);

    // Tugma bosilganda tafsilotlarni ko'rsatish funksiyasi chaqiriladi
    btn.onclick = () => showGameDetails(game);

    container.appendChild(btn);
  });
}

// Tafsilotlarni ko'rsatish va yashirish funksiyasi
function showGameDetails(game) {
  const details = document.getElementById('game-details');

  if (details.dataset.currentGameId === String(game.id) && !details.classList.contains('hidden')) {
    // Agar shu partiya tafsilotlari ko'rsatilgan bo'lsa, yashir yoki ko'rsat
    details.classList.toggle('hidden');
  } else {
    // Yangi partiya tafsilotlarini ko'rsat
    details.classList.remove('hidden');
    details.dataset.currentGameId = String(game.id);

    details.innerHTML = `
      <h3>Raqib: ${game.opponent}</h3>
      <p><strong>Natija:</strong> ${game.result}</p>
      <p><strong>Ochildi:</strong> ${game.opening}</p>
      <p><strong>Yurishlar:</strong><br>${game.moves.replace(/\n/g, '<br>')}</p>
      <p><strong>Tahlil:</strong><br>${game.analysis.replace(/\n/g, '<br>')}</p>
      <p><small>Sanasi: ${game.date}</small></p>
    `;
  }
}

// O'chirish so'rovi
async function deleteGame(id) {
  const res = await fetch(`http://localhost:3000/games/${id}`, {
    method: 'DELETE',
  });

  if (res.ok) {
    alert('Partiya o‘chirildi');
    // Agar tafsilotlar shu o'yinga tegishli bo'lsa, yashirish
    const details = document.getElementById('game-details');
    if (details.dataset.currentGameId === String(id)) {
      details.classList.add('hidden');
      details.dataset.currentGameId = '';
    }
    loadGames();
  } else {
    alert('Partiyani o‘chirishda xatolik yuz berdi');
  }
}

// Sahifa yuklanganda partiyalarni yuklash
loadGames();
