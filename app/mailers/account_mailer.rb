class AccountMailer < ApplicationMailer
  def welcome_email(account)
    @account = account
    @admin_url  = kris_kringle_url(account_id: account.account_id, admin: true)
    @url  = kris_kringle_url(account_id: account.account_id)
    mail(to: @account.email, subject: 'Your KrisKringle account details')
  end
end
