import { escapeHtml } from '../lib/ui.js';

export function renderLoginScreen(error = '') {
  return `<main class="auth-screen"><section class="auth-card" aria-labelledby="authTitle">
    <div class="auth-brand"><span class="brand-name">essencial <b>by dani</b></span></div>
    <p class="eyebrow">Acesso administrativo</p>
    <h1 id="authTitle">Entrar no sistema</h1>
    <p class="auth-copy">Acesse a gestão de estoque da loja com sua conta de administradora.</p>
    <form class="auth-form" id="loginForm">
      <div class="auth-field"><label for="loginEmail">E-mail</label><input class="form-control" id="loginEmail" name="email" type="email" autocomplete="username" maxlength="254" placeholder="E-mail da administradora" required /></div>
      <div class="auth-field"><label for="loginPassword">Senha</label><input class="form-control" id="loginPassword" name="password" type="password" autocomplete="current-password" maxlength="128" placeholder="Digite sua senha" required /></div>
      <p class="auth-error" id="authError" role="alert" ${error ? '' : 'hidden'}>${escapeHtml(error)}</p>
      <button class="button button-primary auth-submit" type="submit">Entrar</button>
    </form>
    <p class="auth-foot">Área restrita à administradora da Essencial By Dani.</p>
  </section></main>`;
}
