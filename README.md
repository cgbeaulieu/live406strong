# 406 Strong — Website

Marketing site for **406 Strong** (Whitefish, MT), built with [Ruby on Rails](https://rubyonrails.org/).

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Rails **8.0** (minimal stack: no Active Storage, Action Cable, Mailbox, or Text) |
| Ruby | **3.4.3** (see `.ruby-version`) |
| Database | **SQLite** (development & test), **PostgreSQL** (production via `DATABASE_URL`) |
| Frontend | Hotwire (**Turbo**, **Stimulus**), **Tailwind CSS**, **Importmap** (no Node bundler required for JS) |
| Server | **Puma** |
| Contact form | **mail_form** (SMTP delivery) |

## Prerequisites

- Ruby 3.4.3 (use [rbenv](https://github.com/rbenv/rbenv), [asdf](https://asdf-vm.com/), or another version manager)
- Bundler (`gem install bundler`)
- SQLite (for local DB)
- PostgreSQL client libraries only if you run production-like configs locally

## Setup

```bash
bundle install
cp .env.example .env
# Edit .env if you need SMTP for the contact form locally — see Configuration.
bin/rails db:prepare
```

### Run the app locally

Use Foreman to run the web server and Tailwind watcher together:

```bash
bin/dev
```

Then open [http://localhost:3000](http://localhost:3000).

Alternatively, run only the Rails server:

```bash
bin/rails server
```

(In that case run `bin/rails tailwindcss:watch` in another terminal if you change Tailwind styles.)

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Home |
| `/about` | About |
| `/contact` | Contact form (GET shows form, POST submits) |

## Configuration

Runtime settings are resolved through **`AppConfig`**: Rails encrypted credentials (when present), then `config/secrets.yml` legacy keys, then **environment variables**. Copy `.env.example` to `.env` and adjust.

**Development:** `SECRET_KEY_BASE` defaults in code so you can boot without setting it. **Production:** `SECRET_KEY_BASE` is required.

**Contact form (production):** set **`CONTACT_FORM_TO`** to the inbox that should receive submissions. **`CONTACT_FORM_FROM`** should be an address on a domain you control (SPF/DKIM). Optional: **`CONTACT_FORM_SUBJECT`**.

**Outbound mail:** configure **`SMTP_ADDRESS`**, **`SMTP_PORT`**, **`SMTP_DOMAIN`**, **`SMTP_USERNAME`**, and **`SMTP_PASSWORD`** for your provider.

**Optional analytics:** set **`GA_MEASUREMENT_ID`** (or the `ga4_measurement_id` credential) for GA4.

See `.env.example` for **`APP_HOST`**, **`DATABASE_URL`**, **`RAILS_SERVE_STATIC_FILES`**, and platform hints (`HEROKU`, `RENDER`, `RAILWAY_ENVIRONMENT`, `FLY_APP_NAME`, **`ASSUME_SSL`**).

## Tests

```bash
bin/rails test
```

Coverage is collected with SimpleCov when running tests.

## Deployment notes

- Production uses PostgreSQL; set **`DATABASE_URL`**.
- Precompile assets for production builds as usual (`bin/rails assets:precompile`).
- Ensure **`SECRET_KEY_BASE`**, **`CONTACT_FORM_TO`**, and SMTP settings are present in your hosting environment.
