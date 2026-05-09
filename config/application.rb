require_relative 'boot'

# Selectively require the framework pieces we actually use — no Active Storage,
# no Action Cable, no Action Mailbox, no Action Text.
require 'rails'
require 'active_model/railtie'
require 'active_record/railtie'
require 'action_controller/railtie'
require 'action_view/railtie'
require 'action_mailer/railtie'
require 'rails/test_unit/railtie'
require 'sprockets/railtie'

Bundler.require(*Rails.groups)
require_relative 'app_config'

module Live406strong
  class Application < Rails::Application
    config.load_defaults 8.0
  end
end
