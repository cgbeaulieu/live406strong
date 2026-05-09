class Contact < MailForm::Base
  attribute :name, validate: true
  attribute :email, validate: /\A([\w.%+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i
  attribute :message, validate: true
  attribute :nickname, captcha: true

  # `from:` must be an address on a domain we control so SPF/DKIM align.
  # The visitor's address goes in `reply_to:` so replies land in their inbox.
  def headers
    {
      subject: AppConfig.fetch(:contact_form_subject, default: '406 Strong — Website contact'),
      to: contact_form_to,
      from: contact_form_from,
      reply_to: %("#{name}" <#{email}>)
    }
  end

  private

  def contact_form_to
    value = AppConfig.fetch(:contact_form_to)
    raise 'CONTACT_FORM_TO (or :contact_form_to credential) is not configured' if value.to_s.strip.empty?
    value
  end

  def contact_form_from
    AppConfig.fetch(:contact_form_from, default: 'sally@406strong.com')
  end
end
