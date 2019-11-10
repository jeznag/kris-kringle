class ResetSequences < ActiveRecord::Migration[5.1]
  def up
    ActiveRecord::Base.connection.reset_pk_sequence!('accounts')
    ActiveRecord::Base.connection.reset_pk_sequence!('family_members')
    ActiveRecord::Base.connection.reset_pk_sequence!('gift_exchanges')
  end
end
