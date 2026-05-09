require 'test_helper'

class SitePagesTest < ActionDispatch::IntegrationTest
  test 'home loads' do
    get root_path
    assert_response :success
  end

  test 'about loads' do
    get about_path
    assert_response :success
  end
end
