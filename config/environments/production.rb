Rails.application.configure do
  raise 'Missing SECRET_KEY_BASE' if ENV['SECRET_KEY_BASE'].to_s.strip.empty?

  config.secret_key_base = ENV.fetch('SECRET_KEY_BASE')

  app_host = AppConfig.fetch(:app_host, default: '406strong.com')
  Rails.application.routes.default_url_options[:host] = app_host
  Rails.application.routes.default_url_options[:protocol] = 'https'
  config.action_controller.default_url_options = { host: app_host, protocol: 'https' }

  # Typical PaaS (Heroku, Render, Railway, Fly): TLS terminates at the edge; tell Rails the request was HTTPS.
  config.assume_ssl = ENV['HEROKU'].present? || ENV['RENDER'].present? || ENV['RAILWAY_ENVIRONMENT'].present? ||
                      ENV['FLY_APP_NAME'].present? || ActiveModel::Type::Boolean.new.cast(ENV['ASSUME_SSL'])
  config.force_ssl = true

  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.active_support.report_deprecations = false

  config.assets.compile = false
  config.assets.digest = true
  config.public_file_server.headers = { 'cache-control' => "public, max-age=#{1.year.to_i}" }
  serve_static_files = AppConfig.fetch_bool(:rails_serve_static_files, default: false)
  config.public_file_server.enabled = serve_static_files || ENV['HEROKU'].present? || ENV['RENDER'].present?

  config.log_level = :info

  config.active_storage.service = :local if defined?(ActiveStorage)

  config.action_controller.perform_caching = true

  config.action_mailer.default_url_options = { host: app_host }
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.perform_deliveries = true
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.default charset: 'utf-8'

  config.action_mailer.smtp_settings = {
    address: AppConfig.fetch(:smtp_address, default: 'smtp.gmail.com'),
    port: AppConfig.fetch(:smtp_port, default: 587).to_i,
    domain: AppConfig.fetch(:smtp_domain, default: 'gmail.com'),
    user_name: AppConfig.fetch(:smtp_username),
    password: AppConfig.fetch(:smtp_password),
    authentication: :plain,
    enable_starttls_auto: true
  }

  config.i18n.fallbacks = true
  config.active_support.deprecation = :notify
end
