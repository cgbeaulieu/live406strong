require 'test_helper'

class ContactsControllerTest < ActionDispatch::IntegrationTest
  setup do
    ActionMailer::Base.deliveries.clear
  end

  test 'get new loads contact page' do
    get '/contact'
    assert_response :success
  end

  test 'post contact sends mail and redirects with notice' do
    assert_difference -> { ActionMailer::Base.deliveries.size }, 1 do
      post contact_path, params: {
        contact: {
          name: 'Jane',
          email: 'jane@example.com',
          message: 'Interested in Pilates.',
          nickname: ''
        }
      }
    end

    assert_redirected_to contact_path
    follow_redirect!
    assert_match(/thank you/i, response.body)
  end

  test 'post contact with invalid data renders form with error flash' do
    assert_no_difference -> { ActionMailer::Base.deliveries.size } do
      post contact_path, params: {
        contact: {
          name: '',
          email: 'jane@example.com',
          message: 'Hi',
          nickname: ''
        }
      }
    end

    assert_response :success
    assert_select 'form'
    assert_match(/cannot send message/i, response.body)
  end

  test 'post contact with honeypot filled does not deliver mail' do
    assert_no_difference -> { ActionMailer::Base.deliveries.size } do
      post contact_path, params: {
        contact: {
          name: 'Bot',
          email: 'bot@example.com',
          message: 'Spam',
          nickname: 'trap'
        }
      }
    end

    assert_response :success
    assert_select 'form'
    assert_match(/cannot send message/i, response.body)
  end
end
