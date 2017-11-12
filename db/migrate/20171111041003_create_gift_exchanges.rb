class CreateGiftExchanges < ActiveRecord::Migration[5.1]
  def change
    create_table :gift_exchanges do |t|
      t.integer :giver_id
      t.integer :receiver_id
      t.string :social_distance

      t.timestamps
    end
    add_foreign_key :gift_exchanges,  :family_member, column: :receiver_id
    add_foreign_key :gift_exchanges,  :family_member, column: :giver_id
  end
end
