class HomeController < ApplicationController
  def index
    render 'home/index'
  end

  def kris_kringle
    @account_id = params[:account_id]
    matching_account = Account.where(account_id: @account_id).first
    if (!@account_id || matching_account.nil?)
      render 'home/no_account_id'
    else
      render 'home/kris_kringle'
    end
  end
end
