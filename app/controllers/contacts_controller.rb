class ContactsController < ApplicationController
  rate_limit to: 8, within: 15.minutes, only: :create, by: -> { request.remote_ip },
             with: -> { redirect_to contact_path, alert: 'Too many messages from this address. Please try again later.' },
             if: -> { !Rails.env.local? }

  before_action :assign_contact_page_meta, only: %i[new create]

  def new
    @contact = Contact.new
  end

  def create
    @contact = Contact.new(contact_params)
    @contact.request = request
    if @contact.deliver
      redirect_to contact_path, notice: 'Thank you—we received your message and will reply soon.'
    else
      flash.now[:error] = 'We could not send your message. Please try again or email sally@406strong.com.'
      render :new
    end
  end

  private

  def assign_contact_page_meta
    @page_title = "Contact & Free Consultation | 406 Strong | Whitefish, MT"
    @meta_description = "Book a free consultation or ask a question. Studio at 1250 Baker Ave, Whitefish, MT. Replies typically within one to two business days."
  end

  def contact_params
    params.fetch(:contact, {}).permit(:name, :email, :message, :nickname)
  end
end