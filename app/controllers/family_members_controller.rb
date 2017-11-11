class FamilyMembersController < ApplicationController
  before_action :set_family_member, only: [:show, :edit, :update, :destroy]
  before_action :set_family_member_types
  before_action :set_possible_parents, only: [:edit, :new]

  # GET /family_members
  # GET /family_members.json
  def index
    if (!params.has_key?(ENV['bossmodekey']))
      if (params.has_key?('account_id'))
        @family_members = FamilyMember.where(account_id: params[:account_id])
      else
        @family_members = []
      end
    else
      @family_members = FamilyMember.all
    end
  end

  # GET /family_members/1
  # GET /family_members/1.json
  def show
  end

  # GET /family_members/new
  def new
    @family_member = FamilyMember.new
  end

  # GET /family_members/1/edit
  def edit
  end

  # POST /family_members
  # POST /family_members.json
  def create
    @family_member = FamilyMember.new(family_member_params)

    respond_to do |format|
      if @family_member.save
        format.html { redirect_to @family_member, notice: 'Family member was successfully created.' }
        format.json { render :show, status: :created, location: @family_member }
      else
        format.html { render :new }
        format.json { render json: @family_member.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /family_members/1
  # PATCH/PUT /family_members/1.json
  def update
    respond_to do |format|
      if @family_member.update(family_member_params)
        format.html { redirect_to @family_member, notice: 'Family member was successfully updated.' }
        format.json { render :show, status: :ok, location: @family_member }
      else
        format.html { render :edit }
        format.json { render json: @family_member.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /family_members/1
  # DELETE /family_members/1.json
  def destroy
    @family_member.destroy
    respond_to do |format|
      format.html { redirect_to family_members_url, notice: 'Family member was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_family_member
      if (params.has_key?(ENV['bossmodekey']))
        @family_member = FamilyMember.find(params[:id])
      else
        @family_member = FamilyMember.where("id='#{params[:id]}' AND account_id='#{params[:account_id]}'").first
      end
    end

    def set_family_member_types
      @family_member_types = [
        OpenStruct.new({
          value: 'young adult',
          text: 'Young Adult'
        }),
        OpenStruct.new({
          value: 'old guard',
          text: 'Old Guard'
        }),
        OpenStruct.new({
          value: 'kid',
          text: 'Kid'
        })
      ]
    end

    def set_possible_parents
      @possible_parents = FamilyMember.where("(family_member_type = 'old guard' OR family_member_type = 'young adult')")
        .select{ |family_member| @family_member.nil? || family_member.id != @family_member.id }

      # Add empty parent initially
      @possible_parents.unshift(OpenStruct.new({
        parent_id: 'root',
        name: ''
      }))
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def family_member_params
      puts 'PARAMS!!!' + params.inspect
      params.require(:family_member).permit(:name, :partner, :family_member_type, :parent_id, :account_id, :participating_this_year)
    end
end
