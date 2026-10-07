(() => {
  const $ = s => document.querySelector(s);
  let csrf = '';
  const message = (text, target = '#status') => ($(target).textContent = text);
  async function api(path, data) {
    const r = await fetch((window.HAODAO_CONFIG.apiBase || '/api/') + path, {
      method: data ? 'POST' : 'GET',
      credentials: 'include',
      headers: data ? { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf } : {},
      body: data ? JSON.stringify(data) : undefined,
    });
    const value = await r.json();
    if (!r.ok) throw new Error(value.error || '操作未完成，請稍後重試。');
    return value;
  }
  async function login() {
    try {
      $('#retry').hidden = true;
      $('#google-button').replaceChildren();
      const config = await api('auth/start', {});
      if (!window.google?.accounts?.id) throw new Error('Google 登入服務尚未載入，請稍後重試。');
      google.accounts.id.initialize({
        client_id: config.clientId,
        nonce: config.nonce,
        auto_select: false,
        callback: async response => {
          try {
            message('正在驗證登入…');
            await api('auth/google', { credential: response.credential });
            location.reload();
          } catch (e) {
            message(e.message);
            $('#retry').hidden = false;
          }
        },
      });
      google.accounts.id.renderButton($('#google-button'), {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        locale: 'zh_TW',
      });
    } catch (e) {
      message(e.message);
      $('#retry').hidden = false;
    }
  }
  async function users() {
    const data = await api('admin/users');
    $('#user-list').replaceChildren();
    for (const user of data.users) {
      const li = document.createElement('li'),
        label = document.createElement('span');
      label.textContent =
        user.email +
        ' · ' +
        (user.role === 'owner'
          ? '最高權限管理者'
          : user.has_logged_in
            ? '編輯者'
            : '編輯者（尚未登入）');
      li.append(label);
      if (user.role !== 'owner') {
        const button = document.createElement('button');
        button.className = 'pill';
        button.textContent = '移除';
        button.onclick = async () => {
          if (!confirm('移除 ' + user.email + ' 的登入與編輯權限？現有登入會立即失效。')) return;
          button.disabled = true;
          try {
            await api('admin/users', { action: 'remove', email: user.email });
            await users();
            message('已移除編輯者。', '#user-status');
          } catch (e) {
            message(e.message, '#user-status');
            button.disabled = false;
          }
        };
        li.append(button);
      }
      $('#user-list').append(li);
    }
  }
  async function init() {
    try {
      const s = await api('session');
      if (!s.authenticated || !s.user) {
        $('#login').hidden = false;
        message('請使用已獲授權的 Google 帳號登入。');
        await login();
        return;
      }
      csrf = s.csrf;
      $('#workspace').hidden = false;
      $('#identity').textContent =
        s.user.email + ' · ' + (s.user.role === 'owner' ? '最高權限管理者' : '編輯者');
      message('歡迎回來，請選擇要管理的內容。');
      if (s.user.role === 'owner') {
        $('#users').hidden = false;
        await users();
      }
      const kind = new URLSearchParams(location.search).get('section');
      if (['courses', 'community'].includes(kind))
        await window.HaodaoEvents.manage(kind, new URLSearchParams(location.search).has('archive'));
    } catch (e) {
      message(e.message);
    }
  }
  $('#retry').onclick = login;
  $('#logout').onclick = async () => {
    try {
      await api('logout', {});
      window.google?.accounts?.id?.disableAutoSelect();
      location.reload();
    } catch (e) {
      message(e.message);
    }
  };
  document
    .querySelectorAll('[data-kind]')
    .forEach(b => (b.onclick = () => window.HaodaoEvents.manage(b.dataset.kind)));
  $('#add-user').onsubmit = async e => {
    e.preventDefault();
    const b = e.target.querySelector('button');
    b.disabled = true;
    try {
      await api('admin/users', { action: 'add', email: $('#email').value });
      $('#email').value = '';
      await users();
      message('已新增編輯者，可使用該 Google 帳號登入。', '#user-status');
    } catch (error) {
      message(error.message, '#user-status');
    } finally {
      b.disabled = false;
    }
  };
  window.addEventListener('load', init);
})();
