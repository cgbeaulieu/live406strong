require 'test_helper'

class ApplicationHelperTest < ActionView::TestCase
  include ApplicationHelper

  test 'flash_container_classes maps known keys' do
    assert_includes flash_container_classes('notice'), 'border-emerald'
    assert_includes flash_container_classes('error'), 'border-red'
  end

  test 'ga4_measurement_id uses GA_MEASUREMENT_ID when set' do
    previous = ENV['GA_MEASUREMENT_ID']
    ENV['GA_MEASUREMENT_ID'] = 'G-ENVTEST'
    assert_equal 'G-ENVTEST', ga4_measurement_id
  ensure
    ENV['GA_MEASUREMENT_ID'] = previous
  end
end
