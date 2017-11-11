# Preview all emails at http://localhost:3000/rails/mailers/account_mailer
class AccountMailerPreview < ActionMailer::Preview
  def welcome_email
    AccountMailer.welcome_email(Account.first)
  end
end
