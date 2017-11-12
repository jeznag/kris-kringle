class AddColumn < ActiveRecord::Migration[5.1]
  def change
    add_column(:gift_exchanges, :receiver_type, :string)
    add_column(:gift_exchanges, :giver_type, :string)
    add_column(:gift_exchanges, :xmas_year, :string)
  end
end
