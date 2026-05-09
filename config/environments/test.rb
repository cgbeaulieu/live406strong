Rails.application.configure do
  config.secret_key_base = ENV.fetch('SECRET_KEY_BASE', '406strong-test-key-' + ('y' * 64))

  config.enable_reloading = true
  config.eager_load = false
  config.active_support.deprecation = :stderr
  config.active_support.test_order = :random if defined?(ActiveSupport::TestCase)

  config.public_file_server.enabled = true
  config.public_file_server.headers = { 'cache-control' => 'public, max-age=3600' }

  config.consider_all_requests_local = true
  config.action_controller.perform_caching = false

  config.active_storage.service = :test if defined?(ActiveStorage)

  config.action_dispatch.show_exceptions = false
  config.action_controller.allow_forgery_protection = false
  config.action_mailer.default_url_options = { host: 'example.com' }
  config.action_mailer.delivery_method = :test

  config.assets.compile = true
  config.assets.check_precompiled_asset = false
end
