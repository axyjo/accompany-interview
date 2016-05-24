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
      contact = {}
      begin
        contact = JSON.parse(uri.open.string)["entry"].first
      rescue OpenURI::HTTPError => error
        unless error.io.status[0] == "404"
          puts error
          raise ContactProviders::GenericContactError
        end
      end
      {
        hash: hash,
        image: contact["thumbnailUrl"] || get_photo(email),
        email: email,
        name: contact["name"] || {}
      }
    end

    def authed?
      true
    end

    implements ContactProviders::Interface
  end
end
