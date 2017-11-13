class AddDisabledFlagForFamilyMember < ActiveRecord::Migration[5.1]
  def change
    add_column(:family_members, :participating_this_year, :string)
  end
end
