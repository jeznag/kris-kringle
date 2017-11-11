class InitSchema < ActiveRecord::Migration[5.1]
  def up
    create_table "accounts", force: :cascade do |t|
      t.string "account_name"
      t.string "account_id"
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.string "email"
    end
    create_table "family_members", force: :cascade do |t|
      t.string "name"
      t.string "partner"
      t.string "type"
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.string "family_member_type"
      t.string "parent_id"
      t.string "account_id"
      t.string "participating_this_year"
    end
    create_table "gift_exchanges", force: :cascade do |t|
      t.string "giver_name"
      t.string "receiver_name"
      t.string "social_distance"
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.string "receiver_type"
      t.string "giver_type"
      t.string "xmas_year"
      t.string "account_id"
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration, "The initial migration is not revertable"
  end
end
