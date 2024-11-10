class AddGiverIdAndReceiverIdToExchanges < ActiveRecord::Migration[6.1]
  def change
    add_column :gift_exchanges, :giver_id, :integer
    add_column :gift_exchanges, :receiver_id, :integer
  end
end
