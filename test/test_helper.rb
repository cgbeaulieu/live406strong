require 'simplecov'
SimpleCov.start 'rails' do
  add_filter '/test/'
  # config/ and other framework noise are already de-emphasized by the 'rails' profile
  minimum_coverage line: 70
end

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

class ActiveSupport::TestCase
end
