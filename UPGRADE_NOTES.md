# Upgrade notes

## Current stack (target)

- **Ruby:** 4.0.3 (`/.ruby-version`)
- **Rails:** 8.0.x (see `Gemfile`)
- **Assets:** Sprockets (`sprockets-rails` + Tailwind v4 via `tailwindcss-rails`), manifest at `app/assets/config/manifest.js`
- **Server:** Puma (`config/puma.rb`)
- **DB:** SQLite in development/test; PostgreSQL in production when `DATABASE_URL` is set

## What changed from the legacy app

- Removed unused **Devise** stack (no routes/models were using it).
- Removed unused **simple_form** gem and its initializer; the contact form uses plain `form_for` with Tailwind utilities and renders per-field errors with `aria-invalid` / `aria-describedby`.
- Removed unused **Active Storage** tables (drop migration `*_drop_active_storage_tables`) and the `active_storage` Railtie. Rails framework pieces are now selectively required from `config/application.rb`.
- **Contact form** stays on MailForm (`ContactsController`, `Contact` model). The mailer now uses the studio address as `From:` (so SPF/DKIM align) and the visitor's address as `Reply-To:`. Set `CONTACT_FORM_TO` (required), `CONTACT_FORM_FROM`, and optionally `CONTACT_FORM_SUBJECT`.
- **AppConfig** lives in `config/app_config.rb` (loaded before environment files); mailers still read SMTP settings from ENV / credentials.
- **Content Security Policy** is enabled (`config/initializers/content_security_policy.rb`) — allow-listing Google Fonts, GA4, and inline blocks via per-request nonces.
- **Hero carousel** pauses on hover, focus, and tab visibility change (WCAG 2.2.2).
- **`SECRET_KEY_BASE`:** required in **production**. Development/test fall back to a committed dev-only default unless `SECRET_KEY_BASE` is set.

## Assets / missing images

Image tags (`406icon.png`, carousel JPEGs, etc.) expect files under **`app/assets/images/`** (or another path on the Sprockets load path). If those binaries are missing from the repo, add them back into `app/assets/images/` (or switch those tags to plain `/public/...` URLs). The favicon now lives at `public/favicon.ico` and a PNG icon link points at `406icon.png`.

## Local commands (Ruby 4 on PATH)

```powershell
$env:RAILS_ENV = "development"
bundle install
bundle exec rails db:prepare
bundle exec rails server
```

**Production asset precompile** needs a secret (one-time for local checks):

```powershell
$env:RAILS_ENV = "production"
$env:SECRET_KEY_BASE = "generate-with-rails-secret"
bundle exec rails assets:precompile
```

## VS Code

- **Run and Debug:** `Rails + Chrome` uses `bundle exec rails server` with `RAILS_ENV=development`.
- **Tasks:** Bundle, DB prepare, server, tests, and precompile are under **Terminal → Run Task**.
