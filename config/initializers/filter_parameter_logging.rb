# Be sure to restart your server when you modify this file.

# Configure sensitive parameters which will be filtered from the log file.
Rails.application.config.filter_parameters += %i[
  password
  smtp_password
  secret
  secret_key_base
  token
  otp
  api_key
]
