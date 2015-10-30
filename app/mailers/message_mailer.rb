	class MessageMailer < ActionMailer::Base

  default from: "mailer406strong@gmail.com"
  default to: "cgbeaulieu@gmail.com"

  def new_message(message)
    @message = message
    
    mail subject: "Message from #{message.name}"
  end

end