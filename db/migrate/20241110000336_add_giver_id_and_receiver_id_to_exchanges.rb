class AddGiverIdAndReceiverIdToExchanges < ActiveRecord::Migration[6.1]
  def change
    add_column :exchanges, :giver_id, :integer
    add_column :exchanges, :receiver_id, :integer
  end
end
