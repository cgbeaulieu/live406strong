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

  test 'post contact with invalid data renders form with field-level errors' do
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

    assert_response :unprocessable_entity
    assert_select 'form'
    assert_match(/highlighted fields/i, response.body)
    assert_select '[aria-invalid="true"]'
  end

  test 'post contact with honeypot filled does not deliver mail' do
    assert_no_difference -> { ActionMailer::Base.deliveries.size } do
      post contact_path, params: {
        contact: {
          name: 'Bot',
          email: 'bot@example.com',
          message: 'Spam, with enough length to be valid.',
          nickname: 'trap'
        }
      }
    end

    assert_response :unprocessable_entity
    assert_select 'form'
    assert_match(/could not send your message/i, response.body)
  end

  test 'delivered contact email uses our domain in From and visitor in Reply-To' do
    post contact_path, params: {
      contact: {
        name: 'Jane',
        email: 'jane@example.com',
        message: 'Interested in Pilates.',
        nickname: ''
      }
    }

    mail = ActionMailer::Base.deliveries.last
    refute_nil mail
    refute_includes mail.from.to_a, 'jane@example.com'
    assert_includes mail.reply_to.to_a, 'jane@example.com'
  end
end
