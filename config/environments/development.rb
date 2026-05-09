Rails.application.configure do
  # Rails 8 uses credentials.yml.enc / ENV; fallback keeps local bootstrap simple.
  config.secret_key_base = ENV.fetch('SECRET_KEY_BASE', '406strong-dev-change-me-' + ('x' * 64))

  config.enable_reloading = true
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true
  config.active_support.deprecation = :log

  config.active_storage.service = :local if defined?(ActiveStorage)

  config.action_controller.perform_caching = false

  config.action_mailer.raise_delivery_errors = true
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.default_url_options = { host: AppConfig.fetch(:app_host, default: 'localhost:3000') }
  config.action_mailer.smtp_settings = {
    address: AppConfig.fetch(:smtp_address, default: 'smtp.gmail.com'),
    port: AppConfig.fetch(:smtp_port, default: 587).to_i,
    domain: AppConfig.fetch(:smtp_domain, default: 'gmail.com'),
    user_name: AppConfig.fetch(:smtp_username),
    password: AppConfig.fetch(:smtp_password),
    authentication: :plain,
    enable_starttls_auto: true
  }

  config.active_job.queue_adapter = :async if defined?(ActiveJob)
  config.active_record.migration_error = :page_load if config.active_record
  config.active_record.verbose_query_logs = true if config.active_record

  config.assets.compile = true
  config.assets.check_precompiled_asset = false
end
