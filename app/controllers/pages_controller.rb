class PagesController < ApplicationController
  def home
    @page_title = "406 Strong | Personal Training, Pilates & Coaching | Whitefish, MT"
    @meta_description = "Women-focused personal training, Pilates, TRX, and lifestyle coaching in Whitefish. Package pricing, virtual sessions, and a free first consultation. ACSM certified."
  end

  def about
    @page_title = "About Sally Beaulieu | 406 Strong | Whitefish, MT"
    @meta_description = "Meet Sally Beaulieu—Montana native, ACSM-certified trainer, STOTT PILATES and TRX. Host of Fit 4 Montana on Big Valley Radio. Whole-person wellness in the Flathead Valley."
  end
end