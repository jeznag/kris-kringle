# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2024_11_10_000336) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_stat_statements"
  enable_extension "plpgsql"

  create_table "accounts", id: :serial, force: :cascade do |t|
    t.string "account_name"
    t.string "account_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "email"
  end

  create_table "family_members", id: :serial, force: :cascade do |t|
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

  create_table "gift_exchanges", id: :serial, force: :cascade do |t|
    t.string "giver_name"
    t.string "receiver_name"
    t.string "social_distance"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "receiver_type"
    t.string "giver_type"
    t.string "xmas_year"
    t.string "account_id"
    t.integer "giver_id"
    t.integer "receiver_id"
  end

end
