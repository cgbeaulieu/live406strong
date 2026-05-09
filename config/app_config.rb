# Config bridge: credentials (when available), legacy secrets, then ENV.
module AppConfig
  module_function

  def fetch(key, env_key: nil, default: nil)
    env_name = (env_key || key).to_s.upcase

    value = credentials_value(key)
    value = secrets_value(key) if blank?(value)
    value = ENV[env_name] if blank?(value)

    blank?(value) ? default : value
  end

  def fetch_bool(key, env_key: nil, default: false)
    raw = fetch(key, env_key: env_key, default: nil)
    return default if blank?(raw)
    %w[1 true yes on].include?(raw.to_s.strip.downcase)
  end

  def credentials_value(key)
    return nil unless Rails.application.respond_to?(:credentials)
    creds = Rails.application.credentials
    return nil if creds.nil?
    creds[key]
  rescue StandardError
    nil
  end

  def secrets_value(key)
    return nil unless Rails.application.respond_to?(:secrets)
    secrets = Rails.application.secrets
    return nil if secrets.nil?
    secrets[key]
  rescue StandardError
    nil
  end

  def blank?(value)
    value.nil? || (value.respond_to?(:empty?) && value.empty?)
  end
end
