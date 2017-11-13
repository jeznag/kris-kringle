class GiftExchangesController < ApplicationController
  before_action :set_gift_exchange, only: [:show, :edit, :update, :destroy]
  before_action :set_possible_givers_receivers, only: [:edit, :new]

  # GET /gift_exchanges
  # GET /gift_exchanges.json
  def index
    if (!params.has_key?(ENV['bossmodekey']))
      if (params.has_key?('account_id'))
        @gift_exchanges = GiftExchange.where(account_id: params[:account_id])
      else
        @gift_exchanges = []
      end
    else
      @gift_exchanges = GiftExchange.all
    end
  end

  # GET /gift_exchanges/1
  # GET /gift_exchanges/1.json
  def show
  end

  # GET /gift_exchanges/new
  def new
    @gift_exchange = GiftExchange.new
  end

  # GET /gift_exchanges/1/edit
  def edit
  end

  # POST /gift_exchanges
  # POST /gift_exchanges.json
  def create
    gift_exchange_data = gift_exchange_params
    if (gift_exchange_data[:xmas_year])
      xmas_year = gift_exchange_data[:xmas_year]
      account_id = gift_exchange_data[:account_id]
      # replace existing exchange data for this year
      GiftExchange.where("xmas_year='#{xmas_year}' AND account_id='#{account_id}'").each do |old_exchange|
        old_exchange.destroy!
      end
      begin
        gift_exchange_data[:gift_exchanges].each do |gift_exchange_datum|
          GiftExchange.create!(gift_exchange_datum.to_h)
        end
      rescue => e
        puts 'ERROR!!!' + e.inspect + e.backtrace.inspect
        format.json { render json: e.to_json, status: :unprocessable_entity }
      end
    else
      @gift_exchange = GiftExchange.new(gift_exchange_params)

      respond_to do |format|
        if @gift_exchange.save
          format.html { redirect_to @gift_exchange, notice: 'Gift exchange was successfully created.' }
          format.json { render :show, status: :created, location: @gift_exchange }
        else
          format.html { render :new }
          format.json { render json: @gift_exchange.errors, status: :unprocessable_entity }
        end
      end
    end
  end

  # PATCH/PUT /gift_exchanges/1
  # PATCH/PUT /gift_exchanges/1.json
  def update
    respond_to do |format|
      if @gift_exchange.update(gift_exchange_params)
        format.html { redirect_to @gift_exchange, notice: 'Gift exchange was successfully updated.' }
        format.json { render :show, status: :ok, location: @gift_exchange }
      else
        format.html { render :edit }
        format.json { render json: @gift_exchange.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /gift_exchanges/1
  # DELETE /gift_exchanges/1.json
  def destroy
    @gift_exchange.destroy
    respond_to do |format|
      format.html { redirect_to gift_exchanges_url, notice: 'Gift exchange was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_gift_exchange
      if (params.has_key?(ENV['bossmodekey']))
        @gift_exchange = GiftExchange.find(params[:id])
      else
        @gift_exchange = GiftExchange.where("id='#{params[:id]}' AND account_id='#{params[:account_id]}'").first
      end
    end

    def set_possible_givers_receivers
      @possible_givers = FamilyMember.where("(family_member_type = 'old guard' OR family_member_type = 'young adult')")
      @possible_receivers = FamilyMember.all
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

    # Never trust parameters from the scary internet, only allow the white list through.
    def gift_exchange_params
      if (params[:gift_exchanges])
        {
          gift_exchanges: params[:gift_exchanges].map { |gift_exchange_data| gift_exchange_data.require(:gift_exchange).permit(:giver_name, :receiver_name, :social_distance, :giver_type, :receiver_type, :xmas_year, :account_id)},
          xmas_year: params.require(:xmas_year)
        }
      else
        params.require(:gift_exchange).permit(:giver_name, :receiver_name, :social_distance, :giver_type, :receiver_type, :xmas_year, :account_id)
      end
    end
end
