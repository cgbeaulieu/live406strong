# Upgrade notes

## Current stack (target)

- **Ruby:** 4.0.3 (`/.ruby-version`)
- **Rails:** 8.0.x (see `Gemfile`)
- **Assets:** Sprockets (`sprockets-rails` + `sass-rails`), manifest at `app/assets/config/manifest.js`
- **Server:** Puma (`config/puma.rb`)
- **DB:** SQLite in development/test; PostgreSQL in production when `DATABASE_URL` is set

## What changed from the legacy app

- Removed unused **Devise** stack (no routes/models were using it).
- **Contact form** stays on MailForm (`ContactsController`, `Contact` model).
- **AppConfig** lives in `config/app_config.rb` (loaded before environment files); mailers still read SMTP settings from ENV / credentials.
- Rails 8 pulls in **Active Storage** — migration `*_create_active_storage_tables` ran via `rails db:prepare`.
- **`SECRET_KEY_BASE`:** required in **production**. Development/test fall back to a committed dev-only default unless `SECRET_KEY_BASE` is set.

## Assets / missing images

Image tags (`406icon.png`, carousel JPEGs, etc.) expect files under **`app/assets/images/`** (or another path on the Sprockets load path). If those binaries are missing from the repo, add them back into `app/assets/images/` (or switch those tags to plain `/public/...` URLs). The layout no longer references a missing `406stronglogo.gif` favicon.

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
