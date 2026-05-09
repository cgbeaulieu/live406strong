require 'test_helper'

class ContactTest < ActiveSupport::TestCase
  test 'invalid without name' do
    c = Contact.new(name: '', email: 'a@b.com', message: 'Hi')
    assert_not c.valid?
  end

  test 'invalid email format' do
    c = Contact.new(name: 'Ann', email: 'not-an-email', message: 'Hi')
    assert_not c.valid?
  end

  test 'valid with required fields' do
    c = Contact.new(name: 'Ann', email: 'ann@example.com', message: 'Hello')
    assert c.valid?
  end

  test 'honeypot filled is spam and does not run mail delivery' do
    c = Contact.new(name: 'Bot', email: 'bot@example.com', message: 'Spam', nickname: 'filled')
    assert c.spam?
    deliveries = ActionMailer::Base.deliveries.dup
    assert_not c.deliver
    assert_equal deliveries.size, ActionMailer::Base.deliveries.size
  end
end
