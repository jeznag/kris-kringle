class ApplicationMailer < ActionMailer::Base
  default from: 'jeremymnagel@gmail.com'
  layout 'mailer'
  default_url_options[:host] = 'http://localhost:3000'
  
end
