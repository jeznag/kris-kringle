class KrisKringleController < ApplicationController
  def kris_kringle
    @account_id = params[:account_id]
    matching_account = Account.where(account_id: @account_id).first
    if (!@account_id || matching_account.nil?)
      render 'kris_kringle/no_account_id'
    else
      render 'kris_kringle/kris_kringle'
    end
  end
end
