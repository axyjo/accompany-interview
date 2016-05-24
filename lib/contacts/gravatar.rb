require 'digest/md5'
require 'interface'
require 'json'
require 'open-uri'
require 'uri'

module ContactProviders
  # This class provides a ContactProvider compatible with the interface for
  # Gravatar. Running into strange issues with HTTPS for Gravatar.
  class Gravatar
    def get_photo(email)
      email.downcase!
      hash = Digest::MD5.hexdigest(email)
      "http://www.gravatar.com/avatar/#{hash}?d=identicon"
    end

    def get_profile(email)
      email.downcase!
      hash = Digest::MD5.hexdigest(email)
      uri = URI.parse("http://www.gravatar.com/#{hash}.json")
      JSON.parse(uri.open.string)["entry"].first
    end

    def authed?
      true
    end

    implements ContactProviders::Interface
  end
end
