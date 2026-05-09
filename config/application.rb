require_relative 'boot'

require 'rails/all'

Bundler.require(*Rails.groups)
require_relative 'app_config'

module Live406strong
  class Application < Rails::Application
    config.load_defaults 8.0

    # No uploads in this app; keep Active Record tables if already migrated, but drop unused Direct Upload routes.
    config.active_storage.draw_routes = false
  end
end
