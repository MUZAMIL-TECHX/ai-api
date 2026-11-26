/* =========================================================
   Llama AI Chat — Frontend
   Endpoint: /ai?q=text  (same origin, proxy to upstream)
   ========================================================= */

const ENDPOINT = '/ai';

const chatEl   = document.getElementById('chat');
const formEl   = document.getElementById('form');
const inputEl  = document.getElementById('input');
const sendBtn  = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');

/* ── Add message bubble ── */
function addMessage(role, text) {
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + (role === 'user' ? 'user' : 'bot');

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  wrap.appendChild(bubble);
  chatEl.appendChild(wrap);
  chatEl.scrollTop = chatEl.scrollHeight;
  return bubble;
}

/* ── Call proxy ── */
async function askLlama(text) {
  const url = ENDPOINT + '?q=' + encodeURIComponent(text);

  const res = await fetch(url, { method: 'GET' });

  if (!res.ok) throw new Error('HTTP ' + res.status);

  const data = await res.json();

  // aapka format: { creator, Team, Contect, Reponse }
  const answer = data.Reponse || data.response || data.answer || '';
  if (!answer) throw new Error('Empty response from server');
  return answer;
}

/* ── Submit handler ── */
formEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = '';
  sendBtn.disabled = true;

  addMessage('user', text);

  const typing = addMessage('bot', 'Thinking');
  typing.classList.add('typing');

  try {
    const answer = await askLlama(text);
    typing.classList.remove('typing');
    typing.textContent = answer;
  } catch (err) {
    typing.classList.remove('typing');
    typing.textContent = '❌ Error: ' + err.message;
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
    chatEl.scrollTop = chatEl.scrollHeight;
  }
});

/* ── Clear chat ── */
clearBtn.addEventListener('click', () => {
  chatEl.innerHTML = `
    <div class="msg bot">
      <div class="bubble">Salam! Kuch poocho 👋<br><small>Try: <code>Hello bhai</code></small></div>
    </div>`;
});

/* ── Focus input on load ── */
inputEl.focus();
